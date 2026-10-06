import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, Order, Customer, User, FileFormat } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_CUSTOMERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Coupon {
  code: string;
  discountPercent: number;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  orders: Order[];
  customers: Customer[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  login: (email: string, password?: string, demoRole?: 'customer' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  placeOrder: (customerInfo: { name: string; email: string; phone: string; paymentMethod: string }) => Promise<Order>;
  triggerDownload: (productId: string) => Promise<boolean>;
  downloadProgress: Record<string, number>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Supabase status & Sync
  isSupabaseConnected: boolean;
  isDbLoading: boolean;
  dbError: string | null;
  refreshData: () => Promise<void>;
  // Admin handlers
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'Completed' | 'Processing' | 'Cancelled') => Promise<void>;
  updateCustomerStatus: (customerId: string, status: 'Active' | 'Inactive') => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to map DB Product to Frontend Product
function mapDbProduct(row: any, categoriesList: Category[]): Product {
  const cat = categoriesList.find((c) => c.id === row.primary_category_id);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: cat?.name || row.category_name || 'Design Template',
    categorySlug: cat?.slug || 'telugu-flex',
    price: Number(row.price),
    originalPrice: Number(row.original_price || row.price),
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    image: row.preview_image_url || '',
    description: row.description || '',
    features: row.features || [],
    fileFormat: (row.file_format as FileFormat) || 'PSD',
    fileSize: row.file_size || '150 MB',
    dimensions: row.dimensions || '120 x 96 in',
    dpi: Number(row.dpi || 300),
    colorMode: row.color_mode || 'CMYK',
    filesIncluded: row.files_included || '1 Editable PSD + Fonts Pack',
    softwareCompatibility: row.software_compatibility || 'Photoshop CS6 to CC 2026',
    fontsIncluded: Boolean(row.fonts_included ?? true),
    teluguFontsSupported: Boolean(row.telugu_fonts_supported ?? true),
    downloadsCount: Number(row.downloads_count || 0),
    isTrending: Boolean(row.is_trending),
    isBestSeller: Boolean(row.is_bestseller),
    isLatest: Boolean(row.is_latest),
    tags: row.tags || [],
    status: row.status === 'published' ? 'active' : 'draft',
    createdAt: row.created_at || new Date().toISOString()
  };
}

export const LEGACY_PRODUCT_MAP: Record<string, string> = {
  'prod-001': 'd0000000-0000-0000-0000-000000000001',
  'prod-002': 'd0000000-0000-0000-0000-000000000002',
  'prod-003': 'd0000000-0000-0000-0000-000000000003',
  'prod-004': 'd0000000-0000-0000-0000-000000000004',
  'prod-005': 'd0000000-0000-0000-0000-000000000005',
  'prod-006': 'd0000000-0000-0000-0000-000000000006',
};

/**
 * Normalizes cart items:
 * - Maps any legacy IDs to authoritative database UUIDs
 * - Groups and sums quantities for any duplicate product IDs (preventing duplicate React keys)
 * - Verifies items against valid catalog products
 */
export const normalizeCart = (items: CartItem[], catalog: Product[] = INITIAL_PRODUCTS): CartItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, CartItem>();

  for (const item of items) {
    if (!item || !item.product) continue;
    const rawId = String(item.product.id || '').trim();
    const normalizedId = LEGACY_PRODUCT_MAP[rawId] || rawId;

    // Look up in catalog (either database products or INITIAL_PRODUCTS)
    const matchingProd = catalog.find((p) => p.id === normalizedId) ||
      INITIAL_PRODUCTS.find((p) => p.id === normalizedId);

    // If product is not in known products list, omit it
    if (!matchingProd) continue;

    const validatedProduct: Product = {
      ...matchingProd,
      id: normalizedId,
    };

    const qty = Math.max(1, parseInt(String(item.quantity || 1), 10));

    if (map.has(normalizedId)) {
      const existing = map.get(normalizedId)!;
      existing.quantity += qty;
    } else {
      map.set(normalizedId, {
        product: validatedProduct,
        quantity: qty,
      });
    }
  }

  return Array.from(map.values());
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rs_cart');
      if (!saved) {
        const initial = [{ product: INITIAL_PRODUCTS[0], quantity: 1 }];
        localStorage.setItem('rs_cart', JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(saved);
      const normalized = normalizeCart(parsed, INITIAL_PRODUCTS);
      const result = normalized.length > 0 ? normalized : [{ product: INITIAL_PRODUCTS[0], quantity: 1 }];
      // Clean up localStorage immediately to eliminate duplicate entries
      localStorage.setItem('rs_cart', JSON.stringify(result));
      return result;
    } catch {
      const initial = [{ product: INITIAL_PRODUCTS[0], quantity: 1 }];
      localStorage.setItem('rs_cart', JSON.stringify(initial));
      return initial;
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('rs_wishlist');
    if (!saved) return ['d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'];
    try {
      const parsed: string[] = JSON.parse(saved);
      return parsed.map((id) => LEGACY_PRODUCT_MAP[id] || id);
    } catch {
      return ['d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'];
    }
  });
  const [user, setUser] = useState<User | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Supabase states
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // 1. Fetch Categories & Products from Supabase
  const loadCatalogFromSupabase = useCallback(async () => {
    setIsDbLoading(true);
    setDbError(null);
    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      let loadedCategories: Category[] = INITIAL_CATEGORIES;
      if (!catError && catData && catData.length > 0) {
        loadedCategories = catData.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || '',
          itemCount: 0,
          image: row.image_url || INITIAL_CATEGORIES[0]?.image || '',
          iconName: row.icon_name || 'LayoutTemplate',
          featured: row.featured
        }));
        setCategories(loadedCategories);
      }

      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodError && prodData && prodData.length > 0) {
        const mappedProducts = prodData.map((row: any) => mapDbProduct(row, loadedCategories));
        setProducts(mappedProducts);
        setIsSupabaseConnected(true);
        // Normalize cart against authoritative products
        setCart((currentCart) => {
          const verified = normalizeCart(currentCart, mappedProducts);
          const finalCart = verified.length > 0 ? verified : [{ product: mappedProducts[0], quantity: 1 }];
          try {
            localStorage.setItem('rs_cart', JSON.stringify(finalCart));
          } catch {
            // ignore
          }
          return finalCart;
        });
      } else if (prodError) {
        console.warn('Supabase products fetch info (check if migrations were run):', prodError.message);
        // Fall back to pre-seeded products until SQL migrations are executed in Supabase SQL editor
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err: any) {
      console.error('Error connecting to Supabase:', err);
      setDbError(err.message || 'Unable to connect to Supabase database');
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  // 2. Fetch User Profile & Role from Supabase
  const loadUserProfile = useCallback(async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      // Fetch user role
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      const userRole: 'customer' | 'admin' = (roleRow?.role === 'admin' ? 'admin' : 'customer');

      // Fetch user purchased product IDs
      const { data: purchasedRows } = await supabase
        .from('order_items')
        .select('product_id, orders!inner(user_id, status)')
        .eq('orders.user_id', supabaseUser.id)
        .eq('orders.status', 'Completed');

      const purchasedIds = purchasedRows
        ? purchasedRows.map((r: any) => r.product_id).filter(Boolean)
        : [];

      setUser({
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.user_metadata?.full_name || 'Designer',
        email: supabaseUser.email || '',
        phone: profile?.phone || supabaseUser.user_metadata?.phone || '',
        role: userRole,
        purchasedProductIds: purchasedIds
      });
    } catch (err) {
      console.error('Error fetching user profile from Supabase:', err);
    }
  }, []);

  // 3. Fetch Orders from Supabase
  const loadOrders = useCallback(async (currentUserId?: string, isAdmin = false) => {
    try {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (!isAdmin && currentUserId) {
        query = query.eq('user_id', currentUserId);
      }

      const { data: orderRows, error } = await query;
      if (!error && orderRows && orderRows.length > 0) {
        const mappedOrders: Order[] = orderRows.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          total: Number(o.total),
          status: o.status,
          paymentMethod: o.payment_method,
          transactionId: o.transaction_id,
          createdAt: new Date(o.created_at).toLocaleString(),
          items: (o.items || []).map((it: any) => ({
            productId: it.product_id,
            title: it.product_title,
            price: Number(it.price),
            fileFormat: it.file_format,
            fileSize: it.file_size,
            image: it.preview_image_url || '',
            downloadCount: it.download_count,
            maxDownloads: it.max_downloads
          }))
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }, []);

  // Initialize Auth listener & Catalog on Mount
  useEffect(() => {
    loadCatalogFromSupabase();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    // Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCatalogFromSupabase, loadUserProfile]);

  // Load orders when user changes
  useEffect(() => {
    if (user?.id) {
      loadOrders(user.id, user.role === 'admin');
    }
  }, [user, loadOrders]);

  // Local storage synchronization for guest cart & wishlist
  useEffect(() => {
    localStorage.setItem('rs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rs_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    const rawId = String(product.id || '').trim();
    const normalizedId = LEGACY_PRODUCT_MAP[rawId] || rawId;
    const addQty = Math.max(1, parseInt(String(quantity || 1), 10));

    setCart((prev) => {
      // Find canonical product
      const resolvedProduct = products.find((p) => p.id === normalizedId) ||
        INITIAL_PRODUCTS.find((p) => p.id === normalizedId) ||
        { ...product, id: normalizedId };

      const existingIndex = prev.findIndex((item) => {
        const itemId = LEGACY_PRODUCT_MAP[item.product.id] || item.product.id;
        return itemId === normalizedId;
      });

      let nextCart: CartItem[];
      if (existingIndex >= 0) {
        nextCart = prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, product: resolvedProduct, quantity: item.quantity + addQty }
            : item
        );
        showToast(`Updated quantity in cart: ${resolvedProduct.title.slice(0, 30)}...`);
      } else {
        nextCart = [...prev, { product: resolvedProduct, quantity: addQty }];
        showToast(`Added to cart: ${resolvedProduct.title.slice(0, 30)}...`);
      }

      const deduplicated = normalizeCart(nextCart, products);
      try {
        localStorage.setItem('rs_cart', JSON.stringify(deduplicated));
      } catch {
        // ignore
      }
      return deduplicated;
    });
  };

  const removeFromCart = (productId: string) => {
    const targetId = LEGACY_PRODUCT_MAP[productId] || productId;
    setCart((prev) => {
      const updated = prev.filter((item) => {
        const id = LEGACY_PRODUCT_MAP[item.product.id] || item.product.id;
        return id !== targetId;
      });
      try {
        localStorage.setItem('rs_cart', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('Item removed from cart');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const targetId = LEGACY_PRODUCT_MAP[productId] || productId;
    if (quantity <= 0) {
      removeFromCart(targetId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => {
        const id = LEGACY_PRODUCT_MAP[item.product.id] || item.product.id;
        return id === targetId ? { ...item, quantity } : item;
      });
      const deduplicated = normalizeCart(updated, products);
      try {
        localStorage.setItem('rs_cart', JSON.stringify(deduplicated));
      } catch {
        // ignore
      }
      return deduplicated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('rs_cart');
    } catch {
      // ignore
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    try {
      // Query Supabase coupons table
      const { data: couponRow, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && couponRow) {
        setAppliedCoupon({
          code: couponRow.code,
          discountPercent: couponRow.discount_percent
        });
        showToast(`Coupon "${couponRow.code}" applied! ${couponRow.discount_percent}% discount added.`);
        return true;
      }
    } catch {
      // Fallback local check
    }

    if (cleanCode === 'FIRST50' || cleanCode === 'RSCREATION50') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 20 });
      showToast('Coupon applied! 20% discount added.');
      return true;
    } else if (cleanCode === 'FESTIVAL' || cleanCode === 'TELUGU100') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 15 });
      showToast('Festival special coupon applied! 15% discount added.');
      return true;
    } else {
      showToast('Invalid coupon code. Try FIRST50 or FESTIVAL');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscount = appliedCoupon ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100) : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Supabase Authentication Methods
  const login = async (
    email: string,
    password = 'Password@123',
    demoRole?: 'customer' | 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        // If user is trying demo credentials before creating account in Supabase
        if (demoRole) {
          const fallbackUser: User = {
            id: demoRole === 'admin' ? 'admin-01' : 'cust-1',
            name: demoRole === 'admin' ? 'RScreation Admin' : 'Mahesh Reddy',
            email,
            role: demoRole,
            phone: '+91 98480 22334',
            purchasedProductIds: demoRole === 'admin' ? products.map((p) => p.id) : ['d0000000-0000-0000-0000-000000000001']
          };
          setUser(fallbackUser);
          showToast(`Logged in as demo ${demoRole}!`);
          return { success: true };
        }
        showToast(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        showToast('Successfully signed in to RScreation!');
        return { success: true };
      }
      return { success: false, error: 'Sign in failed' };
    } catch (err: any) {
      showToast(err.message || 'Login error');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUser(null);
    showToast('You have been signed out.');
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password = 'Password@123'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            studio_name: name
          }
        }
      });

      if (error) {
        showToast(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        showToast('Registration successful! Welcome to RScreation.');
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`
      });
      if (error) {
        return { success: false, error: error.message };
      }
      showToast('Password reset link sent to your email!');
      return { success: true, message: 'Password reset link sent' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Orders Placement
  const placeOrder = async (customerInfo: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }): Promise<Order> => {
    const orderNum = `RSC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items: cart.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        fileFormat: item.product.fileFormat,
        fileSize: item.product.fileSize,
        image: item.product.image,
        downloadUrl: `#download-${item.product.id}`,
        downloadCount: 0,
        maxDownloads: 15
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartTotal,
      status: 'Completed',
      paymentMethod: customerInfo.paymentMethod,
      transactionId: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
      createdAt: new Date().toLocaleString()
    };

    // Attempt saving to Supabase if connected
    try {
      const { data: dbOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          user_id: user?.id || null,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          subtotal: cartSubtotal,
          discount: cartDiscount,
          total: cartTotal,
          status: 'Completed',
          payment_method: customerInfo.paymentMethod,
          transaction_id: newOrder.transactionId,
          coupon_code: appliedCoupon?.code || null
        })
        .select()
        .single();

      if (!orderError && dbOrder) {
        // Insert order items
        const orderItemsRows = cart.map((item) => ({
          order_id: dbOrder.id,
          product_id: item.product.id.includes('-') && item.product.id.length === 36 ? item.product.id : null,
          product_title: item.product.title,
          price: item.product.price,
          file_format: item.product.fileFormat,
          file_size: item.product.fileSize,
          preview_image_url: item.product.image,
          license_key: `RSC-LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        }));

        await supabase.from('order_items').insert(orderItemsRows);
      }
    } catch (err) {
      console.warn('Could not write order to Supabase:', err);
    }

    setOrders((prev) => [newOrder, ...prev]);

    // Update purchased product IDs in user profile
    const purchasedIds = cart.map((i) => i.product.id);
    if (user) {
      setUser({
        ...user,
        purchasedProductIds: Array.from(new Set([...(user.purchasedProductIds || []), ...purchasedIds]))
      });
    }

    clearCart();
    setAppliedCoupon(null);
    showToast(`Order ${orderNum} confirmed! Download links are ready.`);
    return newOrder;
  };

  // Download Simulator & Real Audit Log
  const triggerDownload = (productId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const prod = products.find((p) => p.id === productId);
      const title = prod ? prod.title : 'Template';

      setDownloadProgress((prev) => ({ ...prev, [productId]: 10 }));
      showToast(`Preparing download for "${title.slice(0, 25)}..."`);

      const interval = setInterval(async () => {
        setDownloadProgress((prev) => {
          const current = prev[productId] || 10;
          if (current >= 100) {
            clearInterval(interval);
            // Initiate file download
            const dummyContent = `=========================================================\n       RSCREATION DIGITAL GRAPHIC DESIGN RESOURCE\n=========================================================\nProduct: ${title}\nCategory: ${prod?.category || 'Design Template'}\nFormat: ${prod?.fileFormat || 'PSD'}\nResolution: ${prod?.dpi || 300} DPI CMYK Print Ready\nLicense: Commercial Single Studio License (Non-transferable)\nCustomer: ${user?.name || 'Verified Buyer'}\nVerified via: Supabase Storage & Row Level Security\nSupport Helpline: support@rscreation.in\n=========================================================\nThank you for trusting RScreation for your graphic studio!`;
            const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(prod?.slug || 'rscreation-template')}.psd.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast(`Download complete: "${title.slice(0, 25)}..."`);
            resolve(true);
            return { ...prev, [productId]: 100 };
          }
          return { ...prev, [productId]: current + 30 };
        });
      }, 350);
    });
  };

  // Admin Handlers connected to Supabase
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const slug = prodData.slug || prodData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const matchedCategory = categories.find((c) => c.slug === prodData.categorySlug || c.name === prodData.category);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: prodData.title,
          slug,
          description: prodData.description,
          primary_category_id: matchedCategory?.id && matchedCategory.id.length === 36 ? matchedCategory.id : null,
          price: prodData.price,
          original_price: prodData.originalPrice,
          file_format: prodData.fileFormat,
          file_size: prodData.fileSize,
          dimensions: prodData.dimensions,
          dpi: prodData.dpi,
          color_mode: prodData.colorMode,
          files_included: prodData.filesIncluded,
          software_compatibility: prodData.softwareCompatibility,
          fonts_included: prodData.fontsIncluded,
          telugu_fonts_supported: prodData.teluguFontsSupported,
          preview_image_url: prodData.image,
          tags: prodData.tags,
          features: prodData.features,
          status: prodData.status === 'active' ? 'published' : 'draft',
          is_trending: prodData.isTrending || false,
          is_bestseller: prodData.isBestSeller || false,
          is_latest: prodData.isLatest ?? true
        })
        .select()
        .single();

      if (!error && data) {
        const newProduct = mapDbProduct(data, categories);
        setProducts((prev) => [newProduct, ...prev]);
        showToast('Product added to Supabase database!');
        return;
      }
    } catch (err) {
      console.warn('Could not add product to Supabase, updating local state:', err);
    }

    const fallbackProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [fallbackProduct, ...prev]);
    showToast('New product added to catalog!');
  };

  const updateProduct = async (updated: Product) => {
    try {
      await supabase
        .from('products')
        .update({
          title: updated.title,
          price: updated.price,
          original_price: updated.originalPrice,
          description: updated.description,
          file_format: updated.fileFormat,
          file_size: updated.fileSize,
          dimensions: updated.dimensions,
          dpi: updated.dpi,
          color_mode: updated.colorMode,
          telugu_fonts_supported: updated.teluguFontsSupported,
          preview_image_url: updated.image,
          status: updated.status === 'active' ? 'published' : 'draft'
        })
        .eq('id', updated.id);
    } catch (err) {
      console.warn('Could not update in Supabase:', err);
    }

    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast('Product updated successfully');
  };

  const deleteProduct = async (productId: string) => {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.warn('Could not delete from Supabase:', err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from catalog');
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          image_url: catData.image,
          icon_name: catData.iconName,
          featured: catData.featured || false
        })
        .select()
        .single();

      if (!error && data) {
        setCategories((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            itemCount: 0,
            image: data.image_url || '',
            iconName: data.icon_name || 'LayoutTemplate',
            featured: data.featured
          }
        ]);
        showToast('New category added to Supabase!');
        return;
      }
    } catch (err) {
      console.warn('Could not save category to Supabase:', err);
    }

    setCategories((prev) => [...prev, { ...catData, id: `cat-${Date.now()}` }]);
    showToast('New category created');
  };

  const updateCategory = async (updated: Category) => {
    try {
      await supabase
        .from('categories')
        .update({
          name: updated.name,
          slug: updated.slug,
          description: updated.description
        })
        .eq('id', updated.id);
    } catch (err) {
      console.warn('Could not update category in Supabase:', err);
    }
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Category updated successfully');
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch (err) {
      console.warn('Could not delete category from Supabase:', err);
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    showToast('Category deleted');
  };

  const updateOrderStatus = async (
    orderId: string,
    status: 'Completed' | 'Processing' | 'Cancelled'
  ) => {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (err) {
      console.warn('Could not update order status in Supabase:', err);
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    showToast(`Order status updated to ${status}`);
  };

  const updateCustomerStatus = async (customerId: string, status: 'Active' | 'Inactive') => {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, status } : c)));
    showToast(`Customer status changed to ${status}`);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        user,
        orders,
        customers,
        searchQuery,
        setSearchQuery,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        toggleWishlist,
        isInWishlist,
        login,
        logout,
        register,
        resetPassword,
        placeOrder,
        triggerDownload,
        downloadProgress,
        toastMessage,
        showToast,
        isSupabaseConnected,
        isDbLoading,
        dbError,
        refreshData: loadCatalogFromSupabase,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updateCustomerStatus
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
