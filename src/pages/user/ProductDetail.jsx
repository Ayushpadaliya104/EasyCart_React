import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { mockProducts } from '../../utils/mockData';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FiHeart, FiShoppingCart, FiShare2, FiCheck } from 'react-icons/fi';

function ProductDetail() {
  const { id } = useParams();
  const product = mockProducts.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setIsWishlisted(!isWishlisted);
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Product Detail */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-lg">
            {/* Image Gallery */}
            <div>
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                      selectedImage === idx ? 'border-primary' : 'border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Badge */}
              {product.discount && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {product.discount}% OFF
                </span>
              )}

              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < product.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-gray-600">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-green-600 font-semibold">You save ₹{(product.originalPrice - product.price).toFixed(2)}</p>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <FiCheck className="text-green-500" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2 btn-hover-lift"
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                    className={`flex-1 border-2 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-slate-900 bg-red-50 text-slate-900'
                      : 'border-gray-300 text-gray-700 hover:border-slate-900'
                  }`}
                >
                  <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} />
                  Wishlist
                </button>
              </div>

              {/* Share Button */}
              <button className="w-full border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <FiShare2 />
                Share Product
              </button>

              {/* Added Notification */}
              {showAddedNotification && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-2">
                  <FiCheck />
                  Added {quantity} item(s) to cart!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">2 days ago</span>
                </div>
                <p className="text-gray-700">
                  Excellent product! Exactly what I expected. Fast delivery and great customer service. Would definitely recommend!
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetail;

