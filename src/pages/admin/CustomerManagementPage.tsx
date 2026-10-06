import React, { useState } from 'react';
import { Users, Search, Mail, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const CustomerManagementPage: React.FC = () => {
  const { customers, updateCustomerStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Customer Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Studio designers, printing press owners, and freelance creatives across India.
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
            Total Registered: <strong className="text-slate-900 tabular-nums">{customers.length}</strong>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, or phone..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Customer / Studio</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Orders Placed</th>
                  <th className="px-5 py-3.5">Lifetime Spend</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{cust.name}</div>
                          <span className="text-[11px] text-slate-400">{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-800 font-medium">{cust.email}</div>
                      <div className="text-[11px] text-slate-400">{cust.phone}</div>
                    </td>
                    <td className="px-5 py-4 tabular-nums font-semibold text-slate-800">
                      {cust.ordersCount} orders
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 tabular-nums">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-500">
                      {cust.joinedDate}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          updateCustomerStatus(
                            cust.id,
                            cust.status === 'Active' ? 'Inactive' : 'Active'
                          )
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {cust.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
