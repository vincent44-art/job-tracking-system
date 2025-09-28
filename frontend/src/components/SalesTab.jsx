
import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://127.0.0.1:5000/api';

const formatKenyanCurrency = (amount) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

const SalesTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const res = await fetch(`${BASE_URL}/sales`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const body = await res.json();
  setSales(Array.isArray(body.errors?.sales) ? body.errors.sales : []);
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        {sales.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Stock Name</th>
                  <th>Fruit Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Seller Email</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.stock_name}</td>
                    <td>{sale.fruit_name}</td>
                    <td>{sale.qty}</td>
                    <td>{formatKenyanCurrency(sale.unit_price)}</td>
                    <td>{sale.date}</td>
                    <td className="fw-bold">{formatKenyanCurrency(sale.amount)}</td>
                    <td>{sale.seller_email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            No sales records found
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTab;
