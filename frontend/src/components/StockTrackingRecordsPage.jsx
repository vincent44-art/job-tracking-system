import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStockTracking, fetchStockTrackingAggregated, fetchSales } from '../api/stockTracking';
import { useAuth } from '../contexts/AuthContext';

const StockTrackingRecordsPage = () => {
  const [data, setData] = useState({
    stockTracking: [],
    stockExpenses: [],
    salesData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    const loadData = async () => {
      try {
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

        setData({
          stockTracking: stockTrackingRes.data || [],
          stockExpenses: aggregatedRes.data || [],
          salesData: salesRes.data || []
        });
      } catch (err) {
        console.error('Failed to load stock tracking data:', err);
        setError('Failed to fetch stock tracking data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const stockTrackingArr = Array.isArray(data.stockTracking) ? data.stockTracking : [];
  const stockExpensesArr = Array.isArray(data.stockExpenses) ? data.stockExpenses : [];
  const salesArr = Array.isArray(data.salesData) ? data.salesData : [];

  // Create a map of stock_name to actual sales revenue
  const salesRevenueMap = {};
  salesArr.forEach(sale => {
    if (sale.stock_name) {
      if (!salesRevenueMap[sale.stock_name]) {
        salesRevenueMap[sale.stock_name] = 0;
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
    <div className="container py-4">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-start">
          <button className="btn btn-secondary" onClick={() => navigate('/ceo/dashboard')}>
            &larr; Back to CEO Dashboard
          </button>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-center">Stock Tracking Overview</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h5><i className="bi bi-table me-2"></i>Stock Tracking Overview</h5>
            </div>
            <div className="card-body table-responsive">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : error ? (
                <div className="text-danger text-center">{error}</div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTrackingRecordsPage;
