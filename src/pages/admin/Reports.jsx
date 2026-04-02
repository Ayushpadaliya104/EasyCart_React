import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchSalesReportsApi } from '../../services/analyticsService';

function Reports() {
  const [range, setRange] = useState('6m');
  const [report, setReport] = useState({
    summary: {
      totalSales: 0,
      totalRefunds: 0,
      netRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    },
    monthly: [],
    categorywise: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchSalesReportsApi(range);
        setReport(data);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [range]);

  const maxMonthlySales = useMemo(
    () => Math.max(...report.monthly.map((entry) => entry.sales), 1),
    [report.monthly]
  );

  const maxCategorySales = useMemo(
    () => Math.max(...report.categorywise.map((entry) => entry.value), 1),
    [report.categorywise]
  );

  const exportCsv = () => {
    if (!report.monthly.length) {
      return;
    }

    const header = ['Month', 'Sales', 'Orders'];
    const rows = report.monthly.map((entry) => [entry.month, entry.sales, entry.orders]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `easycart-sales-report-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Analytics and Reports"
      subtitle="Understand revenue trends and category performance."
      activePath="/admin/reports"
      actions={(
        <button
          onClick={exportCsv}
          disabled={loading || report.monthly.length === 0}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiDownload /> Export Report
        </button>
      )}
    >
      {error && (
        <section className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Sales</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : `₹ ${report.summary.totalSales.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Orders</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : report.summary.totalOrders.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Average Order Value</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : `₹ ${report.summary.averageOrderValue.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Refunds</p>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {loading ? '...' : `₹ ${report.summary.totalRefunds.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Net Revenue</p>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {loading ? '...' : `₹ ${report.summary.netRevenue.toLocaleString()}`}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Monthly Sales Report</h2>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm"
          >
            <option value="6m">Last 6 Months</option>
            <option value="3m">Last 3 Months</option>
            <option value="1m">Last Month</option>
          </select>
        </div>
            {loading ? (
              <p className="text-slate-500">Loading monthly report...</p>
            ) : report.monthly.length === 0 ? (
              <p className="text-slate-500">No monthly report data available yet.</p>
            ) : (
            <div className="space-y-4">
              {report.monthly.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                <span className="w-12 font-semibold text-right text-slate-700">{month.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden flex items-center">
                    <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                      style={{ width: `${Math.min((month.sales / maxMonthlySales) * 100, 100)}%` }}
                    >
                      ₹ {month.sales.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Sales by Category</h2>
            {loading ? (
              <p className="text-slate-500">Loading category report...</p>
            ) : report.categorywise.length === 0 ? (
              <p className="text-slate-500">No category data available yet.</p>
            ) : (
            <div className="space-y-6">
              {report.categorywise.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-800">{category.category}</span>
                  <span className="font-bold text-slate-900">₹ {category.value.toLocaleString()}</span>
                  </div>
                <div className="w-full bg-slate-100 rounded-full h-4">
                    <div
                    className="bg-gradient-to-r from-rose-500 to-orange-400 h-4 rounded-full"
                      style={{ width: `${Math.min((category.value / maxCategorySales) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            )}
      </section>
    </AdminLayout>
  );
}

export default Reports;

