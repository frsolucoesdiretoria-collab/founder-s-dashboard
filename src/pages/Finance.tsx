import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/KPICard';
import { DollarSign, Lock, ArrowLeft, Loader2, AlertCircle, Upload, FileText, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getFinancialKPIs, getFinanceMetrics, getTransactions, importTransactionsFromCSV } from '@/services';
import { validateAdminPasscode } from '@/services/health.service';
import type { KPI } from '@/types/kpi';
import type { NotionKPI, NotionGoal, NotionTransaction } from '@/lib/notion/types';
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
  const [transactions, setTransactions] = useState<NotionTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FINANCE_PASSCODE = '06092021';
  const FLORA_PASSCODE = 'flora123';

  const handleAuth = async () => {
    if (!passcode.trim()) {
      setAuthError('Digite a senha');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      // Check if it's Flora's passcode
      if (passcode.trim() === FLORA_PASSCODE) {
        // Flora access - only Nubank/personal finance data
        setUserRole('flora');
        setAuthenticated(true);
        
        // Load data in background (don't block authentication)
        Promise.all([
          // Load goals
          getAllGoals().then(goalsData => {
            setGoals(goalsData);
          }).catch(err => {
            console.warn('Could not load goals:', err);
          }),
          
          // Load financial KPIs - Flora vê apenas pessoais, admin vê todos
          getFinancialKPIs(passcode).then(allKPIs => {
            // Para Flora, filtrar apenas KPIs pessoais/Nubank
            // Para admin, mostrar todos os KPIs financeiros
            if (userRole === 'flora') {
              const filteredKPIs = allKPIs.filter(kpi => 
                kpi.Name.toLowerCase().includes('nubank') || 
                kpi.Name.toLowerCase().includes('pessoa física') ||
                kpi.Name.toLowerCase().includes('pessoal') ||
                kpi.Category?.toLowerCase().includes('pessoal')
              );
              setFinancialKPIs(filteredKPIs);
            } else {
              // Admin vê todos os KPIs financeiros
              setFinancialKPIs(allKPIs);
            }
          }).catch(err => {
            console.warn('Could not load financial KPIs:', err);
            // Não bloquear acesso se KPIs não carregarem
          }),
          
          // Load transactions
          getTransactions(passcode, {}).then(transactions => {
            setTransactions(transactions);
          }).catch(err => {
            console.warn('Could not load transactions:', err);
            // Não bloquear acesso se transações não carregarem
          })
        ]).catch(err => {
          console.warn('Error loading data:', err);
          // Não bloquear acesso
        });
        
        toast.success('Acesso autorizado - Visualização limitada');
      } else if (passcode.trim() === FINANCE_PASSCODE) {
        // Finance access with new passcode
        setUserRole('admin');
        setAuthenticated(true);
        
        // Load data in background (don't block authentication)
        // Admin vê TODOS os KPIs financeiros
        Promise.all([
          // Load goals to match with KPIs
          getAllGoals().then(goalsData => {
            setGoals(goalsData);
          }).catch(err => {
            console.warn('Could not load goals:', err);
          }),
          
          // Load financial KPIs - Admin vê TODOS os KPIs financeiros (sem filtro)
          getFinancialKPIs(passcode).then(kpis => {
            // Admin não tem filtro - mostra todos os KPIs financeiros
            setFinancialKPIs(kpis);
          }).catch(err => {
            console.warn('Could not load financial KPIs:', err);
            console.error('Erro detalhado ao carregar KPIs:', err);
          }),
          
          // Load finance metrics from DB11
          getFinanceMetrics(passcode).then(metrics => {
            setFinanceMetrics(metrics);
          }).catch(err => {
            console.warn('Could not load finance metrics:', err);
          }),
          
          // Load transactions
          getTransactions(passcode, {}).then(transactions => {
            setTransactions(transactions);
          }).catch(err => {
            console.warn('Could not load transactions:', err);
          })
        ]).catch(err => {
          console.warn('Error loading data:', err);
          // Não bloquear acesso
        });
        
        toast.success('Acesso autorizado como administrador');
      } else {
        // Senha inválida
        setAuthError('Senha incorreta. Tente novamente.');
        toast.error('Senha incorreta');
      }
    } catch (err: any) {
      console.error('Error during authentication:', err);
      setAuthError(err.message || 'Erro ao autenticar. Tente novamente.');
      toast.error('Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions after authentication
  useEffect(() => {
    if (authenticated && passcode) {
      loadTransactions();
    }
  }, [authenticated, passcode, filterType, filterAccount]);

  const loadTransactions = async () => {
    if (!passcode) return;
    
    setLoadingTransactions(true);
    try {
      const filters: any = {};
      if (filterType !== 'all') {
        filters.type = filterType as 'Entrada' | 'Saída';
      }
      if (filterAccount !== 'all') {
        filters.account = filterAccount;
      }
      
      const data = await getTransactions(passcode, filters);
      setTransactions(data);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      // Don't show error if database is not configured
      if (!err.message?.includes('not configured')) {
        toast.error('Erro ao carregar transações');
      }
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedAccount) {
      toast.error('Selecione uma conta antes de importar');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csv = e.target?.result as string;
        if (!csv) {
          toast.error('Erro ao ler arquivo');
          return;
        }

        try {
          const result = await importTransactionsFromCSV(passcode, csv, file.name, selectedAccount);
          toast.success(`Importação concluída: ${result.created} transações criadas, ${result.skipped} ignoradas`);
          
          // Reload transactions
          await loadTransactions();
          
          // Reset form
          setShowUpload(false);
          setSelectedAccount('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err: any) {
          toast.error(err.message || 'Erro ao importar transações');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } catch (err: any) {
      toast.error('Erro ao processar arquivo');
      setUploading(false);
    }
  };

  // Get unique accounts from transactions
  const accounts = Array.from(new Set(transactions.map(t => t.Account).filter(Boolean)));

  // Calculate totals
  const totalEntradas = transactions
    .filter(t => t.Type === 'Entrada')
    .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
  const totalSaidas = transactions
    .filter(t => t.Type === 'Saída')
    .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
  const saldo = totalEntradas - totalSaidas;

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
        {/* Header with quote */}
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
            Métricas financeiras em tempo real
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Role Info */}
        {userRole === 'flora' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Visualização limitada: Apenas dados da conta Nubank (Pessoa Física)
            </AlertDescription>
          </Alert>
        )}

        {/* Financial KPIs Grid */}
        {financialKPIs.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {userRole === 'flora' 
                ? 'Nenhum KPI financeiro encontrado para a conta Nubank.'
                : 'Nenhum KPI financeiro configurado.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {financialKPIs.map((kpi) => {
              const goal = goals.find(g => g.KPI === kpi.id);
              return <KPICard key={kpi.id} kpi={kpi as NotionKPI} goal={goal} />;
            })}
          </div>
        )}

        {/* Finance Metrics from DB11 - Only for admin */}
        {userRole === 'admin' && financeMetrics.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Métricas Financeiras (DB11)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {financeMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{metric.Name || 'Métrica'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {metric.Value || '—'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transações Financeiras
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus extratos e transações bancárias
              </p>
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Extrato
            </Button>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Importar Extrato CSV</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Selecione o arquivo CSV do extrato bancário para importar as transações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-select">Conta Bancária *</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger id="account-select">
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nubank - Pessoa Física">Nubank - Pessoa Física</SelectItem>
                      <SelectItem value="Nubank - Empresa">Nubank - Empresa</SelectItem>
                      <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                      <SelectItem value="Itaú">Itaú</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Arquivo CSV *</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={uploading || !selectedAccount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos suportados: CSV do Nubank ou outros bancos (Data, Descrição, Valor)
                  </p>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando transações...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Total Entradas
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    Total Saídas
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Saldo
                  </div>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          {transactions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="filter-type">Tipo</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger id="filter-type">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Entrada">Entradas</SelectItem>
                        <SelectItem value="Saída">Saídas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {accounts.length > 0 && (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="filter-account">Conta</Label>
                      <Select value={filterAccount} onValueChange={setFilterAccount}>
                        <SelectTrigger id="filter-account">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {accounts.map(account => (
                            <SelectItem key={account} value={account}>{account}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          {loadingTransactions ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando transações...
                </div>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma transação encontrada.</p>
                  <p className="text-sm mt-1">Importe um extrato CSV para começar.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.Date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {transaction.Name}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.Type === 'Entrada' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {transaction.Type}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.Account}</TableCell>
                          <TableCell>{transaction.Category || '—'}</TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.Type === 'Entrada' ? 'text-primary' : 'text-destructive'
                          }`}>
                            {transaction.Type === 'Entrada' ? '+' : '-'} R$ {Math.abs(transaction.Amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Back Button */}
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

