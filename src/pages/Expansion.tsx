import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Trophy, Sparkles, ArrowUpRight, Plus } from 'lucide-react';
import { getExpansionOpportunities, getCustomerWins } from '@/lib/notion/data-layer';
import type { NotionExpansionOpportunity, NotionCustomerWin } from '@/lib/notion/types';
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

export default function ExpansionPage() {
  const [opportunities, setOpportunities] = useState<NotionExpansionOpportunity[]>([]);
  const [customerWins, setCustomerWins] = useState<NotionCustomerWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [opps, wins] = await Promise.all([
          getExpansionOpportunities(),
          getCustomerWins()
        ]);
        setOpportunities(opps);
        setCustomerWins(wins);
      } catch (error) {
        console.error('Error loading expansion data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
          
          <Dialog open={showNewOpportunity} onOpenChange={setShowNewOpportunity}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova
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
                  <Label>Cliente</Label>
                  <Input placeholder="Nome do cliente" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsell">Upsell</SelectItem>
                      <SelectItem value="crosssell">Cross-sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva a oportunidade..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewOpportunity(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  toast.success('Oportunidade registrada!');
                  setShowNewOpportunity(false);
                }}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Momento GOL - Customer Wins */}
        {customerWins.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-primary" />
                Momento GOL
              </CardTitle>
              <CardDescription>
                Clientes que atingiram marcos importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerWins.map((win) => (
                <div 
                  key={win.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{win.Name}</p>
                    <p className="text-sm text-muted-foreground">{win.Client}</p>
                    <p className="text-xs text-muted-foreground mt-1">{win.Description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Expansion Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Oportunidades de Expansão</CardTitle>
            <CardDescription>
              Pipeline de upsell e cross-sell
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhuma oportunidade identificada
              </p>
            ) : (
              opportunities.map((opp) => (
                <div 
                  key={opp.id}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{opp.Name}</p>
                      <p className="text-sm text-muted-foreground">{opp.Client}</p>
                    </div>
                    <Badge variant="outline" className={statusColors[opp.Status] || ''}>
                      {opp.Status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className={typeColors[opp.Type] || ''}>
                      {opp.Type}
                    </Badge>
                  </div>
                  {opp.Notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {opp.Notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Oportunidades</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {opportunities.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Momento GOL</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {customerWins.length}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
