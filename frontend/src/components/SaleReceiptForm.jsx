import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { createSellerFruit } from '../api/sellerFruits';
import { fetchStockTracking } from '../api/stockTracking';

function generateReceiptNumber() {
  // TTL yyyyMMdd-NNN random receipt num
  const now = new Date();
  const base = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(100 + Math.random() * 900);
  return `${base}-${random}`;
}

const initialItem = { fruit: '', quantity: '', unitPrice: '', total: 0 };

const paymentMethods = ['Cash', 'M-Pesa', 'Bank Transfer', 'Cheque', 'Other'];

export default function SaleReceiptForm({ onSellerFruitsAdded }) {
  const today = new Date().toISOString().slice(0, 10);
  const [seller, setSeller] = useState({ name: 'Rymat Fruit Company', address: 'Rymat Fruit Company', phone: '' });
  const [buyer, setBuyer] = useState({ name: '', contact: '' });
  const [receiptNum, setReceiptNum] = useState(generateReceiptNumber());
  const [date, setDate] = useState(today);
  const [payment, setPayment] = useState(paymentMethods[0]);
  const [items, setItems] = useState([{ ...initialItem }]);
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [stockRecords, setStockRecords] = useState([]);
  const [selectedStockName, setSelectedStockName] = useState('');
  const [showStockSelection, setShowStockSelection] = useState(false);

  useEffect(() => {
    const loadStockRecords = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const stockRes = await fetchStockTracking(token);
          const outRecords = (stockRes.data || []).filter(r => r.dateOut);
          setStockRecords(outRecords);
        }
      } catch (err) {
        console.error('Error loading stock records:', err);
      }
    };
    loadStockRecords();
  }, []);

  function handleItemChange(idx, field, value) {
    const newItems = items.map((item, i) =>
      i === idx ? {
        ...item,
        [field]: value,
        total: (field === 'quantity' || field === 'unitPrice')
          ? (parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0) * (isNaN(Number(field === 'quantity' ? value : item.quantity)) ? 0 : parseFloat(field === 'quantity' ? value : item.quantity))
          : item.total
      } : item
    );
    setItems(newItems);
  }

  function handleAddRow() {
    setItems([...items, { ...initialItem }]);
  }
  function handleRemoveRow(idx) {
    if (items.length === 1) return; // always at least 1
    setItems(items.filter((_, i) => i !== idx));
  }

  function getSubtotal() {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  }
  function getTaxAmount() {
    const subtotal = getSubtotal();
    const taxRate = parseFloat(tax) || 0;
    return subtotal * (taxRate / 100);
  }
  function getFinalTotal() {
    const subtotal = getSubtotal();
    const taxAmount = getTaxAmount();
    const discountAmount = parseFloat(discount) || 0;
    return subtotal + taxAmount - discountAmount;
  }
  function getBalance() {
    const total = getFinalTotal();
    const received = parseFloat(amountReceived) || 0;
    return received - total;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { seller, buyer, receiptNum, date, payment, items, subtotal: getSubtotal(), tax, taxAmount: getTaxAmount(), discount, finalTotal: getFinalTotal(), amountReceived, balance: getBalance() };
    setSubmittedData(data);
    // Save to backend
    api.post('/receipts', data).catch(err => console.error('Failed to save receipt:', err));
  }

  function downloadReceipt() {
    // Async logo load
    return fetch('/logo.jpeg')
      .then(response => response.ok ? response.blob() : null)
      .then(blob => {
        if (blob) {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
        return null;
      })
      .then(logoBase64 => {
        let receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt ${receiptNum}</title>
    <style>
        body { font-family: monospace; text-align: center; }
        .logo { max-width: 100px; margin: 10px; }
        .header { font-size: 18px; font-weight: bold; }
        .details { font-size: 14px; }
        table { margin: 20px auto; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        .total { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">Sales Receipt</div>
    <div class="header">${seller.name || 'Business Name'}</div>
    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo">` : ''}
    <div class="details">${seller.address || 'N/A'} | ${seller.phone || 'N/A'}</div>
    <div class="details">Receipt #: ${receiptNum}</div>
    <div class="details">Date: ${date}</div>
    <div class="details">Payment: ${payment}</div>
    <div class="details">Buyer: ${buyer.name || 'N/A'}${buyer.contact ? ` | ${buyer.contact}` : ''}</div>
    <table>
        <thead>
            <tr>
                <th>Fruit Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
`;

    items.filter(i => i.fruit && i.quantity && i.unitPrice).forEach(i => {
      receiptHTML += `
            <tr>
                <td>${i.fruit}</td>
                <td>${i.quantity}</td>
                <td>${parseFloat(i.unitPrice).toLocaleString()}</td>
                <td>${parseFloat(i.total).toLocaleString()}</td>
            </tr>
`;
    });

    receiptHTML += `
        </tbody>
    </table>
    <div>Subtotal: KES ${getSubtotal().toLocaleString()}</div>
    ${tax ? `<div>Tax (VAT ${tax}%): KES ${getTaxAmount().toLocaleString()}</div>` : ''}
    ${discount ? `<div>Discount: KES ${parseFloat(discount).toLocaleString()}</div>` : ''}
    <div class="total">Grand Total: KES ${getFinalTotal().toLocaleString()}</div>
    ${amountReceived ? `<div>Amount Received: KES ${parseFloat(amountReceived).toLocaleString()}</div>` : ''}
    ${getBalance() !== 0 ? `<div>Balance: KES ${getBalance().toLocaleString()}</div>` : '<div>Paid in Full</div>'}
    <div class="header">Thank You for Your Business!</div>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${receiptNum}" alt="QR Code" style="margin: 10px;">
    <div>Refund Policy: Returns accepted within 7 days with receipt.</div>
    <div>Signature: ____________________</div>
</body>
</html>
`;

        // Create blob and download
        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receiptNum}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback without logo
        const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt ${receiptNum}</title>
    <style>
        body { font-family: monospace; text-align: center; }
        .header { font-size: 18px; font-weight: bold; }
        .details { font-size: 14px; }
        table { margin: 20px auto; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        .total { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">${seller.name || 'Business Name'}</div>
    <div class="details">${seller.address || 'N/A'} | ${seller.phone || 'N/A'}</div>
    <div class="details">Receipt #: ${receiptNum}</div>
    <div class="details">Date: ${date}</div>
    <div class="details">Payment: ${payment}</div>
    <div class="details">Buyer: ${buyer.name || 'N/A'}${buyer.contact ? ` | ${buyer.contact}` : ''}</div>
    <table>
        <thead>
            <tr>
                <th>Fruit Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
${items.filter(i => i.fruit && i.quantity && i.unitPrice).map(i => `
            <tr>
                <td>${i.fruit}</td>
                <td>${i.quantity}</td>
                <td>${parseFloat(i.unitPrice).toLocaleString()}</td>
                <td>${parseFloat(i.total).toLocaleString()}</td>
            </tr>
`).join('')}
        </tbody>
    </table>
    <div>Subtotal: KES ${getSubtotal().toLocaleString()}</div>
    ${tax ? `<div>Tax (VAT ${tax}%): KES ${getTaxAmount().toLocaleString()}</div>` : ''}
    ${discount ? `<div>Discount: KES ${parseFloat(discount).toLocaleString()}</div>` : ''}
    <div class="total">Grand Total: KES ${getFinalTotal().toLocaleString()}</div>
    ${amountReceived ? `<div>Amount Received: KES ${parseFloat(amountReceived).toLocaleString()}</div>` : ''}
    ${getBalance() !== 0 ? `<div>Balance: KES ${getBalance().toLocaleString()}</div>` : '<div>Paid in Full</div>'}
    <div class="header">Thank You for Your Business!</div>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${receiptNum}" alt="QR Code" style="margin: 10px;">
    <div>Refund Policy: Returns accepted within 7 days with receipt.</div>
    <div>Signature: ____________________</div>
</body>
</html>
`;

        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receiptNum}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  }

  // Removed unused showSelectStockButton, handleAddToTableAndShowSelectStock, and handleStockSelection

  // Save to seller fruits table only after stock name is selected
  const handleSaveToTable = async () => {
    if (!selectedStockName) {
      alert('Please select a stock name before saving to table.');
      setShowStockSelection(true);
      return;
    }
    if (!submittedData) {
      alert('Please preview the receipt first.');
      return;
    }
    try {
      for (const item of submittedData.items.filter(i => i.fruit && i.quantity && i.unitPrice)) {
        await createSellerFruit({
          stock_name: selectedStockName,
          fruit_name: item.fruit,
          qty: parseFloat(item.quantity),
          unit_price: parseFloat(item.unitPrice),
          date: submittedData.date,
          amount: parseFloat(item.total)
        });
      }
      alert('Items added to seller fruits table successfully!');
      setShowStockSelection(false);
      setSelectedStockName('');
      // Call parent callback to refresh table
      if (typeof onSellerFruitsAdded === 'function') {
        onSellerFruitsAdded();
      }
    } catch (err) {
      console.error('Error adding to seller fruits table:', err);
      alert('Failed to add items to table. Please try again.');
    }
  };

  return (
    <div className="card shadow-lg border-0 bg-light">
      <div className="card-header bg-primary text-white"><h4>New Sale Receipt</h4></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-2">
            <div className="col-md-4"><label className="form-label">Business Name</label>
              <input className="form-control" required value={seller.name} onChange={e => setSeller({ ...seller, name: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Seller Name</label>
              <input className="form-control" value={seller.address} onChange={e => setSeller({ ...seller, address: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Seller Phone</label>
              <input className="form-control" value={seller.phone} onChange={e => setSeller({ ...seller, phone: e.target.value })} /></div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4"><label className="form-label">Buyer Name</label>
              <input className="form-control" required value={buyer.name} onChange={e => setBuyer({ ...buyer, name: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Buyer Contact</label>
              <input className="form-control" value={buyer.contact} onChange={e => setBuyer({ ...buyer, contact: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Payment Method</label>
              <select className="form-select" value={payment} onChange={e => setPayment(e.target.value)}>{paymentMethods.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4"><label className="form-label">Receipt Number</label>
              <input className="form-control" value={receiptNum} onChange={e => setReceiptNum(e.target.value)} placeholder="Auto-generated if not entered" /></div>
            <div className="col-md-4"><label className="form-label">Date</label>
              <input className="form-control" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Discount (KES)</label>
              <input className="form-control" type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4"><label className="form-label">Tax (VAT %)</label>
              <input className="form-control" type="number" min="0" value={tax} onChange={e => setTax(e.target.value)} /></div>
            <div className="col-md-4"><label className="form-label">Amount Received (KES)</label>
              <input className="form-control" type="number" min="0" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} /></div>
          </div>
          <hr />
          <h5>Items Sold</h5>
          <table className="table table-bordered table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Fruit Name</th>
                <th>Quantity</th>
                <th>Unit Price (KES)</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td><input className="form-control" value={item.fruit} onChange={e => handleItemChange(idx, 'fruit', e.target.value)} required /></td>
                  <td><input className="form-control" type="number" min="0" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} required /></td>
                  <td><input className="form-control" type="number" min="0" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} required /></td>
                  <td>{parseFloat(item.total || 0).toLocaleString()}</td>
                  <td>
                    {items.length > 1 && <button className="btn btn-danger btn-sm" type="button" onClick={() => handleRemoveRow(idx)}>&times;</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-secondary btn-sm mb-3" type="button" onClick={handleAddRow}>Add Item</button>
          <div className="mb-2 text-end">
            <span className="me-3 fw-bold">Subtotal: </span> KES {getSubtotal().toLocaleString()}
            <span className="ms-4 me-3 fw-bold">Final Total: </span> <span className="text-primary fw-bold">KES {getFinalTotal().toLocaleString()}</span>
          </div>
          <button className="btn btn-primary" type="submit">Preview Receipt</button>
        </form>
      </div>
      {submittedData && (
        <div className="card m-3 shadow border border-secondary receipt-preview" style={{ maxWidth: 520, margin: '32px auto', fontFamily: 'monospace' }}>
          <div className="card-body">
            <div className="text-center mb-2">
              <div className="fw-bold" style={{ fontSize: 18 }}>{submittedData.seller.name || 'Business Name'}</div>
              <div style={{ fontSize: 12 }}>{submittedData.seller.address} | {submittedData.seller.phone}</div>
              <div style={{ fontSize: 12 }}>Receipt #: {submittedData.receiptNum}</div>
              <div style={{ fontSize: 12 }}>Date: {submittedData.date}</div>
              <div style={{ fontSize: 12 }}>Payment: {submittedData.payment}</div>
            </div>
            <hr />
            <div className="mb-2">
              <b>Buyer:</b> {submittedData.buyer.name} {submittedData.buyer.contact && (
                <span className="ms-2">| {submittedData.buyer.contact}</span>)}
            </div>
            <table className="table table-sm table-borderless mb-0">
              <thead>
                <tr>
                  <th>Fruit</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {submittedData.items.filter(i => i.fruit && i.quantity && i.unitPrice).map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.fruit}</td>
                    <td>{i.quantity}</td>
                    <td>{parseFloat(i.unitPrice).toLocaleString()}</td>
                    <td>{parseFloat(i.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr className="mt-1 mb-1" />
            <div className="d-flex justify-content-between"><span>Subtotal:</span><span>KES {submittedData.subtotal.toLocaleString()}</span></div>
            {submittedData.taxAmount > 0 && <div className="d-flex justify-content-between"><span>Tax (VAT {submittedData.tax}%):</span><span>KES {submittedData.taxAmount.toLocaleString()}</span></div>}
            {submittedData.discount > 0 && <div className="d-flex justify-content-between"><span>Discount:</span><span>KES {parseFloat(submittedData.discount).toLocaleString()}</span></div>}
            <div className="d-flex justify-content-between fw-bold"><span>Grand Total:</span><span>KES {submittedData.finalTotal.toLocaleString()}</span></div>
            {submittedData.amountReceived && <div className="d-flex justify-content-between"><span>Amount Received:</span><span>KES {parseFloat(submittedData.amountReceived).toLocaleString()}</span></div>}
            {submittedData.balance !== 0 && <div className="d-flex justify-content-between"><span>Balance:</span><span>KES {submittedData.balance.toLocaleString()}</span></div>}
            <div className="text-center text-success fw-bold mt-2" style={{ fontSize: 16 }}>
              Thank You for Your Business!
            </div>
            <div className="text-center mt-2">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/receipt/' + submittedData.receiptNum)}`} alt="QR Code" style={{ margin: '10px' }} />
            </div>
            <div className="text-center mt-2">
              <button className="btn btn-outline-primary" onClick={downloadReceipt}>Download Receipt</button>
              <button className="btn btn-outline-success ms-2" onClick={handleSaveToTable}>Save to Table</button>
            </div>
            {showStockSelection && (
              <div className="mt-3 p-3 border rounded bg-light">
                <h6>Select Stock Name:</h6>
                <select
                  className="form-select mb-2"
                  value={selectedStockName}
                  onChange={(e) => setSelectedStockName(e.target.value)}
                >
                  <option value="">Choose a stock name...</option>
                  {stockRecords.map((stock) => (
                    <option key={stock.id} value={stock.stockName || stock.fruitType}>
                      {stock.stockName || stock.fruitType}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={handleSaveToTable}
                  disabled={!selectedStockName}
                >
                  Confirm Save to Table
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowStockSelection(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

