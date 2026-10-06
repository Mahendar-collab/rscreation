import { supabase } from './supabase';
import { Order } from '../types';

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  order?: Order;
  message?: string;
  error?: string;
}

export interface DownloadUrlResponse {
  success: boolean;
  downloadUrl?: string;
  licenseKey?: string;
  downloadCount?: number;
  unlimitedDownloads?: boolean;
  remainingDownloads?: number;
  totalAllowedDownloads?: number;
  error?: string;
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => {
        resolve(Boolean((window as any).Razorpay));
      }, 1500);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const LEGACY_PRODUCT_MAP: Record<string, string> = {
  'prod-001': 'd0000000-0000-0000-0000-000000000001',
  'prod-002': 'd0000000-0000-0000-0000-000000000002',
  'prod-003': 'd0000000-0000-0000-0000-000000000003',
  'prod-004': 'd0000000-0000-0000-0000-000000000004',
  'prod-005': 'd0000000-0000-0000-0000-000000000005',
  'prod-006': 'd0000000-0000-0000-0000-000000000006',
};

/**
 * 1. Step 1: Create Payment Order via Supabase Edge Function
 * Backend retrieves live prices from DB, validates coupons, and creates official Razorpay Order.
 */
export const createPaymentOrder = async (
  items: { productId: string; quantity: number }[],
  customer: CheckoutCustomer,
  couponCode?: string
): Promise<CreateOrderResponse> => {
  // Consolidate duplicate products and map legacy IDs to authentic database UUIDs
  const quantityMap = new Map<string, number>();
  for (const it of items) {
    const rawId = String(it.productId || '').trim();
    const pid = LEGACY_PRODUCT_MAP[rawId] || rawId;
    const qty = Math.max(1, it.quantity || 1);
    quantityMap.set(pid, (quantityMap.get(pid) || 0) + qty);
  }

  const sanitizedItems = Array.from(quantityMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  try {
    const { data, error } = await supabase.functions.invoke('create-payment-order', {
      body: {
        items: sanitizedItems,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        couponCode: couponCode || null,
      },
    });

    if (error) {
      let detailedMsg = error.message;
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          if (body?.error) detailedMsg = body.error;
        }
      } catch {
        // ignore parse error
      }

      console.error('create-payment-order Edge Function error:', detailedMsg);
      return {
        success: false,
        orderId: '',
        orderNumber: '',
        razorpayOrderId: '',
        amount: 0,
        amountInPaise: 0,
        currency: 'INR',
        keyId: '',
        error: detailedMsg || 'Failed to create payment order.',
      };
    }

    if (data && data.success) {
      return data;
    }

    return {
      success: false,
      orderId: '',
      orderNumber: '',
      razorpayOrderId: '',
      amount: 0,
      amountInPaise: 0,
      currency: 'INR',
      keyId: '',
      error: data?.error || 'Order creation returned unsuccessful.',
    };
  } catch (err: any) {
    console.error('Error invoking create-payment-order:', err);
    return {
      success: false,
      orderId: '',
      orderNumber: '',
      razorpayOrderId: '',
      amount: 0,
      amountInPaise: 0,
      currency: 'INR',
      keyId: '',
      error: err.message || 'Unable to connect to payment order service.',
    };
  }
};

/**
 * 2. Step 2: Verify Payment via Supabase Edge Function
 * Verifies cryptographic HMAC-SHA256 signature server-side and atomically captures payment.
 */
export const verifyPayment = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<VerifyPaymentResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    if (error) {
      let detailedMsg = error.message;
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          if (body?.error) detailedMsg = body.error;
        }
      } catch {
        // ignore parse error
      }

      console.error('verify-payment Edge Function error:', detailedMsg);
      return {
        success: false,
        error: detailedMsg || 'Payment signature verification failed on server.',
      };
    }

    if (data && data.success) {
      return data;
    }

    return {
      success: false,
      error: data?.error || 'Payment verification could not be validated.',
    };
  } catch (err: any) {
    console.error('Error invoking verify-payment:', err);
    return {
      success: false,
      error: err.message || 'Payment verification service unreachable.',
    };
  }
};

/**
 * 3. Step 3: Secure Digital File Delivery via generate-download-url Edge Function
 * Verifies verified order payment and generates a short-lived signed URL (300s).
 */
export const requestDownloadUrl = async (
  orderItemId: string,
  productId?: string,
  customerEmail?: string
): Promise<DownloadUrlResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-download-url', {
      body: {
        orderItemId,
        productId,
        customerEmail,
      },
    });

    if (error) {
      let detailedMsg = error.message;
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          if (body?.error) detailedMsg = body.error;
        }
      } catch {
        // ignore parse error
      }

      return {
        success: false,
        error: detailedMsg || 'Failed to generate download URL.',
      };
    }

    if (data && data.success) {
      return data;
    }

    return {
      success: false,
      error: data?.error || 'Download request was not approved.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Download service unavailable.',
    };
  }
};
