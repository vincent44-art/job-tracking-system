
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
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
  const { clearAllData } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [showClearModal, setShowClearModal] = useState(false);

  if (user?.role !== 'ceo') {
    return <div className="container mt-4"><div className="alert alert-danger">Access denied. CEO role required.</div></div>;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-gradient">
              <i className="bi bi-speedometer2 me-2"></i>
              CEO Dashboard
            </h2>
            <div>
              <button 
                className="btn btn-outline-danger btn-sm me-2"
                onClick={() => setShowClearModal(true)}
              >
                <i className="bi bi-trash me-2"></i>Clear Data
              </button>
              <small className="text-muted">Welcome, {user?.name}</small>
            </div>
          </div>

          <CeoMessagePanel />

          <div className="card fade-in">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="bi bi-graph-up me-2"></i>Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchases')}
                  >
                    <i className="bi bi-cart-plus me-2"></i>Purchases
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                  >
                    <i className="bi bi-currency-dollar me-2"></i>Sales
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                  >
                    <i className="bi bi-boxes me-2"></i>Inventory
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'salaries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('salaries')}
                  >
                    <i className="bi bi-cash me-2"></i>Salaries
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'car-expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('car-expenses')}
                  >
                    <i className="bi bi-car-front me-2"></i>Car Expenses
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'other-expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('other-expenses')}
                  >
                    <i className="bi bi-receipt me-2"></i>Other Expenses
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <i className="bi bi-people me-2"></i>Users
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="card-body">
              {activeTab === 'overview' && (
                <div>
                  <StatsCards />
                  <PerformanceOverview />
                </div>
              )}
              {activeTab === 'purchases' && <PurchasesTab />}
              {activeTab === 'sales' && <SalesTab />}
              {activeTab === 'inventory' && <InventoryTab />}
              {activeTab === 'salaries' && <SalaryManagementTab />}
              {activeTab === 'car-expenses' && <CarExpensesTab />}
              {activeTab === 'other-expenses' && <OtherExpensesTab />}
              {activeTab === 'users' && <UserManagementTab />}
            </div>
          </div>
        </div>
      </div>

      <ClearDataModal 
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
      />
    </div>
  );
};

export default Dashboard;
