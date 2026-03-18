import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { mockOrders } from '../../utils/mockData';
import { FiArrowLeft, FiTruck, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

function OrderTracking() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Order not found</p>
          <Link to="/orders" className="text-primary font-semibold mt-4 inline-block">
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
              <FiArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Track Order {order.id}</h1>
              <p className="text-gray-600">Order placed on {order.date}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Timeline Status */}
          <div className="bg-white rounded-lg shadow-soft p-8 mb-8">
            <h2 className="text-2xl font-bold mb-8">Delivery Timeline</h2>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="flex-1 relative">
                    {idx < order.timeline.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-1/2 h-1 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold z-10 ${
                        step.completed ? 'bg-green-500 shadow-lg' : 'bg-gray-300'
                      }`}>
                        {step.completed ? 'OK' : 'o'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="space-y-6">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="flex gap-6 pb-6 border-b last:border-b-0">
                  {/* Timeline Point */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      step.completed ? 'bg-green-500 shadow-lg' : 'bg-gray-400'
                    }`}>
                      {step.completed ? 'OK' : idx + 1}
                    </div>
                    {idx < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-20 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      {step.status === 'Shipped' && <FiTruck className="text-primary" />}
                      {step.status}
                    </h3>
                    {step.date ? (
                      <p className="text-gray-600 text-sm mb-2">{step.date}</p>
                    ) : (
                      <p className="text-gray-400 text-sm mb-2">Not yet available</p>
                    )}
                    
                    {step.completed && (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      step.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {step.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <FiMapPin className="text-primary" />
                Delivery Address
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {order.address}
              </p>
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="text-sm">
                  <p className="text-gray-600">Tracking ID</p>
                  <p className="font-semibold text-lg text-slate-900">{order.trackingId}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h3 className="font-bold text-xl mb-4">Need Help?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiPhone className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Customer Support</p>
                    <p className="font-semibold">1-800-EASYCART</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Email Support</p>
                    <p className="font-semibold">support@easycart.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h3 className="font-bold text-xl mb-6">Order Summary</h3>

            {/* Products */}
            <div className="space-y-4 mb-6 pb-6 border-b">
              {order.products.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  </div>
                  <p className="font-semibold text-lg">${(product.price * product.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${(order.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total Paid</span>
              <span className="text-3xl font-bold text-slate-900">${(order.total * 1.08).toFixed(2)}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              to="/orders"
              className="px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Back to Orders
            </Link>
            <Link
              to="/products"
              className="px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default OrderTracking;

