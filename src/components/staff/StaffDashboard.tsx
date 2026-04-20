import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaffProfile, StaffRole } from "@/api/types";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SystemStatusIndicator } from "@/components/common/SystemStatusIndicator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, TrendingUp, Users, AlertTriangle, UserCheck, AlertCircle } from "lucide-react";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define a type for the data directly returned from the Supabase 'profiles' table
type ProfileFromSupabase = Omit<StaffProfile, 'address' | 'reservations'> & {
  id: string;
  first_name: string | null;
  last_name: string | null;
  staff_role: StaffRole | null;
  employment_status: string | null;
  hire_date: string | null;
  termination_date: string | null;
  created_at: string;
  updated_at: string;
  phone: string | null;
  email: string | null;
  role: string; // This 'role' seems to be a system role, not staff_role
};

const PAGE_SIZE = 20;
async function fetchStaffMetrics(page: number, search: string, roleFilter: StaffRole | "all"): Promise<{
  staff: StaffProfile[];
  recentHires: StaffProfile[];
  upcomingSchedules: unknown[];
  performanceMetrics: {
    totalStaff: number;
    activeStaff: number;
    averageTenure: number;
    departmentDistribution: Record<StaffRole, number>;
  };
  totalCount: number;
}> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  
  // Use direct query with explicit column selection to avoid type depth issues
  const { data: profilesData, error, count } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, staff_role, employment_status, hire_date, termination_date, created_at, updated_at, phone, email, role", { count: 'exact' })
    .range(from, to) as {
      data: ProfileFromSupabase[] | null;
      error: any;
      count: number | null
    };

  if (roleFilter !== "all" && profilesData) {
    // Filter in memory if role filter is applied
  }

  if (search && profilesData) {
    // Filter in memory if search is applied
  }

  if (error) throw error;

  // Map the fetched data to StaffProfile, adding default values for missing fields
  const staff: StaffProfile[] = (profilesData || []).map(s => ({
    ...s,
    address: '', // Default value as it's not in the select query
    reservations: [], // Default value as it's not in the select query
  })) as StaffProfile[]; // Assert to StaffProfile after adding missing fields

  const recentHires = [...staff]
    .filter((m) => m.hire_date)
    .sort((a, b) => new Date(b.hire_date || "").getTime() - new Date(a.hire_date || "").getTime())
    .slice(0, 5);

  // Fetch upcoming schedules
  const { data: schedulesData } = await supabase
    .from("staff_schedules")
    .select(`
      id,
      work_date,
      shift_type:shift_type_id (name, start_time, end_time),
      staff:staff_id (profiles:user_id (first_name, last_name))
    `)
    .gte("work_date", new Date().toISOString().split('T')[0])
    .order("work_date", { ascending: true })
    .limit(5);

  const upcomingSchedules = (schedulesData || []).map(schedule => ({
    id: schedule.id,
    workDate: schedule.work_date,
    shiftName: (schedule.shift_type as any)?.name,
    startTime: (schedule.shift_type as any)?.start_time,
    endTime: (schedule.shift_type as any)?.end_time,
    staffName: `${(schedule.staff as any)?.profiles?.first_name || ''} ${(schedule.staff as any)?.profiles?.last_name || ''}`.trim() || 'Unknown Staff'
  }));

  return {
    staff: staff,
    recentHires: recentHires,
    upcomingSchedules: upcomingSchedules,
    performanceMetrics: {
      totalStaff: count || 0, // Use count from Supabase for total staff
      activeStaff: staff.filter(s => s.employment_status === 'active').length || 0,
      averageTenure: calculateAverageTenure(staff),
      departmentDistribution: calculateDepartmentDistribution(staff)
    },
    totalCount: count || 0, // Pass the total count
  };
}

function calculateAverageTenure(staff: StaffProfile[]): number {
  const activeStaff = staff.filter(s => s.employment_status === 'active' && s.hire_date);
  if (activeStaff.length === 0) return 0;

  const totalDays = activeStaff.reduce((sum, member) => {
    const hireDate = new Date(member.hire_date!);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / activeStaff.length);
}

function calculateDepartmentDistribution(staff: StaffProfile[]): Record<StaffRole, number> {
  const distribution: Record<StaffRole, number> = {
    waiter: 0,
    chef: 0,
    manager: 0,
    host: 0,
    bartender: 0,
    cleaner: 0,
    other: 0,
    inventory_manager: 0,
    owner: 0,
    server: 0,
  };

  staff.forEach((member) => {
    if (member.staff_role && distribution[member.staff_role as StaffRole] !== undefined) {
      distribution[member.staff_role as StaffRole]++;
    }
  });

  return distribution;
}

function getRoleBadgeVariant(role: StaffRole): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case 'manager': return 'default';
    case 'chef': return 'secondary';
    case 'waiter': return 'outline';
    default: return 'outline';
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'terminated': return 'destructive';
    default: return 'secondary';
  }
}


