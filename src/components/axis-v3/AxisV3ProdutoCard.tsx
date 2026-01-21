// AXIS V3 — Card de Produto

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProdutoTechV3 } from '@/types/axis-v3';

interface AxisV3ProdutoCardProps {
  produto: ProdutoTechV3;
  onClick?: () => void;
  isSelected?: boolean;
}

const categoriaLabels: Record<ProdutoTechV3['categoria'], { label: string; color: string }> = {
  aquisicao: { label: 'Aquisição & Topo de Funil', color: 'bg-blue-500' },
  funil: { label: 'Funil & Processo Comercial', color: 'bg-purple-500' },
  conversao: { label: 'Conversão & Fechamento', color: 'bg-green-500' },
  gestao: { label: 'Gestão & Decisão', color: 'bg-orange-500' },
  escala: { label: 'Escala & Eficiência', color: 'bg-red-500' }
};

export const AxisV3ProdutoCard: React.FC<AxisV3ProdutoCardProps> = ({
  produto,
  onClick,
  isSelected = false
}) => {
  const categoria = categoriaLabels[produto.categoria];

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="text-xl font-semibold leading-tight">
            {produto.produto}
          </CardTitle>
          <Badge className={`${categoria.color} text-white text-xs whitespace-nowrap`}>
            {categoria.label}
          </Badge>
        </div>
        <CardDescription className="text-sm font-medium text-foreground/80">
          {produto.dorEstrategica}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground/70 mb-1">
            Perfil Ideal de Cliente
          </h4>
          <p className="text-sm text-foreground/60">{produto.icp}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-foreground/70 mb-1">
            Como Soluciona
          </h4>
          <p className="text-sm text-foreground/60">{produto.comoSoluciona}</p>
        </div>

        <div className="pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground/50 mb-1">Investimento Médio</p>
            <p className="text-sm font-semibold text-foreground">
              {produto.investimentoMedio}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-xs text-foreground/50 mb-1">Impacto Esperado</p>
          <p className="text-sm font-medium text-foreground">
            {produto.impactoEsperado}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

