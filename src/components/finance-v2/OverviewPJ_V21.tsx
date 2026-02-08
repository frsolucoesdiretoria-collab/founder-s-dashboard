// OverviewPJ V2.1 - Visão Geral Pessoa Jurídica (VERSÃO ISOLADA)
// Alterações: Cards de gastos realizados no topo + Gráfico de fluxo anual

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CATEGORIES_PJ_V21,
  METAS_PJ_V21,
  REALIZADOS_PJ_V21,
  BANK_ACCOUNTS_PJ_V21,
  MOCK_ANNUAL_DATA_PJ,
  formatCurrencyPJ_V21,
  calculatePercentagePJ,
  calculateProgressVisualPJ,
  getPieChartDataPJ,
  getCategoryPercentagePJ,
  type CategoryPJ_V21
} from '@/lib/finance-v2-data-v21-pj';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function OverviewPJ_V21() {
  const [pieChartMode, setPieChartMode] = useState<'meta' | 'realizado'>('meta');

  const formatCurrency = formatCurrencyPJ_V21;

  const getBudgetStatus = (percentage: number): 'blue' | 'green' | 'yellow' | 'red' => {
    if (percentage < 70) return 'blue';
    if (percentage < 100) return 'green';
    if (percentage === 100) return 'yellow';
    return 'red'; // > 100%
  };

  const getBadgeVariant = (percentage: number): 'default' | 'destructive' => {
    return percentage <= 100 ? 'default' : 'destructive';
  };

  // Preparar dados para o gráfico de barras agrupadas
  const annualChartData = MOCK_ANNUAL_DATA_PJ.map(item => ({
    month: item.month,
    Receitas: item.receitas,
    Despesas: item.despesas
  }));

  return (
    <div className="space-y-6">
      {/* NOVO: Gastos realizados até o momento - Grid de cards individuais */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gastos realizados até o momento</h2>
          <p className="text-muted-foreground">Mês atual - Acompanhamento por categoria PJ</p>
        </div>
        
        {/* Grid responsiva de cards - 5 categorias PJ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CATEGORIES_PJ_V21.map((category) => {
            const meta = METAS_PJ_V21[category];
            const realizado = REALIZADOS_PJ_V21[category];
            const percentage = calculatePercentagePJ(realizado, meta);
            const progressValue = calculateProgressVisualPJ(realizado, meta);
            const status = getBudgetStatus(percentage);

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Valor principal */}
                  <div className="text-2xl font-bold">
                    {formatCurrency(realizado)}
                  </div>
                  
                  {/* Barra de progresso */}
                  <Progress 
                    value={progressValue}
                    className={
                      status === 'red' 
                        ? '[&>div]:bg-red-500' 
                        : status === 'yellow' 
                        ? '[&>div]:bg-yellow-500' 
                        : status === 'green' 
                        ? '[&>div]:bg-green-500' 
                        : '[&>div]:bg-blue-500'
                    }
                  />
                  
                  {/* Meta e percentual */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      de {formatCurrency(meta)}
                    </span>
                    <Badge 
                      variant={getBadgeVariant(percentage)}
                      className="text-xs"
                    >
                      {Math.round(percentage)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NOVO: Fluxo Anual - Receitas vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo Anual: Receitas vs Despesas</CardTitle>
            <CardDescription>Ano de 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={annualChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NOVO: Despesas por Categoria com Toggle Meta/Realizado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição por categoria PJ</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={pieChartMode === 'meta' ? 'default' : 'outline'}
                  onClick={() => setPieChartMode('meta')}
                >
                  Meta
                </Button>
                <Button
                  size="sm"
                  variant={pieChartMode === 'realizado' ? 'default' : 'outline'}
                  onClick={() => setPieChartMode('realizado')}
                >
                  Realizado
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={getPieChartDataPJ(pieChartMode)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {getPieChartDataPJ(pieChartMode).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {getPieChartDataPJ(pieChartMode).map((item) => {
                const percentage = getCategoryPercentagePJ(item.name as CategoryPJ_V21, pieChartMode);
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALTERADO: "Metas de despesas do mês" */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metas de despesas do mês</CardTitle>
          <CardDescription>Metas por categoria PJ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES_PJ_V21.map((category) => {
              const meta = METAS_PJ_V21[category];
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className="text-lg font-bold">{formatCurrency(meta)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ALTERADO: Orçamento vs Gasto Real */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orçamento vs Gasto Real</CardTitle>
          <CardDescription>Acompanhamento por categoria PJ (mês atual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES_PJ_V21.map((category) => {
              const meta = METAS_PJ_V21[category];
              const realizado = REALIZADOS_PJ_V21[category];
              const percentage = calculatePercentagePJ(realizado, meta);
              const status = getBudgetStatus(percentage);
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(realizado)} de {formatCurrency(meta)}
                      </span>
                      <Badge variant={getBadgeVariant(percentage)}>
                        {Math.round(percentage)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={calculateProgressVisualPJ(realizado, meta)}
                    className={
                      status === 'red' 
                        ? '[&>div]:bg-red-500' 
                        : status === 'yellow' 
                        ? '[&>div]:bg-yellow-500' 
                        : status === 'green' 
                        ? '[&>div]:bg-green-500' 
                        : '[&>div]:bg-blue-500'
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ALTERADO: Contas Bancárias PJ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contas Bancárias PJ</CardTitle>
          <CardDescription>Saldos atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BANK_ACCOUNTS_PJ_V21.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.type}</p>
                </div>
                <p className={`text-xl font-bold ${
                  account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
