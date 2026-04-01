import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiTruck, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import { fetchOrderByIdApi, submitReturnRequestApi } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returnForm, setReturnForm] = useState({
    itemIds: [],
    reasonCategory: 'Damaged',
    comment: '',
    image: ''
  });
  const [returnError, setReturnError] = useState('');
  const [returnSuccess, setReturnSuccess] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await fetchOrderByIdApi(id);
        setOrder(response);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate, user]);

  useEffect(() => {
    if (!order || !order.canRequestReturn) {
      return;
    }

    const eligibleProducts = (order.items || []).filter((item) => item.itemStatus === 'Delivered');

    if (returnForm.itemIds.length === 0 && eligibleProducts[0]?.id) {
      setReturnForm((prev) => ({
        ...prev,
        itemIds: [String(eligibleProducts[0].id)]
      }));
    }
  }, [order, returnForm.itemIds.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600">Loading order...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-600">{error || 'Order not found'}</p>
          <Link to="/orders" className="text-primary font-semibold mt-4 inline-block hover:underline">
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getEligibleItemsForReturn = () => {
    return (order.items || []).filter((item) => item.itemStatus === 'Delivered');
  };

  const handleReturnImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReturnForm((prev) => ({ ...prev, image: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const submitReturnRequest = async () => {
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

      const updatedOrder = await submitReturnRequestApi(order.id, {
        itemIds: returnForm.itemIds,
        reasonCategory: returnForm.reasonCategory,
        comment: returnForm.comment.trim(),
        image: returnForm.image
      });

      setOrder(updatedOrder);
      const eligibleProducts = (updatedOrder.items || []).filter((item) => item.itemStatus === 'Delivered');
      setReturnForm({
        itemIds: eligibleProducts[0] ? [String(eligibleProducts[0].id)] : [],
        reasonCategory: 'Damaged',
        comment: '',
        image: ''
      });
      setReturnSuccess('Return request submitted successfully.');
    } catch (submitError) {
      setReturnError(submitError?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusBadgeColor = () => {
    if (order.status === 'Delivered') return 'bg-gradient-to-r from-green-300 to-emerald-400 text-green-900 font-bold shadow-md';
    if (order.status === 'Partially Returned') return 'bg-gradient-to-r from-amber-300 to-orange-400 text-orange-900 font-bold shadow-md';
    if (order.status === 'Returned / Refunded') return 'bg-gradient-to-r from-emerald-300 to-teal-400 text-emerald-900 font-bold shadow-md';
    if (order.status === 'Shipped' || order.status === 'Out for Delivery') return 'bg-gradient-to-r from-blue-300 to-cyan-400 text-blue-900 font-bold shadow-md';
    if (order.status === 'Processing') return 'bg-gradient-to-r from-indigo-300 to-purple-400 text-indigo-900 font-bold shadow-md';
    return 'bg-gradient-to-r from-orange-300 to-amber-400 text-orange-900 font-bold shadow-md';
  };

  const deliveryTimeline = (order.timeline || []).filter((step) =>
    ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(step.status)
  );

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

  const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const getDisplayAddress = () => {
    if (order?.shippingAddress) {
      const shippingAddress = order.shippingAddress;
      return [
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.zipcode,
      ]
        .filter(Boolean)
        .join(', ');
    }

    return order?.address || 'N/A';
  };

  const handleDownloadInvoice = () => {
    const companyInfo = {
      name: settings.storeName || 'EasyCart',
      line1: settings.address || '123 Business Ave, City, State 12345',
      line2: `Support: ${settings.email || 'support@easycart.com'} | ${settings.phone || '+91-90909-90909'}`,
      gstin: '24ABCDE1234F1Z9',
      stateCode: '24'
    };

    const itemsHtml = (order.items || [])
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.title || item.name)}</td>
            <td>${Number(item.quantity || 0)}</td>
            <td>${formatMoney(item.price)}</td>
            <td>${formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</td>
          </tr>
        `
      )
      .join('');

    const shippingAddress = order.shippingAddress || {};
    const customerName =
      [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(' ') || user?.name || 'N/A';

    const subtotal = Number(order.subtotal || 0);
    const tax = Number(order.tax || 0);
    const shippingCharge = Number(order.shippingCharge || 0);
    const total = Number(order.total || 0);

    const gstRate = subtotal > 0 ? Math.round((tax / subtotal) * 100) : 0;
    const cgst = tax / 2;
    const sgst = tax / 2;

    const invoiceHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${escapeHtml(order.id)}</title>
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
                  <h1 class="invoice-title">${escapeHtml(companyInfo.name)}</h1>
                  <p class="muted" style="margin:4px 0 0; font-size:12px;">Smart Commerce, Fast Delivery</p>
                </div>
              </div>
              <div class="invoice-meta">
                <p style="margin:0;"><strong>Invoice No:</strong> INV-${escapeHtml(String(order.id).slice(-8).toUpperCase())}</p>
                <p style="margin:4px 0 0;"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
                <p style="margin:4px 0 0;"><strong>Date:</strong> ${escapeHtml(order.date)}</p>
                <p style="margin:4px 0 0;"><strong>Status:</strong> ${escapeHtml(order.status)}</p>
                <p style="margin:4px 0 0;"><strong>Payment:</strong> ${escapeHtml(String(order.paymentMethod || '').toUpperCase())}</p>
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
                <p>${escapeHtml(shippingAddress.email || user?.email || 'N/A')}</p>
                <p>${escapeHtml(shippingAddress.phone || 'N/A')}</p>
                <p>${escapeHtml(getDisplayAddress())}</p>
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Order Header Card */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-orange-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex-shrink-0 shadow-lg">
                  <FiTruck size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Order #{order.id.slice(-4).toUpperCase()}</h1>
                  <p className="text-orange-700 text-sm mt-1 font-semibold">
                    {order.date}
                  </p>
                  <div className={`mt-3 inline-block px-4 py-1 rounded-full text-sm font-bold ${getStatusBadgeColor()}`}>
                    {order.status}
                  </div>
                </div>
              </div>

              {order.status === 'Delivered' && (
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition text-sm shadow-lg"
                >
                  <FiDownload />
                  Download Invoice
                </button>
              )}
            </div>
          </div>

          {/* Timeline/Progress */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-purple-200">
            <div className="flex justify-between items-center relative mb-12">
              {/* Timeline Line Background */}
              <div className="absolute top-8 left-0 right-0 h-2 bg-gray-300 z-0 rounded-full"></div>

              {/* Completed Line */}
              <div className="absolute top-8 left-0 h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 z-0 rounded-full" style={{
                width: `${deliveryTimeline.length > 0
                  ? (deliveryTimeline.filter((t) => t.completed).length / deliveryTimeline.length) * 100
                  : 0}%`
              }}></div>

              {/* Timeline Steps */}
              {deliveryTimeline.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition shadow-lg ${
                    step.completed 
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' 
                      : 'bg-white border-3 border-gray-400 text-gray-600 hover:border-purple-400'
                  }`}>
                    {step.completed ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                  </div>
                  <p className="text-sm font-bold text-gray-800 mt-3 text-center whitespace-nowrap">
                    {step.status.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Delivery Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Items Section */}
            <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-lg p-8 border-2 border-orange-200">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">ITEMS ({order.items.length})</h3>

              {order.items.map((product) => (
                <div key={product.id} className="flex gap-6 pb-6 border-b-2 border-orange-300 last:border-b-0 last:pb-0 bg-white bg-opacity-70 p-4 rounded-lg mb-4 hover:bg-opacity-100 transition shadow-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex-shrink-0 overflow-hidden border-3 border-orange-300 shadow-md">
                    <img
                      src={product.image || 'https://via.placeholder.com/100'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1 text-orange-900">{product.title}</h4>
                    <p className="text-orange-700 text-sm mb-2 font-semibold">Qty: {product.quantity}</p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">₹{(product.price * product.quantity).toFixed(2)}</p>
                    <p className="text-xs mt-1 font-semibold text-slate-700">Item Status: {product.itemStatus}</p>
                  </div>
                </div>
              ))}

            </div>

            {/* Delivery Details */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg p-8 border-2 border-teal-300">
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-6 flex items-center gap-2">
                <FiMapPin className="text-gradient" size={24} />
                DELIVERY DETAILS
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-white bg-opacity-70 p-3 rounded-lg hover:bg-opacity-100 transition">
                  <p className="text-teal-700 text-xs font-semibold uppercase mb-1">Customer</p>
                  <p className="font-bold text-teal-900">{user?.name || 'Customer'}</p>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded-lg hover:bg-opacity-100 transition">
                  <p className="text-teal-700 text-xs font-semibold uppercase mb-1">Email</p>
                  <p className="font-bold text-teal-900 text-sm break-all">{user?.email}</p>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded-lg hover:bg-opacity-100 transition">
                  <p className="text-teal-700 text-xs font-semibold uppercase mb-1">Address</p>
                  <p className="font-bold text-teal-900 text-sm leading-relaxed">{order.address}</p>
                </div>
              </div>

              <div className="border-t-2 border-teal-300 pt-6">
                <p className="text-teal-700 text-xs font-semibold uppercase mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Full Timeline Details */}
          <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-purple-200">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">DELIVERY TIMELINE</h3>

            <div className="space-y-4">
              {deliveryTimeline.map((step, idx) => (
                <div key={idx} className={`flex gap-4 p-4 rounded-lg border-2 transition ${
                  step.completed ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-md' : 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${
                    step.completed ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' : 'bg-gradient-to-br from-gray-500 to-slate-600'
                  }`}>
                    {step.completed ? <FiCheckCircle size={20} /> : <FiClock size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${
                      step.completed ? 'text-green-900' : 'text-gray-700'
                    }`}>{step.status}</h4>
                    <p className={`text-sm mt-1 ${
                      step.completed ? 'text-green-700 font-semibold' : 'text-gray-600'
                    }`}>
                      {step.date || 'Pending'}
                    </p>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full self-center ${
                    step.completed 
                      ? 'bg-gradient-to-r from-green-200 to-emerald-300 text-green-900' 
                      : 'bg-gradient-to-r from-gray-200 to-slate-300 text-gray-800'
                  }`}>
                    {step.completed ? 'Completed' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Returns & Refunds */}
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-rose-200">
            <h3 className="text-2xl font-bold text-rose-700 mb-4">Returns & Refunds</h3>

            {returnSuccess && (
              <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {returnSuccess}
              </p>
            )}

            {returnError && (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {returnError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500 uppercase">Remaining Active Items</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{order.items.filter((item) => item.itemStatus !== 'Returned / Refunded').length}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500 uppercase">Returned Items</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{order.items.filter((item) => item.itemStatus === 'Returned / Refunded').length}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500 uppercase">Total Refunded</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(order.totalRefunded || 0).toFixed(2)}</p>
              </div>
            </div>

            <h4 className="text-lg font-bold text-rose-700 mb-3">Request Return</h4>

            {!order.canRequestReturn ? (
              <p className="text-sm font-semibold text-slate-700">
                {order.status === 'Delivered'
                  ? 'Return window expired. Returns are allowed within 7 days after delivery.'
                  : 'Return option will be available after order is delivered.'}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Items</label>
                    <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 space-y-2">
                      {getEligibleItemsForReturn().map((item) => {
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
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-2"
                    >
                      <option value="Damaged">Damaged</option>
                      <option value="Wrong item">Wrong item</option>
                      <option value="Not satisfied">Not satisfied</option>
                      <option value="Other">Other</option>
                    </select>
                    <textarea
                      rows={3}
                      value={returnForm.comment}
                      onChange={(event) => setReturnForm((prev) => ({ ...prev, comment: event.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      placeholder="Comment (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Received Product Photo</label>
                    <input type="file" accept="image/*" onChange={handleReturnImageUpload} className="w-full" />
                    {returnForm.image && (
                      <img src={returnForm.image} alt="Return preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-slate-200" />
                    )}
                  </div>
                </div>

                <button
                  onClick={submitReturnRequest}
                  disabled={submittingReturn || returnForm.itemIds.length === 0}
                  className="mt-5 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-60"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </>
            )}
            <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="text-xl font-bold text-slate-900 mb-4">Return History</h4>

              {(order.returnRequests || []).length === 0 ? (
                <p className="text-sm font-semibold text-slate-600">No return requests submitted for this order yet.</p>
              ) : (
                <div className="space-y-4">
                  {order.returnRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{request.reasonCategory}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReturnStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="space-y-1 mt-2">
                        {request.returnItems.map((item) => (
                          <p key={`${request.id}-${item.orderItemId}`} className="text-sm text-slate-700">
                            {item.productTitle} x{item.quantity}
                          </p>
                        ))}
                      </div>
                      {request.comment && <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Comment:</span> {request.comment}</p>}
                      <p className="text-xs text-slate-600 mt-1">Refund: INR {Number(request.refundAmount || 0).toFixed(2)} ({request.refundStatus})</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested on {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                      </p>
                      {request.image && (
                        <img
                          src={request.image}
                          alt="Returned product"
                          className="mt-3 w-28 h-28 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="text-xl font-bold text-slate-900 mb-4">Refund Entries</h4>
              {(order.refundHistory || []).length === 0 ? (
                <p className="text-sm text-slate-600">No refunds processed yet.</p>
              ) : (
                <div className="space-y-2">
                  {order.refundHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Request: {entry.returnRequestId}</p>
                        <p className="text-xs text-slate-600">{entry.processedAt ? new Date(entry.processedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-700">₹{Number(entry.amount || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">NEED HELP?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 bg-white bg-opacity-70 p-4 rounded-lg hover:bg-opacity-100 transition border-l-4 border-indigo-500 shadow-md">
                <FiPhone size={24} className="text-indigo-600 flex-shrink-0 mt-1 font-bold" />
                <div>
                  <p className="text-indigo-700 text-sm font-semibold">Phone Support</p>
                  <p className="font-bold text-lg text-indigo-900">{settings.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white bg-opacity-70 p-4 rounded-lg hover:bg-opacity-100 transition border-l-4 border-blue-500 shadow-md">
                <FiMail size={24} className="text-blue-600 flex-shrink-0 mt-1 font-bold" />
                <div>
                  <p className="text-blue-700 text-sm font-semibold">Email Support</p>
                  <p className="font-bold text-lg text-blue-900 break-all">{settings.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/orders"
              className="px-8 py-3 border-2 border-slate-700 text-white bg-slate-700 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg"
            >
              Back to Orders
            </Link>
            <Link
              to="/products"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-lg font-bold hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition shadow-lg"
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
