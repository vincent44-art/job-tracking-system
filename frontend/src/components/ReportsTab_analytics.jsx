import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Activity
} from 'lucide-react';
import {
  fetchInventory,
  fetchStockMovements,
  fetchPurchases,
  fetchSales,
  fetchOtherExpenses,
  fetchUsers
} from './apiHelpers';
import { fetchStockTracking } from '../api/stockTracking';
import { fetchSellerFruits } from '../api/sellerFruits';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ArcElement
);

const ReportsTabAnalytics = () => {
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    purchases: [],
    sales: [],
    otherExpenses: [],
    users: [],
    stockTracking: [],
    sellerFruits: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    const loadData = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required. Please log in to access reports.');
        setLoading(false);
        return;
      }

      try {
          const [
            inventoryRes,
            movementsRes,
            purchasesRes,
            salesRes,
            expensesRes,
            usersRes,
            stockTrackingRes,
            sellerFruitsRes
          ] = await Promise.all([
            fetchInventory(token),
            fetchStockMovements(token),
            fetchPurchases(token),
            fetchSales(null, token),
            fetchOtherExpenses(token),
            fetchUsers(token),
            fetchStockTracking(token),
            fetchSellerFruits(token)
          ]);

        setData({
          inventory: Array.isArray(inventoryRes.data?.data) ? inventoryRes.data.data : inventoryRes.data || [],
          stockMovements: Array.isArray(movementsRes.data?.data) ? movementsRes.data.data : movementsRes.data || [],
          purchases: Array.isArray(purchasesRes.data?.data) ? purchasesRes.data.data : purchasesRes.data || [],
          sales: Array.isArray(salesRes) ? salesRes : [],
          otherExpenses: Array.isArray(expensesRes.data?.data) ? expensesRes.data.data : expensesRes.data || [],
          users: Array.isArray(usersRes.data?.data) ? usersRes.data.data : usersRes.data || [],
          stockTracking: Array.isArray(stockTrackingRes.data?.data) ? stockTrackingRes.data.data : stockTrackingRes.data || [],
          sellerFruits: Array.isArray(sellerFruitsRes) ? sellerFruitsRes : []
        });
      } catch (err) {
        console.error('Failed to load analytics data:', err);

        // Check for authentication errors
        if (err.response?.status === 401 || err.status === 401) {
          setError('Authentication required. Please log in to access reports.');
        } else if (err.response?.status === 403 || err.status === 403) {
          setError('Access denied. Please check your permissions.');
        } else if (err.response?.status === 404 || err.status === 404) {
          setError('Data not found. Please ensure the backend is properly configured.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later or contact support.');
        } else if (err.message?.includes('Network Error') || err.status === 0) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to load data. Please try again.');
        }
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
    }).format(amount || 0);
  };

  // Calculate key business metrics
  const calculateBusinessMetrics = () => {
    const allSales = Array.isArray(data.sales) && Array.isArray(data.sellerFruits) ? [...data.sales, ...data.sellerFruits] : [];
    const totalRevenue = allSales.reduce((sum, sale) => sum + (parseFloat(sale.revenue) || 0), 0);
    const totalQuantity = allSales.reduce((sum, sale) => sum + (parseFloat(sale.quantitySold || sale.quantity) || 0), 0);
    const totalPurchases = Array.isArray(data.purchases) ? data.purchases.reduce((sum, purchase) => sum + (parseFloat(purchase.totalAmount) || 0), 0) : 0;
    const totalExpenses = Array.isArray(data.otherExpenses) ? data.otherExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) : 0;
    const totalProfit = totalRevenue - totalPurchases - totalExpenses;

    return {
      totalRevenue,
      totalQuantity,
      totalPurchases,
      totalExpenses,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  };

  // Calculate fruit profitability data
  const calculateFruitProfitability = () => {
    const allSales = Array.isArray(data.sales) && Array.isArray(data.sellerFruits) ? [...data.sales, ...data.sellerFruits] : [];
    const fruitMetrics = {};

    // Estimated cost per unit for different fruits (in KES)
    const estimatedCosts = {
      'Sweet banana': 50, 'Kampala': 45, 'Cavendish': 55, 'Plantain': 40, 'Matoke': 35,
      'American sweet potatoes': 60, 'White sweet potatoes': 55, 'Red sweet potatoes': 65,
      'Local Avocados': 80, 'Hass Avocados': 120, 'Oranges': 70, 'Pixie': 75, 'Lemons': 85
    };

    allSales.forEach(sale => {
      const fruitType = sale.fruit_type || sale.fruitType || sale.fruit;
      const revenue = parseFloat(sale.revenue || 0);
      const quantity = parseFloat(sale.quantitySold || sale.quantity || 0);

      if (!fruitMetrics[fruitType]) {
        fruitMetrics[fruitType] = {
          fruitType,
          totalRevenue: 0,
          totalQuantity: 0,
          totalCost: 0,
          salesCount: 0
        };
      }

      fruitMetrics[fruitType].totalRevenue += revenue;
      fruitMetrics[fruitType].totalQuantity += quantity;
      fruitMetrics[fruitType].salesCount += 1;
    });

    Object.keys(fruitMetrics).forEach(fruitType => {
      const metrics = fruitMetrics[fruitType];
      const costPerUnit = estimatedCosts[fruitType] || 50;
      metrics.totalCost = metrics.totalQuantity * costPerUnit;
      metrics.totalProfit = metrics.totalRevenue - metrics.totalCost;
      metrics.profitMargin = metrics.totalRevenue > 0 ? (metrics.totalProfit / metrics.totalRevenue) * 100 : 0;
    });

    return Object.values(fruitMetrics).sort((a, b) => b.totalProfit - a.totalProfit);
  };

  // Calculate sales trends over time
  const calculateSalesTrends = () => {
    const allSales = Array.isArray(data.sales) && Array.isArray(data.sellerFruits) ? [...data.sales, ...data.sellerFruits] : [];
    const salesByDate = {};

    allSales.forEach(sale => {
      const date = sale.date || sale.sale_date;
      if (!date) return;

      const day = format(parseISO(date), 'yyyy-MM-dd');
      if (!salesByDate[day]) {
        salesByDate[day] = { date: day, revenue: 0, quantity: 0, count: 0 };
      }

      salesByDate[day].revenue += parseFloat(sale.revenue || 0);
      salesByDate[day].quantity += parseFloat(sale.quantitySold || sale.quantity || 0);
      salesByDate[day].count += 1;
    });

    return Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Calculate expense breakdown
  const calculateExpenseBreakdown = () => {
    const expenses = [...data.otherExpenses];
    const expenseByCategory = {};

    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const amount = parseFloat(expense.amount || 0);

      if (!expenseByCategory[category]) {
        expenseByCategory[category] = { category, amount: 0, count: 0 };
      }

      expenseByCategory[category].amount += amount;
      expenseByCategory[category].count += 1;
    });

    return Object.values(expenseByCategory);
  };

  // Calculate user performance
  const calculateUserPerformance = () => {
    const allSales = [...data.sales, ...data.sellerFruits];
    const userMetrics = {};

    allSales.forEach(sale => {
      const userEmail = sale.sellerName || sale.created_by || 'Unknown';
      const revenue = parseFloat(sale.revenue || 0);
      const quantity = parseFloat(sale.quantitySold || sale.quantity || 0);

      if (!userMetrics[userEmail]) {
        userMetrics[userEmail] = {
          userEmail,
          totalRevenue: 0,
          totalQuantity: 0,
          salesCount: 0
        };
      }

      userMetrics[userEmail].totalRevenue += revenue;
      userMetrics[userEmail].totalQuantity += quantity;
      userMetrics[userEmail].salesCount += 1;
    });

    return Object.values(userMetrics).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('Authentication required') || error.includes('Access denied');

    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <div>
            <strong>{error}</strong>
            {isAuthError && (
              <div className="mt-2">
                <small className="text-muted">
                  Demo credentials: ceo@fruittrack.com / password123
                </small>
              </div>
            )}
          </div>
          <div className="d-flex gap-2">
            {isAuthError && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const businessMetrics = calculateBusinessMetrics();
  const fruitProfitability = calculateFruitProfitability();
  const salesTrends = calculateSalesTrends();
  const expenseBreakdown = calculateExpenseBreakdown();
  const userPerformance = calculateUserPerformance();

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Business Analytics Dashboard</h1>
          <p className="text-muted">Comprehensive analysis of your business performance</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <select
            className="form-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="revenue">Revenue</option>
            <option value="profit">Profit</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <DollarSign className="text-success" size={24} />
              </div>
              <h6 className="text-muted">Total Revenue</h6>
              <h3 className="text-success mb-0">{formatCurrency(businessMetrics.totalRevenue)}</h3>
              <small className="text-muted">All time</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h6 className="text-muted">Total Profit</h6>
              <h3 className={businessMetrics.totalProfit >= 0 ? 'text-success' : 'text-danger'} mb-0>
                {formatCurrency(businessMetrics.totalProfit)}
              </h3>
              <small className="text-muted">{businessMetrics.profitMargin.toFixed(1)}% margin</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Package className="text-info" size={24} />
              </div>
              <h6 className="text-muted">Total Sales Volume</h6>
              <h3 className="text-info mb-0">{businessMetrics.totalQuantity.toFixed(1)} kg</h3>
              <small className="text-muted">All fruits combined</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Users className="text-warning" size={24} />
              </div>
              <h6 className="text-muted">Active Users</h6>
              <h3 className="text-warning mb-0">{data.users.length}</h3>
              <small className="text-muted">Registered users</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Sales Trends Over Time</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrends.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM dd')} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Fruit Profitability</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fruitProfitability.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="totalProfit"
                  >
                    {fruitProfitability.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Performing Fruits</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fruitProfitability.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fruitType" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="totalProfit" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Expense Breakdown</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">User Performance</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userEmail" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="totalRevenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Business Health Score</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <div className="position-relative mb-3" style={{ width: '150px', height: '150px' }}>
                <svg className="w-100 h-100" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={businessMetrics.profitMargin > 20 ? "#00C49F" : businessMetrics.profitMargin > 10 ? "#FFBB28" : "#FF8042"}
                    strokeWidth="2"
                    strokeDasharray={`${businessMetrics.profitMargin}, 100`}
                  />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <div className="h4 mb-0">{businessMetrics.profitMargin.toFixed(1)}%</div>
                  <small className="text-muted">Margin</small>
                </div>
              </div>
              <div className="text-center">
                <h6 className={businessMetrics.profitMargin > 20 ? 'text-success' : businessMetrics.profitMargin > 10 ? 'text-warning' : 'text-danger'}>
                  {businessMetrics.profitMargin > 20 ? 'Excellent' : businessMetrics.profitMargin > 10 ? 'Good' : 'Needs Improvement'}
                </h6>
                <p className="text-muted small mb-0">Business Health Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Detailed Fruit Analysis</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Fruit Type</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Est. Cost</th>
                  <th>Profit</th>
                  <th>Margin</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {fruitProfitability.map((fruit, index) => (
                  <tr key={fruit.fruitType}>
                    <td>
                      <span className={index < 3 ? 'text-warning fw-bold' : 'text-muted'}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td><strong>{fruit.fruitType}</strong></td>
                    <td>{fruit.totalQuantity.toFixed(1)} kg</td>
                    <td>{formatCurrency(fruit.totalRevenue)}</td>
                    <td>{formatCurrency(fruit.totalCost)}</td>
                    <td className={fruit.totalProfit >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(fruit.totalProfit)}
                    </td>
                    <td>
                      <span className={`badge ${fruit.profitMargin >= 20 ? 'bg-success' : fruit.profitMargin >= 10 ? 'bg-warning' : 'bg-danger'}`}>
                        {fruit.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      {fruit.totalProfit > 10000 ? (
                        <TrendingUp className="text-success" size={20} />
                      ) : fruit.totalProfit > 0 ? (
                        <Activity className="text-warning" size={20} />
                      ) : (
                        <TrendingDown className="text-danger" size={20} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTabAnalytics;
