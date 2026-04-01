const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');

const RETURN_WINDOW_DAYS = 7;
const MAX_RETURN_IMAGE_LENGTH = 5 * 1024 * 1024;
const RETURN_REASONS = ['Damaged', 'Wrong item', 'Not satisfied', 'Other'];

const RETURN_STATUS_FLOW = {
  Requested: ['Approved', 'Rejected'],
  Approved: ['Picked', 'Rejected'],
  Picked: ['Refunded'],
  Rejected: [],
  Refunded: []
};

const roundTwo = (value) => Number((Number(value || 0)).toFixed(2));

const getReturnDeadline = (order) => {
  if (!order.deliveredAt) {
    return null;
  }

  const deadline = new Date(order.deliveredAt);
  deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
  return deadline;
};

const isOrderInReturnWindow = (order) => {
  const deadline = getReturnDeadline(order);
  if (!deadline) {
    return false;
  }

  return new Date() <= deadline;
};

const getEligibleReturnItems = (order) => {
  return (order.items || []).filter((item) => item.itemStatus === 'Delivered');
};

const applyOrderReturnStatus = (order) => {
  if (!order.deliveredAt) {
    return;
  }

  const totalItems = (order.items || []).length;
  const refundedItems = (order.items || []).filter(
    (item) => item.itemStatus === 'Returned / Refunded'
  ).length;

  if (totalItems > 0 && refundedItems === totalItems) {
    order.status = 'Returned / Refunded';
    return;
  }

  if (refundedItems > 0) {
    order.status = 'Partially Returned';
    return;
  }

  order.status = 'Delivered';
};

const buildOrderResponse = (orderDoc) => {
  const returnDeadline = getReturnDeadline(orderDoc);
  const eligibleItems = getEligibleReturnItems(orderDoc);

  return {
    id: orderDoc._id,
    userId: orderDoc.user?._id || orderDoc.user,
    userName: orderDoc.user?.name || '',
    userEmail: orderDoc.user?.email || '',
    status: orderDoc.status,
    paymentMethod: orderDoc.paymentMethod,
    subtotal: Number(orderDoc.subtotal || 0),
    tax: Number(orderDoc.tax || 0),
    shippingCharge: Number(orderDoc.shippingCharge || 0),
    total: Number(orderDoc.total || 0),
    totalRefunded: Number(orderDoc.totalRefunded || 0),
    netAmount: roundTwo(Number(orderDoc.total || 0) - Number(orderDoc.totalRefunded || 0)),
    items: (orderDoc.items || []).map((item, index) => ({
      id: item._id || `${item.product}-${index}`,
      productId: item.product,
      title: item.title,
      image: item.image,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: roundTwo(Number(item.price || 0) * Number(item.quantity || 0)),
      itemStatus: item.itemStatus || 'Pending Delivery'
    })),
    returnRequests: (orderDoc.returnRequests || []).map((request) => ({
      id: request._id,
      returnItems: (request.returnItems || []).map((returnItem) => ({
        orderItemId: returnItem.orderItemId,
        productId: returnItem.product,
        productTitle: returnItem.productTitle,
        quantity: Number(returnItem.quantity || 0),
        unitPrice: Number(returnItem.unitPrice || 0),
        lineTotal: Number(returnItem.lineTotal || 0)
      })),
      reasonCategory: request.reasonCategory,
      comment: request.comment || '',
      image: request.image,
      status: request.status,
      refundAmount: Number(request.refundAmount || 0),
      refundStatus: request.refundStatus,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      refundedAt: request.refundedAt
    })),
    refundHistory: (orderDoc.refundHistory || []).map((entry) => ({
      id: entry._id,
      returnRequestId: entry.returnRequestId,
      amount: Number(entry.amount || 0),
      status: entry.status,
      processedAt: entry.processedAt
    })),
    shippingAddress: orderDoc.shippingAddress,
    createdAt: orderDoc.createdAt,
    updatedAt: orderDoc.updatedAt,
    deliveredAt: orderDoc.deliveredAt,
    returnDeadline,
    canRequestReturn: isOrderInReturnWindow(orderDoc) && eligibleItems.length > 0,
    eligibleReturnItemIds: eligibleItems.map((item) => String(item._id || ''))
  };
};

