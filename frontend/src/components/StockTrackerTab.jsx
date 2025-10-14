import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { fetchStockTracking, fetchStockTrackingAggregated, fetchSales } from '../api/stockTracking';

const StockTrackerTab = () => {
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    purchases: [],
    sales: [],
    otherExpenses: [],
    stockTracking: [],
    stockExpenses: [],
    fruitProfitability: [],
    salesData: []
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
        aggregatedRes,
        salesRes
      ] = await Promise.all([
        fetchStockTracking(token),
        fetchStockTrackingAggregated(token),
        fetchSales(token)
      ]);

      console.log('Fetched sales data:', salesRes.data);

      setData(prevData => ({
        ...prevData,
        stockTracking: stockTrackingRes.data || [],
        stockExpenses: aggregatedRes.data || [],
        salesData: salesRes.data || []
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
  const stockExpensesArr = Array.isArray(data.stockExpenses) ? data.stockExpenses : [];
  const salesArr = Array.isArray(data.salesData) ? data.salesData : [];

  // Create a map of stock_name to actual sales revenue
  const salesRevenueMap = {};
  salesArr.forEach(sale => {
    if (sale.stock_name) {
      if (!salesRevenueMap[sale.stock_name]) {

      }
      salesRevenueMap[sale.stock_name] += sale.amount || 0;
    }
  });

  console.log('Sales revenue map:', salesRevenueMap);
  // Group stocks by dateOut (only those with dateOut)
  const groupedStocks = stockTrackingArr
    .filter(stock => stock.dateOut) // Only stocks that have come out
    .reduce((groups, stock) => {
      const dateKey = stock.dateOut;
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateOut: stock.dateOut,
          stockNames: new Set(),
          totalPurchased: 0,
          totalSold: 0,
          stocks: []
        };
      }
      groups[dateKey].stockNames.add(stock.stockName);
      groups[dateKey].totalPurchased += stock.totalAmount;
      groups[dateKey].totalSold += salesRevenueMap[stock.stockName] || 0;
      groups[dateKey].stocks.push(stock);
      return groups;
    }, {});

  // Convert to array and sort by date descending, take first 5
  const groupedStocksArray = Object.values(groupedStocks)
    .sort((a, b) => new Date(b.dateOut) - new Date(a.dateOut))
    .slice(0, 5);

  const handleDownloadCombinedPDF = async (date) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`/api/stock-tracking/pdf/combined?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download combined PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock_report_combined_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Combined PDF download error:', error);
      alert('Failed to download combined PDF. Please try again.');
    }
  };

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
                      <th>Stock Names</th>
                      <th>Date Out</th>
                      <th>Total Amount Purchased</th>
                      <th>Total Amount Sold</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedStocksArray.map((group) => (
                      <tr key={group.dateOut}>
                        <td>{Array.from(group.stockNames).join(', ')}</td>
                        <td>{new Date(group.dateOut).toLocaleDateString()}</td>
                        <td>KES {group.totalPurchased.toFixed(2)}</td>
                        <td>KES {group.totalSold.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleDownloadCombinedPDF(group.dateOut)}
                          >
                            Download PDF
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