export default function StaffDashboard() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<StaffRole | "all">("all");
  const { subscription: partnerSubscription, loading: isSubscriptionLoading } = usePartnerSubscription();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["staff-dashboard", page, search, roleFilter],
    queryFn: () => fetchStaffMetrics(page, search, roleFilter),
  });

  if (isLoading || isSubscriptionLoading) {
    return (
      <div className="container mx-auto p-6" aria-busy="true" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse" aria-label="Loading metric">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground">{error.message || "Unable to load staff dashboard data."}</p>
            <Button aria-label="Retry loading dashboard" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const { staff, recentHires, upcomingSchedules, performanceMetrics, totalCount } = data!;

  const maxStaff = partnerSubscription?.maxStaff;
  const isLimitReached = maxStaff !== null && performanceMetrics.totalStaff >= (maxStaff || 0);
  const hasStaffManagement = partnerSubscription?.features?.includes('staff_management');

  if (!hasStaffManagement && !isSubscriptionLoading) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature not available</AlertTitle>
          <AlertDescription>
            Staff management is a Premium feature. Your current plan ({partnerSubscription?.planName}) does not include this feature. 
            Please upgrade to access staff scheduling, performance metrics, and advanced management tools.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link to="/pricing">Upgrade Plan</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusCounts = {
    active: staff.filter(s => s.employment_status === 'active').length,
    inactive: staff.filter(s => s.employment_status === 'inactive').length,
    terminated: staff.filter(s => s.employment_status === 'terminated').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management Dashboard</h1>
          <p className="text-muted-foreground">Monitor staff performance, schedules, and analytics</p>
        </div>
        <div className="flex gap-2 items-center">
          {maxStaff !== undefined && (
            <Card className="px-4 py-2 flex flex-col gap-1 min-w-[150px] mr-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Plan Limit</span>
                <span className={isLimitReached ? "text-destructive" : "text-primary"}>
                  {performanceMetrics.totalStaff} / {maxStaff || "∞"}
                </span>
              </div>
              <Progress 
                value={maxStaff ? (performanceMetrics.totalStaff / maxStaff) * 100 : 0} 
                className={`h-1.5 ${isLimitReached ? "bg-destructive/20" : ""}`}
              />
            </Card>
          )}
          <SystemStatusIndicator />
          <Button asChild variant="outline" aria-label="Go to staff management">
            <Link to="/staff">
              <Users className="h-4 w-4 mr-2" />
              Manage Staff
            </Link>
          </Button>
          <Button asChild aria-label="View staff schedule" disabled={isLimitReached}>
            <Link to="/staff/schedule">
              <CalendarDays className="h-4 w-4 mr-2" />
              View Schedule
            </Link>
          </Button>
        </div>
      </div>

      {isLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Staff limit reached</AlertTitle>
          <AlertDescription>
            Your current plan ({partnerSubscription?.planName}) allows up to {partnerSubscription?.maxStaff} staff members. 
            You cannot add or schedule more staff until you upgrade your plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}

      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input input-bordered px-3 py-2 rounded border"
          aria-label="Search staff"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value as StaffRole | "all"); setPage(1); }}
          className="select select-bordered px-3 py-2 rounded border"
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          <option value="manager">Manager</option>
          <option value="chef">Chef</option>
          <option value="waiter">Waiter</option>
          <option value="host">Host</option>
          <option value="bartender">Bartender</option>
          <option value="cleaner">Cleaner</option>
          <option value="other">Other</option>
        </select>
        <span className="ml-auto text-sm text-muted-foreground">{totalCount} staff found</span>
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          aria-label="Previous page"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          aria-label="Next page"
          onClick={() => setPage(p => p + 1)}
          disabled={page * PAGE_SIZE >= totalCount}
        >
          Next
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.activeStaff} active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.averageTenure} days</div>
            <p className="text-xs text-muted-foreground">
              Across all active staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.totalStaff > 0
                ? Math.round((performanceMetrics.activeStaff / performanceMetrics.totalStaff) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.activeStaff} active out of {performanceMetrics.totalStaff} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(performanceMetrics.departmentDistribution).length}</div>
            <p className="text-xs text-muted-foreground">
              Active roles
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Schedules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(upcomingSchedules as any[]).map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{schedule.staffName}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {schedule.shiftName}
                    </Badge>
                  </div>
                  <Badge variant="secondary">
                    {new Date(schedule.workDate).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mt-2">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {schedule.startTime} - {schedule.endTime}
                </div>
              </CardContent>
            </Card>
          ))}
          {upcomingSchedules.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8 border rounded-lg border-dashed">
              No upcoming schedules found for the next few days.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Hires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentHires.map((staff) => (
            <Card key={staff.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{staff.first_name} {staff.last_name}</CardTitle>
                    <Badge variant={getRoleBadgeVariant(staff.staff_role as StaffRole)} className="mt-1">
                      {staff.staff_role}
                    </Badge>
                  </div>
                  <Badge variant={getStatusBadgeVariant(staff.employment_status || 'active')}>
                    {staff.employment_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mt-2">
                  Hired: {new Date(staff.hire_date || "").toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
          {recentHires.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No recent hires found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}