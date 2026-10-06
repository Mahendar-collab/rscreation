import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';

export const ShopPage: React.FC = () => {
  const { products, categories, searchQuery, setSearchQuery } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || 'all';
  const initialSort = searchParams.get('sort') || 'popular';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    const query = (searchParams.get('search') || searchQuery).toLowerCase().trim();
    if (query) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    // File format filter
    if (selectedFormat !== 'all') {
      list = list.filter((p) => p.fileFormat === selectedFormat);
    }

    // Price max filter
    list = list.filter((p) => p.price <= selectedPriceMax);

    // Additional URL tag filter (trending/bestseller/newest)
    if (initialFilter === 'trending') {
      list = list.filter((p) => p.isTrending);
    } else if (initialFilter === 'bestseller') {
      list = list.filter((p) => p.isBestSeller);
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: popular / downloads count
      list.sort((a, b) => b.downloadsCount - a.downloadsCount);
    }

    return list;
  }, [products, searchQuery, searchParams, selectedCategory, selectedFormat, selectedPriceMax, sortBy, initialFilter]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSelectedPriceMax(1000);
    setSortBy('popular');
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedFormat !== 'all' ? 1 : 0) +
    (selectedPriceMax < 1000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Title */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Complete Design Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            All Graphic Design Resources & PSDs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-slate-800 tabular-nums">{filteredProducts.length}</span> print-ready design templates
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg w-48 sm:w-60 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Additions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside
          className={`md:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-6 ${
            mobileFilterOpen ? 'block fixed inset-0 z-50 p-6 overflow-y-auto' : 'hidden md:block'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 md:hidden">
              <span className="font-bold text-slate-900 text-sm">Filter Products</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-700 hover:underline font-medium"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Categories filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
                <span className="tabular-nums text-[11px] opacity-80">{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="tabular-nums text-[11px] opacity-80">
                    {products.filter((p) => p.categorySlug === cat.slug).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Format filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-900 block">File Format</label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'PSD', 'AI', 'CDR', 'ZIP'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                    selectedFormat === fmt
                      ? 'bg-amber-500/10 border-amber-500 text-amber-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {fmt === 'all' ? 'All Formats' : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-900">Max Price</label>
              <span className="font-bold text-slate-900 tabular-nums">₹{selectedPriceMax}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={selectedPriceMax}
              onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹100</span>
              <span>₹1,000</span>
            </div>
          </div>

          {/* Trust note */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Printing Compatibility:</span>
              <p>All PSD files contain CMYK color profiles, print guides, and layered Telugu text objects.</p>
            </div>
          </div>

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold md:hidden mt-4"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          )}
        </aside>

        {/* Main Product Grid */}
        <div className="md:col-span-9 space-y-6">
          {/* Active filter badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-500">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-slate-500 hover:text-slate-800" />
                  </button>
                </span>
              )}
              {selectedFormat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                  Format: {selectedFormat}
                  <button onClick={() => setSelectedFormat('all')}>
                    <X className="w-3 h-3 text-slate-500 hover:text-slate-800" />
                  </button>
                </span>
              )}
              {selectedPriceMax < 1000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                  Under: ₹{selectedPriceMax}
                  <button onClick={() => setSelectedPriceMax(1000)}>
                    <X className="w-3 h-3 text-slate-500 hover:text-slate-800" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 text-slate-500 hover:text-slate-800" />
                  </button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching design templates found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Try adjusting your search query, clearing filters, or browsing by category.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
