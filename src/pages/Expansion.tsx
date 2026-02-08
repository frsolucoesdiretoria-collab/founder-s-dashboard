import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Plus, Package, ArrowRight, Search } from 'lucide-react';
import { getExpansionOpportunities, getCustomerWins, createOpportunity } from '@/services';
import { getProdutos } from '@/services';
import type { ExpansionOpportunity, CustomerWin } from '@/types/expansion';
import type { Produto } from '@/types/produto';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const typeColors: Record<string, string> = {
  'Upsell': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Cross-sell': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

interface ClientWithOpportunities {
  clientName: string;
  opportunities: ExpansionOpportunity[];
  wins: CustomerWin[];
}

export default function ExpansionPage() {
  const [opportunities, setOpportunities] = useState<ExpansionOpportunity[]>([]);
  const [customerWins, setCustomerWins] = useState<CustomerWin[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientWithOpportunities | null>(null);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New opportunity form
  const [newOpp, setNewOpp] = useState({
    client: '',
    type: '' as 'Upsell' | 'Cross-sell' | '',
    product: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [opps, wins, produtosData] = await Promise.all([
        getExpansionOpportunities(),
        getCustomerWins(),
        getProdutos()
      ]);
      setOpportunities(opps);
      setCustomerWins(wins);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Error loading expansion data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group opportunities by client
  const clientsMap = new Map<string, ClientWithOpportunities>();
  
  opportunities.forEach(opp => {
    if (!clientsMap.has(opp.Client)) {
      clientsMap.set(opp.Client, {
        clientName: opp.Client,
        opportunities: [],
        wins: []
      });
    }
    clientsMap.get(opp.Client)!.opportunities.push(opp);
  });

  customerWins.forEach(win => {
    if (!clientsMap.has(win.Client)) {
      clientsMap.set(win.Client, {
        clientName: win.Client,
        opportunities: [],
        wins: []
      });
    }
    clientsMap.get(win.Client)!.wins.push(win);
  });

  // Convert to array and filter by search
  let clients: ClientWithOpportunities[] = Array.from(clientsMap.values());
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    clients = clients.filter(client => 
      client.clientName.toLowerCase().includes(query)
    );
  }

  // Get active produtos
  const activeProdutos = produtos.filter(p => p.status === 'Ativo');

  const handleOpenClient = (client: ClientWithOpportunities) => {
    setSelectedClient(client);
    setNewOpp({ ...newOpp, client: client.clientName });
  };

  const handleAddOpportunity = async () => {
    if (!newOpp.client || !newOpp.type) {
      toast.error('Preencha cliente e tipo');
      return;
    }
    
    await createOpportunity({
      Name: `${newOpp.type} - ${newOpp.client}${newOpp.product ? ` - ${newOpp.product}` : ''}`,
      Client: newOpp.client,
      Type: newOpp.type as 'Upsell' | 'Cross-sell',
      Status: 'Identificado',
      Notes: newOpp.notes || (newOpp.product ? `Produto: ${newOpp.product}` : '')
    });
    
    toast.success('Oportunidade registrada!');
    setShowAddOpportunity(false);
    setNewOpp({ client: '', type: '', product: '', notes: '' });
    await loadData();
    if (selectedClient) {
      const updatedClient = clients.find(c => c.clientName === selectedClient.clientName);
      if (updatedClient) {
        setSelectedClient(updatedClient);
      }
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
            Expansão de Receita
            </h1>
          <p className="text-muted-foreground mt-1">
            Oportunidades para estimular a recompra, e novas ofertas para aumento de Lifetime Value
          </p>
          <p className="text-sm text-muted-foreground mt-2 italic">
            Segunda parte do funil em ampulheta - Fazer o cliente crescer sua contratação de produtos
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente ativo com oportunidades identificadas'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card 
                key={client.clientName}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleOpenClient(client)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{client.clientName}</CardTitle>
                  <CardDescription>
                    {client.opportunities.length} oportunidade{client.opportunities.length !== 1 ? 's' : ''}
                    {client.wins.length > 0 && ` • ${client.wins.length} marco${client.wins.length !== 1 ? 's' : ''}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {client.opportunities.slice(0, 3).map((opp) => (
                      <Badge key={opp.id} variant="outline" className={typeColors[opp.Type] || ''}>
                        {opp.Type}
                      </Badge>
                    ))}
                    {client.opportunities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.opportunities.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Client Details Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedClient?.clientName}</DialogTitle>
              <DialogDescription>
                Produtos atuais, oportunidades de upsell/cross-sell e histórico
              </DialogDescription>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-6 mt-4">
                {/* Current Products Section */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Produtos Contratados
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        (Estrutura de produtos por cliente será implementada na integração completa)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Upsell Opportunities */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Oportunidades de Upsell</h3>
                  <div className="space-y-2">
                    {selectedClient.opportunities
                      .filter(opp => opp.Type === 'Upsell')
                      .map((opp) => (
                        <Card key={opp.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{opp.Name}</p>
                                {opp.Notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{opp.Notes}</p>
                                )}
                              </div>
                              <Badge variant="outline" className={typeColors[opp.Type] || ''}>
                                {opp.Type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    {selectedClient.opportunities.filter(opp => opp.Type === 'Upsell').length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhuma oportunidade de upsell identificada</p>
                    )}
                  </div>
                </div>

                {/* Cross-sell Opportunities */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Oportunidades de Cross-sell</h3>
                  <div className="space-y-2">
                    {selectedClient.opportunities
                      .filter(opp => opp.Type === 'Cross-sell')
                      .map((opp) => (
                        <Card key={opp.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{opp.Name}</p>
                                {opp.Notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{opp.Notes}</p>
                                )}
                              </div>
                              <Badge variant="outline" className={typeColors[opp.Type] || ''}>
                                {opp.Type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    {selectedClient.opportunities.filter(opp => opp.Type === 'Cross-sell').length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhuma oportunidade de cross-sell identificada</p>
                    )}
                  </div>
                </div>

                {/* Available Products for Upsell/Cross-sell */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Produtos Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeProdutos.map((produto) => (
                      <Card key={produto.id} className="p-3">
                        <p className="font-medium text-sm">{produto.nome}</p>
                        <p className="text-xs text-muted-foreground mt-1">{produto.problemaQueResolve}</p>
                      </Card>
                    ))}
                  </div>
          </div>
          
                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => setSelectedClient(null)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setShowAddOpportunity(true);
                    setSelectedClient(null);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Oportunidade
              </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Opportunity Dialog */}
        <Dialog open={showAddOpportunity} onOpenChange={setShowAddOpportunity}>
            <DialogContent>
              <DialogHeader>
              <DialogTitle>Nova Oportunidade de Expansão</DialogTitle>
                <DialogDescription>
                Adicione uma nova oportunidade de upsell ou cross-sell para este cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input 
                    placeholder="Nome do cliente"
                    value={newOpp.client}
                    onChange={(e) => setNewOpp(prev => ({ ...prev, client: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                <Label>Tipo *</Label>
                  <Select
                    value={newOpp.type}
                    onValueChange={(value) => setNewOpp(prev => ({ ...prev, type: value as 'Upsell' | 'Cross-sell' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upsell">Upsell</SelectItem>
                      <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                <Label>Produto (opcional)</Label>
                <Select
                  value={newOpp.product}
                  onValueChange={(value) => setNewOpp(prev => ({ ...prev, product: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProdutos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.nome}>
                        {produto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                  <Textarea 
                    placeholder="Descreva a oportunidade..."
                    value={newOpp.notes}
                    onChange={(e) => setNewOpp(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddOpportunity(false)}>
                  Cancelar
                </Button>
              <Button onClick={handleAddOpportunity}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
    </AppLayout>
  );
}
