import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createOrcamento, getClientes } from '@/services/vendeMaisObras.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import type { OrcamentoItem } from '@/types/vendeMaisObras';
import { format, addDays } from 'date-fns';

export default function VendeMaisObrasNovoOrcamento() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const [formData, setFormData] = useState({
    ClienteId: '',
    Observacoes: '',
    Validade: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 30 dias padrão
  });

  const [itens, setItens] = useState<OrcamentoItem[]>([
    {
      descricao: '',
      quantidade: 1,
      unidade: 'UN',
      precoUnitario: 0,
      total: 0,
    },
  ]);

  const createMutation = useMutation({
    mutationFn: createOrcamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento criado com sucesso!');
      navigate('/vende-mais-obras/orcamentos');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar orçamento');
    },
  });

  const handleItemChange = (index: number, field: keyof OrcamentoItem, value: string | number) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };

    // Recalcular total do item
    if (field === 'quantidade' || field === 'precoUnitario') {
      const quantidade = typeof value === 'number' && field === 'quantidade' ? value : newItens[index].quantidade;
      const precoUnitario = typeof value === 'number' && field === 'precoUnitario' ? value : newItens[index].precoUnitario;
      newItens[index].total = quantidade * precoUnitario;
    }

    setItens(newItens);
  };

  const addItem = () => {
    setItens([
      ...itens,
      {
        descricao: '',
        quantidade: 1,
        unidade: 'UN',
        precoUnitario: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    } else {
      toast.error('O orçamento deve ter pelo menos um item');
    }
  };

  const calcularTotal = () => {
    return itens.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ClienteId) {
      toast.error('Selecione um cliente');
      return;
    }

    // Validar itens
    const itensInvalidos = itens.some(
      (item) => !item.descricao.trim() || item.quantidade <= 0 || item.precoUnitario <= 0
    );

    if (itensInvalidos) {
      toast.error('Preencha todos os campos dos itens corretamente');
      return;
    }

    const total = calcularTotal();
    if (total <= 0) {
      toast.error('O total do orçamento deve ser maior que zero');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    createMutation.mutate({
      UsuarioId: user.id, // Backend usa do token, mas interface TypeScript exige
      ClienteId: formData.ClienteId,
      Status: 'Rascunho',
      Total: total,
      Itens: itens,
      Observacoes: formData.Observacoes || undefined,
      Validade: formData.Validade || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalGeral = calcularTotal();

  return (
    <VendeMaisObrasLayout title="Novo Orçamento" subtitle="Crie um novo orçamento">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vende-mais-obras/orcamentos')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Gerais */}
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente" className="text-gray-300">
                    Cliente <span className="text-red-400">*</span>
                  </Label>
                  <Select value={formData.ClienteId} onValueChange={(value) => handleChange('ClienteId', value)}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-white">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f1f] border-[#2a2a2a]">
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id} className="text-white">
                          {cliente.Nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clientes.length === 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      Nenhum cliente cadastrado.{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/vende-mais-obras/clientes/novo')}
                        className="text-[#FFD700] hover:underline"
                      >
                        Cadastrar cliente
                      </button>
                    </p>
                  )}
                </div>

                {/* Validade */}
                <div className="space-y-2">
                  <Label htmlFor="validade" className="text-gray-300">
                    Validade
                  </Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.Validade}
                    onChange={(e) => handleChange('Validade', e.target.value)}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-gray-300">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.Observacoes}
                  onChange={(e) => handleChange('Observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre o orçamento..."
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens do Orçamento */}
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Itens do Orçamento</CardTitle>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
                className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]"
                  >
                    <div className="col-span-12 md:col-span-4">
                      <Label className="text-gray-400 text-xs mb-1 block">Descrição *</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => handleItemChange(index, 'descricao', e.target.value)}
                        placeholder="Descrição do item"
                        className="bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-1">
                      <Label className="text-gray-400 text-xs mb-1 block">Qtd *</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
                        className="bg-[#1f1f1f] border-[#2a2a2a] text-white"
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Label className="text-gray-400 text-xs mb-1 block">Unidade</Label>
                      <Input
                        value={item.unidade || 'UN'}
                        onChange={(e) => handleItemChange(index, 'unidade', e.target.value)}
                        placeholder="UN"
                        className="bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Label className="text-gray-400 text-xs mb-1 block">Preço Unit. *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precoUnitario}
                        onChange={(e) => handleItemChange(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                        className="bg-[#1f1f1f] border-[#2a2a2a] text-white"
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Label className="text-gray-400 text-xs mb-1 block">Total</Label>
                      <Input
                        value={`R$ ${item.total.toFixed(2).replace('.', ',')}`}
                        disabled
                        className="bg-[#2a2a2a] border-[#2a2a2a] text-[#FFD700] font-medium cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        disabled={itens.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Geral */}
              <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                <div className="flex justify-end">
                  <div className="text-right">
                    <Label className="text-gray-400 text-sm mb-2 block">Total do Orçamento</Label>
                    <div className="text-3xl font-bold text-[#FFD700]">
                      R$ {totalGeral.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/vende-mais-obras/orcamentos')}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
              disabled={createMutation.isPending || clientes.length === 0}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Orçamento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </VendeMaisObrasLayout>
  );
}

