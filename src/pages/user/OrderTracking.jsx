import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiTruck, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import { fetchOrderByIdApi } from '../../services/orderService';
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

  const getStatusBadgeColor = () => {
    if (order.status === 'Delivered') return 'bg-green-100 text-green-800';
    if (order.status === 'Shipped' || order.status === 'Out for Delivery') return 'bg-blue-100 text-blue-800';
    if (order.status === 'Processing') return 'bg-indigo-100 text-indigo-800';
    return 'bg-orange-100 text-orange-800';
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
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                  <FiTruck size={28} className="text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-4).toUpperCase()}</h1>
                  <p className="text-gray-600 text-sm mt-1">
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
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition text-sm"
                >
                  <FiDownload />
                  Download Invoice
                </button>
              )}
            </div>
          </div>

          {/* Timeline/Progress */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center relative mb-12">
              {/* Timeline Line Background */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0"></div>

              {/* Completed Line */}
              <div className="absolute top-8 left-0 h-1 bg-orange-600 z-0" style={{
                width: `${(order.timeline.filter(t => t.completed).length / order.timeline.length) * 100}%`
              }}></div>

              {/* Timeline Steps */}
              {order.timeline.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition ${
                    step.completed 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-white border-2 border-gray-300 text-gray-600'
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
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ITEMS (1)</h3>

              {order.products.map((product, idx) => (
                <div key={idx} className="flex gap-6 pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                    <img
                      src={product.image || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">Qty: {product.quantity}</p>
                    <p className="text-xl font-bold text-slate-900">₹{(product.price * product.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <FiMapPin className="text-orange-600" />
                DELIVERY DETAILS
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Customer</p>
                  <p className="font-bold text-gray-900">{user?.name || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Email</p>
                  <p className="font-bold text-gray-900 text-sm break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Address</p>
                  <p className="font-bold text-gray-900 text-sm leading-relaxed">{order.address}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-slate-900">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Full Timeline Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">TIMELINE</h3>

            <div className="space-y-4">
              {order.timeline.map((step, idx) => (
                <div key={idx} className={`flex gap-4 p-4 rounded-lg ${
                  step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? <FiCheckCircle size={20} /> : <FiClock size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{step.status}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.date || 'Pending'}
                    </p>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full self-center ${
                    step.completed 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {step.completed ? 'Completed' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="font-bold text-lg text-gray-900 mb-6">NEED HELP?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <FiPhone size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Phone Support</p>
                  <p className="font-bold text-lg text-gray-900">{settings.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiMail size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Email Support</p>
                  <p className="font-bold text-lg text-gray-900 break-all">{settings.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="px-8 py-3 border-2 border-slate-900 text-slate-900 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              Back to Orders
            </Link>
            <Link
              to="/products"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition"
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
