
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';

const DriverDashboard = () => {
  const { addCarExpense, carExpenses } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: 'fuel',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const userExpenses = carExpenses.filter(expense => 
    expense.driverEmail === user?.email
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addCarExpense({
      ...formData,
      driverEmail: user.email,
      amount: parseFloat(formData.amount)
    });
    
    setFormData({
      type: 'fuel',
      description: '',
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

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">
                <i className="bi bi-car-front me-2"></i>
                Driver Dashboard
              </h4>
            </div>
            <div className="card-body">
              <CeoMessagesDisplay />
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Expense Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
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
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Amount ($)</label>
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
                
                <div className="mb-3">
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
                
                <button type="submit" className="btn btn-warning">
                  <i className="bi bi-plus-circle me-2"></i>
                  Record Expense
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">My Car Expenses</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userExpenses.map(expense => (
                      <tr key={expense.id}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="text-capitalize">{expense.type}</td>
                        <td>{expense.description}</td>
                        <td>${expense.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {userExpenses.length === 0 && (
                  <p className="text-muted text-center">No expenses recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
