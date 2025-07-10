
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import InventoryForm from '../components/storekeeper/InventoryForm';
import StockMovementForm from '../components/storekeeper/StockMovementForm';
import GradientForm from '../components/storekeeper/GradientForm';
import CurrentStockTable from '../components/storekeeper/CurrentStockTable';
import AddedItemsTable from '../components/storekeeper/AddedItemsTable';

const StoreKeeperDashboard = () => {
  const { 
    addInventoryItem, 
    addStockMovement, 
    addGradient,
    getCurrentStock,
    inventory,
    clearInventoryData
  } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryForm, setInventoryForm] = useState({
    fruitType: '',
    quantity: '',
    unit: 'kg',
    location: '',
    expiryDate: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [stockForm, setStockForm] = useState({
    fruitType: '',
    movementType: 'in',
    quantity: '',
    unit: 'kg',
    reason: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [gradientForm, setGradientForm] = useState({
    gradientName: '',
    fruitType: '',
    quantity: '',
    unit: 'kg',
    purpose: '',
    applicationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleInventorySubmit = (e) => {
    e.preventDefault();
    addInventoryItem({
      ...inventoryForm,
      storeKeeperEmail: user.email,
      storeKeeperName: user.name,
      quantity: inventoryForm.quantity
    });
    
    setInventoryForm({
      fruitType: '',
      quantity: '',
      unit: 'kg',
      location: '',
      expiryDate: '',
      supplierName: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    addStockMovement({
      ...stockForm,
      storeKeeperEmail: user.email,
      storeKeeperName: user.name,
      quantity: stockForm.quantity
    });
    
    setStockForm({
      fruitType: '',
      movementType: 'in',
      quantity: '',
      unit: 'kg',
      reason: '',
      location: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleGradientSubmit = (e) => {
    e.preventDefault();
    addGradient({
      ...gradientForm,
      storeKeeperEmail: user.email,
      storeKeeperName: user.name,
      quantity: gradientForm.quantity
    });
    
    setGradientForm({
      gradientName: '',
      fruitType: '',
      quantity: '',
      unit: 'kg',
      purpose: '',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const currentStock = getCurrentStock();

  const clearAllInventory = () => {
    if (window.confirm('Are you sure you want to clear all inventory data?')) {
      clearInventoryData();
    }
  };

  const clearAllAddedItems = () => {
    if (window.confirm('Are you sure you want to clear all added items?')) {
      localStorage.removeItem('inventory');
      window.location.reload();
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-box me-2"></i>
                Store Keeper Dashboard
              </h4>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={clearInventoryData}
              >
                <i className="bi bi-trash me-1"></i>Clear All Data
              </button>
            </div>
            <div className="card-body">
              <CeoMessagesDisplay />
              
              {/* Navigation Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Inventory
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                  >
                    <i className="bi bi-arrow-left-right me-2"></i>Stock Movement
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'gradient' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gradient')}
                  >
                    <i className="bi bi-droplet me-2"></i>Add Gradient
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                  >
                    <i className="bi bi-boxes me-2"></i>Current Stock
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'added' ? 'active' : ''}`}
                    onClick={() => setActiveTab('added')}
                  >
                    <i className="bi bi-list me-2"></i>All Added Items
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              {activeTab === 'inventory' && (
                <InventoryForm 
                  form={inventoryForm}
                  onChange={setInventoryForm}
                  onSubmit={handleInventorySubmit}
                />
              )}

              {activeTab === 'stock' && (
                <StockMovementForm 
                  form={stockForm}
                  onChange={setStockForm}
                  onSubmit={handleStockSubmit}
                />
              )}

              {activeTab === 'gradient' && (
                <GradientForm 
                  form={gradientForm}
                  onChange={setGradientForm}
                  onSubmit={handleGradientSubmit}
                />
              )}

              {activeTab === 'current' && (
                <CurrentStockTable 
                  currentStock={currentStock}
                  onClearAll={clearAllInventory}
                />
              )}

              {activeTab === 'added' && (
                <AddedItemsTable 
                  inventory={inventory}
                  onClearAll={clearAllAddedItems}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreKeeperDashboard;
