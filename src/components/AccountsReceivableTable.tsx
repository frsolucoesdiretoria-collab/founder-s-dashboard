import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getAccountsReceivable, createAccountReceivable, updateAccountReceivable, deleteAccountReceivable, getAccounts, type AccountReceivable, type Account } from '@/services/finance.service';

interface AccountsReceivableTableProps {
  passcode: string;
  categories: string[];
}

export function AccountsReceivableTable({ passcode, categories }: AccountsReceivableTableProps) {
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountReceivable | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Amount: 0,
    DueDate: new Date().toISOString().split('T')[0],
    Category: '',
    Account: '',
    Recurring: false,
    RecurringRule: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receivableData, accountsData] = await Promise.all([
        getAccountsReceivable(undefined, passcode),
        getAccounts(true, passcode)
      ]);
      setAccountsReceivable(receivableData);
      setAccounts(accountsData);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: AccountReceivable) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        Name: item.Name,
        Description: item.Description || '',
        Amount: item.Amount,
        DueDate: item.DueDate,
        Category: item.Category || '',
        Account: item.Account || '',
        Recurring: item.Recurring || false,
        RecurringRule: item.RecurringRule || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        Name: '',
        Description: '',
        Amount: 0,
        DueDate: new Date().toISOString().split('T')[0],
        Category: '',
        Account: '',
        Recurring: false,
        RecurringRule: ''
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.Name || !formData.Amount || !formData.DueDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingItem) {
        await updateAccountReceivable(editingItem.id, formData, passcode);
        toast.success('Conta atualizada com sucesso!');
      } else {
        await createAccountReceivable(formData, passcode);
        toast.success('Conta criada com sucesso!');
      }
      setShowDialog(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar conta');
    }
  };

  const handleDelete = async (item: AccountReceivable) => {
    if (!confirm(`Deletar conta "${item.Name}"?`)) return;

    try {
      await deleteAccountReceivable(item.id, passcode);
      toast.success('Conta deletada!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao deletar conta');
    }
  };

  const handleMarkReceived = async (item: AccountReceivable) => {
    try {
      await updateAccountReceivable(item.id, { Received: true }, passcode);
      toast.success('Conta marcada como recebida!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar conta');
    }
  };

  const getStatusBadge = (status: string, dueDate: string, received: boolean) => {
    if (received) {
      return <Badge className="bg-green-500">Recebido</Badge>;
    }
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) {
      return <Badge className="bg-red-500">Atrasado</Badge>;
    }
    return <Badge className="bg-blue-500">Pendente</Badge>;
  };

  const totalPending = accountsReceivable
    .filter(a => !a.Received)
    .reduce((sum, a) => sum + a.Amount, 0);

  const totalOverdue = accountsReceivable
    .filter(a => !a.Received && new Date(a.DueDate) < new Date())
    .reduce((sum, a) => sum + a.Amount, 0);

  if (loading && accountsReceivable.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Carregando contas a receber...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Contas a Receber</h2>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">
              Total Pendente: <span className="font-semibold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalPending)}
              </span>
            </span>
            {totalOverdue > 0 && (
              <span className="text-red-600">
                Atrasadas: <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalOverdue)}
                </span>
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {accountsReceivable.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma conta a receber cadastrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsReceivable.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.Name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(item.DueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.Amount)}
                    </TableCell>
                    <TableCell>{item.Category || '-'}</TableCell>
                    <TableCell>
                      {getStatusBadge(item.Status, item.DueDate, item.Received)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!item.Received && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkReceived(item)}
                          >
                            Marcar como Recebido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Descrição *</Label>
              <Input
                id="name"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                placeholder="Ex: Recebimento de cliente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <CurrencyInput
                  id="amount"
                  value={formData.Amount}
                  onChange={(value) => setFormData({ ...formData, Amount: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.DueDate}
                  onChange={(e) => setFormData({ ...formData, DueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.Category}
                  onValueChange={(v) => setFormData({ ...formData, Category: v })}
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Select
                  value={formData.Account}
                  onValueChange={(v) => setFormData({ ...formData, Account: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Observações</Label>
              <Textarea
                id="description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


