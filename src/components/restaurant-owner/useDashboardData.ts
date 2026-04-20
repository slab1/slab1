import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/api/types";

interface User {
  id: string;
  email: string;
  role?: string;
}

interface Restaurant {
  id: string;
  name: string;
  locations?: Array<{
    id: string;
    restaurant_id: string;
    address: Json;
    contact_info: Json;
  }>;
}

interface Reservation {
  id: string;
  status: string;
  restaurant_location_id: string;
}

// Define explicit result types to avoid TypeScript recursion
interface RestaurantQueryResult {
  id: string;
  name: string;
  locations: Array<{
    id: string;
    restaurant_id: string;
    address: Json;
    contact_info: Json;
  }> | null;
}

export function useDashboardData(user: User | null) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Use (supabase as any) to avoid TypeScript type depth issues with complex joins
      const { data: restaurantData, error: restaurantError } = await (supabase as any)
        .from("restaurants")
        .select(`
          id,
          name,
          locations:restaurant_locations!restaurant_locations_restaurant_id_fkey(
            id,
            restaurant_id,
            address,
            contact_info
          )
        `)
        .eq("admin_id", user.id);
      
      if (restaurantError) {
        throw restaurantError;
      }
      
      // Cast to our explicit result type
      const typedRestaurantData = restaurantData as unknown as RestaurantQueryResult[];
      setRestaurants(typedRestaurantData || []);
      
      // Calculate locations and reservations
      let locationCount = 0;
      let allReservations: Reservation[] = [];
      let pendingCount = 0;
      
      for (const restaurant of typedRestaurantData || []) {
        const locations = Array.isArray(restaurant.locations) ? restaurant.locations : [];
        locationCount += locations.length;
        
        for (const location of locations) {
          try {
            const { data: locationReservations, error: reservationError } = await supabase
              .from("reservations")
              .select("id, status, restaurant_location_id")
              .eq("restaurant_location_id", location.id);
              
            if (reservationError) {
              console.error("Error fetching reservations:", reservationError);
              continue;
            }
            
            if (locationReservations) {
              allReservations = [...allReservations, ...locationReservations];
              pendingCount += locationReservations.filter(r => r.status === 'pending').length;
            }
          } catch (locError) {
            console.error("Error fetching location reservations:", locError);
          }
        }
      }
      
      setTotalLocations(locationCount);
      setReservations(allReservations);
      setTotalReservations(allReservations.length);
      setPendingReservations(pendingCount);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);


  return {
    restaurants,
    reservations,
    totalReservations,
    pendingReservations,
    totalLocations,
    isLoading,
    loadDashboardData
  };
}
