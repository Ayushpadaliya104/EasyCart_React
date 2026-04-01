import apiClient from './apiClient';

const normalizeMonthly = (entry) => ({
  month: entry.month,
  sales: Number(entry.sales || 0),
  refunds: Number(entry.refunds || 0),
  netRevenue: Number(entry.netRevenue || 0),
  orders: Number(entry.orders || 0)
});

const normalizeCategorywise = (entry) => ({
  category: entry.category,
  value: Number(entry.value || 0)
});

export const fetchDashboardAnalyticsApi = async () => {
  const response = await apiClient.get('/analytics/dashboard');
  const data = response.data || {};

  return {
    stats: {
      totalSales: Number(data.stats?.totalSales || 0),
      totalRefunds: Number(data.stats?.totalRefunds || 0),
      netRevenue: Number(data.stats?.netRevenue || 0),
      totalOrders: Number(data.stats?.totalOrders || 0),
      totalUsers: Number(data.stats?.totalUsers || 0),
      totalRevenue: Number(data.stats?.totalRevenue || 0),
      growthRate: Number(data.stats?.growthRate || 0)
    },
    monthly: Array.isArray(data.monthly) ? data.monthly.map(normalizeMonthly) : [],
    categorywise: Array.isArray(data.categorywise)
      ? data.categorywise.map(normalizeCategorywise)
      : []
  };
};

export const fetchSalesReportsApi = async (range = '6m') => {
  const response = await apiClient.get('/analytics/reports', {
    params: { range }
  });

  const data = response.data || {};

  return {
    range: data.range || range,
    months: Number(data.months || 0),
    summary: {
      totalSales: Number(data.summary?.totalSales || 0),
      totalRefunds: Number(data.summary?.totalRefunds || 0),
      netRevenue: Number(data.summary?.netRevenue || 0),
      totalOrders: Number(data.summary?.totalOrders || 0),
      averageOrderValue: Number(data.summary?.averageOrderValue || 0)
    },
    monthly: Array.isArray(data.monthly) ? data.monthly.map(normalizeMonthly) : [],
    categorywise: Array.isArray(data.categorywise)
      ? data.categorywise.map(normalizeCategorywise)
      : []
  };
};
