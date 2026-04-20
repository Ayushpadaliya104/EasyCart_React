const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      trim: true
    },
    storeName: {
      type: String,
      default: 'EasyCart',
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      default: 'support@easycart.com',
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: '+91-90909-90909',
      trim: true,
      maxlength: 40
    },
    address: {
      type: String,
      default: '123 Business Ave, City, State 12345',
      trim: true,
      maxlength: 300
    },
    taxRate: {
      type: Number,
      default: 8,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
