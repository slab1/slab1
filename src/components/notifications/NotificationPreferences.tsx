import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { toast } from 'sonner';

const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences } = useRealtimeNotifications();
  const [isSaving, setIsSaving] = React.useState(false);

  if (!preferences) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleToggle = async (key: string, value: boolean) => {
    try {
      updatePreferences({ [key]: value });
      toast.success('Preference updated');
    } catch (error) {
      toast.error('Failed to update preference');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive realtime alerts in your browser
              </p>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive text messages for urgent updates
              </p>
            </div>
            <Switch
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Select which events you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Booking Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                When your reservation is confirmed or changed
              </p>
            </div>
            <Switch
              checked={preferences.booking_confirmations}
              onCheckedChange={(checked) => handleToggle('booking_confirmations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reservation Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminders before your scheduled visit
              </p>
            </div>
            <Switch
              checked={preferences.reservation_reminders}
              onCheckedChange={(checked) => handleToggle('reservation_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Special Offers</Label>
              <p className="text-sm text-muted-foreground">
                Promotions and exclusive deals from restaurants
              </p>
            </div>
            <Switch
              checked={preferences.special_offers}
              onCheckedChange={(checked) => handleToggle('special_offers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">System Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Account updates and system announcements
              </p>
            </div>
            <Switch
              checked={preferences.system_notifications}
              onCheckedChange={(checked) => handleToggle('system_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
