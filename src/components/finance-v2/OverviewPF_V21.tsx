// OverviewPF V2.1 - Visão Geral Pessoa Física (VERSÃO ISOLADA)
// Alterações: Novo bloco "Gastos realizados até o momento" no topo,
// Toggle Meta/Realizado no gráfico de pizza, ajustes nos cards

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  CATEGORIES_V21,
  METAS_V21,
  REALIZADOS_V21,
  BANK_ACCOUNTS_V21,
  formatCurrencyV21,
  calculatePercentage,
  calculateProgressVisual,
  getPieChartData,
  getCategoryPercentage,
  type CategoryV21
} from '@/lib/finance-v2-data-v21';
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

// Mock de totais mensais para o gráfico de fluxo (mantido igual à versão original)
const MOCK_MONTHLY_TOTALS = {
  income: 11000.00,
  expenses: 17745.00
};

export function OverviewPF_V21() {
  const [pieChartMode, setPieChartMode] = useState<'meta' | 'realizado'>('meta');

  const formatCurrency = formatCurrencyV21;

  const getBudgetStatus = (percentage: number): 'blue' | 'green' | 'yellow' | 'red' => {
    if (percentage < 70) return 'blue';
    if (percentage < 100) return 'green';
    if (percentage === 100) return 'yellow';
    return 'red'; // > 100%
  };

  const getBadgeVariant = (percentage: number): 'default' | 'destructive' => {
    return percentage <= 100 ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* NOVO: Gastos realizados até o momento - Grid de cards individuais */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gastos realizados até o momento</h2>
          <p className="text-muted-foreground">Mês atual - Acompanhamento por categoria</p>
        </div>
        
        {/* Grid responsiva de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES_V21.map((category) => {
            const meta = METAS_V21[category];
            const realizado = REALIZADOS_V21[category];
            const percentage = calculatePercentage(realizado, meta);
            const progressValue = calculateProgressVisual(realizado, meta);
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
        {/* Fluxo Mensal (mantido igual) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo Mensal: Receitas vs Despesas</CardTitle>
            <CardDescription>Janeiro 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Receitas', value: MOCK_MONTHLY_TOTALS.income, fill: '#10b981' },
                  { name: 'Despesas', value: MOCK_MONTHLY_TOTALS.expenses, fill: '#ef4444' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
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
                <CardDescription>Distribuição por categoria</CardDescription>
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
                  data={getPieChartData(pieChartMode)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {getPieChartData(pieChartMode).map((entry, index) => (
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
              {getPieChartData(pieChartMode).map((item) => {
                const percentage = getCategoryPercentage(item.name as CategoryV21, pieChartMode);
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

      {/* ALTERADO: "Metas de despesas do mês" (substitui "Maiores Despesas do Mês") */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metas de despesas do mês</CardTitle>
          <CardDescription>Metas por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES_V21.map((category) => {
              const meta = METAS_V21[category];
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

      {/* ALTERADO: Orçamento vs Gasto Real (agora usa as mesmas categorias) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orçamento vs Gasto Real</CardTitle>
          <CardDescription>Acompanhamento por categoria (mês atual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES_V21.map((category) => {
              const meta = METAS_V21[category];
              const realizado = REALIZADOS_V21[category];
              const percentage = calculatePercentage(realizado, meta);
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
                    value={calculateProgressVisual(realizado, meta)}
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

      {/* ALTERADO: Contas Bancárias PF (agora com novos nomes) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contas Bancárias PF</CardTitle>
          <CardDescription>Saldos atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BANK_ACCOUNTS_V21.map((account) => (
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
