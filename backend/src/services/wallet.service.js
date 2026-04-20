const mongoose = require('mongoose');

const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

const toAmount = (value) => Number(Number(value || 0).toFixed(2));

const normalizeWalletResponse = (wallet, transactions = []) => ({
  id: String(wallet._id),
  userId: String(wallet.user),
  balance: toAmount(wallet.balance),
  updatedAt: wallet.updatedAt,
  transactions: transactions.map((tx) => ({
    id: String(tx._id),
    transactionId: tx.transactionId,
    type: tx.type,
    source: tx.source,
    amount: toAmount(tx.amount),
    status: tx.status,
    orderId: tx.order ? String(tx.order) : null,
    returnRequestId: tx.returnRequestId ? String(tx.returnRequestId) : null,
    razorpayOrderId: tx.razorpayOrderId || '',
    razorpayPaymentId: tx.razorpayPaymentId || '',
    description: tx.description || '',
    processedAt: tx.processedAt,
    createdAt: tx.createdAt
  }))
});

const ensureWallet = async (userId) => {
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, balance: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return wallet;
};

const getWalletWithTransactions = async (userId, options = {}) => {
  const wallet = await ensureWallet(userId);
  const limit = Math.max(1, Math.min(Number(options.limit || 20), 100));

  const transactions = await WalletTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return normalizeWalletResponse(wallet, transactions);
};

const getWalletTransactions = async (userId, options = {}) => {
  await ensureWallet(userId);

  const page = Math.max(Number(options.page || 1), 1);
  const limit = Math.max(1, Math.min(Number(options.limit || 20), 100));
  const skip = (page - 1) * limit;

  const [total, transactions] = await Promise.all([
    WalletTransaction.countDocuments({ user: userId }),
    WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  ]);

  return {
    total,
    page,
    limit,
    transactions: transactions.map((tx) => ({
      id: String(tx._id),
      transactionId: tx.transactionId,
      type: tx.type,
      source: tx.source,
      amount: toAmount(tx.amount),
      status: tx.status,
      orderId: tx.order ? String(tx.order) : null,
      returnRequestId: tx.returnRequestId ? String(tx.returnRequestId) : null,
      razorpayOrderId: tx.razorpayOrderId || '',
      razorpayPaymentId: tx.razorpayPaymentId || '',
      description: tx.description || '',
      processedAt: tx.processedAt,
      createdAt: tx.createdAt
    }))
  };
};

const createPendingTopupTransaction = async ({
  userId,
  amount,
  razorpayOrderId,
  description,
  metadata = {}
}) => {
  const normalizedAmount = toAmount(amount);
  if (normalizedAmount <= 0) {
    throw new Error('Topup amount must be greater than 0');
  }

  const wallet = await ensureWallet(userId);
  const idempotencyKey = `topup-order:${razorpayOrderId}`;

  const existing = await WalletTransaction.findOne({ idempotencyKey });
  if (existing) {
    return existing;
  }

  return WalletTransaction.create({
    wallet: wallet._id,
    user: userId,
    type: 'Credit',
    source: 'Razorpay',
    amount: normalizedAmount,
    status: 'Pending',
    razorpayOrderId,
    idempotencyKey,
    description: description || 'Wallet topup initiated',
    metadata,
    processedAt: new Date()
  });
};

const markTopupFailed = async ({ userId, razorpayOrderId, reason = '' }) => {
  const transaction = await WalletTransaction.findOneAndUpdate(
    {
      user: userId,
      source: 'Razorpay',
      razorpayOrderId,
      status: 'Pending'
    },
    {
      $set: {
        status: 'Failed',
        description: reason || 'Wallet topup failed',
        processedAt: new Date()
      }
    },
    { new: true }
  );

  return transaction;
};

