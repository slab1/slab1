import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@14.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false } }
);

// Helper to extract restaurant ID from metadata or lookup via reservation
const getRestaurantId = async (supabase: any, metadata: Record<string, any>) => {
  if (metadata?.restaurant_id) return metadata.restaurant_id;
  
  if (metadata?.reservation_id) {
    const { data, error } = await supabase
      .from("reservations")
      .select("restaurant_id")
      .eq("id", metadata.reservation_id)
      .single();
    
    if (data && !error) return data.restaurant_id;
    console.error(`Could not find restaurant for reservation ${metadata.reservation_id}:`, error);
  }
  return null;
};

// Helper to extract user ID from metadata (prefer user_id for consistency)
const getUserId = (metadata: Record<string, any>): string | null => {
  return metadata?.user_id || metadata?.customer_id || null;
};

serve(async (req) => {
  try {
    if (req.method === "POST") {
      const body = await req.text();
      const signature = req.headers.get("stripe-signature");

      if (!signature) {
        return new Response("No signature provided", { status: 400 });
      }

      // Verify the webhook signature
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err}`);
        const errMessage = err instanceof Error ? err.message : 'Unknown error';
        return new Response(`Webhook Error: ${errMessage}`, { status: 400 });
      }

      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
          
          const metadata = paymentIntent.metadata || {};
          const reservationId = metadata.reservation_id;
          const userId = getUserId(metadata);
          
          const restaurantId = await getRestaurantId(supabaseAdmin, metadata);
          const amount = paymentIntent.amount;
          const currency = paymentIntent.currency;

          // Record payment in the payments table using upsert for idempotency
          if (restaurantId) {
            const { error: upsertError } = await supabaseAdmin.from("payments").upsert({
              provider_payment_intent_id: paymentIntent.id,
              provider_payment_intent_id: paymentIntent.id,
              restaurant_id: restaurantId,
              reservation_id: reservationId || null,
              user_id: userId, // FIXED: Use user_id from metadata (customer_id maps to user)
              amount: amount / 100,
              currency,
              status: "succeeded",
              provider: "stripe",
              description: metadata.type || "reservation",
              metadata: metadata,
              completed_at: new Date().toISOString()
            }, { 
              onConflict: 'provider_payment_intent_id',
              ignoreDuplicates: true 
            });
            
            if (upsertError) {
              console.error(`Failed to record payment: ${upsertError.message}`);
            }
          }
          
          // If this is for a reservation, update the reservation status
          if (reservationId) {
            await supabaseAdmin.from("reservations").update({
              status: "confirmed",
              payment_status: "paid",
              updated_at: new Date().toISOString()
            }).eq("id", reservationId);
          }
          break;
        }
          
        case "payment_intent.payment_failed": {
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment failed: ${failedPayment.id}`);
          
          const metadata = failedPayment.metadata || {};
          const reservationId = metadata.reservation_id;
          const userId = getUserId(metadata);
          
          const restaurantId = await getRestaurantId(supabaseAdmin, metadata);
          
          // Record failed payment using upsert for idempotency
          if (restaurantId) {
            const { error: upsertError } = await supabaseAdmin.from("payments").upsert({
              provider_payment_intent_id: failedPayment.id,
              restaurant_id: restaurantId,
              reservation_id: reservationId || null,
              user_id: userId, // FIXED: Use user_id from metadata
              amount: failedPayment.amount / 100,
              currency: failedPayment.currency,
              status: "failed",
              provider: "stripe",
              description: metadata.type || "reservation",
              metadata: metadata,
              error_message: failedPayment.last_payment_error?.message || "Payment failed"
            }, { 
              onConflict: 'provider_payment_intent_id',
              ignoreDuplicates: true 
            });
            
            if (upsertError) {
              console.error(`Failed to record failed payment: ${upsertError.message}`);
            }
          }
          
          // Update reservation if needed
          if (reservationId) {
            await supabaseAdmin.from("reservations").update({
              payment_status: "failed",
              updated_at: new Date().toISOString()
            }).eq("id", reservationId);
          }
          break;
        }
          
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          console.log(`Charge refunded: ${charge.id}`);
          
          const paymentIntentId = charge.payment_intent as string;
          
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const metadata = paymentIntent.metadata || {};
          const reservationId = metadata.reservation_id;
          const userId = getUserId(metadata);
          const restaurantId = await getRestaurantId(supabaseAdmin, metadata);
          
          if (restaurantId) {
            // Get the original payment ID for proper linking
            const { data: originalPayment } = await supabaseAdmin
              .from("payments")
              .select("id")
              .eq("provider_payment_intent_id", paymentIntentId)
              .single();
            
            await supabaseAdmin.from("refunds").insert({
              payment_id: originalPayment?.id || null,
              reservation_id: reservationId || null,
              amount: charge.amount_refunded / 100,
              reason: "customer_request",
              status: "completed",
              provider_refund_id: charge.refunds?.data[0]?.id,
              description: "Refund processed via Stripe webhook",
              metadata: {
                ...metadata,
                original_charge_id: charge.id,
                payment_intent_id: paymentIntentId,
                refunded_user_id: userId
              }
            });

            await supabaseAdmin.from("payments").update({
              status: "refunded"
            }).eq("provider_payment_intent_id", paymentIntentId);
          }
          
          if (reservationId) {
            await supabaseAdmin.from("reservations").update({
              payment_status: "refunded",
              updated_at: new Date().toISOString()
            }).eq("id", reservationId);
          }
          break;
        }
        
        // Add more event types as needed
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      return new Response(JSON.stringify({ received: true }), { 
        status: 200,
        headers: { "Content-Type": "application/json" } 
      });
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  } catch (error) {
    console.error(`Error processing webhook: ${error}`);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Webhook Error: ${errorMessage}`, { status: 500 });
  }
});
