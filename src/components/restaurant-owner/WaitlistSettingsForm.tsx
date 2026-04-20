
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WaitlistSettings } from '@/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface WaitlistSettingsFormProps {
  restaurantId: string;
}

export function WaitlistSettingsForm({ restaurantId }: WaitlistSettingsFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<WaitlistSettings>>({
    max_party_size: 10,
    notify_staff: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['waitlist-settings', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_waitlist_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        max_party_size: settings.max_party_size || 10,
        notify_staff: settings.notify_staff ?? true,
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (updatedSettings: Partial<WaitlistSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('restaurant_waitlist_settings')
          .update(updatedSettings)
          .eq('restaurant_id', restaurantId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurant_waitlist_settings')
          .insert({
            ...updatedSettings,
            restaurant_id: restaurantId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-settings', restaurantId] });
      toast.success('Waitlist settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waitlist Settings</CardTitle>
        <CardDescription>Configure how your waitlist operates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="max_party_size">Maximum Party Size</Label>
              <Input
                id="max_party_size"
                type="number"
                value={formData.max_party_size}
                onChange={(e) => setFormData({ ...formData, max_party_size: parseInt(e.target.value) })}
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                The maximum number of guests allowed in a single waitlist entry.
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify_staff">Staff Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when a new guest joins the waitlist.
                </p>
              </div>
              <Switch
                id="notify_staff"
                checked={formData.notify_staff}
                onCheckedChange={(checked) => setFormData({ ...formData, notify_staff: checked })}
              />
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
