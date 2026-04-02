import apiClient from './apiClient';

export const fetchWalletSummaryApi = async () => {
  const response = await apiClient.get('/wallet/me');
  return response.data.wallet;
};

export const fetchWalletTransactionsApi = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/wallet/transactions', {
    params: { page, limit }
  });

  return {
    total: Number(response.data.total || 0),
    page: Number(response.data.page || page),
    limit: Number(response.data.limit || limit),
    transactions: response.data.transactions || []
  };
};

export const createWalletTopupOrderApi = async ({ amount }) => {
  const response = await apiClient.post('/wallet/topup/order', { amount });
  return response.data;
};

export const verifyWalletTopupApi = async (payload) => {
  const response = await apiClient.post('/wallet/topup/verify', payload);
  return response.data;
};

export const failWalletTopupApi = async (payload) => {
  const response = await apiClient.post('/wallet/topup/fail', payload);
  return response.data;
};
