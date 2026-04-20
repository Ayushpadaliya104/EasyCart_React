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

export const forgotPasswordApi = async ({ email }) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetTokenApi = async ({ token, email }) => {
  const response = await apiClient.get('/auth/verify-reset-token', {
    params: { token, email }
  });
  return response.data;
};

export const resetPasswordApi = async ({ token, email, newPassword, confirmPassword }) => {
  const response = await apiClient.post('/auth/reset-password', {
    token,
    email,
    newPassword,
    confirmPassword
  });
  return response.data;
};
