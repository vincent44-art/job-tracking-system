
import React from 'react';
import { useData } from '../contexts/DataContext';

const StatsCards = () => {
  const { getStats } = useData();
  const stats = getStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="row g-4 mb-4">
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center">
          <div className="display-6 text-primary mb-2">
            <i className="bi bi-cart-plus"></i>
          </div>
          <h3 className="h5 mb-1">Total Purchases</h3>
          <p className="h4 text-success mb-0">{formatCurrency(stats.totalPurchases)}</p>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center">
          <div className="display-6 text-success mb-2">
            <i className="bi bi-graph-up"></i>
          </div>
          <h3 className="h5 mb-1">Total Sales</h3>
          <p className="h4 text-success mb-0">{formatCurrency(stats.totalSales)}</p>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center">
          <div className="display-6 text-warning mb-2">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <h3 className="h5 mb-1">Net Profit</h3>
          <p className={`h4 mb-0 ${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(stats.netProfit)}
          </p>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="stats-card text-center">
          <div className="display-6 text-info mb-2">
            <i className="bi bi-percent"></i>
          </div>
          <h3 className="h5 mb-1">Profit Margin</h3>
          <p className={`h4 mb-0 ${stats.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
            {stats.profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
