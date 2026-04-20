import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

// Deno global is available in Supabase Edge Functions
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generic error codes for client responses (no internal details exposed)
const ERROR_CODES = {
  UNAUTHORIZED: { code: 'E001', message: 'Authentication required' },
  INVALID_REQUEST: { code: 'E002', message: 'Invalid request parameters' },
  RESOURCE_NOT_FOUND: { code: 'E003', message: 'Resource not found' },
  PAYMENT_NOT_AVAILABLE: { code: 'E004', message: 'Payment not available' },
  AMOUNT_OUT_OF_RANGE: { code: 'E005', message: 'Amount out of acceptable range' },
  PROCESSING_ERROR: { code: 'E006', message: 'Payment processing failed' },
} as const;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.UNAUTHORIZED.message, errorCode: ERROR_CODES.UNAUTHORIZED.code }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Parse request body
    const { reservation_id, restaurant_id, currency = 'usd' } = await req.json()

    // Validate required fields
    if (!reservation_id || !restaurant_id) {
      console.error('Missing required fields: reservation_id or restaurant_id');
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_REQUEST.message, errorCode: ERROR_CODES.INVALID_REQUEST.code }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the reservation belongs to the user and is in the correct state
    // Also fetch guest_count and restaurant details for price calculation
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select('id, status, restaurant_id, guest_count, special_requests')
      .eq('id', reservation_id)
      .eq('user_id', user.id)
      .single()

    if (reservationError || !reservation) {
      console.error('Reservation not found or access denied:', reservationError);
      return new Response(
        JSON.stringify({ error: ERROR_CODES.RESOURCE_NOT_FOUND.message, errorCode: ERROR_CODES.RESOURCE_NOT_FOUND.code }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (reservation.status !== 'pending') {
      console.error('Reservation not in payable state:', reservation.status);
      return new Response(
        JSON.stringify({ error: ERROR_CODES.PAYMENT_NOT_AVAILABLE.message, errorCode: ERROR_CODES.PAYMENT_NOT_AVAILABLE.code }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get payment settings for the restaurant (includes pricing)
    const { data: paymentSettings, error: settingsError } = await supabaseClient
      .from('payment_settings')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .single()

    if (settingsError || !paymentSettings?.is_enabled) {
      console.error('Payments not enabled for restaurant:', settingsError);
      return new Response(
        JSON.stringify({ error: ERROR_CODES.PAYMENT_NOT_AVAILABLE.message, errorCode: ERROR_CODES.PAYMENT_NOT_AVAILABLE.code }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // SERVER-SIDE PRICE CALCULATION - Never trust client-provided amounts
    // Calculate the required payment amount based on reservation details
    const guestCount = reservation.guest_count || 1;
    
    // Use deposit_amount as base price per person, or default to minimum_order_amount
    const pricePerPerson = paymentSettings.deposit_amount || paymentSettings.minimum_order_amount || 25;
    let calculatedAmount = guestCount * pricePerPerson;

    // Apply minimum order amount
    if (paymentSettings.minimum_order_amount && calculatedAmount < paymentSettings.minimum_order_amount) {
      calculatedAmount = paymentSettings.minimum_order_amount;
    }

    // Apply maximum order amount
    if (paymentSettings.maximum_order_amount && calculatedAmount > paymentSettings.maximum_order_amount) {
      calculatedAmount = paymentSettings.maximum_order_amount;
    }

    // Calculate deposit if required
    let paymentAmount = calculatedAmount;
    let isDeposit = false;

    if (paymentSettings.requires_deposit) {
      if (paymentSettings.deposit_percentage > 0) {
        paymentAmount = Math.round(calculatedAmount * (paymentSettings.deposit_percentage / 100) * 100) / 100;
      } else if (paymentSettings.deposit_amount > 0) {
        paymentAmount = Math.min(paymentSettings.deposit_amount, calculatedAmount);
      }
      isDeposit = true;
    }

    // Ensure amount is positive and reasonable
    if (paymentAmount <= 0) {
      console.error('Invalid calculated amount:', paymentAmount);
      return new Response(
        JSON.stringify({ error: ERROR_CODES.AMOUNT_OUT_OF_RANGE.message, errorCode: ERROR_CODES.AMOUNT_OUT_OF_RANGE.code }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Stripe payment intent with SERVER-CALCULATED amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: currency,
      metadata: {
        reservation_id: reservation_id,
        restaurant_id: restaurant_id,
        user_id: user.id, // FIXED: Use user_id consistently for DB mapping
        is_deposit: isDeposit.toString(),
        full_amount: calculatedAmount.toString(),
        guest_count: guestCount.toString()
      },
      description: `Reservation payment - ${reservation_id.slice(0, 8)}`,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session',
    });

    // Log the payment intent creation (using service role client for insert)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    await supabaseAdmin
      .from('payment_logs')
      .insert({
        payment_id: paymentIntent.id,
        event_type: 'payment_intent_created',
        event_data: {
          amount: paymentAmount,
          currency,
          reservation_id,
          restaurant_id,
          is_deposit: isDeposit,
          guest_count: guestCount
        },
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
        user_agent: req.headers.get('User-Agent')
      });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentAmount,
        currency,
        isDeposit,
        fullAmount: calculatedAmount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error);

    return new Response(
      JSON.stringify({ error: ERROR_CODES.PROCESSING_ERROR.message, errorCode: ERROR_CODES.PROCESSING_ERROR.code }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})