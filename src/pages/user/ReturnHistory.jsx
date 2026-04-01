import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiX } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchMyOrdersApi } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function ReturnHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

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
        setError(fetchError?.response?.data?.message || 'Failed to load return history');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate, user]);

  const returnEntries = useMemo(() => {
    return orders
      .flatMap((order) =>
        (order.returnRequests || []).map((request) => ({
          id: `${order.id}-${request.id}`,
          orderId: order.id,
          orderDate: order.date,
          orderStatus: order.status,
          total: Number(order.total || 0),
          totalRefunded: Number(order.totalRefunded || 0),
          request
        }))
      )
      .sort((a, b) => new Date(b.request.createdAt || 0).getTime() - new Date(a.request.createdAt || 0).getTime());
  }, [orders]);

  const getReturnStatusBadgeColor = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-amber-100 text-amber-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Picked':
        return 'bg-indigo-100 text-indigo-800';
      case 'Refunded':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-soft py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">My Return History</h1>
            <p className="text-blue-100">See all return requests, statuses, and refund details.</p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white/90 text-slate-900 font-semibold hover:bg-white transition"
          >
            Back to Orders
          </Link>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <p className="text-lg text-gray-600">Loading return history...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <p className="text-lg text-red-600">{error}</p>
            </div>
          ) : returnEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">No Return Requests Yet</h2>
              <p className="text-gray-600 mb-6">Aapne abhi tak koi return request submit nahi ki hai.</p>
              <Link
                to="/orders"
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
              >
                View Orders
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {returnEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-lg shadow-soft border border-slate-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-bold text-lg text-slate-900">Order #{entry.orderId.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-slate-600">Requested on {entry.request.createdAt ? new Date(entry.request.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getReturnStatusBadgeColor(entry.request.status)}`}>
                        {entry.request.status}
                      </span>
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50 transition"
                      >
                        <FiEye /> Details
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-500">Reason</p>
                      <p className="font-semibold text-slate-900 mt-1">{entry.request.reasonCategory}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-500">Items</p>
                      <p className="font-semibold text-slate-900 mt-1">{entry.request.returnItems.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-500">Refund</p>
                      <p className="font-semibold text-emerald-700 mt-1">INR {Number(entry.request.refundAmount || 0).toFixed(2)} ({entry.request.refundStatus})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-2xl">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Return Details</h2>
                <p className="text-sm text-indigo-100">Order #{selectedEntry.orderId.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-lg hover:bg-white/20 transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs uppercase text-slate-500">Return Status</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEntry.request.status}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs uppercase text-slate-500">Order Status</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEntry.orderStatus}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs uppercase text-slate-500">Reason</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEntry.request.reasonCategory}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs uppercase text-slate-500">Refund</p>
                  <p className="font-semibold text-emerald-700 mt-1">INR {Number(selectedEntry.request.refundAmount || 0).toFixed(2)} ({selectedEntry.request.refundStatus})</p>
                </div>
              </div>

              {selectedEntry.request.comment && (
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs uppercase text-slate-500">Comment</p>
                  <p className="text-sm text-slate-800 mt-1">{selectedEntry.request.comment}</p>
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-900 mb-3">Returned Items</h3>
                <div className="space-y-2">
                  {selectedEntry.request.returnItems.map((item) => (
                    <div key={`${selectedEntry.id}-${item.orderItemId}`} className="rounded-lg border border-slate-200 p-3 bg-slate-50 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.productTitle}</p>
                        <p className="text-xs text-slate-600">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">INR {Number(item.lineTotal || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEntry.request.image && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Uploaded Image</h3>
                  <img
                    src={selectedEntry.request.image}
                    alt="Return evidence"
                    className="w-36 h-36 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ReturnHistory;
