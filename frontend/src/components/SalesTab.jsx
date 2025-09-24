import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Plus, Download } from 'lucide-react';

import { fetchStockTracking } from '../api/stockTracking';
import { fetchSellerFruits } from '../api/sellerFruits';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper functions for matching sales to stock records and formatting
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

const formatKenyanCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0);
};

const SalesTab = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stockName: '',
    fruitName: '',
    qty: '',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [stockRecords, setStockRecords] = useState([]);
  const [sellerFruits, setSellerFruits] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(null);

  // Build enriched sales data with stock tracking information from seller_fruits
  const enrichedSales = useMemo(() => {
    const rows = Array.isArray(sellerFruits) ? sellerFruits : [];
    return rows.map((fruit) => {
      const matchedStock = matchStockForSale(fruit, stockRecords);
      const stockName = matchedStock?.stockName || fruit.stock_name || 'Unknown';
      const unitPrice = fruit.unit_price || 0;
      const qty = parseFloat(fruit.qty || 0);
      const amount = fruit.amount || (unitPrice * qty);
      const date = fruit.date;
      const fruitName = fruit.fruit_name || '';
      const sellerName = fruit.creator_email || 'N/A';
      return { stockName, date, fruit: fruitName, qty, unitPrice, amount, sellerName };
    });
  }, [sellerFruits, stockRecords]);

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

  // Fetch seller fruits data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('SalesTab: Starting to fetch seller fruits data...');
        setLoading(true);

        // Fetch seller fruits data for enhanced table
        try {
          const fruits = await fetchSellerFruits();
          setSellerFruits(Array.isArray(fruits) ? fruits : []);
          console.log('SalesTab: Seller fruits loaded:', fruits.length);
        } catch (fruitsError) {
          console.warn('SalesTab: Failed to fetch seller fruits data:', fruitsError);
          setSellerFruits([]);
        }

        // Fetch stock tracking data for enrichment
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const stockRes = await fetchStockTracking(token);
            const outRecords = (stockRes.data || []).filter(r => r.dateOut);
            setStockRecords(outRecords);
            console.log('SalesTab: Stock records loaded:', outRecords.length);
          }
        } catch (stockError) {
          console.warn('SalesTab: Failed to fetch stock tracking data:', stockError);
        }

      } catch (error) {
        console.error('SalesTab: Failed to fetch seller fruits data:', error);
        setSellerFruits([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('SalesTab: Submitting form with data:', formData);

      // Calculate amount from qty and unit price
      const qty = parseFloat(formData.qty);
      const unitPrice = parseFloat(formData.unitPrice);
      const amount = qty * unitPrice;

      // Create seller fruit data
      const fruitData = {
        stock_name: formData.stockName,
        fruit_name: formData.fruitName,
        qty: qty,
        unit_price: unitPrice,
        date: formData.date,
        amount: amount
      };

      console.log('SalesTab: Sending seller fruit data to API:', fruitData);

      // Use the fetch API directly to POST to /seller_fruits
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:5000/api/seller_fruits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(fruitData)
      });

      if (!response.ok) {
        throw new Error('Failed to create seller fruit record');
      }

      const newFruit = await response.json();
      console.log('SalesTab: Seller fruit created successfully:', newFruit);

      // Refresh the seller fruits data
      const fruits = await fetchSellerFruits();
      setSellerFruits(Array.isArray(fruits) ? fruits : []);

      setFormData({
        stockName: '',
        fruitName: '',
        qty: '',
        unitPrice: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    } catch (error) {
      console.error('SalesTab: Failed to create seller fruit:', error);
    }
  };

  const clearAllSales = async () => {
    if (window.confirm('Are you sure you want to clear all seller fruits data? This action cannot be undone.')) {
      try {
        // Use the fetch API to clear all seller fruits
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://127.0.0.1:5000/api/seller_fruits/clear', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error('Failed to clear seller fruits data');
        }

        setSellerFruits([]);
      } catch (error) {
        console.error('Failed to clear seller fruits:', error);
      }
    }
  };

  // PDF generation function
  const downloadSalesPDF = async (stockName, items) => {
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
        head: [["Creator Email", "Stock Name", "Fruit Name", "Quantity", "Unit Price", "Date", "Amount"]],
        body: items.map((r) => [
          r.sellerName,
          r.stockName,
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
      doc.save(`seller_fruits_report_${stockName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setPdfLoading(null);
    }
  };



  const filteredSales = enrichedSales.filter(sale =>
    sale.fruit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.stockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    console.log('SalesTab: Loading state...');
    return <div className="text-center py-5">Loading seller fruits data...</div>;
  }

  console.log('SalesTab: Rendering with seller fruits data:', sellerFruits);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Seller Fruits Management</h2>
        <div>
          <button
            className="btn btn-gradient me-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="me-1" />
            Add Seller Fruit
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={clearAllSales}
            disabled={sellerFruits.length === 0}
          >
            <Trash2 size={16} className="me-1" />
            Clear All
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body">
            <h5 className="card-title text-gradient">Record New Seller Fruit</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.stockName}
                    onChange={(e) => setFormData({...formData, stockName: e.target.value})}
                    placeholder="e.g., Stock A, Stock B"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fruit Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fruitName}
                    onChange={(e) => setFormData({...formData, fruitName: e.target.value})}
                    list="fruits"
                    required
                  />
                  <datalist id="fruits">
                    <option value="Sweet banana" />
                    <option value="Kampala" />
                    <option value="Cavendish" />
                    <option value="Plantain" />
                    <option value="Matoke" />
                    <option value="American sweet potatoes" />
                    <option value="White sweet potatoes" />
                    <option value="Red sweet potatoes" />
                    <option value="Local Avocados" />
                    <option value="Hass Avocados" />
                    <option value="Oranges" />
                    <option value="Pixie" />
                    <option value="Lemons" />
                  </datalist>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.qty}
                    onChange={(e) => setFormData({...formData, qty: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Unit Price (KES)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    min="0"
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-gradient">
                  Record Seller Fruit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card card-custom mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative flex-grow-1">
              <Search className="position-absolute" style={{left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6c757d'}} />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search seller fruits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sales Table */}
      <div className="card card-custom mt-4 shadow-sm">
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Enhanced Seller Fruits Table</h5>
          <div>
            <button
              className="btn btn-light btn-sm me-2"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={16} className="me-1" />
              Add Seller Fruit
            </button>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={clearAllSales}
              disabled={sellerFruits.length === 0}
            >
              <Trash2 size={16} className="me-1" />
              Clear All
            </button>
          </div>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Seller Name</th>
                <th>Stock Name</th>
                <th>Fruit Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Download PDF</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No seller fruits data available
                  </td>
                </tr>
              ) : (
                Object.entries(groupedByStock).map(([stockName, items]) => (
                  <React.Fragment key={stockName}>
                    {items.map((sale, index) => (
                      <tr key={`${stockName}-${index}`}>
                        <td>{sale.sellerName}</td>
                        <td>{sale.stockName}</td>
                        <td>{sale.fruit}</td>
                        <td>{sale.qty}</td>
                        <td>{formatKenyanCurrency(sale.unitPrice)}</td>
                        <td>{formatDateCell(sale.date)}</td>
                        <td>{formatKenyanCurrency(sale.amount)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => downloadSalesPDF(sale.stockName, [sale])}
                            disabled={pdfLoading === sale.stockName}
                          >
                            <Download size={14} />
                            {pdfLoading === sale.stockName ? 'Generating...' : ' PDF'}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this seller fruit record?')) {
                                // Find the original seller fruit to delete
                                const originalFruit = sellerFruits.find(f => {
                                  const matchedStock = matchStockForSale(f, stockRecords);
                                  const stockName = matchedStock?.stockName || f.stock_name || 'Unknown';
                                  const fruit = f.fruit_name || '';
                                  const sellerName = f.creator_email || 'N/A';
                                  return stockName === sale.stockName && fruit === sale.fruit && sellerName === sale.sellerName;
                                });
                                if (originalFruit) {
                                  // Use fetch API to delete the seller fruit
                                  fetch(`http://127.0.0.1:5000/api/seller_fruits/${originalFruit.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                    }
                                  }).then(response => {
                                    if (response.ok) {
                                      setSellerFruits(sellerFruits.filter(f => f.id !== originalFruit.id));
                                    } else {
                                      console.error('Failed to delete seller fruit');
                                    }
                                  }).catch(error => {
                                    console.error('Failed to delete seller fruit:', error);
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Total row for each stock */}
                    <tr className="table-info">
                      <td colSpan="6" className="text-end fw-bold">Total for {stockName}:</td>
                      <td className="fw-bold">{formatKenyanCurrency(items.reduce((sum, item) => sum + (item.amount || 0), 0))}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => downloadSalesPDF(stockName, items)}
                          disabled={pdfLoading === stockName}
                        >
                          <Download size={14} />
                          {pdfLoading === stockName ? 'Generating...' : ' PDF'}
                        </button>
                      </td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
