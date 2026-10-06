-- ==============================================================================
-- RSCREATION - PHASE 3.1: UNLIMITED DOWNLOADS & PAYMENT AUDIT FIX
-- Project: RScreation (zticcsbyrejkctqwvzur)
-- Description: Updates log_and_verify_download to allow unlimited downloads
--              for legitimate paid customers, while maintaining audit logs.
-- ==============================================================================

-- 1. Update log_and_verify_download stored procedure
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

  -- 3. Increment download counter for analytics (Paid customers have unlimited lifetime access)
  UPDATE public.order_items
  SET download_count = download_count + 1
  WHERE id = p_order_item_id;

  -- 4. Log download audit record
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
    'download_count', v_item.download_count + 1,
    'unlimited_downloads', true
  );
END;
$$;

-- 2. Ensure orders table has razorpay_order_id and index
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
  ON public.orders(razorpay_order_id);

-- 3. Ensure payments table has gateway_signature
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS gateway_signature TEXT;
