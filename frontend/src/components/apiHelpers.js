// const BASE_URL = 'http://127.0.0.1:5000/api';
//import axiosInstance from './axiosInstance'; // Adjust path if needed
import axios from 'axios';
const BASE_URL = 'http://127.0.0.1:5000/api';
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // or use `process.env.REACT_APP_API_URL`
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // needed if you're using cookies for auth
});

export const clearPurchasesDataAPI = () => axiosInstance.delete('/purchases/clear');
export const clearSalesDataAPI = () => axiosInstance.delete('/sales/clear');
export const clearInventoryDataAPI = () => axiosInstance.delete('/inventory/clear');
export const clearCarExpensesDataAPI = () => axiosInstance.delete('/car-expenses/clear');
export const clearOtherExpensesDataAPI = () => axiosInstance.delete('/expenses/other/clear');
export const clearSalariesDataAPI = () => axiosInstance.delete('/salaries/clear');
export const clearAllDataAPI = () => axiosInstance.delete('/clear-all');

//1 Generic fetch helper to handle errors, headers, etc.
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  // Always add JWT token if available
  const token = localStorage.getItem('access_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const fetchOptions = {
    ...options,
    headers
  };
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {}
    throw new Error(errorData.message || 'API request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// Add other API functions here as needed

// Stats API function
export async function fetchStats() {
  return request('/stats');  // Adjust the endpoint as needed
}

// Sales
export async function fetchSales() {
  return request('/sales', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('access_token') ? { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } : {})
    }
  });
}

export async function createSale(data) {
  return request('/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteSale(id) {
  return request(`/sales/${id}`, {
    method: 'DELETE',
  });
}

// Salary APIs

export async function fetchSalaries() {
  return request('/salaries');  // Adjust endpoint as per your backend API
}

export async function fetchSalaryPayments() {
  return request('/salary-payments');
}

export async function createSalary(salaryData) {
  return request('/salaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salaryData),
  });
}

export async function deleteSalary(id) {
  return request(`/salaries/${id}`, {
    method: 'DELETE',
  });
}

export async function recordPayment(paymentData) {
  return request('/salary-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
}

export async function togglePaymentStatus(paymentId) {
  return request(`/salary-payments/${paymentId}/toggle-status`, {
    method: 'POST',
  });
}


// Purchases API

export async function fetchPurchases() {
  return request('/purchases');
}

export async function deletePurchase(purchaseId) {
  return request(`/purchases/${purchaseId}`, {
    method: 'DELETE',
  });
}


// Performance API

export async function fetchPerformanceStats() {
  return request('/performance/stats');
}

export async function fetchFruitPerformance() {
  return request('/performance/fruit');
}

export async function fetchMonthlyData() {
  return request('/performance/monthly');
}

// Other Expenses API

export async function fetchOtherExpenses() {
  return request('/expenses/other');
}

export async function createOtherExpense(expenseData) {
  return request('/expenses/other', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });
}

export async function deleteOtherExpense(expenseId) {
  return request(`/expenses/other/${expenseId}`, {
    method: 'DELETE',
  });
}

// Inventory API
export async function fetchInventory(token) {
  return request('/inventory', {
    method: 'GET',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
}

export async function fetchStockMovements(token) {
  return request('/stock-movements', {
    method: 'GET',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
}

export async function createStockMovement(data, token) {
  return request('/stock-movements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });
}

export async function createGradient(data, token) {
  // Required fields for gradient creation:
  // fruit_type, gradient_type, application_date, notes (optional)
  if (!data.fruit_type || !data.gradient_type || !data.application_date) {
    throw new Error('Missing required fields: fruit_type, gradient_type, application_date');
  }
  return request('/gradients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      fruit_type: data.fruit_type,
      gradient_type: data.gradient_type,
      application_date: data.application_date,
      notes: data.notes || ''
    }),
  });
}

// Clear API calls
export async function clearInventoryAPI() {
  return request('/inventory/clear', { method: 'DELETE' });
}

export async function clearStockMovementsAPI() {
  return request('/stock/movements', { method: 'DELETE' });
}

export async function clearGradientsAPI() {
  return request('/gradients', { method: 'DELETE' });
}

// Assignments API

export async function createAssignment({ seller_id, seller_email, fruit_type, assignment_id }) {
  return request('/assignments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seller_id, seller_email, fruit_type, assignment_id })
  });
}

export async function createSaleForAssignment(assignment_id, saleData) {
  return request(`/assignments/${assignment_id}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData)
  });
}

export async function createInventory(data, token) {
  return request('/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });
}

export async function fetchGradients(token) {
  return request('/gradients', {
    method: 'GET',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
}

// Car Expenses API

export async function fetchCarExpenses() {
  return request('/car-expenses');
}

export async function deleteCarExpense(expenseId) {
  const token = localStorage.getItem('access_token');
  return request(`/api/car-expenses/${expenseId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
}

// Users API

export async function fetchUsers() {
  return request('/users', {
    method: 'GET',
  });
}
