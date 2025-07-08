
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const SalaryManagementTab = () => {
  const { getAllUsers } = useAuth();
  const { 
    userSalaries, 
    salaryPayments, 
    addUserSalary, 
    updateUserSalary, 
    recordSalaryPayment, 
    toggleSalaryPayment,
    formatCurrency,
    clearSalariesData
  } = useData();
  
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [salaryFormData, setSalaryFormData] = useState({
    userEmail: '',
    userName: '',
    userRole: '',
    baseSalary: ''
  });
  const [paymentFormData, setPaymentFormData] = useState({
    userEmail: '',
    userName: '',
    userRole: '',
    monthlySalary: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const users = getAllUsers().filter(user => user.role !== 'ceo');

  const handleSetSalary = (e) => {
    e.preventDefault();
    addUserSalary({
      ...salaryFormData,
      baseSalary: parseFloat(salaryFormData.baseSalary)
    });
    setSalaryFormData({ userEmail: '', userName: '', userRole: '', baseSalary: '' });
    setShowSalaryForm(false);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    recordSalaryPayment({
      ...paymentFormData,
      monthlySalary: parseFloat(paymentFormData.monthlySalary)
    });
    setPaymentFormData({
      userEmail: '',
      userName: '',
      userRole: '',
      monthlySalary: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setShowPaymentForm(false);
  };

  const handleUserSelect = (user, isPayment = false) => {
    if (isPayment) {
      setPaymentFormData({
        ...paymentFormData,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role
      });
    } else {
      setSalaryFormData({
        ...salaryFormData,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role
      });
    }
  };

  return (
    <div className="tab-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>Salary Management</h5>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => setShowSalaryForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>Set Salary
          </button>
          <button 
            className="btn btn-success me-2"
            onClick={() => setShowPaymentForm(true)}
          >
            <i className="bi bi-cash me-2"></i>Record Payment
          </button>
          <button 
            className="btn btn-outline-danger"
            onClick={clearSalariesData}
          >
            <i className="bi bi-trash me-2"></i>Clear All
          </button>
        </div>
      </div>

      {/* Set Salary Form */}
      {showSalaryForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title">Set User Salary</h6>
            <form onSubmit={handleSetSalary}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Select User</label>
                  <select
                    className="form-select"
                    value={salaryFormData.userEmail}
                    onChange={(e) => {
                      const user = users.find(u => u.email === e.target.value);
                      if (user) handleUserSelect(user);
                    }}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Base Salary (KES)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={salaryFormData.baseSalary}
                    onChange={(e) => setSalaryFormData({...salaryFormData, baseSalary: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary me-2">Set Salary</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowSalaryForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Form */}
      {showPaymentForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title">Record Salary Payment</h6>
            <form onSubmit={handleRecordPayment}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Select User</label>
                  <select
                    className="form-select"
                    value={paymentFormData.userEmail}
                    onChange={(e) => {
                      const user = users.find(u => u.email === e.target.value);
                      if (user) handleUserSelect(user, true);
                    }}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Amount (KES)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paymentFormData.monthlySalary}
                    onChange={(e) => setPaymentFormData({...paymentFormData, monthlySalary: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData({...paymentFormData, paymentDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-success me-2">Record</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Payments Table */}
      <div className="card">
        <div className="card-header">
          <h6>Salary Payments</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.userName}</td>
                    <td>
                      <span className="badge bg-primary">
                        {payment.userRole.toUpperCase()}
                      </span>
                    </td>
                    <td>{formatCurrency(payment.monthlySalary)}</td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${payment.isPaid ? 'bg-success' : 'bg-warning'}`}>
                        {payment.isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${payment.isPaid ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleSalaryPayment(payment.id)}
                      >
                        {payment.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {salaryPayments.length === 0 && (
              <p className="text-center text-muted">No salary payments recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagementTab;
