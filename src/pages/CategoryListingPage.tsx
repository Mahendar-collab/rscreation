import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';

export const CategoryListingPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { categories, products } = useStore();

  // If a specific slug is passed in URL: /category/:slug
  const currentCategory = slug ? categories.find((c) => c.slug === slug) : null;
  const categoryProducts = currentCategory
    ? products.filter((p) => p.categorySlug === currentCategory.slug)
    : [];

  if (slug && !currentCategory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Category Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested category &ldquo;{slug}&rdquo; does not exist or has been relocated.
        </p>
        <Link
          to="/categories"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  // Single category detail view
  if (currentCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/categories" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-800">{currentCategory.name}</span>
        </div>

        {/* Hero banner for this category */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white border border-slate-800">
          <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Category Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
              {currentCategory.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentCategory.description}
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="font-semibold text-white tabular-nums">{categoryProducts.length}</span> templates available with 100% layered PSD files and print-ready guides.
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden md:block">
            <img
              src={currentCategory.image}
              alt={currentCategory.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Products in this category */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {currentCategory.name} Designs ({categoryProducts.length})
            </h2>
            <Link
              to="/shop"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Browse other categories →
            </Link>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600 mb-2">No templates currently in this category.</p>
              <Link to="/shop" className="text-xs font-semibold text-slate-900 underline">
                Browse our complete catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // All Categories Index View (/categories)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
          Explore By Discipline
        </div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          All Design Categories
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse specialized PSD graphic collections for Telugu flex banners, weddings, festivals, shop boards, and social media.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                  {count > 0 ? count : cat.itemCount} Templates
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-amber-700">
                  <span>Explore Designs</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
