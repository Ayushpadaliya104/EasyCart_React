const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    author: {
      type: String,
      default: 'Admin',
      trim: true,
      maxlength: 80
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const querySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ['Open', 'Answered', 'Closed'],
      default: 'Open'
    },
    unreadByAdmin: {
      type: Boolean,
      default: true
    },
    unreadByUser: {
      type: Boolean,
      default: false
    },
    replies: {
      type: [replySchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Query', querySchema);
