
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";
import { Reservation, ApiErrorResponse } from "../types";
import { errorTracker } from "@/utils/error-tracking";

export const getReservationsByUserId = async (userId: string): Promise<Reservation[] | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        restaurant:restaurants!fk_reservations_restaurant (
          id,
          name,
          image_url
        ),
        location:restaurant_locations!fk_reservations_location (
          id,
          location_name,
          address,
          city,
          state,
          zip_code,
          phone_number
        ),
        table:tables!fk_reservations_table (
          id,
          table_number,
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .eq("user_id", userId)
      .order("reservation_date", { ascending: false });

    if (error) throw error;
    
    return (data || []) as unknown as Reservation[];
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'get_reservations_by_user_id',
      userId
    });
    return handleApiError(error);
  }
};

export const getReservationsByRestaurantId = async (restaurantId: string): Promise<Reservation[] | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        user:profiles!fk_reservations_user_profile (
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        restaurant:restaurants!fk_reservations_restaurant (
          id,
          name,
          image_url
        ),
        location:restaurant_locations!fk_reservations_location (
          id,
          location_name,
          address,
          city,
          state,
          zip_code,
          phone_number
        ),
        table:tables!fk_reservations_table (
          id,
          table_number,
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("reservation_date", { ascending: true });

    if (error) throw error;
    
    return (data || []) as unknown as Reservation[];
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'get_reservations_by_restaurant_id',
      restaurantId
    });
    return handleApiError(error);
  }
};

export const getReservationById = async (id: string): Promise<Reservation | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        user:profiles!fk_reservations_user_profile (
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        restaurant:restaurants!fk_reservations_restaurant (
          id,
          name,
          image_url,
          description
        ),
        location:restaurant_locations!fk_reservations_location (
          id,
          location_name,
          address,
          city,
          state,
          zip_code,
          phone_number
        ),
        table:tables!fk_reservations_table (
          id,
          table_number,
          capacity,
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    
    return data as unknown as Reservation;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'get_reservation_by_id_queries',
      reservationId: id
    });
    return handleApiError(error);
  }
};

export const getAllReservations = async (
  requestingUserId: string,
  requestingUserRole: string
): Promise<Reservation[] | ApiErrorResponse> => {
  // Authorization check: only admins can access all reservations
  const adminRoles = ['system_admin', 'superadmin', 'admin'];
  if (!adminRoles.includes(requestingUserRole)) {
    errorTracker.captureError(
      new Error('Unauthorized access attempt to all reservations'),
      'warning',
      { context: 'get_all_reservations_authorization', userId: requestingUserId, role: requestingUserRole }
    );
    return handleApiError({ 
      message: 'Unauthorized: Admin access required', 
      code: 'UNAUTHORIZED' 
    });
  }

  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        user:profiles!fk_reservations_user_profile (
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        restaurant:restaurants!fk_reservations_restaurant (
          id,
          name,
          image_url,
          description
        ),
        location:restaurant_locations!fk_reservations_location (
          id,
          location_name,
          address,
          city,
          state,
          zip_code,
          phone_number
        ),
        table:tables!fk_reservations_table (*)
      `)
      .order("created_at", { ascending: false })
      .limit(1000); // Prevent unbounded queries

    if (error) throw error;

    return (data || []) as unknown as Reservation[];
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'get_all_reservations_queries'
    });
    return handleApiError(error);
  }
};

// Restricted version for restaurant managers - only their restaurant's reservations
export const getReservationsByManagerRestaurants = async (
  requestingUserId: string,
  restaurantIds: string[]
): Promise<Reservation[] | ApiErrorResponse> => {
  if (!restaurantIds || restaurantIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        user:profiles!fk_reservations_user_profile (
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        restaurant:restaurants!fk_reservations_restaurant (
          id,
          name,
          image_url,
          description
        ),
        location:restaurant_locations!fk_reservations_location (
          id,
          location_name,
          address,
          city,
          state,
          zip_code,
          phone_number
        ),
        table:tables!fk_reservations_table (*)
      `)
      .in('restaurant_id', restaurantIds)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    return (data || []) as unknown as Reservation[];
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'get_reservations_by_manager_restaurants',
      userId: requestingUserId
    });
    return handleApiError(error);
  }
};
