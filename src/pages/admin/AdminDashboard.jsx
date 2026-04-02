import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiPackage, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchDashboardAnalyticsApi } from '../../services/analyticsService';

function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    stats: {
      totalSales: 0,
      totalRefunds: 0,
      netRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      growthRate: 0
    },
    monthly: [],
    categorywise: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboardAnalyticsApi();
        setAnalytics(data);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load dashboard analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const maxMonthlySales = useMemo(
    () => Math.max(...analytics.monthly.map((entry) => entry.sales), 1),
    [analytics.monthly]
  );

  const maxCategorySales = useMemo(
    () => Math.max(...analytics.categorywise.map((entry) => entry.value), 1),
    [analytics.categorywise]
  );

  const growthPrefix = analytics.stats.growthRate > 0 ? '+' : '';

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Welcome back. Here is a live pulse of your store performance."
      activePath="/admin"
    >
      {error && (
        <section className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">
                {loading ? '...' : `₹ ${analytics.stats.totalSales.toLocaleString()}`}
              </p>
              <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                <FiArrowUpRight />
                {loading ? 'Loading growth...' : `${growthPrefix}${analytics.stats.growthRate}% from last month`}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl">
              <FiTrendingUp className="text-slate-700 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">
                {loading ? '...' : analytics.stats.totalOrders.toLocaleString()}
              </p>
              <p className="text-slate-500 text-sm mt-2">This month</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl">
              <FiPackage className="text-slate-700 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">
                {loading ? '...' : analytics.stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-slate-500 text-sm mt-2">Active users</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl">
              <FiUsers className="text-slate-700 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Net Revenue</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">
                {loading ? '...' : `₹ ${analytics.stats.netRevenue.toLocaleString()}`}
              </p>
              <p className="text-slate-500 text-sm mt-2">Year to date</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl">
              <FiBarChart2 className="text-slate-700 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Refunds</p>
              <p className="text-3xl font-bold mt-2 text-rose-600">
                {loading ? '...' : `₹ ${analytics.stats.totalRefunds.toLocaleString()}`}
              </p>
              <p className="text-slate-500 text-sm mt-2">All processed refunds</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl">
              <FiTrendingUp className="text-rose-600 text-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Sales</h3>
          {loading ? (
            <p className="text-slate-500">Loading monthly sales...</p>
          ) : analytics.monthly.length === 0 ? (
            <p className="text-slate-500">No sales data available yet.</p>
          ) : (
            <div className="space-y-4">
              {analytics.monthly.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{month.month}</span>
                    <span className="font-semibold text-slate-900">₹ {month.sales.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                      style={{ width: `${Math.min((month.sales / maxMonthlySales) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Category</h3>
          {loading ? (
            <p className="text-slate-500">Loading category sales...</p>
          ) : analytics.categorywise.length === 0 ? (
            <p className="text-slate-500">No category data available yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.categorywise.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-700">{category.category}</span>
                    <span className="font-semibold text-slate-900">₹ {category.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
                      style={{ width: `${Math.min((category.value / maxCategorySales) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link to="/admin/products" className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium hover:border-slate-300">
          Add Product
        </Link>
        <Link to="/admin/categories" className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium hover:border-slate-300">
          Add Category
        </Link>
        <Link to="/admin/orders" className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium hover:border-slate-300">
          View Orders
        </Link>
        <Link to="/admin/users" className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium hover:border-slate-300">
          Manage Users
        </Link>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
