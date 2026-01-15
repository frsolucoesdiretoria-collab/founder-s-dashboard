// DOMA CONDO Client Layout Component
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logoutClient } from '@/services/domaCondoClient.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { DomaCondoClient } from '@/types/domaCondoClient';

interface DomaCondoClientLayoutProps {
  children: React.ReactNode;
  cliente: DomaCondoClient;
}

export function DomaCondoClientLayout({ children, cliente }: DomaCondoClientLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutClient();
    toast.success('Logout realizado com sucesso');
    navigate('/doma-condo-clientes/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-foreground">DOMA CONDO</h1>
                <p className="text-sm text-muted-foreground">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{cliente.name}</p>
                <p className="text-xs text-muted-foreground">{cliente.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

