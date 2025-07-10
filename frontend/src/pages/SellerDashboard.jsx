
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import SaleForm from '../components/seller/SaleForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SalesHistoryTable from '../components/seller/SalesHistoryTable';
import SalesSummary from '../components/seller/SalesSummary';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate assignment ID if creating new sale
    const assignmentId = formData.assignmentId || `seller-${user?.email || user?.name}-${Date.now()}`;
    
    addSale(assignmentId, {
      quantitySold: String(formData.quantitySold), // Ensure it's stored as string
      revenue: parseFloat(formData.revenue),
      date: formData.date,
      fruitType: formData.fruitType,
      sellerName: formData.sellerName || user?.name
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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const clearAllSales = () => {
    if (window.confirm('Are you sure you want to clear all your sales data? This action cannot be undone.')) {
      // Get current assignments
      const currentAssignments = JSON.parse(localStorage.getItem('fruittrack_assignments') || '[]');
      
      // Clear sales from user's assignments
      const updatedAssignments = currentAssignments.map(assignment => {
        if (assignment.sellerEmail === user?.email || assignment.sellerName === user?.name) {
          return {
            ...assignment,
            sales: []
          };
        }
        return assignment;
      });
      
      // Update localStorage
      localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
      
      // Force a page refresh to show updated data
      window.location.reload();
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <CeoMessagesDisplay />
          <SaleForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            userAssignments={userAssignments}
            user={user}
          />
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <SalesTableHeader 
              userSales={userSales}
              clearAllSales={clearAllSales}
            />
            <div className="card-body">
              <SalesHistoryTable 
                userSales={userSales}
                formatKenyanCurrency={formatKenyanCurrency}
              />
              <SalesSummary 
                userSales={userSales}
                formatKenyanCurrency={formatKenyanCurrency}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
