import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

// Known legacy ID mapping to authentic database product UUIDs
const LEGACY_ID_MAP: Record<string, string> = {
  "prod-001": "d0000000-0000-0000-0000-000000000001",
  "prod-002": "d0000000-0000-0000-0000-000000000002",
  "prod-003": "d0000000-0000-0000-0000-000000000003",
  "prod-004": "d0000000-0000-0000-0000-000000000004",
  "prod-005": "d0000000-0000-0000-0000-000000000005",
  "prod-006": "d0000000-0000-0000-0000-000000000006",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are missing in environment.");
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured in Supabase Edge Function secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional user authentication via Bearer token
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      } catch {
        // Guest checkout or anonymous token
      }
    }

    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return new Response(
        JSON.stringify({ error: "Customer name, email, and phone number are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Normalize product IDs to valid UUIDs and consolidate quantities
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Map legacy IDs and group identical items
    const consolidatedQuantityMap = new Map<string, number>();
    for (const item of items) {
      const rawId = String(item.productId || "").trim();
      const mappedId = LEGACY_ID_MAP[rawId] || rawId;
      const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));
      consolidatedQuantityMap.set(mappedId, (consolidatedQuantityMap.get(mappedId) || 0) + qty);
    }

    const distinctProductIds = Array.from(consolidatedQuantityMap.keys());
    const uuidIds = distinctProductIds.filter((id) => uuidRegex.test(id));
    const nonUuidIds = distinctProductIds.filter((id) => !uuidRegex.test(id));

    // Diagnostic logging (Safe: never logs secrets, keys, or credentials)
    console.log("[create-payment-order] Requested distinct product IDs:", distinctProductIds);

    // 2. Fetch authoritative products directly from the database
    const dbProducts: any[] = [];

    if (uuidIds.length > 0) {
      const { data: byId, error: idErr } = await supabase
        .from("products")
        .select("id, title, slug, price, file_format, file_size, preview_image_url, status")
        .in("id", uuidIds);
      if (idErr) {
        console.error("[create-payment-order] Database error querying by UUID:", idErr.message);
      } else if (byId) {
        dbProducts.push(...byId);
      }
    }

    if (nonUuidIds.length > 0) {
      const { data: bySlug, error: slugErr } = await supabase
        .from("products")
        .select("id, title, slug, price, file_format, file_size, preview_image_url, status")
        .in("slug", nonUuidIds);
      if (slugErr) {
        console.error("[create-payment-order] Database error querying by slug:", slugErr.message);
      } else if (bySlug) {
        dbProducts.push(...bySlug);
      }
    }

    const foundIds = dbProducts.map((p) => p.id);
    const foundSlugs = dbProducts.map((p) => p.slug);
    const missingIds = distinctProductIds.filter(
      (id) => !foundIds.includes(id) && !foundSlugs.includes(id)
    );

    console.log("[create-payment-order] Database found product IDs:", foundIds);
    if (missingIds.length > 0) {
      console.log("[create-payment-order] Database missing product IDs:", missingIds);
    }

    // Reject unknown products with clear details
    if (missingIds.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Product not found in database: ${missingIds.join(", ")}`,
          missingProductIds: missingIds,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (dbProducts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to validate product prices in database. Ensure database products exist." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Calculate subtotal server-side strictly from database prices (Never trust client prices)
    let calculatedSubtotal = 0;
    const validatedOrderItems: any[] = [];

    for (const [pid, quantity] of consolidatedQuantityMap.entries()) {
      const dbProd = dbProducts.find((p) => p.id === pid || p.slug === pid);
      if (!dbProd) {
        return new Response(
          JSON.stringify({ error: `Product not found in catalog: ${pid}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const unitPrice = Number(dbProd.price);
      calculatedSubtotal += unitPrice * quantity;

      validatedOrderItems.push({
        productId: dbProd.id,
        title: dbProd.title,
        price: unitPrice,
        fileFormat: dbProd.file_format || "PSD",
        fileSize: dbProd.file_size || "150 MB",
        previewImageUrl: dbProd.preview_image_url || "",
        quantity,
      });
    }

    // 4. Validate coupon eligibility
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const discountPercent = Number(coupon.discount_percent || 0);
        const rawDiscount = (calculatedSubtotal * discountPercent) / 100;
        discountAmount = coupon.max_discount_amount
          ? Math.min(rawDiscount, Number(coupon.max_discount_amount))
          : rawDiscount;
      }
    }

    const calculatedTotal = Math.max(0, Math.round(calculatedSubtotal - discountAmount));
    const amountInPaise = calculatedTotal * 100;

    // 5. Create pending Order in database
    const orderNumber = `RSC-${Math.floor(10000 + Math.random() * 90000)}`;
    const { data: newOrder, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId && uuidRegex.test(userId) ? userId : null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        total: calculatedTotal,
        status: "pending",
        payment_method: "Razorpay (Test Mode)",
        transaction_id: "PENDING",
        coupon_code: couponCode || null,
      })
      .select()
      .single();

    if (orderInsertError || !newOrder) {
      throw new Error(`Failed to create order in database: ${orderInsertError?.message}`);
    }

    // 6. Insert order items
    const orderItemRows = validatedOrderItems.map((vItem) => ({
      order_id: newOrder.id,
      product_id: uuidRegex.test(vItem.productId) ? vItem.productId : null,
      product_title: vItem.title,
      price: vItem.price,
      file_format: vItem.fileFormat,
      file_size: vItem.fileSize,
      preview_image_url: vItem.previewImageUrl,
      download_count: 0,
      max_downloads: 15,
      license_key: `RSC-LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemRows);
    if (itemsError) {
      console.warn("Notice: order_items insertion detail:", itemsError.message);
    }

    // 7. Call Razorpay API to create official order
    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.max(100, amountInPaise), // Razorpay requires minimum 100 paise (₹1)
        currency: "INR",
        receipt: orderNumber,
        notes: {
          app_order_id: newOrder.id,
          customer_email: customerEmail,
        },
      }),
    });

    if (!rzpRes.ok) {
      const errorDetail = await rzpRes.text();
      console.error("Razorpay API error:", errorDetail);
      throw new Error(`Razorpay API order creation failed (${rzpRes.status}): ${errorDetail}`);
    }

    const rzpData = await rzpRes.json();
    const razorpayOrderId = rzpData.id;

    // 8. Update order with official razorpay_order_id
    await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrderId })
      .eq("id", newOrder.id);

    // 9. Create payment entry with status 'created'
    await supabase.from("payments").insert({
      order_id: newOrder.id,
      amount: calculatedTotal,
      currency: "INR",
      payment_gateway: "Razorpay",
      gateway_order_id: razorpayOrderId,
      status: "created",
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: newOrder.id,
        orderNumber: newOrder.order_number,
        razorpayOrderId,
        amount: calculatedTotal,
        amountInPaise,
        currency: "INR",
        keyId: razorpayKeyId,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-payment-order error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create payment order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
