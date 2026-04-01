import apiClient from './apiClient';

const normalizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  createdAt: user.createdAt,
  status: 'Active'
});

export const fetchUsersApi = async () => {
  const response = await apiClient.get('/users');
  return (response.data.users || []).map(normalizeUser);
};

export const deleteUserApi = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export const changePasswordApi = async ({ oldPassword, newPassword }) => {
  const response = await apiClient.post('/auth/change-password', {
    oldPassword,
    newPassword
  });

  return response.data;
};
