
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface Purchase {
  id: string;
  purchaserEmail: string;
  employeeName: string;
  fruitType: string;
  quantity: number;
  unit: string;
  buyerName: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  sellerEmail: string;
  fruitType: string;
  quantityAssigned: number;
  moneyIssued: number;
  travelDate: string;
  status: 'assigned' | 'in-transit' | 'completed';
  sales: Sale[];
  createdAt: string;
}

export interface Sale {
  id: string;
  assignmentId: string;
  quantitySold: number;
  revenue: number;
  date: string;
  createdAt: string;
}

export interface CarExpense {
  id: string;
  driverEmail: string;
  type: 'fuel' | 'repair' | 'maintenance' | 'other';
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface OtherExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

interface DataContextType {
  purchases: Purchase[];
  assignments: Assignment[];
  carExpenses: CarExpense[];
  otherExpenses: OtherExpense[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'sales'>) => void;
  addSale: (assignmentId: string, sale: Omit<Sale, 'id' | 'assignmentId' | 'createdAt'>) => void;
  addCarExpense: (expense: Omit<CarExpense, 'id' | 'createdAt'>) => void;
  addOtherExpense: (expense: Omit<OtherExpense, 'id' | 'createdAt'>) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  clearAllData: () => void;
  getStats: () => {
    totalPurchases: number;
    totalSales: number;
    totalCarExpenses: number;
    totalOtherExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [carExpenses, setCarExpenses] = useState<CarExpense[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);

  useEffect(() => {
    // Load data from localStorage
    setPurchases(JSON.parse(localStorage.getItem('fruittrack_purchases') || '[]'));
    setAssignments(JSON.parse(localStorage.getItem('fruittrack_assignments') || '[]'));
    setCarExpenses(JSON.parse(localStorage.getItem('fruittrack_car_expenses') || '[]'));
    setOtherExpenses(JSON.parse(localStorage.getItem('fruittrack_other_expenses') || '[]'));
  }, []);

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `purchase-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('fruittrack_purchases', JSON.stringify(updatedPurchases));
    toast.success('Purchase recorded successfully');
  };

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'sales'>) => {
    const newAssignment: Assignment = {
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

  const addSale = (assignmentId: string, saleData: Omit<Sale, 'id' | 'assignmentId' | 'createdAt'>) => {
    const newSale: Sale = {
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
          status: 'in-transit' as const
        };
      }
      return assignment;
    });

    setAssignments(updatedAssignments);
    localStorage.setItem('fruittrack_assignments', JSON.stringify(updatedAssignments));
    toast.success('Sale recorded successfully');
  };

  const addCarExpense = (expenseData: Omit<CarExpense, 'id' | 'createdAt'>) => {
    const newExpense: CarExpense = {
      ...expenseData,
      id: `car-expense-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedExpenses = [...carExpenses, newExpense];
    setCarExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_car_expenses', JSON.stringify(updatedExpenses));
    toast.success('Car expense recorded successfully');
  };

  const addOtherExpense = (expenseData: Omit<OtherExpense, 'id' | 'createdAt'>) => {
    const newExpense: OtherExpense = {
      ...expenseData,
      id: `other-expense-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedExpenses = [...otherExpenses, newExpense];
    setOtherExpenses(updatedExpenses);
    localStorage.setItem('fruittrack_other_expenses', JSON.stringify(updatedExpenses));
    toast.success('Expense recorded successfully');
  };

  const updateAssignmentStatus = (id: string, status: Assignment['status']) => {
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
      updateAssignmentStatus,
      clearAllData,
      getStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
