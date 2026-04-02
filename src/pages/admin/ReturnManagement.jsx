import React, { useEffect, useMemo, useState } from 'react';
import { FiImage, FiSearch } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchAllReturnRequestsApi, updateReturnRequestStatusApi } from '../../services/orderService';

const RETURN_STATUS_OPTIONS = {
  Requested: ['Approved', 'Rejected'],
  Approved: ['Picked', 'Rejected'],
  Picked: ['Refunded'],
  Rejected: [],
  Refunded: []
};

function ReturnManagement() {
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const loadReturns = async () => {
      try {
        setLoading(true);
        setError('');
        const returnList = await fetchAllReturnRequestsApi({
          status: statusFilter,
          user: userFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        });
        setReturns(returnList);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load return requests');
      } finally {
        setLoading(false);
      }
    };

    loadReturns();
  }, [statusFilter, userFilter, dateFrom, dateTo]);

  const filteredReturns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return returns.filter((item) => {
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchTerm =
        !term ||
        item.orderId.toLowerCase().includes(term) ||
        item.returnItems.some((returnItem) => String(returnItem.productTitle || '').toLowerCase().includes(term)) ||
        item.customer.name.toLowerCase().includes(term) ||
        item.customer.email.toLowerCase().includes(term);

      return matchStatus && matchTerm;
    });
  }, [returns, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
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

  const handleStatusUpdate = async (item, nextStatus) => {
    try {
      setUpdatingId(item.id);
      const updated = await updateReturnRequestStatusApi(item.orderId, item.id, nextStatus);
      setReturns((prev) => prev.map((current) => (current.id === updated.id ? updated : current)));
    } catch (updateError) {
      alert(updateError?.response?.data?.message || 'Failed to update return status');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AdminLayout
      title="Return Management"
      subtitle="Review return history, approve requests, and update pickup and refund statuses."
      activePath="/admin/returns"
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order id, product, customer"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <input
          type="text"
          placeholder="Filter by user (name/email)"
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="All">All Statuses</option>
          <option value="Requested">Requested</option>
          <option value="Approved">Approved</option>
          <option value="Picked">Picked</option>
          <option value="Refunded">Refunded</option>
          <option value="Rejected">Rejected</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl"
          />
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Items</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Reason and Comment</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Photo</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Requested</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading return history...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-rose-600">{error}</td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No return requests found.</td>
              </tr>
            ) : (
              filteredReturns.map((item) => {
                const allowedActions = RETURN_STATUS_OPTIONS[item.status] || [];

                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 align-top">
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{item.orderId}</p>
                      <p className="text-xs text-slate-500">Order status: {item.orderStatus}</p>
                      <p className="text-xs text-slate-500">Total: ₹ {item.total.toFixed(2)}</p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{item.customer.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{item.customer.email || 'N/A'}</p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700 max-w-[260px]">
                      <div className="space-y-1">
                        {item.returnItems.map((returnItem) => (
                          <p key={`${item.id}-${returnItem.orderItemId}`} className="text-xs">
                            <span className="font-semibold text-slate-900">{returnItem.productTitle}</span>
                            {' '}x{returnItem.quantity} - ₹ {returnItem.lineTotal.toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700 max-w-[280px]">
                      <p className="font-semibold text-slate-900">{item.reasonCategory}</p>
                      <p className="line-clamp-4 text-xs mt-1">{item.comment || 'No comment'}</p>
                      <p className="text-xs mt-1 text-slate-500">Refund: ₹ {item.refundAmount.toFixed(2)} ({item.refundStatus})</p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {item.image ? (
                        <a href={item.image} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:underline">
                          <FiImage /> View
                        </a>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {item.requestedAt ? new Date(item.requestedAt).toLocaleString() : 'N/A'}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {allowedActions.length === 0 ? (
                        <span className="text-slate-400">No action</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allowedActions.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              onClick={() => handleStatusUpdate(item, nextStatus)}
                              disabled={updatingId === item.id}
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                            >
                              {updatingId === item.id ? 'Updating...' : nextStatus}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

export default ReturnManagement;

