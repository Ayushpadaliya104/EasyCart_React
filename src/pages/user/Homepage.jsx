import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { mockProducts, mockCategories } from '../../utils/mockData';

function Homepage() {
  const featuredProducts = mockProducts.slice(0, 6);
  const trendingProducts = mockProducts.slice(4, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-cyan-800 text-white py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Premium Products at Unbeatable Prices
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover thousands of high-quality products with fast shipping and excellent customer service.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 btn-hover-lift"
              >
                Shop Now
                <FiArrowRight />
              </Link>
              <Link
                to="/products"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition"
              >
                View Catalog
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
              alt="Hero"
              className="w-full rounded-lg shadow-hover"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {mockCategories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
              >
                <div className="bg-white rounded-lg p-6 text-center hover:shadow-hover transition cursor-pointer btn-hover-lift">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-slate-900 font-semibold hover:gap-2 flex items-center gap-1 transition">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Trending Now</h2>
            <Link to="/products" className="text-slate-900 font-semibold hover:gap-2 flex items-center gap-1 transition">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-slate-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiTruck />
              </div>
              <h3 className="font-bold text-xl mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiShield />
              </div>
              <h3 className="font-bold text-xl mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure and encrypted transactions</p>
            </div>
            <div className="text-center">
              <div className="bg-slate-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiRefreshCw />
              </div>
              <h3 className="font-bold text-xl mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">Get exclusive deals and updates delivered to your inbox</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition btn-hover-lift">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Homepage;

