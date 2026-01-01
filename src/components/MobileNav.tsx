import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, TrendingUp, DollarSign, CheckSquare, Menu, X, Presentation, FileText, Users, Package, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard-v02', label: 'Dashboard V02', icon: LayoutDashboard },
  { path: '/coffee', label: 'Café', icon: Coffee },
  { path: '/expansion', label: 'Expansão', icon: TrendingUp },
  { path: '/finance', label: 'Financeiro', icon: DollarSign },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/crm', label: 'CRM', icon: Users },
  { path: '/contacts', label: 'Contatos', icon: Contact },
  { path: '/produtos', label: 'Produtos FR Tech', icon: Package },
  { path: '/apresentacao', label: 'Apresentação', icon: Presentation },
  { path: '/apresentacao-02', label: 'Apresentação 02', icon: FileText },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FR</span>
          </div>
          <span className="font-semibold text-foreground">Tech OS</span>
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
              "fixed top-0 left-0 bottom-0 w-64 z-50 bg-card border-r border-border p-4 space-y-2 md:hidden transition-transform duration-300 shadow-xl",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">FR</span>
                </div>
                <div>
                  <h1 className="font-bold text-foreground text-sm">FR Tech OS</h1>
                  <p className="text-xs text-muted-foreground">Founder Execution</p>
                </div>
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
        className="fixed bottom-4 right-4 z-50 md:hidden h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col p-4">
        <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">FR</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">FR Tech OS</h1>
            <p className="text-xs text-muted-foreground">Founder Execution</p>
          </div>
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
