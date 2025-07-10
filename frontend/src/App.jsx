
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PurchaserDashboard from './pages/PurchaserDashboard.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';
import StoreKeeperDashboard from './pages/StoreKeeperDashboard.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-vh-100 fruit-tracking-bg">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={
          <ProtectedRoute>
            {user?.role === 'ceo' && <Dashboard />}
            {user?.role === 'purchaser' && <PurchaserDashboard />}
            {user?.role === 'seller' && <SellerDashboard />}
            {user?.role === 'driver' && <DriverDashboard />}
            {(user?.role === 'storekeeper' || user?.role === 'store keeper') && <StoreKeeperDashboard />}
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
              },
            }}
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
