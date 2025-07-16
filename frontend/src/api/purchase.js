// src/api/purchase.js
import api from './api';

export const fetchPurchases = (email) =>
  api.get(`/purchases/${email}`);

export const addPurchase = (data) =>
  api.post('/purchases', data);

export const clearPurchases = (email) =>
  api.delete(`/purchases/${email}`);