const validateReturnImage = (value) => {
  const image = String(value || '').trim();
  if (!image) {
    return 'Received product image is required';
  }

  if (!image.startsWith('data:image/')) {
    return 'Only image uploads are allowed for return evidence';
  }

  if (image.length > MAX_RETURN_IMAGE_LENGTH) {
    return 'Uploaded image is too large. Please use a smaller image.';
  }

  return '';
};

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
        quantity,
        itemStatus: 'Pending Delivery'
      });
    }

    const subtotal = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const storeSettings = await StoreSettings.findOne({ key: 'default' }).select('taxRate');
    const taxRate = Number(storeSettings?.taxRate ?? 8);
    const tax = roundTwo(subtotal * (taxRate / 100));
    const shippingCharge = 0;
    const total = roundTwo(subtotal + tax + shippingCharge);

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
      total,
      totalRefunded: 0
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

const getAllReturnRequests = async (req, res, next) => {
  try {
    const statusFilter = String(req.query.status || '').trim();
    const userFilter = String(req.query.user || '').trim().toLowerCase();
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const orders = await Order.find({ 'returnRequests.0': { $exists: true } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const returns = orders.flatMap((order) =>
      (order.returnRequests || []).map((request) => ({
        id: request._id,
        orderId: String(order._id),
        orderStatus: order.status,
        customer: {
          id: order.user?._id || order.user,
          name: order.user?.name || '',
          email: order.user?.email || ''
        },
        returnItems: (request.returnItems || []).map((item) => ({
          orderItemId: item.orderItemId,
          productId: item.product,
          productTitle: item.productTitle,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0)
        })),
        reasonCategory: request.reasonCategory,
        comment: request.comment || '',
        image: request.image,
        status: request.status,
        refundAmount: Number(request.refundAmount || 0),
        refundStatus: request.refundStatus,
        requestedAt: request.createdAt,
        updatedAt: request.updatedAt,
        refundedAt: request.refundedAt,
        total: Number(order.total || 0),
        paymentMethod: order.paymentMethod
      }))
    );

    const filtered = returns.filter((entry) => {
      if (statusFilter && statusFilter !== 'All' && entry.status !== statusFilter) {
        return false;
      }

      if (userFilter) {
        const name = String(entry.customer.name || '').toLowerCase();
        const email = String(entry.customer.email || '').toLowerCase();
        if (!name.includes(userFilter) && !email.includes(userFilter)) {
          return false;
        }
      }

      if (dateFrom || dateTo) {
        const requestedDate = new Date(entry.requestedAt);
        if (dateFrom && requestedDate < dateFrom) {
          return false;
        }
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          if (requestedDate > end) {
            return false;
          }
        }
      }

      return true;
    });

    filtered.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return res.status(200).json({
      success: true,
      count: filtered.length,
      returns: filtered
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

const submitReturnRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemIds, itemId, reasonCategory, comment, image } = req.body;

    const cleanReasonCategory = String(reasonCategory || '').trim();
    if (!RETURN_REASONS.includes(cleanReasonCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Valid reasonCategory is required'
      });
    }

    const imageValidationMessage = validateReturnImage(image);
    if (imageValidationMessage) {
      return res.status(400).json({
        success: false,
        message: imageValidationMessage
      });
    }

    const cleanComment = String(comment || '').trim();
    if (cleanComment.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be under 500 characters'
      });
    }

    const normalizedItemIds = Array.isArray(itemIds)
      ? itemIds
      : itemId
      ? [itemId]
      : [];

    if (normalizedItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one order item must be selected'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: access denied'
      });
    }

    if (!order.deliveredAt || !['Delivered', 'Partially Returned', 'Returned / Refunded'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Returns are only allowed after delivery'
      });
    }

    if (!isOrderInReturnWindow(order)) {
      return res.status(400).json({
        success: false,
        message: `Return window expired. Requests are allowed within ${RETURN_WINDOW_DAYS} days of delivery.`
      });
    }

    const selectedItems = [];
    const selectedItemIdSet = new Set();

    for (const rawItemId of normalizedItemIds) {
      const normalized = String(rawItemId || '').trim();
      if (!normalized || selectedItemIdSet.has(normalized)) {
        continue;
      }

      selectedItemIdSet.add(normalized);

      const matchedItem = (order.items || []).find((item) => String(item._id) === normalized);
      if (!matchedItem) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected items are invalid for this order'
        });
      }

      if (matchedItem.itemStatus !== 'Delivered') {
        return res.status(400).json({
          success: false,
          message: `Item ${matchedItem.title} is not eligible for return`
        });
      }

      selectedItems.push(matchedItem);
    }

    if (selectedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items selected for return'
      });
    }

    const returnItems = selectedItems.map((item) => {
      item.itemStatus = 'Return Requested';
      return {
        orderItemId: item._id,
        product: item.product,
        productTitle: item.title,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.price || 0),
        lineTotal: roundTwo(Number(item.quantity || 0) * Number(item.price || 0))
      };
    });

    order.returnRequests.push({
      returnItems,
      reasonCategory: cleanReasonCategory,
      comment: cleanComment,
      image: String(image),
      status: 'Requested',
      refundAmount: 0,
      refundStatus: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    applyOrderReturnStatus(order);
    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      order: buildOrderResponse(order)
    });
  } catch (error) {
    return next(error);
  }
};

