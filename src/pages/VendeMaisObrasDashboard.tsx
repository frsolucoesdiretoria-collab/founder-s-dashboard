import { useQuery } from '@tanstack/react-query';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getOrcamentos, getClientes } from '@/services/vendeMaisObras.service';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus,
  Eye,
  Edit,
  ArrowRight
} from 'lucide-react';
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

export default function VendeMaisObrasDashboard() {
  const { user, checkTrialStatus } = useAuth();
  const trialStatus = checkTrialStatus();

  const { data: orcamentos = [], isLoading: loadingOrcamentos } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: getOrcamentos,
  });

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  // Calcular métricas
  const totalOrcamentos = orcamentos.length;
  const orcamentosAprovados = orcamentos.filter((o) => o.Status === 'Aprovado').length;
  const totalClientes = clientes.length;
  const valorFaturado = orcamentos
    .filter((o) => o.Status === 'Aprovado')
    .reduce((sum, o) => sum + (o.Total || 0), 0);

  // Orçamentos recentes (últimos 5)
  const orcamentosRecentes = [...orcamentos]
    .sort((a, b) => {
      const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
      const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Contar orçamentos por status
  const orcamentosPorStatus = {
    Rascunho: orcamentos.filter((o) => o.Status === 'Rascunho' || !o.Status).length,
    Enviado: orcamentos.filter((o) => o.Status === 'Enviado').length,
    Aprovado: orcamentos.filter((o) => o.Status === 'Aprovado').length,
    Rejeitado: orcamentos.filter((o) => o.Status === 'Rejeitado').length,
  };

  return (
    <VendeMaisObrasLayout title="Dashboard" subtitle="Visão geral do seu negócio">
      <div className="space-y-6">
        {/* Aviso de Trial */}
        {trialStatus.isTrial && trialStatus.daysLeft !== null && trialStatus.daysLeft <= 3 && (
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-400 font-semibold">Trial Expirando</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Seu trial expira em {trialStatus.daysLeft} {trialStatus.daysLeft === 1 ? 'dia' : 'dias'}. 
                    Assine um plano para continuar usando o sistema.
                  </p>
                </div>
                <Link to="/vende-mais-obras/perfil">
                  <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                    Ver Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total de Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700]">{totalOrcamentos}</div>
              <p className="text-xs text-gray-400 mt-1">
                {orcamentosAprovados} aprovados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Taxa de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700]">
                {totalOrcamentos > 0
                  ? ((orcamentosAprovados / totalOrcamentos) * 100).toFixed(1)
                  : '0'}
                %
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {orcamentosAprovados} de {totalOrcamentos}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700]">{totalClientes}</div>
              <p className="text-xs text-gray-400 mt-1">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Faturado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700]">
                R$ {valorFaturado.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-gray-400 mt-1">Orçamentos aprovados</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Status */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Orçamentos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(orcamentosPorStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-[#FFD700]">{count}</div>
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orçamentos Recentes */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Orçamentos Recentes</CardTitle>
            <Link to="/vende-mais-obras/orcamentos">
              <Button variant="ghost" size="sm" className="text-[#FFD700] hover:text-[#FFD700]/80">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingOrcamentos ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : orcamentosRecentes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Nenhum orçamento ainda</p>
                <Link to="/vende-mais-obras/orcamentos/novo">
                  <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Orçamento
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                    <TableHead className="text-gray-400">Número</TableHead>
                    <TableHead className="text-gray-400">Cliente</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Total</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentosRecentes.map((orcamento) => (
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
                            <Link to={`/vende-mais-obras/orcamentos/${orcamento.id}/editar`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/vende-mais-obras/orcamentos/novo">
                <Button className="w-full justify-start bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Button>
              </Link>
              <Link to="/vende-mais-obras/clientes">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Clientes
                </Button>
              </Link>
              <Link to="/vende-mais-obras/catalogo">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Catálogo de Serviços
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendeMaisObrasLayout>
  );
}








