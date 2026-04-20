const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getAllReturnRequests,
  getOrderById,
  submitReturnRequest,
  updateReturnRequestStatus,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/returns', protect, requireAdmin, getAllReturnRequests);
router.post('/:id/returns', protect, submitReturnRequest);
router.put('/returns/:orderId/:returnRequestId/status', protect, requireAdmin, updateReturnRequestStatus);
router.get('/:id', protect, getOrderById);
router.get('/', protect, requireAdmin, getAllOrders);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);

module.exports = router;
