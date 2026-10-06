import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

// Standard HMAC-SHA256 signature verification using Web Crypto API
async function verifySignature(text: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(text));
  const hexSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexSignature.toLowerCase() === signature.trim().toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service credentials not configured.");
    }

    if (!razorpayKeySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured in Supabase Edge Function secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found in database." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Prevent duplicate processing if already completed
    if (order.status === "Completed" || order.status === "paid") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Order already confirmed and completed.",
          order,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify order ID matches database record
    if (order.razorpay_order_id && order.razorpay_order_id !== razorpayOrderId) {
      return new Response(
        JSON.stringify({ error: "Razorpay order ID mismatch with recorded order." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Verify Razorpay cryptographic HMAC-SHA256 signature
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const isValid = await verifySignature(payload, razorpaySignature, razorpayKeySecret);

    if (!isValid) {
      // Mark payment and order as failed in database
      await supabase
        .from("payments")
        .update({ status: "failed", gateway_payment_id: razorpayPaymentId })
        .eq("gateway_order_id", razorpayOrderId);

      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ error: "Invalid Razorpay payment signature. Verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Atomically capture payment and update order status via stored procedure
    const { error: captureError } = await supabase.rpc(
      "verify_and_capture_payment",
      {
        p_order_id: orderId,
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId,
        p_razorpay_signature: razorpaySignature,
        p_amount: order.total,
        p_currency: "INR",
      }
    );

    if (captureError) {
      console.warn("RPC verify_and_capture_payment note:", captureError.message);
      // Fallback: direct atomic update
      await supabase
        .from("orders")
        .update({
          status: "Completed",
          transaction_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          payment_method: "Razorpay (INR)",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      await supabase
        .from("payments")
        .update({
          status: "captured",
          gateway_payment_id: razorpayPaymentId,
          gateway_signature: razorpaySignature,
        })
        .eq("order_id", orderId);
    }

    // Fetch updated order with items
    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment successfully verified and captured.",
        order: updatedOrder || order,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Payment verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
