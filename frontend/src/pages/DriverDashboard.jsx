
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard = () => {
  const { addCarExpense, carExpenses } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCarExpense({
      driverEmail: user.email,
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date
    });
    setFormData({
      type: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const userExpenses = carExpenses.filter(e => e.driverEmail === user.email);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Record Car Expense</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Expense Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="fuel">Fuel</option>
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  Record Expense
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Expense History</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userExpenses.map(expense => (
                      <tr key={expense.id}>
                        <td>
                          <span className={`badge ${
                            expense.type === 'fuel' ? 'bg-info' :
                            expense.type === 'repair' ? 'bg-danger' :
                            expense.type === 'maintenance' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {expense.type}
                          </span>
                        </td>
                        <td>{expense.description}</td>
                        <td>${expense.amount.toFixed(2)}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
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

export default DriverDashboard;
