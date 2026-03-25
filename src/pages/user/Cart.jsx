import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { FiTrash2, FiArrowRight, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { settings } = useStoreSettings();
  const taxRate = Number(settings.taxRate || 0);
  const taxAmount = Number((getTotalPrice() * (taxRate / 100)).toFixed(2));
  const finalTotal = Number((getTotalPrice() + taxAmount).toFixed(2));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-extrabold text-white">Shopping Cart</h1>
          <p className="text-blue-100">You have {getTotalItems()} item(s) in your cart</p>
        </div>
      </section>

      {cartItems.length > 0 ? (
        <section className="py-12 px-4 bg-gray-100 min-h-screen">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Cart Table */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-5 gap-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 font-bold">
                    <div>Product</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Total</div>
                    <div className="text-right">Action</div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="md:grid md:grid-cols-5 md:gap-6 p-6 hover:bg-gray-50 transition-colors">
                        {/* Product Info */}
                        <div className="flex gap-6 md:gap-4 md:col-span-1 mb-4 md:mb-0">
                          <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={item.image || 'https://via.placeholder.com/100'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <Link to={`/product/${item.id}`} className="font-bold text-gray-900 hover:text-primary transition line-clamp-2">
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-2">Electronics</p>
                          </div>
                        </div>

                        {/* Price - Mobile Label + Desktop Column */}
                        <div className="flex justify-between md:flex-col md:justify-center md:text-center mb-4 md:mb-0">
                          <span className="md:hidden font-semibold text-gray-700">Price</span>
                          <p className="text-xl font-bold text-slate-900">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity - Mobile Label + Desktop Column */}
                        <div className="flex justify-between md:flex-col md:justify-center md:items-center mb-4 md:mb-0">
                          <span className="md:hidden font-semibold text-gray-700">Quantity</span>
                          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-gray-50 w-fit">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 hover:bg-gray-200 rounded transition disabled:opacity-50"
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Total - Mobile Label + Desktop Column */}
                        <div className="flex justify-between md:flex-col md:justify-center md:text-center mb-4 md:mb-0">
                          <span className="md:hidden font-semibold text-gray-700">Total</span>
                          <p className="text-xl font-bold text-blue-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Action - Mobile Full Width */}
                        <div className="flex justify-end md:flex-col md:justify-center md:items-end gap-4">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-semibold"
                          >
                            <FiTrash2 size={18} />
                            <span className="md:hidden">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24 h-fit">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <FiShoppingCart className="text-slate-900" />
                    Summary
                  </h3>

                  <div className="space-y-4 mb-8 pb-8 border-b">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold">₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Shipping</span>
                      <span className="font-bold text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Tax ({taxRate}%)</span>
                      <span className="font-bold">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-8">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full bg-gradient-to-r from-blue-600 to-slate-900 text-white py-3 rounded-lg font-bold hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2 mb-3"
                  >
                    Checkout
                    <FiArrowRight />
                  </Link>

                  <Link
                    to="/products"
                    className="w-full border-2 border-gray-300 py-3 rounded-lg text-center font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600">
                      ✓ Secure checkout<br/>
                      ✓ Free shipping on all orders<br/>
                      ✓ Easy returns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-4 bg-gray-100 min-h-screen flex items-center">
          <div className="container mx-auto max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-3xl font-bold mb-3 text-gray-900">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any items yet. Start shopping to add items!</p>
              
              <Link
                to="/products"
                className="inline-block bg-gradient-to-r from-blue-600 to-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:shadow-xl transition w-full"
              >
                Start Shopping
              </Link>
              
              <Link
                to="/"
                className="inline-block mt-3 text-primary font-bold hover:underline"
              >
                Back to Home
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

