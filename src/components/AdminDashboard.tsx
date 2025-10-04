import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExpenseCard } from './ExpenseCard';
import { ApprovalTimeline } from './ApprovalTimeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Users, Receipt } from 'lucide-react';
import { Expense, ApprovalRuleType } from '@/types';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { expenses, users, company, approvalRules, updateApprovalRules } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [ruleType, setRuleType] = useState<ApprovalRuleType>(approvalRules.type);
  const [threshold, setThreshold] = useState(approvalRules.threshold?.toString() || '60');
  const [specificApprover, setSpecificApprover] = useState(approvalRules.specificApproverId || '');

  const handleSaveRules = () => {
    const rules = {
      type: ruleType,
      threshold: ruleType === 'percentage' || ruleType === 'hybrid' ? parseInt(threshold) : undefined,
      specificApproverId: ruleType === 'specific' || ruleType === 'hybrid' ? specificApprover : undefined,
    };
    updateApprovalRules(rules);
    toast.success('Approval rules updated successfully!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">Manage company settings and oversee all expenses</p>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">
            <Receipt className="mr-2 h-4 w-4" />
            All Expenses
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="mr-2 h-4 w-4" />
            Approval Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onClick={() => setSelectedExpense(expense)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map(user => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                    <p><span className="text-muted-foreground">Role:</span> <span className="capitalize font-medium">{user.role}</span></p>
                    {user.managerId && (
                      <p><span className="text-muted-foreground">Manager:</span> {users.find(u => u.id === user.managerId)?.name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={company.name} disabled />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={company.currency} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Rule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rule Type</Label>
                <Select value={ruleType} onValueChange={(value) => setRuleType(value as ApprovalRuleType)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential Approval</SelectItem>
                    <SelectItem value="percentage">Percentage-Based</SelectItem>
                    <SelectItem value="specific">Specific Approver</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Percentage OR Specific)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {ruleType === 'sequential' && 'Manager → Finance → Director sequence'}
                  {ruleType === 'percentage' && 'Auto-approve when % threshold met'}
                  {ruleType === 'specific' && 'Auto-approve when specific person approves'}
                  {ruleType === 'hybrid' && 'Auto-approve when either condition is met'}
                </p>
              </div>

              {(ruleType === 'percentage' || ruleType === 'hybrid') && (
                <div>
                  <Label>Approval Percentage Threshold</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    e.g., 60% means 60% of approvers must approve
                  </p>
                </div>
              )}

              {(ruleType === 'specific' || ruleType === 'hybrid') && (
                <div>
                  <Label>Specific Approver</Label>
                  <Select value={specificApprover} onValueChange={setSpecificApprover}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select approver..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'admin').map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-approve when this person approves
                  </p>
                </div>
              )}

              <Button onClick={handleSaveRules} className="w-full bg-gradient-primary">
                Save Rules
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Default Approval Sequence:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Manager (initial reviewer)</li>
                  <li>Finance Admin (Michael Torres)</li>
                  <li>Director Admin (Sarah Chen)</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-4">
                  Rules can override this sequence for faster approvals
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details (Admin View)</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedExpense.description}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {selectedExpense.employeeName} • {selectedExpense.category}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Converted (USD)</p>
                  <p className="font-semibold">USD {selectedExpense.convertedAmount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Approval Timeline</h4>
                <ApprovalTimeline approvals={selectedExpense.approvals} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
