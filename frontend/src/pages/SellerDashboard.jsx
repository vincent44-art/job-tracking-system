import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
// CeoMessagesDisplay removed
import SaleInvoiceForm from '../components/SaleInvoiceForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SellerFruitsForm from '../components/seller/SellerFruitsForm';
import OtherExpenseForm from '../components/OtherExpenseForm';
import { fetchStockTracking } from '../api/stockTracking';
import { fetchSellerFruits } from '../api/sellerFruits';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const BASE_URL = 'http://127.0.0.1:5000/api';

// Helpers for matching sales to stock records and formatting
const parseDate = (value) => {
  if (!value) return null;
  try { return new Date(value); } catch { return null; }
};

const matchStockForSale = (sale, stockRecords = []) => {
  const fruit = sale.fruitType || sale.fruit_type || '';
  const saleDate = parseDate(sale.date || sale.sale_date);
  const candidates = (stockRecords || []).filter((r) => (r.fruitType || '') === fruit);
  if (candidates.length === 0) return null;
  if (!saleDate) return candidates[candidates.length - 1];
  const withOutBefore = candidates
    .filter((r) => r.dateOut && parseDate(r.dateOut) && parseDate(r.dateOut) <= saleDate)
    .sort((a, b) => parseDate(b.dateOut) - parseDate(a.dateOut));
  if (withOutBefore.length > 0) return withOutBefore[0];
  const withInBefore = candidates
    .filter((r) => r.dateIn && parseDate(r.dateIn) && parseDate(r.dateIn) <= saleDate)
    .sort((a, b) => parseDate(b.dateIn) - parseDate(a.dateIn));
  if (withInBefore.length > 0) return withInBefore[0];
  return candidates[candidates.length - 1];
};

const formatDateCell = (d) => (d ? new Date(d).toLocaleDateString() : '');

const fetchSellerAssignments = async (emailOrName) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}/assignments?seller=${emailOrName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }
  );
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return await res.json();
};

