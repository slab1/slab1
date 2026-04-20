import { supabase } from "@/integrations/supabase/client";

export const sendReservationConfirmationEmail = async (reservationId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-reservation-email', {
      body: { reservationId }
    });

    if (error) {
      throw new Error(error.message || 'Failed to send confirmation email');
    }

    return data;
  } catch (error: unknown) {
    console.error('Email sending error:', error);
    throw error;
  }
};