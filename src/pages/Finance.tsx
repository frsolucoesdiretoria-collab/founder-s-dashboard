import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KPICard } from '@/components/KPICard';
import { FinanceMetricsCards } from '@/components/FinanceMetricsCards';
import { BudgetGoalCard } from '@/components/BudgetGoalCard';
import { TransactionTable } from '@/components/TransactionTable';
import { AccountsManager } from '@/components/AccountsManager';
import { AccountsPayableTable } from '@/components/AccountsPayableTable';
import { AccountsReceivableTable } from '@/components/AccountsReceivableTable';
import { BudgetComparisonChart } from '@/components/BudgetComparisonChart';
import { ExpenseCategoryChart } from '@/components/ExpenseCategoryChart';
import { CashFlowChart } from '@/components/CashFlowChart';
import { ReportsGenerator } from '@/components/ReportsGenerator';
import { CategorizationRulesManager } from '@/components/CategorizationRulesManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DollarSign, Lock, ArrowLeft, Loader2, AlertCircle, Upload, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  getFinancialKPIs, 
  getFinanceMetrics,
  getBudgetGoals,
  createBudgetGoal,
  updateBudgetGoal,
  deleteBudgetGoal,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  previewTransactions,
  bulkCategorizeTransactions,
  getFinanceSummary,
  applyCategorizationRules
} from '@/services';
import type { KPI } from '@/types/kpi';
import type { BudgetGoal, Transaction, FinanceSummary } from '@/types/finance';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';
import { getAllGoals } from '@/services';

type UserRole = 'admin' | 'flora';

