import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import StatsCards from '../components/StatsCards';
import PurchasesTab from '../components/PurchasesTab';
import SalesTab from '../components/SalesTab';
import CarExpensesTab from '../components/CarExpensesTab';
import OtherExpensesTab from '../components/OtherExpensesTab';
import UserManagementTab from '../components/UserManagementTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { clearAllData } = useData();

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'bi-speedometer2' },
    { id: 'purchases', label: 'Purchases', icon: 'bi-cart-plus' },
    { id: 'sales', label: 'Sales', icon: 'bi-graph-up' },
    { id: 'car-expenses', label: 'Car Expenses', icon: 'bi-car-front' },
    { id: 'other-expenses', label: 'Other Expenses', icon: 'bi-receipt' },
    { id: 'users', label: 'User Management', icon: 'bi-people' },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="sidebar-custom">
            <h5 className="text-gradient mb-3">CEO Dashboard</h5>
            <div className="nav nav-pills flex-column">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-link text-start ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <button 
                className="btn btn-outline-danger btn-sm w-100"
                onClick={handleClearData}
              >
                <i className="bi bi-trash me-2"></i>
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-9 col-md-8">
          <div className="fade-in">
            {activeTab === 'overview' && (
              <div>
                <h2 className="mb-4">Business Overview</h2>
                <StatsCards />
              </div>
            )}

            {activeTab === 'purchases' && <PurchasesTab />}
            {activeTab === 'sales' && <SalesTab />}
            {activeTab === 'car-expenses' && <CarExpensesTab />}
            {activeTab === 'other-expenses' && <OtherExpensesTab />}
            {activeTab === 'users' && <UserManagementTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
