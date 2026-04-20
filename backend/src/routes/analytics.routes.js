const express = require('express');
const { getDashboardAnalytics, getSalesReports } = require('../controllers/analytics.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/dashboard', protect, requireAdmin, getDashboardAnalytics);
router.get('/reports', protect, requireAdmin, getSalesReports);

module.exports = router;
