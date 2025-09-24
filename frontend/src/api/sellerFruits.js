import api from './api';

// Fetch all seller fruits
export const fetchSellerFruits = async (token = null) => {
  const response = await api.get('/seller-fruits', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  return response.data;
};

// Create a new seller fruit
export const createSellerFruit = async (fruitData) => {
  const response = await api.post('/seller-fruits', fruitData);
  return response.data;
};

// Update a seller fruit
export const updateSellerFruit = async (fruitId, fruitData) => {
  const response = await api.put(`/seller-fruits/${fruitId}`, fruitData);
  return response.data;
};

// Delete a seller fruit
export const deleteSellerFruit = async (fruitId) => {
  const response = await api.delete(`/seller-fruits/${fruitId}`);
  return response.data;
};
