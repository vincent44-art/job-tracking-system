import React, { useState, useEffect } from 'react';
import {
  fetchInventory,
  fetchStockMovements,
  fetchPurchases,
  fetchSales,
  fetchOtherExpenses,
  fetchUsers
} from './apiHelpers';

const ReportsTab = () => {
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    purchases: [],
    sales: [],
    otherExpenses: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const [
          inventoryRes,
          movementsRes,
          purchasesRes,
          salesRes,
          expensesRes,
          usersRes
        ] = await Promise.all([
          fetchInventory(token),
          fetchStockMovements(token),
          fetchPurchases(),
          fetchSales(),
          fetchOtherExpenses(),
          fetchUsers()
        ]);

        setData({
          inventory: inventoryRes.data || [],
          stockMovements: movementsRes.data || [],
          purchases: purchasesRes.data || [],
          sales: salesRes.data || [],
          otherExpenses: expensesRes.data || [],
          users: usersRes.data || []
        });
      } catch (err) {
        console.error('Failed to load reports data:', err);
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

  // Aggregations for System Reports
  const salesArr = Array.isArray(data.sales) ? data.sales : [];
  const purchasesArr = Array.isArray(data.purchases) ? data.purchases : [];
  const otherExpensesArr = Array.isArray(data.otherExpenses) ? data.otherExpenses : [];

  const totalUsers = data.users.length;
  const totalInventory = data.inventory.length;
  const totalPurchases = data.purchases.length;
  const totalSales = data.sales.length;
  const totalExpenses = data.otherExpenses.length;
  const totalRevenue = salesArr.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalPurchaseCost = purchasesArr.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOtherExpenses = otherExpensesArr.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalPurchaseCost - totalOtherExpenses;

  // Fruit Reports: Group by fruit_type
  const fruitReports = {};
  purchasesArr.forEach(p => {
    const fruit = p.fruitType;
    if (!fruitReports[fruit]) fruitReports[fruit] = { purchases: 0, sales: 0, expenses: 0 };
    fruitReports[fruit].purchases += p.amount || 0;
  });
  salesArr.forEach(s => {
    const fruit = s.fruit_type;
    if (!fruitReports[fruit]) fruitReports[fruit] = { purchases: 0, sales: 0, expenses: 0 };
    fruitReports[fruit].sales += s.revenue || 0;
  });

  // Stock Reports: Per inventory item
  const inventoryArr = Array.isArray(data.inventory) ? data.inventory : [];
  const stockReports = inventoryArr.map(item => {
    const movements = data.stockMovements.filter(m => m.inventory_id === item.id);
    const inMovements = movements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0);
    const outMovements = movements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0);
    const currentStock = parseFloat(item.quantity || 0) + inMovements - outMovements;
    return {
      ...item,
      inMovements,
      outMovements,
      currentStock
    };
  });

  return (
    <div className="tab-content">
      {/* System Reports */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white">
              <h5><i className="bi bi-bar-chart me-2"></i>System Overview Report</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h6>Total Users</h6>
                      <h4>{totalUsers}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6>Total Inventory Items</h6>
                      <h4>{totalInventory}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h6>Total Transactions</h6>
                      <h4>{totalPurchases + totalSales + totalExpenses}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className={`card ${netProfit >= 0 ? 'bg-info' : 'bg-danger'} text-white`}>
                    <div className="card-body">
                      <h6>Net Profit</h6>
                      <h4>KES {netProfit.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-4">
                  <p><strong>Total Revenue:</strong> KES {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="col-md-4">
                  <p><strong>Total Purchase Cost:</strong> KES {totalPurchaseCost.toLocaleString()}</p>
                </div>
                <div className="col-md-4">
                  <p><strong>Total Other Expenses:</strong> KES {totalOtherExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fruit Reports */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white">
              <h5><i className="bi bi-apple me-2"></i>Fruit Performance Reports</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Fruit Type</th>
                      <th>Total Purchases (KES)</th>
                      <th>Total Sales (KES)</th>
                      <th>Profit (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fruitReports).map(([fruit, report]) => (
                      <tr key={fruit}>
                        <td><i className="bi bi-apple me-1 text-success"></i>{fruit}</td>
                        <td>{report.purchases.toLocaleString()}</td>
                        <td>{report.sales.toLocaleString()}</td>
                        <td className={report.sales - report.purchases >= 0 ? 'text-success' : 'text-danger'}>
                          {(report.sales - report.purchases).toLocaleString()}
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

      {/* Stock Reports */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0 fruit-card">
            <div className="card-header bg-gradient text-white">
              <h5><i className="bi bi-boxes me-2"></i>Stock Reports</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Fruit Type</th>
                      <th>Initial Quantity</th>
                      <th>In Movements</th>
                      <th>Out Movements</th>
                      <th>Current Stock</th>
                      <th>Location</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockReports.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.fruit_type}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.inMovements}</td>
                        <td>{item.outMovements}</td>
                        <td className={item.currentStock < 0 ? 'text-danger' : ''}>{item.currentStock}</td>
                        <td>{item.location}</td>
                        <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
