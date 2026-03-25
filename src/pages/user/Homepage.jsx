import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiZap,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiHeadphones,
  FiTag,
  FiStar,
  FiClock
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { mockProducts, mockCategories } from '../../utils/mockData';
import { useStoreSettings } from '../../context/StoreSettingsContext';

function Homepage() {
  const { settings } = useStoreSettings();
  const heroProduct = mockProducts[1] || mockProducts[0];
  const featuredProducts = mockProducts.slice(0, 6);
  const trendingProducts = mockProducts.slice(6, 10);

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      <Navbar />

      <section className="px-4 pt-8 pb-8">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 page-enter">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[#111827] text-white p-7 md:p-10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 right-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -bottom-16 left-[-70px] w-[260px] h-[260px] rounded-full bg-emerald-400/20 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300 mb-4">
                <FiZap /> New Season Picks
              </p>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                A Better Way To Shop
                <span className="block text-cyan-300">With {settings.storeName}</span>
              </h1>
              <p className="mt-5 text-slate-200 text-lg max-w-xl">
                Clean catalog, quick checkout, and reliable support. Built for people who want quality without wasting time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-slate-900 font-semibold hover:shadow-lg transition"
                >
                  Shop Now <FiArrowRight />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-6 py-3 font-semibold hover:bg-white/10 transition"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-3">
                  <p className="text-xs text-slate-300">Products</p>
                  <p className="text-xl font-bold">1000+</p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-3">
                  <p className="text-xs text-slate-300">Support</p>
                  <p className="text-sm font-semibold truncate">{settings.phone}</p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-3 col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-300">Return Window</p>
                  <p className="text-xl font-bold">30 Days</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to={heroProduct ? `/product/${heroProduct.id}` : '/products'}
            className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="h-full grid grid-rows-[1fr_auto]">
              <div className="relative min-h-[320px] bg-slate-100 overflow-hidden">
                <img
                  src={heroProduct?.image || 'https://via.placeholder.com/600'}
                  alt={heroProduct?.name || 'Featured product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-4 left-4 rounded-lg bg-black/70 text-white px-3 py-1 text-xs uppercase tracking-wide">
                  Editor Pick
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">Limited Offer</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 line-clamp-2">{heroProduct?.name || 'Featured Item'}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Starting at</p>
                    <p className="text-2xl font-bold text-slate-900">₹{Number(heroProduct?.price || 0).toFixed(2)}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold">
                    View <FiArrowRight />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center"><FiTruck /></div>
            <div>
              <p className="font-semibold text-slate-900">Fast Fulfillment</p>
              <p className="text-sm text-slate-600 mt-1">Quick dispatch and order tracking on every shipment.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-700 text-white flex items-center justify-center"><FiShield /></div>
            <div>
              <p className="font-semibold text-slate-900">Secure Checkout</p>
              <p className="text-sm text-slate-600 mt-1">Protected transactions with transparent order details.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center"><FiHeadphones /></div>
            <div>
              <p className="font-semibold text-slate-900">Real Support</p>
              <p className="text-sm text-slate-600 mt-1">Reach us at {settings.email} whenever you need help.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 bg-white border-y border-slate-200">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Browse Smart</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">Shop by Category</h2>
            </div>
            <Link to="/products" className="font-semibold text-slate-800 hover:text-slate-900">See All Categories</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {mockCategories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.slug}`}>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition p-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl mb-4">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Featured Products</h2>
            <Link to="/products" className="text-slate-900 font-semibold hover:gap-2 flex items-center gap-1 transition">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Trending Right Now</h2>
              <Link to="/products" className="text-slate-900 font-semibold hover:gap-2 flex items-center gap-1 transition">
                Explore <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Exclusive Access</p>
              <h3 className="text-2xl font-bold mt-2">Join {settings.storeName} Alerts</h3>
              <p className="text-slate-200 text-sm mt-3">Get launch notifications, curated deals, and weekly top picks before everyone else.</p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm flex items-center gap-2"><FiTag /> Private discounts</div>
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm flex items-center gap-2"><FiClock /> Early restock alerts</div>
                <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm flex items-center gap-2"><FiStar /> Member-only bundles</div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 placeholder:text-slate-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button className="w-full rounded-xl bg-white text-slate-900 py-3 font-semibold hover:bg-slate-100 transition">
                  Subscribe Now
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><FiRefreshCw /> Easy Returns</h4>
              <p className="text-sm text-slate-600 mt-2">Changed your mind? We keep returns simple and stress-free.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Homepage;
