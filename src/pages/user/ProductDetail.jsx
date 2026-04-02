import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiShoppingCart, FiCheck } from 'react-icons/fi';
import {
  fetchProductById,
  fetchProductFeedback,
  saveProductRating,
  createProductReviewApi
} from '../../services/productService';

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
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [productReviews, setProductReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();

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
      setIsWishlisted(false);
      return;
    }

    setIsWishlisted(isInWishlist(product.id));
  }, [product?.id, isInWishlist, wishlistItems]);

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    const loadFeedback = async () => {
      try {
        const data = await fetchProductFeedback(product.id);
        setRatingSummary({
          average: Number(data.ratings?.average || 0),
          count: Number(data.ratings?.count || 0)
        });
        setSelectedRating(Number(data.ratings?.myRating || 0));
        setProductReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (_error) {
        setRatingSummary({ average: Number(product.rating || 0), count: Number(product.reviews || 0) });
        setSelectedRating(0);
        setProductReviews([]);
      }
    };

    loadFeedback();
  }, [product?.id, product?.rating, product?.reviews, user?.email]);

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

  const handleRatingSubmit = async (event) => {
    event.preventDefault();

    if (!user || !user.email) {
      alert('Please login to rate this product');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setRatingError('Please select a star rating first.');
      return;
    }

    try {
      const response = await saveProductRating(product.id, selectedRating);
      setRatingSummary({
        average: Number(response.ratings?.average || 0),
        count: Number(response.ratings?.count || 0)
      });
      setSelectedRating(Number(response.ratings?.myRating || selectedRating));
      setRatingError('');
      setRatingMessage(response.message || 'Rating saved.');
    } catch (submitError) {
      setRatingError(submitError?.response?.data?.message || 'Failed to save rating. Please try again.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      alert('Please login to add a review');
      return;
    }

    const comment = reviewComment.trim();
    if (!comment) {
      setReviewError('Please write your review before submitting.');
      return;
    }

    try {
      const response = await createProductReviewApi(product.id, comment);
      const nextReview = response.review || {
        id: `${Date.now()}`,
        name: user.name || 'Customer',
        comment,
        createdAt: new Date().toISOString(),
      };
      setProductReviews((prev) => [nextReview, ...prev]);
      setReviewComment('');
      setReviewError('');
    } catch (submitError) {
      setReviewError(submitError?.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image];
  const displayRatingCount = Number(ratingSummary.count || product.reviews || 0);
  const displayRating = Number(
    displayRatingCount > 0 ? (ratingSummary.average || product.rating || 0) : 0
  );
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
                className="mb-4 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 w-full flex items-center justify-center"
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
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="drop-shadow-lg">{i < filledStars ? '★' : '☆'}</span>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-bold">{displayRating.toFixed(1)}/5</p>
                  <p className="text-gray-700 font-semibold text-xs">({displayRatingCount} ratings)</p>
                </div>
              </div>

              {/* Price - Premium Design */}
              <div className="mb-4 pb-4 border-b-4 border-gradient-to-r from-green-400 to-emerald-400">
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 rounded-3xl mb-2 border-3 border-green-200 shadow-lg">
                  <p className="text-gray-700 text-xs font-semibold mb-2">💰 Best Price</p>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ₹ {product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through font-bold">
                        ₹ {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <p className="text-green-600 font-black text-xs">
                      ✓ Save ₹ {(product.originalPrice - product.price).toFixed(2)} (Best Deal!)
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
      <section className="py-12 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-black mb-8 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">⭐ Customer Reviews</h2>

          <form onSubmit={handleRatingSubmit} className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-purple-200 mb-6">
            <h3 className="font-bold text-2xl text-gray-900 mb-4">Rate This Product</h3>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setSelectedRating(star);
                    setRatingMessage('');
                    setRatingError('');
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl leading-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <span className={(hoveredRating || selectedRating) >= star ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {selectedRating > 0 ? `${selectedRating}/5 selected` : 'Select rating'}
              </span>
            </div>
            {ratingError && <p className="text-sm text-red-600 mb-2">{ratingError}</p>}
            {ratingMessage && <p className="text-sm text-emerald-700 mb-2">{ratingMessage}</p>}
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Save Rating
            </button>
          </form>

          <form onSubmit={handleReviewSubmit} className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-3xl shadow-2xl border-2 border-purple-200 mb-6">
            <h3 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">✍️ Write a Review</h3>
            <div>
              <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="w-full border-2 border-purple-300 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition bg-white"
                placeholder="Share your experience about this product"
              />
            </div>
            {reviewError && (
              <p className="text-sm text-red-600 mt-3 font-bold bg-red-100 p-2 rounded-lg">⚠️ {reviewError}</p>
            )}
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 transition transform hover:scale-105"
            >
              🚀 Submit Review
            </button>
          </form>

          <div className="space-y-4">
            {productReviews.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl shadow-lg border-2 border-blue-300 text-blue-800 font-semibold text-center">
                📝 No user reviews yet. Be the first to review this product!
              </div>
            ) : productReviews.map((review) => (
              <div key={review.id} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 p-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-pink-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{review.name}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mt-2 text-right">
                      📅 {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed font-medium border-l-4 border-pink-400 pl-4 bg-white/50 py-3 px-4 rounded-lg">
                  💬 {review.comment}
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

