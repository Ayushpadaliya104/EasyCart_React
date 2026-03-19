import apiClient from './apiClient';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300';

const normalizeProduct = (product) => {
  const isDiscounted =
    typeof product.discountPrice === 'number' &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const price = isDiscounted ? product.discountPrice : product.price;
  const originalPrice = isDiscounted ? product.price : null;
  const discount = isDiscounted
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return {
    id: product._id,
    name: product.title,
    slug: product.slug,
    description: product.description || '',
    price: Number(price || 0),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    discount,
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    image: product.images?.[0] || PLACEHOLDER_IMAGE,
    images: product.images?.length ? product.images : [PLACEHOLDER_IMAGE],
    category: product.category?.name || '',
    categoryId: product.category?._id || '',
    categorySlug: product.category?.slug || '',
    stock: Number(product.stock || 0),
    details: Array.isArray(product.details) ? product.details : []
  };
};

const normalizeCategory = (category) => ({
  id: category._id,
  name: category.name,
  slug: category.slug,
  icon: '🛍️'
});

export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return {
    ...response.data,
    products: (response.data.products || []).map(normalizeProduct)
  };
};

export const fetchProductById = async (idOrSlug) => {
  const response = await apiClient.get(`/products/${idOrSlug}`);
  return normalizeProduct(response.data.product);
};

export const fetchCategories = async () => {
  const response = await apiClient.get('/categories');
  return (response.data.categories || []).map(normalizeCategory);
};

export const createCategoryApi = async (payload) => {
  const response = await apiClient.post('/categories', payload);
  return response.data;
};

export const updateCategoryApi = async (id, payload) => {
  const response = await apiClient.put(`/categories/${id}`, payload);
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

export const createProductApi = async (payload) => {
  const response = await apiClient.post('/products', payload);
  return response.data;
};

export const updateProductApi = async (id, payload) => {
  const response = await apiClient.put(`/products/${id}`, payload);
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
