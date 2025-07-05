import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaserDashboard from './pages/PurchaserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="app-background"> {/* New background wrapper */}
      <Container fluid className="px-0 min-vh-100">
        {user && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={['ceo', 'purchaser', 'seller', 'driver']}>
                {user?.role === 'ceo' && <Dashboard />}
                {user?.role === 'purchaser' && <PurchaserDashboard />}
                {user?.role === 'seller' && <SellerDashboard />}
                {user?.role === 'driver' && <DriverDashboard />}
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
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
                background: '#343a40',
                color: 'white'
              },
            }}
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;