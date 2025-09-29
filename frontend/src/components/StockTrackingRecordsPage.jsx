import React, { useEffect, useState } from 'react';
import { fetchStockTracking } from '../api/stockTracking';
import { useAuth } from '../contexts/AuthContext';

const StockTrackingRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchStockTracking(token)
      .then((data) => {
        setRecords(data.stockTracking || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch stock tracking records');
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container py-4">
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
                      records.map((rec, idx) => (
                        <tr key={rec.id || idx}>
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
