import apiClient from './apiClient';

export const fetchQueriesApi = async () => {
  const response = await apiClient.get('/queries');
  return response.data;
};

export const createQueryApi = async (payload) => {
  const response = await apiClient.post('/queries', payload);
  return response.data;
};

export const addQueryReplyApi = async (queryId, payload) => {
  const response = await apiClient.post(`/queries/${queryId}/replies`, payload);
  return response.data;
};

export const updateQueryStatusApi = async (queryId, status) => {
  const response = await apiClient.patch(`/queries/${queryId}/status`, { status });
  return response.data;
};

export const markQueryReadByAdminApi = async (queryId) => {
  const response = await apiClient.patch(`/queries/${queryId}/read/admin`);
  return response.data;
};

export const markQueriesReadByUserApi = async () => {
  const response = await apiClient.patch('/queries/read/user');
  return response.data;
};
