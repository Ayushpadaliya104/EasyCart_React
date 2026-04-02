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

  // Random gradient backgrounds for variety
  const gradientOptions = [
    'from-pink-100 to-purple-100',
    'from-blue-100 to-cyan-100',
    'from-amber-100 to-orange-100',
    'from-emerald-100 to-teal-100',
    'from-violet-100 to-fuchsia-100',
    'from-rose-100 to-orange-100',
  ];
  const gradient = gradientOptions[String(product.id).charCodeAt(0) % gradientOptions.length];

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <div className={`product-card bg-gradient-to-br ${gradient} rounded-3xl border-2 border-white/80 overflow-hidden shadow-lg h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square overflow-hidden rounded-t-3xl">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          
          {/* Badge */}
          {product.discount && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              -{product.discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={!user}
            className={`absolute top-4 right-4 rounded-full p-3 shadow-lg transition transform hover:scale-110 ${
              user
                ? 'bg-white border-2 border-white hover:shadow-xl cursor-pointer'
                : 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-50'
            }`}
          >
            <FiHeart
              size={22}
              className={`heart-icon transition ${isWishlisted ? 'active' : ''}`}
              fill={isWishlisted ? 'currentColor' : 'none'}
              color={isWishlisted ? '#ef4444' : '#999'}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-bold text-gray-800 line-clamp-2 mb-3 text-2xl leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < product.rating ? 'text-amber-400 text-lg' : 'text-gray-300 text-lg'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600 font-semibold">({product.reviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-green-600">
              ₹ {product.price.toFixed(0)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-orange-600 line-through font-bold">
                ₹ {product.originalPrice.toFixed(0)}
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
            className={`w-full py-3 rounded-xl transition flex items-center justify-center gap-2 btn-hover-lift font-bold text-sm shadow-md hover:shadow-xl hover:scale-105 transform ${
              user
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
