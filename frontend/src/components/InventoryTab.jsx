import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
// import { 
//   fetchInventory,
//   fetchStockMovements,
//   fetchGradients,
//   clearInventoryAPI,
//   clearStockMovementsAPI,
//   clearGradientsAPI
// } from 'http://127.0.0.1:5000/api';
>>>>>>> f019a39 (Fix API path and token setup)
import { 
  fetchInventory,
  fetchStockMovements,
  fetchGradients,
  clearInventoryAPI,
  clearStockMovementsAPI,
  clearGradientsAPI
<<<<<<< HEAD
} from 'http://127.0.0.1:5000/api';
=======
} from './apiHelpers';  // adjust path as needed
>>>>>>> f019a39 (Fix API path and token setup)

const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [gradients, setGradients] = useState([]);
  const [loading, setLoading] = useState({
    inventory: true,
    movements: true,
    gradients: true
  });
  const [error, setError] = useState(null);

  // Fetch all inventory data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [inventoryRes, movementsRes, gradientsRes] = await Promise.all([
          fetchInventory(),
          fetchStockMovements(),
          fetchGradients()
        ]);
        
        setInventory(inventoryRes.data);
        setStockMovements(movementsRes.data);
        setGradients(gradientsRes.data);
      } catch (err) {
        console.error('Failed to load inventory data:', err);
        setError('Failed to load inventory data. Please try again.');
      } finally {
        setLoading({
          inventory: false,
          movements: false,
          gradients: false
        });
      }
    };
    loadData();
  }, []);

  // Calculate current stock
  const getCurrentStock = () => {
    const stockMap = {};
    stockMovements.forEach(movement => {
      if (!stockMap[movement.fruitType]) {
        stockMap[movement.fruitType] = 0;
      }
      stockMap[movement.fruitType] += 
        movement.movementType === 'in' ? movement.quantity : -movement.quantity;
    });
    return Object.entries(stockMap)
      .map(([fruitType, quantity]) => ({ fruitType, quantity }))
      .filter(item => item.quantity > 0);
  };

  const currentStock = getCurrentStock();
  const totalStockMovements = stockMovements.length;
  const totalGradients = gradients.length;

  const handleClearData = async (type) => {
    if (!window.confirm(`Are you sure you want to clear all ${type}?`)) return;

    try {
      switch (type) {
        case 'inventory':
          await clearInventoryAPI();
          setInventory([]);
          break;
        case 'movements':
          await clearStockMovementsAPI();
          setStockMovements([]);
          break;
        case 'gradients':
          await clearGradientsAPI();
          setGradients([]);
          break;
      }
    } catch (err) {
      console.error(`Failed to clear ${type}:`, err);
      setError(`Failed to clear ${type}. Please try again.`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button 
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-boxes me-2"></i>Current Stock Items</h5>
              <h3>
                {loading.inventory ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  currentStock.length
                )}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-arrow-left-right me-2"></i>Stock Movements</h5>
              <h3>
                {loading.movements ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  totalStockMovements
                )}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-droplet me-2"></i>Gradients Applied</h5>
              <h3>
                {loading.gradients ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  totalGradients
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
              <h5><i className="bi bi-boxes me-2"></i>Current Inventory</h5>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => handleClearData('inventory')}
                disabled={loading.inventory || inventory.length === 0}
              >
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive max-height-200">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.inventory ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4">
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Loading inventory...
                        </td>
                      </tr>
                    ) : currentStock.length > 0 ? (
                      currentStock.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <span className="fw-bold text-success">
                              <i className="bi bi-apple me-1"></i>
                              {item.fruitType}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted">No stock available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
              <h5><i className="bi bi-arrow-left-right me-2"></i>Recent Stock Movements</h5>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => handleClearData('movements')}
                disabled={loading.movements || stockMovements.length === 0}
              >
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive max-height-200">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Fruit Type</th>
                      <th>Movement</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.movements ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Loading movements...
                        </td>
                      </tr>
                    ) : stockMovements.length > 0 ? (
                      [...stockMovements]
                        .slice(-10)
                        .reverse()
                        .map((movement) => (
                          <tr key={movement.id}>
                            <td>
                              <i className="bi bi-apple me-1 text-success"></i>
                              {movement.fruitType}
                            </td>
                            <td>
                              <span className={`badge ${movement.movementType === 'in' ? 'bg-success' : 'bg-danger'}`}>
                                {movement.movementType.toUpperCase()}
                              </span>
                            </td>
                            <td>{movement.quantity}</td>
                            <td>{movement.unit}</td>
                            <td>{new Date(movement.date).toLocaleDateString()}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">No stock movements recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
              <h5><i className="bi bi-droplet me-2"></i>Recent Gradients Applied</h5>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => handleClearData('gradients')}
                disabled={loading.gradients || gradients.length === 0}
              >
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive max-height-200">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Date</th>
                      <th>Gradient</th>
                      <th>Fruit Type</th>
                      <th>Quantity</th>
                      <th>Purpose</th>
                      <th>Store Keeper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.gradients ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Loading gradients...
                        </td>
                      </tr>
                    ) : gradients.length > 0 ? (
                      [...gradients]
                        .slice(-10)
                        .reverse()
                        .map((gradient) => (
                          <tr key={gradient.id}>
                            <td>{new Date(gradient.applicationDate).toLocaleDateString()}</td>
                            <td>
                              <span className="badge bg-info">
                                {gradient.gradientName}
                              </span>
                            </td>
                            <td>
                              <i className="bi bi-apple me-1 text-success"></i>
                              {gradient.fruitType}
                            </td>
                            <td>{gradient.quantity} {gradient.unit}</td>
                            <td>{gradient.purpose}</td>
                            <td>{gradient.storeKeeperName}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No gradients applied</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;