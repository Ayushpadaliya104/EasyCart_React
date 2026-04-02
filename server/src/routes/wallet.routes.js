const express = require('express');

const {
  getWalletSummary,
  getWalletPassbook,
  createWalletTopupOrder,
  verifyWalletTopup,
  failWalletTopup
} = require('../controllers/wallet.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', protect, getWalletSummary);
router.get('/transactions', protect, getWalletPassbook);
router.post('/topup/order', protect, createWalletTopupOrder);
router.post('/topup/verify', protect, verifyWalletTopup);
router.post('/topup/fail', protect, failWalletTopup);

module.exports = router;
