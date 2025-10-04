export type Role = 'admin' | 'manager' | 'employee';

export type ApprovalRuleType = 'sequential' | 'percentage' | 'specific' | 'hybrid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
  country: string;
}

export interface OCRData {
  amount?: number;
  date?: string;
  vendor?: string;
  description?: string;
}

export interface Approval {
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp?: Date;
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  category: string;
  date: string;
  description: string;
  receiptImage?: string;
  ocrData?: OCRData;
  status: ExpenseStatus;
  approvals: Approval[];
  createdAt: Date;
}

export interface ApprovalRule {
  type: ApprovalRuleType;
  threshold?: number; // For percentage rule
  specificApproverId?: string; // For specific approver rule
}
