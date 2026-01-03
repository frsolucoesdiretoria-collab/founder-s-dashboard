import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getAccounts, createAccount, updateAccount, deleteAccount, type Account } from '@/services/finance.service';

interface AccountsManagerProps {
  passcode: string;
}

export function AccountsManager({ passcode }: AccountsManagerProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Type: 'Corrente' as Account['Type'],
    Bank: '',
    AccountType: 'Pessoal' as Account['AccountType'],
    InitialBalance: 0,
    Limit: 0,
    Notes: '',
    Active: true
  });

  const banks = ['Nubank', 'Inter', 'Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'Caixa', 'Outro'];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts(false, passcode);
      setAccounts(data);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        Name: account.Name,
        Type: account.Type,
        Bank: account.Bank,
        AccountType: account.AccountType,
        InitialBalance: account.InitialBalance,
        Limit: account.Limit || 0,
        Notes: account.Notes || '',
        Active: account.Active
      });
    } else {
      setEditingAccount(null);
      setFormData({
        Name: '',
        Type: 'Corrente',
        Bank: '',
        AccountType: 'Pessoal',
        InitialBalance: 0,
        Limit: 0,
        Notes: '',
        Active: true
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.Name || !formData.Bank) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData, passcode);
        toast.success('Conta atualizada com sucesso!');
      } else {
        await createAccount(formData, passcode);
        toast.success('Conta criada com sucesso!');
      }
      setShowDialog(false);
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar conta');
    }
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Deletar conta "${account.Name}"?`)) return;

    try {
      await deleteAccount(account.id, passcode);
      toast.success('Conta deletada!');
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao deletar conta');
    }
  };

  const totalBalance = accounts
    .filter(a => a.Active)
    .reduce((sum, a) => sum + a.CurrentBalance, 0);

  if (loading && accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Carregando contas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Contas Bancárias</h2>
          <p className="text-sm text-muted-foreground">
            Saldo total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalBalance)}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma conta cadastrada. Clique em "Nova Conta" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tipo de Conta</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        {account.Name}
                        {!account.Active && (
                          <span className="text-xs text-muted-foreground">(Inativa)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{account.Bank}</TableCell>
                    <TableCell>{account.Type}</TableCell>
                    <TableCell>{account.AccountType}</TableCell>
                    <TableCell className="text-right">
                      <span className={account.CurrentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(account.CurrentBalance)}
                      </span>
                      {account.Limit && account.Type === 'Cartão de Crédito' && (
                        <div className="text-xs text-muted-foreground">
                          Limite: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(account.Limit)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account)}
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
              {editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Atualize as informações da conta' : 'Adicione uma nova conta bancária'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="Ex: Conta Corrente Principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Banco *</Label>
                <Select
                  value={formData.Bank}
                  onValueChange={(v) => setFormData({ ...formData, Bank: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Conta *</Label>
                <Select
                  value={formData.Type}
                  onValueChange={(v) => setFormData({ ...formData, Type: v as Account['Type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corrente">Corrente</SelectItem>
                    <SelectItem value="Poupança">Poupança</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Investimento">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo *</Label>
                <Select
                  value={formData.AccountType}
                  onValueChange={(v) => setFormData({ ...formData, AccountType: v as Account['AccountType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empresarial">Empresarial</SelectItem>
                    <SelectItem value="Pessoal">Pessoal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Saldo Inicial (R$) *</Label>
                <CurrencyInput
                  id="initialBalance"
                  value={formData.InitialBalance}
                  onChange={(value) => setFormData({ ...formData, InitialBalance: value })}
                  placeholder="0,00"
                />
              </div>
              {formData.Type === 'Cartão de Crédito' && (
                <div className="space-y-2">
                  <Label htmlFor="limit">Limite (R$)</Label>
                  <CurrencyInput
                    id="limit"
                    value={formData.Limit}
                    onChange={(value) => setFormData({ ...formData, Limit: value })}
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.Notes}
                onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
                placeholder="Observações adicionais sobre a conta"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingAccount ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

