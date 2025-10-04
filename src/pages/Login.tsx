import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileSpreadsheet, User, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { users, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      navigate('/dashboard');
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      navigate('/dashboard');
      toast({
        title: "Demo login successful",
        description: `Logged in as ${user.name}`,
      });
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const managerUsers = users.filter(u => u.role === 'manager');
  const employeeUsers = users.filter(u => u.role === 'employee');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-lg" data-testid="card-login">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">ExesManen</CardTitle>
            </div>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@exescorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-login"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-lg" data-testid="card-demo">
          <CardHeader>
            <CardTitle>Quick Demo Access</CardTitle>
            <CardDescription>
              Click any account below to instantly login and explore the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Admin Accounts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Admins</h3>
              </div>
              <div className="space-y-2">
                {adminUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleDemoLogin(user.id)}
                    data-testid={`button-demo-${user.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Manager Accounts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Managers</h3>
              </div>
              <div className="space-y-2">
                {managerUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleDemoLogin(user.id)}
                    data-testid={`button-demo-${user.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Employee Accounts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Employees</h3>
              </div>
              <div className="space-y-2">
                {employeeUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleDemoLogin(user.id)}
                    data-testid={`button-demo-${user.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
