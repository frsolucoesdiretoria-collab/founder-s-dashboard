import type { ReactNode } from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DoterraLayoutProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  children: ReactNode;
}

export function DoterraLayout({ title, subtitle, onLogout, children }: DoterraLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{title}</h1>
              </div>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {onLogout ? (
              <Button variant="outline" size="sm" onClick={onLogout} className="shrink-0">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}












