
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, Trash2 } from 'lucide-react';

const PurchasesTab = () => {
  const { purchases, deletePurchase } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.fruitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">Purchase Management</h2>
      
      <div className="card card-custom mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative flex-grow-1">
              <Search className="position-absolute" style={{left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6c757d'}} />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-custom">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Purchaser</th>
                  <th>Employee</th>
                  <th>Fruit Type</th>
                  <th>Quantity</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.date).toLocaleDateString()}</td>
                    <td>{purchase.purchaserEmail}</td>
                    <td>{purchase.employeeName}</td>
                    <td>{purchase.fruitType}</td>
                    <td>{purchase.quantity} {purchase.unit}</td>
                    <td>{purchase.buyerName}</td>
                    <td>{formatCurrency(purchase.amount)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(purchase.id)}
                        title="Delete purchase"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasesTab;
