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

export const clearPurchasesDataAPI = () => axiosInstance.delete('/data/clear-purchases');
export const clearSalesDataAPI = () => axiosInstance.delete('/data/clear-sales');
export const clearInventoryDataAPI = () => axiosInstance.delete('/data/clear-inventory');
export const clearCarExpensesDataAPI = () => axiosInstance.delete('/data/clear-car-expenses');
export const clearOtherExpensesDataAPI = () => axiosInstance.delete('/data/clear-other-expenses');
export const clearSalariesDataAPI = () => axiosInstance.delete('/data/clear-salaries');
export const clearAllDataAPI = () => axiosInstance.delete('/data/clear-all');

//1 Generic fetch helper to handle errors, headers, etc.
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

// Fetch CEO messages
export async function fetchCeoMessages() {
  return request('/ceo/messages');
}

// Update message as read
export async function updateMessageAsRead(messageId) {
  return request(`/ceo/messages/${messageId}/read`, {
    method: 'POST',
  });
}

// Add other API functions here as needed

// Stats API function
export async function fetchStats() {
  return request('/stats');  // Adjust the endpoint as needed
}

// Sales
export async function fetchSales() {
  return request('/sales');
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
export async function fetchInventory() {
  return request('/inventory');
}

export async function fetchStockMovements() {
  return request('/stock/movements');
}

export async function fetchGradients() {
  return request('/gradients');
}

// Clear API calls
export async function clearInventoryAPI() {
  return request('/inventory', { method: 'DELETE' });
}

export async function clearStockMovementsAPI() {
  return request('/stock/movements', { method: 'DELETE' });
}

export async function clearGradientsAPI() {
  return request('/gradients', { method: 'DELETE' });
}
