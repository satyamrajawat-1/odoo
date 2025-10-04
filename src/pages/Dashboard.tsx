import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { UserSelector } from '@/components/UserSelector';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { EmployeeDashboard } from '@/components/EmployeeDashboard';

const Dashboard = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <UserSelector />
      <div>
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'manager' && <ManagerDashboard />}
        {currentUser.role === 'employee' && <EmployeeDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
