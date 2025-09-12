import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
// CeoMessagesDisplay removed
import SaleForm from '../components/seller/SaleForm';
import SaleReceiptForm from '../components/SaleReceiptForm';
import SalesTableHeader from '../components/seller/SalesTableHeader';
import SalesSummary from '../components/seller/SalesSummary';
import { fetchStockTracking } from '../api/stockTracking';
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
          {/* Existing Simple SaleForm still available if needed */}
          <SaleForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            userAssignments={userAssignments}
            user={user}
            loading={loading}
            stockRecords={stockRecords}
          />
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
                  {/* New Seller Sales Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Stock Name</th>
                          <th>Date</th>
                          <th>Fruit</th>
                          <th>Qty</th>
                          <th>Qty per Unit</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(groupedByStock.entries()).length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">
                              <i className="bi bi-inbox display-4 d-block mb-2"></i>
                              No sales recorded yet
                            </td>
                          </tr>
                        ) : (
                          Array.from(groupedByStock.entries()).map(([stockName, items]) => {
                            const totalQty = items.reduce((s, r) => s + (isNaN(r.qty) ? 0 : r.qty), 0);
                            const totalAmount = items.reduce((s, r) => s + (r.amount || 0), 0);
                            return (
                              <React.Fragment key={stockName}>
                                <tr>
                                  <td colSpan={6} className="bg-light fw-bold">
                                    {stockName}
                                    <button
                                      className="btn btn-sm btn-outline-primary ms-2"
                                      onClick={async (e) => { e.preventDefault(); await downloadPDF(stockName, items); }}
                                      disabled={pdfLoading === stockName}
                                    >
                                      {pdfLoading === stockName ? 'Generating PDF...' : 'Download PDF'}
                                    </button>
                                  </td>
                                </tr>
                                {items.map((r, idx) => (
                                  <tr key={`${stockName}-${idx}`}>
                                    <td>{r.stockName}</td>
                                    <td>{formatDateCell(r.date)}</td>
                                    <td><span className="badge bg-primary">{r.fruit}</span></td>
                                    <td>{isNaN(r.qty) ? '' : r.qty}</td>
                                    <td>{r.unitPrice != null && !isNaN(r.unitPrice) ? formatKenyanCurrency(r.unitPrice) : '-'}</td>
                                    <td className="fw-bold text-success">{formatKenyanCurrency(r.amount || 0)}</td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan={3} className="text-end fw-bold">Total Sold</td>
                                  <td className="fw-bold">{totalQty}</td>
                                  <td></td>
                                  <td className="fw-bold text-success">{formatKenyanCurrency(totalAmount)}</td>
                                </tr>
                                <tr><td colSpan={6} style={{ background: '#f8f9fa' }}></td></tr>
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <SalesSummary
                    userSales={sellerSales}
                    formatKenyanCurrency={formatKenyanCurrency}
                  />
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
