-- ==============================================================================
-- RSCREATION - PHASE 3: PAYMENT & SECURE DOWNLOADS SCHEMA ENHANCEMENT
-- Project: RScreation (zticcsbyrejkctqwvzur)
-- Description: Adds Razorpay order tracking, flexible order/payment statuses,
--              atomic verification functions, and secure download decrementing.
-- ==============================================================================

-- 1. Extend orders status constraint to support complete payment lifecycle
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'paid', 'Completed', 'Processing', 'failed', 'cancelled', 'refunded'));

-- 2. Add razorpay_order_id to orders table if not exists
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create index for quick lookups on razorpay_order_id
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
  ON public.orders(razorpay_order_id);

-- 3. Extend payments table columns and constraints
ALTER TABLE public.payments 
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments 
  ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded'));

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS gateway_signature TEXT;

-- 4. Atomic verification function: verify_and_capture_payment
-- Called by verify-payment or webhook Edge Function
CREATE OR REPLACE FUNCTION public.verify_and_capture_payment(
  p_order_id UUID,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'INR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_payment_id UUID;
BEGIN
  -- 1. Check order existence and status
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Prevent duplicate capture
  IF v_order.status IN ('paid', 'Completed') THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already paid', 'order_id', v_order.id, 'status', v_order.status);
  END IF;

  -- 2. Update or insert payment record
  SELECT id INTO v_payment_id
  FROM public.payments
  WHERE order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_payment_id IS NOT NULL THEN
    UPDATE public.payments
    SET
      status = 'captured',
      gateway_payment_id = p_razorpay_payment_id,
      gateway_order_id = p_razorpay_order_id,
      gateway_signature = p_razorpay_signature,
      amount = COALESCE(p_amount, v_order.total),
      currency = p_currency
    WHERE id = v_payment_id;
  ELSE
    INSERT INTO public.payments (
      order_id,
      amount,
      currency,
      payment_gateway,
      gateway_order_id,
      gateway_payment_id,
      gateway_signature,
      status
    ) VALUES (
      p_order_id,
      COALESCE(p_amount, v_order.total),
      p_currency,
      'Razorpay',
      p_razorpay_order_id,
      p_razorpay_payment_id,
      p_razorpay_signature,
      'captured'
    ) RETURNING id INTO v_payment_id;
  END IF;

  -- 3. Atomically update order status to paid / Completed
  UPDATE public.orders
  SET
    status = 'Completed', -- Compatible with existing UI and download rules
    payment_method = 'Razorpay (' || p_currency || ')',
    transaction_id = p_razorpay_payment_id,
    razorpay_order_id = p_razorpay_order_id,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'payment_id', v_payment_id,
    'status', 'Completed'
  );
END;
$$;

-- 5. Atomic download logging and verification function
CREATE OR REPLACE FUNCTION public.log_and_verify_download(
  p_order_item_id UUID,
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_order RECORD;
BEGIN
  -- 1. Fetch order item
  SELECT * INTO v_item
  FROM public.order_items
  WHERE id = p_order_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order item not found');
  END IF;

  -- 2. Verify order status and ownership
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = v_item.order_id;

  IF v_order.status NOT IN ('paid', 'Completed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not verified for this order');
  END IF;

  IF v_order.user_id IS NOT NULL AND p_user_id IS NOT NULL AND v_order.user_id <> p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized access to this order');
  END IF;

  -- 3. Check download limit
  IF v_item.download_count >= v_item.max_downloads THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum download limit reached (' || v_item.max_downloads || ' downloads)');
  END IF;

  -- 4. Increment download count
  UPDATE public.order_items
  SET download_count = download_count + 1
  WHERE id = p_order_item_id;

  -- 5. Log download entry
  INSERT INTO public.download_logs (
    order_item_id,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_order_item_id,
    p_user_id,
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'success', true,
    'product_id', v_item.product_id,
    'product_title', v_item.product_title,
    'remaining_downloads', (v_item.max_downloads - (v_item.download_count + 1)),
    'download_count', v_item.download_count + 1,
    'max_downloads', v_item.max_downloads
  );
END;
$$;
