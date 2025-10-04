import { User, Company, Expense } from '@/types';

export function initializeMockData() {
  const company: Company = {
    id: '1',
    name: 'ExesCorp',
    currency: 'USD',
    country: 'United States'
  };

  const users: User[] = [
    {
      id: 'admin1',
      name: 'Sarah Chen - Director',
      email: 'sarah.chen@exescorp.com',
      role: 'admin',
      isManagerApprover: false,
    },
    {
      id: 'admin2',
      name: 'Michael Torres - Finance',
      email: 'michael.torres@exescorp.com',
      role: 'admin',
      isManagerApprover: false,
    },
    {
      id: 'manager1',
      name: 'Jessica Park',
      email: 'jessica.park@exescorp.com',
      role: 'manager',
      isManagerApprover: true,
    },
    {
      id: 'manager2',
      name: 'David Kim',
      email: 'david.kim@exescorp.com',
      role: 'manager',
      isManagerApprover: true,
    },
    {
      id: 'employee1',
      name: 'Alex Johnson',
      email: 'alex.johnson@exescorp.com',
      role: 'employee',
      managerId: 'manager1',
      isManagerApprover: false,
    },
    {
      id: 'employee2',
      name: 'Emma Wilson',
      email: 'emma.wilson@exescorp.com',
      role: 'employee',
      managerId: 'manager2',
      isManagerApprover: false,
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp1',
      employeeId: 'employee1',
      employeeName: 'Alex Johnson',
      amount: 1250,
      currency: 'USD',
      convertedAmount: 1250,
      category: 'Travel',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Flight to client meeting in San Francisco',
      status: 'approved',
      approvals: [
        {
          approverId: 'manager1',
          approverName: 'Jessica Park',
          decision: 'approved',
          comment: 'Approved - necessary business travel',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          approverId: 'admin2',
          approverName: 'Michael Torres - Finance',
          decision: 'approved',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          approverId: 'admin1',
          approverName: 'Sarah Chen - Director',
          decision: 'approved',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'exp2',
      employeeId: 'employee2',
      employeeName: 'Emma Wilson',
      amount: 85.50,
      currency: 'USD',
      convertedAmount: 85.50,
      category: 'Office Supplies',
      date: new Date().toISOString().split('T')[0],
      description: 'Wireless mouse and keyboard for workstation',
      status: 'pending',
      approvals: [
        {
          approverId: 'manager2',
          approverName: 'David Kim',
          decision: 'pending',
        },
      ],
      ocrData: {
        amount: 85.50,
        date: new Date().toISOString().split('T')[0],
        vendor: 'Office Depot',
        description: 'Computer peripherals',
      },
      createdAt: new Date(),
    },
    {
      id: 'exp3',
      employeeId: 'employee1',
      employeeName: 'Alex Johnson',
      amount: 450,
      currency: 'USD',
      convertedAmount: 450,
      category: 'Software',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Annual subscription for project management software',
      status: 'rejected',
      approvals: [
        {
          approverId: 'manager1',
          approverName: 'Jessica Park',
          decision: 'rejected',
          comment: 'We already have enterprise license for this tool',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  return { company, users, expenses };
}
