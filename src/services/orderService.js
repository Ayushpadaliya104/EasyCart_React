import apiClient from './apiClient';

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];
const RETURN_WINDOW_DAYS = 7;

const buildTimeline = (status, createdAt, updatedAt) => {
  if (status === 'Cancelled') {
    return [
      {
        status: 'Pending',
        completed: true,
        date: createdAt ? new Date(createdAt).toLocaleString() : ''
      },
      {
        status: 'Cancelled',
        completed: true,
        date: updatedAt ? new Date(updatedAt).toLocaleString() : ''
      }
    ];
  }

  const effectiveStatus = ['Partially Returned', 'Returned / Refunded'].includes(status)
    ? 'Delivered'
    : status;
  const currentIndex = ORDER_STATUSES.indexOf(effectiveStatus);

  return ORDER_STATUSES.map((stepStatus, index) => ({
    status: stepStatus,
    completed: currentIndex >= index,
    date:
      currentIndex >= index
        ? new Date(index === 0 ? createdAt : updatedAt || createdAt).toLocaleString()
        : ''
  }));
};

const normalizeOrder = (order) => {
  const createdAt = order.createdAt || new Date().toISOString();
  const deliveredAt = order.deliveredAt || (String(order.status || '').includes('Delivered') ? order.updatedAt : null);
  const canReturnUntil = deliveredAt
    ? new Date(new Date(deliveredAt).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    : null;

  const normalizedItems = Array.isArray(order.items)
    ? order.items.map((item, index) => ({
        id: item.id || item._id || `${item.productId || item.product || 'item'}-${index}`,
        productId: item.productId || item.product,
        title: item.title,
        image: item.image,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        lineTotal: Number(item.lineTotal || Number(item.price || 0) * Number(item.quantity || 0)),
        itemStatus: item.itemStatus || 'Pending Delivery'
      }))
    : [];

  const normalizedReturnRequests = Array.isArray(order.returnRequests)
    ? order.returnRequests.map((request) => ({
        id: request.id,
        returnItems: Array.isArray(request.returnItems)
          ? request.returnItems.map((returnItem) => ({
              orderItemId: returnItem.orderItemId,
              productId: returnItem.productId || returnItem.product,
              productTitle: returnItem.productTitle,
              quantity: Number(returnItem.quantity || 0),
              unitPrice: Number(returnItem.unitPrice || 0),
              lineTotal: Number(returnItem.lineTotal || 0)
            }))
          : [],
        reasonCategory: request.reasonCategory || 'Other',
        comment: request.comment || '',
        image: request.image,
        status: request.status,
        refundAmount: Number(request.refundAmount || 0),
        refundStatus: request.refundStatus || 'Pending',
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        refundedAt: request.refundedAt
      }))
    : [];

  const eligibleReturnItems = normalizedItems.filter((item) => item.itemStatus === 'Delivered');
  const canRequestReturn = canReturnUntil instanceof Date && canReturnUntil > new Date() && eligibleReturnItems.length > 0;

  return {
    id: order.id,
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'Pending',
    paidAt: order.paidAt,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    shippingCharge: Number(order.shippingCharge || 0),
    total: Number(order.total || 0),
    totalRefunded: Number(order.totalRefunded || 0),
    netAmount: Number(order.netAmount || Number(order.total || 0) - Number(order.totalRefunded || 0)),
    items: normalizedItems,
    products: normalizedItems.map((item) => ({
      itemId: item.id,
      productId: item.productId,
      name: item.title,
      quantity: item.quantity,
      price: item.price,
      image: item.image || '',
      itemStatus: item.itemStatus
    })),
    returnRequests: normalizedReturnRequests,
    refundHistory: Array.isArray(order.refundHistory)
      ? order.refundHistory.map((entry) => ({
          id: entry.id,
          returnRequestId: entry.returnRequestId,
          amount: Number(entry.amount || 0),
          status: entry.status,
          processedAt: entry.processedAt
        }))
      : [],
    walletTransactions: Array.isArray(order.walletTransactions)
      ? order.walletTransactions.map((entry) => ({
          transactionId: entry.transactionId,
          type: entry.type,
          amount: Number(entry.amount || 0),
          source: entry.source,
          createdAt: entry.createdAt
        }))
      : [],
    shippingAddress: order.shippingAddress,
    address: order.shippingAddress
      ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipcode}`
      : '',
    trackingId: `EC-${String(order.id || '').slice(-8).toUpperCase()}`,
    date: new Date(createdAt).toLocaleDateString(),
    timeline: buildTimeline(order.status, createdAt, order.updatedAt),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveredAt,
    canReturnUntil: canReturnUntil ? canReturnUntil.toISOString() : null,
    canRequestReturn,
    eligibleReturnItems
  };
};

export const createOrderApi = async (payload) => {
  const response = await apiClient.post('/orders', payload);
  return normalizeOrder(response.data.order);
};

export const fetchMyOrdersApi = async () => {
  const response = await apiClient.get('/orders/my');
  return (response.data.orders || []).map(normalizeOrder);
};

export const fetchAllOrdersApi = async () => {
  const response = await apiClient.get('/orders');
  return (response.data.orders || []).map(normalizeOrder);
};

export const fetchOrderByIdApi = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return normalizeOrder(response.data.order);
};

export const updateOrderStatusApi = async (id, status) => {
  const response = await apiClient.put(`/orders/${id}/status`, { status });
  return normalizeOrder(response.data.order);
};

export const submitReturnRequestApi = async (orderId, payload) => {
  const response = await apiClient.post(`/orders/${orderId}/returns`, payload);
  return normalizeOrder(response.data.order);
};

const normalizeReturnRequest = (request) => ({
  id: request.id,
  orderId: request.orderId,
  orderStatus: request.orderStatus,
  customer: {
    id: request.customer?.id,
    name: request.customer?.name || '',
    email: request.customer?.email || ''
  },
  returnItems: Array.isArray(request.returnItems)
    ? request.returnItems.map((item) => ({
        orderItemId: item.orderItemId,
        productId: item.productId,
        productTitle: item.productTitle,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        lineTotal: Number(item.lineTotal || 0)
      }))
    : [],
  reasonCategory: request.reasonCategory || 'Other',
  comment: request.comment || '',
  image: request.image || '',
  status: request.status || 'Requested',
  refundAmount: Number(request.refundAmount || 0),
  refundStatus: request.refundStatus || 'Pending',
  requestedAt: request.requestedAt,
  updatedAt: request.updatedAt,
  refundedAt: request.refundedAt,
  total: Number(request.total || 0),
  paymentMethod: request.paymentMethod || ''
});

export const fetchAllReturnRequestsApi = async (params = {}) => {
  const response = await apiClient.get('/orders/returns', { params });
  return (response.data.returns || []).map(normalizeReturnRequest);
};

export const updateReturnRequestStatusApi = async (orderId, returnRequestId, status) => {
  const response = await apiClient.put(`/orders/returns/${orderId}/${returnRequestId}/status`, {
    status
  });
  return normalizeReturnRequest(response.data.returnRequest);
};
