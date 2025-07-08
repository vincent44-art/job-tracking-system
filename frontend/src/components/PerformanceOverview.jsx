
import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PerformanceOverview = () => {
  const { getStats, getFruitPerformance, purchases, assignments, carExpenses, otherExpenses, salaryPayments } = useData();
  
  const stats = getStats();
  const fruitPerformance = getFruitPerformance();
  const bestPerformingFruit = fruitPerformance[0];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const expenseBreakdown = [
    { name: 'Purchases', value: stats.totalPurchases, color: '#8884d8' },
    { name: 'Car Expenses', value: stats.totalCarExpenses, color: '#82ca9d' },
    { name: 'Other Expenses', value: stats.totalOtherExpenses, color: '#ffc658' },
    { name: 'Salaries', value: stats.totalSalaries, color: '#ff7300' }
  ];

  const monthlyData = () => {
    const months = {};
    
    // Process purchases
    purchases.forEach(purchase => {
      const month = purchase.date.substring(0, 7); // YYYY-MM
      if (!months[month]) months[month] = { month, purchases: 0, sales: 0, expenses: 0, salaries: 0 };
      months[month].purchases += purchase.amount;
    });
    
    // Process sales
    assignments.forEach(assignment => {
      assignment.sales.forEach(sale => {
        const month = sale.date.substring(0, 7);
        if (!months[month]) months[month] = { month, purchases: 0, sales: 0, expenses: 0, salaries: 0 };
        months[month].sales += sale.revenue;
      });
    });
    
    // Process expenses
    [...carExpenses, ...otherExpenses].forEach(expense => {
      const month = expense.date.substring(0, 7);
      if (!months[month]) months[month] = { month, purchases: 0, sales: 0, expenses: 0, salaries: 0 };
      months[month].expenses += expense.amount;
    });
    
    // Process salaries
    salaryPayments.forEach(payment => {
      const month = payment.paymentDate.substring(0, 7);
      if (!months[month]) months[month] = { month, purchases: 0, sales: 0, expenses: 0, salaries: 0 };
      months[month].salaries += payment.monthlySalary;
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  };

  return (
    <div className="performance-overview">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-4">Performance Overview</h2>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card card-custom">
            <div className="card-body text-center">
              <h5 className="text-gradient">Total Revenue</h5>
              <h3 className="text-success">{formatCurrency(stats.totalSales)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom">
            <div className="card-body text-center">
              <h5 className="text-gradient">Total Expenses</h5>
              <h3 className="text-danger">{formatCurrency(stats.totalPurchases + stats.totalCarExpenses + stats.totalOtherExpenses + stats.totalSalaries)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom">
            <div className="card-body text-center">
              <h5 className="text-gradient">Net Profit</h5>
              <h3 className={stats.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(stats.netProfit)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-custom">
            <div className="card-body text-center">
              <h5 className="text-gradient">Best Fruit</h5>
              <h4 className="text-primary">{bestPerformingFruit?.fruitType || 'N/A'}</h4>
              <small className="text-muted">
                {bestPerformingFruit ? formatCurrency(bestPerformingFruit.profit) : 'No data'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Fruit Performance Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Fruit Performance Analysis</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fruit Type</th>
                      <th>Purchases</th>
                      <th>Sales</th>
                      <th>Profit/Loss</th>
                      <th>Profit Margin</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fruitPerformance.map((fruit, index) => (
                      <tr key={fruit.fruitType}>
                        <td>
                          <strong>{fruit.fruitType}</strong>
                          {index === 0 && <span className="badge bg-success ms-2">Best</span>}
                        </td>
                        <td>{formatCurrency(fruit.purchases)}</td>
                        <td>{formatCurrency(fruit.sales)}</td>
                        <td className={fruit.profit >= 0 ? 'text-success' : 'text-danger'}>
                          {formatCurrency(fruit.profit)}
                        </td>
                        <td className={fruit.profitMargin >= 0 ? 'text-success' : 'text-danger'}>
                          {fruit.profitMargin.toFixed(2)}%
                        </td>
                        <td>
                          <div className="progress" style={{height: '20px'}}>
                            <div 
                              className={`progress-bar ${fruit.profit >= 0 ? 'bg-success' : 'bg-danger'}`}
                              style={{width: `${Math.min(Math.abs(fruit.profitMargin), 100)}%`}}
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

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Monthly Financial Overview</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="sales" fill="#28a745" name="Sales" />
                  <Bar dataKey="purchases" fill="#dc3545" name="Purchases" />
                  <Bar dataKey="expenses" fill="#ffc107" name="Expenses" />
                  <Bar dataKey="salaries" fill="#17a2b8" name="Salaries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Expense Breakdown</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
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

      {/* Fruit Performance Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body">
              <h5 className="card-title text-gradient">Fruit Profitability Comparison</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fruitPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fruitType" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="purchases" fill="#ff7300" name="Purchases" />
                  <Bar dataKey="sales" fill="#00ff00" name="Sales" />
                  <Bar dataKey="profit" fill="#0088ff" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;
