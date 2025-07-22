import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

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
  // useEffect(() => {
  //   const verifyAuth = async () => {
  //     try {
  //       const { data } = await api.get('/auth/me');
  //       setUser(data.data); // ✅ backend returns user under "data"
  //     } catch (error) {
  //       setUser(null);
  //       localStorage.removeItem('access_token');
  //     } finally {
  //       setLoading(false);
  //     }
      
  //   };

  //   verifyAuth();
  //   loadUsers();
  // }, []);
  useEffect(() => {
  verifyAuth();
}, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('access_token');

    console.log("🔐 access_token before /auth/me:", token);

    if (!token) {
      console.warn("🚫 No token found. Skipping auth check.");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      console.log("✅ Auth verified. User:", response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error("❌ Auth check failed:", error.response?.data || error.message);
      setUser(null);
      localStorage.removeItem('access_token'); // Optionally clear invalid token
    } finally {
      setLoading(false);
    }
  };




  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data); // ✅ match backend structure
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      setUser(data.data.user);
      localStorage.setItem('access_token', data.data.access_token);
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };



  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    toast.success('Logged out successfully');
  };

  const getAllUsers = async () => {
    try {
      const { data } = await api.get('/users');
      return data.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      toast.error('Failed to load users');
      return [];
    }
  };

  const addUser = async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      setUsers(prev => [...prev, data.data]);
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
      setUsers(prev => prev.map(u => u.id === userId ? data.data : u));

      if (user?.id === userId) {
        setUser(data.data);
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
    
    // <AuthContext.Provider value={value}>
    //   {loading ? (
    //     <div>Loading authentication...</div>
    //   ) : (
    //     children
    //   )}
    // </AuthContext.Provider>
  );
};


