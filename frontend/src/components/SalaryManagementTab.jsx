import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
<<<<<<< HEAD
import { fetchSalaries, fetchSalaryPayments, createSalary, recordPayment, togglePaymentStatus } from 'http://127.0.0.1:5000/api';
=======
//import { fetchSalaries, fetchSalaryPayments, createSalary, recordPayment, togglePaymentStatus } from 'http://127.0.0.1:5000/api';
import { fetchSalaries, fetchSalaryPayments, createSalary, recordPayment, togglePaymentStatus } from './apiHelpers';
>>>>>>> f019a39 (Fix API path and token setup)
import SalaryFormModal from './SalaryFormModal';
import PaymentFormModal from './PaymentFormModal';

const SalaryManagementTab = () => {
  const { getAllUsers } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [salariesRes, paymentsRes] = await Promise.all([
          fetchSalaries(),
          fetchSalaryPayments()
        ]);
        setSalaries(salariesRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error('Failed to load salary data:', err);
        setError('Failed to load salary data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleAddSalary = async (salaryData) => {
    try {
      const response = await createSalary(salaryData);
      setSalaries([...salaries, response.data]);
      setShowSalaryModal(false);
    } catch (err) {
      console.error('Failed to add salary:', err);
      setError('Failed to add salary. Please try again.');
    }
  };

  const handleRecordPayment = async (paymentData) => {
    try {
      const response = await recordPayment(paymentData);
      setPayments([...payments, response.data]);
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError('Failed to record payment. Please try again.');
    }
  };

  const handleTogglePayment = async (paymentId) => {
    try {
      await togglePaymentStatus(paymentId);
      setPayments(payments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, isPaid: !payment.isPaid } 
          : payment
      ));
    } catch (err) {
      console.error('Failed to update payment status:', err);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const users = getAllUsers().filter(user => user.role !== 'ceo');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Salary Management</h2>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => setShowSalaryModal(true)}
          >
            Set Salary
          </button>
          <button 
            className="btn btn-success me-2"
            onClick={() => setShowPaymentModal(true)}
          >
            Record Payment
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          />
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Salary Information</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Base Salary</th>
                </tr>
              </thead>
              <tbody>
                {salaries.length > 0 ? (
                  salaries.map(salary => (
                    <tr key={salary.userEmail}>
                      <td>{salary.userName}</td>
                      <td>
                        <span className="badge bg-primary">
                          {salary.userRole.toUpperCase()}
                        </span>
                      </td>
                      <td>{formatCurrency(salary.baseSalary)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No salary records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Payment History</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.userName}</td>
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
                          onClick={() => handleTogglePayment(payment.id)}
                        >
                          {payment.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SalaryFormModal
        show={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        onSave={handleAddSalary}
        users={users}
      />

      <PaymentFormModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handleRecordPayment}
        users={users}
        salaries={salaries}
      />
    </div>
  );
};

export default SalaryManagementTab;