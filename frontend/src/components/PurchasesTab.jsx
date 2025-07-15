import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { fetchPurchases, deletePurchase } from 'http://127.0.0.1:5000/api';
 import PurchaseFormModal from './PurchaseFormModal';

const PurchasesTab = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch purchases from API
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const response = await fetchPurchases();
        setPurchases(response.data);
      } catch (err) {
        console.error('Failed to fetch purchases:', err);
        setError('Failed to load purchases. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadPurchases();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    
    try {
      await deletePurchase(id);
      setPurchases(purchases.filter(purchase => purchase.id !== id));
    } catch (err) {
      console.error('Failed to delete purchase:', err);
      setError('Failed to delete purchase. Please try again.');
    }
  };

  const handleAddPurchase = (newPurchase) => {
    setPurchases([...purchases, newPurchase]);
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaserEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.fruitType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Purchase Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} className="me-2" />
          Add Purchase
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          />
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-transparent">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search purchases by purchaser, employee, fruit type, or buyer..."
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
                  <th>Purchaser</th>
                  <th>Employee</th>
                  <th>Fruit Type</th>
                  <th>Quantity</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{new Date(purchase.date).toLocaleDateString()}</td>
                      <td>{purchase.purchaserEmail}</td>
                      <td>{purchase.employeeName}</td>
                      <td>
                        <span className="badge bg-success">
                          {purchase.fruitType}
                        </span>
                      </td>
                      <td>{purchase.quantity} {purchase.unit}</td>
                      <td>{purchase.buyerName}</td>
                      <td className="fw-bold">{formatCurrency(purchase.amount)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(purchase.id)}
                          title="Delete purchase"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      {purchases.length === 0 
                        ? 'No purchase records found' 
                        : 'No matching purchases found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PurchaseFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPurchase={handleAddPurchase}
      />
    </div>
  );
};

export default PurchasesTab;