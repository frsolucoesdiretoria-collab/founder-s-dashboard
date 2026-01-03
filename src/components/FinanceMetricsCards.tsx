import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';
import type { FinanceSummary } from '@/types/finance';
import { cn } from '@/lib/utils';

interface FinanceMetricsCardsProps {
  summary: FinanceSummary;
}

export function FinanceMetricsCards({ summary }: FinanceMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-green-600 dark:text-green-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Orçado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalBudgeted)}</div>
          <p className="text-xs text-muted-foreground">Mês atual</p>
        </CardContent>
      </Card>

      {/* Total Gasto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
          <p className="text-xs text-muted-foreground">Mês atual</p>
        </CardContent>
      </Card>

      {/* Saldo Disponível */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            summary.availableBalance >= 0 ? "text-green-600 dark:text-green-500" : "text-destructive"
          )}>
            {formatCurrency(summary.availableBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Mês atual</p>
        </CardContent>
      </Card>

      {/* Percentual Utilizado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Percentual Utilizado</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", getStatusColor(summary.utilizationPercentage))}>
            {summary.utilizationPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">do orçamento</p>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className={cn(
        summary.utilizationPercentage >= 100 ? "border-destructive" :
        summary.utilizationPercentage >= 80 ? "border-yellow-500" :
        "border-green-500"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <AlertCircle className={cn(
            "h-4 w-4",
            summary.utilizationPercentage >= 100 ? "text-destructive" :
            summary.utilizationPercentage >= 80 ? "text-yellow-600 dark:text-yellow-500" :
            "text-green-600 dark:text-green-500"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-lg font-semibold",
            summary.utilizationPercentage >= 100 ? "text-destructive" :
            summary.utilizationPercentage >= 80 ? "text-yellow-600 dark:text-yellow-500" :
            "text-green-600 dark:text-green-500"
          )}>
            {summary.utilizationPercentage >= 100 ? "Orçamento Excedido" :
             summary.utilizationPercentage >= 80 ? "Atenção" :
             "Dentro do Orçamento"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.utilizationPercentage >= 100 
              ? "Gastos ultrapassaram o orçamento"
              : summary.utilizationPercentage >= 80
              ? "Próximo do limite"
              : "Gastos controlados"}
          </p>
        </CardContent>
      </Card>

      {/* Top Categorias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top 3 Categorias</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.topCategories.length > 0 ? (
              summary.topCategories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cat.category}</span>
                  <span className="font-medium">{formatCurrency(cat.spent)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma categoria com gastos</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


