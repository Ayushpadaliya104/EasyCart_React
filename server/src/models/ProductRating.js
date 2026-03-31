const mongoose = require('mongoose');

const productRatingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

productRatingSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ProductRating', productRatingSchema);
