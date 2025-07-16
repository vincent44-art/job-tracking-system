import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CeoMessagesDisplay from '../components/CeoMessagesDisplay';
import SaleForm from '../components/seller/SaleForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SalesHistoryTable from '../components/seller/SalesHistoryTable';
import SalesSummary from '../components/seller/SalesSummary';


const BASE_URL = 'http://127.0.0.1:5000/api';

const fetchSellerAssignments = async (emailOrName) => {
  const res = await fetch(`${BASE_URL}/assignments?seller=${emailOrName}`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return await res.json();
};

const addNewSale = async (assignmentId, saleData) => {
  const res = await fetch(`${BASE_URL}/assignments/${assignmentId}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) throw new Error('Failed to add sale');
  return await res.json();
};

const clearSellerSales = async (emailOrName) => {
  const res = await fetch(`${BASE_URL}/sales/clear?seller=${emailOrName}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear sales');
  return await res.json();
};

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
    sellerName: user?.name || '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSellerAssignments(user?.email || user?.name);
        setAssignments(data);
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

  const userAssignments = assignments.filter(
    (assignment) =>
      assignment.sellerEmail === user?.email ||
      assignment.sellerName === user?.name
  );

  const userSales = userAssignments.flatMap((assignment) =>
    (assignment.sales || []).map((sale) => ({
      ...sale,
      fruitType: sale.fruitType || assignment.fruitType,
      assignmentId: assignment.id,
      sellerName: sale.sellerName || assignment.sellerName || user?.name,
    }))
  );

  const formatKenyanCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const assignmentId =
        formData.assignmentId ||
        `seller-${user?.email || user?.name}-${Date.now()}`;

      const saleData = {
        quantitySold: String(formData.quantitySold),
        revenue: parseFloat(formData.revenue),
        date: formData.date,
        fruitType: formData.fruitType,
        sellerName: formData.sellerName || user?.name,
      };

      await addNewSale(assignmentId, saleData);

      setAssignments((prev) => {
        const index = prev.findIndex((a) => a.id === assignmentId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...prev[index],
            sales: [...(prev[index].sales || []), saleData],
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: assignmentId,
              sellerEmail: user?.email,
              sellerName: user?.name,
              fruitType: formData.fruitType,
              sales: [saleData],
            },
          ];
        }
      });

      setFormData({
        assignmentId: '',
        quantitySold: '',
        revenue: '',
        date: new Date().toISOString().split('T')[0],
        fruitType: '',
        sellerName: user?.name || '',
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
      [e.target.name]: e.target.value,
    });
  };

  const handleClearSales = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all your sales data? This action cannot be undone.'
      )
    ) {
      try {
        setLoading(true);
        await clearSellerSales(user?.email || user?.name);
        setAssignments((prev) =>
          prev.map((assignment) => {
            if (
              assignment.sellerEmail === user?.email ||
              assignment.sellerName === user?.name
            ) {
              return { ...assignment, sales: [] };
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
