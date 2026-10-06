import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials missing.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate the customer
    let userId: string | null = null;
    let isAdmin = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
          const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
          if (roleRow?.role === "admin") {
            isAdmin = true;
          }
        }
      } catch {
        // Guest user
      }
    }

    const body = await req.json();
    const { orderItemId, productId, customerEmail } = body;

    if (!orderItemId && !productId) {
      return new Response(
        JSON.stringify({ error: "Missing order item or product reference." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch order item and its parent order
    let query = supabase
      .from("order_items")
      .select("*, order:orders(*)");

    if (orderItemId) {
      query = query.eq("id", orderItemId);
    } else if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: item, error: itemError } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: "No purchased record found for this product." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = item.order;
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order details missing." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify order payment status
    if (order.status !== "Completed" && order.status !== "paid") {
      return new Response(
        JSON.stringify({ error: `Payment not verified for this order. Status: ${order.status}` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Verify ownership
    const isOwner =
      isAdmin ||
      (userId && order.user_id && order.user_id === userId) ||
      (customerEmail && order.customer_email?.toLowerCase().trim() === customerEmail.toLowerCase().trim());

    if (!isOwner && order.user_id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access: You do not own this order." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Log and increment download count for analytics
    // Note: Business rule guarantees paid customers have unlimited downloads. We DO NOT block.
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    try {
      await supabase.rpc("log_and_verify_download", {
        p_order_item_id: item.id,
        p_user_id: userId,
        p_ip_address: ip,
        p_user_agent: userAgent,
      });
    } catch (e) {
      console.warn("Audit download log note:", e);
      // Fallback increment directly
      await supabase
        .from("order_items")
        .update({ download_count: (item.download_count || 0) + 1 })
        .eq("id", item.id);
    }

    // 6. Find physical storage file path in product_files or storage
    let storagePath = `templates/${item.product_id || "rscreation"}.zip`;
    const { data: fileRow } = await supabase
      .from("product_files")
      .select("storage_path")
      .eq("product_id", item.product_id)
      .maybeSingle();

    if (fileRow?.storage_path) {
      storagePath = fileRow.storage_path;
    }

    // 7. Generate short-lived signed URL (300 seconds / 5 minutes) from private digital-products bucket
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from("digital-products")
      .createSignedUrl(storagePath, 300);

    if (signError) {
      console.warn("Storage sign note:", signError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signedUrlData?.signedUrl || null,
        expiresInSeconds: 300,
        licenseKey: item.license_key || `RSC-LIC-${item.id.substring(0, 8).toUpperCase()}`,
        productTitle: item.product_title,
        fileFormat: item.file_format,
        fileSize: item.file_size,
        downloadCount: (item.download_count || 0) + 1,
        unlimitedDownloads: true,
        message: "Signed download URL generated successfully.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("generate-download-url error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate download URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
