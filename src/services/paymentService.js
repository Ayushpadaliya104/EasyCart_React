import apiClient from './apiClient';

export const createRazorpayOrderApi = async ({ items }) => {
  const response = await apiClient.post('/payments/razorpay/order', { items });
  return response.data;
};

export const verifyRazorpayPaymentApi = async (payload) => {
  const response = await apiClient.post('/payments/razorpay/verify', payload);
  return response.data;
};
