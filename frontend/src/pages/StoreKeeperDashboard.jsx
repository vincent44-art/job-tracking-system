
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';

const StoreKeeperDashboard = () => {
  const { 
    addInventoryItem, 
    addStockMovement, 
    addGradient,
    getCurrentStock,
    clearInventoryData,
    formatCurrency
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
      quantity: inventoryForm.quantity // Keep as string
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
      quantity: stockForm.quantity // Keep as string
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
      quantity: gradientForm.quantity // Keep as string
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
              </ul>

              {/* Add Inventory Form */}
              {activeTab === 'inventory' && (
                <form onSubmit={handleInventorySubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fruit Type</label>
                      <select
                        className="form-select"
                        value={inventoryForm.fruitType}
                        onChange={(e) => setInventoryForm({...inventoryForm, fruitType: e.target.value})}
                        required
                      >
                        <option value="">Select Fruit</option>
                        <option value="Orange">Orange</option>
                        <option value="Apple">Apple</option>
                        <option value="Banana">Banana</option>
                        <option value="Mango">Mango</option>
                        <option value="Pineapple">Pineapple</option>
                        <option value="Watermelon">Watermelon</option>
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="text"
                        className="form-control"
                        value={inventoryForm.quantity}
                        onChange={(e) => setInventoryForm({...inventoryForm, quantity: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Unit</label>
                      <select
                        className="form-select"
                        value={inventoryForm.unit}
                        onChange={(e) => setInventoryForm({...inventoryForm, unit: e.target.value})}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={inventoryForm.location}
                        onChange={(e) => setInventoryForm({...inventoryForm, location: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Supplier Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={inventoryForm.supplierName}
                        onChange={(e) => setInventoryForm({...inventoryForm, supplierName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={inventoryForm.expiryDate}
                        onChange={(e) => setInventoryForm({...inventoryForm, expiryDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={inventoryForm.date}
                        onChange={(e) => setInventoryForm({...inventoryForm, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add to Inventory
                  </button>
                </form>
              )}

              {/* Stock Movement Form */}
              {activeTab === 'stock' && (
                <form onSubmit={handleStockSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fruit Type</label>
                      <select
                        className="form-select"
                        value={stockForm.fruitType}
                        onChange={(e) => setStockForm({...stockForm, fruitType: e.target.value})}
                        required
                      >
                        <option value="">Select Fruit</option>
                        <option value="Orange">Orange</option>
                        <option value="Apple">Apple</option>
                        <option value="Banana">Banana</option>
                        <option value="Mango">Mango</option>
                        <option value="Pineapple">Pineapple</option>
                        <option value="Watermelon">Watermelon</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Movement Type</label>
                      <select
                        className="form-select"
                        value={stockForm.movementType}
                        onChange={(e) => setStockForm({...stockForm, movementType: e.target.value})}
                      >
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="text"
                        className="form-control"
                        value={stockForm.quantity}
                        onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Unit</label>
                      <select
                        className="form-select"
                        value={stockForm.unit}
                        onChange={(e) => setStockForm({...stockForm, unit: e.target.value})}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={stockForm.date}
                        onChange={(e) => setStockForm({...stockForm, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Reason</label>
                      <input
                        type="text"
                        className="form-control"
                        value={stockForm.reason}
                        onChange={(e) => setStockForm({...stockForm, reason: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={stockForm.location}
                        onChange={(e) => setStockForm({...stockForm, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Record Movement
                  </button>
                </form>
              )}

              {/* Gradient Form */}
              {activeTab === 'gradient' && (
                <form onSubmit={handleGradientSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gradient Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={gradientForm.gradientName}
                        onChange={(e) => setGradientForm({...gradientForm, gradientName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fruit Type</label>
                      <select
                        className="form-select"
                        value={gradientForm.fruitType}
                        onChange={(e) => setGradientForm({...gradientForm, fruitType: e.target.value})}
                        required
                      >
                        <option value="">Select Fruit</option>
                        <option value="Orange">Orange</option>
                        <option value="Apple">Apple</option>
                        <option value="Banana">Banana</option>
                        <option value="Mango">Mango</option>
                        <option value="Pineapple">Pineapple</option>
                        <option value="Watermelon">Watermelon</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="text"
                        className="form-control"
                        value={gradientForm.quantity}
                        onChange={(e) => setGradientForm({...gradientForm, quantity: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Unit</label>
                      <select
                        className="form-select"
                        value={gradientForm.unit}
                        onChange={(e) => setGradientForm({...gradientForm, unit: e.target.value})}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Application Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={gradientForm.applicationDate}
                        onChange={(e) => setGradientForm({...gradientForm, applicationDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Purpose</label>
                      <input
                        type="text"
                        className="form-control"
                        value={gradientForm.purpose}
                        onChange={(e) => setGradientForm({...gradientForm, purpose: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        value={gradientForm.notes}
                        onChange={(e) => setGradientForm({...gradientForm, notes: e.target.value})}
                        rows="2"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-info">
                    <i className="bi bi-droplet me-2"></i>
                    Apply Gradient
                  </button>
                </form>
              )}

              {/* Current Stock Display */}
              {activeTab === 'current' && (
                <div className="card">
                  <div className="card-header">
                    <h6>Current Stock Summary</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStock.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <i className="bi bi-apple me-2 text-success"></i>
                                {item.fruitType}
                              </td>
                              <td>
                                <span className="badge bg-primary">
                                  {item.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {currentStock.length === 0 && (
                        <p className="text-center text-muted">No stock available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreKeeperDashboard;
