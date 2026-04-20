import React, { useState, useEffect } from "react";
import { staffApi, Staff } from "@/api/staff";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { STAFF_ROLES } from "@/api/staffRoles";
import { StaffRole } from "@/api/types";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { AlertCircle, Bell, Mail, Smartphone, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { profileApi } from "@/api/profile";
import { UserPlus, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { notificationsApi } from "@/api/notifications";

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember?: Staff | null;
  restaurantId?: string;
  onSuccess: () => void;
}

export function StaffForm({ open, onOpenChange, staffMember, restaurantId, onSuccess }: StaffFormProps) {
  const { toast } = useToast();
  const { subscription: partnerSubscription, loading: subscriptionLoading } = usePartnerSubscription();
  const [loading, setLoading] = useState(false);
  const [currentStaffCount, setCurrentStaffCount] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    staff_role: "waiter" as StaffRole,
    employment_status: "active" as "active" | "inactive" | "terminated",
    hire_date: "",
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_enabled: true,
    sms_enabled: true,
    push_enabled: true,
    booking_confirmations: true,
    reservation_reminders: true,
    system_notifications: true,
  });

  useEffect(() => {
    if (open) {
      const fetchStaffCount = async () => {
        const staff = restaurantId 
          ? await staffApi.getByRestaurant(restaurantId) 
          : await staffApi.getAll();
        setCurrentStaffCount(staff.length);
      };
      fetchStaffCount();
    }
  }, [open, restaurantId]);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (staffMember?.user_id) {
        const prefs = await notificationsApi.getPreferences(staffMember.user_id);
        if (prefs) {
          setNotificationPrefs({ 
            email_enabled: prefs.email_enabled ?? true,
            sms_enabled: prefs.sms_enabled ?? true,
            push_enabled: prefs.push_enabled ?? true,
            booking_confirmations: prefs.booking_confirmations ?? true,
            reservation_reminders: prefs.reservation_reminders ?? true,
            system_notifications: prefs.system_notifications ?? true,
          });
        }
      }
    };
    
    if (open && staffMember) {
      fetchPrefs();
    }
  }, [open, staffMember]);

  const isLimitReached = 
    !staffMember && 
    partnerSubscription?.maxStaff !== null && 
    currentStaffCount >= (partnerSubscription?.maxStaff || 0);

  useEffect(() => {
    if (staffMember) {
      setFormData({
        first_name: staffMember.profiles?.first_name || "",
        last_name: staffMember.profiles?.last_name || "",
        email: staffMember.profiles?.email || "",
        phone_number: staffMember.profiles?.phone_number || "",
        staff_role: (staffMember.role as StaffRole) || "waiter",
        employment_status: staffMember.is_active ? "active" : "inactive",
        hire_date: "",
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        staff_role: "waiter",
        employment_status: "active",
        hire_date: "",
      });
      // Reset prefs for new staff
      setNotificationPrefs({
        email_enabled: true,
        sms_enabled: true,
        push_enabled: true,
        booking_confirmations: true,
        reservation_reminders: true,
        system_notifications: true,
      });
    }
  }, [staffMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let targetUserId = staffMember?.user_id;

      if (staffMember) {
        const updated = await staffApi.update(staffMember.id, {
          role: formData.staff_role,
          is_active: formData.employment_status === 'active'
        });
        if (!updated) throw new Error('Failed to update staff member.');
      } else {
        const profile = await profileApi.getByEmail(formData.email);
        
        if (!profile) {
          toast({
            title: "User not found",
            description: "We couldn't find a user with this email. Sending an invitation instead...",
          });
          
          throw new Error(`User with email ${formData.email} not found. An invitation has been queued for them to join Reservatoo.`);
        }

        targetUserId = profile.id;

        const newStaff = await staffApi.create({
          user_id: profile.id,
          restaurant_id: restaurantId!,
          role: formData.staff_role,
          is_active: formData.employment_status === 'active',
        } as any);

        if (!newStaff) throw new Error('Failed to create staff member.');
      }

      // Update notification preferences
      if (targetUserId) {
        await notificationsApi.updatePreferences(targetUserId, notificationPrefs);
      }

      toast({
        title: staffMember ? "Staff member updated" : "Staff member added",
        description: staffMember 
          ? "The staff member and their preferences have been successfully updated."
          : "The new staff member has been successfully added.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {staffMember ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLimitReached && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Staff limit reached</AlertTitle>
              <AlertDescription>
                Your current plan ({partnerSubscription?.planName}) allows up to {partnerSubscription?.maxStaff} staff members. 
                Please upgrade your plan to add more staff.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Staff Details</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    disabled={!!staffMember}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    disabled={!!staffMember}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!staffMember}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!!staffMember}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff_role">Role</Label>
                  <Select
                    value={formData.staff_role}
                    onValueChange={(value) => setFormData({ ...formData, staff_role: value as StaffRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_status">Status</Label>
                  <Select
                    value={formData.employment_status}
                    onValueChange={(value) => setFormData({ ...formData, employment_status: value as "active" | "inactive" | "terminated" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Channels
                </h3>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" /> Email
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_enabled}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" /> Push
                    </Label>
                    <p className="text-xs text-muted-foreground">Real-time browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_enabled}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, push_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" /> SMS
                    </Label>
                    <p className="text-xs text-muted-foreground">Urgent text message alerts</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.sms_enabled}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, sms_enabled: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="booking_confirmations" className="cursor-pointer">Booking Confirmations</Label>
                  <Switch
                    id="booking_confirmations"
                    checked={notificationPrefs.booking_confirmations}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, booking_confirmations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reservation_reminders" className="cursor-pointer">Reservation Reminders</Label>
                  <Switch
                    id="reservation_reminders"
                    checked={notificationPrefs.reservation_reminders}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, reservation_reminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="system_notifications" className="cursor-pointer">System & Schedule Updates</Label>
                  <Switch
                    id="system_notifications"
                    checked={notificationPrefs.system_notifications}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, system_notifications: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || isLimitReached}>
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : staffMember ? "Save Changes" : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}