import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { reservationApi } from "@/api/reservation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  RefreshCw,
  MapPin,
  CalendarDays,
  MoreVertical,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TableManagementDashboard } from '@/components/admin/TableManagementDashboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerSubscription } from '@/hooks/use-partner-subscription';
import { NotificationService } from '@/services/notification-service';
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils';
import { format } from 'date-fns';

interface StaffStats {
  totalReservations: number;
  todaysReservations: number;
  upcomingReservations: number;
  completedToday: number;
  averagePartySize: number;
  popularTimes: string[];
}

interface Reservation {
  id: string;
  user_id: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  special_requests?: string;
  customer_name?: string;
  table_id?: string;
  table_number?: string;
  staff_id?: string;
  staff_name?: string;
}

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center border rounded-lg p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function StaffDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { subscription: partnerSubscription, loading: isSubscriptionLoading } = usePartnerSubscription();
  const hasStaffManagement = partnerSubscription?.features?.includes('staff_management');



  // Fetch staff assignments and restaurant/location IDs
  const { data: staffContext, isLoading: contextLoading } = useQuery({
    queryKey: ['staff-context', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user
  });

  // Fetch all staff for assignment
  const { data: allStaff } = useQuery({
    queryKey: ['restaurant-staff', staffContext?.restaurant_id],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return [];
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (first_name, last_name)
        `)
        .eq('restaurant_id', staffContext.restaurant_id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!staffContext?.restaurant_id
  });

  // Fetch current user's schedule for today
  const { data: mySchedule } = useQuery({
    queryKey: ['my-schedule', user?.id, selectedDate],
    queryFn: async () => {
      if (!user) return null;
      
      // First get the staff ID for the current user
      const { data: staffData } = await supabase
        .from('restaurant_staff')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!staffData) return null;

      const { data, error } = await supabase
        .from('staff_schedules')
        .select(`
          id,
          work_date,
          shift_type:shift_type_id (
            name,
            start_time,
            end_time
          )
        `)
        .eq('staff_id', staffData.id)
        .eq('work_date', selectedDate)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch all staff schedules for today
  const { data: allSchedules } = useQuery({
    queryKey: ['all-staff-schedules', staffContext?.restaurant_id, selectedDate],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return [];
      const { data, error } = await supabase
        .from('staff_schedules')
        .select(`
          staff_id,
          shift_type:shift_type_id (
            start_time,
            end_time
          )
        `)
        .eq('restaurant_id', staffContext.restaurant_id)
        .eq('work_date', selectedDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!staffContext?.restaurant_id
  });

  // Helper to check if staff is on shift for a given time
  const isStaffOnShift = useCallback((staffId: string, time: string) => {
    if (!allSchedules) return false;
    const schedule = allSchedules.find(s => s.staff_id === staffId);
    if (!schedule || !schedule.shift_type) return false;

    const { start_time, end_time } = schedule.shift_type;
    
    // Handle normal shifts (e.g., 09:00 - 17:00)
    if (start_time < end_time) {
      return time >= start_time && time <= end_time;
    }
    
    // Handle overnight shifts (e.g., 22:00 - 06:00)
    // Staff is on shift if time is AFTER start_time (same day) OR BEFORE end_time (next day)
    return time >= start_time || time <= end_time;
  }, [allSchedules]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dataLoading, error: dataError, refetch } = useQuery({
    queryKey: ['staff-dashboard-data', staffContext?.restaurant_id, selectedDate],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return null;

      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all reservations for stats
      const { data: allRes, error: allResError } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          guest_count,
          status,
          user_id,
          table_id
        `)
        .eq('restaurant_id', staffContext.restaurant_id);

      if (allResError) throw allResError;

      // Fetch today's detailed reservations with profiles and tables
      const { data: todayDetailed, error: todayError } = await supabase
        .from('reservations')
        .select(`
          id,
          user_id,
          reservation_date,
          reservation_time,
          guest_count,
          status,
          special_requests,
          table_id,
          staff_id,
          profiles!fk_reservations_user_profile (first_name, last_name),
          tables!fk_reservations_table (table_number)
        `)
        .eq('restaurant_id', staffContext.restaurant_id)
        .eq('reservation_date', selectedDate)
        .order('reservation_time', { ascending: true });

      if (todayError) throw todayError;

      // Fetch upcoming reservations
      const { data: upcomingRes, error: upcomingError } = await supabase
        .from('reservations')
        .select(`
          id,
          user_id,
          reservation_date,
          reservation_time,
          guest_count,
          status,
          profiles!fk_reservations_user_profile (first_name, last_name)
        `)
        .eq('restaurant_id', staffContext.restaurant_id)
        .gte('reservation_date', today)
        .lte('reservation_date', weekFromNow)
        .eq('status', 'confirmed')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })
        .limit(10);

      if (upcomingError) throw upcomingError;

      // Calculate statistics
      const todaysRes = allRes?.filter(r => r.reservation_date === today) || [];
      const upcomingWeekRes = allRes?.filter(r =>
        r.reservation_date >= today && r.reservation_date <= weekFromNow
      ) || [];

      const totalReservations = allRes?.length || 0;
      const todaysReservationsCount = todaysRes.length;
      const upcomingReservationsCount = upcomingWeekRes.length;
      const completedToday = todaysRes.filter(r => r.status === 'completed').length;
      const totalGuests = todaysRes.reduce((sum, r) => sum + r.guest_count, 0);
      const averagePartySize = todaysRes.length > 0 ? totalGuests / todaysRes.length : 0;

      // Find popular times
      const timeSlots = todaysRes.reduce((acc, r) => {
        const hour = r.reservation_time.split(':')[0];
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularTimes = Object.entries(timeSlots)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => formatDisplayTime(`${hour}:00`));

      return {
        stats: {
          totalReservations,
          todaysReservations: todaysReservationsCount,
          upcomingReservations: upcomingReservationsCount,
          completedToday,
          averagePartySize: Number(averagePartySize.toFixed(1)),
          popularTimes
        },
        todaysReservations: (todayDetailed || []).map((res) => {
          const assignedStaff = allStaff?.find((s) => s.user_id === res.staff_id);
          return {
            ...res,
            customer_name: res.profiles ? `${(res.profiles as any).first_name || ''} ${(res.profiles as any).last_name || ''}`.trim() || 'Guest' : 'Guest',
            table_number: (res.tables as any)?.table_number,
            staff_name: assignedStaff ? `${(assignedStaff.profiles as any)?.first_name} ${(assignedStaff.profiles as any)?.last_name}` : undefined
          };
        }),
        upcomingReservations: (upcomingRes || []).map((res) => ({
          ...res,
          customer_name: res.profiles ? `${(res.profiles as any).first_name || ''} ${(res.profiles as any).last_name || ''}`.trim() || 'Guest' : 'Guest'
        }))
      };
    },
    enabled: !!staffContext?.restaurant_id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reservationId, newStatus }: { reservationId: string, newStatus: string }) => {
      const result = await reservationApi.updateStatus(reservationId, newStatus);
      if (!result || (result as any).error) {
        throw new Error((result as any)?.error || 'Failed to update status');
      }
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success(`Reservation ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['staff-dashboard-data'] });
      
      // Trigger notification for status change
      NotificationService.notifyReservationStatusChange(variables.reservationId, variables.newStatus);
    },
    onError: (error) => {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
    }
  });

  const assignStaffMutation = useMutation({
    mutationFn: async ({ reservationId, staffId }: { reservationId: string, staffId: string | null }) => {
      // Note: This requires staff_id column in reservations table
      const { error } = await supabase
        .from('reservations')
        .update({ 
          staff_id: staffId, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', reservationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-dashboard-data'] });
    },
    onError: (error: any) => {
      console.error('Error assigning staff:', error);
      if (error.code === '42703') { // Column does not exist
        toast.error('Database update required: Please ask admin to add staff_id to reservations.');
      } else {
        toast.error('Failed to assign staff');
      }
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
      seated: { variant: 'outline' as const, label: 'Seated', icon: UserCheck },
      completed: { variant: 'secondary' as const, label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle },
      no_show: { variant: 'destructive' as const, label: 'No Show', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Staff Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in with your staff account to access the dashboard.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contextLoading || isSubscriptionLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!staffContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Restaurant Assigned</h2>
            <p className="text-gray-600 mb-4">
              You haven't been assigned to any restaurant yet. Please contact your manager.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">
              {(dataError as Error).message || "Failed to load dashboard data."}
            </p>
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, todaysReservations, upcomingReservations } = dashboardData!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage reservations and monitor restaurant operations</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/staff/schedule">
                <CalendarDays className="h-4 w-4 mr-2" />
                Check Schedule
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={dataLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysReservations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedToday} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingReservations}</div>
              <p className="text-xs text-muted-foreground">
                Next week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Party Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePartySize}</div>
              <p className="text-xs text-muted-foreground">
                People per reservation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReservations}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Check</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {mySchedule ? (
                <>
                  <div className="text-2xl font-bold text-primary">{mySchedule.shift_type?.name || 'On Shift'}</div>
                  <p className="text-xs text-primary/80">
                    {formatDisplayTime(mySchedule.shift_type?.start_time || '')} - {formatDisplayTime(mySchedule.shift_type?.end_time || '')}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">Off Duty</div>
                  <p className="text-xs text-muted-foreground">
                    No shift scheduled today
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border p-1 h-auto flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="tables">Table Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Schedule Coverage Alerts */}
            {todaysReservations.some(r => !r.staff_id || !isStaffOnShift(r.staff_id, r.reservation_time)) && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Schedule Coverage Alerts
                  </CardTitle>
                  <CardDescription className="text-orange-700/80">
                    The following reservations require attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {todaysReservations.filter(r => !r.staff_id).map(r => (
                      <div key={`no-staff-${r.id}`} className="flex items-center justify-between text-sm p-2 bg-white/50 rounded border border-orange-100">
                        <span className="font-medium">{formatDisplayTime(r.reservation_time)} - {r.customer_name}</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-white">No Staff Assigned</Badge>
                      </div>
                    ))}
                    {todaysReservations.filter(r => r.staff_id && !isStaffOnShift(r.staff_id, r.reservation_time)).map(r => (
                      <div key={`off-shift-${r.id}`} className="flex items-center justify-between text-sm p-2 bg-white/50 rounded border border-orange-100">
                        <span className="font-medium">{formatDisplayTime(r.reservation_time)} - {r.customer_name}</span>
                        <div className="flex gap-2">
                          <span className="text-xs text-muted-foreground self-center">Assigned: {r.staff_name}</span>
                          <Badge variant="destructive" className="font-normal">Off Shift</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular Times */}
            {stats.popularTimes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Popular Reservation Times Today</CardTitle>
                  <CardDescription>Based on today's confirmed bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {stats.popularTimes.map((time, index) => (
                      <div key={time} className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-lg border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{time}</div>
                          <div className="text-xs text-muted-foreground">Peak hour</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
                    <CalendarDays className="h-6 w-6 text-primary" />
                    <span>New Reservation</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Walk-in Guest</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>Table Layout</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>Quick Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Schedule for {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : formatDisplayDate(selectedDate)}</CardTitle>
                    <CardDescription>{todaysReservations.length} reservations scheduled</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {todaysReservations.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium">No reservations for this date</p>
                    <p className="text-sm text-muted-foreground mt-1">Change the date or check back later</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysReservations.map((reservation) => (
                      <div key={reservation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-xl hover:shadow-md transition-shadow bg-white gap-4">
                        <div className="flex items-center gap-5">
                          <div className="bg-primary/5 p-3 rounded-lg text-center min-w-[80px]">
                            <div className="text-xl font-bold text-primary">{formatDisplayTime(reservation.reservation_time)}</div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-primary/60">{reservation.guest_count} guests</div>
                          </div>
                          <div>
                            <div className="font-bold text-lg">{reservation.customer_name}</div>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              {reservation.table_number ? (
                                <Badge variant="secondary" className="font-normal">
                                  Table {reservation.table_number}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">No table assigned</span>
                              )}
                              
                              {reservation.staff_id ? (
                                <Badge 
                                  variant={isStaffOnShift(reservation.staff_id, reservation.reservation_time) ? "outline" : "destructive"} 
                                  className={isStaffOnShift(reservation.staff_id, reservation.reservation_time) ? "text-green-600 border-green-200 bg-green-50 font-normal" : "font-normal"}
                                >
                                  {isStaffOnShift(reservation.staff_id, reservation.reservation_time) ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Assigned: {reservation.staff_name || 'Staff'}
                                  {!isStaffOnShift(reservation.staff_id, reservation.reservation_time) && " (Off Shift)"}
                                </Badge>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-orange-200 text-orange-600 hover:bg-orange-50">
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Assign Staff
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel>Available Staff</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {allStaff && allStaff.length > 0 ? (
                                      allStaff.map((staff: any) => (
                                        <DropdownMenuItem 
                                          key={staff.id} 
                                          onClick={() => assignStaffMutation.mutate({ reservationId: reservation.id, staffId: staff.user_id })}
                                          className="flex items-center justify-between"
                                        >
                                          <span>{staff.profiles?.first_name} {staff.profiles?.last_name}</span>
                                          {isStaffOnShift(staff.user_id, reservation.reservation_time) && (
                                            <Badge variant="outline" className="h-4 px-1 text-[8px] border-green-200 text-green-600 bg-green-50">On Shift</Badge>
                                          )}
                                        </DropdownMenuItem>
                                      ))
                                    ) : (
                                      <DropdownMenuItem disabled>No staff found</DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}

                              {reservation.special_requests && (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-normal">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Special requests
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0 border-t sm:border-0">
                          {getStatusBadge(reservation.status)}

                          <div className="flex gap-2">
                            {reservation.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'seated' })}
                                className="shadow-sm"
                              >
                                Seat Guest
                              </Button>
                            )}
                            {reservation.status === 'seated' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'completed' })}
                                className="border-green-200 hover:bg-green-50 hover:text-green-700"
                              >
                                Complete
                              </Button>
                            )}
                            {['confirmed', 'pending'].includes(reservation.status) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'cancelled' })}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reservations (Next 7 Days)</CardTitle>
                <CardDescription>Only confirmed reservations are shown</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium">No upcoming reservations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[100px] border-r pr-4">
                            <div className="text-xs text-muted-foreground font-medium">{new Date(reservation.reservation_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                            <div className="text-lg font-bold">{reservation.reservation_time}</div>
                          </div>
                          <div>
                            <div className="font-semibold">{reservation.customer_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{reservation.guest_count} guests</span>
                              {(reservation as any).table_number && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                                  <span>Table {(reservation as any).table_number}</span>
                                </>
                              )}
                              {(reservation as any).staff_name && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-primary/5 text-primary border-primary/20">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    {(reservation as any).staff_name}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                          <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.status)}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Status Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'confirmed' })}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Confirm
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'seated' })}>
                                  <UserCheck className="h-4 w-4 mr-2 text-blue-500" /> Seated
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'completed' })}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" /> Completed
                                </DropdownMenuItem>
                                {hasStaffManagement && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Assign Staff</DropdownMenuLabel>
                                    {allStaff && allStaff.length > 0 ? (
                                      allStaff.map((staff: any) => (
                                        <DropdownMenuItem 
                                          key={staff.id} 
                                          onClick={() => assignStaffMutation.mutate({ reservationId: reservation.id, staffId: staff.user_id })}
                                        >
                                          <UserPlus className="h-4 w-4 mr-2" />
                                          {staff.profiles?.first_name} {staff.profiles?.last_name}
                                        </DropdownMenuItem>
                                      ))
                                    ) : (
                                      <DropdownMenuItem disabled>No active staff found</DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => updateStatusMutation.mutate({ reservationId: reservation.id, newStatus: 'cancelled' })}
                                >
                                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => refetch()}
                            >
                              <RefreshCw className={`h-4 w-4 text-muted-foreground ${dataLoading ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <TableManagementDashboard
              restaurantId={staffContext.restaurant_id}
              locationId={''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
