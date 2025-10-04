import { AppProvider, useApp } from '@/contexts/AppContext';
import { UserSelector } from '@/components/UserSelector';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { EmployeeDashboard } from '@/components/EmployeeDashboard';
import { FileSpreadsheet } from 'lucide-react';

function DashboardContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-4 p-8">
          <FileSpreadsheet className="h-20 w-20 mx-auto text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to ExesManen
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Smart expense management with automated approvals and OCR receipt scanning
          </p>
          <p className="text-muted-foreground">
            Select a demo user from the dropdown above to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {currentUser.role === 'admin' && <AdminDashboard />}
      {currentUser.role === 'manager' && <ManagerDashboard />}
      {currentUser.role === 'employee' && <EmployeeDashboard />}
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <UserSelector />
      <DashboardContent />
    </AppProvider>
  );
};

export default Index;
