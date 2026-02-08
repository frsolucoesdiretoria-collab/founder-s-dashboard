import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      
      {/* Main Content */}
      <main className="pt-36 md:pt-0 md:pl-64 safe-area-inset" style={{ paddingTop: 'max(9rem, calc(env(safe-area-inset-top) + 7rem))' }}>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
