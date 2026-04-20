import React, { useState, useEffect } from "react";
import { StaffProfile, StaffRole } from "@/api/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, Phone, Clock, User, Briefcase, Bell, Check, X } from "lucide-react";
import { notificationsApi } from "@/api/notifications";

interface StaffDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffProfile | null;
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

function calculateTenure(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - hire.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
}

export function StaffDetails({ open, onOpenChange, staffMember }: StaffDetailsProps) {
  const [prefs, setPrefs] = useState<any>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      const userId = (staffMember as any)?.user_id || staffMember?.id;
      if (userId) {
        setLoadingPrefs(true);
        const data = await notificationsApi.getPreferences(userId);
        setPrefs(data);
        setLoadingPrefs(false);
      }
    };

    if (open && staffMember) {
      fetchPrefs();
    } else if (!open) {
      setPrefs(null);
    }
  }, [open, staffMember]);

  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {staffMember.first_name?.[0]}{staffMember.last_name?.[0]}
              </span>
            </div>
            {staffMember.first_name} {staffMember.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Role */}
          <div className="flex gap-2">
            <Badge variant={getRoleBadgeVariant(staffMember.staff_role as StaffRole)}>
              {staffMember.staff_role}
            </Badge>
            <Badge variant={getStatusBadgeVariant(staffMember.employment_status!)}>
              {staffMember.employment_status}
            </Badge>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{staffMember.email}</span>
              </div>
              {staffMember.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.phone_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Position</span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {staffMember.staff_role}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {staffMember.employment_status}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Hire Date</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {staffMember.hire_date 
                      ? new Date(staffMember.hire_date).toLocaleDateString()
                      : "Not specified"
                    }
                  </p>
                </div>
                {staffMember.hire_date && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tenure</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {calculateTenure(staffMember.hire_date)}
                    </p>
                  </div>
                )}
              </div>

              {staffMember.termination_date && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Termination Date</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(staffMember.termination_date).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPrefs ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : prefs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium border-b pb-1">Channels</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        {prefs.email_enabled ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Push Notifications</span>
                        {prefs.push_enabled ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS</span>
                        {prefs.sms_enabled ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium border-b pb-1">Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bookings</span>
                        {prefs.booking_confirmations ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reminders</span>
                        {prefs.reservation_reminders ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">System</span>
                        {prefs.system_notifications ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-2">
                  No notification preferences configured for this user.
                </p>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Created</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(staffMember.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Last Updated</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(staffMember.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}