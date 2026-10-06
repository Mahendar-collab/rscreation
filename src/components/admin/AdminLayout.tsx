import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, login } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Area */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-display">RScreation</span>
            </div>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">Admin Management Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to store & Logout footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Go to Customer Store</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">Console Mode</span>
            <span aria-hidden="true">/</span>
            <span>{navItems.find((n) => n.path === location.pathname)?.label || 'Console'}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAdmin ? 'Super Admin (Supabase Authorized)' : 'Standard Account'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              RS
            </div>
          </div>
        </header>

        {/* Non-admin advisory banner */}
        {!isAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                To execute administrative writes to Supabase, your user ID must have the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950">admin</code> role in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950">public.user_roles</code>.
              </span>
            </div>
            <button
              onClick={() => login('admin@rscreation.in', 'Password@123', 'admin')}
              className="px-3 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700 shrink-0 transition-colors"
            >
              Switch to Demo Admin
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
