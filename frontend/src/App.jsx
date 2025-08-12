import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Modal } from 'antd';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaserDashboard from './pages/PurchaserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import StoreKeeperDashboard from './pages/StoreKeeperDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Import modal components
import PurchaseFormModal from './components/modals/PurchaseFormModal';
import SalaryFormModal from './components/modals/SalaryFormModal';
import PaymentFormModal from './components/modals/PaymentFormModal';

// const ProtectedRoute = ({ children, requiredRoles = [] }) => {
//   const { user } = useAuth();
  
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
//     Modal.error({
//       title: 'Unauthorized Access',
//       content: 'You do not have permission to access this page.',
//     });
//     return <Navigate to="/" replace />;
//   }
  
//   return <>{children}</>;
// };

// const AppContent = () => {
//   const { user } = useAuth();
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>; // Wait until verifyAuth finishes
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    Modal.error({
      title: 'Unauthorized Access',
      content: 'You do not have permission to access this page.',
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>; // Prevent rendering until user is verified
  }
  
  // Role-based dashboard routing
  if (user) {
    if (user.role === 'ceo') {
      // CEO can access all dashboards
      return (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/purchaser" element={<PurchaserDashboard />} />
          <Route path="/storekeeper" element={<StoreKeeperDashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      );
    } else if (user.role === 'seller') {
      return (
        <Routes>
          <Route path="/" element={<SellerDashboard />} />
          <Route path="*" element={<SellerDashboard />} />
        </Routes>
      );
    } else if (user.role === 'driver') {
      return (
        <Routes>
          <Route path="/" element={<DriverDashboard />} />
          <Route path="*" element={<DriverDashboard />} />
        </Routes>
      );
    } else if (user.role === 'purchaser') {
      return (
        <Routes>
          <Route path="/" element={<PurchaserDashboard />} />
          <Route path="*" element={<PurchaserDashboard />} />
        </Routes>
      );
    } else if (user.role === 'storekeeper' || user.role === 'store keeper') {
      return (
        <Routes>
          <Route path="/" element={<StoreKeeperDashboard />} />
          <Route path="*" element={<StoreKeeperDashboard />} />
        </Routes>
      );
    }
  }

  // If not logged in, show login
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="fruit-tracking-bg" style={{ minHeight: '100vh', minWidth: '100vw' }}>
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
              success: {
                iconTheme: {
                  primary: '#4BB543',
                  secondary: 'white',
                },
              },
              error: {
                style: {
                  background: '#FFEBEE',
                  color: '#C62828',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;