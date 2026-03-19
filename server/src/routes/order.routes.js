const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/', protect, requireAdmin, getAllOrders);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);

module.exports = router;
