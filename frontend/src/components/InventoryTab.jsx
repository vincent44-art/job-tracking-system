
import React from 'react';
import { useData } from '../contexts/DataContext';

const InventoryTab = () => {
  const { 
    inventory, 
    stockMovements, 
    gradients, 
    getCurrentStock, 
    clearInventoryData,
    formatCurrency 
  } = useData();

  const currentStock = getCurrentStock();
  const totalStockMovements = stockMovements.length;
  const totalGradients = gradients.length;

  const clearStockMovements = () => {
    if (window.confirm('Are you sure you want to clear all stock movements?')) {
      localStorage.removeItem('stockMovements');
      window.location.reload();
    }
  };

  const clearGradients = () => {
    if (window.confirm('Are you sure you want to clear all gradients?')) {
      localStorage.removeItem('gradients');
      window.location.reload();
    }
  };

  return (
    <div className="tab-content">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-boxes me-2"></i>Current Stock Items</h5>
              <h3>{currentStock.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-arrow-left-right me-2"></i>Stock Movements</h5>
              <h3>{totalStockMovements}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-droplet me-2"></i>Gradients Applied</h5>
              <h3>{totalGradients}</h3>
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
                onClick={clearInventoryData}
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
                    {currentStock.map((item, index) => (
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
                    ))}
                  </tbody>
                </table>
                {currentStock.length === 0 && (
                  <p className="text-center text-muted">No stock available</p>
                )}
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
                onClick={clearStockMovements}
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
                    {stockMovements.slice(-10).reverse().map((movement) => (
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
                    ))}
                  </tbody>
                </table>
                {stockMovements.length === 0 && (
                  <p className="text-center text-muted">No stock movements recorded</p>
                )}
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
                onClick={clearGradients}
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
                    {gradients.slice(-10).reverse().map((gradient) => (
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
                    ))}
                  </tbody>
                </table>
                {gradients.length === 0 && (
                  <p className="text-center text-muted">No gradients applied</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
