import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Layers,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, customers, categories, updateOrderStatus } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const activeProducts = products.filter((p) => p.status === 'active').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Title & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Store Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live performance overview, orders processing, and digital asset metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Gross Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              Across {orders.length} digital transactions
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Catalog Templates</span>
              <Package className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
              {products.length}
            </div>
            <p className="text-[11px] text-slate-500">
              {activeProducts} Active · {categories.length} Categories
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
              {orders.length}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              {completedOrders} Delivered instantly
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Registered Designers</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums font-display">
              {customers.length}
            </div>
            <p className="text-[11px] text-slate-500">
              Studio owners & printers
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant digital downloads delivered to customer accounts.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              View all orders ({orders.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Order Ref</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800">{order.items.length} file(s)</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {order.items.map((i) => i.title).join(', ')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                      ₹{order.total}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {order.status !== 'Completed' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Completed')}
                          className="text-xs text-emerald-700 hover:underline font-semibold"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Fulfilled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/admin/products"
            className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group"
          >
            <Package className="w-6 h-6 text-slate-700 group-hover:text-amber-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Product Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add new Telugu flex templates, modify pricing, upload preview covers and tags.
            </p>
          </Link>

          <Link
            to="/admin/categories"
            className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group"
          >
            <Layers className="w-6 h-6 text-slate-700 group-hover:text-amber-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Category Organization</h3>
            <p className="text-xs text-slate-500 mt-1">
              Organize categories for wedding cards, political flex, shop boards and birthdays.
            </p>
          </Link>

          <Link
            to="/admin/customers"
            className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group"
          >
            <Users className="w-6 h-6 text-slate-700 group-hover:text-amber-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Customer Directory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect registered studios, order volumes, spend analytics, and support status.
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};
