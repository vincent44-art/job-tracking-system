import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// CeoMessagesDisplay removed
import {
  fetchDriverExpenses,
  addDriverExpense
} from '../api/driver';
import OtherExpenseForm from '../components/OtherExpenseForm';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [carExpenses, setCarExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'fuel',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const expenses = await fetchDriverExpenses(user.email);
        setCarExpenses(expenses);
      } catch (err) {
        setError('Failed to load expenses. Please try again later.');
        console.error('Error loading expenses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      loadExpenses();
    }
  }, [user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newExpense = {
        driver_email: user.email,
        amount: parseFloat(formData.amount),
        category: formData.type,
        type: formData.type,
        description: formData.description,
        date: formData.date
      };
      const addedExpense = await addDriverExpense(newExpense);
      setCarExpenses(prev => [...prev, addedExpense]);
      // Reset form
      setFormData({
        type: 'fuel',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error('Error adding expense:', err);
    } finally {
      setLoading(false);
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
        <h1 className="text-primary mb-4"><i className="bi bi-truck me-2"></i>Welcome, {user?.name || user?.email}</h1>

        {error && <div className="alert alert-danger mb-2"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
        {loading && <div className="text-info mb-2"><span className="spinner-border spinner-border-sm me-2" role="status"></span>Loading...</div>}

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card fruit-card shadow-lg fade-in">
              <div className="card-header bg-gradient text-white">
                <h5 className="mb-0"><i className="bi bi-cash-coin me-2"></i>Add Car Expense</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="fuel">Fuel</option>
                      <option value="repair">Repair</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      placeholder="Description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount (KES)</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="form-control"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    <i className="bi bi-plus-circle me-2"></i>Add Expense
                  </button>
                </form>
              </div>
            </div>

            {/* Other Expenses Form */}
            <OtherExpenseForm />
          </div>
          <div className="col-md-6 mb-4">
            <div className="card fruit-card shadow-lg fade-in">
              <div className="card-header bg-gradient text-white">
                <h5 className="mb-0"><i className="bi bi-list-ul me-2"></i>Your Expenses</h5>
              </div>
              <div className="card-body">
                {carExpenses.length === 0 ? (
                  <div className="text-muted text-center">No expenses recorded yet.</div>
                ) : (
                  <ul className="list-group">
                    {carExpenses.map((expense, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center fade-in">
                        <div>
                          <span className="badge bg-primary me-2 text-uppercase">{expense.type}</span>
                          <span className="fw-bold">{expense.description}</span>
                          <br />
                          <small className="text-muted">{new Date(expense.date).toLocaleDateString()}</small>
                        </div>
                        <span className="badge bg-success">KES {expense.amount}</span>
                      </li>
                    ))}
                  </ul>
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
