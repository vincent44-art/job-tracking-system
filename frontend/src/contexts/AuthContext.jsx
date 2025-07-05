
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('fruittrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize CEO if no users exist
    const users = JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
    if (users.length === 0) {
      const ceoUser = {
        id: 'ceo-001',
        name: 'CEO Admin',
        email: 'ceo@fruittrack.com',
        role: 'ceo',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('fruittrack_users', JSON.stringify([ceoUser]));
    }
  }, []);

  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      toast.error('User not found. Please contact CEO to add your account.');
      return false;
    }

    if (foundUser.status === 'blocked') {
      toast.error('Your account has been blocked. Please contact CEO.');
      return false;
    }

    // Simple password check (in real app, this would be hashed)
    if (password !== 'password123') {
      toast.error('Invalid password.');
      return false;
    }

    setUser(foundUser);
    localStorage.setItem('fruittrack_user', JSON.stringify(foundUser));
    toast.success(`Welcome back, ${foundUser.name}!`);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fruittrack_user');
    toast.success('Logged out successfully');
  };

  const addUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      toast.error('User with this email already exists');
      return false;
    }

    // Validate email contains role
    const emailLower = userData.email.toLowerCase();
    if (userData.role !== 'ceo' && !emailLower.includes(userData.role)) {
      toast.error(`Email must contain "${userData.role}" for this role`);
      return false;
    }

    const newUser = {
      ...userData,
      id: `${userData.role}-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('fruittrack_users', JSON.stringify(users));
    toast.success(`User ${newUser.name} added successfully`);
    return true;
  };

  const updateUser = (id, updates) => {
    const users = JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) return false;

    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('fruittrack_users', JSON.stringify(users));
    
    // Update current user if it's the same user
    if (user && user.id === id) {
      setUser(users[userIndex]);
      localStorage.setItem('fruittrack_user', JSON.stringify(users[userIndex]));
    }
    
    return true;
  };

  const deleteUser = (id) => {
    const users = JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
    const filteredUsers = users.filter(u => u.id !== id);
    localStorage.setItem('fruittrack_users', JSON.stringify(filteredUsers));
    toast.success('User deleted successfully');
    return true;
  };

  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('fruittrack_users') || '[]');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
