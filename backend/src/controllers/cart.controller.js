const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const pickPrice = (product) => {
  if (
    typeof product.discountPrice === 'number' &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
  ) {
    return Number(product.discountPrice);
  }
  return Number(product.price || 0);
};

const serializeCart = (cartDoc) => {
  const items = (cartDoc.items || [])
    .filter((item) => item.product)
    .map((item) => ({
      productId: item.product._id || item.product,
      quantity: Number(item.quantity || 1),
      title: item.product.title || '',
      image: item.product.images?.[0] || '',
      price: pickPrice(item.product),
      stock: Number(item.product.stock || 0),
      isActive: typeof item.product.isActive === 'boolean' ? item.product.isActive : true
    }));

  return {
    id: cartDoc._id,
    userId: cartDoc.user,
    items,
    updatedAt: cartDoc.updatedAt
  };
};

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate('items.product');
  }
  return cart;
};

const getMyCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart: serializeCart(cart)
    });
  } catch (error) {
    return next(error);
  }
};

const replaceMyCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'items must be an array'
      });
    }

    const merged = new Map();
    for (const item of items) {
      const productId = String(item.productId || item.product || '');
      const quantity = Number(item.quantity || 0);

      if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
        continue;
      }

      if (!merged.has(productId)) {
        merged.set(productId, 0);
      }
      merged.set(productId, merged.get(productId) + quantity);
    }

    const productIds = [...merged.keys()];
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).select('_id');
    const validIds = new Set(products.map((p) => String(p._id)));

    const normalizedItems = [...merged.entries()]
      .filter(([productId]) => validIds.has(productId))
      .map(([productId, quantity]) => ({
        product: productId,
        quantity
      }));

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: normalizedItems },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: serializeCart(cart)
    });
  } catch (error) {
    return next(error);
  }
};

const clearMyCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: serializeCart(cart)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyCart,
  replaceMyCart,
  clearMyCart
};
