import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, LayoutDashboard, Users, FileText, LogOut, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface VendeMaisObrasLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

const sidebarItems = [
  { path: '/vende-mais-obras', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vende-mais-obras/catalogo', label: 'Catálogo', icon: Package },
  { path: '/vende-mais-obras/orcamentos', label: 'Orçamentos', icon: FileText },
  { path: '/vende-mais-obras/clientes', label: 'Clientes', icon: Users },
  { path: '/vende-mais-obras/perfil', label: 'Perfil', icon: User },
];

export function VendeMaisObrasLayout({ title, subtitle, children }: VendeMaisObrasLayoutProps) {
  const location = useLocation();
  const { user, logout, checkTrialStatus } = useAuth();
  const trialStatus = checkTrialStatus();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#151515] border-r border-[#2a2a2a] flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <Link to="/vende-mais-obras" className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-[#FFD700]" />
            <span className="text-xl font-bold text-[#FFD700]">Vende+ Obras</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Orçamentos profissionais para construção civil</p>
          {user && (
            <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
              <p className="text-xs text-gray-300 font-medium">{user.Name}</p>
              <p className="text-xs text-gray-500">{user.Email}</p>
              {trialStatus.isTrial && trialStatus.daysLeft !== null && (
                <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  Trial: {trialStatus.daysLeft} {trialStatus.daysLeft === 1 ? 'dia' : 'dias'} restantes
                </Badge>
              )}
              {user.PlanoAtivo && (
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Plano Ativo
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/vende-mais-obras' && location.pathname === '/vende-mais-obras');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-[#FFD700] text-[#0a0a0a] font-medium"
                    : "text-gray-300 hover:bg-[#1f1f1f] hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-gray-300 hover:bg-[#1f1f1f] hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        {(title || subtitle) && (
          <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#2a2a2a] px-8 py-6">
            {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </header>
        )}

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}