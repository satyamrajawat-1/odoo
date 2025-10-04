import { ExpenseStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ExpenseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    approved: {
      label: 'Approved',
      className: 'bg-success text-success-foreground',
      icon: CheckCircle2,
    },
    pending: {
      label: 'Pending',
      className: 'bg-warning text-warning-foreground',
      icon: Clock,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-destructive text-destructive-foreground',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
