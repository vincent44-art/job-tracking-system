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
  
  return (
    <div className="min-vh-100 fruit-tracking-bg">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        
        {/* CEO Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            {user?.role === 'ceo' && <Dashboard />}
            {user?.role === 'purchaser' && <PurchaserDashboard />}
            {user?.role === 'seller' && <SellerDashboard />}
            {user?.role === 'driver' && <DriverDashboard />}
            {(user?.role === 'storekeeper' || user?.role === 'store keeper') && <StoreKeeperDashboard />}
          </ProtectedRoute>
        } />

        {/* Purchaser-specific routes */}
        <Route path="/purchases" element={
          <ProtectedRoute requiredRoles={['purchaser', 'ceo']}>
            <PurchaserDashboard showPurchasesTab />
          </ProtectedRoute>
        } />

        {/* Salary management routes */}
        <Route path="/salaries" element={
          <ProtectedRoute requiredRoles={['ceo']}>
            <Dashboard showSalaryTab />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals that can be triggered from anywhere */}
      <PurchaseFormModal />
      <SalaryFormModal />
      <PaymentFormModal />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
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
      </Router>
    </AuthProvider>
  );
};

export default App;