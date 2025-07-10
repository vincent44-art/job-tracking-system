
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }

    // Load users from localStorage
    const savedUsers = localStorage.getItem('fruittrack_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Error parsing saved users:', error);
        // Initialize with default users if parsing fails
        initializeDefaultUsers();
      }
    } else {
      initializeDefaultUsers();
    }

    setLoading(false);
  }, []);

  const initializeDefaultUsers = () => {
    const defaultUsers = [
      { 
        id: 'ceo-1', 
        email: 'ceo@company.com', 
        name: 'John Doe', 
        role: 'ceo', 
        status: 'active',
        createdAt: new Date().toISOString()
      },
      { 
        id: 'ceo-2', 
        email: 'ceo@fruittrack.com', 
        name: 'John Doe', 
        role: 'ceo', 
        status: 'active',
        createdAt: new Date().toISOString()
      },
      { 
        id: 'purchaser-1', 
        email: 'purchaser@company.com', 
        name: 'Jane Smith', 
        role: 'purchaser', 
        status: 'active',
        createdAt: new Date().toISOString()
      },
      { 
        id: 'seller-1', 
        email: 'seller@company.com', 
        name: 'Bob Johnson', 
        role: 'seller', 
        status: 'active',
        createdAt: new Date().toISOString()
      },
      { 
        id: 'driver-1', 
        email: 'driver@company.com', 
        name: 'Mike Wilson', 
        role: 'driver', 
        status: 'active',
        createdAt: new Date().toISOString()
      },
      { 
        id: 'storekeeper-1', 
        email: 'storekeeper@company.com', 
        name: 'Sarah Davis', 
        role: 'storekeeper', 
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    setUsers(defaultUsers);
    localStorage.setItem('fruittrack_users', JSON.stringify(defaultUsers));
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      
      // Find user in the users array
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        const userData = { ...foundUser };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login successful:', userData);
        return { success: true };
      } else if (foundUser && password === 'password123') {
        const userData = { ...foundUser };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login successful:', userData);
        return { success: true };
      } else {
        console.log('Invalid credentials for:', email);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  const getAllUsers = () => {
    return users;
  };

  const addUser = (userData) => {
    try {
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // Check if email already exists
      if (users.find(u => u.email === newUser.email)) {
        toast.error('User with this email already exists');
        return false;
      }

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('fruittrack_users', JSON.stringify(updatedUsers));
      toast.success('User added successfully');
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
      return false;
    }
  };

  const updateUser = (userId, updates) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem('fruittrack_users', JSON.stringify(updatedUsers));
      toast.success('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return false;
    }
  };

  const deleteUser = (userId) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.role === 'ceo') {
        toast.error('Cannot delete CEO user');
        return false;
      }

      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('fruittrack_users', JSON.stringify(updatedUsers));
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
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
