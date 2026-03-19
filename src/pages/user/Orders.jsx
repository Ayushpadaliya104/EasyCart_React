import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiEye, FiX, FiClock, FiTruck, FiCheckCircle, FiBell } from 'react-icons/fi';
import { fetchMyOrdersApi } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const orderList = await fetchMyOrdersApi();
        setOrders(orderList);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FiClock className="inline mr-1" />;
      case 'Shipped':
      case 'Out for Delivery':
        return <FiTruck className="inline mr-1" />;
      case 'Delivered':
        return <FiCheckCircle className="inline mr-1" />;
      default:
        return <FiBell className="inline mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-white shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">My Orders</h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <p className="text-lg text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <p className="text-lg text-red-600">{error}</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-hover transition">
                  <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Order #{order.id.slice(-8).toUpperCase()}</h3>
                      <p className="text-gray-600 text-sm">Placed on {order.date}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">INR {order.total.toFixed(2)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <FiEye size={20} className="text-primary" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.products.map((product, idx) => (
                        <div key={idx} className="flex-shrink-0 text-center">
                          <div className="w-20 h-20 bg-white rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <div className="text-4xl">#</div>
                            )}
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 w-24">{product.name}</p>
                          <p className="text-xs text-gray-600">x{product.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex gap-3 flex-wrap">
                    <Link
                      to={`/order/${order.id}/track`}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
                    >
                      Track Order
                    </Link>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <div className="text-6xl mb-4">Orders</div>
              <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You have not placed any orders yet. Start shopping today!</p>
              <Link
                to="/products"
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
              >
                Shop Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Order Details - #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold mb-4">Order Status</h3>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {step.completed ? 'OK' : idx + 1}
                        </div>
                        {idx < selectedOrder.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{step.status}</p>
                        {step.date && <p className="text-sm text-gray-600">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Items Ordered</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {selectedOrder.products.map((product, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{product.name} x{product.quantity}</span>
                      <span className="font-semibold">INR {(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Delivery Address</h3>
                <p className="text-gray-700">{selectedOrder.address}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>INR {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>INR {selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-900">
                  <span>Total</span>
                  <span>INR {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Orders;
