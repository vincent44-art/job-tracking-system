import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
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

  const handleViewProfitLoss = (stock) => {
    setSelectedStock(stock);
    setShowProfitLossModal(true);
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

  const loadData = async () => {
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
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(loadData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

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
                      <th>Quantity (Kg)</th>
                      <th>Revenue</th>
                      <th>Date Out</th>
                      <th>Sold Amount</th>
                      <th>Profit/Loss</th>
                      <th>Actions</th>
                      <th>Date PDFs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Group stocks by dateIn and sort by date
                      const groupedStocks = stockTrackingArr.slice(0, 5).reduce((groups, stock) => {
                        const dateKey = stock.dateIn;
                        if (!groups[dateKey]) {
                          groups[dateKey] = [];
                        }
                        groups[dateKey].push(stock);
                        return groups;
                      }, {});

                      // Sort dates
                      const sortedDates = Object.keys(groupedStocks).sort((a, b) => new Date(b) - new Date(a));

                      const rows = [];
                      sortedDates.forEach((dateKey, dateIndex) => {
                        const stocksForDate = groupedStocks[dateKey];

                        // Add separator row between different dates (except for the first group)
                        if (dateIndex > 0) {
                          rows.push(
                            <tr key={`separator-${dateIndex}`} className="table-secondary">
                              <td colSpan="10" className="text-center py-1" style={{ height: '10px', border: 'none' }}>
                                {/* Empty separator row */}
                              </td>
                            </tr>
                          );
                        }

                        // Add stocks for this date
                        stocksForDate.forEach((stock) => {
                          const soldAmount = stock.quantityOut ? stock.quantityOut * stock.amountPerKg : 0;
                          const profitLoss = stock.dateOut ? soldAmount - (stock.totalStockCost || 0) : -(stock.totalStockCost || 0);
                          const isProfit = profitLoss > 0;
                          const isLoss = profitLoss < 0;
                          const isSameDay = stock.dateIn === stock.dateOut;

                          rows.push(
                            <tr key={stock.id} className={isSameDay ? 'table-warning' : ''}>
                              <td>{stock.stockName}</td>
                              <td>{new Date(stock.dateIn).toLocaleDateString()}</td>
                              <td>{stock.quantityIn}</td>
                              <td>{soldAmount > 0 ? `$${soldAmount.toFixed(2)}` : '$0.00'}</td>
                              <td>{stock.dateOut ? new Date(stock.dateOut).toLocaleDateString() : '-'}</td>
                              <td>{soldAmount > 0 ? `$${soldAmount.toFixed(2)}` : '-'}</td>
                              <td>
                                <span className={isProfit ? 'text-success fw-bold' : isLoss ? 'text-danger fw-bold' : ''}>
                                  {profitLoss !== 0 ? `${isProfit ? '+' : ''}$${profitLoss.toFixed(2)}` : '$0.00'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info me-2"
                                  onClick={() => handleTrackStock(stock.stockName)}
                                >
                                  Track
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleViewProfitLoss(stock)}
                                >
                                  P/L
                                </button>
                                {stock.dateOut && (
                                  <button
                                    className="btn btn-sm btn-success ms-2"
                                    onClick={() => handleDownloadPDF(stock.id)}
                                  >
                                    PDF
                                  </button>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-warning me-1"
                                  onClick={() => handleDownloadGroupPDF(stock.dateIn, 'in')}
                                >
                                  {stock.dateIn} In
                                </button>
                                {stock.dateOut && (
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleDownloadGroupPDF(stock.dateOut, 'out')}
                                  >
                                    {stock.dateOut} Out
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      });

                      return rows;
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
