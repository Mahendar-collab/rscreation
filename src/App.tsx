import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { Toast } from './components/ui/Toast';

// Public & Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryListingPage } from './pages/CategoryListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyDownloadsPage } from './pages/MyDownloadsPage';

// Admin Suite Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { OrderManagementPage } from './pages/admin/OrderManagementPage';
import { CustomerManagementPage } from './pages/admin/CustomerManagementPage';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Wrapper for public / customer storefront pages
function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1E232A]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <ScrollToTop />
        <Toast />
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
          <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
          <Route path="/categories" element={<StorefrontLayout><CategoryListingPage /></StorefrontLayout>} />
          <Route path="/category/:slug" element={<StorefrontLayout><CategoryListingPage /></StorefrontLayout>} />
          <Route path="/product/:id" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
          <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
          <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
          <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />

          {/* Customer Portal Routes */}
          <Route path="/dashboard" element={<StorefrontLayout><CustomerDashboardPage /></StorefrontLayout>} />
          <Route path="/my-orders" element={<StorefrontLayout><MyOrdersPage /></StorefrontLayout>} />
          <Route path="/my-downloads" element={<StorefrontLayout><MyDownloadsPage /></StorefrontLayout>} />

          {/* Admin Management Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<ProductManagementPage />} />
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
          <Route path="/admin/orders" element={<OrderManagementPage />} />
          <Route path="/admin/customers" element={<CustomerManagementPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}
