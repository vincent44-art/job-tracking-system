import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaserDashboard from './pages/PurchaserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import StoreKeeperDashboard from './pages/StoreKeeperDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const RoleBasedRoute = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ceo':
      return <Dashboard />;
    case 'purchaser':
      return <PurchaserDashboard />;
    case 'seller':
      return <SellerDashboard />;
    case 'driver':
      return <DriverDashboard />;
    case 'storekeeper':
    case 'store keeper':
      return <StoreKeeperDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-vh-100 fruit-tracking-bg">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute />
            </ProtectedRoute>
          } 
        />
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
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4BB543',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff3333',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;