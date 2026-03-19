import apiClient from './apiClient';

const normalizeCartItems = (items = []) =>
  items.map((item) => ({
    id: item.productId,
    name: item.title,
    image: item.image || 'https://via.placeholder.com/100',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    stock: Number(item.stock || 0)
  }));

export const fetchMyCartApi = async () => {
  const response = await apiClient.get('/cart/my');
  return normalizeCartItems(response.data?.cart?.items || []);
};

export const replaceMyCartApi = async (cartItems) => {
  const payload = {
    items: (cartItems || []).map((item) => ({
      productId: item.id,
      quantity: Number(item.quantity || 1)
    }))
  };

  const response = await apiClient.put('/cart/my', payload);
  return normalizeCartItems(response.data?.cart?.items || []);
};

export const clearMyCartApi = async () => {
  await apiClient.delete('/cart/my');
};
