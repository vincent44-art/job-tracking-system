
import React from 'react';

const SalesHistoryTable = ({ userSales, formatKenyanCurrency }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Fruit</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {userSales.length > 0 ? (
            userSales
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((sale, index) => (
              <tr key={sale.id || `sale-${index}`}>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td>
                  <span className="badge bg-primary">{sale.fruitType}</span>
                </td>
                <td>{String(sale.quantitySold)}</td>
                <td className="fw-bold text-success">
                  {formatKenyanCurrency(sale.revenue)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted py-4">
                <i className="bi bi-inbox display-4 d-block mb-2"></i>
                No sales recorded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesHistoryTable;
