import React from 'react';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = React.useState(isInWishlist(product.id));

  React.useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <div className="product-card bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-blue-200">
        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-square overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          
          {/* Badge */}
          {product.discount && (
            <div className="absolute top-3 left-3 bg-rose-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
              -{product.discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={!user}
            className={`absolute top-3 right-3 rounded-full p-2 border shadow-sm transition ${
              user
                ? 'bg-white border-slate-200 hover:shadow-md cursor-pointer'
                : 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-50'
            }`}
          >
            <FiHeart
              size={20}
              className={`heart-icon ${isWishlisted ? 'active' : ''}`}
              fill={isWishlisted ? 'currentColor' : 'none'}
              color={isWishlisted ? '#ef4444' : '#666'}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < product.rating ? 'text-amber-400' : 'text-slate-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-slate-600">({product.reviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-slate-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user) {
                alert('Please login to add items to cart');
                return;
              }
              addToCart(product);
            }}
            disabled={!user}
            className={`w-full py-2.5 rounded-xl transition flex items-center justify-center gap-2 btn-hover-lift font-semibold ${
              user
                ? 'bg-slate-900 text-white hover:bg-slate-700 cursor-pointer shadow-md hover:shadow-lg'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FiShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
