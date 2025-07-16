import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import InventoryForm from '../components/storekeeper/InventoryForm';
import StockMovementForm from '../components/storekeeper/StockMovementForm';
import GradientForm from '../components/storekeeper/GradientForm';
import CurrentStockTable from '../components/storekeeper/CurrentStockTable';
import AddedItemsTable from '../components/storekeeper/AddedItemsTable';

// ✅ Base URL
const BASE_URL = 'http://127.0.0.1:5000/api';

// ✅ Inline API functions
const fetchInventory = async () => {
  const res = await fetch(`${BASE_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return await res.json();
};

const addInventoryItem = async (item) => {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add inventory item');
  return await res.json();
};

const addStockMovement = async (movement) => {
  const res = await fetch(`${BASE_URL}/stock-movement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movement),
  });
  if (!res.ok) throw new Error('Failed to add stock movement');
  return await res.json();
};

const addGradient = async (gradient) => {
  const res = await fetch(`${BASE_URL}/gradient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gradient),
  });
  if (!res.ok) throw new Error('Failed to add gradient');
  return await res.json();
};

const getCurrentStock = async () => {
  const res = await fetch(`${BASE_URL}/current-stock`);
  if (!res.ok) throw new Error('Failed to get current stock');
  return await res.json();
};

const clearInventoryData = async () => {
  const res = await fetch(`${BASE_URL}/inventory/clear`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear inventory');
  return await res.json();
};

// ✅ Main Component
const StoreKeeperDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, stockRes] = await Promise.all([
          fetchInventory(),
          getCurrentStock()
        ]);
        setInventory(inventoryRes.data);
        setCurrentStock(stockRes.data);
      } catch (err) {
        setError('Failed to load inventory data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await addInventoryItem({
        ...inventoryForm,
        storeKeeperEmail: user.email,
        storeKeeperName: user.name,
        quantity: inventoryForm.quantity
      });
      setInventory(prev => [...prev, response.data]);
      setInventoryForm({
        fruitType: '',
        quantity: '',
        unit: 'kg',
        location: '',
        expiryDate: '',
        supplierName: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Failed to add inventory item.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addStockMovement({
        ...stockForm,
        storeKeeperEmail: user.email,
        storeKeeperName: user.name,
        quantity: stockForm.quantity
      });
      const stockRes = await getCurrentStock();
      setCurrentStock(stockRes.data);
      setStockForm({
        fruitType: '',
        movementType: 'in',
        quantity: '',
        unit: 'kg',
        reason: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Failed to record stock movement.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradientSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addGradient({
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
    } catch (err) {
      setError('Failed to add gradient.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInventory = async () => {
    if (window.confirm('Are you sure you want to clear all inventory data?')) {
      try {
        setLoading(true);
        await clearInventoryData();
        setInventory([]);
        setCurrentStock([]);
      } catch (err) {
        setError('Failed to clear inventory.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearAddedItems = async () => {
    if (window.confirm('Are you sure you want to clear added items?')) {
      try {
        setLoading(true);
        await clearInventoryData();
        setInventory([]);
      } catch (err) {
        setError('Failed to clear added items.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0"><i className="bi bi-box me-2"></i>Store Keeper Dashboard</h4>
              <button className="btn btn-outline-light btn-sm" onClick={handleClearInventory} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" role="status"></span> : <i className="bi bi-trash me-1"></i>}
                Clear All Data
              </button>
            </div>

            <div className="card-body">
              <CeoMessagesDisplay />

              <ul className="nav nav-tabs mb-4">
                <li className="nav-item"><button className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} disabled={loading}><i className="bi bi-plus-circle me-2"></i>Add Inventory</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')} disabled={loading}><i className="bi bi-arrow-left-right me-2"></i>Stock Movement</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'gradient' ? 'active' : ''}`} onClick={() => setActiveTab('gradient')} disabled={loading}><i className="bi bi-droplet me-2"></i>Add Gradient</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')} disabled={loading}><i className="bi bi-boxes me-2"></i>Current Stock</button></li>
                <li className="nav-item"><button className={`nav-link ${activeTab === 'added' ? 'active' : ''}`} onClick={() => setActiveTab('added')} disabled={loading}><i className="bi bi-list me-2"></i>All Added Items</button></li>
              </ul>

              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {!loading && activeTab === 'inventory' && (
                <InventoryForm
                  form={inventoryForm}
                  onChange={setInventoryForm}
                  onSubmit={handleInventorySubmit}
                  loading={loading}
                />
              )}

              {!loading && activeTab === 'stock' && (
                <StockMovementForm
                  form={stockForm}
                  onChange={setStockForm}
                  onSubmit={handleStockSubmit}
                  loading={loading}
                />
              )}

              {!loading && activeTab === 'gradient' && (
                <GradientForm
                  form={gradientForm}
                  onChange={setGradientForm}
                  onSubmit={handleGradientSubmit}
                  loading={loading}
                />
              )}

              {!loading && activeTab === 'current' && (
                <CurrentStockTable
                  currentStock={currentStock}
                  onClearAll={handleClearInventory}
                />
              )}

              {!loading && activeTab === 'added' && (
                <AddedItemsTable
                  inventory={inventory}
                  onClearAll={handleClearAddedItems}
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