const completeTopupTransaction = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  const existingSuccess = await WalletTransaction.findOne({
    user: userId,
    source: 'Razorpay',
    razorpayOrderId,
    status: 'Success'
  });

  if (existingSuccess) {
    return {
      transaction: existingSuccess,
      alreadyProcessed: true,
      wallet: await ensureWallet(userId)
    };
  }

  const transaction = await WalletTransaction.findOneAndUpdate(
    {
      user: userId,
      source: 'Razorpay',
      razorpayOrderId,
      status: 'Pending'
    },
    {
      $set: {
        status: 'Success',
        razorpayPaymentId,
        razorpaySignature: razorpaySignature || undefined,
        description: 'Wallet topup successful',
        processedAt: new Date()
      }
    },
    { new: true }
  );

  if (!transaction) {
    throw new Error('Topup transaction not found or already processed');
  }

  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: toAmount(transaction.amount) } },
    { new: true }
  );

  return {
    transaction,
    alreadyProcessed: false,
    wallet
  };
};

const creditWallet = async ({
  userId,
  amount,
  source,
  idempotencyKey,
  description,
  orderId = null,
  returnRequestId = null,
  metadata = {}
}) => {
  const normalizedAmount = toAmount(amount);
  if (normalizedAmount <= 0) {
    throw new Error('Credit amount must be greater than 0');
  }

  const existing = await WalletTransaction.findOne({ idempotencyKey });
  if (existing) {
    return {
      transaction: existing,
      wallet: await ensureWallet(userId),
      alreadyProcessed: true
    };
  }

  const wallet = await ensureWallet(userId);

  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: normalizedAmount } },
    { new: true }
  );

  let transaction;
  try {
    transaction = await WalletTransaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'Credit',
      source,
      amount: normalizedAmount,
      status: 'Success',
      order: orderId,
      ...(returnRequestId ? { returnRequestId } : {}),
      idempotencyKey,
      description: description || 'Wallet credited',
      metadata,
      processedAt: new Date()
    });
  } catch (error) {
    // Duplicate key means another concurrent process already wrote this transaction.
    if (error?.code === 11000) {
      const duplicate = await WalletTransaction.findOne({ idempotencyKey });
      return {
        transaction: duplicate,
        wallet: updatedWallet,
        alreadyProcessed: true
      };
    }

    throw error;
  }

  return {
    transaction,
    wallet: updatedWallet,
    alreadyProcessed: false
  };
};

const debitWallet = async ({
  userId,
  amount,
  source,
  idempotencyKey,
  description,
  orderId = null,
  metadata = {}
}) => {
  const normalizedAmount = toAmount(amount);
  if (normalizedAmount <= 0) {
    throw new Error('Debit amount must be greater than 0');
  }

  const existing = await WalletTransaction.findOne({ idempotencyKey });
  if (existing) {
    return {
      transaction: existing,
      wallet: await ensureWallet(userId),
      alreadyProcessed: true,
      insufficientBalance: false
    };
  }

  const wallet = await ensureWallet(userId);

  const updatedWallet = await Wallet.findOneAndUpdate(
    {
      _id: wallet._id,
      balance: { $gte: normalizedAmount }
    },
    {
      $inc: { balance: -normalizedAmount }
    },
    { new: true }
  );

  if (!updatedWallet) {
    return {
      transaction: null,
      wallet: await ensureWallet(userId),
      alreadyProcessed: false,
      insufficientBalance: true
    };
  }

  let transaction;
  try {
    transaction = await WalletTransaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'Debit',
      source,
      amount: normalizedAmount,
      status: 'Success',
      order: orderId,
      idempotencyKey,
      description: description || 'Wallet debited',
      metadata,
      processedAt: new Date()
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await WalletTransaction.findOne({ idempotencyKey });
      return {
        transaction: duplicate,
        wallet: updatedWallet,
        alreadyProcessed: true,
        insufficientBalance: false
      };
    }

    throw error;
  }

  return {
    transaction,
    wallet: updatedWallet,
    alreadyProcessed: false,
    insufficientBalance: false
  };
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

module.exports = {
  ensureWallet,
  getWalletWithTransactions,
  getWalletTransactions,
  createPendingTopupTransaction,
  markTopupFailed,
  completeTopupTransaction,
  creditWallet,
  debitWallet,
  isValidObjectId
};
