import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

async function verifyWebhookSignature(bodyText: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
  const hexSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexSignature.toLowerCase() === signature.toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service credentials missing.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // 1. Verify webhook signature
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    // 2. Handle payment.captured event
    if (eventType === "payment.captured" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;
      const currency = paymentEntity.currency || "INR";

      // Find corresponding order in database
      const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order) {
        // Idempotency check: don't process if already captured
        if (order.status !== "Completed" && order.status !== "paid") {
          await supabase.rpc("verify_and_capture_payment", {
            p_order_id: order.id,
            p_razorpay_order_id: razorpayOrderId,
            p_razorpay_payment_id: razorpayPaymentId,
            p_razorpay_signature: signature || "WEBHOOK_VERIFIED",
            p_amount: amount,
            p_currency: currency,
          });
        }
      }
    }

    // 3. Handle payment.failed event
    if (eventType === "payment.failed" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      if (razorpayOrderId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            gateway_payment_id: paymentEntity.id,
            raw_response: paymentEntity,
          })
          .eq("gateway_order_id", razorpayOrderId);

        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("razorpay_order_id", razorpayOrderId)
          .neq("status", "Completed");
      }
    }

    return new Response(
      JSON.stringify({ status: "success", receivedEvent: eventType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
