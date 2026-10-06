import React, { useState } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle2, Clock, X, Download, Filter } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Order } from '../../types';

export const OrderManagementPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Order Transactions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage all customer purchases and digital license grants.
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
            Total Sales: <strong className="text-slate-900 tabular-nums">₹{orders.reduce((s, o) => s + o.total, 0)}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order #, customer name, email..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total (₹)</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-500">
                      {order.createdAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {order.items.length} product(s)
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                      ₹{order.total}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-600">
                      {order.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value as 'Completed' | 'Processing' | 'Cancelled'
                          )
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                          order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <option value="Completed">Completed</option>
                        <option value="Processing">Processing</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setInspectOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Order Details
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {inspectOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Customer
                </span>
                <span className="font-semibold text-slate-900 block">{inspectOrder.customerName}</span>
                <span className="text-slate-600 block">{inspectOrder.customerEmail}</span>
                <span className="text-slate-600 block">{inspectOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Payment & Transaction
                </span>
                <span className="font-semibold text-slate-900 block">{inspectOrder.paymentMethod}</span>
                <span className="text-slate-600 font-mono block text-[11px]">{inspectOrder.transactionId}</span>
                <span className="text-slate-500 block text-[11px]">{inspectOrder.createdAt}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Order Items ({inspectOrder.items.length})
              </h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {inspectOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{it.title}</p>
                      <span className="text-[11px] text-slate-400">
                        {it.fileFormat} · {it.fileSize}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">₹{it.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Received</span>
              <span className="text-base tabular-nums">₹{inspectOrder.total}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
