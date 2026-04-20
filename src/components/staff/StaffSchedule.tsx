import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Clock, Users, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/use-auth";

interface ShiftType {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  color: string;
}

interface ScheduleEntry {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  work_date: string;
  shift_type: ShiftType;
}

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function StaffSchedule() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const { subscription: partnerSubscription, loading: subscriptionLoading } = usePartnerSubscription();

  // Fetch restaurant context
  const { data: staffContext } = useQuery({
    queryKey: ['staff-context', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch shift types
  const { data: shiftTypes = [] } = useQuery({
    queryKey: ['shift-types', staffContext?.restaurant_id],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return [];
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('restaurant_id', staffContext.restaurant_id);
      
      if (error) throw error;
      return data as ShiftType[];
    },
    enabled: !!staffContext?.restaurant_id
  });

  // Fetch schedules for the current week
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['staff-schedules', staffContext?.restaurant_id, currentWeek.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return [];
      
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data, error } = await supabase
        .from('staff_schedules')
        .select(`
          id,
          staff_id,
          work_date,
          shift_type:shift_type_id (
            id,
            name,
            start_time,
            end_time,
            color
          ),
          staff:staff_id (
            role,
            profiles:user_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('restaurant_id', staffContext.restaurant_id)
        .gte('work_date', startOfWeek.toISOString().split('T')[0])
        .lte('work_date', endOfWeek.toISOString().split('T')[0]);

      if (error) throw error;
      
      return (data || []).map((entry: any) => ({
        id: entry.id,
        staff_id: entry.staff_id,
        staff_name: `${entry.staff?.profiles?.first_name} ${entry.staff?.profiles?.last_name}`,
        staff_role: entry.staff?.role,
        work_date: entry.work_date,
        shift_type: entry.shift_type
      })) as ScheduleEntry[];
    },
    enabled: !!staffContext?.restaurant_id
  });

  const { data: staffCount = 0 } = useQuery({
    queryKey: ["staff-count", staffContext?.restaurant_id],
    queryFn: async () => {
      if (!staffContext?.restaurant_id) return 0;
      const { count, error } = await supabase
        .from("restaurant_staff")
        .select("*", { count: 'exact', head: true })
        .eq('restaurant_id', staffContext.restaurant_id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!staffContext?.restaurant_id
  });

  const maxStaff = partnerSubscription?.maxStaff;
  const isLimitReached = maxStaff !== null && staffCount >= (maxStaff || 0);
  const hasStaffManagement = partnerSubscription?.features?.includes('staff_management');

  if (!hasStaffManagement && !subscriptionLoading) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature not available</AlertTitle>
          <AlertDescription>
            Advanced scheduling is a Premium feature. Your current plan ({partnerSubscription?.planName}) does not include this feature. 
            Please upgrade to manage staff shifts and schedules.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  const getScheduleForDate = (date: Date): ScheduleEntry[] => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(entry => entry.work_date === dateStr);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getShiftBadgeVariant = (shiftType: string): "default" | "secondary" | "destructive" | "outline" => {
    const type = shiftType.toLowerCase();
    if (type.includes('morning')) return "default";
    if (type.includes('afternoon')) return "secondary";
    if (type.includes('night')) return "destructive";
    return "outline";
  };

  const totalShiftsThisWeek = schedules.length;
  const uniqueStaffScheduled = new Set(schedules.map(s => s.staff_id)).size;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Schedule</h1>
          <p className="text-muted-foreground">Manage staff shifts and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isLimitReached || !hasStaffManagement}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as "week" | "month")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Staff limit reached</AlertTitle>
          <AlertDescription>
            Your current plan ({partnerSubscription?.planName}) allows up to {partnerSubscription?.maxStaff} staff members. 
            New shifts cannot be added until you upgrade your plan or remove staff.
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {schedulesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const daySchedule = getScheduleForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`p-4 border rounded-lg ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="text-center mb-3">
                      <p className="text-sm font-medium">{DAYS_OF_WEEK[index]}</p>
                      <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {date.getDate()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {daySchedule.length > 0 ? (
                        daySchedule.map((entry) => (
                          <div key={entry.id} className="p-2 bg-muted rounded text-xs">
                            <p className="font-medium truncate">{entry.staff_name}</p>
                            <Badge 
                              variant={getShiftBadgeVariant(entry.shift_type?.name || 'other')} 
                              className="text-xs"
                            >
                              {entry.shift_type?.name || 'Shift'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No shifts
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shiftTypes.map((shift) => (
              <div key={shift.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-4 h-4 rounded ${shift.color}`}></div>
                <div>
                  <p className="font-medium">{shift.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>
            ))}
            {shiftTypes.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                No shift types defined.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShiftsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Total assigned slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Scheduled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStaffScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Unique staff working this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerSubscription?.planName || 'Free'}</div>
            <p className="text-xs text-muted-foreground">
              {partnerSubscription?.maxStaff ? `${staffCount}/${partnerSubscription.maxStaff} staff used` : 'Limited features'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}