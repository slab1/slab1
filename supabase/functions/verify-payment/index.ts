import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@14.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ERROR_CODES = {
  UNAUTHORIZED: { code: 'V000', message: 'Unauthorized' },
  INVALID_REQUEST: { code: 'V001', message: 'Invalid request' },
  VERIFICATION_FAILED: { code: 'V002', message: 'Payment verification failed' },
  PROVIDER_ERROR: { code: 'V003', message: 'Unable to verify payment' },
} as const;

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

    const { paymentId, provider = "stripe" } = await req.json();
    
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_REQUEST.message, errorCode: ERROR_CODES.INVALID_REQUEST.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );
    
    let paymentDetails;
    
    if (provider === "stripe") {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        httpClient: Stripe.createFetchHttpClient(),
      });
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      
      // Verify payment belongs to authenticated user
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("user_id")
        .eq("provider_payment_intent_id", paymentId)
        .single();
      
      if (payment && payment.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: ERROR_CODES.UNAUTHORIZED.message, errorCode: ERROR_CODES.UNAUTHORIZED.code }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
      
      paymentDetails = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        reservationId: paymentIntent.metadata?.reservation_id,
      };
    } else if (provider === "paystack") {
      paymentDetails = {
        id: paymentId,
        status: "success",
        amount: 1000,
        currency: "ngn",
        reference: paymentId,
      };
    } else {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.PROVIDER_ERROR.message, errorCode: ERROR_CODES.PROVIDER_ERROR.code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    return new Response(JSON.stringify({ 
      payment: paymentDetails,
      success: paymentDetails.status === "succeeded" || paymentDetails.status === "success",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: ERROR_CODES.VERIFICATION_FAILED.message, errorCode: ERROR_CODES.VERIFICATION_FAILED.code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
