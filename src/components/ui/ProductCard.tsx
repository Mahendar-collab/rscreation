import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Download, Check } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isInWishlist(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Product Preview Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-[4/3] w-full bg-slate-100 overflow-hidden"
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-amber-50 p-4 text-center">
            <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold mb-1">
              {product.fileFormat} TEMPLATE
            </span>
            <span className="text-sm font-medium text-slate-700 line-clamp-2">
              {product.title}
            </span>
          </div>
        )}

        {/* Quick action buttons on top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              wishlisted
                ? 'bg-rose-50 text-rose-600 shadow-sm'
                : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white shadow-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Spec badge overlay on bottom image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white/95 px-2.5 py-1 rounded bg-slate-900/60 backdrop-blur-sm">
          <span>{product.fileFormat} · {product.dpi} DPI</span>
          <span>{product.fileSize}</span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unboxed Metadata Line (anti-slop zero pill rule) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-slate-700">{product.category}</span>
          <span aria-hidden="true">·</span>
          <span>{product.colorMode}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-0.5">
            <Download className="w-3 h-3 text-slate-400" />
            <span className="tabular-nums">{product.downloadsCount}</span>
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-amber-600 transition-colors mb-3 leading-snug"
        >
          {product.title}
        </Link>

        {/* Price & Action row */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-600">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/product/${product.id}`}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="View details"
              aria-label="View template details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
