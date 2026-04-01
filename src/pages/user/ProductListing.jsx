import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';
import { fetchCategories, fetchProducts } from '../../services/productService';

const REVIEW_STORAGE_PREFIX = 'easycart_product_reviews_';

const SORT_BY_MAP = {
  newest: 'newest',
  'price-low': 'priceAsc',
  'price-high': 'priceDesc',
  rating: 'rating',
  popular: 'rating',
};

const mergeLocalReviewStats = (product) => {
  const baseReviews = Number(product.reviews || 0);
  const baseRating = Number(product.rating || 0);

  try {
    const raw = localStorage.getItem(`${REVIEW_STORAGE_PREFIX}${product.id}`);
    const parsed = raw ? JSON.parse(raw) : [];
    const localReviews = Array.isArray(parsed) ? parsed : [];

    if (localReviews.length === 0) {
      return product;
    }

    const localRatingTotal = localReviews.reduce(
      (total, review) => total + Number(review.rating || 0),
      0
    );
    const mergedReviewCount = baseReviews + localReviews.length;
    const mergedRating = mergedReviewCount > 0
      ? ((baseRating * baseReviews) + localRatingTotal) / mergedReviewCount
      : 0;

    return {
      ...product,
      rating: Number(mergedRating.toFixed(1)),
      reviews: mergedReviewCount,
    };
  } catch (_error) {
    return product;
  }
};

function ProductListing() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceLimit, setPriceLimit] = useState(1000);
  const [filters, setFilters] = useState({
    categories: initialCategory !== 'all' ? [initialCategory] : [],
    minPrice: 0,
    maxPrice: null,
    ratings: [],
  });

  const handleCategoryToggle = (categorySlug) => {
    setFilters(prev => {
      const exists = prev.categories.includes(categorySlug);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(slug => slug !== categorySlug)
          : [...prev.categories, categorySlug],
      };
    });
  };

  const handleRatingToggle = (ratingValue) => {
    setFilters(prev => {
      const exists = prev.ratings.includes(ratingValue);
      return {
        ...prev,
        ratings: exists
          ? prev.ratings.filter(rating => rating !== ratingValue)
          : [...prev.ratings, ratingValue],
      };
    });
  };

  const applyFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [productsResponse, categoryList] = await Promise.all([
        fetchProducts({
          search: searchQuery,
          sortBy: SORT_BY_MAP[sortBy] || 'newest',
          limit: 100,
        }),
        fetchCategories(),
      ]);

      const allProducts = (productsResponse.products || []).map(mergeLocalReviewStats);
      const detectedMaxPrice = Math.max(0, ...allProducts.map(product => Number(product.price) || 0));
      const normalizedMaxPrice = Math.max(1, Math.ceil(detectedMaxPrice));
      const effectiveMaxPrice = filters.maxPrice == null ? normalizedMaxPrice : filters.maxPrice;

      setPriceLimit(normalizedMaxPrice);

      let filtered = allProducts;

      if (filters.categories.length > 0) {
        filtered = filtered.filter((product) => {
          const categorySlug = typeof product.category === 'string'
            ? product.category
            : product.category?.slug;
          return filters.categories.includes(categorySlug);
        });
      }

      filtered = filtered.filter((product) => {
        const productPrice = Number(product.price) || 0;
        return productPrice >= filters.minPrice && productPrice <= effectiveMaxPrice;
      });

      if (filters.ratings.length > 0) {
        filtered = filtered.filter((product) => {
          const roundedRating = Math.round(Number(product.rating || 0));
          return filters.ratings.includes(roundedRating);
        });
      }

      setProducts(filtered);
      setCategories(categoryList);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    setFilters(prev => {
      const nextMin = Math.min(prev.minPrice, priceLimit);
      const maxCandidate = prev.maxPrice == null ? priceLimit : Math.min(prev.maxPrice, priceLimit);
      const nextMax = Math.max(maxCandidate, nextMin);

      if (nextMin === prev.minPrice && nextMax === prev.maxPrice) {
        return prev;
      }

      return {
        ...prev,
        minPrice: nextMin,
        maxPrice: nextMax,
      };
    });
  }, [priceLimit]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-2">Products</h1>
          <p className="text-blue-100">Showing {products.length} products</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-gradient-to-b from-white via-blue-50/60 to-indigo-50/60 p-6 rounded-2xl shadow-xl border border-indigo-100 sticky top-20 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="font-extrabold text-lg bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-transparent">Filters</h3>
                <button className="p-1 rounded-full hover:bg-indigo-100" onClick={() => setShowFilters(false)}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3 tracking-wide">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.categories.length === 0}
                      onChange={() => setFilters(prev => ({ ...prev, categories: [] }))}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-indigo-800 font-semibold">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/70 transition-colors">
                      <input
                        type="checkbox"
                        name="category"
                        value={category.slug}
                        checked={filters.categories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                      <span className="text-slate-700 font-semibold">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3 tracking-wide">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-indigo-700 font-semibold mb-1">Low Price: ₹{filters.minPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(1, priceLimit)}
                      step="1"
                      value={filters.minPrice}
                      onChange={(e) => {
                        const nextMin = Math.max(0, Number(e.target.value) || 0);
                        setFilters(prev => {
                          const currentMax = prev.maxPrice == null ? priceLimit : prev.maxPrice;
                          return {
                            ...prev,
                            minPrice: Math.min(nextMin, currentMax),
                          };
                        });
                      }}
                      className="w-full accent-indigo-600 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-700 font-semibold mb-1">High Price: ₹{filters.maxPrice == null ? priceLimit : filters.maxPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max={priceLimit}
                      step="1"
                      value={filters.maxPrice == null ? priceLimit : filters.maxPrice}
                      onChange={(e) => {
                        const nextMax = Math.max(0, Number(e.target.value) || 0);
                        setFilters(prev => ({
                          ...prev,
                          maxPrice: Math.max(nextMax, prev.minPrice),
                        }));
                      }}
                      className="w-full accent-cyan-600 drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3 tracking-wide">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1, 0].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/70 transition-colors">
                      <input
                        type="checkbox"
                        name="rating"
                        value={rating}
                        checked={filters.ratings.includes(rating)}
                        onChange={() => handleRatingToggle(rating)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-700 font-semibold">{rating} Star</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between md:justify-end gap-3 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
              >
                <FiFilter />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-indigo-500 rounded-xl bg-gradient-to-r from-indigo-50 via-cyan-50 to-blue-100 text-slate-800 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductListing;

