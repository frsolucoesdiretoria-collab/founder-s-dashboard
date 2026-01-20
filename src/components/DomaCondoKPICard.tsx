import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DomaCondoKPI } from '@/mocks/domaCondoDashboard';

interface DomaCondoKPICardProps {
  kpi: DomaCondoKPI;
}

export function DomaCondoKPICard({ kpi }: DomaCondoKPICardProps) {
  const getStatusIcon = () => {
    switch (kpi.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600 dark:text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (kpi.status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            Realizado
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
            Atenção
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
            Pendente
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatValue = (value: number, kpiName: string) => {
    const isFinancial = kpi.category === 'upsell-financeiro' || 
                       kpiName.toLowerCase().includes('custo') ||
                       kpiName.toLowerCase().includes('valor') ||
                       kpiName.toLowerCase().includes('margem') ||
                       kpiName.toLowerCase().includes('preço');
    
    if (isFinancial) {
      if (value >= 1000) {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }
    
    if (kpiName.toLowerCase().includes('percentual') || kpiName.toLowerCase().includes('%')) {
      return `${value.toFixed(1).replace('.', ',')}%`;
    }
    
    if (value % 1 !== 0) {
      return value.toFixed(1).replace('.', ',');
    }
    
    if (value >= 1000) {
      return value.toLocaleString('pt-BR');
    }
    
    return value.toString();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {kpi.clientName}
            </p>
            <CardTitle className="text-base font-medium">
              {kpi.name}
            </CardTitle>
          </div>
          <div className={cn(
            "p-2 rounded-full ml-2",
            kpi.status === 'completed' && "bg-green-50 dark:bg-green-950/20",
            kpi.status === 'warning' && "bg-yellow-50 dark:bg-yellow-950/20",
            kpi.status === 'pending' && "bg-orange-50 dark:bg-orange-950/20"
          )}>
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-foreground">
            {formatValue(kpi.value, kpi.name)}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          {getStatusBadge()}
          <span className="text-xs text-muted-foreground">
            Dados simulados • Atualizado hoje
          </span>
        </div>
      </CardContent>
    </Card>
  );
}






