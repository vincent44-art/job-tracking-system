import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// CeoMessagesDisplay removed
import InventoryForm from '../components/storekeeper/InventoryForm';
import StockMovementForm from '../components/storekeeper/StockMovementForm';
import GradientForm from '../components/storekeeper/GradientForm';
import CurrentStockTable from '../components/storekeeper/CurrentStockTable';
import AddedItemsTable from '../components/storekeeper/AddedItemsTable';

// ✅ Base URL
const BASE_URL = 'http://127.0.0.1:5000/api';

// ✅ Inline API functions
const fetchInventory = async () => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return await res.json();
};

const addInventoryItem = async (item) => {
  const token = localStorage.getItem('access_token');
  // Ensure correct payload for inventory POST
  const payload = {
    name: item.ItemType,
    quantity: item.quantity,
    fruit_type: item.fruitType,
    unit: item.unit,
    location: item.location,
    expiry_date: item.expiryDate
  };
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add inventory item');
  return await res.json();
};

const addStockMovement = async (movement) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}/stock-movements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(movement),
  });
  if (!res.ok) throw new Error('Failed to add stock movement');
  return await res.json();
};

const addGradient = async (gradient) => {
  const token = localStorage.getItem('access_token');
  // Map frontend fields to backend expected fields
  const payload = {
    application_date: gradient.applicationDate,
    name: gradient.gradientName,
    description: gradient.description,
    fruit_type: gradient.fruitType,
    gradient_type: gradient.gradientType,
    notes: gradient.notes,
    quantity: gradient.quantity,
    unit: gradient.unit,
    purpose: gradient.purpose
  };
  const res = await fetch(`${BASE_URL}/gradients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inventoryForm, setInventoryForm] = useState({
    ItemType: '',
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
    gradientType: '',
    fruitType: '',
    quantity: '',
    unit: 'kg',
    purpose: '',
    applicationDate: new Date().toISOString().split('T')[0],
    notes: '',
    description: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, stockRes] = await Promise.all([
          fetchInventory(),
          getCurrentStock()
        ]);
        // Filter out undefined/null/invalid items to prevent runtime errors in child components
        const safeInventory = Array.isArray(inventoryRes.data)
          ? inventoryRes.data.filter(item => item && typeof item === 'object' && (item.name || item.fruit_type))
          : [];
        setInventory(safeInventory);
        const safeStock = Array.isArray(stockRes.data)
          ? stockRes.data.filter(item => item && typeof item === 'object')
          : [];
        setCurrentStock(safeStock);
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
      // Defensive: filter out undefined/null/invalid items after add
      const newItem = response && response.data ? response.data : response;
      setInventory(prev => {
        const arr = Array.isArray(prev) ? [...prev, newItem] : [newItem];
        return arr.filter(item => item && typeof item === 'object' && (item.name || item.fruit_type));
      });
      setInventoryForm({
        ItemType: '',
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
      // Find inventory item by fruitType
      const inventoryItem = inventory.find(item => item.fruit_type === stockForm.fruitType || item.name === stockForm.fruitType);
      if (!inventoryItem) {
        setError('No inventory item found for selected fruit type.');
        setLoading(false);
        return;
      }
      // Prepare payload for backend
      const payload = {
        inventory_id: inventoryItem.id,
        movement_type: stockForm.movementType,
        quantity: stockForm.quantity,
        unit: stockForm.unit,
        remaining_stock: '', // You can calculate or leave blank
        date: stockForm.date,
        notes: stockForm.reason
      };
      await addStockMovement(payload);
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
      await addGradient(gradientForm);
      setGradientForm({
        gradientName: '',
        gradientType: '',
        fruitType: '',
        quantity: '',
        unit: 'kg',
        purpose: '',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: '',
        description: ''
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
    <div className="fruit-tracking-bg">
      <div className="container py-4">
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-danger" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        </div>
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
                {/* CeoMessagesDisplay removed */}

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
                    inventory={Array.isArray(inventory) ? inventory.filter(item => item && typeof item === 'object' && (item.name || item.fruit_type)) : []}
                    onClearAll={handleClearAddedItems}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreKeeperDashboard;
