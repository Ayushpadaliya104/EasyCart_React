import apiClient from './apiClient';

const DEFAULT_SETTINGS = {
  storeName: 'EasyCart',
  email: 'support@easycart.com',
  phone: '+91-90909-90909',
  address: '123 Business Ave, City, State 12345',
  taxRate: 8
};

const normalizeSettings = (settings = {}) => ({
  storeName: settings.storeName || DEFAULT_SETTINGS.storeName,
  email: settings.email || DEFAULT_SETTINGS.email,
  phone: settings.phone || DEFAULT_SETTINGS.phone,
  address: settings.address || DEFAULT_SETTINGS.address,
  taxRate: Number(settings.taxRate ?? DEFAULT_SETTINGS.taxRate)
});

export const fetchPublicStoreSettingsApi = async () => {
  const response = await apiClient.get('/settings');
  return normalizeSettings(response.data?.settings);
};

export const fetchAdminStoreSettingsApi = async () => {
  const response = await apiClient.get('/settings/admin');
  return normalizeSettings(response.data?.settings);
};

export const updateAdminStoreSettingsApi = async (payload) => {
  const response = await apiClient.put('/settings/admin', payload);
  return normalizeSettings(response.data?.settings);
};

export { DEFAULT_SETTINGS };
