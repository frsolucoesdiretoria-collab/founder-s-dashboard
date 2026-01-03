// Componente para gerenciar regras de categorização automática

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { getCategorizationRules, createCategorizationRule, updateCategorizationRule, deleteCategorizationRule, applyCategorizationRules as applyRules } from '@/services/finance.service';
import type { CategorizationRule } from '@/types/finance';
import { toast } from 'sonner';

interface CategorizationRulesManagerProps {
  passcode?: string;
  transactionIds?: string[];
  onApplyRules?: () => void;
}

export function CategorizationRulesManager({ passcode, transactionIds, onApplyRules }: CategorizationRulesManagerProps) {
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null);
  const [applying, setApplying] = useState(false);
  
  const [formData, setFormData] = useState({
    Name: '',
    Pattern: '',
    Category: '',
    Priority: 5,
    Active: true,
    AccountType: 'Ambos' as 'Empresarial' | 'Pessoal' | 'Ambos'
  });

  const categories = ['Marketing', 'Operacional', 'Pessoal', 'Investimentos'];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await getCategorizationRules(false, passcode);
      setRules(data);
    } catch (error: any) {
      toast.error('Erro ao carregar regras', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rule?: CategorizationRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        Name: rule.Name,
        Pattern: rule.Pattern,
        Category: rule.Category,
        Priority: rule.Priority,
        Active: rule.Active,
        AccountType: rule.AccountType
      });
    } else {
      setEditingRule(null);
      setFormData({
        Name: '',
        Pattern: '',
        Category: '',
        Priority: 5,
        Active: true,
        AccountType: 'Ambos'
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRule(null);
    setFormData({
      Name: '',
      Pattern: '',
      Category: '',
      Priority: 5,
      Active: true,
      AccountType: 'Ambos'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Name || !formData.Pattern || !formData.Category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingRule) {
        await updateCategorizationRule(editingRule.id, formData, passcode);
        toast.success('Regra atualizada com sucesso');
      } else {
        await createCategorizationRule(formData, passcode);
        toast.success('Regra criada com sucesso');
      }
      handleCloseDialog();
      loadRules();
    } catch (error: any) {
      toast.error('Erro ao salvar regra', { description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      await deleteCategorizationRule(id, passcode);
      toast.success('Regra excluída com sucesso');
      loadRules();
    } catch (error: any) {
      toast.error('Erro ao excluir regra', { description: error.message });
    }
  };

  const handleToggleActive = async (rule: CategorizationRule) => {
    try {
      await updateCategorizationRule(rule.id, { Active: !rule.Active }, passcode);
      toast.success(`Regra ${!rule.Active ? 'ativada' : 'desativada'}`);
      loadRules();
    } catch (error: any) {
      toast.error('Erro ao atualizar regra', { description: error.message });
    }
  };

  const handleApplyRules = async () => {
    if (!transactionIds || transactionIds.length === 0) {
      toast.error('Nenhuma transação selecionada');
      return;
    }

    try {
      setApplying(true);
      const result = await applyRules(transactionIds, passcode);
      toast.success(`Regras aplicadas: ${result.updated} transações atualizadas`);
      if (onApplyRules) {
        onApplyRules();
      }
    } catch (error: any) {
      toast.error('Erro ao aplicar regras', { description: error.message });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando regras...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Regras de Categorização Automática</h3>
          <p className="text-sm text-muted-foreground">
            Configure regras para categorizar transações automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          {transactionIds && transactionIds.length > 0 && (
            <Button
              onClick={handleApplyRules}
              disabled={applying}
              variant="outline"
            >
              {applying ? 'Aplicando...' : `Aplicar Regras (${transactionIds.length} transações)`}
            </Button>
          )}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Regra' : 'Nova Regra de Categorização'}
                </DialogTitle>
                <DialogDescription>
                  Configure uma regra para categorizar transações automaticamente baseado em padrões de texto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Regra *</Label>
                  <Input
                    id="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="Ex: Pagamentos Nubank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern">Padrão de Busca *</Label>
                  <Input
                    id="pattern"
                    value={formData.Pattern}
                    onChange={(e) => setFormData({ ...formData, Pattern: e.target.value })}
                    placeholder="Ex: nubank ou /nubank|nu/i (regex)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use texto simples ou expressão regular (regex)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.Category}
                      onValueChange={(value) => setFormData({ ...formData, Category: value })}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Conta</Label>
                    <Select
                      value={formData.AccountType}
                      onValueChange={(value: any) => setFormData({ ...formData, AccountType: value })}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Empresarial">Empresarial</SelectItem>
                        <SelectItem value="Pessoal">Pessoal</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade (1-10) *</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.Priority}
                    onChange={(e) => setFormData({ ...formData, Priority: parseInt(e.target.value) || 5 })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Regras com maior prioridade são aplicadas primeiro
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.Active}
                    onCheckedChange={(checked) => setFormData({ ...formData, Active: checked })}
                  />
                  <Label htmlFor="active">Regra ativa</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Atualizar' : 'Criar'} Regra
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma regra configurada. Crie sua primeira regra para começar.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.Name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {rule.Pattern}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.Category}</Badge>
                  </TableCell>
                  <TableCell>{rule.Priority}</TableCell>
                  <TableCell>{rule.AccountType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rule.Active ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Inativa
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(rule)}
                      >
                        {rule.Active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


