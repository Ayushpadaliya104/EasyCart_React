const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    itemStatus: {
      type: String,
      enum: ['Pending Delivery', 'Delivered', 'Return Requested', 'Returned / Refunded'],
      default: 'Pending Delivery'
    }
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    returnItems: {
      type: [
        new mongoose.Schema(
          {
            orderItemId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true
            },
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product',
              required: true
            },
            productTitle: {
              type: String,
              required: true,
              trim: true
            },
            quantity: {
              type: Number,
              required: true,
              min: 1
            },
            unitPrice: {
              type: Number,
              required: true,
              min: 0
            },
            lineTotal: {
              type: Number,
              required: true,
              min: 0
            }
          },
          { _id: false }
        )
      ],
      default: []
    },
    reasonCategory: {
      type: String,
      enum: ['Damaged', 'Wrong item', 'Not satisfied', 'Other'],
      required: true
    },
    comment: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Picked', 'Refunded'],
      default: 'Requested'
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Rejected'],
      default: 'Pending'
    },
    refundedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const refundHistorySchema = new mongoose.Schema(
  {
    returnRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['Refunded'],
      default: 'Refunded'
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Order must contain at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'razorpay', 'cod', 'wallet'],
      default: 'card'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paidAt: {
      type: Date,
      default: null
    },
    walletTransactions: {
      type: [
        new mongoose.Schema(
          {
            transactionId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true
            },
            type: {
              type: String,
              enum: ['Debit', 'Credit'],
              required: true
            },
            amount: {
              type: Number,
              required: true,
              min: 0
            },
            source: {
              type: String,
              enum: ['Purchase', 'Refund'],
              required: true
            },
            createdAt: {
              type: Date,
              default: Date.now
            }
          },
          { _id: false }
        )
      ],
      default: []
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Partially Returned',
        'Returned / Refunded',
        'Cancelled'
      ],
      default: 'Pending'
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    returnRequests: {
      type: [returnRequestSchema],
      default: []
    },
    refundHistory: {
      type: [refundHistorySchema],
      default: []
    },
    totalRefunded: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Order', orderSchema);
