import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Download,
  Layers,
  CheckCircle,
  TrendingUp,
  Award,
  Calendar,
  HeartHandshake,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { HERO_IMAGE } from '../data/mockData';

export const HomePage: React.FC = () => {
  const { products, categories, setSearchQuery } = useStore();
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      setSearchQuery(heroSearchInput.trim());
      navigate(`/shop?search=${encodeURIComponent(heroSearchInput.trim())}`);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Section product filters
  const trendingProducts = products.filter((p) => p.isTrending || p.rating >= 4.8).slice(0, 4);
  const latestProducts = products.filter((p) => p.isLatest || p.createdAt >= '2026-03-01').slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller || p.downloadsCount >= 1000).slice(0, 4);
  const weddingDesigns = products.filter((p) => p.categorySlug === 'wedding' || p.tags.includes('Wedding')).slice(0, 3);
  const festivalDesigns = products.filter((p) => p.categorySlug === 'festival' || p.tags.includes('Festival')).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Large Hero Banner */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premium Digital Graphic Assets</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1] text-balance">
                Creative Designs. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                  Unlimited Possibilities.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Download studio-grade Telugu flex banners, royal wedding invitation PSDs, festival posters, and commercial signage. 100% layered files with complete Telugu fonts.
              </p>

              {/* Quick Hero Search */}
              <form onSubmit={handleHeroSearch} className="max-w-lg">
                <div className="flex items-center bg-white rounded-xl p-1.5 shadow-2xl border border-slate-700/50">
                  <div className="pl-3 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Search 'Telugu flex banner', 'Wedding PSD', 'Festival'..."
                    className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/category/telugu-flex"
                  className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors"
                >
                  Telugu Flex Templates
                </Link>
              </div>

              {/* Verified Trust Markers */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>300 DPI CMYK Print Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Free Telugu Fonts Pack</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant ZIP Download</span>
                </div>
              </div>
            </div>

            {/* Right showcase preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 group">
                <img
                  src={HERO_IMAGE}
                  alt="RScreation Graphic Design Templates Workspace"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block">
                      New Season Release
                    </span>
                    <span className="font-semibold text-white">Full Telugu Typography Suite</span>
                  </div>
                  <Link
                    to="/shop"
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
              Organized For Print & Web
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>All Categories ({categories.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-xl overflow-hidden border border-slate-200/80 bg-white p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                  {cat.itemCount}+ PSDs
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Demand Right Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Trending PSD Templates
            </h2>
          </div>
          <Link
            to="/shop?filter=trending"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All Trending</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Wedding Collections Spotlight */}
      <section className="bg-amber-50/60 border-y border-amber-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Wedding Season Special</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                Royal Telugu Wedding & Invitation Suite
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Lagna Patrika designs, engagement cards, Sangeet posters, and Karizma photo album layouts ready for client customization.
              </p>
            </div>
            <Link
              to="/category/wedding"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
            >
              <span>Explore Wedding Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weddingDesigns.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Designs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Off The Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Latest Additions
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>See New Designs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Promotional Special Bundle Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-xl border border-slate-700">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
              Graphic Designer Advantage
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Save Hours on Every Printing Order
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Never start from a blank canvas. Our templates include verified Telugu fonts, clipping masks, color separation guides, and calibrated bleed margins for seamless output on Star Flex and digital printers.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md"
              >
                Browse All 100+ Templates
              </Link>
              <div className="text-xs text-slate-400">
                Direct WhatsApp Support for Layer Assistance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Best Sellers & Festival Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Highest Rated by Studios</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Best Selling Templates
            </h2>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All Best Sellers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. Customer Benefits (Claim-to-Proof Adjacency) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 rounded-2xl bg-white p-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Why Designers & Flex Printers Choose RScreation
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered by experienced graphic designers for Indian printing standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Zero Waiting Instant Delivery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download links activate within seconds of checkout. Re-download your files anytime from your customer account dashboard without expiry.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Clean & Organized PSD Layers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every file is logically grouped into titles, backgrounds, photo frames, and lighting effects. No flattened clutter.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Commercial Printing License</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our designs for unlimited client printing jobs, vinyl banners, wedding card presses, and social media releases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Verified Customer Testimonials */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Designer Feedback
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Trusted by 5,000+ Studios Across AP & Telangana
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed">
                &ldquo;The Telugu flex banner templates from RScreation saved our studio during festival rush. The 3D Telugu lettering styles and print color calibration are spot-on. Truly commercial quality.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs">
                <strong className="text-slate-900 block">K. Praveen Kumar</strong>
                <span className="text-slate-500">Praveen Flex Printers, Vijayawada</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed">
                &ldquo;Royal wedding Lagna Patrika designs are unmatched. The layers are cleanly named and swapping Telugu names took me just 10 minutes. My clients were thoroughly impressed!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs">
                <strong className="text-slate-900 block">Srinivas Rao</strong>
                <span className="text-slate-500">Sri Digital Studio & Lab, Warangal</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 leading-relaxed">
                &ldquo;Instant download with Telugu font references included made my workflow seamless. No missing fonts error in Photoshop. Highly recommended for freelance designers.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs">
                <strong className="text-slate-900 block">Ramesh Babu</strong>
                <span className="text-slate-500">Babu Graphics, Hyderabad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 font-display mb-1">
            Get Weekly Free PSD Assets & Festival Alerts
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Join 12,000+ designers getting updates whenever new Telugu flex templates or festive card designs drop.
          </p>

          {newsletterSubscribed ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
              Thank you for subscribing! We&apos;ve added your email to our VIP Designer newsletter.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
