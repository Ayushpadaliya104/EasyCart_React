const crypto = require('crypto');
const Razorpay = require('razorpay');

const env = require('../config/env');
const {
  getWalletWithTransactions,
  getWalletTransactions,
  createPendingTopupTransaction,
  markTopupFailed,
  completeTopupTransaction
} = require('../services/wallet.service');

const MIN_TOPUP_AMOUNT = 10;
const MAX_TOPUP_AMOUNT = 100000;

const toAmount = (value) => Number(Number(value || 0).toFixed(2));
const toPaise = (value) => Math.round(toAmount(value) * 100);

const getRazorpayClient = () => {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return null;
  }

  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  });
};

const shouldUseMockGateway = () =>
  env.razorpayMockMode && (!env.razorpayKeyId || !env.razorpayKeySecret);

const buildMockOrderId = () => `wallet_order_mock_${Date.now()}`;

const getWalletSummary = async (req, res, next) => {
  try {
    const wallet = await getWalletWithTransactions(req.user._id, { limit: 10 });

    return res.status(200).json({
      success: true,
      wallet
    });
  } catch (error) {
    return next(error);
  }
};

const getWalletPassbook = async (req, res, next) => {
  try {
    const result = await getWalletTransactions(req.user._id, {
      page: req.query.page,
      limit: req.query.limit
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return next(error);
  }
};

const createWalletTopupOrder = async (req, res, next) => {
  try {
    const amount = toAmount(req.body.amount);

    if (!Number.isFinite(amount) || amount < MIN_TOPUP_AMOUNT || amount > MAX_TOPUP_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ₹ ${MIN_TOPUP_AMOUNT} and ₹ ${MAX_TOPUP_AMOUNT}`
      });
    }

    let razorpayOrderId = '';
    let keyId = env.razorpayKeyId;
    let mockMode = false;

    if (shouldUseMockGateway()) {
      mockMode = true;
      keyId = 'mock_key';
      razorpayOrderId = buildMockOrderId();
    } else {
      const client = getRazorpayClient();
      if (!client) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay keys are not configured on server'
        });
      }

      const order = await client.orders.create({
        amount: toPaise(amount),
        currency: 'INR',
        receipt: `easycart_wallet_${Date.now()}`,
        notes: {
          userId: String(req.user._id),
          purpose: 'wallet_topup'
        }
      });

      razorpayOrderId = order.id;
    }

    const pendingTransaction = await createPendingTopupTransaction({
      userId: req.user._id,
      amount,
      razorpayOrderId,
      description: 'Wallet topup initiated',
      metadata: {
        mode: mockMode ? 'mock' : 'live'
      }
    });

    return res.status(201).json({
      success: true,
      keyId,
      mockMode,
      order: {
        id: razorpayOrderId,
        amount: toPaise(amount),
        currency: 'INR'
      },
      transaction: {
        id: pendingTransaction._id,
        transactionId: pendingTransaction.transactionId,
        status: pendingTransaction.status,
        amount: pendingTransaction.amount
      }
    });
  } catch (error) {
    return next(error);
  }
};

const verifyWalletTopup = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order id and payment id are required'
      });
    }

    if (!shouldUseMockGateway()) {
      if (!razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay signature is required'
        });
      }

      const expectedSignature = crypto
        .createHmac('sha256', env.razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay signature verification failed'
        });
      }
    }

    const result = await completeTopupTransaction({
      userId: req.user._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    return res.status(200).json({
      success: true,
      message: result.alreadyProcessed
        ? 'Wallet topup already verified'
        : 'Wallet topup verified successfully',
      wallet: {
        id: result.wallet._id,
        balance: toAmount(result.wallet.balance),
        updatedAt: result.wallet.updatedAt
      },
      transaction: {
        id: result.transaction._id,
        transactionId: result.transaction.transactionId,
        status: result.transaction.status,
        amount: toAmount(result.transaction.amount),
        source: result.transaction.source,
        processedAt: result.transaction.processedAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

const failWalletTopup = async (req, res, next) => {
  try {
    const { razorpay_order_id, reason } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id is required'
      });
    }

    const transaction = await markTopupFailed({
      userId: req.user._id,
      razorpayOrderId: razorpay_order_id,
      reason: String(reason || '').trim() || 'Wallet topup failed'
    });

    return res.status(200).json({
      success: true,
      message: transaction ? 'Topup marked as failed' : 'No pending topup found',
      updated: Boolean(transaction)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWalletSummary,
  getWalletPassbook,
  createWalletTopupOrder,
  verifyWalletTopup,
  failWalletTopup
};

