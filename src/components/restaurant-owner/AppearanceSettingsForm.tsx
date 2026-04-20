
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppearanceSettings, ThemeSettings, Json } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, RotateCcw } from 'lucide-react';

interface AppearanceSettingsFormProps {
  restaurantId: string;
}

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  fontFamily: 'Inter',
  borderRadius: '0.5rem',
};

export function AppearanceSettingsForm({ restaurantId }: AppearanceSettingsFormProps) {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['appearance-settings', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_appearance_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  useEffect(() => {
      if (settings?.theme) {
        const themeData = settings.theme as unknown as Partial<ThemeSettings>;
        setTheme({
          ...DEFAULT_THEME,
          ...themeData,
        });
      }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (updatedTheme: ThemeSettings) => {
      const themeJson = updatedTheme as unknown as Json;
      if (settings?.id) {
        const { error } = await supabase
          .from('restaurant_appearance_settings')
          .update({ theme: themeJson })
          .eq('restaurant_id', restaurantId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurant_appearance_settings')
          .insert({
            theme: themeJson,
            restaurant_id: restaurantId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appearance-settings', restaurantId] });
      toast.success('Appearance settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(theme);
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
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
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your restaurant pages</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                />
                <Input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  className="w-12 h-10 p-1"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                />
                <Input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <select
                id="fontFamily"
                className="w-full h-10 px-3 py-2 border rounded-md"
                value={theme.fontFamily}
                onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
              >
                <option value="Inter">Inter (Default)</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <select
                id="borderRadius"
                className="w-full h-10 px-3 py-2 border rounded-md"
                value={theme.borderRadius}
                onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
              >
                <option value="0">None (Sharp)</option>
                <option value="0.25rem">Small</option>
                <option value="0.5rem">Medium (Default)</option>
                <option value="0.75rem">Large</option>
                <option value="1rem">Full (Rounded)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
          </div>
        </form>

        <div className="mt-8 p-6 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-medium mb-4">Preview</h4>
          <div 
            className="p-4 rounded-lg bg-white shadow-sm border space-y-4"
            style={{ 
              fontFamily: theme.fontFamily,
              borderRadius: theme.borderRadius
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div className="font-bold">Restaurant Name</div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
            <button 
              className="px-4 py-2 text-white text-sm font-medium"
              style={{ 
                backgroundColor: theme.primaryColor,
                borderRadius: theme.borderRadius
              }}
            >
              Book a Table
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
