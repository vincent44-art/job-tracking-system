
import React from 'react';
import { useData } from '../contexts/DataContext';

const ClearDataModal = ({ show, onClose }) => {
  const { 
    clearAllData, 
    clearPurchasesData, 
    clearSalesData, 
    clearCarExpensesData, 
    clearOtherExpensesData, 
    clearSalariesData,
    clearInventoryData
  } = useData();

  if (!show) return null;

  const handleClearData = (type) => {
    switch (type) {
      case 'all':
        clearAllData();
        break;
      case 'purchases':
        clearPurchasesData();
        break;
      case 'sales':
        clearSalesData();
        break;
      case 'inventory':
        clearInventoryData();
        break;
      case 'car-expenses':
        clearCarExpensesData();
        break;
      case 'other-expenses':
        clearOtherExpensesData();
        break;
      case 'salaries':
        clearSalariesData();
        break;
    }
    onClose();
  };

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-trash me-2"></i>Clear Data
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>Choose what data you want to clear:</p>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={() => handleClearData('purchases')}
              >
                <i className="bi bi-cart-plus me-2"></i>Clear Purchases Data
              </button>
              <button 
                className="btn btn-outline-success"
                onClick={() => handleClearData('sales')}
              >
                <i className="bi bi-currency-dollar me-2"></i>Clear Sales Data
              </button>
              <button 
                className="btn btn-outline-info"
                onClick={() => handleClearData('inventory')}
              >
                <i className="bi bi-boxes me-2"></i>Clear Inventory Data
              </button>
              <button 
                className="btn btn-outline-warning"
                onClick={() => handleClearData('car-expenses')}
              >
                <i className="bi bi-car-front me-2"></i>Clear Car Expenses
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => handleClearData('other-expenses')}
              >
                <i className="bi bi-receipt me-2"></i>Clear Other Expenses
              </button>
              <button 
                className="btn btn-outline-dark"
                onClick={() => handleClearData('salaries')}
              >
                <i className="bi bi-people me-2"></i>Clear Salaries Data
              </button>
              <hr />
              <button 
                className="btn btn-danger"
                onClick={() => handleClearData('all')}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>Clear All Data
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearDataModal;
