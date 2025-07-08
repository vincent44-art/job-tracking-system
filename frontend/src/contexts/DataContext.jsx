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
  const [userSalaries, setUserSalaries] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [ceoMessages, setCeoMessages] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [gradients, setGradients] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    setPurchases(JSON.parse(localStorage.getItem('fruittrack_purchases') || '[]'));
    setAssignments(JSON.parse(localStorage.getItem('fruittrack_assignments') || '[]'));
    setCarExpenses(JSON.parse(localStorage.getItem('fruittrack_car_expenses') || '[]'));
    setOtherExpenses(JSON.parse(localStorage.getItem('fruittrack_other_expenses') || '[]'));
    setUserSalaries(JSON.parse(localStorage.getItem('fruittrack_user_salaries') || '[]'));
    setSalaryPayments(JSON.parse(localStorage.getItem('fruittrack_salary_payments') || '[]'));
    setCeoMessages(JSON.parse(localStorage.getItem('fruittrack_ceo_messages') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('fruittrack_inventory') || '[]'));
    setStockMovements(JSON.parse(localStorage.getItem('fruittrack_stock_movements') || '[]'));
    setGradients(JSON.parse(localStorage.getItem('fruittrack_gradients') || '[]'));
  }, []);

  // Format currency in Kenyan Shillings
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const addPurchase = (purchaseData) => {
    const newPurchase = {
      ...purchaseData,
      id: `purchase-${Date.now()}`,
      quantity: String(purchaseData.quantity), // Convert to string
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
      quantityAssigned: String(assignmentData.quantityAssigned), // Convert to string
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
      quantitySold: String(saleData.quantitySold), // Convert to string
      createdAt: new Date().toISOString()
    };

    // Check if assignment exists
    let updatedAssignments;
    const existingAssignment = assignments.find(a => a.id === assignmentId);
    
    if (existingAssignment) {
      // Add to existing assignment
      updatedAssignments = assignments.map(assignment => {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            sales: [...assignment.sales, newSale],
            status: 'in-transit'
          };
        }
        return assignment;
      });
    } else {
      // Create new assignment for this sale
      const newAssignment = {
        id: assignmentId,
        sellerEmail: saleData.sellerName,
        fruitType: saleData.fruitType,
        quantityAssigned: saleData.quantitySold,
        moneyIssued: 0,
        travelDate: saleData.date,
        status: 'in-transit',
        sales: [newSale],
        createdAt: new Date().toISOString()
      };
      updatedAssignments = [...assignments, newAssignment];
    }

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

  const addUserSalary = (salaryData) => {
    const newUserSalary = {
      ...salaryData,
      id: `user-salary-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedSalaries = [...userSalaries, newUserSalary];
    setUserSalaries(updatedSalaries);
    localStorage.setItem('fruittrack_user_salaries', JSON.stringify(updatedSalaries));
    toast.success('User salary set successfully');
  };

  const updateUserSalary = (userEmail, baseSalary) => {
    const updatedSalaries = userSalaries.map(salary => 
      salary.userEmail === userEmail ? { ...salary, baseSalary } : salary
    );
    setUserSalaries(updatedSalaries);
    localStorage.setItem('fruittrack_user_salaries', JSON.stringify(updatedSalaries));
    toast.success('Salary updated successfully');
  };

  const recordSalaryPayment = (paymentData) => {
    const newPayment = {
      ...paymentData,
      id: `salary-payment-${Date.now()}`,
      isPaid: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedPayments = [...salaryPayments, newPayment];
    setSalaryPayments(updatedPayments);
    localStorage.setItem('fruittrack_salary_payments', JSON.stringify(updatedPayments));
    toast.success('Salary payment recorded');
  };

  const toggleSalaryPayment = (paymentId) => {
    const updatedPayments = salaryPayments.map(payment => 
      payment.id === paymentId ? { ...payment, isPaid: !payment.isPaid } : payment
    );
    setSalaryPayments(updatedPayments);
    localStorage.setItem('fruittrack_salary_payments', JSON.stringify(updatedPayments));
    toast.success('Payment status updated');
  };

  const addCeoMessage = (messageData) => {
    const newMessage = {
      ...messageData,
      id: `ceo-message-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...ceoMessages, newMessage];
    setCeoMessages(updatedMessages);
    localStorage.setItem('fruittrack_ceo_messages', JSON.stringify(updatedMessages));
    toast.success('Message sent successfully');
  };

  const markMessageAsRead = (messageId) => {
    const updatedMessages = ceoMessages.map(message => 
      message.id === messageId ? { ...message, isRead: true } : message
    );
    setCeoMessages(updatedMessages);
    localStorage.setItem('fruittrack_ceo_messages', JSON.stringify(updatedMessages));
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

  const addInventoryItem = (inventoryData) => {
    const newItem = {
      ...inventoryData,
      id: `inventory-${Date.now()}`,
      quantity: String(inventoryData.quantity), // Convert to string
      createdAt: new Date().toISOString()
    };
    
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem('fruittrack_inventory', JSON.stringify(updatedInventory));
    toast.success('Inventory item added successfully');
  };

  const addStockMovement = (movementData) => {
    const newMovement = {
      ...movementData,
      id: `movement-${Date.now()}`,
      quantity: String(movementData.quantity), // Convert to string
      createdAt: new Date().toISOString()
    };
    
    const updatedMovements = [...stockMovements, newMovement];
    setStockMovements(updatedMovements);
    localStorage.setItem('fruittrack_stock_movements', JSON.stringify(updatedMovements));
    toast.success('Stock movement recorded successfully');
  };

  const addGradient = (gradientData) => {
    const newGradient = {
      ...gradientData,
      id: `gradient-${Date.now()}`,
      quantity: String(gradientData.quantity), // Convert to string
      createdAt: new Date().toISOString()
    };
    
    const updatedGradients = [...gradients, newGradient];
    setGradients(updatedGradients);
    localStorage.setItem('fruittrack_gradients', JSON.stringify(updatedGradients));
    toast.success('Gradient applied successfully');
  };

  // Calculate current stock after movements
  const getCurrentStock = () => {
    const stockMap = {};
    
    // Add initial inventory
    inventory.forEach(item => {
      const key = item.fruitType;
      if (!stockMap[key]) {
        stockMap[key] = {
          fruitType: item.fruitType,
          quantity: 0
        };
      }
      stockMap[key].quantity += parseFloat(item.quantity || 0);
    });

    // Apply stock movements
    stockMovements.forEach(movement => {
      const key = movement.fruitType;
      if (!stockMap[key]) {
        stockMap[key] = {
          fruitType: movement.fruitType,
          quantity: 0
        };
      }
      
      if (movement.movementType === 'in') {
        stockMap[key].quantity += parseFloat(movement.quantity || 0);
      } else {
        stockMap[key].quantity -= parseFloat(movement.quantity || 0);
      }
    });

    return Object.values(stockMap).filter(item => item.quantity > 0);
  };

  const clearAllData = () => {
    setPurchases([]);
    setAssignments([]);
    setCarExpenses([]);
    setOtherExpenses([]);
    setUserSalaries([]);
    setSalaryPayments([]);
    setCeoMessages([]);
    setInventory([]);
    setStockMovements([]);
    setGradients([]);
    localStorage.removeItem('fruittrack_purchases');
    localStorage.removeItem('fruittrack_assignments');
    localStorage.removeItem('fruittrack_car_expenses');
    localStorage.removeItem('fruittrack_other_expenses');
    localStorage.removeItem('fruittrack_user_salaries');
    localStorage.removeItem('fruittrack_salary_payments');
    localStorage.removeItem('fruittrack_ceo_messages');
    localStorage.removeItem('fruittrack_inventory');
    localStorage.removeItem('fruittrack_stock_movements');
    localStorage.removeItem('fruittrack_gradients');
    toast.success('All data cleared successfully');
  };

  const clearPurchasesData = () => {
    setPurchases([]);
    localStorage.removeItem('fruittrack_purchases');
    toast.success('Purchases data cleared successfully');
  };

  const clearSalesData = () => {
    setAssignments([]);
    localStorage.removeItem('fruittrack_assignments');
    toast.success('Sales data cleared successfully');
  };

  const clearCarExpensesData = () => {
    setCarExpenses([]);
    localStorage.removeItem('fruittrack_car_expenses');
    toast.success('Car expenses data cleared successfully');
  };

  const clearOtherExpensesData = () => {
    setOtherExpenses([]);
    localStorage.removeItem('fruittrack_other_expenses');
    toast.success('Other expenses data cleared successfully');
  };

  const clearSalariesData = () => {
    setUserSalaries([]);
    setSalaryPayments([]);
    localStorage.removeItem('fruittrack_user_salaries');
    localStorage.removeItem('fruittrack_salary_payments');
    toast.success('Salaries data cleared successfully');
  };

  const clearInventoryData = () => {
    setInventory([]);
    setStockMovements([]);
    setGradients([]);
    localStorage.removeItem('fruittrack_inventory');
    localStorage.removeItem('fruittrack_stock_movements');
    localStorage.removeItem('fruittrack_gradients');
    toast.success('Inventory data cleared successfully');
  };

  const getStats = () => {
    const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalSales = assignments.reduce((sum, a) => 
      sum + a.sales.reduce((saleSum, s) => saleSum + parseFloat(s.revenue || 0), 0), 0
    );
    const totalCarExpenses = carExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalSalaries = salaryPayments.filter(p => p.isPaid).reduce((sum, p) => sum + parseFloat(p.monthlySalary || 0), 0);
    const netProfit = totalSales - (totalPurchases + totalCarExpenses + totalOtherExpenses + totalSalaries);
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return {
      totalPurchases,
      totalSales,
      totalCarExpenses,
      totalOtherExpenses,
      totalSalaries,
      netProfit,
      profitMargin
    };
  };

  const getFruitPerformance = () => {
    const fruitData = {};
    
    // Calculate purchases by fruit type
    purchases.forEach(purchase => {
      if (!fruitData[purchase.fruitType]) {
        fruitData[purchase.fruitType] = {
          purchases: 0,
          sales: 0,
          quantity: 0,
          profit: 0
        };
      }
      fruitData[purchase.fruitType].purchases += parseFloat(purchase.amount || 0);
      fruitData[purchase.fruitType].quantity += parseFloat(purchase.quantity || 0);
    });
    
    // Calculate sales by fruit type
    assignments.forEach(assignment => {
      assignment.sales.forEach(sale => {
        const fruitType = sale.fruitType || assignment.fruitType;
        if (!fruitData[fruitType]) {
          fruitData[fruitType] = {
            purchases: 0,
            sales: 0,
            quantity: 0,
            profit: 0
          };
        }
        fruitData[fruitType].sales += parseFloat(sale.revenue || 0);
        fruitData[fruitType].profit = fruitData[fruitType].sales - fruitData[fruitType].purchases;
      });
    });
    
    return Object.entries(fruitData).map(([fruitType, data]) => ({
      fruitType,
      ...data,
      profitMargin: data.sales > 0 ? ((data.profit / data.sales) * 100) : 0
    })).sort((a, b) => b.profit - a.profit);
  };

  return (
    <DataContext.Provider value={{
      purchases,
      assignments,
      carExpenses,
      otherExpenses,
      userSalaries,
      salaryPayments,
      ceoMessages,
      inventory,
      stockMovements,
      gradients,
      addPurchase,
      addAssignment,
      addSale,
      addCarExpense,
      addOtherExpense,
      addUserSalary,
      updateUserSalary,
      recordSalaryPayment,
      toggleSalaryPayment,
      addCeoMessage,
      markMessageAsRead,
      deletePurchase,
      deleteSale,
      deleteCarExpense,
      deleteOtherExpense,
      updateAssignmentStatus,
      addInventoryItem,
      addStockMovement,
      addGradient,
      getCurrentStock,
      clearAllData,
      clearPurchasesData,
      clearSalesData,
      clearCarExpensesData,
      clearOtherExpensesData,
      clearSalariesData,
      clearInventoryData,
      getStats,
      getFruitPerformance,
      formatCurrency
    }}>
      {children}
    </DataContext.Provider>
  );
};
