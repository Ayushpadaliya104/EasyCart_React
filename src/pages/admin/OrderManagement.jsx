import React, { useEffect, useState } from 'react';
import { FiEdit2, FiSearch } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchAllOrdersApi, updateOrderStatusApi } from '../../services/orderService';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const orderList = await fetchAllOrdersApi();
        setOrders(orderList);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateOrderStatus = async (orderId, status) => {
    try {
      const updatedOrder = await updateOrderStatusApi(orderId, status);
      setOrders(prev => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      setEditingOrder(null);
    } catch (updateError) {
      alert(updateError?.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Track every order and quickly update fulfillment status."
      activePath="/admin/orders"
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm">
            <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Order ID</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Customer</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Total</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>Loading orders...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-rose-600" colSpan={6}>{error}</td>
                  </tr>
                ) : filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.userName || order.userEmail || `Customer #${order.userId}`}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{order.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setNewStatus(order.status);
                        }}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
                      >
                        <FiEdit2 size={14} /> Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </section>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Update Order Status</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Order ID: {editingOrder.id}</p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateOrderStatus(editingOrder.id, newStatus)}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OrderManagement;

