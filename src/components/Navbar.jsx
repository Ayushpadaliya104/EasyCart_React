import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../context/QueryContext';

function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { getUnreadCountForUser } = useQuery();
  const [searchQuery, setSearchQuery] = React.useState('');
  const unreadQueries = getUnreadCountForUser(user?.email);

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="gradient-text text-2xl font-bold tracking-tight">EasyCart</div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
              />
              <FiSearch className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-slate-700 hover:text-slate-900 transition">
              Products
            </Link>
            <Link to="/queries" className="relative text-slate-700 hover:text-slate-900 transition">
              Query
              {unreadQueries > 0 && (
                <span className="absolute -top-2 -right-4 bg-rose-600 text-white text-[10px] font-semibold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {unreadQueries > 99 ? '99+' : unreadQueries}
                </span>
              )}
            </Link>
            {user && (
              <>
                <Link to="/wishlist" className="relative text-slate-700 hover:text-slate-900 transition">
                  <FiHeart size={20} />
                </Link>
                <Link to="/cart" className="relative text-slate-700 hover:text-slate-900 transition">
                  <FiShoppingCart size={20} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
                  <FiUser size={20} />
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4 space-y-3">
            <Link to="/products" className="block text-slate-700 hover:text-slate-900">
              Products
            </Link>
            {user && (
              <>
                <Link to="/wishlist" className="block text-slate-700 hover:text-slate-900">
                  Wishlist
                </Link>
                <Link to="/cart" className="block text-slate-700 hover:text-slate-900">
                  Cart ({getTotalItems()})
                </Link>
              </>
            )}
            <Link to="/queries" className="block text-slate-700 hover:text-slate-900">
              Query {unreadQueries > 0 ? `(${unreadQueries > 99 ? '99+' : unreadQueries})` : ''}
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="block text-slate-700 hover:text-slate-900">
                  Profile ({user.name})
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-slate-700 hover:text-slate-900">
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
