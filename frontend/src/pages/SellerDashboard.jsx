
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Trash2 } from 'lucide-react';

const SellerDashboard = () => {
  const { assignments, addSale, deleteSale } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [saleData, setSaleData] = useState({
    sellerName: user?.name || '',
    fruitType: '',
    quantitySold: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new assignment for this sale
    const newAssignmentId = `assignment-${Date.now()}`;
    addSale(newAssignmentId, {
      sellerName: saleData.sellerName,
      fruitType: saleData.fruitType,
      quantitySold: parseFloat(saleData.quantitySold),
      revenue: parseFloat(saleData.revenue),
      date: saleData.date
    });
    
    setSaleData({
      sellerName: user?.name || '',
      fruitType: '',
      quantitySold: '',
      revenue: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (assignmentId, saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      deleteSale(assignmentId, saleId);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get all sales made by this seller
  const userSales = assignments.flatMap(assignment => 
    assignment.sales.map(sale => ({
      ...sale,
      fruitType: assignment.fruitType || sale.fruitType,
      assignmentId: assignment.id
    }))
  ).filter(sale => sale.sellerName === user?.name || sale.sellerName === user?.email);

  const filteredSales = userSales.filter(sale =>
    sale.fruitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Record Sale</h5>
              <form onSubmit={handleSaleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Seller Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={saleData.sellerName}
                    onChange={(e) => setSaleData({...saleData, sellerName: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fruit Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={saleData.fruitType}
                    onChange={(e) => setSaleData({...saleData, fruitType: e.target.value})}
                    placeholder="e.g., Apples, Oranges, Bananas"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantity Sold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={saleData.quantitySold}
                    onChange={(e) => setSaleData({...saleData, quantitySold: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Revenue ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={saleData.revenue}
                    onChange={(e) => setSaleData({...saleData, revenue: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={saleData.date}
                    onChange={(e) => setSaleData({...saleData, date: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-gradient">
                  <i className="bi bi-plus-circle me-2"></i>
                  Record Sale
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">My Sales</h5>
              
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

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Fruit Type</th>
                      <th>Quantity</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(sale => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
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
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No sales recorded yet
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

export default SellerDashboard;
