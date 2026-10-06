import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Check,
  Tag,
  Zap,
  Download,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
  FileCheck
} from 'lucide-react';
import { useStore, LEGACY_PRODUCT_MAP } from '../context/StoreContext';
import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
  CreateOrderResponse
} from '../lib/paymentService';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    showToast,
    user,
    triggerDownload,
    refreshData
  } = useStore();

  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe / GPay / Paytm)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Razorpay order session
  const [activeSession, setActiveSession] = useState<CreateOrderResponse | null>(null);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  /**
   * Main Checkout flow:
   * 1. Validate customer inputs
   * 2. Backend retrieves current prices from Supabase & creates pending order
   * 3. Supabase Edge Function creates Razorpay order
   * 4. Open Razorpay Checkout modal
   * 5. Verify payment signature on backend
   * 6. Mark order as paid and unlock digital downloads
   */
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerEmail.trim() || !customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please fill in your name, email, and WhatsApp phone number.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Connecting to secure payment gateway...');

    try {
      // 1. Create order on backend via Edge Function
      const quantityMap = new Map<string, number>();
      for (const i of cart) {
        const pid = LEGACY_PRODUCT_MAP[i.product.id] || i.product.id;
        quantityMap.set(pid, (quantityMap.get(pid) || 0) + (i.quantity || 1));
      }
      const cartItems = Array.from(quantityMap.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const orderSession = await createPaymentOrder(
        cartItems,
        {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        appliedCoupon?.code
      );

      if (!orderSession.success || !orderSession.orderId) {
        throw new Error(orderSession.error || 'Failed to initialize payment order');
      }

      setActiveSession(orderSession);

      // 2. Load Razorpay Checkout SDK
      setProcessingStatus('Launching official Razorpay Checkout...');
      const isScriptLoaded = await loadRazorpayScript();

      const keyId = orderSession.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId || keyId.includes('YourTestKeyId')) {
        throw new Error(
          'Razorpay is not configured. Please configure VITE_RAZORPAY_KEY_ID.'
        );
      }

      if (!isScriptLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK is not loaded. Please verify your connection.');
      }

      // 3. Launch official Razorpay Checkout popup
      const rzpOptions = {
        key: keyId,
        amount: orderSession.amountInPaise,
        currency: orderSession.currency || 'INR',
        name: 'RScreation',
        description: `Order ${orderSession.orderNumber} - Digital Design Resources`,
        image: 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/brand-assets/logo.png',
        order_id: orderSession.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#f59e0b',
        },
        handler: async (response: any) => {
          await handlePaymentSuccess(
            orderSession,
            response.razorpay_payment_id,
            response.razorpay_order_id || orderSession.razorpayOrderId,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setProcessingStatus('');
            showToast('Payment window closed');
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (resp: any) => {
        console.error('Razorpay payment failed:', resp.error);
        setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsProcessing(false);
        setProcessingStatus('');
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Unable to proceed to payment. Please try again.');
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Verified payment handler:
   * Sends signature to backend verify-payment Edge Function
   */
  const handlePaymentSuccess = async (
    session: CreateOrderResponse,
    paymentId: string,
    razorpayOrderId: string,
    signature: string
  ) => {
    setIsProcessing(true);
    setProcessingStatus('Verifying payment signature with server...');

    try {
      const verifyRes = await verifyPayment(
        session.orderId,
        razorpayOrderId,
        paymentId,
        signature
      );

      if (!verifyRes.success) {
        throw new Error(verifyRes.error || 'Payment signature verification failed on server');
      }

      // Synchronize database orders and purchased files
      try {
        await refreshData();
      } catch (e) {
        console.warn('Sync refresh note:', e);
      }

      // Build completed order view
      const finalizedOrder = {
        id: session.orderId,
        orderNumber: session.orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          fileFormat: item.product.fileFormat,
          fileSize: item.product.fileSize,
          image: item.product.image,
          licenseKey: `RSC-LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        total: session.amount,
        status: 'Completed',
        paymentMethod: `Razorpay (${paymentMethod})`,
        transactionId: paymentId,
        createdAt: new Date().toLocaleString(),
      };

      clearCart();
      removeCoupon();
      setOrderCompleted(finalizedOrder);
      showToast(`Payment successful! Order ${session.orderNumber} confirmed.`);
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setErrorMessage(err.message || 'Payment verification failed on server');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Order Confirmed State
  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Payment Verified · Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Order Reference: <strong className="text-slate-900 font-mono">{orderCompleted.orderNumber}</strong> · 
            Transaction ID: <span className="font-mono text-slate-700">{orderCompleted.transactionId}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-100 text-xs gap-2">
            <span className="text-slate-500">
              Payment Gateway: <strong className="text-slate-900">{orderCompleted.paymentMethod}</strong>
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Instant Digital Download Ready
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Unlocked Graphic Design Resources ({orderCompleted.items.length})
            </h4>
            {orderCompleted.items.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                    />
                  )}
                  <div>
                    <h5 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h5>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.fileFormat} · {item.fileSize} · License: <span className="font-mono font-medium text-slate-800">{item.licenseKey || 'RSC-COMMERCIAL'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerDownload(item.productId)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download PSD</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100">
            <span>Total Paid</span>
            <span className="tabular-nums text-base">₹{orderCompleted.total}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/my-downloads')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Go to My Downloads Hub</span>
          </button>

          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-8 h-8 stroke-1" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-display">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          You haven&apos;t added any PSD templates yet. Explore our Telugu flex, wedding card, or festival collections.
        </p>
        <div className="pt-4">
          <Link
            to="/shop"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <span>Browse Templates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
          Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your items, apply promotional discount coupons, and proceed to instant digital delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-5 flex gap-4 items-center">
                <Link to={`/product/${product.id}`} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-amber-700 font-medium">
                    {product.category}
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                  >
                    {product.title}
                  </Link>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {product.fileFormat} · {product.fileSize} · {product.dpi} DPI
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold text-slate-900 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                          ₹{product.price * quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Have A Coupon Code?</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">
                    Coupon &ldquo;{appliedCoupon.code}&rdquo; Applied ({appliedCoupon.discountPercent}% Discount)
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code: FIRST50 or FESTIVAL"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            <div className="text-[11px] text-slate-400 mt-2">
              Tip: Use promo code <strong>FIRST50</strong> for 20% off or <strong>FESTIVAL</strong> for 15% off.
            </div>
          </div>
        </div>

        {/* Order Summary & Customer Checkout Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Checkout & Delivery Details
          </h2>

          {/* Form */}
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Full Name / Studio Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Reddy"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400">Download links sent here</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98480 12345"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Preferred Payment Channel
              </label>
              <div className="grid grid-cols-1 gap-2">
                {['UPI (PhonePe / GPay / Paytm)', 'Credit / Debit Card (RuPay / Visa)', 'NetBanking (All Major Banks)'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      paymentMethod === method
                        ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-slate-900"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="tabular-nums font-semibold text-slate-800">₹{cartSubtotal}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">-₹{cartDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Digital Delivery</span>
                <span className="text-emerald-700 font-semibold">FREE (Instant)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="tabular-nums text-xl font-display">₹{cartTotal}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                <span className="font-semibold">{processingStatus || 'Connecting to Razorpay gateway...'}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Pay with Razorpay · ₹{cartTotal}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified · 256-bit encrypted checkout</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
