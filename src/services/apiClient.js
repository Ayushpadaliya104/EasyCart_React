import axios from 'axios';

const AUTH_TOKEN_KEY =
  process.env.REACT_APP_AUTH_TOKEN_KEY || 'easycart_auth_token';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
