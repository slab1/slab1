import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { hexToHsl } from '@/lib/utils';

export interface RestaurantTheme {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  buttonTextColor?: string;
  cardBackgroundColor?: string;
  logoUrl?: string;
}

export function useRestaurantTheme(restaurantId?: string) {
  const { data: appearanceSettings, isLoading } = useQuery({
    queryKey: ['restaurant-appearance', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
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

  const theme = appearanceSettings?.theme as RestaurantTheme | undefined;

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      
      // Apply colors if they exist
      if (theme.primaryColor) {
        root.style.setProperty('--primary', hexToHsl(theme.primaryColor));
      }
      if (theme.accentColor) {
        root.style.setProperty('--accent', hexToHsl(theme.accentColor));
      }
      if (theme.buttonTextColor) {
        root.style.setProperty('--primary-foreground', hexToHsl(theme.buttonTextColor));
      }
      
      // Load and apply font
      if (theme.fontFamily) {
        // We set --font-sans because it's the base font in many tailwind setups
        root.style.setProperty('--font-sans', theme.fontFamily);
        
        const fontName = theme.fontFamily.replace(/\s+/g, '+');
        const linkId = 'google-font-restaurant';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        
        if (!link) {
          link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      }

      // Apply border radius
      if (theme.borderRadius) {
        root.style.setProperty('--radius', theme.borderRadius);
      }

      // Cleanup on unmount or when theme changes
      return () => {
        root.style.removeProperty('--primary');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--primary-foreground');
        root.style.removeProperty('--font-sans');
        root.style.removeProperty('--radius');
      };
    }
  }, [theme]);

  return { theme, isLoading };
}
