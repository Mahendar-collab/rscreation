export type FileFormat = 'PSD' | 'AI' | 'CDR' | 'EPS' | 'ZIP';

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  additionalImages?: string[];
  description: string;
  features: string[];
  fileFormat: FileFormat;
  fileSize: string;
  dimensions: string;
  dpi: number;
  colorMode: 'CMYK' | 'RGB';
  filesIncluded: string;
  softwareCompatibility: string;
  fontsIncluded: boolean;
  teluguFontsSupported: boolean;
  downloadsCount: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isLatest?: boolean;
  tags: string[];
  status: 'active' | 'draft';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  image: string;
  iconName: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  fileFormat: string;
  fileSize: string;
  image: string;
  downloadUrl?: string;
  downloadCount: number;
  maxDownloads: number;
  licenseKey?: string;
  remainingDownloads?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Completed' | 'Processing' | 'Cancelled' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  purchasedProductIds?: string[];
}
