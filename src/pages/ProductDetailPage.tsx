import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Download,
  Share2,
  CheckCircle2,
  FileCode2,
  Layers,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, showToast } = useStore();

  const product = products.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');
  const [copied, setCopied] = useState(false);

  // If product not found
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The template you are searching for does not exist or was removed.</p>
        <Link to="/shop" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const galleryImages = [
    product.image,
    ...(product.additionalImages || [])
  ];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    showToast('Product link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="hover:text-slate-900">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/category/${product.categorySlug}`} className="hover:text-slate-900">
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section (Contiguous Purchase Module) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery (sticky gallery) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={selectedImage || product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Spec overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-md">
              {product.fileFormat} · {product.dpi} DPI
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow-md hover:bg-white transition-colors"
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    (selectedImage || product.image) === img
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Overview & Key Highlights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Template Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Key Template Features
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
          <div>
            {/* Unboxed metadata line */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-amber-700">{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>Downloads: <strong className="text-slate-800 tabular-nums">{product.downloadsCount}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="flex text-amber-500 text-xs">
                ★★★★★ <span className="ml-1 text-slate-600 font-medium">({product.reviewsCount})</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                Digital Studio License
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tabular-nums font-display">
                  ₹{product.price}
                </span>
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {discountPercent}% OFF
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Instant Delivery
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now (Instant Download)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => addToCart(product, 1)}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Share Design'}</span>
              </button>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>File Specifications</span>
            </h4>

            <div className="text-xs space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-slate-900">{product.fileFormat} (Layered)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">File Size:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{product.fileSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Canvas Dimensions:</span>
                <span className="font-semibold text-slate-900">{product.dimensions}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Resolution / DPI:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{product.dpi} DPI</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Color Mode:</span>
                <span className="font-semibold text-slate-900">{product.colorMode} Print Calibrated</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Software Compatibility:</span>
                <span className="font-semibold text-slate-900">{product.softwareCompatibility}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Telugu Fonts Support:</span>
                <span className="font-semibold text-emerald-700">
                  {product.teluguFontsSupported ? 'Unicode & Anu Script Included' : 'Standard Typography'}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Trust Assurance */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Commercial single studio & client print license</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unlimited lifetime re-downloads from account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                More In This Collection
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Related {product.category} Templates
              </h3>
            </div>
            <Link
              to={`/category/${product.categorySlug}`}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              View all ({products.filter((p) => p.categorySlug === product.categorySlug).length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
