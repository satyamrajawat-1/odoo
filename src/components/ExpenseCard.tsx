import { useState } from 'react';
import { Expense } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Calendar, DollarSign, FileText, Image as ImageIcon, Tag, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const approvalProgress = expense.approvals.length > 0
    ? (expense.approvals.filter(a => a.decision === 'approved').length / expense.approvals.length) * 100
    : 0;

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 group" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {expense.description}
            </h3>
            <p className="text-sm text-muted-foreground">{expense.employeeName}</p>
          </div>
          <div className="transition-transform duration-300 group-hover:scale-110">
            <StatusBadge status={expense.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm group">
            <div className="p-1.5 rounded-md bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
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
            <div className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span>{expense.date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            <span>{expense.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
            <span>{format(expense.createdAt, 'MMM d, yyyy')}</span>
          </div>
        </div>
        
        {expense.ocrData && (
          <div className={`pt-2 border-t transition-all duration-300 ${isHovered ? 'border-primary/50' : ''}`}>
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 rounded bg-primary/10">
                <ImageIcon className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">
                OCR: {expense.ocrData.vendor || 'Receipt scanned'}
              </span>
            </div>
          </div>
        )}
        
        <div className={`pt-2 border-t transition-all duration-300 ${isHovered ? 'border-primary/50' : ''}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Approval Progress</span>
              </div>
              <span className="font-medium">
                {expense.approvals.filter(a => a.decision === 'approved').length} / {expense.approvals.length}
              </span>
            </div>
            <Progress value={approvalProgress} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
