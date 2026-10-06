import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  FolderDown,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    cart,
    wishlist,
    user,
    logout,
    searchQuery,
    setSearchQuery,
    setIsCartDrawerOpen,
    categories
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'Telugu Flex', path: '/category/telugu-flex' },
    { label: 'Weddings', path: '/category/wedding' },
    { label: 'Festivals', path: '/category/festival' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">Festival Offer:</span>
              <span>Use coupon code <strong className="text-white">FIRST50</strong> for 20% off on your first PSD order!</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Instant Download · 300 DPI CMYK Print Ready</span>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark in display face */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/"
              className="text-2xl font-black tracking-tight text-slate-900 hover:text-amber-600 transition-colors font-display"
            >
              RScreation
            </Link>
          </div>

          {/* Zone 2: 4-6 nav links, 1-2 word labels, single line text */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors hover:text-slate-900 ${
                    isActive ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-1 -mb-1' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary action clusters */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Inline search or toggle button */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PSD designs..."
                className="w-full bg-slate-100/80 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Search templates"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/dashboard"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Saved items"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart trigger button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={`Cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                aria-label="User account menu"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline truncate max-w-[90px]">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
                        </span>
                      </div>

                      {user.role === 'admin' ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            Admin Console
                          </Link>
                          <Link
                            to="/admin/products"
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Package className="w-4 h-4 text-slate-500" />
                            Manage Products
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            My Dashboard
                          </Link>
                          <Link
                            to="/my-downloads"
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <FolderDown className="w-4 h-4 text-slate-500" />
                            My Downloads
                          </Link>
                          <Link
                            to="/my-orders"
                            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Package className="w-4 h-4 text-slate-500" />
                            My Orders
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Customer Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Create New Account
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link
                          to="/admin/login"
                          className="flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Telugu flex, wedding cards, festival PSDs..."
                autoFocus
                className="w-full bg-slate-100 border border-slate-300 text-sm rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>
        )}
      </div>

      {/* Secondary Quick Category Sub-Navigation Bar */}
      <div className="hidden md:block bg-slate-50 border-t border-slate-100 overflow-x-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs text-slate-600 whitespace-nowrap">
          <span className="font-semibold text-slate-900">Popular:</span>
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="hover:text-amber-700 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link to="/categories" className="text-amber-600 font-semibold hover:underline">
            View All ({categories.length}) →
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex gap-2">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
              >
                {user.role === 'admin' ? 'Admin Console' : 'My Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
