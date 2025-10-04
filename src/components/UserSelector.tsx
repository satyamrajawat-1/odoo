import { User } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export function UserSelector() {
  const { currentUser, setCurrentUser, users, company } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-primary shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary-foreground" />
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">ExesManen</h1>
            <p className="text-xs text-primary-foreground/80">{company.name} • {company.currency}</p>
          </div>
        </div>
        
        <Select
          value={currentUser?.id}
          onValueChange={(userId) => {
            const user = users.find(u => u.id === userId);
            setCurrentUser(user || null);
          }}
        >
          <SelectTrigger className="w-[280px] bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
            <SelectValue placeholder="Select demo user..." />
          </SelectTrigger>
          <SelectContent>
            {users
              .sort((a, b) => {
                const roleOrder = { admin: 0, manager: 1, employee: 2 };
                return roleOrder[a.role] - roleOrder[b.role];
              })
              .map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
