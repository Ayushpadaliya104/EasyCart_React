const mongoose = require('mongoose');
const crypto = require('crypto');

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      default: () => `wtx_${crypto.randomUUID().replace(/-/g, '')}`
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['Credit', 'Debit'],
      required: true
    },
    source: {
      type: String,
      enum: ['Razorpay', 'Refund', 'Purchase', 'Adjustment'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed', 'Reversed'],
      default: 'Pending'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    returnRequestId: {
      type: mongoose.Schema.Types.ObjectId
    },
    razorpayOrderId: {
      type: String,
      trim: true
    },
    razorpayPaymentId: {
      type: String,
      trim: true
    },
    razorpaySignature: {
      type: String,
      trim: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
walletTransactionSchema.index(
  { source: 1, returnRequestId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      source: 'Refund',
      returnRequestId: { $exists: true, $type: 'objectId' }
    }
  }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
