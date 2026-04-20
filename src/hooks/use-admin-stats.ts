
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StatsData {
  restaurants: number;
  locations: number;
  reservations: number;
  users: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<StatsData> => {
      // Fetch all stats in parallel
      const [restaurantsResult, locationsResult, reservationsResult, usersResult] = await Promise.all([
        supabase.from('restaurants').select('id', { count: 'exact', head: true }),
        supabase.from('restaurant_locations').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      // Handle any errors
      if (restaurantsResult.error) console.error('Error fetching restaurants count:', restaurantsResult.error);
      if (locationsResult.error) console.error('Error fetching locations count:', locationsResult.error);
      if (reservationsResult.error) console.error('Error fetching reservations count:', reservationsResult.error);
      if (usersResult.error) console.error('Error fetching users count:', usersResult.error);

      return {
        restaurants: restaurantsResult.count || 0,
        locations: locationsResult.count || 0,
        reservations: reservationsResult.count || 0,
        users: usersResult.count || 0,
      };
    },
  });
}
