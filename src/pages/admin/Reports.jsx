import React, { useState } from 'react';
import { mockChartData } from '../../utils/mockData';
import { FiDownload } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

function Reports() {
  const [range, setRange] = useState('6m');

  return (
    <AdminLayout
      title="Analytics and Reports"
      subtitle="Understand revenue trends and category performance."
      activePath="/admin/reports"
      actions={(
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-700">
          <FiDownload /> Export Report
        </button>
      )}
    >
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
            <div className="space-y-4">
              {mockChartData.monthly.map((month, idx) => (
                <div key={idx} className="flex items-center gap-4">
                <span className="w-12 font-semibold text-right text-slate-700">{month.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden flex items-center">
                    <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full flex items-center justify-end pr-2 text-white text-sm font-semibold"
                      style={{ width: `${(month.sales / 5000) * 100}%` }}
                    >
                      ₹{month.sales}
                    </div>
                  </div>
                </div>
              ))}
            </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Sales by Category</h2>
            <div className="space-y-6">
              {mockChartData.categorywise.map((category, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-800">{category.category}</span>
                  <span className="font-bold text-slate-900">₹{category.value.toLocaleString()}</span>
                  </div>
                <div className="w-full bg-slate-100 rounded-full h-4">
                    <div
                    className="bg-gradient-to-r from-rose-500 to-orange-400 h-4 rounded-full"
                      style={{ width: `${(category.value / 45000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
      </section>
    </AdminLayout>
  );
}

export default Reports;

