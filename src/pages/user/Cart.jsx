import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { FiTrash2, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { settings } = useStoreSettings();
  const taxAmount = Number((getTotalPrice() * (Number(settings.taxRate || 0) / 100)).toFixed(2));
  const finalTotal = Number((getTotalPrice() + taxAmount).toFixed(2));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">You have {getTotalItems()} item(s) in your cart</p>
        </div>
      </section>

      {cartItems.length > 0 ? (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-6 border-b last:border-b-0 hover:bg-gray-50 transition">
                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.image || 'https://via.placeholder.com/100'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`} className="font-semibold text-gray-800 hover:text-primary">
                          {item.name}
                        </Link>
                        <p className="text-2xl font-bold text-primary mt-2">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold mb-4">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-soft p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span>₹{taxAmount.toFixed(2)} ({Number(settings.taxRate || 0)}%)</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold mb-6">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2 btn-hover-lift"
                  >
                    Proceed to Checkout
                    <FiArrowRight />
                  </Link>

                  <Link
                    to="/products"
                    className="w-full mt-3 border border-gray-300 py-3 rounded-lg text-center font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">Cart</div>
              <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart and come back later!</p>
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

export default Cart;

