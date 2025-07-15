import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import { 
  fetchDriverExpenses,
  addDriverExpense 
} from 'http://127.0.0.1:5000/api/';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [carExpenses, setCarExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'fuel',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch driver expenses on component mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const response = await fetchDriverExpenses(user.email);
        setCarExpenses(response.data);
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
        ...formData,
        driverEmail: user.email,
        amount: parseFloat(formData.amount)
      };
      
      const response = await addDriverExpense(newExpense);
      setCarExpenses(prev => [...prev, response.data]);
      
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-warning"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Record Expense
                    </>
                  )}
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
              {loading && carExpenses.length === 0 ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
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
                      {carExpenses.map(expense => (
                        <tr key={expense.id || expense._id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="text-capitalize">{expense.type}</td>
                          <td>{expense.description}</td>
                          <td>${expense.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {carExpenses.length === 0 && !loading && (
                    <p className="text-muted text-center">No expenses recorded yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;