import apiClient from './apiClient';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

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

  const currentIndex = ORDER_STATUSES.indexOf(status);

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

  return {
    id: order.id,
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    shippingCharge: Number(order.shippingCharge || 0),
    total: Number(order.total || 0),
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 0)
        }))
      : [],
    products: Array.isArray(order.items)
      ? order.items.map((item) => ({
          name: item.title,
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
          image: item.image || ''
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
    updatedAt: order.updatedAt
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
