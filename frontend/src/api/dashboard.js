import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from '../contexts/AuthContext'; // Only valid in React components/hooks
import { get } from '../services/api';

// ✅ Custom Hook (must start with "use")
export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  
const loadData = async () => {
    if (!user) return;
    let endpoint;

    switch (user.role) {
      case 'ceo': endpoint = '/ceo/dashboard'; break;
      case 'seller': endpoint = '/seller/dashboard'; break;
      case 'purchaser': endpoint = '/purchaser/dashboard'; break;
      case 'storekeeper': endpoint = '/storekeeper/dashboard'; break;
      default:
        setError('Unauthorized role');
        setLoading(false);
        return;
    }

    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      console.error('Dashboard API Error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  return { data: data || {}, error, loading, refetch: loadData }; // <-- Always returns object
};

