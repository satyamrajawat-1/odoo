import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company, Expense, ApprovalRule, Approval } from '@/types';
import { initializeMockData } from '@/lib/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  company: Company;
  users: User[];
  expenses: Expense[];
  approvalRules: ApprovalRule;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  updateApprovalRules: (rules: ApprovalRule) => void;
  processApproval: (expenseId: string, approverId: string, decision: 'approved' | 'rejected', comment?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company>({ id: '1', name: 'ExesCorp', currency: 'USD', country: 'US' });
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule>({ type: 'sequential' });

  useEffect(() => {
    const { company: initCompany, users: initUsers, expenses: initExpenses } = initializeMockData();
    setCompany(initCompany);
    setUsers(initUsers);
    setExpenses(initExpenses);
  }, []);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    // Auto-trigger approval flow
    triggerApprovalFlow(expense);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updates } : exp));
  };

  const updateApprovalRules = (rules: ApprovalRule) => {
    setApprovalRules(rules);
    // Re-evaluate open expenses
    expenses.forEach(expense => {
      if (expense.status === 'pending') {
        checkApprovalRules(expense.id);
      }
    });
  };

  const triggerApprovalFlow = (expense: Expense) => {
    // Get the employee's manager
    const employee = users.find(u => u.id === expense.employeeId);
    const manager = users.find(u => u.id === employee?.managerId);
    
    // Check if manager has isManagerApprover field checked
    if (manager && manager.isManagerApprover) {
      const approval: Approval = {
        approverId: manager.id,
        approverName: manager.name,
        decision: 'pending',
      };
      updateExpense(expense.id, { approvals: [approval] });
    } else {
      // If manager is not an approver, skip to next approver in sequence
      const nextApprover = getNextApprover(expense, '');
      if (nextApprover) {
        const approval: Approval = {
          approverId: nextApprover.id,
          approverName: nextApprover.name,
          decision: 'pending',
        };
        updateExpense(expense.id, { approvals: [approval] });
      }
    }
  };

  const processApproval = (expenseId: string, approverId: string, decision: 'approved' | 'rejected', comment?: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const updatedApprovals = expense.approvals.map(approval =>
      approval.approverId === approverId
        ? { ...approval, decision, comment, timestamp: new Date() }
        : approval
    );

    if (decision === 'rejected') {
      updateExpense(expenseId, { 
        status: 'rejected', 
        approvals: updatedApprovals 
      });
      return;
    }

    // Check if we need to advance to next approver
    updateExpense(expenseId, { approvals: updatedApprovals });
    
    setTimeout(() => {
      checkApprovalRules(expenseId);
    }, 100);
  };

  const checkApprovalRules = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense || expense.status !== 'pending') return;

    const approvedCount = expense.approvals.filter(a => a.decision === 'approved').length;
    const totalApprovals = expense.approvals.length;

    // Check percentage rule
    if (approvalRules.type === 'percentage' && approvalRules.threshold) {
      const percentage = (approvedCount / totalApprovals) * 100;
      if (percentage >= approvalRules.threshold) {
        updateExpense(expenseId, { status: 'approved' });
        return;
      }
    }

    // Check specific approver rule
    if (approvalRules.type === 'specific' && approvalRules.specificApproverId) {
      const specificApproval = expense.approvals.find(
        a => a.approverId === approvalRules.specificApproverId && a.decision === 'approved'
      );
      if (specificApproval) {
        updateExpense(expenseId, { status: 'approved' });
        return;
      }
    }

    // Check hybrid rule
    if (approvalRules.type === 'hybrid') {
      const percentageMet = approvalRules.threshold && (approvedCount / totalApprovals) * 100 >= approvalRules.threshold;
      const specificApprovalMet = approvalRules.specificApproverId && expense.approvals.find(
        a => a.approverId === approvalRules.specificApproverId && a.decision === 'approved'
      );
      if (percentageMet || specificApprovalMet) {
        updateExpense(expenseId, { status: 'approved' });
        return;
      }
    }

    // Sequential flow - advance to next approver
    if (approvalRules.type === 'sequential') {
      const currentApproval = expense.approvals.find(a => a.decision === 'pending');
      if (!currentApproval && approvedCount === totalApprovals) {
        updateExpense(expenseId, { status: 'approved' });
        return;
      }

      // Add next approver if current is approved
      const lastApproval = expense.approvals[expense.approvals.length - 1];
      if (lastApproval.decision === 'approved') {
        const nextApprover = getNextApprover(expense, lastApproval.approverId);
        if (nextApprover) {
          const newApproval: Approval = {
            approverId: nextApprover.id,
            approverName: nextApprover.name,
            decision: 'pending',
          };
          updateExpense(expenseId, { 
            approvals: [...expense.approvals, newApproval] 
          });
        } else {
          updateExpense(expenseId, { status: 'approved' });
        }
      }
    }
  };

  const getNextApprover = (expense: Expense, currentApproverId: string): User | null => {
    // Simple sequential flow: Manager -> Finance Admin -> Director Admin
    const currentApprover = users.find(u => u.id === currentApproverId);
    if (!currentApprover) return null;

    if (currentApprover.role === 'manager') {
      // Find Finance Admin (Admin2)
      return users.find(u => u.role === 'admin' && u.name.includes('Finance')) || null;
    } else if (currentApprover.name.includes('Finance')) {
      // Find Director (Admin1)
      return users.find(u => u.role === 'admin' && u.name.includes('Director')) || null;
    }
    return null;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      company,
      users,
      expenses,
      approvalRules,
      addExpense,
      updateExpense,
      updateApprovalRules,
      processApproval,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
