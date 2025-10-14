import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStockTracking } from '../api/stockTracking';
import { useAuth } from '../contexts/AuthContext';

const StockTrackingRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleDownloadPDF = async (recordId) => {
    try {
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

  useEffect(() => {
    fetchStockTracking(token)
      .then((data) => {
        setRecords(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch stock tracking records');
        setLoading(false);
      });
  }, [token]);

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
          <h2 className="text-center">Stock Tracking Records</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h5><i className="bi bi-table me-2"></i>Stock Tracking Records</h5>
            </div>
            <div className="card-body table-responsive">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : error ? (
                <div className="text-danger text-center">{error}</div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Stock Name</th>
                      <th>Date In</th>
                      <th>Fruit Type</th>
                      <th>Quantity In</th>
                      <th>Amount per Kg</th>
                      <th>Total Amount</th>
                      <th>Other Charges</th>
                      <th>Duration</th>
                      <th>Gradient Used</th>
                      <th>Gradient Amount Used</th>
                      <th>Gradient Cost per Unit</th>
                      <th>Total Gradient Cost</th>
                      <th>Date Out</th>
                      <th>Quantity Out</th>
                      <th>Spoilage</th>
                      <th>Total Stock Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn)).map((rec, idx) => (
                        <React.Fragment key={rec.id || idx}>
                          <tr>
                            <td>{rec.stockName}</td>
                            <td>{rec.dateIn}</td>
                            <td>{rec.fruitType}</td>
                            <td>{rec.quantityIn}</td>
                            <td>{rec.amountPerKg}</td>
                            <td>{rec.totalAmount}</td>
                            <td>{rec.otherCharges}</td>
                            <td>{rec.duration}</td>
                            <td>{rec.gradientUsed}</td>
                            <td>{rec.gradientAmountUsed}</td>
                            <td>{rec.gradientCostPerUnit}</td>
                            <td>{rec.totalGradientCost}</td>
                            <td>{rec.dateOut}</td>
                            <td>{rec.quantityOut}</td>
                            <td>{rec.spoilage}</td>
                            <td>{rec.totalStockCost}</td>
                          </tr>
                          {rec.dateOut && (
                            <tr>
                              <td colSpan="16" className="text-center">
                                <button
                                  className="btn btn-sm btn-success me-2"
                                  onClick={() => handleDownloadPDF(rec.id)}
                                >
                                  Download PDF Report
                                </button>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleDownloadGroupPDF(rec.dateIn, 'in')}
                                >
                                  {rec.dateIn} In
                                </button>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleDownloadGroupPDF(rec.dateOut, 'out')}
                                >
                                  {rec.dateOut} Out
                                </button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr><td colSpan="16" className="text-center text-muted">No stock tracking records yet</td></tr>
                    )}
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
