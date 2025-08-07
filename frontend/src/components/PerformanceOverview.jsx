import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const PerformanceOverview = ({ data }) => {
  if (!data) {
    return <div className="text-center py-5">No performance data available.</div>;
  }
  const stats = data.stats;
  const fruitPerformance = data.fruitPerformance || [];
  const monthlyData = data.monthlyData || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'Ksh'
    }).format(amount);
  };

  if (!stats) return null;

  const bestPerformingFruit = fruitPerformance[0] || null;
  const totalExpenses = stats.totalPurchases + stats.totalCarExpenses + stats.totalOtherExpenses + stats.totalSalaries;

  const expenseBreakdown = [
    { name: 'Purchases', value: stats.totalPurchases, color: '#8884d8' },
    { name: 'Car Expenses', value: stats.totalCarExpenses, color: '#82ca9d' },
    { name: 'Other Expenses', value: stats.totalOtherExpenses, color: '#ffc658' },
    { name: 'Salaries', value: stats.totalSalaries, color: '#ff7300' }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Business Performance Dashboard</h2>
          <p className="text-muted">Key metrics and financial overview</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <h5 className="text-muted">Total Revenue</h5>
              <h3 className="text-success">{formatCurrency(stats.totalSales)}</h3>
              <small className="text-muted">All-time sales</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <h5 className="text-muted">Total Expenses</h5>
              <h3 className="text-danger">{formatCurrency(totalExpenses)}</h3>
              <small className="text-muted">All operational costs</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <h5 className="text-muted">Net Profit</h5>
              <h3 className={stats.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(stats.netProfit)}
              </h3>
              <small className="text-muted">Revenue - Expenses</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <h5 className="text-muted">Best Product</h5>
              <h4 className="text-primary">{bestPerformingFruit?.fruitType || 'N/A'}</h4>
              <small className="text-muted">
                {bestPerformingFruit ? formatCurrency(bestPerformingFruit.profit) : 'No data'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row mb-4 g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Monthly Financial Performance</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(month) => `Month: ${month}`}
                    />
                    <Bar dataKey="sales" fill="#28a745" name="Sales" />
                    <Bar dataKey="purchases" fill="#dc3545" name="Purchases" />
                    <Bar dataKey="expenses" fill="#ffc107" name="Expenses" />
                    <Bar dataKey="salaries" fill="#17a2b8" name="Salaries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Expense Distribution</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fruit Performance */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Product Performance Analysis</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Purchases</th>
                      <th>Sales</th>
                      <th>Profit/Loss</th>
                      <th>Margin</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fruitPerformance.map((fruit, index) => (
                      <tr key={fruit.fruitType}>
                        <td>
                          <strong>{fruit.fruitType}</strong>
                          {index === 0 && <span className="badge bg-success ms-2">Top Performer</span>}
                        </td>
                        <td>{formatCurrency(fruit.purchases)}</td>
                        <td>{formatCurrency(fruit.sales)}</td>
                        <td className={fruit.profit >= 0 ? 'text-success' : 'text-danger'}>
                          {formatCurrency(fruit.profit)}
                        </td>
                        <td className={fruit.profitMargin >= 0 ? 'text-success' : 'text-danger'}>
                          {fruit.profitMargin.toFixed(1)}%
                        </td>
                        <td>
                          <div className="progress" style={{height: '20px'}}>
                            <div 
                              className={`progress-bar ${fruit.profit >= 0 ? 'bg-success' : 'bg-danger'}`}
                              style={{width: `${Math.min(Math.abs(fruit.profitMargin), 100)}%`}}
                              role="progressbar"
                              aria-valuenow={Math.abs(fruit.profitMargin)}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {fruit.profitMargin.toFixed(1)}%
                            </div>
                          </div>
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

      {/* Fruit Profitability Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Product Profitability Comparison</h5>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fruitPerformance}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="fruitType" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="purchases" fill="#ff7300" name="Purchases" />
                    <Bar dataKey="sales" fill="#28a745" name="Sales" />
                    <Bar dataKey="profit" fill="#0088ff" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;