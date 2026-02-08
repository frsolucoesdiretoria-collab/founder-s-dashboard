// FinanceSettings - Configurações do Sistema Financeiro com CRUD

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  CreditCard, 
  FolderTree, 
  Target,
  Info,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceConfig } from '@/contexts/FinanceConfigContext';
import type { EntityType } from '@/lib/finance-v2-data';

export function FinanceSettings() {
  const { accountPlans, costCenters, bankAccounts, addAccountPlan, removeAccountPlan, addCostCenter, removeCostCenter, addBankAccount, removeBankAccount } = useFinanceConfig();
  
  // Dialogs state
  const [openAccountPlanDialog, setOpenAccountPlanDialog] = useState(false);
  const [openCostCenterDialog, setOpenCostCenterDialog] = useState(false);
  const [openBankAccountDialog, setOpenBankAccountDialog] = useState(false);
  
  // Form state
  const [accountPlanForm, setAccountPlanForm] = useState({
    type: 'Receita' as 'Receita' | 'Despesa',
    entity: 'PF' as EntityType,
    name: '',
    category: 'Receita' as 'Receita' | 'Essencial' | 'Variável' | 'Investimento' | 'Dívida',
    color: '#10b981'
  });
  
  const [costCenterForm, setCostCenterForm] = useState({
    entity: 'PF' as EntityType,
    name: '',
    description: ''
  });
  
  const [bankAccountForm, setBankAccountForm] = useState({
    entity: 'PF' as EntityType,
    name: '',
    type: 'Conta Corrente' as 'Conta Corrente' | 'Poupança' | 'Investimento',
    balance: 0
  });
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'account' | 'cost' | 'bank', id: string } | null>(null);

  // Handlers
  const handleAddAccountPlan = () => {
    if (!accountPlanForm.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }
    
    addAccountPlan({
      name: accountPlanForm.name,
      type: accountPlanForm.type,
      category: accountPlanForm.category,
      entity: [accountPlanForm.entity],
      color: accountPlanForm.color
    });
    
    toast.success(`Categoria de ${accountPlanForm.type} adicionada!`);
    setOpenAccountPlanDialog(false);
    setAccountPlanForm({
      type: 'Receita',
      entity: 'PF',
      name: '',
      category: 'Receita',
      color: '#10b981'
    });
  };
  
  const handleAddCostCenter = () => {
    if (!costCenterForm.name.trim()) {
      toast.error('Nome do centro de custo é obrigatório');
      return;
    }
    
    addCostCenter({
      name: costCenterForm.name,
      entity: [costCenterForm.entity],
      description: costCenterForm.description
    });
    
    toast.success('Centro de custo adicionado!');
    setOpenCostCenterDialog(false);
    setCostCenterForm({
      entity: 'PF',
      name: '',
      description: ''
    });
  };
  
  const handleAddBankAccount = () => {
    if (!bankAccountForm.name.trim()) {
      toast.error('Nome da conta bancária é obrigatório');
      return;
    }
    
    addBankAccount({
      name: bankAccountForm.name,
      entity: bankAccountForm.entity,
      type: bankAccountForm.type,
      balance: bankAccountForm.balance
    });
    
    toast.success('Conta bancária adicionada!');
    setOpenBankAccountDialog(false);
    setBankAccountForm({
      entity: 'PF',
      name: '',
      type: 'Conta Corrente',
      balance: 0
    });
  };
  
  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'account') {
      removeAccountPlan(deleteConfirm.id);
      toast.success('Categoria removida!');
    } else if (deleteConfirm.type === 'cost') {
      removeCostCenter(deleteConfirm.id);
      toast.success('Centro de custo removido!');
    } else if (deleteConfirm.type === 'bank') {
      removeBankAccount(deleteConfirm.id);
      toast.success('Conta bancária removida!');
    }
    
    setDeleteConfirm(null);
  };

  const renderAccountPlans = (entity: EntityType) => {
    const plans = accountPlans.filter(ap => ap.entity.includes(entity));
    const receitas = plans.filter(ap => ap.type === 'Receita');
    const despesas = plans.filter(ap => ap.type === 'Despesa');
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-600">Receitas</h4>
            <Dialog open={openAccountPlanDialog && accountPlanForm.type === 'Receita' && accountPlanForm.entity === entity} onOpenChange={(open) => {
              if (open) {
                setAccountPlanForm({ type: 'Receita', entity, name: '', category: 'Receita', color: '#10b981' });
              }
              setOpenAccountPlanDialog(open);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria de Receita ({entity})</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova categoria de receita
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account-name">Nome da Categoria *</Label>
                    <Input
                      id="account-name"
                      value={accountPlanForm.name}
                      onChange={(e) => setAccountPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Dividendos, Rendimentos..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-color">Cor</Label>
                    <Input
                      id="account-color"
                      type="color"
                      value={accountPlanForm.color}
                      onChange={(e) => setAccountPlanForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAccountPlanDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddAccountPlan}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {receitas.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{plan.category}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteConfirm({ type: 'account', id: plan.id })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-red-600">Despesas</h4>
            <Dialog open={openAccountPlanDialog && accountPlanForm.type === 'Despesa' && accountPlanForm.entity === entity} onOpenChange={(open) => {
              if (open) {
                setAccountPlanForm({ type: 'Despesa', entity, name: '', category: 'Essencial', color: '#f59e0b' });
              }
              setOpenAccountPlanDialog(open);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria de Despesa ({entity})</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova categoria de despesa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expense-name">Nome da Categoria *</Label>
                    <Input
                      id="expense-name"
                      value={accountPlanForm.name}
                      onChange={(e) => setAccountPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Manutenção, Marketing..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-category">Tipo de Despesa *</Label>
                    <Select
                      value={accountPlanForm.category}
                      onValueChange={(value) => setAccountPlanForm(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Essencial">Essencial</SelectItem>
                        <SelectItem value="Variável">Variável</SelectItem>
                        <SelectItem value="Investimento">Investimento</SelectItem>
                        <SelectItem value="Dívida">Dívida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expense-color">Cor</Label>
                    <Input
                      id="expense-color"
                      type="color"
                      value={accountPlanForm.color}
                      onChange={(e) => setAccountPlanForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAccountPlanDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddAccountPlan}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {despesas.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{plan.category}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteConfirm({ type: 'account', id: plan.id })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações
        </h2>
        <p className="text-muted-foreground">
          Gerencie categorias, centros de custo e contas bancárias
        </p>
      </div>

      {/* Info sobre o sistema */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Sobre o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Sistema completo de controle financeiro pessoal (PF) e empresarial (PJ).
            </p>
            <p>
              <strong>Recursos principais:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Separação total entre PF e PJ</li>
              <li>Plano de contas estruturado por categoria</li>
              <li>Centros de custo para rastreamento detalhado</li>
              <li>Orçamentos mensais com acompanhamento em tempo real</li>
              <li>Conciliação bancária preparada para IA</li>
              <li>Múltiplas contas bancárias</li>
              <li>✨ Criar e deletar categorias, centros de custos e contas</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Plano de Contas
          </CardTitle>
          <CardDescription>
            Estrutura de categorização de receitas e despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Física (PF)</h3>
              {renderAccountPlans('PF')}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Jurídica (PJ)</h3>
              {renderAccountPlans('PJ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Centros de Custo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Centros de Custo
          </CardTitle>
          <CardDescription>
            Áreas para rastreamento detalhado de gastos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pessoa Física (PF)</h3>
                <Dialog open={openCostCenterDialog && costCenterForm.entity === 'PF'} onOpenChange={(open) => {
                  if (open) {
                    setCostCenterForm({ entity: 'PF', name: '', description: '' });
                  }
                  setOpenCostCenterDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Centro de Custo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Centro de Custo (PF)</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo centro de custo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cc-name-pf">Nome *</Label>
                        <Input
                          id="cc-name-pf"
                          value={costCenterForm.name}
                          onChange={(e) => setCostCenterForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Pet, Educação..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="cc-desc-pf">Descrição</Label>
                        <Input
                          id="cc-desc-pf"
                          value={costCenterForm.description}
                          onChange={(e) => setCostCenterForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrição do centro de custo"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenCostCenterDialog(false)}>Cancelar</Button>
                      <Button onClick={handleAddCostCenter}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {costCenters.filter(cc => cc.entity.includes('PF')).map(cc => (
                  <div key={cc.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{cc.name}</div>
                      <div className="text-sm text-muted-foreground">{cc.description}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ type: 'cost', id: cc.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pessoa Jurídica (PJ)</h3>
                <Dialog open={openCostCenterDialog && costCenterForm.entity === 'PJ'} onOpenChange={(open) => {
                  if (open) {
                    setCostCenterForm({ entity: 'PJ', name: '', description: '' });
                  }
                  setOpenCostCenterDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Centro de Custo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Centro de Custo (PJ)</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo centro de custo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cc-name-pj">Nome *</Label>
                        <Input
                          id="cc-name-pj"
                          value={costCenterForm.name}
                          onChange={(e) => setCostCenterForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Projeto C, RH..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="cc-desc-pj">Descrição</Label>
                        <Input
                          id="cc-desc-pj"
                          value={costCenterForm.description}
                          onChange={(e) => setCostCenterForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrição do centro de custo"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenCostCenterDialog(false)}>Cancelar</Button>
                      <Button onClick={handleAddCostCenter}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {costCenters.filter(cc => cc.entity.includes('PJ')).map(cc => (
                  <div key={cc.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{cc.name}</div>
                      <div className="text-sm text-muted-foreground">{cc.description}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ type: 'cost', id: cc.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Contas Bancárias
          </CardTitle>
          <CardDescription>
            Contas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pessoa Física (PF)</h3>
                <Dialog open={openBankAccountDialog && bankAccountForm.entity === 'PF'} onOpenChange={(open) => {
                  if (open) {
                    setBankAccountForm({ entity: 'PF', name: '', type: 'Conta Corrente', balance: 0 });
                  }
                  setOpenBankAccountDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Conta Bancária (PF)</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da nova conta bancária
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bank-name-pf">Nome da Conta *</Label>
                        <Input
                          id="bank-name-pf"
                          value={bankAccountForm.name}
                          onChange={(e) => setBankAccountForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Bradesco PF, Santander..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank-type-pf">Tipo de Conta *</Label>
                        <Select
                          value={bankAccountForm.type}
                          onValueChange={(value) => setBankAccountForm(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                            <SelectItem value="Poupança">Poupança</SelectItem>
                            <SelectItem value="Investimento">Investimento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bank-balance-pf">Saldo Inicial</Label>
                        <Input
                          id="bank-balance-pf"
                          type="number"
                          step="0.01"
                          value={bankAccountForm.balance}
                          onChange={(e) => setBankAccountForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenBankAccountDialog(false)}>Cancelar</Button>
                      <Button onClick={handleAddBankAccount}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {bankAccounts.filter(ba => ba.entity === 'PF').map(ba => (
                  <div key={ba.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{ba.name}</div>
                      <div className="text-sm text-muted-foreground">{ba.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ba.entity}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteConfirm({ type: 'bank', id: ba.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pessoa Jurídica (PJ)</h3>
                <Dialog open={openBankAccountDialog && bankAccountForm.entity === 'PJ'} onOpenChange={(open) => {
                  if (open) {
                    setBankAccountForm({ entity: 'PJ', name: '', type: 'Conta Corrente', balance: 0 });
                  }
                  setOpenBankAccountDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Conta Bancária (PJ)</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da nova conta bancária
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bank-name-pj">Nome da Conta *</Label>
                        <Input
                          id="bank-name-pj"
                          value={bankAccountForm.name}
                          onChange={(e) => setBankAccountForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Bradesco PJ, XP..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank-type-pj">Tipo de Conta *</Label>
                        <Select
                          value={bankAccountForm.type}
                          onValueChange={(value) => setBankAccountForm(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                            <SelectItem value="Poupança">Poupança</SelectItem>
                            <SelectItem value="Investimento">Investimento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bank-balance-pj">Saldo Inicial</Label>
                        <Input
                          id="bank-balance-pj"
                          type="number"
                          step="0.01"
                          value={bankAccountForm.balance}
                          onChange={(e) => setBankAccountForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenBankAccountDialog(false)}>Cancelar</Button>
                      <Button onClick={handleAddBankAccount}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {bankAccounts.filter(ba => ba.entity === 'PJ').map(ba => (
                  <div key={ba.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{ba.name}</div>
                      <div className="text-sm text-muted-foreground">{ba.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ba.entity}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteConfirm({ type: 'bank', id: ba.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{accountPlans.length}</div>
              <div className="text-sm text-muted-foreground">Planos de Contas</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{costCenters.length}</div>
              <div className="text-sm text-muted-foreground">Centros de Custo</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{bankAccounts.length}</div>
              <div className="text-sm text-muted-foreground">Contas Bancárias</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Entidades (PF/PJ)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja excluir este item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
