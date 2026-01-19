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
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-foreground truncate">DOMA CONDO</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{cliente.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{cliente.email}</p>
              </div>
              <div className="text-right sm:hidden">
                <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{cliente.name.split(' ')[0]}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}

