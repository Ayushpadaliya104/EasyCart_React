const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

const env = require('../config/env');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');

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

const getRazorpayErrorMessage = (error) => {
  const description = error?.error?.description || error?.message || '';
  const normalized = String(description).toLowerCase();

  if (normalized.includes('authentication failed')) {
    return 'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.';
  }

  if (normalized.includes('bad request')) {
    return 'Razorpay rejected the payment request. Please verify test mode keys and payload.';
  }

  return description || 'Failed to create Razorpay order';
};

const toPaise = (amountInRupees) => Math.round(Number(amountInRupees || 0) * 100);

const buildMockOrder = (totals) => ({
  id: `order_mock_${Date.now()}`,
  amount: toPaise(totals.total),
  currency: 'INR'
});

const computeOrderTotals = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const mappedItems = [];

  for (const item of items) {
    const productId = item.productId || item.product;
    const quantity = Number(item.quantity || 0);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
      return null;
    }

    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    const unitPrice =
      typeof product.discountPrice === 'number' &&
      product.discountPrice > 0 &&
      product.discountPrice < product.price
        ? Number(product.discountPrice)
        : Number(product.price);

    mappedItems.push({
      product: product._id,
      price: unitPrice,
      quantity
    });
  }

  const subtotal = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const storeSettings = await StoreSettings.findOne({ key: 'default' }).select('taxRate');
  const taxRate = Number(storeSettings?.taxRate ?? 8);
  const tax = Number((subtotal * (taxRate / 100)).toFixed(2));
  const shippingCharge = 0;
  const total = Number((subtotal + tax + shippingCharge).toFixed(2));

  return {
    subtotal,
    tax,
    shippingCharge,
    total
  };
};

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const totals = await computeOrderTotals(items);

    if (!totals) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order items for payment'
      });
    }

    if (shouldUseMockGateway()) {
      return res.status(201).json({
        success: true,
        order: buildMockOrder(totals),
        keyId: 'mock_key',
        totals,
        mockMode: true
      });
    }

    const client = getRazorpayClient();

    if (!client) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured on server'
      });
    }

    const razorpayOrder = await client.orders.create({
      amount: toPaise(totals.total),
      currency: 'INR',
      receipt: `easycart_${Date.now()}`,
      notes: {
        userId: String(req.user._id)
      }
    });

    return res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      },
      keyId: env.razorpayKeyId,
      totals,
      mockMode: false
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: getRazorpayErrorMessage(error)
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (shouldUseMockGateway()) {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Mock payment payload is incomplete'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mock payment verified successfully'
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Razorpay verification payload is incomplete'
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

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully'
  });
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment
};
