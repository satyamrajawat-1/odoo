import { Expense } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Calendar, DollarSign, FileText, Image as ImageIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{expense.description}</h3>
            <p className="text-sm text-muted-foreground">{expense.employeeName}</p>
          </div>
          <StatusBadge status={expense.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">{expense.currency} {expense.amount.toFixed(2)}</p>
              {expense.currency !== 'USD' && (
                <p className="text-xs text-muted-foreground">
                  ≈ USD {expense.convertedAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{expense.date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>{expense.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{format(expense.createdAt, 'MMM d, yyyy')}</span>
          </div>
        </div>
        
        {expense.ocrData && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>OCR: {expense.ocrData.vendor || 'Receipt scanned'}</span>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {expense.approvals.filter(a => a.decision === 'approved').length} / {expense.approvals.length} approvals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
