
import React from 'react';

const SalesTableHeader = ({ userSales, clearAllSales }) => {
  return (
    <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">My Sales History</h5>
      {userSales.length > 0 && (
        <button 
          className="btn btn-outline-light btn-sm"
          onClick={clearAllSales}
          title="Clear all sales"
        >
          <i className="bi bi-trash"></i> Clear All
        </button>
      )}
    </div>
  );
};

export default SalesTableHeader;
