import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import { 
  fetchDriverExpenses,
  addDriverExpense 
} from '../api/driver';

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
        ...formData,
        driverEmail: user.email,
        amount: parseFloat(formData.amount)
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Welcome, {user?.name || user?.email}</h1>

      <CeoMessagesDisplay />

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading && <div className="text-blue-500 mb-2">Loading...</div>}

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <select
          name="type"
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
          className="border p-2"
        >
          <option value="fuel">Fuel</option>
          <option value="repair">Repair</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          className="border p-2 w-full"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Expense
        </button>
      </form>

      <h2 className="text-lg font-semibold mt-6 mb-2">Your Expenses</h2>
      <ul className="space-y-2">
        {carExpenses.map((expense, index) => (
          <li key={index} className="border p-2 rounded shadow-sm">
            <strong>{expense.type}</strong>: {expense.description} - KES {expense.amount} on {expense.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DriverDashboard;
