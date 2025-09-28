import React, { useState, useEffect } from 'react';
import { createSellerFruit, updateSellerFruit } from '../../api/sellerFruits';

const SellerFruitsForm = ({ fruit, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    stock_name: '',
    fruit_name: '',
    qty: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0],
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fruit) {
      setFormData({
        stock_name: fruit.stock_name || '',
        fruit_name: fruit.fruit_name || '',
        qty: fruit.qty || '',
        unit_price: fruit.unit_price || '',
        date: fruit.date ? new Date(fruit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: fruit.amount || ''
      });
    } else if (initialData) {
      setFormData({
        stock_name: initialData.stock_name || '',
        fruit_name: initialData.fruit_name || '',
        qty: initialData.qty || '',
        unit_price: initialData.unit_price || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: initialData.amount || ''
      });
    }
  }, [fruit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate amount if qty and unit_price are provided
    if (name === 'qty' || name === 'unit_price') {
      const qty = name === 'qty' ? parseFloat(value) : parseFloat(formData.qty);
      const unitPrice = name === 'unit_price' ? parseFloat(value) : parseFloat(formData.unit_price);
      if (!isNaN(qty) && !isNaN(unitPrice)) {
        setFormData(prev => ({
          ...prev,
          amount: (qty * unitPrice).toFixed(2)
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        stock_name: formData.stock_name,
        fruit_name: formData.fruit_name,
        qty: parseFloat(formData.qty),
        unit_price: parseFloat(formData.unit_price),
        date: formData.date,
        amount: parseFloat(formData.amount)
      };

      if (fruit) {
        await updateSellerFruit(fruit.id, data);
      } else {
        await createSellerFruit(data);
      }

      onSave();
    } catch (err) {
      setError('Failed to save sale. Please try again.');
      console.error('Error saving sale:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">{fruit ? 'Edit Sale' : 'Add New Sale'}</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="stock_name" className="form-label">Stock Name</label>
              <input
                type="text"
                className="form-control"
                id="stock_name"
                name="stock_name"
                value={formData.stock_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="fruit_name" className="form-label">Fruit Name</label>
              <input
                type="text"
                className="form-control"
                id="fruit_name"
                name="fruit_name"
                value={formData.fruit_name}
                onChange={handleChange}
                list="fruits"
                required
              />
              <datalist id="fruits">
                <option value="Sweet banana" />
                <option value="Kampala" />
                <option value="Cavendish" />
                <option value="Plantain" />
                <option value="Matoke" />
                <option value="American sweet potatoes" />
                <option value="White sweet potatoes" />
                <option value="Red sweet potatoes" />
                <option value="Local Avocados" />
                <option value="Hass Avocados" />
                <option value="Oranges" />
                <option value="Pixie" />
                <option value="Lemons" />
              </datalist>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="qty" className="form-label">Quantity</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="qty"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="unit_price" className="form-label">Unit Price</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="unit_price"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="date" className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="amount" className="form-label">Amount</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                fruit ? 'Update' : 'Add'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerFruitsForm;
