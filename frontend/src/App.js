import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast'; // <-- Make sure `toast` is imported
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
    toast.error('Please log in to access this page'); // <-- Toast feedback
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to view this page'); // <-- Toast feedback
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-vh-100">
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
              <Navigate 
                to={
                  user?.role === 'ceo' ? '/ceo'
                  : user?.role === 'purchaser' ? '/purchaser'
                  : user?.role === 'seller' ? '/seller'
                  : user?.role === 'driver' ? '/driver'
                  : '/login'
                }
                replace
              />
            </ProtectedRoute>
          }
        />

        <Route path="/ceo" element={<ProtectedRoute allowedRoles={['ceo']}><Dashboard /></ProtectedRoute>} />
        <Route path="/purchaser" element={<ProtectedRoute allowedRoles={['purchaser']}><PurchaserDashboard /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => (
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
              maxWidth: '500px',
              background: '#1e1e2d', // Dark mode friendly
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#4BB543', // Green checkmark
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff3333', // Red X
                secondary: 'white',
              },
            },
          }}
        />
      </Router>
    </DataProvider>
  </AuthProvider>
);

export default App;