import { ReactNode } from 'react';

interface EnzoLayoutProps {
  children: ReactNode;
}

/**
 * Layout específico para Dashboard Enzo - sem menu lateral
 * O Enzo só deve ver o sistema dele, sem acesso a outras páginas
 */
export function EnzoLayout({ children }: EnzoLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header simples sem menu */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 safe-area-inset-top" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top) + 0.75rem)' }}>
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-bold text-foreground">Mapa de metas comerciais semanais AXIS</h1>
        </div>
      </header>
      
      {/* Main Content - sem padding lateral porque não tem menu */}
      <main className="pt-20 safe-area-inset" style={{ paddingTop: 'max(5rem, calc(env(safe-area-inset-top) + 4rem))' }}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

