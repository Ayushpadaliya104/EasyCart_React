import React, { useEffect, useState } from 'react';
import { FiEdit2, FiEye, FiSearch, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchAllOrdersApi, fetchOrderByIdApi, updateOrderStatusApi } from '../../services/orderService';
import { useStoreSettings } from '../../context/StoreSettingsContext';

function OrderManagement() {
  const { settings } = useStoreSettings();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

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
      case 'Partially Returned': return 'bg-orange-100 text-orange-800';
      case 'Returned / Refunded': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-amber-100 text-amber-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800';
      case 'Picked':
        return 'bg-indigo-100 text-indigo-800';
      case 'Refunded':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDisplayAddress = (shippingAddress) => {
    if (!shippingAddress) {
      return 'Address not available';
    }

    return [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipcode
    ]
      .filter(Boolean)
      .join(', ');
  };

  const openOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const fullOrder = await fetchOrderByIdApi(orderId);
      setDetailsOrder(fullOrder);
    } catch (fetchDetailsError) {
      setDetailsError(fetchDetailsError?.response?.data?.message || 'Failed to load order details');
      setDetailsOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeOrderDetails = () => {
    setDetailsOrder(null);
    setDetailsError('');
  };

  const formatMoney = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const handlePrintInvoice = () => {
    if (!detailsOrder) {
      return;
    }

    const companyInfo = {
      name: settings.storeName || 'EasyCart',
      line1: settings.address || '123 Business Ave, City, State 12345',
      line2: `Support: ${settings.email || 'support@easycart.com'} | ${settings.phone || '+91-90909-90909'}`,
      gstin: '24ABCDE1234F1Z9',
      stateCode: '24'
    };

    const itemsHtml = (detailsOrder.items || [])
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${Number(item.quantity || 0)}</td>
            <td>${formatMoney(item.price)}</td>
            <td>${formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</td>
          </tr>
        `
      )
      .join('');

    const shippingAddress = detailsOrder.shippingAddress || {};
    const customerName =
      [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(' ') || detailsOrder.userName || 'N/A';

    const subtotal = Number(detailsOrder.subtotal || 0);
    const tax = Number(detailsOrder.tax || 0);
    const shippingCharge = Number(detailsOrder.shippingCharge || 0);
    const total = Number(detailsOrder.total || 0);

    const gstRate = subtotal > 0 ? Math.round((tax / subtotal) * 100) : 0;
    const cgst = tax / 2;
    const sgst = tax / 2;

    const invoiceHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${escapeHtml(detailsOrder.id)}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; background: #ffffff; }
            .page { width: 100%; max-width: 980px; margin: 0 auto; padding: 28px; }
            .brand-strip { height: 8px; border-radius: 12px; background: linear-gradient(90deg, #0f172a 0%, #0ea5e9 45%, #16a34a 100%); margin-bottom: 18px; }
            .row { display: flex; justify-content: space-between; gap: 20px; }
            .brand-block { display: flex; gap: 12px; align-items: center; }
            .logo-badge { width: 48px; height: 48px; border-radius: 12px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; letter-spacing: 0.03em; }
            .muted { color: #475569; }
            .invoice-title { font-size: 28px; margin: 0; line-height: 1.1; }
            .invoice-meta { text-align: right; font-size: 13px; }
            .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
            .box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; background: #f8fafc; }
            .box h3 { margin: 0 0 8px; font-size: 12px; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; }
            .box p { margin: 4px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px; font-size: 12px; text-align: left; }
            th { background: #eef2f7; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: #334155; }
            .num { text-align: right; }
            .summary-wrap { margin-top: 12px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; }
            .tax-box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; }
            .tax-box h4 { margin: 0 0 8px; font-size: 12px; color: #334155; letter-spacing: 0.05em; text-transform: uppercase; }
            .tax-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
            .totals { border: 1px solid #0f172a; border-radius: 12px; padding: 12px; background: #f8fafc; }
            .totals .tax-row strong { font-size: 16px; }
            .footer-note { margin-top: 16px; border-top: 1px dashed #94a3b8; padding-top: 10px; font-size: 11px; color: #475569; line-height: 1.5; }
            @media print {
              .page { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="brand-strip"></div>

            <div class="row">
              <div class="brand-block">
                <div class="logo-badge">EC</div>
                <div>
                  <p style="margin:0; font-size:12px; color:#64748b; letter-spacing:0.06em; text-transform:uppercase;">Tax Invoice</p>
                  <h1 class="invoice-title">EasyCart</h1>
                  <p class="muted" style="margin:4px 0 0; font-size:12px;">Smart Commerce, Fast Delivery</p>
                </div>
              </div>
              <div class="invoice-meta">
                <p style="margin:0;"><strong>Invoice No:</strong> INV-${escapeHtml(String(detailsOrder.id).slice(-8).toUpperCase())}</p>
                <p style="margin:4px 0 0;"><strong>Order ID:</strong> ${escapeHtml(detailsOrder.id)}</p>
                <p style="margin:4px 0 0;"><strong>Date:</strong> ${escapeHtml(detailsOrder.date)}</p>
                <p style="margin:4px 0 0;"><strong>Status:</strong> ${escapeHtml(detailsOrder.status)}</p>
                <p style="margin:4px 0 0;"><strong>Payment:</strong> ${escapeHtml(String(detailsOrder.paymentMethod || '').toUpperCase())}</p>
              </div>
            </div>

            <div class="section-grid">
              <div class="box">
                <h3>Billed By</h3>
                <p><strong>${escapeHtml(companyInfo.name)}</strong></p>
                <p>${escapeHtml(companyInfo.line1)}</p>
                <p>${escapeHtml(companyInfo.line2)}</p>
                <p><strong>GSTIN:</strong> ${escapeHtml(companyInfo.gstin)}</p>
                <p><strong>State Code:</strong> ${escapeHtml(companyInfo.stateCode)}</p>
              </div>

              <div class="box">
                <h3>Billed To</h3>
                <p><strong>${escapeHtml(customerName)}</strong></p>
                <p>${escapeHtml(shippingAddress.email || detailsOrder.userEmail || 'N/A')}</p>
                <p>${escapeHtml(shippingAddress.phone || 'N/A')}</p>
                <p>${escapeHtml(getDisplayAddress(shippingAddress))}</p>
              </div>
            </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th class="num">Qty</th>
                <th class="num">Unit Price</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="5">No items found</td></tr>'}
            </tbody>
          </table>

            <div class="summary-wrap">
              <div class="tax-box">
                <h4>GST Summary</h4>
                <div class="tax-row"><span>Taxable Value</span><span>${formatMoney(subtotal)}</span></div>
                <div class="tax-row"><span>GST Rate</span><span>${gstRate}%</span></div>
                <div class="tax-row"><span>CGST (${Math.round(gstRate / 2)}%)</span><span>${formatMoney(cgst)}</span></div>
                <div class="tax-row"><span>SGST (${Math.round(gstRate / 2)}%)</span><span>${formatMoney(sgst)}</span></div>
              </div>

              <div class="totals">
                <div class="tax-row"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
                <div class="tax-row"><span>Tax</span><span>${formatMoney(tax)}</span></div>
                <div class="tax-row"><span>Shipping</span><span>${formatMoney(shippingCharge)}</span></div>
                <div class="tax-row"><strong>Grand Total</strong><strong>${formatMoney(total)}</strong></div>
              </div>
            </div>

            <div class="footer-note">
              <p><strong>Notes:</strong> This is a computer-generated invoice and does not require a physical signature.</p>
              <p>Goods once sold will only be returned/replaced as per EasyCart return policy.</p>
              <p>For support, contact ${escapeHtml(companyInfo.line2)}.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=980,height=700');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups and try again.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Returns</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={7}>Loading orders...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-rose-600" colSpan={7}>{error}</td>
                  </tr>
                ) : filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.userName || order.userEmail || `Customer #${order.userId}`}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹ {order.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {(order.returnRequests || []).length > 0 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                          {(order.returnRequests || []).length} request(s)
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order.id)}
                          className="flex items-center gap-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setNewStatus(order.status);
                          }}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
                        >
                          <FiEdit2 size={14} /> Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </section>

      {/* Details Modal */}
      {(detailsLoading || detailsOrder || detailsError) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
              <div className="flex items-center gap-2">
                {detailsOrder && !detailsLoading && !detailsError && (
                  <button
                    onClick={handlePrintInvoice}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium"
                  >
                    Print Invoice
                  </button>
                )}
                <button
                  onClick={closeOrderDetails}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {detailsLoading ? (
              <p className="text-slate-600">Loading order details...</p>
            ) : detailsError ? (
              <p className="text-rose-600">{detailsError}</p>
            ) : detailsOrder && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Order Info</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Order ID:</span> {detailsOrder.id}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Date:</span> {detailsOrder.date}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Payment:</span> {String(detailsOrder.paymentMethod || '').toUpperCase()}</p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Status:</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(detailsOrder.status)}`}>
                        {detailsOrder.status}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Customer and Shipping</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Name:</span> {detailsOrder.userName || 'N/A'}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Email:</span> {detailsOrder.shippingAddress?.email || detailsOrder.userEmail || 'N/A'}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Phone:</span> {detailsOrder.shippingAddress?.phone || 'N/A'}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Address:</span> {getDisplayAddress(detailsOrder.shippingAddress)}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Items</h3>
                  <div className="space-y-3">
                    {(detailsOrder.items || []).map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/72'}
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">₹ {Number(item.price || 0).toFixed(2)} each</p>
                          <p className="text-sm font-semibold text-slate-900">₹ {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Billing Summary</h3>
                  <div className="space-y-1 text-sm text-slate-700">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹ {Number(detailsOrder.subtotal || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>₹ {Number(detailsOrder.tax || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>₹ {Number(detailsOrder.shippingCharge || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                      <span>Total</span>
                      <span>₹ {Number(detailsOrder.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Timeline</h3>
                  <div className="space-y-2">
                    {(detailsOrder.timeline || []).map((step) => (
                      <div key={step.status} className="flex items-start gap-3 text-sm">
                        <span className={`mt-1 w-2.5 h-2.5 rounded-full ${step.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <div>
                          <p className={`font-medium ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>{step.status}</p>
                          {step.date && <p className="text-xs text-slate-500">{step.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Return Requests</h3>
                  {(detailsOrder.returnRequests || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No return requests submitted for this order.</p>
                  ) : (
                    <div className="space-y-3">
                      {(detailsOrder.returnRequests || []).map((request) => (
                        <div key={request.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{request.reasonCategory}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReturnStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {(request.returnItems || []).map((item) => (
                              <p key={`${request.id}-${item.orderItemId}`} className="text-xs text-slate-700">
                                {item.productTitle} x{item.quantity}
                              </p>
                            ))}
                          </div>
                          {request.comment && <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Comment:</span> {request.comment}</p>}
                          <p className="text-xs text-slate-600 mt-1">Refund: ₹ {Number(request.refundAmount || 0).toFixed(2)} ({request.refundStatus})</p>
                          <p className="text-xs text-slate-500 mt-1">Requested on {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}</p>
                          {request.image && (
                            <img
                              src={request.image}
                              alt="Returned product"
                              className="mt-3 w-24 h-24 rounded-lg object-cover border border-slate-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}

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


