import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchInventory,
  fetchStockMovements,
  fetchPurchases,
  fetchSales,
  fetchOtherExpenses
} from './apiHelpers';
import { fetchStockTracking, fetchStockTrackingAggregated } from '../api/stockTracking';

const StockTrackerTab = () => {
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    purchases: [],
    sales: [],
    otherExpenses: [],
    stockTracking: [],
    stockExpenses: [],
    fruitProfitability: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const goToStockTrackingRecords = () => {
    navigate('/stock-tracking-records');
  } 

  useEffect(() => {
    const toCamel = s => s.replace(/([-_][a-z])/g, g => g.toUpperCase().replace('-', '').replace('_', ''));
    const normalizeKeys = obj => {
      if (Array.isArray(obj)) return obj.map(normalizeKeys);
      if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), normalizeKeys(v)]));
      }
      return obj;
    };
    const loadData = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const [
          inventoryRes,
          movementsRes,
          purchasesRes,
          salesRes,
          expensesRes,
          stockTrackingRes,
          aggregatedRes
        ] = await Promise.all([
          fetchInventory(token),
          fetchStockMovements(token),
          fetchPurchases(),
          fetchSales(),
          fetchOtherExpenses(),
          fetchStockTracking(token),
          fetchStockTrackingAggregated(token)
        ]);

        setData({
          inventory: normalizeKeys(Array.isArray(inventoryRes.data?.data) ? inventoryRes.data.data : inventoryRes.data || []),
          stockMovements: normalizeKeys(Array.isArray(movementsRes.data?.data) ? movementsRes.data.data : movementsRes.data || []),
          purchases: normalizeKeys(Array.isArray(purchasesRes.data?.data) ? purchasesRes.data.data : purchasesRes.data || []),
          sales: normalizeKeys(Array.isArray(salesRes.data?.data) ? salesRes.data.data : salesRes.data || []),
          otherExpenses: normalizeKeys(Array.isArray(expensesRes.data?.data) ? expensesRes.data.data : expensesRes.data || []),
          // Use backend data directly for stockTracking, fallback to []
          stockTracking: Array.isArray(stockTrackingRes.data?.data) ? stockTrackingRes.data.data : (Array.isArray(stockTrackingRes.data) ? stockTrackingRes.data : []),
          stockExpenses: normalizeKeys(Array.isArray(aggregatedRes.data?.stock_expenses) ? aggregatedRes.data.stock_expenses : []),
          fruitProfitability: normalizeKeys(Array.isArray(aggregatedRes.data?.fruit_profitability) ? aggregatedRes.data.fruit_profitability : [])
        });
      } catch (err) {
        console.error('Failed to load stock tracker data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const purchasesArr = Array.isArray(data.purchases) ? data.purchases : [];
  const salesArr = Array.isArray(data.sales) ? data.sales : [];
  const otherExpensesArr = Array.isArray(data.otherExpenses) ? data.otherExpenses : [];
  const stockMovementsArr = Array.isArray(data.stockMovements) ? data.stockMovements : [];
  const inventoryArr = Array.isArray(data.inventory) ? data.inventory : [];

  // Aggregations
  const totalBought = purchasesArr.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalSold = salesArr.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalExpenses = otherExpensesArr.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalSold - totalBought - totalExpenses;

  // Stock usage: sum of 'out' movements
  const totalUsed = stockMovementsArr
    .filter(m => m.movement_type === 'out')
    .reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0);

  // Group inventory by fruit_type for summary
  const stockSummary = {};
  inventoryArr.forEach(item => {
    const fruit = item.fruit_type;
    if (!stockSummary[fruit]) {
      stockSummary[fruit] = {
        totalQuantity: 0,
        entries: [],
        used: 0
      };
    }
    stockSummary[fruit].totalQuantity += parseFloat(item.quantity || 0);
    stockSummary[fruit].entries.push({
      id: item.id,
      quantity: item.quantity,
      entryDate: item.created_at,
      day: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'long' })
    });
  });

  // Add usage per fruit
  stockMovementsArr.forEach(m => {
    const fruit = m.inventory_item_name || 'Unknown';
    if (stockSummary[fruit] && m.movement_type === 'out') {
      stockSummary[fruit].used += parseFloat(m.quantity || 0);
    }
  });

  return (
    <div className="tab-content">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-primary" onClick={goToStockTrackingRecords}>
          Go to Stock Tracking Records
        </button>
      </div>
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-cash me-2"></i>Total Bought</h5>
              <h3>KES {totalBought.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-currency-dollar me-2"></i>Total Sold</h5>
              <h3>KES {totalSold.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-receipt me-2"></i>Total Expenses</h5>
              <h3>KES {totalExpenses.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card ${profit >= 0 ? 'bg-info' : 'bg-danger'} text-white shadow-lg`}>
            <div className="card-body">
              <h5><i className="bi bi-graph-up me-2"></i>Profit</h5>
              <h3>KES {profit.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Usage */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-secondary text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-arrow-down-circle me-2"></i>Total Stock Used</h5>
              <h3>{totalUsed.toLocaleString()} units</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-dark text-white shadow-lg">
            <div className="card-body">
              <h5><i className="bi bi-boxes me-2"></i>Total Inventory Items</h5>
              <h3>{data.inventory.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Summary by Fruit Type */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white">
              <h5><i className="bi bi-bar-chart me-2"></i>Stock Summary by Fruit Type</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Fruit Type</th>
                      <th>Total Quantity</th>
                      <th>Used</th>
                      <th>Remaining</th>
                      <th>Entry Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stockSummary).map(([fruit, summary]) => (
                      <tr key={fruit}>
                        <td><i className="bi bi-apple me-1 text-success"></i>{fruit}</td>
                        <td>{summary.totalQuantity}</td>
                        <td>{summary.used}</td>
                        <td>{summary.totalQuantity - summary.used}</td>
                        <td>
                          {summary.entries.map(entry => (
                            <div key={entry.id}>
                              {entry.day} ({entry.quantity} {entry.unit || 'units'})
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Expenses Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white">
              <h5><i className="bi bi-cash-coin me-2"></i>Stock Expenses & Profit Analysis</h5>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Stock Name</th>
                    <th>Fruit Type</th>
                    <th>Purchase Cost</th>
                    <th>Storage Usage</th>
                    <th>Transport Costs</th>
                    <th>Other Expenses</th>
                    <th>Revenue</th>
                    <th>Profit/Loss</th>
                    <th>Date In</th>
                    <th>Date Out</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stockExpenses && data.stockExpenses.length > 0 ? (
                    <>
                      {data.stockExpenses.map((stock, idx) => (
                        <tr key={stock.stockId || stock.stock_id || idx}>
                          <td>{stock.stockName || stock.stock_name}</td>
                          <td>{stock.fruitType || stock.fruit_type}</td>
                          <td>KES {stock.purchaseCost?.toLocaleString() || stock.purchase_cost?.toLocaleString() || 0}</td>
                          <td>{stock.storageUsage?.toLocaleString() || stock.storage_usage?.toLocaleString() || 0} units</td>
                          <td>KES {stock.transportCosts?.toLocaleString() || stock.transport_costs?.toLocaleString() || 0}</td>
                          <td>KES {stock.otherExpenses?.toLocaleString() || stock.other_expenses?.toLocaleString() || 0}</td>
                          <td>KES {stock.revenue?.toLocaleString() || 0}</td>
                          <td className={(stock.profitLoss ?? stock.profit_loss) >= 0 ? 'text-success' : 'text-danger'}>
                            KES {(stock.profitLoss ?? stock.profit_loss ?? 0).toLocaleString()}
                          </td>
                          <td>{stock.dateIn || stock.date_in || 'N/A'}</td>
                          <td>{stock.dateOut || stock.date_out || 'N/A'}</td>
                        </tr>
                      ))}
                      {/* Grand total row */}
                      <tr className="table-info fw-bold">
                        <td colSpan="6" className="text-end">Grand Total:</td>
                        <td>
                          KES {data.stockExpenses.reduce((sum, s) => sum + (s.revenue || 0), 0).toLocaleString()}
                        </td>
                        <td>
                          KES {data.stockExpenses.reduce((sum, s) => sum + (s.profit_loss || 0), 0).toLocaleString()}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </>
                  ) : (
                    <tr><td colSpan="10" className="text-center text-muted">No stock expense data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Fruit Profitability Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-info text-white">
              <h5><i className="bi bi-graph-up me-2"></i>Fruit Profitability Summary</h5>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Fruit Name</th>
                    <th>Total Purchased</th>
                    <th>Total Sold</th>
                    <th>Total Revenue</th>
                    <th>Total Costs</th>
                    <th>Profit Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fruitProfitability && data.fruitProfitability.length > 0 ? (
                    data.fruitProfitability.map((fruit, idx) => (
                      <tr key={fruit.fruit_name || idx}>
                        <td>{fruit.fruit_name}</td>
                        <td>{fruit.total_purchased?.toLocaleString() || 0} units</td>
                        <td>{fruit.total_sold?.toLocaleString() || 0} units</td>
                        <td>KES {fruit.total_revenue?.toLocaleString() || 0}</td>
                        <td>KES {fruit.total_costs?.toLocaleString() || 0}</td>
                        <td className={fruit.profit_margin >= 0 ? 'text-success' : 'text-danger'}>
                          KES {fruit.profit_margin?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center text-muted">No fruit profitability data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

  {/* Stock Tracking Table removed: now on its own page */}
    </div>
  );
};

export default StockTrackerTab;
