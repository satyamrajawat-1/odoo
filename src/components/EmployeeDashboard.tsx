import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExpenseCard } from './ExpenseCard';
import { ApprovalTimeline } from './ApprovalTimeline';
import { Plus, Upload } from 'lucide-react';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { extractReceiptData } from '@/lib/ocr';
import { convertCurrency } from '@/lib/currency';

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Entertainment', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

export function EmployeeDashboard() {
  const { currentUser, expenses, addExpense, company } = useApp();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptImage: null as File | null,
  });

  const myExpenses = expenses.filter(e => e.employeeId === currentUser?.id);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, receiptImage: file }));
    setIsProcessing(true);
    toast.info('Processing receipt with OCR...');

    try {
      const ocrData = await extractReceiptData(file);
      
      setFormData(prev => ({
        ...prev,
        amount: ocrData.amount?.toString() || prev.amount,
        date: ocrData.date || prev.date,
        description: ocrData.description || prev.description,
      }));
      
      toast.success('Receipt scanned! Fields auto-filled (editable)');
    } catch (error) {
      toast.error('OCR processing failed. Please fill manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const convertedAmount = await convertCurrency(amount, formData.currency, company.currency);

    const newExpense: Expense = {
      id: `exp${Date.now()}`,
      employeeId: currentUser!.id,
      employeeName: currentUser!.name,
      amount,
      currency: formData.currency,
      convertedAmount,
      category: formData.category,
      date: formData.date,
      description: formData.description,
      status: 'pending',
      approvals: [],
      createdAt: new Date(),
    };

    addExpense(newExpense);
    toast.success('Expense submitted for approval!');
    setIsSubmitOpen(false);
    setFormData({
      amount: '',
      currency: 'USD',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptImage: null,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Expenses
          </h2>
          <p className="text-muted-foreground">Submit and track your expense reports</p>
        </div>
        
        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Submit Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Receipt Upload (OCR enabled)</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload receipt for automatic data extraction
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label>Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the expense..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Submit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myExpenses.map(expense => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onClick={() => setSelectedExpense(expense)}
          />
        ))}
      </div>

      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedExpense.description}</h3>
                <p className="text-sm text-muted-foreground">{selectedExpense.category}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{selectedExpense.currency} {selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{selectedExpense.date}</p>
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
