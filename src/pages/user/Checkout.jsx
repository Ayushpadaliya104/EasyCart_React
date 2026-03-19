import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { validateField } from '../../utils/validators';
import { FiArrowRight } from 'react-icons/fi';
import { createOrderApi } from '../../services/orderService';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const fieldsToValidate = step === 1
      ? ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipcode']
      : ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];

    let newErrors = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    setApiError('');
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setApiError('Please login to place an order.');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');

      await createOrderApi({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode
        },
        paymentMethod
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      setApiError(error?.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold"
          >
            Return to Cart
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step Indicator */}
              <div className="flex gap-4 mb-8">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold mx-auto mb-2 ${
                      s <= step
                        ? 'bg-primary text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {s}
                    </div>
                    <p className="text-center text-sm">{
                      s === 1 ? 'Address' : s === 2 ? 'Payment' : 'Review'
                    }</p>
                  </div>
                ))}
              </div>

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                  {errors.lastName && <p className="error-message">{errors.lastName}</p>}

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="error-message mb-4">{errors.email}</p>}

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="error-message mb-4">{errors.phone}</p>}

                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="error-message mb-4">{errors.address}</p>}

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      name="zipcode"
                      placeholder="Zip Code"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.zipcode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.city && <p className="error-message">{errors.city}</p>}
                  {errors.state && <p className="error-message">{errors.state}</p>}
                  {errors.zipcode && <p className="error-message mb-4">{errors.zipcode}</p>}

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center justify-center gap-2 btn-hover-lift"
                  >
                    Continue to Payment
                    <FiArrowRight />
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                  <div className="mb-6">
                    <label className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg cursor-pointer mb-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-semibold">Credit / Debit Card</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-semibold">PayPal</span>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mb-6">
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Cardholder Name"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 ${
                          errors.cardName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardName && <p className="error-message mb-4">{errors.cardName}</p>}

                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number (16 digits)"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 ${
                          errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && <p className="error-message mb-4">{errors.cardNumber}</p>}

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="cardExpiry"
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.cardExpiry ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        <input
                          type="text"
                          name="cardCVV"
                          placeholder="CVV"
                          value={formData.cardCVV}
                          onChange={handleInputChange}
                          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.cardCVV ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.cardExpiry && <p className="error-message">{errors.cardExpiry}</p>}
                      {errors.cardCVV && <p className="error-message">{errors.cardCVV}</p>}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center justify-center gap-2 btn-hover-lift"
                    >
                      Review Order
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6">Order Review</h2>

                  {apiError && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {apiError}
                    </p>
                  )}

                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold mb-3">Shipping Address:</h3>
                    <p className="text-gray-700">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.state} {formData.zipcode}<br />
                      {formData.email} | {formData.phone}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold mb-3">Payment Method:</h3>
                    <p className="text-gray-700">
                      {paymentMethod === 'card' ? `Card ending in ${formData.cardNumber.slice(-4)}` : 'PayPal'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition btn-hover-lift"
                    >
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white rounded-lg shadow-soft p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-3 mb-6 pb-6 border-b max-h-96 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{(getTotalPrice() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{(getTotalPrice() * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Checkout;

