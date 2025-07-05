
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const PurchaserDashboard = () => {
  const { addPurchase, purchases } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    employeeName: '',
    fruitType: '',
    quantity: '',
    unit: '',
    buyerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      purchaserEmail: user.email,
      employeeName: formData.employeeName,
      fruitType: formData.fruitType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      buyerName: formData.buyerName,
      amount: parseFloat(formData.amount),
      date: formData.date
    });
    setFormData({
      employeeName: '',
      fruitType: '',
      quantity: '',
      unit: '',
      buyerName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const userPurchases = purchases.filter(p => p.purchaserEmail === user.email);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Record Purchase</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fruit Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fruitType}
                    onChange={(e) => setFormData({...formData, fruitType: e.target.value})}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-control"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="kg">Kg</option>
                      <option value="tons">Tons</option>
                      <option value="boxes">Boxes</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Buyer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-gradient">
                  <i className="bi bi-plus-circle me-2"></i>
                  Record Purchase
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Purchase History</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fruit</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPurchases.map(purchase => (
                      <tr key={purchase.id}>
                        <td>{purchase.fruitType}</td>
                        <td>{purchase.quantity} {purchase.unit}</td>
                        <td>${purchase.amount.toFixed(2)}</td>
                        <td>{new Date(purchase.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
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

export default PurchaserDashboard;
