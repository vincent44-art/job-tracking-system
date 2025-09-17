import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
// CeoMessagesDisplay removed
import SaleForm from '../components/seller/SaleForm';
import SaleReceiptForm from '../components/SaleReceiptForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SellerFruitsForm from '../components/seller/SellerFruitsForm';
import { fetchStockTracking } from '../api/stockTracking';
import { fetchSellerFruits, deleteSellerFruit } from '../api/sellerFruits';
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

const addNewSale = async (assignmentId, saleData) => {
  // Post sale directly to /sales endpoint with JWT token
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      assignment: assignmentId,
      fruit_type: saleData.fruitType,
      quantity: saleData.quantity,
      revenue: saleData.revenue,
      sale_date: saleData.date
    }),
  });
  if (!res.ok) throw new Error('Failed to add sale');
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
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockRecords, setStockRecords] = useState([]);
  const [sellerSales, setSellerSales] = useState([]);
  const [sellerFruits, setSellerFruits] = useState([]);
  const [showSellerFruitsForm, setShowSellerFruitsForm] = useState(false);
  const [editingFruit, setEditingFruit] = useState(null);

  const [formData, setFormData] = useState({
    assignmentId: '',
    stockTrackingId: '',
    quantitySold: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0],
    fruitType: '',
    sellerName: user?.name || '',
  });

  const [pdfLoading, setPdfLoading] = useState(null); // Track which stock is generating PDF

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSellerAssignments(user?.email || user?.name);
        setAssignments(data);

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
  const userAssignments = assignments.filter(
    (assignment) =>
      assignment.sellerEmail === user?.email ||
      assignment.sellerName === user?.name
  );

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

  const downloadPDF = async (stockName, items) => {
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
      doc.text('Sales Receipt', 60, 18);
      doc.setFontSize(12);
      doc.text(`Stock: ${stockName}`, 60, 28);
      // Table: remove discount, allow qty as string
      autoTable(doc, {
        head: [["Date", "Fruit", "Qty", "Unit Price", "Amount"]],
        body: items.map((r) => [
          formatDateCell(r.date),
          r.fruit,
          (typeof r.qty === 'string' ? r.qty : (isNaN(r.qty) ? '' : String(r.qty))),
          r.unitPrice != null && !isNaN(r.unitPrice) ? formatKenyanCurrency(r.unitPrice) : '-',
          formatKenyanCurrency(r.amount || 0),
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
      doc.save(`sales_receipt_${stockName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setPdfLoading(null);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      // Enforce selection of a stocked-out stock name before adding to table
      if (!formData.stockTrackingId) {
        setError('Select a Stock Name (from Storekeeper stock-out) before adding to the table.');
        return;
      }

      setLoading(true);
      // Derive sale fields from selected stock-out record
      const selectedStock = stockRecords.find(r => String(r.id) === String(formData.stockTrackingId));
      const derivedFruitType = selectedStock?.fruitType || '';
      const derivedQuantity = selectedStock?.quantityOut || selectedStock?.quantityIn || '';
      const derivedUnitPrice = selectedStock?.amountPerKg ? parseFloat(selectedStock.amountPerKg) : 0;
      const derivedRevenue = derivedUnitPrice && derivedQuantity ? (parseFloat(derivedQuantity) * derivedUnitPrice) : 0;
      const derivedDate = selectedStock?.dateOut || new Date().toISOString().split('T')[0];

      // Use seller's user id for assignment id
      const sellerId = user?.id;
      const assignmentId = `assignment-${sellerId}`;
      // Ensure assignment exists
      await fetch(`${BASE_URL}/assignments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          seller_email: user?.email,
          fruit_type: derivedFruitType,
          assignment_id: assignmentId
        })
      });
      // Optimistically add to table
      const tempSale = {
        id: `tmp-${Date.now()}`,
        fruit_type: derivedFruitType,
        quantity: String(derivedQuantity ?? ''),
        revenue: Number(derivedRevenue || 0),
        sale_date: derivedDate,
      };
      setSellerSales(prev => [...prev, tempSale]);

      // Add sale to assignment (backend)
      const saleData = {
        fruitType: derivedFruitType,
        quantity: derivedQuantity,
        revenue: derivedRevenue,
        date: derivedDate
      };
      await addNewSale(assignmentId, saleData);

      // Refresh assignments and sales
      const data = await fetchSellerAssignments(user?.email || user?.name);
      setAssignments(data);
      // Refresh seller sales list to reflect new record
      const token2 = localStorage.getItem('access_token');
      if (token2) {
        const salesRes = await fetch(`${BASE_URL}/sales`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` }
        });
        if (salesRes.ok) {
          const body = await salesRes.json();
          setSellerSales(Array.isArray(body?.data) ? body.data : []);
        }
      }

      setFormData({
        assignmentId: '',
        stockTrackingId: '',
        quantitySold: '',
        revenue: '',
        date: new Date().toISOString().split('T')[0],
        fruitType: '',
        sellerName: user?.name || ''
      });
    } catch (err) {
      setError('Failed to add sale. Saved locally only. Please log in to sync.');
      console.error('Error adding sale:', err);
      // Keep optimistic row so the table shows the item; it will be synced on next successful submit.
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearSales = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all your sales data? This action cannot be undone.'
      )
    ) {
      try {
        setLoading(true);
        await clearSellerSales(user?.email || user?.name);
        setAssignments((prev) =>
          prev.map((assignment) => {
            if (
              assignment.sellerEmail === user?.email ||
              assignment.sellerName === user?.name
            ) {
              return { ...assignment, sales: [] };
            }
            return assignment;
          })
        );
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
    setShowSellerFruitsForm(true);
  };

  const handleEditSellerFruit = (fruit) => {
    setEditingFruit(fruit);
    setShowSellerFruitsForm(true);
  };

  const handleDeleteSellerFruit = async (fruitId) => {
    if (window.confirm('Are you sure you want to delete this seller fruit record?')) {
      try {
        await deleteSellerFruit(fruitId);
        setSellerFruits(prev => prev.filter(fruit => fruit.id !== fruitId));
      } catch (err) {
        setError('Failed to delete seller fruit. Please try again.');
        console.error('Error deleting seller fruit:', err);
      }
    }
  };

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
          {/* Sale Receipt Form below */}
          <SaleReceiptForm />
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
                      <button
                        className="btn btn-light btn-sm"
                        onClick={handleAddSellerFruit}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Add Fruit
                      </button>
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
                              Array.from(groupedByStock.entries()).map(([stockName, items]) => {
                                const totalSold = items.reduce((sum, item) => sum + (item.qty || 0), 0);
                                const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                                return (
                                  <React.Fragment key={stockName}>
                                    {items.map((fruit, index) => (
                                      <tr key={fruit.id || index}>
                                        {index === 0 && (
                                          <td rowSpan={items.length}>{stockName}</td>
                                        )}
                                        <td>{fruit.fruit}</td>
                                        <td>{fruit.qty}</td>
                                        <td>{formatKenyanCurrency(fruit.unitPrice)}</td>
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

                  {/* Seller Fruits Form Modal */}
                  {showSellerFruitsForm && (
                    <div className="mt-4">
                      <SellerFruitsForm
                        fruit={editingFruit}
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
