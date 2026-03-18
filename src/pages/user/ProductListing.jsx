import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { mockProducts, mockCategories } from '../../utils/mockData';
import { FiFilter, FiX } from 'react-icons/fi';

function ProductListing() {
  const products = mockProducts;
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
  });

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.rating);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [filters, products, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <section className="bg-white shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Showing {filteredProducts.length} products</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white p-6 rounded-lg shadow-soft sticky top-20">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={filters.category === 'all'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">All Categories</span>
                  </label>
                  {mockCategories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.slug}
                        checked={filters.category === category.slug}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Under $50', min: 0, max: 50 },
                    { label: '$50 - $150', min: 50, max: 150 },
                    { label: '$150 - $300', min: 150, max: 300 },
                    { label: '$300 - $500', min: 300, max: 500 },
                    { label: 'Above $500', min: 500, max: 1000 },
                  ].map((range, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={`min-${range.min},max-${range.max}`}
                        onChange={() => setFilters({ ...filters, minPrice: range.min, maxPrice: range.max })}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating}
                        onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
                        className="w-4 h-4"
                      />
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-700">& Up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
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

