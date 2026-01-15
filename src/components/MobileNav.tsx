import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, TrendingUp, DollarSign, CheckSquare, Menu, X, Presentation, FileText, Users, Package, Contact, BookOpen, FlaskConical, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Mapa de metas e métricas', icon: LayoutDashboard },
  // TEMPORÁRIO: Removido para reunião - { path: '/coffee', label: 'Café', icon: Coffee },
  // TEMPORÁRIO: Removido para reunião - { path: '/expansion', label: 'Expansão', icon: TrendingUp },
  { path: '/finance', label: 'Financeiro', icon: DollarSign },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/crm', label: 'CRM', icon: Users },
  { path: '/doterra', label: 'CRM Doterra', icon: Users },
  { path: '/vende-mais-obras', label: 'Vende Mais Obras', icon: Hammer },
  { path: '/contacts', label: 'Contatos', icon: Contact },
  { path: '/proposals', label: 'Propostas', icon: FileText },
  // TEMPORÁRIO: Removido para reunião - { path: '/produtos', label: 'Produtos FR Tech', icon: Package },
  // TEMPORÁRIO: Removido para reunião - { path: '/apresentacao', label: 'Apresentação', icon: Presentation },
  { path: '/apresentacao-03', label: 'A1', icon: FileText },
  { path: '/apresentacao-05', label: 'A2', icon: FileText },
  { path: '/relatos', label: 'Relatos', icon: BookOpen },
  { path: '/dashboard-doma-condo', label: 'Mapa de métricas DOMA CONDO', icon: LayoutDashboard },
  // TEMPORÁRIO: Removido para reunião - { path: '/teste', label: 'Teste', icon: FlaskConical },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-card border-b border-border px-4 py-3 flex items-center justify-between md:hidden safe-area-inset-top" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top) + 0.75rem)' }}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <img 
            src="/AXIS_logo_horizontal.png" 
            alt="AXIS Logo" 
            className="h-8 object-contain"
          />
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav
            className={cn(
              "fixed top-0 left-0 bottom-0 w-64 z-[70] bg-card border-r border-border p-4 space-y-2 md:hidden transition-transform duration-300 shadow-xl",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img 
                  src="/AXIS_logo_horizontal.png" 
                  alt="AXIS Logo" 
                  className="h-8 object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            {/* Mock data indicator removed - using real Notion data */}
          </nav>
        </>
      )}

      {/* Floating Menu Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[60] md:hidden h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform safe-area-inset-bottom"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom) + 1rem)' }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col p-4">
        <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2">
          <img 
            src="/AXIS_logo_horizontal.png" 
            alt="AXIS Logo" 
            className="h-10 object-contain"
          />
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Mock data indicator removed - using real Notion data */}
      </aside>
    </>
  );
}
