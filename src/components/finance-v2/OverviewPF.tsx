// OverviewPF - Visão Geral Pessoa Física

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  AlertCircle
} from 'lucide-react';
import {
  calculateMonthlyTotals,
  getTransactionsByEntity,
  getBudgetsByEntity,
  getAccountPlanById,
  BANK_ACCOUNTS,
  type EntityType
} from '@/lib/finance-v2-data';
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

const ENTITY: EntityType = 'PF';
const CURRENT_MONTH = '2026-01';

const COLORS = {
  income: '#10b981',
  expenses: '#ef4444',
  essential: '#f59e0b',
  variable: '#8b5cf6',
  investment: '#3b82f6',
  debt: '#ef4444'
};

export function OverviewPF() {
  const totals = calculateMonthlyTotals(ENTITY, CURRENT_MONTH);
  const transactions = getTransactionsByEntity(ENTITY, CURRENT_MONTH);
  const budgets = getBudgetsByEntity(ENTITY, CURRENT_MONTH);
  
  // Calcular despesas por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'Saída')
    .reduce((acc, t) => {
      const plan = getAccountPlanById(t.accountPlanId);
      if (plan) {
        const category = plan.category;
        acc[category] = (acc[category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[name.toLowerCase() as keyof typeof COLORS] || COLORS.variable
  }));

  // Taxa de poupança
  const savingsRate = totals.income > 0 ? ((totals.balance / totals.income) * 100) : 0;
  const savingsCapacity = totals.balance;

  // Top 5 planos de conta por gasto
  const expensesByPlan = transactions
    .filter(t => t.type === 'Saída')
    .reduce((acc, t) => {
      const plan = getAccountPlanById(t.accountPlanId);
      if (plan) {
        acc[plan.name] = (acc[plan.name] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(expensesByPlan)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBudgetStatus = (percentage: number): 'success' | 'warning' | 'danger' => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* KPIs do topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalBudget)}
            </div>
            <Progress 
              value={totals.budgetPercentage} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {totals.budgetPercentage.toFixed(0)}% consumido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade de Poupança</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(savingsCapacity)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsRate.toFixed(1)}% da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Contas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                BANK_ACCOUNTS
                  .filter(ba => ba.entity === 'PF')
                  .reduce((sum, ba) => sum + ba.balance, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo Mensal</CardTitle>
            <CardDescription>Receitas vs Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Receitas', value: totals.income, fill: COLORS.income },
                  { name: 'Despesas', value: totals.expenses, fill: COLORS.expenses }
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

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
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
                <div className="mt-4 space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Sem despesas no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maiores Despesas do Mês</CardTitle>
          <CardDescription>Top 5 por plano de contas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topExpenses.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-lg font-bold">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orçamento vs Gasto Real */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orçamento vs Gasto Real</CardTitle>
          <CardDescription>Acompanhamento por plano de contas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const plan = getAccountPlanById(budget.accountPlanId);
              const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
              const status = getBudgetStatus(percentage);
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{plan?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.budgetAmount)}
                      </span>
                      <Badge variant={status === 'danger' ? 'destructive' : status === 'warning' ? 'default' : 'outline'}>
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={
                      status === 'danger' 
                        ? '[&>div]:bg-red-500' 
                        : status === 'warning' 
                        ? '[&>div]:bg-yellow-500' 
                        : '[&>div]:bg-green-500'
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contas Bancárias PF</CardTitle>
          <CardDescription>Saldos atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BANK_ACCOUNTS.filter(ba => ba.entity === 'PF').map((account) => (
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
