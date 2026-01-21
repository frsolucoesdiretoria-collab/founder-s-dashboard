// AXIS V3 — Navegação (Opcional para uso futuro)

import React from 'react';
import { Button } from '@/components/ui/button';

interface AxisV3NavProps {
  currentPage?: 'home' | 'diagnostico' | 'portfolio';
}

export const AxisV3Nav: React.FC<AxisV3NavProps> = ({ currentPage }) => {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/axis-v3" className="text-2xl font-bold text-primary">
              AXIS V3
            </a>
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => window.location.href = '/axis-v3'}
              >
                Home
              </Button>
              <Button
                variant={currentPage === 'portfolio' ? 'default' : 'ghost'}
                onClick={() => window.location.href = '/axis-v3/portfolio'}
              >
                Portfólio
              </Button>
              <Button
                variant={currentPage === 'diagnostico' ? 'default' : 'ghost'}
                onClick={() => window.location.href = '/axis-v3/diagnostico'}
              >
                Diagnóstico
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => window.location.href = '/axis-v3/diagnostico'}
          >
            Iniciar Diagnóstico
          </Button>
        </div>
      </div>
    </nav>
  );
};

