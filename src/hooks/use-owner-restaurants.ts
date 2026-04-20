import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant, RestaurantLocationAddress } from "@/api/types";

// Explicit result type to avoid TypeScript recursion
interface RestaurantQueryResult {
  id: string;
  name: string;
  admin_id: string | null;
  locations: Array<{
    id: string;
    restaurant_id: string;
    address: unknown;
    contact_info: unknown;
  }> | null;
  [key: string]: unknown;
}

export function useOwnerRestaurants(userId: string | undefined) {
  return useQuery({
    queryKey: ["owner-restaurants", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Use (supabase as any) with explicit FK hint to avoid type depth issues
      const { data, error } = await (supabase as any)
        .from('restaurants')
        .select('*, locations:restaurant_locations!restaurant_locations_restaurant_id_fkey(*)')
        .eq('admin_id', userId);
      
      if (error) throw error;
      
      // Cast and transform data to match Restaurant type
      const typedData = data as unknown as RestaurantQueryResult[];
      return (typedData || []).map((r) => {
        const locations = r.locations?.map((loc) => ({
          ...loc,
          address: loc.address as string | RestaurantLocationAddress
        }));

        return {
          ...r,
          admin_id: r.admin_id || userId,
          locations
        };
      }) as Restaurant[];
    },
    enabled: !!userId,
  });
}
