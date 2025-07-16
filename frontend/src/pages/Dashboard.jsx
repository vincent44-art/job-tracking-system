import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboardData } from '../api/dashboard'; // Correct import path
import StatsCards from '../components/StatsCards';
import PurchasesTab from '../components/PurchasesTab';
import SalesTab from '../components/SalesTab';
import CarExpensesTab from '../components/CarExpensesTab';
import OtherExpensesTab from '../components/OtherExpensesTab';
import UserManagementTab from '../components/UserManagementTab';
import SalaryManagementTab from '../components/SalaryManagementTab';
import InventoryTab from '../components/InventoryTab';
import PerformanceOverview from '../components/PerformanceOverview';
import CeoMessagePanel from '../components/CeoMessagePanel';
import ClearDataModal from '../components/ClearDataModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showClearModal, setShowClearModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    if (user?.role !== 'ceo') return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadNotifications || 0);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <>
            {dashboardData && <StatsCards stats={dashboardData.stats} />}
            <PerformanceOverview data={dashboardData?.performance} />
          </>
        );
      case 'purchases':
        return <PurchasesTab data={dashboardData?.purchases} />;
      case 'sales':
        return <SalesTab data={dashboardData?.sales} />;
      case 'inventory':
        return <InventoryTab data={dashboardData?.inventory} />;
      case 'salaries':
        return <SalaryManagementTab data={dashboardData?.salaries} />;
      case 'car-expenses':
        return <CarExpensesTab data={dashboardData?.carExpenses} />;
      case 'other-expenses':
        return <OtherExpensesTab data={dashboardData?.otherExpenses} />;
      case 'users':
        return <UserManagementTab data={dashboardData?.users} />;
      default:
        return (
          <>
            {dashboardData && <StatsCards stats={dashboardData.stats} />}
            <PerformanceOverview data={dashboardData?.performance} />
          </>
        );
    }
  };

  if (user?.role !== 'ceo') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <i className="bi bi-shield-lock me-2"></i>
          Access denied. CEO privileges required to view this dashboard.
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: 'bi-graph-up', label: 'Overview' },
    { id: 'purchases', icon: 'bi-cart-plus', label: 'Purchases' },
    { id: 'sales', icon: 'bi-currency-dollar', label: 'Sales' },
    { id: 'inventory', icon: 'bi-boxes', label: 'Inventory' },
    { id: 'salaries', icon: 'bi-cash', label: 'Salaries' },
    { id: 'car-expenses', icon: 'bi-car-front', label: 'Car Expenses' },
    { id: 'other-expenses', icon: 'bi-receipt', label: 'Other Expenses' },
    { id: 'users', icon: 'bi-people', label: 'Users' }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                CEO Dashboard
              </h2>
              <small className="text-muted">
                Welcome back, <strong>{user?.name}</strong>
              </small>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary position-relative"
                onClick={() => setActiveTab('notifications')}
              >
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={() => setShowClearModal(true)}
                disabled={loading}
              >
                <i className="bi bi-trash me-2"></i>Clear Data
              </button>
            </div>
          </div>

          <CeoMessagePanel 
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onClearAll={clearAllNotifications}
          />

          <div className="card shadow-sm">
            <div className="card-header bg-light p-0">
              <ul className="nav nav-tabs">
                {tabs.map(tab => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={loading}
                    >
                      <i className={`bi ${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card-body">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <ClearDataModal 
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
        onSuccess={() => {
          // Reset and reload data
          setDashboardData(null);
          setLoading(true);
          setError(null);
          fetchDashboardData()
            .then(data => {
              setDashboardData(data);
              setNotifications(data.notifications || []);
              setUnreadCount(data.unreadNotifications || 0);
            })
            .catch(err => {
              console.error('Reload error:', err);
              setError('Failed to reload data after clearing');
            })
            .finally(() => setLoading(false));
        }}
      />
    </div>
  );
};

export default Dashboard;