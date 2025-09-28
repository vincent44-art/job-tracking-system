import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../api/dashboard';
import StatsCards from '../components/StatsCards';
import PurchasesTab from '../components/PurchasesTab';
import SalesTab from '../components/SalesTab';
import CarExpensesTab from '../components/CarExpensesTab';
import OtherExpensesTab from '../components/OtherExpensesTab';
import UserManagementTab from '../components/UserManagementTab';
import SalaryManagementTab from '../components/SalaryManagementTab';
import StockTrackerTab from '../components/StockTrackerTab';
import ReportsTab from '../components/ReportsTab';
import PerformanceOverview from '../components/PerformanceOverview';
import AIAssistanceTab from '../components/AIAssistanceTab';
import ClearDataModal from '../components/ClearDataModal';
import SpoligeTab from '../components/SpoligeTab';
import SellersTab from '../components/SellersTab';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const { data, error, loading, refetch } = useDashboardData(); // Added refetch for refresh
  const [activeTab, setActiveTab] = useState('purchases');
  const [showClearModal, setShowClearModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch dashboard data
  // useEffect(() => {
  //   if (user?.role !== 'ceo') return;
  //   if (data) {
  //     setNotifications(data.notifications || []);
  //     setUnreadCount(data.unreadNotifications || 0);
  //   }
  // }, [data, user?.role]);
  useEffect(() => {
    if (user?.role === 'ceo' && data) {
      setUnreadCount(data.unreadNotifications || 0);
    }
  }, [data, user?.role]);
// Ensure no setNotifications reference remains


  
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
            onClick={refetch} // Reload using hook's refetch
          >
            Retry
          </button>
        </div>
      );
    }

  switch (activeTab) {
      case 'spolige':
        return <SpoligeTab data={data?.spolige} />;
      // Removed Overview tab content as requested
      // case 'overview':
      //   console.log('Dashboard overview data:', data);
      //   return (
      //     <>
      //       {data && <StatsCards stats={data.stats} />}
      //       <PerformanceOverview data={data} />
      //     </>
      //   );
      case 'purchases':
        return <PurchasesTab data={data?.purchases} />;
      case 'sales':
        return <SalesTab data={data?.sales} />;
      // Removed Inventory tab content as requested
      // case 'inventory':
      //   return <InventoryTab data={data?.inventory} />;
      case 'stock-tracker':
        return <StockTrackerTab />;
      case 'reports':
        return <ReportsTab />;
      case 'salaries':
        return <SalaryManagementTab data={data?.salaries} />;
      case 'car-expenses':
        return <CarExpensesTab data={data?.carExpenses} />;
      case 'other-expenses':
        return <OtherExpensesTab data={data?.otherExpenses} token={token} />;
      case 'users':
        return <UserManagementTab data={data?.users} />;
      case 'ai-assistance':
        return <AIAssistanceTab />;
      case 'sellers':
        return <SellersTab />;
      default:
        return (
          <>
            {data && <StatsCards stats={data.stats} />}
            <PerformanceOverview data={data} />
          </>
        );
    }
  };


  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please log in to view the dashboard.
        </div>
      </div>
    );
  }

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
  { id: 'spolige', icon: 'bi-table', label: 'Spolige' },
    // Removed Overview tab as requested
    // { id: 'overview', icon: 'bi-graph-up', label: 'Overview' },
    { id: 'purchases', icon: 'bi-cart-plus', label: 'Purchases' },
    { id: 'sales', icon: 'bi-currency-dollar', label: 'Sales' },
    // Removed Inventory tab as requested
    // { id: 'inventory', icon: 'bi-boxes', label: 'Inventory' },
    { id: 'stock-tracker', icon: 'bi-bar-chart-line', label: 'Stock Tracker' },
    { id: 'reports', icon: 'bi-file-earmark-text', label: 'Reports' },
    { id: 'salaries', icon: 'bi-cash', label: 'Salaries' },
    { id: 'car-expenses', icon: 'bi-car-front', label: 'Car Expenses' },
    { id: 'other-expenses', icon: 'bi-receipt', label: 'Other Expenses' },
    { id: 'users', icon: 'bi-people', label: 'Users' },
    { id: 'sellers', icon: 'bi-shop', label: 'Sellers' },
    { id: 'ai-assistance', icon: 'bi-robot', label: 'AI Assistance' }
  ];

  return (
    <div className="fruit-tracking-bg">
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
                <button 
                  className="btn btn-outline-secondary"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>

            {/* CeoMessagePanel removed */}

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
          onSuccess={() => refetch()} // Just refetch after clearing
        />
      </div>
    </div>
  );
};

export default Dashboard;
