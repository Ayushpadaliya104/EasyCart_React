import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { validateField } from '../../utils/validators';
import { FiArrowRight } from 'react-icons/fi';
import { createOrderApi } from '../../services/orderService';
import { createRazorpayOrderApi, verifyRazorpayPaymentApi } from '../../services/paymentService';

const splitName = (name = '') => {
  const trimmedName = String(name).trim();

  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ')
  };
};

const getPrefilledShippingData = (user) => {
  const nameParts = splitName(user?.name || '');
  const savedAddress = user?.defaultShippingAddress || {};

  return {
    firstName: savedAddress.firstName || nameParts.firstName || '',
    lastName: savedAddress.lastName || nameParts.lastName || '',
    email: savedAddress.email || user?.email || '',
    phone: savedAddress.phone || user?.phone || '',
    address: savedAddress.address || user?.address || '',
    city: savedAddress.city || '',
    state: savedAddress.state || '',
    zipcode: savedAddress.zipcode || ''
  };
};

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const runMockGatewayFlow = async () => {
  const approved = window.confirm(
    'Fake Razorpay Payment\n\nPress OK to simulate successful payment.\nPress Cancel to simulate failed/cancelled payment.'
  );

  if (!approved) {
    throw new Error('Mock payment cancelled by user');
  }

  return {
    razorpay_payment_id: `pay_mock_${Date.now()}`,
    razorpay_signature: 'mock_signature'
  };
};

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const prefilledShipping = getPrefilledShippingData(user);
  const [formData, setFormData] = useState({
    ...prefilledShipping,
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
  });

  useEffect(() => {
    const shippingFromProfile = getPrefilledShippingData(user);
    setFormData((prev) => ({
      ...prev,
      ...shippingFromProfile
    }));
  }, [user]);

  const taxAmount = Number((getTotalPrice() * (Number(settings.taxRate || 0) / 100)).toFixed(2));
  const finalTotal = Number((getTotalPrice() + taxAmount).toFixed(2));

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
    let fieldsToValidate = [];

    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipcode'];
    }

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
    setPaymentStatus('');
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentStatus('Creating Razorpay test order...');

    const paymentOrderResponse = await createRazorpayOrderApi({
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    });

    if (paymentOrderResponse.mockMode) {
      setPaymentStatus('Opening fake Razorpay gateway...');
      const mockPayment = await runMockGatewayFlow();

      setPaymentStatus('Verifying mock payment...');

      await verifyRazorpayPaymentApi({
        razorpay_order_id: paymentOrderResponse.order.id,
        ...mockPayment
      });

      setPaymentStatus('Mock payment verified.');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay checkout. Please check your internet connection and try again.');
    }

    setPaymentStatus('Opening Razorpay popup...');

    const paymentResult = await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: paymentOrderResponse.keyId,
        amount: paymentOrderResponse.order.amount,
        currency: paymentOrderResponse.order.currency,
        name: settings.storeName || 'EasyCart',
        description: 'EasyCart Test Payment',
        order_id: paymentOrderResponse.order.id,
        handler: (response) => {
          resolve(response);
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          mode: 'test'
        },
        theme: {
          color: '#0f172a'
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Razorpay checkout closed by user'));
          }
        }
      });

      rzp.on('payment.failed', () => {
        reject(new Error('Razorpay test payment failed'));
      });

      rzp.open();
    });

    setPaymentStatus('Verifying Razorpay payment...');

    await verifyRazorpayPaymentApi(paymentResult);

    setPaymentStatus('Razorpay test payment verified.');
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
      setPaymentStatus('');

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
      }

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-rose-50">
      <Navbar />

      <section className="relative overflow-hidden py-12 px-4">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="container mx-auto max-w-6xl">
          <h1 className="mb-8 bg-gradient-to-r from-sky-700 via-fuchsia-700 to-emerald-700 bg-clip-text text-4xl font-extrabold text-transparent">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step Indicator */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1">
                    <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                      s <= step
                        ? 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-200'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}>
                      {s}
                    </div>
                    <p className="text-center text-sm font-semibold text-slate-700">{
                      s === 1 ? 'Address' : s === 2 ? 'Payment' : 'Review'
                    }</p>
                  </div>
                ))}
              </div>

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="mb-8 rounded-2xl border border-sky-100 bg-white/90 p-8 shadow-xl shadow-sky-100/60 backdrop-blur">
                  <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Profile ka default shipping address yahan auto-fill hota hai. Aap checkout ke liye isse change bhi kar sakte ho.
                  </p>
                  
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:brightness-110 btn-hover-lift"
                  >
                    Continue to Payment
                    <FiArrowRight />
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="mb-8 rounded-2xl border border-violet-100 bg-white/90 p-8 shadow-xl shadow-violet-100/60 backdrop-blur">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                  <div className="mb-6">
                    <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-lg border-2 border-cyan-300 bg-cyan-50/70 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-semibold">Online Payment (Razorpay)</span>
                    </label>
                    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border-2 border-amber-300 bg-amber-50/70 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-semibold">Cash on Delivery</span>
                    </label>
                  </div>

                  {paymentMethod === 'razorpay' && (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                      Secure online payment via Razorpay.
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="btn-hover-lift flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 py-3 font-semibold text-white shadow-lg shadow-fuchsia-200 transition hover:brightness-110"
                    >
                      Review Order
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="mb-8 rounded-2xl border border-emerald-100 bg-white/90 p-8 shadow-xl shadow-emerald-100/60 backdrop-blur">
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
                      {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                    </p>
                    {paymentMethod === 'razorpay' && paymentStatus && (
                      <p className="text-sm text-green-700 mt-2">{paymentStatus}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="btn-hover-lift flex-1 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="sticky top-24 rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-xl shadow-sky-100/60 backdrop-blur">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-3 mb-6 pb-6 border-b max-h-96 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
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
                    <span>₹{taxAmount.toFixed(2)} ({Number(settings.taxRate || 0)}%)</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                </div>

                <div className="mt-2 flex justify-between rounded-xl bg-gradient-to-r from-rose-50 via-fuchsia-50 to-amber-50 px-4 py-3 text-xl font-bold">
                  <span>Total</span>
                  <span className="text-rose-500">₹{finalTotal.toFixed(2)}</span>
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

