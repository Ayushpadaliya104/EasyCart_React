import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../context/QueryContext';
import { fetchProducts } from '../services/productService';

function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { getUnreadCountForUser } = useQuery();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const searchInputRef = React.useRef(null);
  const suggestionsRef = React.useRef(null);
  const unreadQueries = getUnreadCountForUser(user?.email);

  // Fetch search results
  const handleSearchInputChange = React.useCallback(async (value) => {
    setSearchQuery(value);
    
    if (value.trim().length < 1) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetchProducts({ search: value.trim(), limit: 8 });
      setSearchResults(response.products || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      navigate('/products');
      return;
    }
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-indigo-900 to-cyan-800 border-b border-cyan-300/30 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-200 via-emerald-200 to-cyan-200 bg-clip-text text-transparent">EasyCart</div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-8 relative">
            <form className="relative w-full" onSubmit={handleSearchSubmit}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                className="w-full px-4 py-2 border border-cyan-200/60 bg-white/90 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/40"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-cyan-700 hover:text-indigo-700 transition">
                <FiSearch />
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-cyan-200/30 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin">⟳</div> Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-4 py-3 text-left hover:bg-cyan-50 transition border-b border-gray-100 last:border-b-0 flex gap-3"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate text-sm">{product.name}</p>
                            <p className="text-cyan-600 font-bold text-sm">₹{product.price.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full px-4 py-2 text-center text-cyan-600 hover:bg-cyan-50 border-t border-gray-200 font-medium text-sm"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/products" className="text-cyan-100 hover:text-white transition font-medium">
              Products
            </Link>
            <Link to="/queries" className="relative text-cyan-100 hover:text-white transition font-medium">
              Query
              {unreadQueries > 0 && (
                <span className="absolute -top-2 -right-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-semibold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-md">
                  {unreadQueries > 99 ? '99+' : unreadQueries}
                </span>
              )}
            </Link>
            {user && (
              <>
                <Link to="/wishlist" className="relative text-cyan-100 hover:text-pink-200 transition">
                  <FiHeart size={20} />
                </Link>
                <Link to="/cart" className="relative text-cyan-100 hover:text-yellow-200 transition">
                  <FiShoppingCart size={20} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-cyan-100 hover:text-white transition">
                  <FiUser size={20} />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition shadow-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition shadow-md">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-cyan-100 hover:text-white transition"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-cyan-200/30 pt-4 space-y-3 bg-white/10 rounded-xl px-3 backdrop-blur-sm">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                className="w-full px-4 py-2 border border-cyan-200/60 bg-white/95 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/40"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-cyan-700">
                <FiSearch />
              </button>

              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-cyan-200/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin">⟳</div> Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-cyan-50 transition border-b border-gray-100 last:border-b-0 flex gap-2"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate text-xs">{product.name}</p>
                            <p className="text-cyan-600 font-bold text-xs">₹{product.price.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full px-4 py-2 text-center text-cyan-600 hover:bg-cyan-50 border-t border-gray-200 font-medium text-xs"
                      >
                        View all results
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-xs">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </form>
            <Link to="/products" className="block text-cyan-50 hover:text-white font-medium">
              Products
            </Link>
            {user && (
              <>
                <Link to="/wishlist" className="block text-cyan-50 hover:text-pink-200 font-medium">
                  Wishlist
                </Link>
                <Link to="/cart" className="block text-cyan-50 hover:text-yellow-200 font-medium">
                  Cart ({getTotalItems()})
                </Link>
              </>
            )}
            <Link to="/queries" className="block text-cyan-50 hover:text-white font-medium">
              Query {unreadQueries > 0 ? `(${unreadQueries > 99 ? '99+' : unreadQueries})` : ''}
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="block text-cyan-50 hover:text-white font-medium">
                  Profile ({user.name})
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded hover:from-rose-600 hover:to-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-cyan-50 hover:text-white font-medium">
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
