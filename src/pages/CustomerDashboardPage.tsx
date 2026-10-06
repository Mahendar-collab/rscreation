import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderDown,
  ShoppingBag,
  Heart,
  User,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';

export const CustomerDashboardPage: React.FC = () => {
  const { user, orders, products, wishlist, logout, triggerDownload, downloadProgress } = useStore();

  const userOrders = orders.filter((o) => {
    if (user?.role === 'admin') return true;
    if (user?.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()) return true;
    if (user?.id && (o as any).user_id === user.id) return true;
    return false;
  });

  const purchasedProducts = products.filter(
    (p) => user?.purchasedProductIds?.includes(p.id)
  );

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-display font-black text-2xl">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                Welcome back, {user?.name || 'Designer'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                Verified Studio Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} · {user?.phone || '+91 98480 22334'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/my-downloads"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <FolderDown className="w-4 h-4" />
            <span>My Downloads ({purchasedProducts.length})</span>
          </Link>

          <button
            onClick={logout}
            className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stat Counters (Anti-slop clean typography, tabular numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
            <span>Available Downloads</span>
            <FolderDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
            {purchasedProducts.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Lifetime access</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
            {userOrders.length}
          </div>
          <span className="text-[11px] text-slate-500">Invoices available</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
            <span>Saved Wishlist</span>
            <Heart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
            {wishlist.length}
          </div>
          <span className="text-[11px] text-slate-500">Templates to buy</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
            <span>Total Investment</span>
            <span className="text-xs text-slate-400 font-bold">₹</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
            ₹{userOrders.reduce((sum, o) => sum + o.total, 0)}
          </div>
          <span className="text-[11px] text-slate-500">Commercial licenses</span>
        </div>
      </div>

      {/* Main Content: Downloads Shortcut & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Downloads Hub */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-amber-600" />
              <span>Ready-To-Download Resources</span>
            </h2>
            <Link to="/my-downloads" className="text-xs font-semibold text-amber-700 hover:underline">
              View all downloads →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {purchasedProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No purchases yet. Start by browsing our high-quality Telugu flex templates.
              </div>
            ) : (
              purchasedProducts.slice(0, 3).map((prod) => (
                <div key={prod.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {prod.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {prod.fileFormat} · {prod.fileSize} · {prod.colorMode}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerDownload(prod.id)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Orders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              <span>Recent Orders</span>
            </h2>
            <Link to="/my-orders" className="text-xs font-semibold text-slate-700 hover:underline">
              All Orders →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {userOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 font-mono">{order.orderNumber}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {order.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {order.createdAt} · {order.items.length} item(s) · {order.paymentMethod}
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-900 pt-1">
                  <span>Paid: ₹{order.total}</span>
                  <Link to="/my-orders" className="text-amber-700 text-xs hover:underline">
                    View receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Wishlist Section */}
      {wishlistedProducts.length > 0 && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Your Wishlist Templates ({wishlistedProducts.length})
            </h2>
            <Link to="/shop" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
              Add more to wishlist →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