export default function FinancePage() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [financialKPIs, setFinancialKPIs] = useState<KPI[]>([]);
  const [financeMetrics, setFinanceMetrics] = useState<any[]>([]);
  const [goals, setGoals] = useState<NotionGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // New state for budget and transactions
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Dialog states
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showCategorizeDialog, setShowCategorizeDialog] = useState(false);
  const [editingBudgetGoal, setEditingBudgetGoal] = useState<BudgetGoal | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categorizingTransaction, setCategorizingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [importAccount, setImportAccount] = useState('Nubank');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    transactions: Array<{
      Name: string;
      Date: string;
      Amount: number;
      Type: 'Entrada' | 'Saída';
      Account: string;
      isDuplicate: boolean;
      index: number;
    }>;
    total: number;
    duplicates: number;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  // Transaction filters
  const [transactionFilters, setTransactionFilters] = useState({
    search: '',
    category: '',
    account: '',
    type: '' as '' | 'Entrada' | 'Saída',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    reconciled: '' as '' | 'true' | 'false'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  // Categories management
  const [categories, setCategories] = useState<string[]>(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('finance_categories');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return ['Marketing', 'Operacional', 'Pessoal', 'Investimentos'];
      }
    }
    return ['Marketing', 'Operacional', 'Pessoal', 'Investimentos'];
  });
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Form states
  const [budgetForm, setBudgetForm] = useState({
    Name: '',
    Category: '',
    Month: currentMonth,
    Year: currentYear,
    BudgetAmount: 0,
    PeriodStart: '',
    PeriodEnd: '',
    Notes: ''
  });
  
  const [transactionForm, setTransactionForm] = useState({
    Name: '',
    Date: new Date().toISOString().split('T')[0],
    Amount: 0,
    Type: 'Saída' as 'Entrada' | 'Saída',
    Account: '',
    Category: '',
    Description: ''
  });

  const FINANCE_PASSCODE = '06092021';
  const FLORA_PASSCODE = 'flora123';

  const loadFinanceData = async () => {
    if (!authenticated) return;
    
    try {
      setLoading(true);
      
      // Load summary
      const summaryData = await getFinanceSummary(currentMonth, currentYear, passcode);
      setSummary(summaryData);
      
      // Load budget goals
      const goalsData = await getBudgetGoals(currentMonth, currentYear, passcode);
      setBudgetGoals(goalsData);
      
      // Load transactions
      const transactionsData = await getTransactions(
        { month: currentMonth, year: currentYear },
        passcode
      );
      setTransactions(transactionsData);
      applyFilters(transactionsData);
    } catch (err: any) {
      console.error('Error loading finance data:', err);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (txs: Transaction[]) => {
    let filtered = [...txs];

    if (transactionFilters.search) {
      const search = transactionFilters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.Name.toLowerCase().includes(search) ||
        (t.Description && t.Description.toLowerCase().includes(search))
      );
    }

    if (transactionFilters.category) {
      filtered = filtered.filter(t => t.Category === transactionFilters.category);
    }

    if (transactionFilters.account) {
      filtered = filtered.filter(t => t.Account === transactionFilters.account);
    }

    if (transactionFilters.type) {
      filtered = filtered.filter(t => t.Type === transactionFilters.type);
    }

    if (transactionFilters.startDate) {
      filtered = filtered.filter(t => t.Date >= transactionFilters.startDate);
    }

    if (transactionFilters.endDate) {
      filtered = filtered.filter(t => t.Date <= transactionFilters.endDate);
    }

    if (transactionFilters.minAmount) {
      const min = parseFloat(transactionFilters.minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(t => Math.abs(t.Amount) >= min);
      }
    }

    if (transactionFilters.maxAmount) {
      const max = parseFloat(transactionFilters.maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(t => Math.abs(t.Amount) <= max);
      }
    }

    if (transactionFilters.reconciled === 'true') {
      filtered = filtered.filter(t => t.Reconciled === true);
    } else if (transactionFilters.reconciled === 'false') {
      filtered = filtered.filter(t => !t.Reconciled);
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    applyFilters(transactions);
  }, [transactionFilters]);

  useEffect(() => {
    if (authenticated) {
      loadFinanceData();
    }
  }, [authenticated, currentMonth, currentYear]);

  const handleAuth = async () => {
    if (!passcode.trim()) {
      setAuthError('Digite a senha');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      if (passcode.trim() === FLORA_PASSCODE) {
        setUserRole('flora');
        setAuthenticated(true);
        const goalsData = await getAllGoals();
        setGoals(goalsData);
        try {
          const allKPIs = await getFinancialKPIs(passcode);
          const filteredKPIs = allKPIs.filter(kpi => 
            kpi.Name.toLowerCase().includes('nubank') || 
            kpi.Name.toLowerCase().includes('pessoa física') ||
            kpi.Name.toLowerCase().includes('pessoal')
          );
          setFinancialKPIs(filteredKPIs);
        } catch (err) {
          console.warn('Could not load financial KPIs:', err);
        }
        toast.success('Acesso autorizado - Visualização limitada');
      } else if (passcode.trim() === FINANCE_PASSCODE) {
        setUserRole('admin');
        setAuthenticated(true);
        try {
          const kpis = await getFinancialKPIs(passcode);
          setFinancialKPIs(kpis);
        } catch (err) {
          console.warn('Could not load financial KPIs:', err);
        }
        const goalsData = await getAllGoals();
        setGoals(goalsData);
        try {
          const metrics = await getFinanceMetrics(passcode);
          setFinanceMetrics(metrics);
        } catch (err) {
          console.warn('Could not load finance metrics:', err);
        }
        toast.success('Acesso autorizado como administrador');
      } else {
        throw new Error('Senha incorreta');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Senha incorreta');
      toast.error('Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    
    if (categories.includes(trimmed)) {
      toast.error('Esta categoria já existe');
      return;
    }
    
    // Adicionar categoria localmente
    const updated = [...categories, trimmed];
    setCategories(updated);
    localStorage.setItem('finance_categories', JSON.stringify(updated));
    setNewCategoryName('');
    setShowAddCategoryDialog(false);
    toast.success(`Categoria "${trimmed}" adicionada com sucesso!`);
    
    // Nota: A categoria será adicionada ao Notion automaticamente quando for usada
    // O Notion cria opções de Select dinamicamente quando recebe um valor novo
  };

  const handleCreateBudgetGoal = async () => {
    try {
      // Validações
      if (!budgetForm.Name?.trim()) {
        toast.error('O nome é obrigatório');
        return;
      }
      
      if (!budgetForm.Category) {
        toast.error('Selecione uma categoria');
        return;
      }
      
      if (!budgetForm.BudgetAmount || budgetForm.BudgetAmount <= 0) {
        toast.error('O valor projetado deve ser maior que zero');
        return;
      }
      
      if (!budgetForm.PeriodStart) {
        toast.error('A data de início é obrigatória');
        return;
      }
      
      if (!budgetForm.PeriodEnd) {
        toast.error('A data de fim é obrigatória');
        return;
      }
      
      // Validar formato de data (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(budgetForm.PeriodStart)) {
        toast.error('Data de início inválida. Use o formato DD/MM/AAAA');
        return;
      }
      
      if (!dateRegex.test(budgetForm.PeriodEnd)) {
        toast.error('Data de fim inválida. Use o formato DD/MM/AAAA');
        return;
      }
      
      // Validar que data início < data fim
      const startDate = new Date(budgetForm.PeriodStart);
      const endDate = new Date(budgetForm.PeriodEnd);
      if (startDate >= endDate) {
        toast.error('A data de início deve ser anterior à data de fim');
        return;
      }
      
      // Validar mês e ano
      if (budgetForm.Month < 1 || budgetForm.Month > 12) {
        toast.error('Mês inválido (deve ser entre 1 e 12)');
        return;
      }
      
      if (budgetForm.Year < 2000 || budgetForm.Year > 2100) {
        toast.error('Ano inválido');
        return;
      }
      
      // Garantir que as datas estão no formato correto (YYYY-MM-DD)
      let normalizedStart = budgetForm.PeriodStart;
      let normalizedEnd = budgetForm.PeriodEnd;
      
      // Se as datas não estão no formato YYYY-MM-DD, converter
      if (normalizedStart.includes('/')) {
        const [day, month, year] = normalizedStart.split('/');
        normalizedStart = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      if (normalizedEnd.includes('/')) {
        const [day, month, year] = normalizedEnd.split('/');
        normalizedEnd = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const goalData = {
        ...budgetForm,
        PeriodStart: normalizedStart,
        PeriodEnd: normalizedEnd
      };
      
      await createBudgetGoal(goalData, passcode);
      toast.success('Meta de orçamento criada com sucesso!');
      setShowBudgetDialog(false);
      setBudgetForm({
        Name: '',
        Category: '',
        Month: currentMonth,
        Year: currentYear,
        BudgetAmount: 0,
        PeriodStart: '',
        PeriodEnd: '',
        Notes: ''
      });
      loadFinanceData();
    } catch (err: any) {
      console.error('Erro ao criar meta:', err);
      const errorMessage = err.message || 'Erro ao criar meta de orçamento';
      
      // Mensagens de erro mais amigáveis
      if (errorMessage.includes('string did not match') || errorMessage.includes('validation_error') || errorMessage.includes('invalid')) {
        toast.error('Erro de validação. Verifique se todos os campos estão preenchidos corretamente, especialmente as datas.');
      } else if (errorMessage.includes('select') || errorMessage.includes('Category')) {
        toast.error('A categoria será criada automaticamente no Notion. Tente novamente.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateBudgetGoal = async () => {
    if (!editingBudgetGoal) return;
    
    try {
      await updateBudgetGoal(editingBudgetGoal.id, budgetForm, passcode);
      toast.success('Meta atualizada com sucesso!');
      setShowBudgetDialog(false);
      setEditingBudgetGoal(null);
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar meta');
    }
  };

  const handleDeleteBudgetGoal = async (goal: BudgetGoal) => {
    if (!confirm(`Tem certeza que deseja deletar a meta "${goal.Name}"?`)) return;
    
    try {
      await deleteBudgetGoal(goal.id, passcode);
      toast.success('Meta deletada com sucesso!');
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao deletar meta');
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsPreviewing(true);
    try {
      const preview = await previewTransactions(file, importAccount, passcode);
      setImportPreview(preview);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer preview do arquivo');
      setSelectedFile(null);
      setImportPreview(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImportFile = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      const result = await importTransactions(selectedFile, importAccount, passcode);
      toast.success(`${result.imported} transações importadas com sucesso!`);
      if (result.duplicates > 0) {
        toast.info(`${result.duplicates} transações duplicadas foram ignoradas`);
      }
      
      // Aplicar regras de categorização automaticamente
      if (result.transactions && result.transactions.length > 0) {
        try {
          const transactionIds = result.transactions.map(t => t.id);
          const rulesResult = await applyCategorizationRules(transactionIds, passcode);
          if (rulesResult.updated > 0) {
            toast.success(`${rulesResult.updated} transações categorizadas automaticamente`);
          }
        } catch (err) {
          console.warn('Erro ao aplicar regras de categorização:', err);
          // Não falhar a importação se as regras falharem
        }
      }
      
      setShowImportDialog(false);
      setSelectedFile(null);
      setImportPreview(null);
      setImportAccount('Nubank');
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar transações');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
    setImportPreview(null);
    setImportAccount('Nubank');
  };

  const handleCategorizeTransaction = async (category: string) => {
    if (!categorizingTransaction) return;
    
    try {
      await updateTransaction(
        categorizingTransaction.id,
        { Category: category },
        passcode
      );
      toast.success('Transação categorizada com sucesso!');
      setShowCategorizeDialog(false);
      setCategorizingTransaction(null);
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao categorizar transação');
    }
  };

  const handleBulkCategorize = async (category: string) => {
    if (selectedTransactionIds.length === 0) {
      toast.error('Selecione pelo menos uma transação');
      return;
    }
    
    try {
      await bulkCategorizeTransactions(selectedTransactionIds, category, undefined, passcode);
      toast.success(`${selectedTransactionIds.length} transações categorizadas!`);
      setSelectedTransactionIds([]);
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao categorizar transações');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Dashboard Financeiro
            </CardTitle>
            <CardDescription>
              Entre com a senha para acessar os dados financeiros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Senha"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              disabled={loading}
            />
            <Button className="w-full" onClick={handleAuth} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <Link to="/dashboard" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="px-1">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 md:h-8 w-8 text-primary" />
              Dashboard Financeiro
            </h1>
            <p className="text-lg md:text-xl font-semibold text-primary italic">
              O QUE IMPORTA É O SEU RESULTADO
            </p>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestão de orçamento e acompanhamento de gastos
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {userRole === 'flora' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Visualização limitada: Apenas dados da conta Nubank (Pessoa Física)
            </AlertDescription>
          </Alert>
        )}

        {/* Finance Summary Cards */}
        {summary && userRole === 'admin' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Métricas Principais</h2>
            <FinanceMetricsCards summary={summary} />
          </div>
        )}

        {/* Main Content Tabs */}
        {userRole === 'admin' && (
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="budget">Orçamento</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
                <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
                <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
                <TabsTrigger value="categorization">Categorização</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Select
                  value={currentMonth.toString()}
                  onValueChange={(v) => setCurrentMonth(parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currentYear.toString()}
                  onValueChange={(v) => setCurrentYear(parseInt(v))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
          </div>
            </div>

            {/* Visão Geral Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(summary.totalBudgeted)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(summary.totalSpent)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${
                          summary.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(summary.availableBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              
              {summary && summary.topCategories && summary.topCategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top 3 Categorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {summary.topCategories.slice(0, 3).map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{cat.category}</span>
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(cat.spent)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BudgetComparisonChart budgetGoals={budgetGoals} />
                <ExpenseCategoryChart transactions={transactions} />
              </div>

              <CashFlowChart transactions={transactions} days={30} />
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Metas de Orçamento</h2>
                <Button onClick={() => {
                  setEditingBudgetGoal(null);
                  setBudgetForm({
                    Name: '',
                    Category: '',
                    Month: currentMonth,
                    Year: currentYear,
                    BudgetAmount: 0,
                    PeriodStart: '',
                    PeriodEnd: '',
                    Notes: ''
                  });
                  setShowBudgetDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </div>

              {budgetGoals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Nenhuma meta de orçamento cadastrada para este período
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetGoals.map((goal) => (
                    <BudgetGoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(g) => {
                        setEditingBudgetGoal(g);
                        setBudgetForm({
                          Name: g.Name,
                          Category: g.Category,
                          Month: g.Month,
                          Year: g.Year,
                          BudgetAmount: g.BudgetAmount,
                          PeriodStart: g.PeriodStart,
                          PeriodEnd: g.PeriodEnd,
                          Notes: g.Notes || ''
                        });
                        setShowBudgetDialog(true);
                      }}
                      onDelete={handleDeleteBudgetGoal}
                    />
              ))}
            </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold">Transações</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Extrato
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingTransaction(null);
                      setTransactionForm({
                        Name: '',
                        Date: new Date().toISOString().split('T')[0],
                        Amount: 0,
                        Type: 'Saída',
                        Account: '',
                        Category: '',
                        Description: ''
                      });
                      setShowTransactionDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
          </div>
              </div>

              {showFilters && (
                <Card>
                  <CardHeader>
                    <CardTitle>Filtros Avançados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Buscar</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por descrição..."
                            value={transactionFilters.search}
                            onChange={(e) => setTransactionFilters({ ...transactionFilters, search: e.target.value })}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={transactionFilters.category}
                          onValueChange={(v) => setTransactionFilters({ ...transactionFilters, category: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={transactionFilters.type}
                          onValueChange={(v) => setTransactionFilters({ ...transactionFilters, type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="Entrada">Entrada</SelectItem>
                            <SelectItem value="Saída">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Input
                          type="date"
                          value={transactionFilters.startDate}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Input
                          type="date"
                          value={transactionFilters.endDate}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Mínimo</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={transactionFilters.minAmount}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, minAmount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Máximo</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={transactionFilters.maxAmount}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, maxAmount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conciliação</Label>
                        <Select
                          value={transactionFilters.reconciled}
                          onValueChange={(v) => setTransactionFilters({ ...transactionFilters, reconciled: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="true">Conciliadas</SelectItem>
                            <SelectItem value="false">Não Conciliadas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTransactionFilters({
                            search: '',
                            category: '',
                            account: '',
                            type: '',
                            startDate: '',
                            endDate: '',
                            minAmount: '',
                            maxAmount: '',
                            reconciled: ''
                          });
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTransactionIds.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {selectedTransactionIds.length} transação(ões) selecionada(s)
                      </span>
                      <div className="flex gap-2">
                        <Select onValueChange={(v) => {
                          if (v === '__add_new__') {
                            setShowAddCategoryDialog(true);
                          } else {
                            handleBulkCategorize(v);
                          }
                        }}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Categorizar em massa" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__" className="text-primary font-medium">
                              <Plus className="h-4 w-4 inline mr-2" />
                              Nova Categoria
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTransactionIds([])}
                        >
                          Limpar seleção
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredTransactions.length > 0 ? filteredTransactions.length : transactions.length} de {transactions.length} transações
                </div>
                {transactions.filter(t => !t.Category).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const uncategorized = transactions.filter(t => !t.Category);
                      toast.info(`${uncategorized.length} transações sem categoria. Use a categorização em massa acima.`);
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Ver não categorizadas ({transactions.filter(t => !t.Category).length})
                  </Button>
                )}
              </div>

              <TransactionTable
                transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions}
                onEdit={(t) => {
                  setEditingTransaction(t);
                  setTransactionForm({
                    Name: t.Name,
                    Date: t.Date,
                    Amount: t.Amount,
                    Type: t.Type,
                    Account: t.Account,
                    Category: t.Category || '',
                    Description: t.Description || ''
                  });
                  setShowTransactionDialog(true);
                }}
                onDelete={async (t) => {
                  if (confirm(`Deletar transação "${t.Name}"?`)) {
                    try {
                      await deleteTransaction(t.id, passcode);
                      toast.success('Transação deletada!');
                      loadFinanceData();
                    } catch (err: any) {
                      toast.error(err.message || 'Erro ao deletar');
                    }
                  }
                }}
                onCategorize={(t) => {
                  setCategorizingTransaction(t);
                  setShowCategorizeDialog(true);
                }}
                selectedIds={selectedTransactionIds}
                onSelect={(id) => {
                  setSelectedTransactionIds(prev =>
                    prev.includes(id)
                      ? prev.filter(i => i !== id)
                      : [...prev, id]
                  );
                }}
                showCheckbox={true}
              />
            </TabsContent>

            {/* Contas Bancárias Tab */}
            <TabsContent value="accounts" className="space-y-4">
              <AccountsManager passcode={passcode} />
            </TabsContent>

            {/* Contas a Pagar Tab */}
            <TabsContent value="payable" className="space-y-4">
              <AccountsPayableTable passcode={passcode} categories={categories} />
            </TabsContent>

            {/* Contas a Receber Tab */}
            <TabsContent value="receivable" className="space-y-4">
              <AccountsReceivableTable passcode={passcode} categories={categories} />
            </TabsContent>

            {/* Fluxo de Caixa Tab */}
            <TabsContent value="cashflow" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <CashFlowChart transactions={transactions} days={30} />
                <CashFlowChart transactions={transactions} days={60} />
                <CashFlowChart transactions={transactions} days={90} />
              </div>
            </TabsContent>

            {/* Relatórios Tab */}
            <TabsContent value="reports" className="space-y-4">
              <ReportsGenerator
                transactions={transactions}
                budgetGoals={budgetGoals}
                summary={summary}
                passcode={passcode}
              />
            </TabsContent>

            <TabsContent value="categorization" className="space-y-4">
              <CategorizationRulesManager
                passcode={passcode}
                transactionIds={selectedTransactions.length > 0 ? selectedTransactions : undefined}
                onApplyRules={() => {
                  loadFinanceData();
                  setSelectedTransactions([]);
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Financial KPIs Grid */}
        {financialKPIs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">KPIs Financeiros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {financialKPIs.map((kpi) => {
                const goal = goals.find(g => g.KPI === kpi.id);
                return <KPICard key={kpi.id} kpi={kpi as NotionKPI} goal={goal} />;
              })}
            </div>
          </div>
        )}

        {/* Budget Goal Dialog */}
        <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBudgetGoal ? 'Editar Meta de Orçamento' : 'Nova Meta de Orçamento'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={budgetForm.Name}
                    onChange={(e) => setBudgetForm({ ...budgetForm, Name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={budgetForm.Category}
                    onValueChange={(v) => {
                      if (v === '__add_new__') {
                        setShowAddCategoryDialog(true);
                      } else {
                        setBudgetForm({ ...budgetForm, Category: v });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__add_new__" className="text-primary font-medium">
                        <Plus className="h-4 w-4 inline mr-2" />
                        Nova Categoria
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor projetado (R$) *</Label>
                  <CurrencyInput
                    id="amount"
                    value={budgetForm.BudgetAmount}
                    onChange={(value) => setBudgetForm({ ...budgetForm, BudgetAmount: value })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodStart">Início do Período *</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={budgetForm.PeriodStart}
                    onChange={(e) => setBudgetForm({ ...budgetForm, PeriodStart: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodEnd">Fim do Período *</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={budgetForm.PeriodEnd}
                  onChange={(e) => setBudgetForm({ ...budgetForm, PeriodEnd: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={budgetForm.Notes}
                  onChange={(e) => setBudgetForm({ ...budgetForm, Notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={editingBudgetGoal ? handleUpdateBudgetGoal : handleCreateBudgetGoal}>
                {editingBudgetGoal ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={handleCloseImportDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Importar Extrato</DialogTitle>
              <DialogDescription>
                Selecione um arquivo CSV ou OFX para importar transações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account">Conta Bancária</Label>
                <Select 
                  value={importAccount} 
                  onValueChange={setImportAccount}
                  disabled={!!selectedFile}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nubank">Nubank</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo (CSV ou OFX)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.ofx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  disabled={isPreviewing || isImporting}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Preview Section */}
              {isPreviewing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Analisando arquivo...</span>
                </div>
              )}

              {importPreview && !isPreviewing && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Preview das Transações</h3>
                    <div className="text-sm text-muted-foreground">
                      Total: {importPreview.total} | 
                      Novas: {importPreview.total - importPreview.duplicates} | 
                      Duplicadas: {importPreview.duplicates}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background border-b">
                        <tr>
                          <th className="text-left p-2">Data</th>
                          <th className="text-left p-2">Descrição</th>
                          <th className="text-right p-2">Valor</th>
                          <th className="text-center p-2">Tipo</th>
                          <th className="text-center p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.transactions.slice(0, 50).map((t, idx) => (
                          <tr 
                            key={idx} 
                            className={`border-b ${t.isDuplicate ? 'bg-muted/50' : ''}`}
                          >
                            <td className="p-2">{new Date(t.Date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-2">{t.Name}</td>
                            <td className="p-2 text-right">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(t.Amount)}
                            </td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                t.Type === 'Entrada' 
                                  ? 'bg-green-500/20 text-green-600' 
                                  : 'bg-red-500/20 text-red-600'
                              }`}>
                                {t.Type}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {t.isDuplicate ? (
                                <span className="text-xs text-yellow-600">Duplicada</span>
                              ) : (
                                <span className="text-xs text-green-600">Nova</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.transactions.length > 50 && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Mostrando 50 de {importPreview.transactions.length} transações
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleCloseImportDialog}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              {selectedFile && importPreview && (
                <Button 
                  onClick={handleImportFile}
                  disabled={isImporting || isPreviewing}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar {importPreview.total - importPreview.duplicates} transações
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Categorize Dialog */}
        <Dialog open={showCategorizeDialog} onOpenChange={setShowCategorizeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Categorizar Transação</DialogTitle>
              <DialogDescription>
                {categorizingTransaction?.Name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select onValueChange={(v) => {
                  if (v === '__add_new__') {
                    setShowAddCategoryDialog(true);
                  } else {
                    handleCategorizeTransaction(v);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__" className="text-primary font-medium">
                      <Plus className="h-4 w-4 inline mr-2" />
                      Nova Categoria
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategorizeDialog(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria para organizar suas metas e transações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newCategory">Nome da Categoria *</Label>
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Habitação, Alimentação, Transporte..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddCategoryDialog(false);
                setNewCategoryName('');
              }}>
                Cancelar
              </Button>
              <Button onClick={handleAddCategory}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
