
// Importing required types and centralized error handling
import { ChefBooking, ChefBookingInput, ApiErrorResponse } from './types';
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './utils';
import { loyaltyApi } from './loyalty';

// Create a new booking
// Export types for better API contract
export interface ChefBookingCreateInput extends ChefBookingInput {
  total_amount: number;
  user_id: string;  // ✅ REQUIRED - passed from component
}

const createBooking = async (bookingData: ChefBookingCreateInput): Promise<ChefBooking | ApiErrorResponse> => {
  try {
    // Validate user_id before making request
    if (!bookingData.user_id) {
      throw new Error('User ID is required to create a booking');
    }

    const { data, error } = await supabase
      .from('chef_bookings')
      .insert({
        chef_id: bookingData.chef_id,
        user_id: bookingData.user_id,  // ✅ Use passed user_id directly
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        duration: bookingData.duration,
        guest_count: bookingData.guest_count,
        location: bookingData.location,
        special_requests: bookingData.special_requests,
        menu_description: bookingData.menu_description,
        total_amount: bookingData.total_amount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select('*, chefs:chef_id(name, specialty, image, hourly_rate)')
      .single();

    if (error) throw error;

    const transformedData = {
      ...data,
      chef_name: data.chefs?.name,
      specialty: data.chefs?.specialty,
      image: data.chefs?.image,
      hourly_rate: data.chefs?.hourly_rate,
    };

    delete transformedData.chefs;

    return transformedData as ChefBooking;
  } catch (error) {
    return handleApiError(error, { context: 'chef_booking_create' });
  }
};

// Get booking by id - UUID is string
const getById = async (id: string): Promise<ChefBooking | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .select('*, chefs:chef_id(name, specialty, image, hourly_rate)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const transformedData = {
      ...data,
      chef_name: data.chefs?.name,
      specialty: data.chefs?.specialty,
      image: data.chefs?.image,
      hourly_rate: data.chefs?.hourly_rate,
    };

    delete transformedData.chefs;

    return transformedData as ChefBooking;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get bookings by user id
const getByUserId = async (userId: string): Promise<ChefBooking[] | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .select('*, chefs:chef_id(name, specialty, image, hourly_rate)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;

    const transformedData = data.map(booking => {
      const transformed = {
        ...booking,
        chef_name: booking.chefs?.name,
        specialty: booking.chefs?.specialty,
        image: booking.chefs?.image,
        hourly_rate: booking.chefs?.hourly_rate,
      };
      delete transformed.chefs;
      return transformed;
    });

    return transformedData as ChefBooking[];
  } catch (error) {
    return handleApiError(error);
  }
};

// Get bookings by chef id
const getByChefId = async (chefId: string): Promise<ChefBooking[] | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .select('*, users:user_id(email, id)')
      .eq('chef_id', chefId)
      .order('booking_date', { ascending: false });

    if (error) throw error;

    return data as unknown as ChefBooking[];
  } catch (error) {
    return handleApiError(error);
  }
};

// Update booking status - UUID is string
const updateStatus = async (id: string, status: string): Promise<ChefBooking | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Award loyalty points if booking is completed
    if (status === 'completed' && data && (data as any).user_id) {
      await loyaltyApi.addPoints((data as any).user_id, 100, "Completed private chef booking");
    }

    return data as ChefBooking;
  } catch (error) {
    return handleApiError(error);
  }
};

// Update payment status - UUID is string
const updatePaymentStatus = async (id: string, payment_status: string): Promise<ChefBooking | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as ChefBooking;
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete booking - UUID is string
const deleteBooking = async (id: string): Promise<boolean | ApiErrorResponse> => {
  try {
    const { error } = await supabase
      .from('chef_bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    return handleApiError(error);
  }
};

// Update booking details - UUID is string
const updateBooking = async (
  id: string, 
  bookingData: Partial<ChefBookingInput>
): Promise<ChefBooking | ApiErrorResponse> => {
  try {
    const { data, error } = await supabase
      .from('chef_bookings')
      .update(bookingData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as ChefBooking;
  } catch (error) {
    return handleApiError(error);
  }
};

export const chefBookingApi = {
  createBooking,
  getById,
  getByUserId,
  getByChefId,
  updateStatus,
  updatePaymentStatus,
  deleteBooking,
  updateBooking
};
