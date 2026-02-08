// Budgets - Gerenciamento de Orçamentos Mensais

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  MONTHLY_BUDGETS,
  getAccountPlanById,
  type EntityType,
  type MonthlyBudget
} from '@/lib/finance-v2-data';
import { useFinanceConfig } from '@/contexts/FinanceConfigContext';
import { toast } from 'sonner';

const CURRENT_MONTH = '2026-01';

export function Budgets() {
  const { accountPlans } = useFinanceConfig();
  const [budgets, setBudgets] = useState(MONTHLY_BUDGETS);
  const [newBudgetOpen, setNewBudgetOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('PF');
  
  const [newBudget, setNewBudget] = useState<Partial<MonthlyBudget>>({
    month: CURRENT_MONTH,
    entity: 'PF',
    spentAmount: 0
  });

  const handleCreateBudget = () => {
    if (!newBudget.entity || !newBudget.month || !newBudget.accountPlanId || !newBudget.budgetAmount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se já existe orçamento para este plano de contas no mês
    const exists = budgets.find(
      b => b.entity === newBudget.entity && 
           b.month === newBudget.month && 
           b.accountPlanId === newBudget.accountPlanId
    );

    if (exists) {
      toast.error('Já existe um orçamento para este plano de contas no mês selecionado');
      return;
    }

    const budget: MonthlyBudget = {
      id: `b-${Date.now()}`,
      month: newBudget.month!,
      entity: newBudget.entity!,
      accountPlanId: newBudget.accountPlanId!,
      budgetAmount: newBudget.budgetAmount!,
      spentAmount: 0,
      notes: newBudget.notes
    };

    setBudgets([...budgets, budget]);
    setNewBudgetOpen(false);
    setNewBudget({
      month: CURRENT_MONTH,
      entity: 'PF',
      spentAmount: 0
    });
    toast.success('Orçamento criado com sucesso!');
  };

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

  const getStatusIcon = (status: 'success' | 'warning' | 'danger') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const renderBudgetsByEntity = (entity: EntityType) => {
    const entityBudgets = budgets.filter(b => b.entity === entity && b.month === CURRENT_MONTH);
    
    if (entityBudgets.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum orçamento definido para {entity}</p>
          <p className="text-sm">Clique em "Novo Orçamento" para começar</p>
        </div>
      );
    }

    const totalBudget = entityBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = entityBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Agrupar por categoria
    const budgetsByCategory = entityBudgets.reduce((acc, budget) => {
      const plan = getAccountPlanById(budget.accountPlanId);
      if (plan) {
        const category = plan.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(budget);
      }
      return acc;
    }, {} as Record<string, MonthlyBudget[]>);

    return (
      <div className="space-y-6">
        {/* Resumo Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo Geral - {entity}</CardTitle>
            <CardDescription>Janeiro 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Gasto Total</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
              <Progress value={totalPercentage} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consumido</span>
                <span className="font-semibold">{totalPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Disponível</span>
                <span className="font-semibold">{formatCurrency(totalBudget - totalSpent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orçamentos por Categoria */}
        {Object.entries(budgetsByCategory).map(([category, categoryBudgets]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
              <CardDescription>
                {categoryBudgets.length} plano(s) de contas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBudgets.map((budget) => {
                  const plan = getAccountPlanById(budget.accountPlanId);
                  const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
                  const status = getBudgetStatus(percentage);
                  const remaining = budget.budgetAmount - budget.spentAmount;
                  
                  return (
                    <div key={budget.id} className="space-y-3 p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(status)}
                          <div>
                            <p className="font-medium">{plan?.name}</p>
                            {budget.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{budget.notes}</p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            status === 'danger' 
                              ? 'destructive' 
                              : status === 'warning' 
                              ? 'default' 
                              : 'outline'
                          }
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
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
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Orçado</p>
                          <p className="font-semibold">{formatCurrency(budget.budgetAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Gasto</p>
                          <p className="font-semibold text-red-600">{formatCurrency(budget.spentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Disponível</p>
                          <p className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Planos de conta disponíveis (apenas despesas)
  const availableAccountPlans = accountPlans.filter(ap => 
    ap.entity.includes(newBudget.entity!) && ap.type === 'Despesa'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orçamentos Mensais</h2>
          <p className="text-muted-foreground">Defina e acompanhe suas metas de gastos</p>
        </div>
        <Dialog open={newBudgetOpen} onOpenChange={setNewBudgetOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
              <DialogDescription>
                Defina o valor máximo para um plano de contas no mês
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity">Entidade *</Label>
                  <Select 
                    value={newBudget.entity} 
                    onValueChange={(value: EntityType) => setNewBudget({ ...newBudget, entity: value })}
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
                  <Label htmlFor="month">Mês *</Label>
                  <Input 
                    id="month"
                    type="month" 
                    value={newBudget.month}
                    onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountPlan">Plano de Contas *</Label>
                <Select 
                  value={newBudget.accountPlanId} 
                  onValueChange={(value) => setNewBudget({ ...newBudget, accountPlanId: value })}
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
                <Label htmlFor="budgetAmount">Valor do Orçamento *</Label>
                <Input 
                  id="budgetAmount"
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={newBudget.budgetAmount || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input 
                  id="notes"
                  placeholder="Ex: Meta reduzida este mês"
                  value={newBudget.notes || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewBudgetOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBudget}>
                Criar Orçamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs PF/PJ */}
      <Tabs value={selectedEntity} onValueChange={(value: any) => setSelectedEntity(value)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="PF">Pessoa Física</TabsTrigger>
          <TabsTrigger value="PJ">Pessoa Jurídica</TabsTrigger>
        </TabsList>

        <TabsContent value="PF" className="space-y-6 mt-6">
          {renderBudgetsByEntity('PF')}
        </TabsContent>

        <TabsContent value="PJ" className="space-y-6 mt-6">
          {renderBudgetsByEntity('PJ')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
