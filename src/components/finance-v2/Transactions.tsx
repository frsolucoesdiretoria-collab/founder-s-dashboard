// Transactions - Gerenciamento de Lançamentos

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Upload,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import {
  MOCK_TRANSACTIONS,
  getAccountPlanById,
  getCostCenterById,
  getBankAccountById,
  type EntityType,
  type TransactionType,
} from '@/lib/finance-v2-data';
import { useFinanceConfig } from '@/contexts/FinanceConfigContext';
import { toast } from 'sonner';

export function Transactions() {
  const { accountPlans, costCenters, bankAccounts } = useFinanceConfig();
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [filterEntity, setFilterEntity] = useState<EntityType | 'all'>('all');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  
  // Novo lançamento
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    entity: 'PF',
    type: 'Saída',
    date: new Date().toISOString().split('T')[0],
    status: 'Confirmada',
    imported: false
  });

  const filteredTransactions = transactions.filter(t => {
    const matchEntity = filterEntity === 'all' || t.entity === filterEntity;
    const matchType = filterType === 'all' || t.type === filterType;
    return matchEntity && matchType;
  });

  const handleCreateTransaction = () => {
    if (!newTransaction.entity || !newTransaction.type || !newTransaction.date ||
        !newTransaction.accountPlanId || !newTransaction.costCenterId || 
        !newTransaction.bankAccountId || !newTransaction.amount || !newTransaction.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const transaction: Transaction = {
      id: `t-${Date.now()}`,
      date: newTransaction.date!,
      entity: newTransaction.entity!,
      type: newTransaction.type!,
      accountPlanId: newTransaction.accountPlanId!,
      costCenterId: newTransaction.costCenterId!,
      bankAccountId: newTransaction.bankAccountId!,
      amount: newTransaction.amount!,
      description: newTransaction.description!,
      status: newTransaction.status || 'Confirmada',
      imported: false
    };

    setTransactions([transaction, ...transactions]);
    setNewTransactionOpen(false);
    setNewTransaction({
      entity: 'PF',
      type: 'Saída',
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmada',
      imported: false
    });
    toast.success('Lançamento criado com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Filtrar planos de conta, centros de custo e contas bancárias baseado na entidade selecionada
  const availableAccountPlans = accountPlans.filter(ap => 
    ap.entity.includes(newTransaction.entity!) && 
    (newTransaction.type === 'Entrada' ? ap.type === 'Receita' : ap.type === 'Despesa')
  );

  const availableCostCenters = costCenters.filter(cc => 
    cc.entity.includes(newTransaction.entity!)
  );

  const availableBankAccounts = bankAccounts.filter(ba => 
    ba.entity === newTransaction.entity
  );

  // Calcular totais dos filtros atuais
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lançamentos</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
                <DialogDescription>
                  Preencha todos os campos para registrar um lançamento
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity">Entidade *</Label>
                    <Select 
                      value={newTransaction.entity} 
                      onValueChange={(value: EntityType) => setNewTransaction({ ...newTransaction, entity: value })}
                    >
                      <SelectTrigger id="entity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select 
                      value={newTransaction.type} 
                      onValueChange={(value: TransactionType) => setNewTransaction({ ...newTransaction, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Receita</SelectItem>
                        <SelectItem value="Saída">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input 
                    id="date"
                    type="date" 
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Conta Bancária *</Label>
                  <Select 
                    value={newTransaction.bankAccountId} 
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, bankAccountId: value })}
                  >
                    <SelectTrigger id="bankAccount">
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBankAccounts.map(ba => (
                        <SelectItem key={ba.id} value={ba.id}>{ba.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountPlan">Plano de Contas *</Label>
                  <Select 
                    value={newTransaction.accountPlanId} 
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, accountPlanId: value })}
                  >
                    <SelectTrigger id="accountPlan">
                      <SelectValue placeholder="Selecione o plano de contas" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccountPlans.map(ap => (
                        <SelectItem key={ap.id} value={ap.id}>{ap.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costCenter">Centro de Custo *</Label>
                  <Select 
                    value={newTransaction.costCenterId} 
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, costCenterId: value })}
                  >
                    <SelectTrigger id="costCenter">
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCostCenters.map(cc => (
                        <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input 
                    id="amount"
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea 
                    id="description"
                    placeholder="Ex: Pagamento de aluguel"
                    value={newTransaction.description || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTransactionOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTransaction}>
                  Criar Lançamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2" disabled>
            <Upload className="h-4 w-4" />
            Importar Extrato
          </Button>
        </div>
      </div>

      {/* Resumo e Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {filteredTransactions.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Entidade</Label>
              <Select value={filterEntity} onValueChange={(value: any) => setFilterEntity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Entrada">Receitas</SelectItem>
                  <SelectItem value="Saída">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Lançamentos</CardTitle>
          <CardDescription>
            {filteredTransactions.length} lançamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Plano de Contas</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                      Nenhum lançamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const accountPlan = getAccountPlanById(transaction.accountPlanId);
                    const costCenter = getCostCenterById(transaction.costCenterId);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'Entrada' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span>{transaction.type === 'Entrada' ? 'Receita' : 'Despesa'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.entity}</Badge>
                        </TableCell>
                        <TableCell>{accountPlan?.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {costCenter?.name}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === 'Confirmada' 
                                ? 'default' 
                                : transaction.status === 'Conciliada' 
                                ? 'default' 
                                : 'secondary'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
