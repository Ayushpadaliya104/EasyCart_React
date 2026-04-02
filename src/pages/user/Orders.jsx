import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiEye, FiX, FiClock, FiTruck, FiCheckCircle, FiBell } from 'react-icons/fi';
import { fetchMyOrdersApi, submitReturnRequestApi } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnForm, setReturnForm] = useState({
    itemIds: [],
    reasonCategory: 'Damaged',
    comment: '',
    image: ''
  });
  const [returnError, setReturnError] = useState('');
  const [returnSuccess, setReturnSuccess] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
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
        return 'bg-yellow-200 text-yellow-900';
      case 'Processing':
        return 'bg-blue-200 text-blue-900';
      case 'Shipped':
        return 'bg-purple-200 text-purple-900';
      case 'Out for Delivery':
        return 'bg-pink-200 text-pink-900';
      case 'Delivered':
        return 'bg-green-200 text-green-900';
      case 'Partially Returned':
        return 'bg-orange-200 text-orange-900';
      case 'Returned / Refunded':
        return 'bg-emerald-200 text-emerald-900';
      case 'Cancelled':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-cyan-200 text-cyan-900';
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

  const getEligibleItemsForReturn = (order) => {
    return (order.items || []).filter((item) => item.itemStatus === 'Delivered');
  };

  const openReturnModal = (order) => {
    const eligibleItems = getEligibleItemsForReturn(order);
    if (eligibleItems.length === 0) {
      setReturnError('Return request already submitted for all products in this order.');
      setReturnSuccess('');
      return;
    }

    setReturnOrder(order);
    setReturnForm({
      itemIds: [String(eligibleItems[0].id || '')],
      reasonCategory: 'Damaged',
      comment: '',
      image: ''
    });
    setReturnError('');
    setReturnSuccess('');
  };

  const closeReturnModal = () => {
    setReturnOrder(null);
    setReturnForm({ itemIds: [], reasonCategory: 'Damaged', comment: '', image: '' });
    setReturnError('');
  };

  const handleReturnImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReturnForm((prev) => ({
        ...prev,
        image: String(reader.result || '')
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitReturnRequest = async () => {
    if (!returnOrder) {
      return;
    }

    if (!Array.isArray(returnForm.itemIds) || returnForm.itemIds.length === 0) {
      setReturnError('Please select at least one item to return.');
      return;
    }

    if (!returnForm.image) {
      setReturnError('Please upload received product photo.');
      return;
    }

    try {
      setSubmittingReturn(true);
      setReturnError('');

      const updatedOrder = await submitReturnRequestApi(returnOrder.id, {
        itemIds: returnForm.itemIds,
        reasonCategory: returnForm.reasonCategory,
        comment: returnForm.comment.trim(),
        image: returnForm.image
      });

      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
      setSelectedOrder((prev) => (prev && prev.id === updatedOrder.id ? updatedOrder : prev));
      setReturnSuccess('Return request submitted successfully.');
      closeReturnModal();
    } catch (submitError) {
      setReturnError(submitError?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-soft py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-2">My Orders</h1>
          <p className="text-blue-100">Track and manage all your orders</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {returnSuccess && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {returnSuccess}
            </div>
          )}

          {returnError && !returnOrder && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {returnError}
            </div>
          )}

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
                        <p className="text-2xl font-bold text-primary">₹ {order.total.toFixed(2)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition"
                      >
                        <FiEye size={20} className="text-purple-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-b from-yellow-50 via-orange-50 to-red-50 rounded-b-lg">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex-shrink-0 text-center w-24">
                          <div className="w-20 h-20 mx-auto bg-white rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden border-2 border-orange-200 shadow-sm">
                            <img
                              src={item.image || 'https://via.placeholder.com/120'}
                              alt={item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 text-orange-900">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex gap-3 flex-wrap">
                    <Link
                      to={`/order/${order.id}/track`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                    >
                      Track Order
                    </Link>
                    {order.eligibleReturnItems?.length > 0 ? (
                      <button
                        onClick={() => openReturnModal(order)}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-pink-700 transition shadow-md"
                      >
                        Request Return
                      </button>
                    ) : ['Delivered', 'Partially Returned'].includes(order.status) ? (
                      <button
                        disabled
                        title="Return request is allowed only within 7 days after delivery"
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Return Window Expired
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Return option will be available after order is delivered"
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Return After Delivery
                      </button>
                    )}
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
          <div className="bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto border-2 border-purple-200 shadow-2xl">
            <div className="p-6 border-b-2 border-purple-200 flex justify-between items-center sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              <h2 className="text-2xl font-bold text-white">Order Details - #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <FiX size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-4 rounded-lg border-l-4 border-cyan-500">
                <h3 className="font-bold mb-4 text-blue-900">Order Status</h3>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            step.completed ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}
                        >
                          {step.completed ? 'âœ“' : idx + 1}
                        </div>
                        {idx < selectedOrder.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            step.completed ? 'bg-gradient-to-b from-green-400 to-emerald-600' : 'bg-gradient-to-b from-gray-400 to-gray-300'
                          }`}></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">{step.status}</p>
                        {step.date && <p className="text-sm text-blue-700">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 p-4 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold mb-3 text-orange-900">Items Ordered</h3>
                <div className="space-y-2">
                  {selectedOrder.products.map((product, idx) => (
                    <div key={idx} className="flex justify-between bg-white bg-opacity-70 p-2 rounded hover:bg-opacity-100 transition">
                      <span className="text-orange-900">{product.name} x{product.quantity}</span>
                      <span className="font-semibold text-orange-700">₹ {(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold mb-2 text-purple-900">Delivery Address</h3>
                <p className="text-purple-800">{selectedOrder.address}</p>
              </div>

              {(selectedOrder.returnRequests || []).length > 0 && (
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-lg border-l-4 border-rose-500">
                  <h3 className="font-bold mb-2 text-rose-900">Return Requests</h3>
                  <div className="space-y-3">
                    {selectedOrder.returnRequests.map((request) => (
                      <div key={request.id} className="bg-white/80 rounded-lg p-3 border border-rose-200">
                        <p className="text-sm font-semibold text-rose-900">{request.reasonCategory}</p>
                        <div className="mt-1 space-y-1">
                          {request.returnItems.map((returnItem) => (
                            <p key={`${request.id}-${returnItem.orderItemId}`} className="text-xs text-rose-800">
                              {returnItem.productTitle} x{returnItem.quantity}
                            </p>
                          ))}
                        </div>
                        {request.comment && <p className="text-xs text-rose-800 mt-1">Comment: {request.comment}</p>}
                        <p className="text-xs text-rose-700 mt-1">Status: {request.status}</p>
                        <p className="text-xs text-rose-700 mt-1">Refund: ₹ {Number(request.refundAmount || 0).toFixed(2)}</p>
                        {request.image && (
                          <img
                            src={request.image}
                            alt="Returned item"
                            className="mt-2 w-24 h-24 object-cover rounded-lg border border-rose-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-lg border-l-4 border-teal-500">
                <div className="flex justify-between mb-2 text-teal-900">
                  <span className="font-semibold">Subtotal</span>
                  <span>₹ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3 text-teal-900">
                  <span className="font-semibold">Tax</span>
                  <span>₹ {selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-2 rounded">
                  <span>Total</span>
                  <span>₹ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {returnOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Request Return</h2>
              <button onClick={closeReturnModal} className="p-2 rounded-lg hover:bg-slate-100">
                <FiX />
              </button>
            </div>

            {returnError && (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {returnError}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Items</label>
                <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 space-y-2">
                  {getEligibleItemsForReturn(returnOrder).map((item) => {
                    const checked = returnForm.itemIds.includes(String(item.id));
                    return (
                      <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setReturnForm((prev) => {
                              const targetId = String(item.id);
                              return {
                                ...prev,
                                itemIds: event.target.checked
                                  ? [...prev.itemIds, targetId]
                                  : prev.itemIds.filter((id) => id !== targetId)
                              };
                            });
                          }}
                        />
                        <span>{item.title} x{item.quantity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={returnForm.reasonCategory}
                  onChange={(event) => setReturnForm((prev) => ({ ...prev, reasonCategory: event.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="Damaged">Damaged</option>
                  <option value="Wrong item">Wrong item</option>
                  <option value="Not satisfied">Not satisfied</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Comment (Optional)</label>
                <textarea
                  value={returnForm.comment}
                  onChange={(event) => setReturnForm((prev) => ({ ...prev, comment: event.target.value }))}
                  rows={3}
                  placeholder="Extra details about your return"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Received Product Photo</label>
                <input type="file" accept="image/*" onChange={handleReturnImageUpload} className="w-full" />
                {returnForm.image && (
                  <img src={returnForm.image} alt="Return preview" className="mt-2 w-28 h-28 object-cover rounded-lg border border-slate-200" />
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={closeReturnModal} className="flex-1 border border-slate-300 px-4 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={submitReturnRequest}
                disabled={submittingReturn}
                className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                {submittingReturn ? 'Submitting...' : 'Submit Return'}
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

