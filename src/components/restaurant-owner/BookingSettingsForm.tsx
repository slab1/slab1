import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { RestaurantSettings } from '@/api/types';

interface BookingSettingsFormProps {
  restaurantId: string;
}

export function BookingSettingsForm({ restaurantId }: BookingSettingsFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<RestaurantSettings>>({
    booking_window_days: 30,
    min_advance_booking_hours: 2,
    max_party_size: 10,
    default_seating_duration: 90,
    auto_confirm_bookings: true,
    require_deposit: false,
    deposit_amount: 0,
    deposit_type: 'flat',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['booking-settings', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as RestaurantSettings | null;
    },
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        booking_window_days: settings.booking_window_days || 30,
        min_advance_booking_hours: settings.min_advance_booking_hours || 2,
        max_party_size: settings.max_party_size || 10,
        default_seating_duration: settings.default_seating_duration || 90,
        auto_confirm_bookings: settings.auto_confirm_bookings ?? true,
        require_deposit: settings.require_deposit ?? false,
        deposit_amount: settings.deposit_amount || 0,
        deposit_type: settings.deposit_type || 'flat',
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (updatedSettings: Partial<RestaurantSettings>) => {
      // Check if settings record exists
      const { data: existing } = await supabase
        .from('restaurant_settings')
        .select('restaurant_id')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('restaurant_settings')
          .update(updatedSettings as any)
          .eq('restaurant_id', restaurantId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurant_settings')
          .insert([{
            ...updatedSettings,
            restaurant_id: restaurantId,
          }] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-settings', restaurantId] });
      toast.success('Booking settings updated successfully');
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
        <CardTitle>Booking Settings</CardTitle>
        <CardDescription>Configure how your reservation system handles bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="booking_window_days">Booking Window (Days)</Label>
                <Input
                  id="booking_window_days"
                  type="number"
                  value={formData.booking_window_days}
                  onChange={(e) => setFormData({ ...formData, booking_window_days: parseInt(e.target.value) })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  How many days in advance can customers book?
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min_advance_booking_hours">Minimum Advance Booking (Hours)</Label>
                <Input
                  id="min_advance_booking_hours"
                  type="number"
                  value={formData.min_advance_booking_hours}
                  onChange={(e) => setFormData({ ...formData, min_advance_booking_hours: parseInt(e.target.value) })}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum time before reservation for a new booking.
                </p>
              </div>

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
                  Largest group size allowed for online bookings.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="default_seating_duration">Default Seating Duration (Minutes)</Label>
                <Input
                  id="default_seating_duration"
                  type="number"
                  value={formData.default_seating_duration}
                  onChange={(e) => setFormData({ ...formData, default_seating_duration: parseInt(e.target.value) })}
                  min={15}
                  step={15}
                />
                <p className="text-xs text-muted-foreground">
                  How long is a table typically reserved for?
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_confirm_bookings">Auto-confirm Bookings</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically confirm new reservation requests.
                  </p>
                </div>
                <Switch
                  id="auto_confirm_bookings"
                  checked={formData.auto_confirm_bookings}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_confirm_bookings: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="require_deposit">Require Deposit</Label>
                  <p className="text-xs text-muted-foreground">
                    Ask for a deposit to secure the booking.
                  </p>
                </div>
                <Switch
                  id="require_deposit"
                  checked={formData.require_deposit}
                  onCheckedChange={(checked) => setFormData({ ...formData, require_deposit: checked })}
                />
              </div>
            </div>
          </div>

          {formData.require_deposit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="deposit_amount">Deposit Amount</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deposit_type">Deposit Type</Label>
                <Select
                  value={formData.deposit_type}
                  onValueChange={(value: 'flat' | 'percentage') => setFormData({ ...formData, deposit_type: value })}
                >
                  <SelectTrigger id="deposit_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                    <SelectItem value="percentage">Percentage of total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Booking Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
