import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import SaleForm from '../components/seller/SaleForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SalesHistoryTable from '../components/seller/SalesHistoryTable';
import SalesSummary from '../components/seller/SalesSummary';
import { 
  fetchSellerAssignments,
  addNewSale,
  clearSellerSales
} from 'http://127.0.0.1:5000';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    assignmentId: '',
    quantitySold: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0],
    fruitType: '',
    sellerName: user?.name || ''
  });

  // Fetch seller assignments and sales on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchSellerAssignments(user?.email || user?.name);
        setAssignments(response.data);
      } catch (err) {
        setError('Failed to load sales data. Please try again later.');
        console.error('Error loading seller data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email || user?.name) {
      loadData();
    }
  }, [user?.email, user?.name]);

  // Get assignments for current user
  const userAssignments = assignments.filter(assignment => 
    assignment.sellerEmail === user?.email || assignment.sellerName === user?.name
  );

  // Get all sales for current user from all assignments
  const userSales = userAssignments.flatMap(assignment => 
    (assignment.sales || []).map(sale => ({
      ...sale,
      fruitType: sale.fruitType || assignment.fruitType,
      assignmentId: assignment.id,
      sellerName: sale.sellerName || assignment.sellerName || user?.name
    }))
  );

  // Format currency in Kenyan Shillings
  const formatKenyanCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Generate assignment ID if creating new sale
      const assignmentId = formData.assignmentId || `seller-${user?.email || user?.name}-${Date.now()}`;
      
      const saleData = {
        quantitySold: String(formData.quantitySold), // Ensure it's stored as string
        revenue: parseFloat(formData.revenue),
        date: formData.date,
        fruitType: formData.fruitType,
        sellerName: formData.sellerName || user?.name
      };

      const response = await addNewSale(assignmentId, saleData);
      
      // Update local state with new sale
      setAssignments(prev => {
        const assignmentIndex = prev.findIndex(a => a.id === assignmentId);
        if (assignmentIndex >= 0) {
          // Update existing assignment
          const updated = [...prev];
          updated[assignmentIndex] = {
            ...updated[assignmentIndex],
            sales: [...(updated[assignmentIndex].sales || []), saleData]
          };
          return updated;
        } else {
          // Create new assignment
          return [...prev, {
            id: assignmentId,
            sellerEmail: user?.email,
            sellerName: user?.name,
            fruitType: formData.fruitType,
            sales: [saleData]
          }];
        }
      });

      // Reset form
      setFormData({
        assignmentId: '',
        quantitySold: '',
        revenue: '',
        date: new Date().toISOString().split('T')[0],
        fruitType: '',
        sellerName: user?.name || ''
      });
    } catch (err) {
      setError('Failed to record sale. Please try again.');
      console.error('Error adding sale:', err);
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

  const handleClearSales = async () => {
    if (window.confirm('Are you sure you want to clear all your sales data? This action cannot be undone.')) {
      try {
        setLoading(true);
        await clearSellerSales(user?.email || user?.name);
        
        // Update local state to remove sales
        setAssignments(prev => 
          prev.map(assignment => {
            if (assignment.sellerEmail === user?.email || assignment.sellerName === user?.name) {
              return {
                ...assignment,
                sales: []
              };
            }
            return assignment;
          })
        );
      } catch (err) {
        setError('Failed to clear sales. Please try again.');
        console.error('Error clearing sales:', err);
      } finally {
        setLoading(false);
      }
    }
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
          <CeoMessagesDisplay />
          <SaleForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            userAssignments={userAssignments}
            user={user}
            loading={loading}
          />
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <SalesTableHeader 
              userSales={userSales}
              clearAllSales={handleClearSales}
              loading={loading}
            />
            <div className="card-body">
              {loading && userSales.length === 0 ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <SalesHistoryTable 
                    userSales={userSales}
                    formatKenyanCurrency={formatKenyanCurrency}
                  />
                  <SalesSummary 
                    userSales={userSales}
                    formatKenyanCurrency={formatKenyanCurrency}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;