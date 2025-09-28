import React, { useState, useMemo } from 'react';
import { deleteSellerFruit } from '../../api/sellerFruits';

const SellerFruitsTable = ({ 
  sellerFruits, 
  onEdit, 
  onRefresh, 
  formatKenyanCurrency, 
  formatDateCell,
  downloadSellerFruitsPDF 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterFruitType, setFilterFruitType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    stock_name: true,
    fruit_name: true,
    qty: true,
    unit_price: true,
    date: true,
    amount: true,
    actions: true
  });

  // Get unique fruit types for filter dropdown
  const uniqueFruitTypes = useMemo(() => {
    const fruits = [...new Set(sellerFruits.map(fruit => fruit.fruit_name))];
    return fruits.sort();
  }, [sellerFruits]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = sellerFruits.filter(fruit => {
      const matchesSearch = searchTerm === '' || 
        Object.values(fruit).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const fruitDate = new Date(fruit.date);
      const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
      const toDate = filterDateTo ? new Date(filterDateTo) : null;
      
      const matchesDateFrom = !fromDate || fruitDate >= fromDate;
      const matchesDateTo = !toDate || fruitDate <= toDate;
      
      const matchesFruitType = filterFruitType === '' || fruit.fruit_name === filterFruitType;
      
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesFruitType;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [sellerFruits, searchTerm, sortConfig, filterDateFrom, filterDateTo, filterFruitType]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalQty = filteredAndSortedData.reduce((sum, fruit) => sum + (fruit.qty || 0), 0);
    const totalAmount = filteredAndSortedData.reduce((sum, fruit) => sum + (fruit.amount || 0), 0);
    return { totalQty, totalAmount };
  }, [filteredAndSortedData]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      try {
        await deleteSellerFruit(saleId);
        onRefresh();
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale. Please try again.');
      }
    }
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const exportToCSV = () => {
    const headers = ['Stock Name', 'Fruit Name', 'Quantity', 'Unit Price', 'Date', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(sale => [
        sale.stock_name,
        sale.fruit_name,
        sale.qty,
        sale.unit_price,
        formatDateCell(sale.date),
        sale.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Sales Table</h5>
        <div className="btn-group">
          <button 
            className="btn btn-light btn-sm" 
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <i className="bi bi-gear me-1"></i>Columns
          </button>
          <button className="btn btn-light btn-sm" onClick={exportToCSV}>
            <i className="bi bi-download me-1"></i>Export CSV
          </button>
        </div>
      </div>
      
      <div className="card-body">
        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              placeholder="From Date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              placeholder="To Date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filterFruitType}
              onChange={(e) => setFilterFruitType(e.target.value)}
            >
              <option value="">All Fruit Types</option>
              {uniqueFruitTypes.map(fruit => (
                <option key={fruit} value={fruit}>{fruit}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button 
              className="btn btn-outline-secondary me-2" 
              onClick={() => {
                setSearchTerm('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterFruitType('');
                setSortConfig({ key: null, direction: 'asc' });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Column Visibility Settings */}
        {showColumnSettings && (
          <div className="mb-3 p-3 border rounded">
            <h6>Column Visibility</h6>
            <div className="row">
              {Object.entries(visibleColumns).map(([column, visible]) => (
                <div key={column} className="col-md-3 form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={visible}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                  <label className="form-check-label">
                    {column.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                {visibleColumns.stock_name && (
                  <th onClick={() => handleSort('stock_name')} style={{ cursor: 'pointer' }}>
                    Stock Name {sortConfig.key === 'stock_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.fruit_name && (
                  <th onClick={() => handleSort('fruit_name')} style={{ cursor: 'pointer' }}>
                    Fruit Name {sortConfig.key === 'fruit_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.qty && (
                  <th onClick={() => handleSort('qty')} style={{ cursor: 'pointer' }}>
                    Quantity {sortConfig.key === 'qty' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.unit_price && (
                  <th onClick={() => handleSort('unit_price')} style={{ cursor: 'pointer' }}>
                    Unit Price {sortConfig.key === 'unit_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.date && (
                  <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.amount && (
                  <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                    Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleColumns.actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center text-muted py-4">
                    No data matches the current filters
                  </td>
                </tr>
              ) : (
                paginatedData.map((fruit, index) => (
                  <tr key={fruit.id || index}>
                    {visibleColumns.stock_name && <td>{fruit.stock_name}</td>}
                    {visibleColumns.fruit_name && <td>{fruit.fruit_name}</td>}
                    {visibleColumns.qty && <td>{fruit.qty}</td>}
                    {visibleColumns.unit_price && <td>{formatKenyanCurrency(fruit.unit_price)}</td>}
                    {visibleColumns.date && <td>{formatDateCell(fruit.date)}</td>}
                    {visibleColumns.amount && <td>{formatKenyanCurrency(fruit.amount)}</td>}
                    {visibleColumns.actions && (
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => onEdit(fruit)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger" 
                            onClick={() => handleDelete(fruit.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success" 
                            onClick={() => downloadSellerFruitsPDF(fruit.stock_name, [fruit])}
                            title="Download PDF"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        {filteredAndSortedData.length > 0 && (
          <div className="row mt-3">
            <div className="col-md-6">
              <div className="alert alert-info">
                <strong>Summary:</strong> {filteredAndSortedData.length} records | 
                Total Quantity: {summaryStats.totalQty} | 
                Total Amount: {formatKenyanCurrency(summaryStats.totalAmount)}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default SellerFruitsTable;
