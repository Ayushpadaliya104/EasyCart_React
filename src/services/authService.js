import apiClient from './apiClient';

export const loginApi = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async ({ name, email, password }) => {
  const response = await apiClient.post('/auth/register', { name, email, password });
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateMeApi = async (payload) => {
  const response = await apiClient.put('/auth/me', payload);
  return response.data;
};
