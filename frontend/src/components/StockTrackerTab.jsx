import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStockTracking, fetchStockTrackingAggregated } from '../api/stockTracking';

const StockTrackerTab = () => {
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    purchases: [],
    sales: [],
    otherExpenses: [],
    stockTracking: [],
    stockExpenses: [],
    fruitProfitability: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showProfitLossModal, setShowProfitLossModal] = useState(false);

  const navigate = useNavigate();
  
  const goToStockTrackingRecords = () => {
    navigate('/stock-tracking-records');
  };

  const handleTrackStock = (stockName) => {
    navigate('/stock-tracking-records', { state: { filterStock: stockName } });
  };

  const handleDownloadPDF = async (recordId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/stock-tracking/pdf/${recordId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock_report_${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleDownloadGroupPDF = async (date, type) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/stock-tracking/pdf/group?date=${date}&type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download group PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock_report_${type}_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Group PDF download error:', error);
      alert('Failed to download group PDF. Please try again.');
    }
  };

  const closeModal = () => {
    setShowProfitLossModal(false);
    setSelectedStock(null);
  };

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const [
        stockTrackingRes,
        aggregatedRes
      ] = await Promise.all([
        fetchStockTracking(token),
        fetchStockTrackingAggregated(token)
      ]);

      setData(prevData => ({
        ...prevData,
        stockTracking: stockTrackingRes.data || [],
        stockExpenses: aggregatedRes.data || []
      }));
    } catch (err) {
      console.error('Failed to load stock tracker data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(loadData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const stockTrackingArr = Array.isArray(data.stockTracking) ? data.stockTracking : [];
  
  return (
    <div className="container-fluid py-4">
      {/* Stock Tracking Overview */}
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Stock Tracking Overview</h5>
              <button 
                className="btn btn-light btn-sm" 
                onClick={goToStockTrackingRecords}
              >
                View All Records
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Stock Name</th>
                      <th>Date In</th>
                      <th>Purchase Amount</th>
                      <th>Revenue</th>
                      <th>Date Out</th>
                      <th>Profit/Loss</th>
                      <th>PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Group stocks by dateIn
                      const groupedStocks = stockTrackingArr.slice(0, 10).reduce((groups, stock) => {
                        const dateKey = stock.dateIn;
                        if (!groups[dateKey]) {
                          groups[dateKey] = [];
                        }
                        groups[dateKey].push(stock);
                        return groups;
                      }, {});

                      // Sort dates descending
                      const sortedDates = Object.keys(groupedStocks).sort((a, b) => new Date(b) - new Date(a));

                      return sortedDates.map((dateKey) => {
                        const stocksForDate = groupedStocks[dateKey];
                        const stockNames = [...new Set(stocksForDate.map(stock => stock.stockName))].join(', ');
                        const totalPurchaseAmount = stocksForDate.reduce((sum, stock) => sum + stock.totalAmount, 0);
                        const totalSoldAmount = stocksForDate.reduce((sum, stock) => sum + (stock.quantityOut ? stock.quantityOut * stock.amountPerKg : 0), 0);
                        const totalProfitLoss = stocksForDate.reduce((sum, stock) => {
                          const soldAmount = stock.quantityOut ? stock.quantityOut * stock.amountPerKg : 0;
                          const profitLoss = stock.dateOut ? soldAmount - (stock.totalStockCost || 0) : -(stock.totalStockCost || 0);
                          return sum + profitLoss;
                        }, 0);
                        const hasDateOut = stocksForDate.some(stock => stock.dateOut);
                        const latestDateOut = stocksForDate.filter(stock => stock.dateOut).sort((a, b) => new Date(b.dateOut) - new Date(a.dateOut))[0]?.dateOut;

                        const isProfit = totalProfitLoss > 0;
                        const isLoss = totalProfitLoss < 0;

                        return (
                          <tr key={dateKey}>
                            <td>{stockNames}</td>
                            <td>{new Date(dateKey).toLocaleDateString()}</td>
                            <td>KES {totalPurchaseAmount.toFixed(2)}</td>
                            <td>{totalSoldAmount > 0 ? `KES ${totalSoldAmount.toFixed(2)}` : 'KES 0.00'}</td>
                            <td>{latestDateOut ? new Date(latestDateOut).toLocaleDateString() : '-'}</td>
                            <td>
                              <span className={isProfit ? 'text-success fw-bold' : isLoss ? 'text-danger fw-bold' : ''}>
                                {totalProfitLoss !== 0 ? `${isProfit ? '+' : ''}KES ${totalProfitLoss.toFixed(2)}` : 'KES 0.00'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleDownloadGroupPDF(dateKey, 'in')}
                              >
                                PDF
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Profit/Loss View */}
      {showProfitLossModal && selectedStock && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Profit/Loss Analysis - {selectedStock.stockName}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Initial Cost:</strong> ${selectedStock.totalAmount}</p>
                <p><strong>Gradient Cost:</strong> ${selectedStock.totalGradientCost || 0}</p>
                <p><strong>Other Charges:</strong> ${selectedStock.otherCharges || 0}</p>
                <p><strong>Total Stock Cost:</strong> ${selectedStock.totalStockCost || 0}</p>
                {selectedStock.dateOut && (
                  <>
                    <hr />
                    <p><strong>Duration:</strong> {selectedStock.duration} days</p>
                    <p><strong>Quantity Out:</strong> {selectedStock.quantityOut} Kg</p>
                    <p><strong>Spoilage:</strong> {selectedStock.spoilage || 0} Kg</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showProfitLossModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default StockTrackerTab;
