
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

export interface InventoryItem {
  id: string;
  fruitType: string;
  quantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  supplierName: string;
  storeKeeperEmail: string;
  storeKeeperName: string;
  date: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  fruitType: string;
  movementType: 'in' | 'out';
  quantity: number;
  unit: string;
  reason: string;
  location: string;
  date: string;
  storeKeeperEmail: string;
  storeKeeperName: string;
  createdAt: string;
}

export interface Gradient {
  id: string;
  gradientName: string;
  fruitType: string;
  quantity: number;
  unit: string;
  purpose: string;
  applicationDate: string;
  notes: string;
  storeKeeperEmail: string;
  storeKeeperName: string;
  createdAt: string;
}

interface DataContextType {
  purchases: Purchase[];
  assignments: Assignment[];
  carExpenses: CarExpense[];
  otherExpenses: OtherExpense[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  gradients: Gradient[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'sales'>) => void;
  addSale: (assignmentId: string, sale: Omit<Sale, 'id' | 'assignmentId' | 'createdAt'>) => void;
  addCarExpense: (expense: Omit<CarExpense, 'id' | 'createdAt'>) => void;
  addOtherExpense: (expense: Omit<OtherExpense, 'id' | 'createdAt'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  addGradient: (gradient: Omit<Gradient, 'id' | 'createdAt'>) => void;
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [gradients, setGradients] = useState<Gradient[]>([]);

  useEffect(() => {
    // Load data from localStorage
    setPurchases(JSON.parse(localStorage.getItem('fruittrack_purchases') || '[]'));
    setAssignments(JSON.parse(localStorage.getItem('fruittrack_assignments') || '[]'));
    setCarExpenses(JSON.parse(localStorage.getItem('fruittrack_car_expenses') || '[]'));
    setOtherExpenses(JSON.parse(localStorage.getItem('fruittrack_other_expenses') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('fruittrack_inventory') || '[]'));
    setStockMovements(JSON.parse(localStorage.getItem('fruittrack_stock_movements') || '[]'));
    setGradients(JSON.parse(localStorage.getItem('fruittrack_gradients') || '[]'));
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

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inventory-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem('fruittrack_inventory', JSON.stringify(updatedInventory));
    toast.success('Inventory item added successfully');
  };

  const addStockMovement = (movementData: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `movement-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedMovements = [...stockMovements, newMovement];
    setStockMovements(updatedMovements);
    localStorage.setItem('fruittrack_stock_movements', JSON.stringify(updatedMovements));
    toast.success('Stock movement recorded successfully');
  };

  const addGradient = (gradientData: Omit<Gradient, 'id' | 'createdAt'>) => {
    const newGradient: Gradient = {
      ...gradientData,
      id: `gradient-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedGradients = [...gradients, newGradient];
    setGradients(updatedGradients);
    localStorage.setItem('fruittrack_gradients', JSON.stringify(updatedGradients));
    toast.success('Gradient applied successfully');
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
    setInventory([]);
    setStockMovements([]);
    setGradients([]);
    localStorage.removeItem('fruittrack_purchases');
    localStorage.removeItem('fruittrack_assignments');
    localStorage.removeItem('fruittrack_car_expenses');
    localStorage.removeItem('fruittrack_other_expenses');
    localStorage.removeItem('fruittrack_inventory');
    localStorage.removeItem('fruittrack_stock_movements');
    localStorage.removeItem('fruittrack_gradients');
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
      inventory,
      stockMovements,
      gradients,
      addPurchase,
      addAssignment,
      addSale,
      addCarExpense,
      addOtherExpense,
      addInventoryItem,
      addStockMovement,
      addGradient,
      updateAssignmentStatus,
      clearAllData,
      getStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
