import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOrcamentos, deleteOrcamento, updateOrcamento } from '@/services/vendeMaisObras.service';
import { toast } from 'sonner';
import { Plus, Search, Eye, Edit, Trash2, Send, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Aprovado':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Enviado':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Rejeitado':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function VendeMaisObrasOrcamentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: getOrcamentos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrcamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento deletado com sucesso');
      setDeleteDialogOpen(false);
      setOrcamentoToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar orçamento');
    },
  });

  const sendMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      updateOrcamento(id, { Status: 'Enviado', EnviadoAt: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento enviado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao enviar orçamento');
    },
  });

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const matchSearch =
      (orcamento.Numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orcamento.ClienteNome || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || orcamento.Status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    setOrcamentoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (orcamentoToDelete) {
      deleteMutation.mutate(orcamentoToDelete);
    }
  };

  const handleSend = (id: string) => {
    sendMutation.mutate({ id });
  };

  return (
    <VendeMaisObrasLayout title="Orçamentos" subtitle="Gerencie seus orçamentos">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[#1f1f1f] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-[#2a2a2a]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/vende-mais-obras/orcamentos/novo">
            <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        {/* Tabela de Orçamentos */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">
              {orcamentosFiltrados.length} {orcamentosFiltrados.length === 1 ? 'Orçamento' : 'Orçamentos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD700] mx-auto mb-4" />
                <p className="text-gray-400">Carregando orçamentos...</p>
              </div>
            ) : orcamentosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'todos'
                    ? 'Nenhum orçamento encontrado com os filtros aplicados.'
                    : 'Nenhum orçamento ainda.'}
                </p>
                {!searchTerm && statusFilter === 'todos' && (
                  <Link to="/vende-mais-obras/orcamentos/novo">
                    <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Orçamento
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                      <TableHead className="text-gray-400">Número</TableHead>
                      <TableHead className="text-gray-400">Cliente</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Total</TableHead>
                      <TableHead className="text-gray-400">Validade</TableHead>
                      <TableHead className="text-gray-400">Criado em</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosFiltrados.map((orcamento) => (
                      <TableRow key={orcamento.id} className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <TableCell className="font-medium text-white">
                          {orcamento.Numero || `#${orcamento.id.slice(0, 8)}`}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {orcamento.ClienteNome || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(orcamento.Status)}>
                            {orcamento.Status || 'Rascunho'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#FFD700] font-medium">
                          {orcamento.Total
                            ? `R$ ${orcamento.Total.toFixed(2).replace('.', ',')}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {orcamento.Validade
                            ? format(new Date(orcamento.Validade), 'dd/MM/yyyy', { locale: ptBR })
                            : '—'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {orcamento.CreatedAt
                            ? format(new Date(orcamento.CreatedAt), 'dd/MM/yyyy', { locale: ptBR })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to={`/vende-mais-obras/orcamentos/${orcamento.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </Button>
                            </Link>
                            {(orcamento.Status === 'Rascunho' || !orcamento.Status) && (
                              <>
                                <Link to={`/vende-mais-obras/orcamentos/${orcamento.id}/editar`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleSend(orcamento.id)}
                                  disabled={sendMutation.isPending}
                                >
                                  <Send className="h-4 w-4 text-gray-400" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              onClick={() => handleDelete(orcamento.id)}
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
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1f1f1f] border-[#2a2a2a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendeMaisObrasLayout>
  );
}


