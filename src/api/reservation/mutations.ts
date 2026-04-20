
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../utils";
import { Reservation, ReservationInput, ApiErrorResponse } from "../types";
import { errorTracker } from "@/utils/error-tracking";
import { loyaltyApi } from "../loyalty";

export const createReservation = async (reservation: ReservationInput): Promise<Reservation | ApiErrorResponse | null> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        user_id: reservation.user_id,
        restaurant_id: reservation.restaurant_id,
        restaurant_location_id: reservation.restaurant_location_id,
        table_id: reservation.table_id,
        combination_id: reservation.combination_id,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        guest_count: reservation.guest_count,
        special_requests: reservation.special_requests,
        status: reservation.status || 'pending',
        contact_info: reservation.contact_info,
        estimated_duration: reservation.estimated_duration ? String(reservation.estimated_duration) : undefined
      })
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
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .single();

    if (error) throw error;

    return data as unknown as Reservation;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'create_reservation_mutations',
      reservation
    });
    return handleApiError(error);
  }
};

export const updateReservation = async (id: string, updates: Partial<ReservationInput>): Promise<Reservation | ApiErrorResponse | null> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        ...updates,
        guest_count: updates.guest_count,
        estimated_duration: updates.estimated_duration ? String(updates.estimated_duration) : undefined,
      })
      .eq("id", id)
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
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .single();

    if (error) throw error;

    // Award loyalty points if status is updated to completed
    if (updates.status === 'completed' && data?.user_id) {
      await loyaltyApi.addPoints(data.user_id, 10, "Completed reservation");
    }

    return data as unknown as Reservation | null;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'update_reservation_mutations',
      reservationId: id
    });
    return handleApiError(error);
  }
};

export const cancelReservation = async (id: string): Promise<Reservation | ApiErrorResponse | null> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id)
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
          section
        ),
        combination:table_combinations!fk_reservations_combination (
          id,
          name,
          max_party_size,
          table_ids
        )
      `)
      .single();

    if (error) throw error;
    return data as unknown as Reservation;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'cancel_reservation',
      reservationId: id
    });
    return handleApiError(error);
  }
};

export const deleteReservation = async (id: string): Promise<boolean | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return !!data;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'delete_reservation',
      reservationId: id
    });
    return handleApiError(error);
  }
};

export const updateReservationStatus = async (id: string, status: string): Promise<Reservation | ApiErrorResponse | null> => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Reservation;
  } catch (error) {
    errorTracker.captureError(error as Error, 'error', {
      context: 'update_reservation_status_mutations',
      reservationId: id,
      status
    });
    return handleApiError(error);
  }
};
