
import React from 'react';

const SaleForm = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  userAssignments, 
  user 
}) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success text-white">
        <h4 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Record Sale
        </h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Assignment (Optional)</label>
            <select
              className="form-select"
              name="assignmentId"
              value={formData.assignmentId}
              onChange={handleChange}
            >
              <option value="">Create New Sale</option>
              {userAssignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.fruitType} - {assignment.quantityAssigned} units
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
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
          
          <div className="mb-3">
            <label className="form-label">Quantity Sold</label>
            <input
              type="text"
              className="form-control"
              name="quantitySold"
              value={formData.quantitySold}
              onChange={handleChange}
              placeholder="e.g., 10 kg, 5 boxes, 20 pieces"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Revenue (KES)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="revenue"
              value={formData.revenue}
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
          
          <button type="submit" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            Record Sale
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
