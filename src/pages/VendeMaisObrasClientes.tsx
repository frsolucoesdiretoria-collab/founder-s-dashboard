import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { getClientes, deleteCliente, fixClientesUsuarioRelation } from '@/services/vendeMaisObras.service';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Users, Loader2, RefreshCw } from 'lucide-react';

export default function VendeMaisObrasClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [fixingRelation, setFixingRelation] = useState(false);

  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente deletado com sucesso');
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar cliente');
    },
  });

  const clientesFiltrados = clientes.filter((cliente) => {
    const nome = cliente.Nome || '';
    const email = cliente.Email || '';
    const documento = cliente.Documento || '';
    const search = searchTerm.toLowerCase();
    return (
      nome.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      documento.toLowerCase().includes(search)
    );
  });

  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      deleteMutation.mutate(clienteToDelete);
    }
  };

  const handleFixUsuarioRelation = async () => {
    setFixingRelation(true);
    try {
      const resultado = await fixClientesUsuarioRelation();
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(resultado.message || `Migração concluída: ${resultado.atualizados} clientes atualizados`);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao corrigir relação Usuario');
    } finally {
      setFixingRelation(false);
    }
  };

  return (
    <VendeMaisObrasLayout title="Clientes" subtitle="Gerencie seus clientes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleFixUsuarioRelation}
              disabled={fixingRelation}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {fixingRelation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Corrigindo...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Corrigir Relação Usuario
                </>
              )}
            </Button>
            <Link to="/vende-mais-obras/clientes/novo">
              <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">
              {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'Cliente' : 'Clientes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD700] mx-auto mb-4" />
                <p className="text-gray-400">Carregando clientes...</p>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
                </p>
                {!searchTerm && (
                  <Link to="/vende-mais-obras/clientes/novo">
                    <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Primeiro Cliente
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Telefone</TableHead>
                      <TableHead className="text-gray-400">Cidade/Estado</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id} className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <TableCell className="font-medium text-white">{cliente.Nome}</TableCell>
                        <TableCell className="text-gray-300">{cliente.Email || '—'}</TableCell>
                        <TableCell className="text-gray-300">{cliente.Telefone || '—'}</TableCell>
                        <TableCell className="text-gray-300">
                          {cliente.Cidade && cliente.Estado
                            ? `${cliente.Cidade}/${cliente.Estado}`
                            : cliente.Cidade || cliente.Estado || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              onClick={() => handleDelete(cliente.id)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1f1f1f] border-[#2a2a2a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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







