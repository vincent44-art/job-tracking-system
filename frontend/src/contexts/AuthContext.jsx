import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api'; // Assuming you've created the api service

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Verify authentication on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await api.get('/auth/verify');
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      setUser(data.user);
      localStorage.setItem('access_token', data.access_token);
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('access_token');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await api.get('/users');
      return data.users;
    } catch (error) {
      console.error('Failed to get users:', error);
      toast.error('Failed to load users');
      return [];
    }
  };

  const addUser = async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      setUsers(prev => [...prev, data.user]);
      toast.success('User added successfully');
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add user';
      toast.error(errorMsg);
      return false;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const { data } = await api.put(`/users/${userId}`, updates);
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      
      // Update current user if they updated themselves
      if (user?.id === userId) {
        setUser(data.user);
      }
      
      toast.success('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMsg);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      if (user?.id === userId) {
        throw new Error("You can't delete yourself");
      }
      
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMsg);
      return false;
    }
  };

  const value = {
    user,
    users,
    login,
    logout,
    loading,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};