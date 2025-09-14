import React, { useState } from 'react';

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

export default function SaleReceiptForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [seller, setSeller] = useState({ name: '', address: '', phone: '' });
  const [buyer, setBuyer] = useState({ name: '', contact: '' });
  const [receiptNum, setReceiptNum] = useState(generateReceiptNumber());
  const [date, setDate] = useState(today);
  const [payment, setPayment] = useState(paymentMethods[0]);
  const [items, setItems] = useState([{ ...initialItem }]);
  const [discount, setDiscount] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

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
  function getFinalTotal() {
    return getSubtotal(); // No discount
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedData({ seller, buyer, receiptNum, date, payment, items, subtotal: getSubtotal(), discount, finalTotal: getFinalTotal() });
  }

  function downloadReceipt() {
    let receiptText = '';

    // Header
    receiptText += `${seller.name || 'Business Name'}\n`;
    receiptText += `${seller.address || 'N/A'} | ${seller.phone || 'N/A'}\n`;
    receiptText += `Receipt #: ${receiptNum}\n`;
    receiptText += `Date: ${date}\n`;
    receiptText += `Payment: ${payment}\n`;
    receiptText += `Buyer: ${buyer.name || 'N/A'}`;
    if (buyer.contact) receiptText += ` | ${buyer.contact}`;
    receiptText += '\n\n';

    // Items header
    receiptText += 'Fruit Name     Qty   Unit Price   Total\n';
    receiptText += '--------------------------------------\n';

    // Items
    items.filter(i => i.fruit && i.quantity && i.unitPrice).forEach(i => {
      const fruit = i.fruit.padEnd(15);
      const qty = i.quantity.toString().padStart(5);
      const unitPrice = parseFloat(i.unitPrice).toLocaleString().padStart(10);
      const total = parseFloat(i.total).toLocaleString().padStart(8);
      receiptText += `${fruit}${qty}${unitPrice}${total}\n`;
    });

    receiptText += '\n';
    receiptText += `Subtotal: KES ${getSubtotal().toLocaleString()}\n`;
    receiptText += `TOTAL: KES ${getFinalTotal().toLocaleString()}\n\n`;
    receiptText += 'Thank You for Your Business!\n';

    // Create blob and download
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receiptNum}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card shadow-lg border-0 bg-light">
      <div className="card-header bg-primary text-white"><h4>New Sale Receipt</h4></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-2">
            <div className="col-md-4"><label className="form-label">Seller Business Name</label>
              <input className="form-control" required value={seller.name} onChange={e => setSeller({ ...seller, name: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Seller Address</label>
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
            <div className="d-flex justify-content-between fw-bold"><span>Total:</span><span>KES {submittedData.finalTotal.toLocaleString()}</span></div>
            <div className="text-center text-success fw-bold mt-2" style={{ fontSize: 16 }}>
              Thank You for Your Business!
            </div>
            <div className="text-center mt-2">
              <button className="btn btn-outline-primary" onClick={downloadReceipt}>Download Receipt</button>
            </div>
          </div>
        </div>)}
    </div>
  );
}