const clearSellerSales = async (emailOrName) => {
  const res = await fetch(`${BASE_URL}/sales/clear?seller=${emailOrName}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear sales');
  return await res.json();
};

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockRecords, setStockRecords] = useState([]);
  const [sellerSales, setSellerSales] = useState([]);
  const [sellerFruits, setSellerFruits] = useState([]);
  const [showSellerFruitsForm, setShowSellerFruitsForm] = useState(false);
  const [editingFruit, setEditingFruit] = useState(null);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [selectedStockData, setSelectedStockData] = useState(null);

  const [pdfLoading, setPdfLoading] = useState(null); // Track which stock is generating PDF

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchSellerAssignments(user?.email || user?.name);

        // Load stock tracking records and keep only those that are stocked out
        const token = localStorage.getItem('access_token');
      if (token) {
          const stockRes = await fetchStockTracking(token);
          const outRecords = (stockRes.data || []).filter(r => r.dateOut);
          setStockRecords(outRecords);

          // Load seller sales directly for table display
          const salesRes = await fetch(`${BASE_URL}/sales`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
          });
          if (salesRes.ok) {
            const body = await salesRes.json();
            setSellerSales(Array.isArray(body?.data) ? body.data : []);
          } else {
            setSellerSales([]);
          }

          // Load seller fruits for table display
          const fruits = await fetchSellerFruits();
          setSellerFruits(Array.isArray(fruits) ? fruits : []);
        } else {
          console.warn('Missing access_token; skipping stock-tracking and sales fetch');
        }
      } catch (err) {
        setError('Failed to load sales data. Please try again later.');
        console.error('Error loading seller data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email || user?.name) {
      loadData();
    }
  }, [user?.email, user?.name]);

  // Sales are fetched directly from backend for the seller
  // Removed unused userAssignments variable

  const formatKenyanCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  // Build new grouped table data inside SellerDashboard
  const enrichedSales = useMemo(() => {
    const rows = Array.isArray(sellerSales) ? sellerSales : [];
    return rows.map((sale) => {
      const matchedStock = matchStockForSale(sale, stockRecords);
      const stockName = matchedStock?.stockName || 'Unknown';
      const unitPrice = matchedStock?.amountPerKg
        ? parseFloat(matchedStock.amountPerKg)
        : (sale.revenue && (sale.quantitySold || sale.quantity))
          ? parseFloat(sale.revenue) / parseFloat(sale.quantitySold || sale.quantity)
          : null;
      const qty = parseFloat(sale.quantitySold || sale.quantity || 0);
      const amount = sale.revenue != null ? parseFloat(sale.revenue) : (unitPrice ? unitPrice * qty : 0);
      const date = sale.date || sale.sale_date;
      const fruit = sale.fruitType || sale.fruit_type || '';
      return { stockName, date, fruit, qty, unitPrice, amount };
    });
  }, [sellerSales, stockRecords]);

  const groupedByStock = useMemo(() => {
    const map = new Map();
    for (const r of enrichedSales) {
      const key = r.stockName || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (parseDate(b.date) || 0) - (parseDate(a.date) || 0));
    }
    return map;
  }, [enrichedSales]);

  const groupedSellerFruits = useMemo(() => {
    const map = new Map();
    for (const fruit of sellerFruits) {
      const key = fruit.stock_name || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(fruit);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (parseDate(b.date) || 0) - (parseDate(a.date) || 0));
    }
    return map;
  }, [sellerFruits]);

  // Removed unused downloadPDF function

  const downloadSellerFruitsPDF = async (stockName, items) => {
    setPdfLoading(stockName);
    try {
      const doc = new jsPDF();
      // Always load logo as Base64
      const logoUrl = '/logo.jpeg';
      const getBase64FromUrl = async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Logo not found');
          const blob = await response.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.warn('Logo could not be loaded:', err);
          return null;
        }
      };
      const logoBase64 = await getBase64FromUrl(logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 10, 10, 40, 20);
      }
      doc.setFontSize(18);
      doc.text('Seller Fruits Report', 60, 18);
      doc.setFontSize(12);
      doc.text(`Stock: ${stockName}`, 60, 28);
      // Table
      autoTable(doc, {
        head: [["Fruit Name", "Quantity", "Unit Price", "Date", "Amount"]],
        body: items.map((r) => [
          r.fruit,
          r.qty,
          formatKenyanCurrency(r.unitPrice),
          formatDateCell(r.date),
          formatKenyanCurrency(r.amount),
        ]),
        startY: 35,
        styles: { fontSize: 11 },
      });
      const totalAmount = items.reduce((s, r) => s + (r.amount || 0), 0);
      autoTable(doc, {
        head: [["", "", "", "Total", formatKenyanCurrency(totalAmount)]],
        body: [],
        startY: (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 5 : 50,
        styles: { fontStyle: 'bold', fontSize: 12 },
        theme: 'plain',
      });
      doc.save(`seller_fruits_${stockName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setPdfLoading(null);
    }
  };

  // Removed unused handleSubmit function

  // Removed unused handleChange function

  const handleClearSales = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all your sales data? This action cannot be undone.'
      )
    ) {
      try {
        setLoading(true);
        await clearSellerSales(user?.email || user?.name);
      } catch (err) {
        setError('Failed to clear sales. Please try again.');
        console.error('Error clearing sales:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSellerFruit = () => {
    setEditingFruit(null);
    setSelectedStockData(null);
    setShowSellerFruitsForm(true);
  };

  const handleSelectStockForFruit = (stockName, items) => {
    // Aggregate data from the receipt items for the selected stock
    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const latestDate = items.length > 0 ? items[0].date : new Date().toISOString().split('T')[0];
    const fruitName = items.length > 0 ? items[0].fruit : '';
    const unitPrice = items.length > 0 && totalQty > 0 ? totalAmount / totalQty : 0;

    const stockData = {
      stock_name: stockName,
      fruit_name: fruitName,
      qty: totalQty,
      unit_price: unitPrice,
      date: latestDate,
      amount: totalAmount
    };

    setSelectedStockData(stockData);
    setEditingFruit(null);
    setShowSellerFruitsForm(true);
    setShowStockSelector(false);
  };

  // Removed unused handleEditSellerFruit function

  // Removed unused handleDeleteSellerFruit function

  const handleSellerFruitSave = async () => {
    try {
      const fruits = await fetchSellerFruits();
      setSellerFruits(Array.isArray(fruits) ? fruits : []);
      setShowSellerFruitsForm(false);
      setEditingFruit(null);
    } catch (err) {
      setError('Failed to refresh seller fruits data.');
      console.error('Error refreshing seller fruits:', err);
    }
  };

  const handleSellerFruitCancel = () => {
    setShowSellerFruitsForm(false);
    setEditingFruit(null);
  };

  // Function to refresh seller fruits table
  const refreshSellerFruits = async () => {
    try {
      const fruits = await fetchSellerFruits();
      setSellerFruits(Array.isArray(fruits) ? fruits : []);
    } catch (err) {
      setError('Failed to refresh seller fruits data.');
      console.error('Error refreshing seller fruits:', err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-danger" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          {/* Sale Invoice Form below */}
          <SaleInvoiceForm onSellerFruitsAdded={refreshSellerFruits} />
          <hr />

          {/* Other Expenses Form */}
          <OtherExpenseForm />
          <hr />
          {/* SaleForm removed */}
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <SalesTableHeader
              userSales={sellerSales}
              clearAllSales={handleClearSales}
              loading={loading}
            />
            <div className="card-body">
              {loading && sellerSales.length === 0 ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>

                  {/* Seller Fruits Table */}
                  <div className="card mt-4 shadow-sm">
                    <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Seller Fruits Table</h5>
                      <div>
                        <button
                          className="btn btn-light btn-sm me-2"
                          onClick={() => setShowStockSelector(true)}
                        >
                          <i className="bi bi-list-ul me-1"></i>
                          Select Stock
                        </button>
                        <button
                          className="btn btn-light btn-sm"
                          onClick={handleAddSellerFruit}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Add Fruit
                        </button>
                      </div>
                    </div>
                    <div className="card-body table-responsive">
                      <table className="table table-striped table-hover align-middle">
                          <thead className="table-dark">
                            <tr>
                              <th>Stock Name</th>
                              <th>Fruit Name</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Total Sold</th>
                              <th>Download PDF</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sellerFruits.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center text-muted py-4">
                                  No seller fruits data available
                                </td>
                              </tr>
                            ) : (
                              Array.from(groupedSellerFruits.entries()).map(([stockName, items]) => {
                                const totalSold = items.reduce((sum, item) => sum + (item.qty || 0), 0);
                                // totalAmount is used below for display, so keep it
                                return (
                                  <React.Fragment key={stockName}>
                                    {items.map((fruit, index) => (
                                      <tr key={fruit.id || index}>
                                        {index === 0 && (
                                          <td rowSpan={items.length}>{stockName}</td>
                                        )}
                                        <td>{fruit.fruit_name}</td>
                                        <td>{fruit.qty}</td>
                                        <td>{formatKenyanCurrency(fruit.unit_price)}</td>
                                        <td>{formatDateCell(fruit.date)}</td>
                                        <td>{formatKenyanCurrency(fruit.amount)}</td>
                                        {index === 0 && (
                                          <>
                                            <td rowSpan={items.length}>{totalSold}</td>
                                            <td rowSpan={items.length}>
                                              <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => downloadSellerFruitsPDF(stockName, items)}
                                                disabled={pdfLoading === stockName}
                                              >
                                                {pdfLoading === stockName ? 'Generating...' : 'Download PDF'}
                                              </button>
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })
                            )}
                          </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Stock Selector Modal */}
                  {showStockSelector && (
                    <div className="mt-4">
                      <div className="card shadow-sm">
                        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Select Stock from Receipt</h5>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setShowStockSelector(false)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                        <div className="card-body">
                          {Array.from(groupedByStock.entries()).length === 0 ? (
                            <p className="text-muted">No stocks available from receipts.</p>
                          ) : (
                            <div className="list-group">
                              {Array.from(groupedByStock.entries()).map(([stockName, items]) => {
                                const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
                                const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                                return (
                                  <button
                                    key={stockName}
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                    onClick={() => handleSelectStockForFruit(stockName, items)}
                                  >
                                    <div>
                                      <strong>{stockName}</strong>
                                      <br />
                                      <small className="text-muted">
                                        Fruit: {items[0]?.fruit || 'N/A'} | Qty: {totalQty} | Amount: {formatKenyanCurrency(totalAmount)}
                                      </small>
                                    </div>
                                    <i className="bi bi-chevron-right"></i>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seller Fruits Form Modal */}
                  {showSellerFruitsForm && (
                    <div className="mt-4">
                      <SellerFruitsForm
                        fruit={editingFruit}
                        initialData={selectedStockData}
                        onSave={handleSellerFruitSave}
                        onCancel={handleSellerFruitCancel}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
