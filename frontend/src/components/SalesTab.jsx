
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, Trash2, Plus } from 'lucide-react';

const SalesTab = () => {
  const { assignments, deleteSale, addSale } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sellerName: '',
    fruitType: '',
    quantitySold: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = (assignmentId, saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      deleteSale(assignmentId, saleId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new assignment for this sale
    const newAssignmentId = `assignment-${Date.now()}`;
    addSale(newAssignmentId, {
      sellerName: formData.sellerName,
      fruitType: formData.fruitType,
      quantitySold: parseFloat(formData.quantitySold),
      revenue: parseFloat(formData.revenue),
      date: formData.date
    });

    // Reset form
    setFormData({
      sellerName: '',
      fruitType: '',
      quantitySold: '',
      revenue: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const clearAllSales = () => {
    if (window.confirm('Are you sure you want to clear all sales data? This action cannot be undone.')) {
      // Clear all sales from all assignments
      assignments.forEach(assignment => {
        assignment.sales.forEach(sale => {
          deleteSale(assignment.id, sale.id);
        });
      });
    }
  };

  const allSales = assignments.flatMap(assignment => 
    assignment.sales.map(sale => ({
      ...sale,
      fruitType: assignment.fruitType,
      sellerEmail: assignment.sellerEmail,
      assignmentId: assignment.id
    }))
  );

  const filteredSales = allSales.filter(sale =>
    sale.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.fruitType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Management</h2>
        <div>
          <button
            className="btn btn-gradient me-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="me-1" />
            Add Sale
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={clearAllSales}
          >
            <Trash2 size={16} className="me-1" />
            Clear All
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body">
            <h5 className="card-title text-gradient">Record New Sale</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Seller Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sellerName}
                    onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fruit Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fruitType}
                    onChange={(e) => setFormData({...formData, fruitType: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Quantity Sold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantitySold}
                    onChange={(e) => setFormData({...formData, quantitySold: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Revenue ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-gradient">
                  Record Sale
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card card-custom mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative flex-grow-1">
              <Search className="position-absolute" style={{left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6c757d'}} />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-custom">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Seller</th>
                  <th>Fruit Type</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.sellerEmail}</td>
                    <td>{sale.fruitType}</td>
                    <td>{sale.quantitySold}</td>
                    <td>{formatCurrency(sale.revenue)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(sale.assignmentId, sale.id)}
                        title="Delete sale"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
