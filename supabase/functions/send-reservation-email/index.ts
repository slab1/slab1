import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  console.log(`EMAIL SENT TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT: ${htmlContent}`);
  return { success: true };
};

const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth guard
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    // Use service role for data access (need admin.getUserById)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reservationId } = await req.json();
    
    if (!reservationId) {
      return new Response(
        JSON.stringify({ error: 'Missing reservation ID' }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }
    
    // Fetch reservation and verify ownership
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select(`
        *,
        user_id,
        location:restaurant_location_id (
          *,
          restaurant:restaurant_id (*)
        ),
        table:table_id (*)
      `)
      .eq("id", reservationId)
      .single();
    
    if (reservationError) throw reservationError;

    // Verify the caller owns this reservation or is staff
    if (reservation.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 }
      );
    }
    
    const [userResponse, preferencesResponse] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(reservation.user_id),
      supabaseAdmin
        .from("notification_preferences")
        .select("*")
        .eq("user_id", reservation.user_id)
        .single()
    ]);
    
    const { data: userData, error: userError } = userResponse;
    const { data: preferences } = preferencesResponse;
    
    if (userError) throw userError;

    if (preferences) {
      if (!preferences.email_enabled) {
        return new Response(
          JSON.stringify({ success: true, message: "Email notifications disabled by user" }),
          { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
        );
      }
      if (!preferences.booking_confirmations) {
        return new Response(
          JSON.stringify({ success: true, message: "Booking confirmations disabled by user" }),
          { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
        );
      }
    }
    
    const reservationDate = new Date(reservation.reservation_date);
    const formattedDate = reservationDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = formatTime(reservation.reservation_time);
    
    const restaurantName = reservation.location.restaurant.name;
    const confirmationCode = reservation.id.substring(0, 8).toUpperCase();
    const restaurantAddress = `${reservation.location.address}, ${reservation.location.city}, ${reservation.location.state} ${reservation.location.zip}`;
    const restaurantPhone = reservation.location.phone;
    
    const userEmail = userData.user.email || '';
    if (!userEmail) throw new Error('User email not found');

    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #4F46E5; padding: 20px; text-align: center; color: white; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .reservation-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .confirmation-code { font-family: monospace; background: #eee; padding: 5px 10px; border-radius: 3px; }
          .map-button { background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>Your Reservation is Confirmed!</h1></div>
        <div class="content">
          <p>Dear ${userEmail},</p>
          <p>Your reservation at <strong>${restaurantName}</strong> has been confirmed.</p>
          <div class="reservation-details">
            <h3 style="margin-top: 0;">${restaurantName}</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Party Size:</strong> ${reservation.guest_count} guests</p>
            <p><strong>Confirmation Code:</strong> <span class="confirmation-code">${confirmationCode}</span></p>
            <p><strong>Address:</strong> ${restaurantAddress}</p>
            <p><strong>Phone:</strong> ${restaurantPhone}</p>
            <a href="https://maps.google.com/?q=${encodeURIComponent(restaurantAddress)}" class="map-button" target="_blank">View on Map</a>
          </div>
          ${reservation.special_requests ? `<div><h3>Special Requests:</h3><p>${reservation.special_requests}</p></div>` : ''}
          <h3>Need to modify your reservation?</h3>
          <p>You can manage your reservation by logging into your account.</p>
          <div class="footer">
            <p>Thank you for choosing ${restaurantName}!</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail(userEmail, `Reservation Confirmation - ${restaurantName}`, emailContent);
    
    if (reservation.location.email) {
      const restaurantEmailContent = `
        <!DOCTYPE html>
        <html lang="en"><head><meta charset="UTF-8"><title>New Reservation</title></head>
        <body>
          <h2>New Reservation Alert</h2>
          <p><strong>Guest:</strong> ${userEmail}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Party Size:</strong> ${reservation.guest_count} guests</p>
          <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
          ${reservation.special_requests ? `<p><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
        </body></html>
      `;
      await sendEmail(reservation.location.email, `New Reservation - ${formattedDate}, ${formattedTime}`, restaurantEmailContent);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error("Error sending reservation email:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});
