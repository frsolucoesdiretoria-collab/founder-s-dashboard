import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, AlertCircle, Users, Coffee, FileText, Cog, Zap, Bot, BookOpen } from 'lucide-react';
import { getAllActions, updateActionDone, createAction, createContact } from '@/services';
import { getPublicKPIs } from '@/services/kpis.service';
import { getAllGoals, getGoalsByKPI } from '@/services/goals.service';
import type { Action } from '@/types/action';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { NotionAction } from '@/lib/notion/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ActionType = 'Café' | 'Ativação de Rede' | 'Proposta' | 'Processo' | 'Rotina' | 'Automação' | 'Agente' | 'Diário';

const typeIcons: Record<string, React.ElementType> = {
  'Café': Coffee,
  'Ativação de Rede': Users,
  'Proposta': FileText,
  'Processo': Cog,
  'Rotina': Cog,
  'Automação': Zap,
  'Agente': Bot,
  'Diário': BookOpen,
};

export default function ActionsCreatePage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});

  // Form state
  const [selectedKPI, setSelectedKPI] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('Ativação de Rede');
  const [actionName, setActionName] = useState('');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [contribution, setContribution] = useState<string>('1');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Quando KPI muda, buscar Goals correspondentes
    if (selectedKPI) {
      loadGoalsForKPI(selectedKPI);
    } else {
      setGoals([]);
      setSelectedGoal('');
    }
  }, [selectedKPI]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [actionsData, kpisData] = await Promise.all([
        getAllActions({ start: '2026-01-01', end: '2026-01-31' }),
        getPublicKPIs()
      ]);
      
      const publicActions = actionsData.filter(action => action.PublicVisible === true);
      publicActions.sort((a, b) => a.Date.localeCompare(b.Date));
      setActions(publicActions);
      setKpis(kpisData.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0)));
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados. Verifique sua conexão.');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function loadGoalsForKPI(kpiId: string) {
    try {
      const kpiGoals = await getGoalsByKPI(kpiId);
      // Filtrar apenas goals do período atual (janeiro 2026)
      const currentGoals = kpiGoals.filter(g => 
        g.Month === 1 && g.Year === 2026
      );
      setGoals(currentGoals);
      
      // Se só tem uma goal, selecionar automaticamente
      if (currentGoals.length === 1) {
        setSelectedGoal(currentGoals[0].id);
      } else if (currentGoals.length > 0) {
        setSelectedGoal(''); // Reset para usuário escolher
      } else {
        setSelectedGoal('');
      }
    } catch (err) {
      console.error('Error loading goals:', err);
      toast.error('Erro ao carregar metas');
    }
  }

  async function handleCreateAction() {
    if (!selectedGoal || !actionName || !actionDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setCreating(true);
    try {
      let contactId = '';

      // Se tem nome de contato e é tipo relevante, criar contato primeiro
      if (contactName && (actionType === 'Café' || actionType === 'Ativação de Rede')) {
        try {
          const contact = await createContact(contactName);
          contactId = contact.id;
          toast.success(`Contato "${contactName}" criado`);
        } catch (err: any) {
          console.error('Error creating contact:', err);
          // Continua mesmo se falhar ao criar contato
          toast.warning('Tarefa será criada, mas contato não pôde ser criado');
        }
      }

      const newAction = await createAction({
        Name: actionName,
        Type: actionType,
        Date: actionDate,
        Goal: selectedGoal,
        Contribution: contribution ? parseFloat(contribution) : undefined,
        Notes: notes || undefined,
        Contact: contactId,
        Done: false,
        PublicVisible: true,
        Earned: 0,
        Client: '',
        Proposal: '',
        Diagnostic: '',
        WeekKey: '',
        Month: 0,
      });

      toast.success('Tarefa criada com sucesso!');
      
      // Reset form
      setActionName('');
      setActionDate(new Date().toISOString().split('T')[0]);
      setContribution('1');
      setNotes('');
      setContactName('');
      setContactWhatsApp('');
      setSelectedKPI('');
      setSelectedGoal('');
      setDialogOpen(false);
      
      // Reload actions
      await loadData();
    } catch (err: any) {
      console.error('Error creating action:', err);
      toast.error(err.message || 'Erro ao criar tarefa');
    } finally {
      setCreating(false);
    }
  }

  const handleToggleAction = async (actionId: string, done: boolean) => {
    try {
      setRefreshing(prev => ({ ...prev, [actionId]: true }));
      await updateActionDone(actionId, done);
      setActions(prev => 
        prev.map(a => a.id === actionId ? { ...a, Done: done } : a)
      );
      toast.success(done ? 'Ação concluída!' : 'Ação reaberta');
    } catch (err: any) {
      console.error('Error updating action:', err);
      const message = err.message || 'Erro ao atualizar ação';
      toast.error(message);
    } finally {
      setRefreshing(prev => ({ ...prev, [actionId]: false }));
    }
  };

  // Agrupar ações por data
  const actionsByDate = actions.reduce((acc, action) => {
    const date = action.Date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const sortedDates = Object.keys(actionsByDate).sort();

  const completedCount = actions.filter(a => a.Done).length;
  const totalCount = actions.length;

  const selectedKPIObject = kpis.find(k => k.id === selectedKPI);
  const TypeIcon = typeIcons[actionType] || Users;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Carregando tarefas...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 pb-6">
        <div className="px-1 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Tarefas</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Tarefas de Janeiro 2026
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Crie uma tarefa e relacione com um KPI do dashboard
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* KPI Selection */}
                <div className="space-y-2">
                  <Label htmlFor="kpi">KPI *</Label>
                  <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                    <SelectTrigger id="kpi">
                      <SelectValue placeholder="Selecione um KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpis.map(kpi => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedKPIObject && (
                    <p className="text-xs text-muted-foreground">
                      {selectedKPIObject.Description}
                    </p>
                  )}
                </div>

                {/* Goal Selection */}
                {selectedKPI && goals.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="goal">Meta *</Label>
                    <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Selecione uma meta" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedKPI && goals.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma meta encontrada para este KPI no período atual (Janeiro 2026).
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Café">Café</SelectItem>
                      <SelectItem value="Ativação de Rede">Ativação de Rede</SelectItem>
                      <SelectItem value="Proposta">Proposta</SelectItem>
                      <SelectItem value="Processo">Processo</SelectItem>
                      <SelectItem value="Rotina">Rotina</SelectItem>
                      <SelectItem value="Automação">Automação</SelectItem>
                      <SelectItem value="Agente">Agente</SelectItem>
                      <SelectItem value="Diário">Diário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Tarefa *</Label>
                  <Input
                    id="name"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                    placeholder="Ex: Enviar áudio para João Silva"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={actionDate}
                    onChange={(e) => setActionDate(e.target.value)}
                  />
                </div>

                {/* Contribution */}
                <div className="space-y-2">
                  <Label htmlFor="contribution">Contribuição</Label>
                  <Input
                    id="contribution"
                    type="number"
                    step="0.1"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    placeholder="Ex: 1, 5, 0.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor que esta tarefa contribui para a meta (ex: 5 contatos, 1 café)
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações sobre esta tarefa..."
                    rows={3}
                  />
                </div>

                {/* Contact Info */}
                {(actionType === 'Café' || actionType === 'Ativação de Rede') && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm">Informações do Contato (Opcional)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nome do Contato</Label>
                      <Input
                        id="contactName"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactWhatsApp">WhatsApp</Label>
                      <Input
                        id="contactWhatsApp"
                        value={contactWhatsApp}
                        onChange={(e) => setContactWhatsApp(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                      />
                      <p className="text-xs text-muted-foreground">
                        O contato será criado automaticamente na base de contatos quando você criar a tarefa
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateAction}
                    disabled={creating || !selectedGoal || !actionName}
                  >
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Tarefa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resumo */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resumo</CardTitle>
              <Badge variant="secondary" className="font-medium">
                {completedCount}/{totalCount} concluídas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total de tarefas</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-primary">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarefas agrupadas por data */}
        {sortedDates.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma tarefa encontrada para Janeiro 2026. Crie sua primeira tarefa usando o botão "Nova Tarefa".
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => {
              const dateActions = actionsByDate[date];
              const dateObj = new Date(date);
              const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              });
              const dateCompleted = dateActions.filter(a => a.Done).length;
              const dateTotal = dateActions.length;

              return (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {formattedDate}
                      </CardTitle>
                      <Badge variant="outline" className="font-medium">
                        {dateCompleted}/{dateTotal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dateActions.map(action => {
                      const actionTyped = action as NotionAction;
                      const hasNoGoal = !actionTyped.Goal || actionTyped.Goal.trim() === '';
                      const isRefreshing = refreshing[action.id];
                      const ActionIcon = typeIcons[actionTyped.Type] || Users;

                      return (
                        <div
                          key={action.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all",
                            actionTyped.Done 
                              ? "bg-muted/50 border-muted" 
                              : "bg-card border-border hover:border-primary/30",
                            hasNoGoal && !actionTyped.Done && "border-destructive/30 bg-destructive/5"
                          )}
                        >
                          <Checkbox
                            checked={actionTyped.Done}
                            onCheckedChange={() => handleToggleAction(action.id, !actionTyped.Done)}
                            disabled={isRefreshing || hasNoGoal}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm",
                              actionTyped.Done && "line-through text-muted-foreground"
                            )}>
                              {actionTyped.Name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs"
                              >
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {actionTyped.Type}
                              </Badge>
                              {actionTyped.Contribution !== undefined && actionTyped.Contribution > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Contribuição: {actionTyped.Contribution}
                                </Badge>
                              )}
                              {hasNoGoal && !actionTyped.Done && (
                                <Badge variant="destructive" className="text-xs">
                                  Sem meta
                                </Badge>
                              )}
                            </div>
                            {actionTyped.Notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {actionTyped.Notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
