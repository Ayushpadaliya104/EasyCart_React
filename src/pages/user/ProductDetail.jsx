import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { fetchProductById } from '../../services/productService';

const REVIEW_STORAGE_PREFIX = 'easycart_product_reviews_';

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    try {
      const raw = localStorage.getItem(`${REVIEW_STORAGE_PREFIX}${product.id}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setProductReviews(Array.isArray(parsed) ? parsed : []);
    } catch (_error) {
      setProductReviews([]);
    }
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">{error || 'Product not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    addToCart({ ...product, quantity });
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const handleWishlist = () => {
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

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      alert('Please login to add a review');
      return;
    }

    const comment = reviewForm.comment.trim();
    if (!comment) {
      setReviewError('Please write your review before submitting.');
      return;
    }

    const nextReview = {
      id: `${Date.now()}`,
      name: user.name || 'Customer',
      rating: Number(reviewForm.rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    const nextReviews = [nextReview, ...productReviews];
    setProductReviews(nextReviews);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');

    try {
      localStorage.setItem(`${REVIEW_STORAGE_PREFIX}${product.id}`, JSON.stringify(nextReviews));
    } catch (_error) {
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image];
  const baseReviewCount = Number(product.reviews || 0);
  const baseRating = Number(product.rating || 0);
  const localReviewCount = productReviews.length;
  const localRatingTotal = productReviews.reduce((total, review) => total + Number(review.rating || 0), 0);
  const displayReviewCount = baseReviewCount + localReviewCount;
  const displayRating = displayReviewCount > 0
    ? ((baseRating * baseReviewCount) + localRatingTotal) / displayReviewCount
    : 0;
  const filledStars = Math.round(displayRating);
  const descriptionText = String(product.description || '');
  const descriptionLines = Math.max(
    1,
    descriptionText.split(/\r?\n/).filter(line => line.trim().length > 0).length
  );
  const clampedDescriptionLines = Math.min(10, descriptionLines);
  const imageHeight = 300 + ((clampedDescriptionLines - 1) * 18);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      {/* Product Detail */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-3xl shadow-2xl items-stretch">
            {/* Image Gallery - Left Side */}
            <div className="h-full flex flex-col justify-center">
              <div
                className="mb-4 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 w-full flex items-center justify-center"
                style={{ height: `${imageHeight}px` }}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-3"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all duration-300 shadow-md hover:shadow-lg ${
                      selectedImage === idx 
                        ? 'border-indigo-600 scale-110 shadow-xl ring-4 ring-indigo-300' 
                        : 'border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div>
              {/* Badge */}
              {product.discount && (
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-red-500 via-red-600 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse hover:scale-110 transition-transform">
                    🔥 SPECIAL OFFER: {product.discount}% OFF
                  </span>
                </div>
              )}

              <h1 className="text-2xl lg:text-3xl font-black mb-3 text-gray-900 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
                <div className="flex text-yellow-500 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="drop-shadow-lg">{i < filledStars ? '★' : '☆'}</span>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-bold">{displayRating.toFixed(1)}/5</p>
                  <p className="text-gray-700 font-semibold text-xs">({displayReviewCount} reviews)</p>
                </div>
              </div>

              {/* Price - Premium Design */}
              <div className="mb-4 pb-4 border-b-4 border-gradient-to-r from-green-400 to-emerald-400">
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 rounded-3xl mb-2 border-3 border-green-200 shadow-lg">
                  <p className="text-gray-700 text-xs font-semibold mb-2">💰 Best Price</p>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through font-bold">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <p className="text-green-600 font-black text-xs">
                      ✓ Save ₹{(product.originalPrice - product.price).toFixed(2)} (Best Deal!)
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 text-sm leading-relaxed bg-gray-50 p-3 rounded-2xl border-l-4 border-indigo-600 whitespace-pre-line break-words max-h-[220px] overflow-y-auto pr-1">{product.description}</p>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-xs font-black mb-2 text-gray-900">📦 Quantity:</label>
                <div className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-200 p-3 rounded-2xl w-fit shadow-lg border-2 border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-black transition-all duration-200 shadow-lg hover:shadow-xl text-lg transform hover:scale-110"
                  >
                    −
                  </button>
                  <span className="text-2xl font-black text-gray-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-black transition-all duration-200 shadow-lg hover:shadow-xl text-lg transform hover:scale-110"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-3 rounded-2xl font-black hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl hover:shadow-3xl text-sm transform hover:scale-105 border-2 border-indigo-400"
                >
                  <FiShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3 rounded-2xl font-black transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl text-sm transform hover:scale-105 border-3 ${
                    isWishlisted
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 border-red-400 hover:shadow-3xl'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-red-50 hover:to-pink-50 border-gray-400 hover:border-red-400'
                  }`}
                >
                  <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              {/* Added Notification */}
              {showAddedNotification && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-400 to-emerald-400 border-4 border-green-600 rounded-2xl text-white flex items-center gap-3 shadow-2xl font-black text-sm animate-bounce transform scale-105">
                  <FiCheck size={24} className="flex-shrink-0" />
                  <span>🎉 Added {quantity} item(s) to cart! ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">🌟 Customer Reviews</h2>

          <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-100 mb-4">
            <h3 className="font-bold text-gray-900 mb-3">Write a Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Share your experience about this product"
                />
              </div>
            </div>
            {reviewError && (
              <p className="text-sm text-red-600 mt-2">{reviewError}</p>
            )}
            <button
              type="submit"
              className="mt-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Submit Review
            </button>
          </form>

          <div className="space-y-4">
            {productReviews.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-100 text-gray-600">
                No user reviews yet. Be the first to review this product.
              </div>
            ) : productReviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-2 border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{review.name}</h4>
                    <div className="flex text-yellow-400 text-sm mt-1">
                      {[...Array(5)].map((_, j) => <span key={j}>{j < review.rating ? '★' : '☆'}</span>)}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.comment}
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

