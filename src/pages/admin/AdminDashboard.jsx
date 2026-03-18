import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiPackage, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';
import { mockDashboardStats, mockChartData } from '../../utils/mockData';
import AdminLayout from '../../components/AdminLayout';

function AdminDashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Welcome back. Here is a live pulse of your store performance."
      activePath="/admin"
    >
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">₹{mockDashboardStats.totalSales.toLocaleString()}</p>
              <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                <FiArrowUpRight /> {mockDashboardStats.growthRate}% from last month
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
              <p className="text-3xl font-bold mt-2 text-slate-900">{mockDashboardStats.totalOrders.toLocaleString()}</p>
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
              <p className="text-3xl font-bold mt-2 text-slate-900">{mockDashboardStats.totalUsers.toLocaleString()}</p>
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
              <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">₹{mockDashboardStats.totalRevenue.toLocaleString()}</p>
              <p className="text-slate-500 text-sm mt-2">Year to date</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl">
              <FiBarChart2 className="text-slate-700 text-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Sales</h3>
          <div className="space-y-4">
            {mockChartData.monthly.map((month) => (
              <div key={month.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{month.month}</span>
                  <span className="font-semibold text-slate-900">₹{month.sales.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                    style={{ width: `${(month.sales / 5000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {mockChartData.categorywise.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-slate-700">{category.category}</span>
                  <span className="font-semibold text-slate-900">₹{category.value.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
                    style={{ width: `${(category.value / 45000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
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
