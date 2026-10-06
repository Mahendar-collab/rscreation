import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Download, Sparkles, Headphones, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { categories } = useStore();

  return (
    <footer className="bg-[#111827] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Instant Download</h4>
              <p className="text-xs text-slate-400">Direct PSD & font links immediately</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Layered PSD</h4>
              <p className="text-xs text-slate-400">Organized folders & 300 DPI CMYK</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Telugu Font Support</h4>
              <p className="text-xs text-slate-400">Unicode & Anu Script typography</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Designer Support</h4>
              <p className="text-xs text-slate-400">Technical help via WhatsApp & call</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-black text-white font-display tracking-tight">
              RScreation
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Creative Designs. Unlimited Possibilities. India&apos;s trusted digital marketplace for Telugu flex banner PSD templates, royal wedding cards, festival posters, and commercial signage designs.
            </p>
            <div className="pt-2">
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Customer Helpline:</span> +91 98480 22334 (10 AM - 8 PM IST)
              </div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="font-semibold text-slate-200">Email:</span> support@rscreation.in
              </div>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Top Categories
            </h5>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Hub
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop" className="hover:text-amber-400 transition-colors">
                  All PSD Templates
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/my-downloads" className="hover:text-amber-400 transition-colors">
                  My Downloads
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-amber-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Portal
                </Link>
              </li>
              <li>
                <a
                  href="/rscreation-project.zip"
                  download="rscreation-project.zip"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 pt-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Source Code (ZIP)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Digital License & Policies */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Licensing & Trust
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Commercial Print License</li>
              <li>Standard Studio Rights</li>
              <li>Terms of Digital Purchase</li>
              <li>Privacy & Data Security</li>
              <li>Zero Piracy Commitment</li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-slate-800/70 border border-slate-700/50 text-[11px] text-slate-400">
              Accepted Payments: UPI, PhonePe, Google Pay, RuPay, NetBanking & Cards.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RScreation. All rights reserved. Built for professional graphic designers & studios.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Photoshop CS6 / CC Compatible</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">CMYK Print Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