const updateReturnRequestStatus = async (req, res, next) => {
  try {
    const { orderId, returnRequestId } = req.params;
    const { status } = req.body;

    const cleanStatus = String(status || '').trim();
    if (!cleanStatus) {
      return res.status(400).json({
        success: false,
        message: 'status is required'
      });
    }

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const returnRequest = (order.returnRequests || []).id(returnRequestId);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    const currentStatus = returnRequest.status;
    const allowedNext = RETURN_STATUS_FLOW[currentStatus] || [];

    if (!allowedNext.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid return status transition from ${currentStatus} to ${cleanStatus}`
      });
    }

    returnRequest.status = cleanStatus;
    returnRequest.updatedAt = new Date();

    if (cleanStatus === 'Rejected') {
      (returnRequest.returnItems || []).forEach((returnItem) => {
        const matched = (order.items || []).id(returnItem.orderItemId);
        if (matched && matched.itemStatus === 'Return Requested') {
          matched.itemStatus = 'Delivered';
        }
      });
      returnRequest.refundStatus = 'Rejected';
    }

    if (cleanStatus === 'Refunded') {
      const refundAmount = roundTwo(
        (returnRequest.returnItems || []).reduce(
          (sum, returnItem) => sum + Number(returnItem.lineTotal || 0),
          0
        )
      );

      (returnRequest.returnItems || []).forEach((returnItem) => {
        const matched = (order.items || []).id(returnItem.orderItemId);
        if (matched) {
          matched.itemStatus = 'Returned / Refunded';
        }
      });

      returnRequest.refundAmount = refundAmount;
      returnRequest.refundStatus = 'Processed';
      returnRequest.refundedAt = new Date();

      const existingHistory = (order.refundHistory || []).find(
        (entry) => String(entry.returnRequestId) === String(returnRequest._id)
      );

      if (!existingHistory) {
        order.refundHistory.push({
          returnRequestId: returnRequest._id,
          amount: refundAmount,
          status: 'Refunded',
          processedAt: new Date()
        });
      }

      order.totalRefunded = roundTwo(
        (order.refundHistory || []).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
      );
    }

    applyOrderReturnStatus(order);
    await order.save();

    const refreshed = (order.returnRequests || []).id(returnRequest._id);

    return res.status(200).json({
      success: true,
      message: 'Return request status updated successfully',
      returnRequest: {
        id: refreshed._id,
        orderId: String(order._id),
        orderStatus: order.status,
        customer: {
          id: order.user?._id || order.user,
          name: order.user?.name || '',
          email: order.user?.email || ''
        },
        returnItems: (refreshed.returnItems || []).map((item) => ({
          orderItemId: item.orderItemId,
          productId: item.product,
          productTitle: item.productTitle,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0)
        })),
        reasonCategory: refreshed.reasonCategory,
        comment: refreshed.comment || '',
        image: refreshed.image,
        status: refreshed.status,
        refundAmount: Number(refreshed.refundAmount || 0),
        refundStatus: refreshed.refundStatus,
        requestedAt: refreshed.createdAt,
        updatedAt: refreshed.updatedAt,
        refundedAt: refreshed.refundedAt,
        total: Number(order.total || 0),
        paymentMethod: order.paymentMethod
      },
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

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'Delivered') {
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      (order.items || []).forEach((item) => {
        if (item.itemStatus === 'Pending Delivery') {
          item.itemStatus = 'Delivered';
        }
      });

      applyOrderReturnStatus(order);
    }

    await order.save();

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
  getAllReturnRequests,
  getOrderById,
  submitReturnRequest,
  updateReturnRequestStatus,
  updateOrderStatus
};
