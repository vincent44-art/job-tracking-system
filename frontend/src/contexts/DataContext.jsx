import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [purchases, setPurchases] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [carExpenses, setCarExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    setPurchases(JSON.parse(localStorage.getItem('fruittrack_purchases') || '[]'));
    setAssignments(JSON.parse(localStorage.getItem('fruittrack_assignments') || '[]'));
    setCarExpenses(JSON.parse(localStorage.getItem('fruittrack_car_expenses') || '[]'));
    setOtherExpenses(JSON.parse(localStorage.getItem('fruittrack_other_expenses') || '[]'));
  }, []);

  const addPurchase = (purchaseData) => {
    const newPurchase = {
      ...purchaseData,
      id: `purchase-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('fruittrack_purchases', JSON.stringify(updatedPurchases));
    toast.success('Purchase recorded successfully');
  };

  const addAssignment = (assignmentData) => {
    const newAssignment = {
      ...assignmentData,
      id: `assignment-${Date.now()}`,
      status: 'assigned',
      sales: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
    toast.success('Seller assigned successfully');
  };

  const addSale = (assignmentId, saleData) => {
    const newSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      assignmentId,
      createdAt: new Date().toISOString()
    };

    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          sales: [...assignment.sales, newSale],
          status: 'in-transit'
        };
      }
      return assignment;
    });

    setAssignments(updatedAssignments);
    localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
    toast.success('Sale recorded successfully');
  };

  const addCarExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `car-expense-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedExpenses = [...carExpenses, newExpense];
    setCarExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_car_expenses', JSON.stringify(updatedExpenses));
    toast.success('Car expense recorded successfully');
  };

  const addOtherExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `other-expense-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedExpenses = [...otherExpenses, newExpense];
    setOtherExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_other_expenses', JSON.stringify(updatedExpenses));
    toast.success('Expense recorded successfully');
  };

  const deletePurchase = (id) => {
    const updatedPurchases = purchases.filter(purchase => purchase.id !== id);
    setPurchases(updatedPurchases);
    localStorage.setItem('fruittrack_purchases', JSON.stringify(updatedPurchases));
    toast.success('Purchase deleted successfully');
  };

  const deleteSale = (assignmentId, saleId) => {
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          sales: assignment.sales.filter(sale => sale.id !== saleId)
        };
      }
      return assignment;
    });
    setAssignments(updatedAssignments);
    localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
    toast.success('Sale deleted successfully');
  };

  const deleteCarExpense = (id) => {
    const updatedExpenses = carExpenses.filter(expense => expense.id !== id);
    setCarExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_car_expenses', JSON.stringify(updatedExpenses));
    toast.success('Car expense deleted successfully');
  };

  const deleteOtherExpense = (id) => {
    const updatedExpenses = otherExpenses.filter(expense => expense.id !== id);
    setOtherExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_other_expenses', JSON.stringify(updatedExpenses));
    toast.success('Expense deleted successfully');
  };

  const updateAssignmentStatus = (id, status) => {
    const updatedAssignments = assignments.map(assignment => 
      assignment.id === id ? { ...assignment, status } : assignment
    );
    setAssignments(updatedAssignments);
    localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
  };

  const clearAllData = () => {
    setPurchases([]);
    setAssignments([]);
    setCarExpenses([]);
    setOtherExpenses([]);
    localStorage.removeItem('fruittrack_purchases');
    localStorage.removeItem('fruittrack_assignments');
    localStorage.removeItem('fruittrack_car_expenses');
    localStorage.removeItem('fruittrack_other_expenses');
    toast.success('All data cleared successfully');
  };

  const getStats = () => {
    const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalSales = assignments.reduce((sum, a) => 
      sum + a.sales.reduce((saleSum, s) => saleSum + s.revenue, 0), 0
    );
    const totalCarExpenses = carExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalSales - (totalPurchases + totalCarExpenses + totalOtherExpenses);
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return {
      totalPurchases,
      totalSales,
      totalCarExpenses,
      totalOtherExpenses,
      netProfit,
      profitMargin
    };
  };

  return (
    <DataContext.Provider value={{
      purchases,
      assignments,
      carExpenses,
      otherExpenses,
      addPurchase,
      addAssignment,
      addSale,
      addCarExpense,
      addOtherExpense,
      deletePurchase,
      deleteSale,
      deleteCarExpense,
      deleteOtherExpense,
      updateAssignmentStatus,
      clearAllData,
      getStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
