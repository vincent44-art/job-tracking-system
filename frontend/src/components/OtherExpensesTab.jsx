import React, { useState, useEffect } from 'react';
import { Search, Trash2, PlusCircle } from 'lucide-react';
import { fetchOtherExpenses, createOtherExpense, deleteOtherExpense } from 'http://127.0.0.1:5000/api';

const OtherExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch expenses on component mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetchOtherExpenses();
        setExpenses(response.data);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newExpense = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date
      };
      
      const response = await createOtherExpense(newExpense);
      setExpenses([...expenses, response.data]);
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteOtherExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Other Expenses Management</h2>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      <div className="row">
        <div className="col-lg-4 mb-4 mb-lg-0">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Record New Expense</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
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
                    min="0"
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
                <button type="submit" className="btn btn-primary w-100">
                  <PlusCircle className="me-2" size={18} />
                  Add Expense
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search expenses by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map(expense => (
                        <tr key={expense.id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description}</td>
                          <td className="fw-bold">{formatCurrency(expense.amount)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(expense.id)}
                              title="Delete expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {expenses.length === 0 
                            ? 'No expenses recorded yet' 
                            : 'No matching expenses found'}
                        </td>
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

export default OtherExpensesTab;