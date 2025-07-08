
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';

const PurchaserDashboard = () => {
  const { addPurchase, purchases, clearPurchasesData, formatCurrency } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    employeeName: '',
    fruitType: '',
    quantity: '',
    unit: 'kg',
    buyerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      ...formData,
      purchaserEmail: user.email,
      quantity: formData.quantity, // Keep as string
      amount: parseFloat(formData.amount)
    });
    
    setFormData({
      employeeName: '',
      fruitType: '',
      quantity: '',
      unit: 'kg',
      buyerName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filter purchases by current user
  const userPurchases = purchases.filter(purchase => purchase.purchaserEmail === user.email);

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-cart-plus me-2"></i>
                Record Purchase
              </h4>
            </div>
            <div className="card-body">
              <CeoMessagesDisplay />
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employee Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fruit Type</label>
                    <select
                      className="form-select"
                      name="fruitType"
                      value={formData.fruitType}
                      onChange={handleChange}
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
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2 mb-3">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-select"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                      <option value="pieces">pieces</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Buyer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Amount (KES)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Record Purchase
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Purchases</h5>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={clearPurchasesData}
              >
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                <table className="table table-sm table-striped">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Date</th>
                      <th>Fruit</th>
                      <th>Qty</th>
                      <th>Buyer</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPurchases.map(purchase => (
                      <tr key={purchase.id}>
                        <td>{new Date(purchase.date).toLocaleDateString()}</td>
                        <td>{purchase.fruitType}</td>
                        <td>{purchase.quantity} {purchase.unit}</td>
                        <td>{purchase.buyerName}</td>
                        <td>{formatCurrency(purchase.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {userPurchases.length === 0 && (
                  <p className="text-muted text-center">No purchases recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaserDashboard;
