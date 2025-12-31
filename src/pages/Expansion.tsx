import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Trophy, Sparkles, ArrowUpRight, Plus, Target } from 'lucide-react';
import { getExpansionOpportunities, getCustomerWins, createOpportunity, createCustomerWin, getClients } from '@/services';
import type { ExpansionOpportunity, CustomerWin, Client } from '@/types/expansion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusColors: Record<string, string> = {
  'Identificado': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'Em Negociação': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Fechado': 'bg-primary/10 text-primary border-primary/20',
  'Perdido': 'bg-destructive/10 text-destructive border-destructive/20',
};

const typeColors: Record<string, string> = {
  'Upsell': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Cross-sell': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

const healthColors: Record<string, string> = {
  'Green': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Yellow': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Red': 'bg-red-500/10 text-red-600 border-red-500/20',
};

const stages = ['Identificado', 'Em Negociação', 'Fechado', 'Perdido'];

export default function ExpansionPage() {
  const [opportunities, setOpportunities] = useState<ExpansionOpportunity[]>([]);
  const [golWins, setGolWins] = useState<CustomerWin[]>([]);
  const [allWins, setAllWins] = useState<CustomerWin[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  const [showNewWin, setShowNewWin] = useState(false);
  
  // New opportunity form
  const [newOpp, setNewOpp] = useState({
    client: '',
    type: '' as 'Upsell' | 'Cross-sell' | '',
    notes: '',
    health: 'Green' as string
  });
  
  // New win form
  const [newWin, setNewWin] = useState({
    client: '',
    description: '',
    winType: '',
    evidence: '',
    score: [5] as number[],
    upsellRecommended: false
  });

  const loadData = async () => {
    try {
      const [opps, wins, golList, clientsList] = await Promise.all([
        getExpansionOpportunities(),
        getCustomerWins(),
        getCustomerWins({ isGOL: true, lastDays: 30 }),
        getClients()
      ]);
      setOpportunities(opps);
      setAllWins(wins);
      setGolWins(golList);
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading expansion data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group opportunities by Stage
  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage] = opportunities.filter(opp => opp.Stage === stage || (!opp.Stage && stage === 'Identificado'));
    return acc;
  }, {} as Record<string, ExpansionOpportunity[]>);

  const handleCreateOpportunity = async () => {
    if (!newOpp.client || !newOpp.type) {
      toast.error('Preencha cliente e tipo');
      return;
    }
    
    try {
      await createOpportunity({
        Name: `${newOpp.type} - ${newOpp.client}`,
        Client: newOpp.client,
        Type: newOpp.type as 'Upsell' | 'Cross-sell',
        Status: 'Identificado',
        Stage: 'Identificado',
        Health: newOpp.health,
        Notes: newOpp.notes
      });
      
      toast.success('Oportunidade registrada!');
      setShowNewOpportunity(false);
      setNewOpp({ client: '', type: '', notes: '', health: 'Green' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar oportunidade');
    }
  };

  const handleCreateWin = async () => {
    if (!newWin.client || !newWin.description) {
      toast.error('Preencha cliente e descrição');
      return;
    }
    
    try {
      const score = newWin.score[0] || 0;
      const result = await createCustomerWin({
        Name: `Momento GOL - ${newWin.client}`,
        Client: newWin.client,
        Date: new Date().toISOString().split('T')[0],
        Description: newWin.description,
        WinType: newWin.winType,
        Evidence: newWin.evidence,
        Score: score,
        UpsellRecommended: newWin.upsellRecommended
      });
      
      if (result.isGOL) {
        toast.success('Momento GOL registrado! Fluxo GOL acionado.');
      } else {
        toast.success('Momento registrado!');
      }
      
      setShowNewWin(false);
      setNewWin({ client: '', description: '', winType: '', evidence: '', score: [5], upsellRecommended: false });
      loadData();
    } catch (error: any) {
      toast.error(error.message || error.error || 'Erro ao criar momento');
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Expansão
            </h1>
            <p className="text-muted-foreground">
              Upsell, Cross-sell e Momento GOL
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showNewWin} onOpenChange={setShowNewWin}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Trophy className="h-4 w-4 mr-1" />
                  Registrar GOL
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Momento GOL</DialogTitle>
                  <DialogDescription>
                    Cliente atingiu um marco importante
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Cliente *</Label>
                      <Select
                        value={newWin.client}
                        onValueChange={(value) => setNewWin(prev => ({ ...prev, client: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.Name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Vitória</Label>
                      <Input 
                        placeholder="Ex: Nova contratação, Renovação, etc"
                        value={newWin.winType}
                        onChange={(e) => setNewWin(prev => ({ ...prev, winType: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição *</Label>
                      <Textarea 
                        placeholder="Descreva o marco atingido..."
                        value={newWin.description}
                        onChange={(e) => setNewWin(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Evidência</Label>
                      <Textarea 
                        placeholder="Provas, documentos, evidências..."
                        value={newWin.evidence}
                        onChange={(e) => setNewWin(prev => ({ ...prev, evidence: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Score: {newWin.score[0]}/10 {newWin.score[0] >= 8 && <Badge className="ml-2 bg-primary">GOL!</Badge>}</Label>
                      <Slider
                        value={newWin.score}
                        onValueChange={(value) => setNewWin(prev => ({ ...prev, score: value }))}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Score ≥ 8 aciona automaticamente o fluxo GOL
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="upsellRecommended"
                        checked={newWin.upsellRecommended}
                        onChange={(e) => setNewWin(prev => ({ ...prev, upsellRecommended: e.target.checked }))}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="upsellRecommended">Recomendar Upsell</Label>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewWin(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateWin}>
                    Registrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showNewOpportunity} onOpenChange={setShowNewOpportunity}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Oportunidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Oportunidade</DialogTitle>
                  <DialogDescription>
                    Registre uma oportunidade de expansão
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Select
                      value={newOpp.client}
                      onValueChange={(value) => setNewOpp(prev => ({ ...prev, client: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label>Health do Cliente</Label>
                    <Select
                      value={newOpp.health}
                      onValueChange={(value) => setNewOpp(prev => ({ ...prev, health: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Green">Green</SelectItem>
                        <SelectItem value="Yellow">Yellow</SelectItem>
                        <SelectItem value="Red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea 
                      placeholder="Descreva a oportunidade..."
                      value={newOpp.notes}
                      onChange={(e) => setNewOpp(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewOpportunity(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOpportunity}>
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* GOL Radar */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              GOL Radar (últimos 30 dias)
            </CardTitle>
            <CardDescription>
              Momentos GOL detectados (Score ≥ 8)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {golWins.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum momento GOL nos últimos 30 dias
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {golWins.map((win) => (
                  <div 
                    key={win.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card border border-primary/20"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{win.Name}</p>
                      <p className="text-sm text-muted-foreground">{win.Client}</p>
                      {win.Score !== undefined && (
                        <Badge className="mt-1 bg-primary">Score: {win.Score}/10</Badge>
                      )}
                      {win.Description && (
                        <p className="text-xs text-muted-foreground mt-1">{win.Description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kanban de Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Oportunidades de Expansão</CardTitle>
            <CardDescription>
              Pipeline por estágio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stages.map(stage => (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-medium text-sm">{stage}</h3>
                    <Badge variant="outline">{opportunitiesByStage[stage]?.length || 0}</Badge>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {(opportunitiesByStage[stage] || []).map((opp) => (
                        <div 
                          key={opp.id}
                          className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                        >
                          <p className="font-medium text-sm text-foreground">{opp.Name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{opp.Client}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {opp.Type && (
                              <Badge variant="outline" className={typeColors[opp.Type] || ''}>
                                {opp.Type}
                              </Badge>
                            )}
                            {opp.Health && (
                              <Badge variant="outline" className={healthColors[opp.Health] || ''}>
                                {opp.Health}
                              </Badge>
                            )}
                          </div>
                          {opp.PlannedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Planejado: {new Date(opp.PlannedDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {opp.Notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {opp.Notes}
                            </p>
                          )}
                        </div>
                      ))}
                      {(!opportunitiesByStage[stage] || opportunitiesByStage[stage].length === 0) && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Nenhuma oportunidade
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clientes Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes Ativos</CardTitle>
            <CardDescription>
              Lista de clientes disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum cliente cadastrado
              </p>
            ) : (
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                {clients.map(client => (
                  <div key={client.id} className="p-2 rounded border border-border bg-card">
                    <p className="text-sm font-medium">{client.Name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
