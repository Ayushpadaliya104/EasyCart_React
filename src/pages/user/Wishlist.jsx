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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">My Wishlist</h1>
          <p className="text-gray-600">You have {wishlistItems.length} item(s) saved</p>
        </div>
      </section>

      {wishlistItems.length > 0 ? (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* Top Actions */}
            <div className="mb-8 flex justify-between items-center">
              <p className="text-gray-600">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
              <button
                onClick={clearWishlist}
                className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
              >
                <FiTrash2 size={18} />
                Clear All
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {wishlistItems.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-soft overflow-hidden">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-soft p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Ready to buy?</h3>
              <button
                onClick={() => {
                  wishlistItems.forEach(item => {
                    addToCart(item);
                  });
                  clearWishlist();
                }}
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center gap-2 btn-hover-lift"
              >
                <FiShoppingCart />
                Move All to Cart
              </button>
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

