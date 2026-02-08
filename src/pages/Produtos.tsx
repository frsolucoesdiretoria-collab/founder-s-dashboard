import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Package, Plus } from 'lucide-react';
import { getProdutos, getProdutosByStatus, createProduto } from '@/services';
import type { Produto } from '@/types/produto';
import { toast } from 'sonner';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
    nome: '',
    status: 'Ideia',
    problemaQueResolve: '',
    precoMinimo: 0,
    precoIdeal: 0,
    tipo: '',
    tempoMedioEntrega: 0,
    dependenciaFundador: 'Média',
    replicabilidade: 'Média',
    prioridadeEstrategica: 0
  });

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

  const handleCreateProduto = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    setCreating(true);
    try {
      await createProduto(formData);
      toast.success('Produto criado com sucesso!');
      setShowCreateDialog(false);
      setFormData({
        nome: '',
        status: 'Ideia',
        problemaQueResolve: '',
        precoMinimo: 0,
        precoIdeal: 0,
        tipo: '',
        tempoMedioEntrega: 0,
        dependenciaFundador: 'Média',
        replicabilidade: 'Média',
        prioridadeEstrategica: 0
      });
      await loadData();
    } catch (error: any) {
      console.error('Error creating produto:', error);
      toast.error(error.message || 'Erro ao criar produto');
    } finally {
      setCreating(false);
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Produtos FR Tech
            </h1>
            <p className="text-muted-foreground">
              Catálogo estratégico de produtos e soluções da FR Tech.
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
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

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo produto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Consultoria Estratégica"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Produto['status'] })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Ideia">Ideia</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                      <SelectItem value="Morto">Morto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ex: Consultoria"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemaQueResolve">Problema que Resolve</Label>
                <Textarea
                  id="problemaQueResolve"
                  value={formData.problemaQueResolve}
                  onChange={(e) => setFormData({ ...formData, problemaQueResolve: e.target.value })}
                  placeholder="Descreva o problema que este produto resolve"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="precoMinimo">Preço Mínimo (R$)</Label>
                  <Input
                    id="precoMinimo"
                    type="number"
                    value={formData.precoMinimo}
                    onChange={(e) => setFormData({ ...formData, precoMinimo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precoIdeal">Preço Ideal (R$)</Label>
                  <Input
                    id="precoIdeal"
                    type="number"
                    value={formData.precoIdeal}
                    onChange={(e) => setFormData({ ...formData, precoIdeal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="tempoMedioEntrega">Tempo Médio (dias)</Label>
                  <Input
                    id="tempoMedioEntrega"
                    type="number"
                    value={formData.tempoMedioEntrega}
                    onChange={(e) => setFormData({ ...formData, tempoMedioEntrega: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dependenciaFundador">Dependência Fundador</Label>
                  <Select value={formData.dependenciaFundador} onValueChange={(v) => setFormData({ ...formData, dependenciaFundador: v as Produto['dependenciaFundador'] })}>
                    <SelectTrigger id="dependenciaFundador">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replicabilidade">Replicabilidade</Label>
                  <Select value={formData.replicabilidade} onValueChange={(v) => setFormData({ ...formData, replicabilidade: v as Produto['replicabilidade'] })}>
                    <SelectTrigger id="replicabilidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridadeEstrategica">Prioridade Estratégica (1-10)</Label>
                <Input
                  id="prioridadeEstrategica"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.prioridadeEstrategica}
                  onChange={(e) => setFormData({ ...formData, prioridadeEstrategica: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProduto} disabled={creating || !formData.nome.trim()}>
                {creating ? 'Criando...' : 'Criar Produto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}





