import React, { useState, useEffect } from 'react';
import { fetchStats } from 'http://127.0.0.1:5000/api';

const StatsCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="row g-4 mb-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="col-md-6 col-lg-3">
            <div className="stats-card text-center">
              <div className="display-6 text-secondary mb-2">
                <div className="spinner-border spinner-border-sm" role="status"></div>
              </div>
              <h3 className="h5 mb-1">Loading...</h3>
              <p className="h4 text-secondary mb-0">--</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mb-4">
        {error}
        <button 
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => setError(null)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="row g-4 mb-4">
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center p-3 shadow-sm rounded">
          <div className="display-6 text-primary mb-2">
            <i className="bi bi-cart-plus"></i>
          </div>
          <h3 className="h5 mb-1">Total Purchases</h3>
          <p className="h4 text-success mb-0">{formatCurrency(stats.totalPurchases)}</p>
          <small className="text-muted">All inventory purchases</small>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center p-3 shadow-sm rounded">
          <div className="display-6 text-success mb-2">
            <i className="bi bi-graph-up"></i>
          </div>
          <h3 className="h5 mb-1">Total Sales</h3>
          <p className="h4 text-success mb-0">{formatCurrency(stats.totalSales)}</p>
          <small className="text-muted">Gross revenue</small>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center p-3 shadow-sm rounded">
          <div className="display-6 text-warning mb-2">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <h3 className="h5 mb-1">Net Profit</h3>
          <p className={`h4 mb-0 ${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(stats.netProfit)}
          </p>
          <small className="text-muted">After all expenses</small>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center p-3 shadow-sm rounded">
          <div className="display-6 text-info mb-2">
            <i className="bi bi-percent"></i>
          </div>
          <h3 className="h5 mb-1">Profit Margin</h3>
          <p className={`h4 mb-0 ${stats.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
            {stats.profitMargin.toFixed(1)}%
          </p>
          <small className="text-muted">Profit to sales ratio</small>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;