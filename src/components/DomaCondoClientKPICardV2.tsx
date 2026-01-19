import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DomaCondoClientKPI } from '@/mocks/domaCondoDashboard';

interface DomaCondoClientKPICardV2Props {
  clientKPI: DomaCondoClientKPI;
}

export function DomaCondoClientKPICardV2({ clientKPI }: DomaCondoClientKPICardV2Props) {
  const getStatusIcon = () => {
    switch (clientKPI.status) {
      case 'excellent':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />;
      case 'critical':
        return <Clock className="h-5 w-5 text-red-600 dark:text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (clientKPI.status) {
      case 'excellent':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            Excelente
          </Badge>
        );
      case 'good':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            Bom
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
            Atenção
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
            Crítico
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBgColor = () => {
    switch (clientKPI.status) {
      case 'excellent':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'good':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20';
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/20';
      default:
        return 'bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm md:text-base lg:text-lg font-semibold mb-2">
              {clientKPI.clientName}
            </CardTitle>
          </div>
          <div className={cn("p-2 rounded-full ml-2", getStatusBgColor())}>
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
        {/* Total de lançamentos no mês */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-xs md:text-sm text-muted-foreground">Total de lançamentos no mês</span>
            <span className="text-xl md:text-2xl font-bold text-foreground">
              {clientKPI.totalLancamentos.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">100% (base de cálculo)</div>
        </div>

        <div className="border-t pt-3 md:pt-4 space-y-3">
          {/* Lançamentos Realizados */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs md:text-sm font-medium text-green-700 dark:text-green-400">
                Lançamentos realizados
              </span>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-xl font-bold text-foreground">
                  {clientKPI.realizados.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  ({clientKPI.percentualRealizados.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress 
              value={clientKPI.percentualRealizados} 
              className="h-3 md:h-4 bg-muted"
            />
          </div>

          {/* Lançamentos a Fazer */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs md:text-sm font-medium text-orange-700 dark:text-orange-400">
                Lançamentos a fazer
              </span>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-xl font-bold text-foreground">
                  {clientKPI.aFazer.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  ({clientKPI.percentualAFazer.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress 
              value={clientKPI.percentualAFazer} 
              className="h-3 md:h-4 bg-muted"
            />
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm font-medium">Progresso geral</span>
            <span className="text-base md:text-lg font-bold text-primary">
              {clientKPI.percentualRealizados.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 md:h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 dark:bg-green-600 transition-all"
              style={{ width: `${clientKPI.percentualRealizados}%` }}
            />
            <div 
              className="absolute top-0 h-full bg-orange-400 dark:bg-orange-500 transition-all"
              style={{ 
                left: `${clientKPI.percentualRealizados}%`,
                width: `${clientKPI.percentualAFazer}%` 
              }}
            />
          </div>
        </div>

        {/* Footer - Removido "Dados simulados • Atualizado hoje" para V2 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t">
          {getStatusBadge()}
        </div>
      </CardContent>
    </Card>
  );
}





