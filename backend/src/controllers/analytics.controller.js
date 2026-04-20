const Order = require('../models/Order');
const User = require('../models/User');

const RANGE_TO_MONTHS = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '12m': 12
};

const roundTwo = (value) => Number((value || 0).toFixed(2));

const getMonthsFromRange = (range) => RANGE_TO_MONTHS[range] || RANGE_TO_MONTHS['6m'];

const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, offset) => new Date(date.getFullYear(), date.getMonth() + offset, 1);

const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

const formatMonthLabel = (date) =>
  date.toLocaleString('en-IN', {
    month: 'short',
    year: '2-digit'
  });

const revenueProjection = {
  sales: { $sum: '$total' },
  refunds: { $sum: { $ifNull: ['$totalRefunded', 0] } },
  orders: { $sum: 1 }
};

const getMonthlySales = async (months) => {
  const now = new Date();
  const start = addMonths(getMonthStart(now), -(months - 1));

  const aggregated = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        status: { $ne: 'Cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        sales: revenueProjection.sales,
        refunds: revenueProjection.refunds,
        orders: revenueProjection.orders
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  const byMonth = new Map(
    aggregated.map((entry) => [
      monthKey(entry._id.year, entry._id.month),
      {
        sales: roundTwo(entry.sales),
        refunds: roundTwo(entry.refunds),
        netRevenue: roundTwo(Number(entry.sales || 0) - Number(entry.refunds || 0)),
        orders: entry.orders
      }
    ])
  );

  const result = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = addMonths(getMonthStart(now), -index);
    const key = monthKey(monthDate.getFullYear(), monthDate.getMonth() + 1);
    const values = byMonth.get(key) || { sales: 0, refunds: 0, netRevenue: 0, orders: 0 };

    result.push({
      month: formatMonthLabel(monthDate),
      sales: values.sales,
      refunds: values.refunds,
      netRevenue: values.netRevenue,
      orders: values.orders
    });
  }

  return result;
};

const getCategorySales = async (months) => {
  const now = new Date();
  const start = addMonths(getMonthStart(now), -(months - 1));

  const categorySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        status: { $ne: 'Cancelled' }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: {
        path: '$productInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: {
        path: '$categoryInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: {
          $ifNull: ['$categoryInfo.name', 'Uncategorized']
        },
        value: {
          $sum: {
            $multiply: ['$items.price', '$items.quantity']
          }
        }
      }
    },
    { $sort: { value: -1 } },
    { $limit: 8 }
  ]);

  return categorySales.map((entry) => ({
    category: entry._id,
    value: roundTwo(entry.value)
  }));
};

const getDashboardAnalytics = async (_req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = addMonths(currentMonthStart, -1);
    const nextMonthStart = addMonths(currentMonthStart, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      totalUsers,
      totalOrders,
      allTimeSalesAgg,
      ytdRevenueAgg,
      currentMonthSalesAgg,
      previousMonthSalesAgg,
      monthly,
      categorywise
    ] = await Promise.all([
      User.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: null,
            sales: { $sum: '$total' },
            refunds: { $sum: { $ifNull: ['$totalRefunded', 0] } }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: { $gte: yearStart }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$total' },
            refunds: { $sum: { $ifNull: ['$totalRefunded', 0] } }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: {
              $gte: currentMonthStart,
              $lt: nextMonthStart
            }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$total' },
            refunds: { $sum: { $ifNull: ['$totalRefunded', 0] } }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: {
              $gte: previousMonthStart,
              $lt: currentMonthStart
            }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$total' },
            refunds: { $sum: { $ifNull: ['$totalRefunded', 0] } }
          }
        }
      ]),
      getMonthlySales(6),
      getCategorySales(6)
    ]);

    const totalSales = roundTwo(allTimeSalesAgg[0]?.sales || 0);
    const totalRefunds = roundTwo(allTimeSalesAgg[0]?.refunds || 0);
    const netRevenue = roundTwo(totalSales - totalRefunds);
    const totalRevenue = roundTwo(ytdRevenueAgg[0]?.sales || 0);
    const totalRevenueRefunds = roundTwo(ytdRevenueAgg[0]?.refunds || 0);
    const ytdNetRevenue = roundTwo(totalRevenue - totalRevenueRefunds);
    const currentMonthSales = roundTwo((currentMonthSalesAgg[0]?.sales || 0) - (currentMonthSalesAgg[0]?.refunds || 0));
    const previousMonthSales = roundTwo((previousMonthSalesAgg[0]?.sales || 0) - (previousMonthSalesAgg[0]?.refunds || 0));

    const growthRate =
      previousMonthSales > 0
        ? roundTwo(((currentMonthSales - previousMonthSales) / previousMonthSales) * 100)
        : currentMonthSales > 0
        ? 100
        : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalRefunds,
        netRevenue,
        totalOrders,
        totalUsers,
        totalRevenue: ytdNetRevenue,
        growthRate
      },
      monthly,
      categorywise
    });
  } catch (error) {
    return next(error);
  }
};

const getSalesReports = async (req, res, next) => {
  try {
    const range = String(req.query.range || '6m').toLowerCase();
    const months = getMonthsFromRange(range);

    const [monthly, categorywise] = await Promise.all([
      getMonthlySales(months),
      getCategorySales(months)
    ]);

    const totalSales = roundTwo(monthly.reduce((sum, month) => sum + month.sales, 0));
    const totalRefunds = roundTwo(monthly.reduce((sum, month) => sum + Number(month.refunds || 0), 0));
    const netRevenue = roundTwo(totalSales - totalRefunds);
    const totalOrders = monthly.reduce((sum, month) => sum + month.orders, 0);
    const averageOrderValue = totalOrders > 0 ? roundTwo(netRevenue / totalOrders) : 0;

    return res.status(200).json({
      success: true,
      range,
      months,
      summary: {
        totalSales,
        totalRefunds,
        netRevenue,
        totalOrders,
        averageOrderValue
      },
      monthly,
      categorywise
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getSalesReports
};
