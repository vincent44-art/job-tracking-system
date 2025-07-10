
import React from 'react';

const StockMovementForm = ({ form, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Fruit Type</label>
          <select
            className="form-select"
            value={form.fruitType}
            onChange={(e) => onChange({...form, fruitType: e.target.value})}
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
        <div className="col-md-6 mb-3">
          <label className="form-label">Movement Type</label>
          <select
            className="form-select"
            value={form.movementType}
            onChange={(e) => onChange({...form, movementType: e.target.value})}
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Quantity</label>
          <input
            type="text"
            className="form-control"
            value={form.quantity}
            onChange={(e) => onChange({...form, quantity: e.target.value})}
            required
          />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={form.unit}
            onChange={(e) => onChange({...form, unit: e.target.value})}
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
            <option value="pieces">pieces</option>
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={form.date}
            onChange={(e) => onChange({...form, date: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Reason</label>
          <input
            type="text"
            className="form-control"
            value={form.reason}
            onChange={(e) => onChange({...form, reason: e.target.value})}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            value={form.location}
            onChange={(e) => onChange({...form, location: e.target.value})}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="btn btn-warning">
        <i className="bi bi-arrow-left-right me-2"></i>
        Record Movement
      </button>
    </form>
  );
};

export default StockMovementForm;
