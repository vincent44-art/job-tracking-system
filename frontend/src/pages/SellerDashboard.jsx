
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';

const SellerDashboard = () => {
  const { addSale, assignments } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    assignmentId: '',
    quantitySold: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0],
    fruitType: '',
    sellerName: user?.name || ''
  });

  // Get assignments for current user
  const userAssignments = assignments.filter(assignment => 
    assignment.sellerEmail === user?.email
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate assignment ID if creating new sale
    const assignmentId = formData.assignmentId || `seller-${user.email}-${Date.now()}`;
    
    addSale(assignmentId, {
      quantitySold: parseFloat(formData.quantitySold),
      revenue: parseFloat(formData.revenue),
      date: formData.date,
      fruitType: formData.fruitType,
      sellerName: formData.sellerName
    });
    
    setFormData({
      assignmentId: '',
      quantitySold: '',
      revenue: '',
      date: new Date().toISOString().split('T')[0],
      fruitType: '',
      sellerName: user?.name || ''
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
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Record Sale
              </h4>
            </div>
            <div className="card-body">
              <CeoMessagesDisplay />
              
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
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="quantitySold"
                    value={formData.quantitySold}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Revenue ($)</label>
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
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">My Sales</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Fruit</th>
                      <th>Qty</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAssignments.map(assignment => 
                      assignment.sales.map(sale => (
                        <tr key={sale.id}>
                          <td>{new Date(sale.date).toLocaleDateString()}</td>
                          <td>{sale.fruitType || assignment.fruitType}</td>
                          <td>{sale.quantitySold}</td>
                          <td>${sale.revenue.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {userAssignments.length === 0 && (
                  <p className="text-muted text-center">No sales recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
