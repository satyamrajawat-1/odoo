import { Approval } from '@/types';
import { CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ApprovalTimelineProps {
  approvals: Approval[];
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  return (
    <div className="space-y-4">
      {approvals.map((approval, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${
              approval.decision === 'approved' 
                ? 'bg-success text-success-foreground' 
                : approval.decision === 'rejected'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-warning text-warning-foreground'
            }`}>
              {approval.decision === 'approved' && <CheckCircle2 className="h-4 w-4" />}
              {approval.decision === 'rejected' && <XCircle className="h-4 w-4" />}
              {approval.decision === 'pending' && <Clock className="h-4 w-4" />}
            </div>
            {index < approvals.length - 1 && (
              <div className="h-full w-0.5 bg-border my-2" />
            )}
          </div>
          
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{approval.approverName}</p>
              {approval.timestamp && (
                <p className="text-xs text-muted-foreground">
                  {format(approval.timestamp, 'MMM d, h:mm a')}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {approval.decision}
            </p>
            {approval.comment && (
              <div className="mt-2 flex gap-2 text-sm bg-muted p-2 rounded">
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p>{approval.comment}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
