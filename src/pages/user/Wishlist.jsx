import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

function Wishlist() {
  const { wishlistItems, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item);
    });
    clearWishlist();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-extrabold text-white">My Wishlist</h1>
          <p className="text-blue-100">You have {wishlistItems.length} item(s) saved</p>
        </div>
      </section>

      {wishlistItems.length > 0 ? (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* Top Actions */}
            <div className="mb-8 flex justify-between items-center gap-4">
              <p className="text-gray-600">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMoveAllToCart}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition"
                >
                  <FiShoppingCart />
                  Move All to Cart
                </button>
                <button
                  onClick={clearWishlist}
                  className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <FiTrash2 size={18} />
                  Clear All
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 justify-items-center">
              {wishlistItems.map(product => (
                <div key={product.id} className="w-full max-w-sm">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </section>
      ) : (
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">Wishlist</div>
              <h2 className="text-3xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your wishlist and they will appear here!</p>
              <Link
                to="/products"
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default Wishlist;

