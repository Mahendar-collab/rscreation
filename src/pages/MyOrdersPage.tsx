import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Download, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MyOrdersPage: React.FC = () => {
  const { orders, user, showToast } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const userOrders = orders.filter((o) => {
    if (user?.role === 'admin') return true;
    if (user?.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()) return true;
    if (user?.id && (o as any).user_id === user.id) return true;
    return false;
  });

  const handleDownloadInvoice = (order: any) => {
    const invoiceText = `=====================================\n           RSCREATION\n   Digital Graphic Design Marketplace\n   Website: rscreation.in\n=====================================\nINVOICE #${order.orderNumber}\nDate: ${order.createdAt}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nPhone: ${order.customerPhone}\nTransaction ID: ${order.transactionId}\nPayment Method: ${order.paymentMethod}\nStatus: ${order.status}\n-------------------------------------\nITEMS PURCHASED:\n${order.items.map((i: any, idx: number) => `${idx + 1}. ${i.title} (${i.fileFormat} - ${i.fileSize}) - ₹${i.price}`).join('\n')}\n-------------------------------------\nSubtotal: ₹${order.subtotal}\nDiscount: -₹${order.discount}\nTOTAL PAID: ₹${order.total}\n=====================================\nThank you for choosing RScreation!\nQuestions? support@rscreation.in\n`;
    
    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Invoice ${order.orderNumber} downloaded`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Dashboard</span>
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-slate-800">My Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Order History & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track all your past digital purchases, receipts, and licensed templates.
          </p>
        </div>

        <Link
          to="/shop"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start"
        >
          Explore More Templates
        </Link>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our Telugu flex banner PSDs and festive invitation cards to make your first purchase.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Order Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Order Placed
                    </span>
                    <span className="font-semibold text-slate-800">{order.createdAt}</span>
                  </div>
                  <div className="hidden sm:block border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Order Reference
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{order.orderNumber}</span>
                  </div>
                  <div className="hidden sm:block border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Payment
                    </span>
                    <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                      order.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status === 'Completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{order.status}</span>
                  </span>

                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    title="Download invoice receipt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Invoice</span>
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.fileFormat} · {item.fileSize} · Single Studio Commercial License
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        ₹{item.price}
                      </div>
                      <Link
                        to="/my-downloads"
                        className="text-xs font-semibold text-amber-700 hover:underline mt-1 inline-block"
                      >
                        Download Files →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Transaction Ref: <strong className="font-mono text-slate-800">{order.transactionId}</strong></span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  Total Paid: ₹{order.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
