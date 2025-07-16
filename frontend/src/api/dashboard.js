import api from './api';

export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard API Error:', error);
    throw error;
  }
};