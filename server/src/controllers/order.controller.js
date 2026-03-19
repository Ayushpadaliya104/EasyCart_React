const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const buildOrderResponse = (orderDoc) => ({
  id: orderDoc._id,
  userId: orderDoc.user?._id || orderDoc.user,
  userName: orderDoc.user?.name || '',
  userEmail: orderDoc.user?.email || '',
  status: orderDoc.status,
  paymentMethod: orderDoc.paymentMethod,
  subtotal: orderDoc.subtotal,
  tax: orderDoc.tax,
  shippingCharge: orderDoc.shippingCharge,
  total: orderDoc.total,
  items: (orderDoc.items || []).map((item) => ({
    productId: item.product,
    title: item.title,
    image: item.image,
    price: item.price,
    quantity: item.quantity
  })),
  shippingAddress: orderDoc.shippingAddress,
  createdAt: orderDoc.createdAt,
  updatedAt: orderDoc.updatedAt
});

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'card' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items are required'
      });
    }

    const requiredAddressFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zipcode'
    ];

    if (!shippingAddress || requiredAddressFields.some((field) => !shippingAddress[field])) {
      return res.status(400).json({
        success: false,
        message: 'Complete shippingAddress is required'
      });
    }

    const mappedItems = [];

    for (const item of items) {
      const productId = item.productId || item.product;
      const quantity = Number(item.quantity || 0);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order item payload'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products are invalid'
        });
      }

      const unitPrice =
        typeof product.discountPrice === 'number' &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price
          ? Number(product.discountPrice)
          : Number(product.price);

      mappedItems.push({
        product: product._id,
        title: product.title,
        image: product.images?.[0] || '',
        price: unitPrice,
        quantity
      });
    }

    const subtotal = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const shippingCharge = 0;
    const total = Number((subtotal + tax + shippingCharge).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items: mappedItems,
      shippingAddress: {
        ...shippingAddress,
        email: String(shippingAddress.email).toLowerCase()
      },
      paymentMethod,
      subtotal,
      tax,
      shippingCharge,
      total
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: buildOrderResponse(order)
    });
  } catch (error) {
    return next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(buildOrderResponse)
    });
  } catch (error) {
    return next(error);
  }
};

const getAllOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(buildOrderResponse)
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id'
      });
    }

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: access denied'
      });
    }

    return res.status(200).json({
      success: true,
      order: buildOrderResponse(order)
    });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: buildOrderResponse(order)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
