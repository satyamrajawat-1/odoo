import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ExpenseCard } from './ExpenseCard';
import { ApprovalTimeline } from './ApprovalTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Expense } from '@/types';
import { toast } from 'sonner';

export function ManagerDashboard() {
  const { currentUser, expenses, processApproval } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState('');

  const pendingApprovals = expenses.filter(exp => 
    exp.status === 'pending' && 
    exp.approvals.some(a => a.approverId === currentUser?.id && a.decision === 'pending')
  );

  const teamExpenses = expenses.filter(exp => {
    const employee = expenses.find(e => e.id === exp.id);
    return employee && exp.status !== 'rejected';
  });

  const handleApproval = (decision: 'approved' | 'rejected') => {
    if (!selectedExpense) return;

    processApproval(selectedExpense.id, currentUser!.id, decision, comment);
    toast.success(`Expense ${decision}!`);
    setSelectedExpense(null);
    setComment('');
  };

  const canApprove = selectedExpense?.approvals.some(
    a => a.approverId === currentUser?.id && a.decision === 'pending'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Manager Dashboard
        </h2>
        <p className="text-muted-foreground">Review and approve team expenses</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="team">
            Team Expenses ({teamExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingApprovals.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onClick={() => setSelectedExpense(expense)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onClick={() => setSelectedExpense(expense)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedExpense.description}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {selectedExpense.employeeName}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                  </p>
                  {selectedExpense.currency !== 'USD' && (
                    <p className="text-xs text-muted-foreground">
                      ≈ USD {selectedExpense.convertedAmount.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{selectedExpense.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{selectedExpense.status}</p>
                </div>
              </div>

              {selectedExpense.ocrData && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">OCR Data</p>
                  <p className="text-sm">Vendor: {selectedExpense.ocrData.vendor || 'N/A'}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Approval Timeline</h4>
                <ApprovalTimeline approvals={selectedExpense.approvals} />
              </div>

              {canApprove && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label>Comment (optional)</Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproval('rejected')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApproval('approved')}
                      className="flex-1 bg-gradient-success"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
