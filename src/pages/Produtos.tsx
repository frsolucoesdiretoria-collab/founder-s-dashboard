import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { getProdutos, getProdutosByStatus } from '@/services';
import type { Produto } from '@/types/produto';

const statusColors: Record<string, string> = {
  'Ativo': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Ideia': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Pausado': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Morto': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const dependenciaColors: Record<string, string> = {
  'Alta': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Média': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Baixa': 'bg-green-500/10 text-green-500 border-green-500/20',
};

const replicabilidadeColors: Record<string, string> = {
  'Alta': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Média': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Baixa': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const prioridadeColors = (score: number): string => {
  if (score >= 8) return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (score >= 6) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ativo' | 'ideia' | 'pausado' | 'morto'>('all');

  const loadData = async () => {
    try {
      const produtosData = await getProdutos();
      setProdutos(produtosData);
    } catch (error) {
      console.error('Error loading produtos data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredProdutos = () => {
    if (activeTab === 'all') return produtos;
    const statusMap: Record<string, Produto['status']> = {
      'ativo': 'Ativo',
      'ideia': 'Ideia',
      'pausado': 'Pausado',
      'morto': 'Morto',
    };
    return produtos.filter(p => p.status === statusMap[activeTab]);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  const filteredProdutos = getFilteredProdutos();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Produtos FR Tech
          </h1>
          <p className="text-muted-foreground">
            Catálogo estratégico de produtos e soluções da FR Tech.
          </p>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="ideia">Ideias</TabsTrigger>
            <TabsTrigger value="pausado">Pausados</TabsTrigger>
            <TabsTrigger value="morto">Mortos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'all' && 'Todos os Produtos'}
                  {activeTab === 'ativo' && 'Produtos Ativos'}
                  {activeTab === 'ideia' && 'Ideias de Produto'}
                  {activeTab === 'pausado' && 'Produtos Pausados'}
                  {activeTab === 'morto' && 'Produtos Mortos'}
                </CardTitle>
                <CardDescription>
                  {filteredProdutos.length} produto(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Produto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Problema que Resolve</TableHead>
                        <TableHead>Preço Mínimo</TableHead>
                        <TableHead>Preço Ideal</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tempo Médio (dias)</TableHead>
                        <TableHead>Dependência Fundador</TableHead>
                        <TableHead>Replicabilidade</TableHead>
                        <TableHead>Prioridade Estratégica</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProdutos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            Nenhum produto encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProdutos.map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell className="font-medium">{produto.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[produto.status] || ''}>
                                {produto.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate" title={produto.problemaQueResolve}>
                                {produto.problemaQueResolve}
                              </p>
                            </TableCell>
                            <TableCell>{formatCurrency(produto.precoMinimo)}</TableCell>
                            <TableCell>{formatCurrency(produto.precoIdeal)}</TableCell>
                            <TableCell>{produto.tipo}</TableCell>
                            <TableCell>{produto.tempoMedioEntrega} dias</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={dependenciaColors[produto.dependenciaFundador] || ''}>
                                {produto.dependenciaFundador}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={replicabilidadeColors[produto.replicabilidade] || ''}>
                                {produto.replicabilidade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={prioridadeColors(produto.prioridadeEstrategica)}>
                                {produto.prioridadeEstrategica}/10
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Total de Produtos</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {produtos.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Produtos Ativos</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {produtos.filter(p => p.status === 'Ativo').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Ideias</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {produtos.filter(p => p.status === 'Ideia').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Alta Replicabilidade</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {produtos.filter(p => p.replicabilidade === 'Alta').length}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}




