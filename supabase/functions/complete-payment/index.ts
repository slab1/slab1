import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@14.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ERROR_CODES = {
  UNAUTHORIZED: { code: 'C000', message: 'Unauthorized' },
  INVALID_REQUEST: { code: 'C001', message: 'Invalid request' },
  PAYMENT_NOT_FOUND: { code: 'C002', message: 'Payment not found' },
  ALREADY_PROCESSED: { code: 'C003', message: 'Payment already processed' },
  PROCESSING_FAILED: { code: 'C004', message: 'Payment processing failed' },
} as const;

// Initialize Supabase admin client for database operations
const getSupabaseAdmin = () => createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false } }
);

// Check if payment was already processed successfully
const isPaymentProcessed = async (paymentIntentId: string): Promise<{ processed: boolean; status: string | null }> => {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("payments")
    .select("id, status")
    .eq("provider_payment_intent_id", paymentIntentId)
    .single();
  
  return { 
    processed: data !== null, 
    status: data?.status || null 
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Auth guard
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.UNAUTHORIZED.message, errorCode: ERROR_CODES.UNAUTHORIZED.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.UNAUTHORIZED.message, errorCode: ERROR_CODES.UNAUTHORIZED.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { paymentIntentId } = await req.json();
    
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_REQUEST.message, errorCode: ERROR_CODES.INVALID_REQUEST.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // IDEMPOTENCY CHECK: Return cached result if already processed
    const existingPayment = await isPaymentProcessed(paymentIntentId);
    if (existingPayment.processed) {
      return new Response(
        JSON.stringify({ 
          success: existingPayment.status === 'succeeded',
          alreadyProcessed: true,
          paymentIntent: {
            id: paymentIntentId,
            status: existingPayment.status
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify payment belongs to authenticated user via service role
    const supabaseAdmin = getSupabaseAdmin();

    // Get payment details (may exist but not be in 'succeeded' status)
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("user_id")
      .eq("provider_payment_intent_id", paymentIntentId)
      .single();

    if (payment && payment.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.UNAUTHORIZED.message, errorCode: ERROR_CODES.UNAUTHORIZED.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return new Response(
      JSON.stringify({ 
        success: paymentIntent.status === 'succeeded',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          reservationId: paymentIntent.metadata?.reservation_id
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error completing payment:", error);
    return new Response(
      JSON.stringify({ 
        error: ERROR_CODES.PROCESSING_FAILED.message, 
        errorCode: ERROR_CODES.PROCESSING_FAILED.code 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
