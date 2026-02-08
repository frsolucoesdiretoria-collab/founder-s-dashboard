// FR Tech OS - Finance Page (Personal Finance Dashboard)
// Premium financial decision panel - consumes ONLY backend endpoints

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FinanceKPICard } from '@/components/FinanceKPICard';
import { 
  DollarSign, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Wallet,
  PiggyBank,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getFinancialSummary,
  getFinancialHistory,
  getAccountBalances,
  getExpenseAnalysis,
  getDecisionsBaseData,
  type FinancialSummary,
  type FinancialHistory,
  type AccountBalance,
  type ExpenseAnalysis,
  type DecisionsBaseData
} from '@/services/finance.service';
import {
  LineChart,
  Line,
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

type UserRole = 'admin' | 'flora';

const NUBANK_PF_ACCOUNT = 'Nubank - Pessoa Física';

// Chart colors
const COLORS = {
  income: '#10b981',
  expenses: '#ef4444',
  balance: '#3b82f6',
  essential: '#f59e0b',
  variable: '#8b5cf6',
  debt: '#ef4444'
};

export default function FinancePage() {
  // 🔥 DEBUG MODE: NO AUTHENTICATION - DIRECT ACCESS
  // Hardcoded passcode for API calls
  const passcode = '06092021'; // Valid finance passcode
  const userRole: UserRole = 'admin'; // Always admin for now

  // Data state
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [history, setHistory] = useState<FinancialHistory[]>([]);
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [expenseAnalysis, setExpenseAnalysis] = useState<ExpenseAnalysis | null>(null);
  const [decisionsData, setDecisionsData] = useState<DecisionsBaseData | null>(null);

  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Selected account filter (for Flora)
  const account = undefined; // No account filter in debug mode

  // ========================================
  // DATA LOADING - AUTO-LOAD ON MOUNT
  // ========================================

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadSummary(),
      loadHistory(),
      loadAccounts(),
      loadExpenseAnalysis(),
      loadDecisionsData()
    ]);
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await getFinancialSummary(passcode, account);
      setSummary(data);
    } catch (err: any) {
      console.error('Error loading summary:', err);
      toast.error('Erro ao carregar resumo financeiro');
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getFinancialHistory(passcode, account);
      setHistory(data);
    } catch (err: any) {
      console.error('Error loading history:', err);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAccounts = async () => {
    if (userRole === 'flora') return; // Flora doesn't need accounts view
    
    setLoadingAccounts(true);
    try {
      const data = await getAccountBalances(passcode);
      setAccounts(data);
    } catch (err: any) {
      console.error('Error loading accounts:', err);
      // Don't show error toast - not critical
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadExpenseAnalysis = async () => {
    setLoadingExpenses(true);
    try {
      const data = await getExpenseAnalysis(passcode, account);
      setExpenseAnalysis(data);
    } catch (err: any) {
      console.error('Error loading expense analysis:', err);
      toast.error('Erro ao carregar análise de despesas');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const loadDecisionsData = async () => {
    try {
      const data = await getDecisionsBaseData(passcode, account);
      setDecisionsData(data);
    } catch (err: any) {
      console.error('Error loading decisions data:', err);
      // Don't show error toast - used for trends only
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
      .format(date)
      .replace('.', '');
  };

  const getTrendDirection = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 1) return 'up';
    if (change < -1) return 'down';
    return 'neutral';
  };

  const getBalanceVariant = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'danger';
    return 'default';
  };

  const getSavingsRateVariant = (rate: number) => {
    if (rate >= 20) return 'success';
    if (rate >= 10) return 'warning';
    return 'danger';
  };

  // ========================================
  // MAIN DASHBOARD (Direct Access - No Auth Screen)
  // ========================================

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Finanças Pessoais
              </h1>
              <p className="text-muted-foreground">
                {userRole === 'flora' 
                  ? 'Visualização: Nubank - Pessoa Física' 
                  : 'Painel de decisão financeira'}
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          {summary && (
            <p className="text-sm text-muted-foreground">
              Período: {new Date(summary.period.startDate).toLocaleDateString('pt-BR')} até{' '}
              {new Date(summary.period.endDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* 1️⃣ PAINEL DE REALIDADE - KPIs */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Visão Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinanceKPICard
              label="Saldo do Mês"
              value={summary ? formatCurrency(summary.balance) : '—'}
              icon={<DollarSign className="h-5 w-5" />}
              variant={summary ? getBalanceVariant(summary.balance) : 'default'}
              trend={
                decisionsData
                  ? {
                      value: decisionsData.trends.incomeChange - decisionsData.trends.expenseChange,
                      direction: getTrendDirection(
                        decisionsData.trends.incomeChange - decisionsData.trends.expenseChange
                      )
                    }
                  : undefined
              }
              loading={loadingSummary}
            />
            
            <FinanceKPICard
              label="Custo de Vida"
              value={summary ? formatCurrency(summary.costOfLiving) : '—'}
              icon={<Wallet className="h-5 w-5" />}
              subtitle={
                summary && summary.totalIncome > 0
                  ? `${((summary.costOfLiving / summary.totalIncome) * 100).toFixed(0)}% da receita`
                  : undefined
              }
              loading={loadingSummary}
            />

            <FinanceKPICard
              label="Taxa de Poupança"
              value={summary ? `${summary.savingsRate.toFixed(1)}%` : '—'}
              icon={<PiggyBank className="h-5 w-5" />}
              variant={summary ? getSavingsRateVariant(summary.savingsRate) : 'default'}
              trend={
                decisionsData
                  ? {
                      value: decisionsData.trends.savingsRateChange,
                      direction: getTrendDirection(decisionsData.trends.savingsRateChange)
                    }
                  : undefined
              }
              loading={loadingSummary}
            />

            <FinanceKPICard
              label="Dívidas"
              value={summary ? formatCurrency(summary.totalDebts) : '—'}
              icon={<CreditCard className="h-5 w-5" />}
              variant={summary && summary.totalDebts > 0 ? 'warning' : 'success'}
              subtitle={
                summary && summary.totalIncome > 0 && summary.totalDebts > 0
                  ? `${((summary.totalDebts / summary.totalIncome) * 100).toFixed(0)}% da receita`
                  : undefined
              }
              loading={loadingSummary}
            />
          </div>
        </section>

        {/* 2️⃣ FLUXO MENSAL - Receitas vs Despesas */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Fluxo do Mês</CardTitle>
              <CardDescription>Receitas vs Despesas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : summary ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        name: 'Receitas',
                        value: summary.totalIncome,
                        fill: COLORS.income
                      },
                      {
                        name: 'Despesas',
                        value: summary.totalExpenses,
                        fill: COLORS.expenses
                      }
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
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3️⃣ DESPESAS POR CATEGORIA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Composição de Despesas</CardTitle>
              <CardDescription>Essenciais, Variáveis e Dívidas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpenses ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : expenseAnalysis && expenseAnalysis.totalExpenses > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Essenciais',
                            value: expenseAnalysis.essentialExpenses,
                            fill: COLORS.essential
                          },
                          {
                            name: 'Variáveis',
                            value: expenseAnalysis.variableExpenses,
                            fill: COLORS.variable
                          },
                          {
                            name: 'Dívidas',
                            value: expenseAnalysis.debtPayments,
                            fill: COLORS.debt
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { fill: COLORS.essential },
                          { fill: COLORS.variable },
                          { fill: COLORS.debt }
                        ].map((entry, index) => (
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
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.essential }} />
                        <span>Essenciais</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(expenseAnalysis.essentialExpenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.variable }} />
                        <span>Variáveis</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(expenseAnalysis.variableExpenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.debt }} />
                        <span>Dívidas</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(expenseAnalysis.debtPayments)}
                      </span>
                    </div>
                  </div>

                  {/* Alerts */}
                  {summary && summary.totalIncome > 0 && (
                    <div className="mt-4 space-y-2">
                      {(expenseAnalysis.essentialExpenses / summary.totalIncome) * 100 > 60 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Despesas essenciais acima de 60% da receita
                          </AlertDescription>
                        </Alert>
                      )}
                      {(expenseAnalysis.debtPayments / summary.totalIncome) * 100 > 30 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Dívidas acima de 30% da receita
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Sem despesas no período
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 4️⃣ EVOLUÇÃO NO TEMPO */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Evolução (Últimos 6 Meses)</CardTitle>
              <CardDescription>Histórico de receitas, despesas e saldo</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : history.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={formatMonth}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke={COLORS.income}
                      strokeWidth={2}
                      name="Receitas"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke={COLORS.expenses}
                      strokeWidth={2}
                      name="Despesas"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke={COLORS.balance}
                      strokeWidth={2}
                      name="Saldo"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Sem histórico disponível
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 5️⃣ CONTAS (Only for Admin) */}
        {userRole === 'admin' && accounts.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Saldos por Conta</CardTitle>
                <CardDescription>Saldo acumulado de cada conta bancária</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((acc) => (
                      <div
                        key={acc.account}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium">{acc.account}</p>
                          <p className="text-sm text-muted-foreground">
                            Atualizado em {new Date(acc.lastUpdate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            acc.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(acc.balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Detailed Breakdown */}
        {expenseAnalysis && expenseAnalysis.breakdown.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Detalhamento por Categoria</CardTitle>
                <CardDescription>Breakdown completo das despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseAnalysis.breakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              item.type === 'essential'
                                ? COLORS.essential
                                : item.type === 'debt'
                                ? COLORS.debt
                                : COLORS.variable
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{item.category}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
