import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExpenseCard } from './ExpenseCard';
import { ApprovalTimeline } from './ApprovalTimeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Users, Receipt, GitBranch, Plus, Trash2, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { Expense, ApprovalRuleType, ApprovalSequence, ApprovalSequenceStep } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStepItemProps {
  step: ApprovalSequenceStep;
  index: number;
  totalSteps: number;
  users: any[];
  onUpdateType: (index: number, type: 'role' | 'user') => void;
  onUpdateValue: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function SortableStepItem({ step, index, totalSteps, users, onUpdateType, onUpdateValue, onRemove }: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.step.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} data-testid={`step-${index}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Step {step.step}</Label>
              <Select
                value={step.type}
                onValueChange={(value) => onUpdateType(index, value as 'role' | 'user')}
              >
                <SelectTrigger className="mt-1" data-testid={`select-type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">By Role</SelectItem>
                  <SelectItem value="user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs">
                {step.type === 'role' ? 'Select Role' : 'Select User'}
              </Label>
              <Select
                value={step.value}
                onValueChange={(value) => onUpdateValue(index, value)}
              >
                <SelectTrigger className="mt-1" data-testid={`select-value-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {step.type === 'role' ? (
                    <>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </>
                  ) : (
                    users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(index)}
            disabled={totalSteps === 1}
            data-testid={`button-remove-${index}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { 
    currentUser,
    expenses, 
    users, 
    company, 
    approvalRules, 
    approvalSequences,
    updateApprovalRules,
    addApprovalSequence,
    updateApprovalSequence,
    deleteApprovalSequence,
    processApproval
  } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState('');
  const [ruleType, setRuleType] = useState<ApprovalRuleType>(approvalRules.type);
  const [threshold, setThreshold] = useState(approvalRules.threshold?.toString() || '60');
  const [specificApprover, setSpecificApprover] = useState(approvalRules.specificApproverId || '');
  const [selectedSequence, setSelectedSequence] = useState(approvalRules.sequenceId || '');
  
  // New sequence dialog
  const [showSequenceDialog, setShowSequenceDialog] = useState(false);
  const [sequenceName, setSequenceName] = useState('');
  const [sequenceSteps, setSequenceSteps] = useState<ApprovalSequenceStep[]>([
    { step: 1, type: 'role', value: 'manager' }
  ]);

  const handleSaveRules = () => {
    const rules = {
      type: ruleType,
      threshold: ruleType === 'percentage' || ruleType === 'hybrid' ? parseInt(threshold) : undefined,
      specificApproverId: ruleType === 'specific' || ruleType === 'hybrid' ? specificApprover : undefined,
      sequenceId: ruleType === 'sequential' ? selectedSequence : undefined,
    };
    updateApprovalRules(rules);
    toast.success('Approval rules updated successfully!');
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sequenceSteps.findIndex(s => s.step.toString() === active.id);
      const newIndex = sequenceSteps.findIndex(s => s.step.toString() === over.id);
      
      const reordered = arrayMove(sequenceSteps, oldIndex, newIndex);
      const renumbered = reordered.map((step, i) => ({ ...step, step: i + 1 }));
      setSequenceSteps(renumbered);
    }
  };

  const handleAddStep = () => {
    const newStep: ApprovalSequenceStep = {
      step: sequenceSteps.length + 1,
      type: 'role',
      value: 'manager'
    };
    setSequenceSteps([...sequenceSteps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = sequenceSteps.filter((_, i) => i !== index);
    const renumbered = updated.map((step, i) => ({ ...step, step: i + 1 }));
    setSequenceSteps(renumbered);
  };

  const handleUpdateStepType = (index: number, type: 'role' | 'user') => {
    const updated = [...sequenceSteps];
    updated[index] = { ...updated[index], type, value: type === 'role' ? 'manager' : users[0]?.id || '' };
    setSequenceSteps(updated);
  };

  const handleUpdateStepValue = (index: number, value: string) => {
    const updated = [...sequenceSteps];
    updated[index] = { ...updated[index], value };
    setSequenceSteps(updated);
  };

  const handleCreateSequence = () => {
    if (!sequenceName.trim()) {
      toast.error('Please enter a sequence name');
      return;
    }
    
    const newSequence: ApprovalSequence = {
      id: `seq-${Date.now()}`,
      name: sequenceName,
      steps: sequenceSteps,
      isActive: true
    };
    
    addApprovalSequence(newSequence);
    toast.success('Approval sequence created!');
    setShowSequenceDialog(false);
    setSequenceName('');
    setSequenceSteps([{ step: 1, type: 'role', value: 'manager' }]);
  };

  const handleToggleSequence = (id: string, isActive: boolean) => {
    updateApprovalSequence(id, { isActive });
    toast.success(`Sequence ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleDeleteSequence = (id: string) => {
    deleteApprovalSequence(id);
    toast.success('Sequence deleted');
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">
            <Receipt className="mr-2 h-4 w-4" />
            All Expenses
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <GitBranch className="mr-2 h-4 w-4" />
            Sequences
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

        <TabsContent value="sequences" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Approval Sequences</h3>
              <p className="text-sm text-muted-foreground">Define custom multi-step approval flows</p>
            </div>
            <Button onClick={() => setShowSequenceDialog(true)} data-testid="button-create-sequence">
              <Plus className="mr-2 h-4 w-4" />
              Create Sequence
            </Button>
          </div>

          <div className="grid gap-4">
            {approvalSequences.map((sequence) => (
              <Card key={sequence.id} data-testid={`card-sequence-${sequence.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{sequence.name}</CardTitle>
                      <Badge variant={sequence.isActive ? "default" : "secondary"}>
                        {sequence.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSequence(sequence.id, !sequence.isActive)}
                        data-testid={`button-toggle-${sequence.id}`}
                      >
                        {sequence.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSequence(sequence.id)}
                        data-testid={`button-delete-${sequence.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Approval Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {sequence.steps.map((step) => {
                        const displayValue = step.type === 'user' 
                          ? users.find(u => u.id === step.value)?.name || step.value
                          : step.value.charAt(0).toUpperCase() + step.value.slice(1);
                        
                        return (
                          <li key={step.step} className="text-muted-foreground">
                            <span className="font-medium text-foreground">{displayValue}</span>
                            {' '}({step.type === 'user' ? 'Specific User' : 'Role'})
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))}

            {approvalSequences.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No approval sequences configured. Create one to get started.
              </div>
            )}
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

              {ruleType === 'sequential' && (
                <div>
                  <Label>Approval Sequence</Label>
                  <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select sequence..." />
                    </SelectTrigger>
                    <SelectContent>
                      {approvalSequences.filter(s => s.isActive).map(seq => (
                        <SelectItem key={seq.id} value={seq.id}>
                          {seq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select which approval sequence to use
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

      <Dialog open={!!selectedExpense} onOpenChange={() => { setSelectedExpense(null); setComment(''); }}>
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

      <Dialog open={showSequenceDialog} onOpenChange={setShowSequenceDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Approval Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sequence Name</Label>
              <Input
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="e.g., Standard Approval Flow"
                className="mt-2"
                data-testid="input-sequence-name"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Approval Steps (Drag to reorder)</Label>
                <Button size="sm" variant="outline" onClick={handleAddStep} data-testid="button-add-step">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sequenceSteps.map(s => s.step.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sequenceSteps.map((step, index) => (
                      <SortableStepItem
                        key={step.step}
                        step={step}
                        index={index}
                        totalSteps={sequenceSteps.length}
                        users={users}
                        onUpdateType={handleUpdateStepType}
                        onUpdateValue={handleUpdateStepValue}
                        onRemove={handleRemoveStep}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSequenceDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateSequence} className="flex-1" data-testid="button-save-sequence">
                Create Sequence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
