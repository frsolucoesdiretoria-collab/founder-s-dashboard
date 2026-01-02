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
import { Loader2, Plus, AlertCircle, Users, Coffee, FileText, Cog, Zap, Bot, BookOpen, Edit, Edit2, Trash2, Flag } from 'lucide-react';
import { getAllActions, updateActionDone, createAction, createContact, updateAction, deleteAction } from '@/services';
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

  // Quick edit modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [editActionName, setEditActionName] = useState('');
  const [editActionType, setEditActionType] = useState<ActionType>('Ativação de Rede');
  const [editActionDate, setEditActionDate] = useState('');
  const [editSelectedKPI, setEditSelectedKPI] = useState<string>('');
  const [editSelectedGoal, setEditSelectedGoal] = useState<string>('');
  const [editContribution, setEditContribution] = useState<string>('1');
  const [editPriority, setEditPriority] = useState<'Alta' | 'Média' | 'Baixa' | ''>('');
  const [editPublicVisible, setEditPublicVisible] = useState(true);
  const [editContactName, setEditContactName] = useState('');
  const [editContactWhatsApp, setEditContactWhatsApp] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editGoals, setEditGoals] = useState<Goal[]>([]);
  const [saving, setSaving] = useState(false);
  const [goalIdForFiltering, setGoalIdForFiltering] = useState<string | null>(null);
  const [deletingAction, setDeletingAction] = useState<Action | null>(null);

  // Form state
  const [selectedKPI, setSelectedKPI] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('Ativação de Rede');
  const [actionName, setActionName] = useState('');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [contribution, setContribution] = useState<string>('1');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa' | ''>('');
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

  useEffect(() => {
    // Quando KPI muda no modal de edição, buscar Goals correspondentes
    if (editSelectedKPI) {
      loadEditGoalsForKPI(editSelectedKPI);
    } else {
      setEditGoals([]);
      setEditSelectedGoal('');
    }
  }, [editSelectedKPI]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando dados...');
      const [actionsData, kpisData] = await Promise.all([
        getAllActions({ start: '2026-01-01', end: '2026-01-31' }),
        getPublicKPIs()
      ]);
      
      console.log(`📊 Actions recebidas: ${actionsData.length}`);
      console.log('📋 Primeiras 3 actions:', actionsData.slice(0, 3).map(a => ({ 
        name: a.Name, 
        date: a.Date, 
        visible: a.PublicVisible 
      })));
      
      const publicActions = actionsData.filter(action => action.PublicVisible === true);
      console.log(`👁️ Actions públicas (PublicVisible=true): ${publicActions.length}`);
      
      publicActions.sort((a, b) => a.Date.localeCompare(b.Date));
      setActions(publicActions);
      setKpis(kpisData.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0)));
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
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

  async function loadEditGoalsForKPI(kpiId: string) {
    try {
      const kpiGoals = await getGoalsByKPI(kpiId);
      // Filtrar apenas goals do período atual (janeiro 2026)
      const currentGoals = kpiGoals.filter(g => 
        g.Month === 1 && g.Year === 2026
      );
      setEditGoals(currentGoals);
      
      // Se só tem uma goal, selecionar automaticamente
      if (currentGoals.length === 1) {
        setEditSelectedGoal(currentGoals[0].id);
      } else if (currentGoals.length > 0) {
        setEditSelectedGoal(''); // Reset para usuário escolher
      } else {
        setEditSelectedGoal('');
      }
    } catch (err) {
      console.error('Error loading edit goals:', err);
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
        Priority: priority || undefined,
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
      setPriority('');
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

  // Find next action to edit (for quick edit flow)
  function findNextActionToEdit(currentActionId: string, goalId: string | null): Action | null {
    if (!goalId) return null;

    // Get all actions for this goal, not done, sorted by date then by creation order
    const goalActions = actions
      .filter(a => a.Goal === goalId && !a.Done)
      .sort((a, b) => {
        // First sort by date
        const dateCompare = a.Date.localeCompare(b.Date);
        if (dateCompare !== 0) return dateCompare;
        // Then by ID (creation order)
        return a.id.localeCompare(b.id);
      });

    // Find current action index
    const currentIndex = goalActions.findIndex(a => a.id === currentActionId);
    
    // Return next action, or null if no more
    if (currentIndex >= 0 && currentIndex < goalActions.length - 1) {
      return goalActions[currentIndex + 1];
    }
    
    return null;
  }

  // Open edit dialog for an action
  async function handleOpenEdit(action: Action) {
    setEditingAction(action);
    
    // Set all fields from action
    setEditActionName(action.Name);
    setEditActionType(action.Type);
    setEditActionDate(action.Date);
    setEditContribution(String(action.Contribution || 1));
    setEditPriority((action as NotionAction).Priority || '');
    setEditPublicVisible(action.PublicVisible ?? true);
    setEditNotes((action as NotionAction).Notes || '');
    
    // Extract contact name from action name if it follows pattern "Enviar áudio para [NOME]"
    const nameMatch = action.Name.match(/Enviar áudio para (.+)/);
    if (nameMatch) {
      setEditContactName(nameMatch[1] === '[VAZIO]' ? '' : nameMatch[1]);
    } else {
      setEditContactName('');
    }
    
    // Extract WhatsApp from notes if present
    const notes = (action as NotionAction).Notes || '';
    const whatsappMatch = notes.match(/WhatsApp:\s*(.+)/);
    setEditContactWhatsApp(whatsappMatch ? whatsappMatch[1].trim() : '');
    
    // Find KPI from Goal
    if (action.Goal) {
      const allGoalsData = await getAllGoals();
      const goal = allGoalsData.find(g => g.id === action.Goal);
      if (goal && goal.KPI) {
        setEditSelectedKPI(goal.KPI);
        setEditSelectedGoal(action.Goal);
      } else {
        setEditSelectedKPI('');
        setEditSelectedGoal(action.Goal);
      }
    } else {
      setEditSelectedKPI('');
      setEditSelectedGoal('');
    }
    
    setGoalIdForFiltering(action.Goal || null);
    setEditDialogOpen(true);
  }

  // Handle delete action
  async function handleDeleteAction() {
    if (!deletingAction) return;

    try {
      await deleteAction(deletingAction.id);
      toast.success('Tarefa excluída!');
      setDeletingAction(null);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting action:', err);
      toast.error(err.message || 'Erro ao excluir tarefa');
    }
  }

  // Save and move to next action
  async function handleSaveAndNext() {
    if (!editingAction || !editActionName.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    setSaving(true);
    try {
      // Build updated notes (preserve existing notes, add/update WhatsApp)
      let updatedNotes = editNotes;
      if (editContactWhatsApp.trim()) {
        // Remove existing WhatsApp line if present
        updatedNotes = updatedNotes.replace(/WhatsApp:\s*.+(\n|$)/g, '').trim();
        // Add new WhatsApp line
        const whatsappLine = `WhatsApp: ${editContactWhatsApp.trim()}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n${whatsappLine}` : whatsappLine;
      }

      // Update action with all fields
      await updateAction(editingAction.id, {
        Name: editActionName.trim(),
        Type: editActionType,
        Date: editActionDate,
        Goal: editSelectedGoal || undefined,
        Contribution: parseFloat(editContribution) || 1,
        Priority: editPriority || undefined,
        PublicVisible: editPublicVisible,
        Notes: updatedNotes,
        ContactName: editContactName.trim() || undefined,
        ContactWhatsApp: editContactWhatsApp.trim() || undefined,
      });

      // Reload actions to get updated data
      await loadData();

      // Find next action
      const nextAction = findNextActionToEdit(editingAction.id, goalIdForFiltering);

      if (nextAction) {
        // Open next action
        toast.success('Tarefa salva! Abrindo próxima...');
        // Small delay to ensure state updates
        setTimeout(() => {
          handleOpenEdit(nextAction);
        }, 100);
      } else {
        // No more actions
        toast.success('Tarefa salva! Todas as tarefas foram preenchidas.');
        setEditDialogOpen(false);
        setEditingAction(null);
      }
    } catch (err: any) {
      console.error('Error updating action:', err);
      toast.error(err.message || 'Erro ao salvar tarefa');
    } finally {
      setSaving(false);
    }
  }

  // Save without moving to next
  async function handleSave() {
    if (!editingAction || !editActionName.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    setSaving(true);
    try {
      // Build updated notes
      let updatedNotes = editNotes;
      if (editContactWhatsApp.trim()) {
        updatedNotes = updatedNotes.replace(/WhatsApp:\s*.+(\n|$)/g, '').trim();
        const whatsappLine = `WhatsApp: ${editContactWhatsApp.trim()}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n${whatsappLine}` : whatsappLine;
      }

      await updateAction(editingAction.id, {
        Name: editActionName.trim(),
        Type: editActionType,
        Date: editActionDate,
        Goal: editSelectedGoal || undefined,
        Contribution: parseFloat(editContribution) || 1,
        Priority: editPriority || undefined,
        PublicVisible: editPublicVisible,
        Notes: updatedNotes,
        ContactName: editContactName.trim() || undefined,
        ContactWhatsApp: editContactWhatsApp.trim() || undefined,
      });

      await loadData();
      toast.success('Tarefa salva!');
      setEditDialogOpen(false);
      setEditingAction(null);
    } catch (err: any) {
      console.error('Error updating action:', err);
      toast.error(err.message || 'Erro ao salvar tarefa');
    } finally {
      setSaving(false);
    }
  }

  // Separar tarefas pendentes e concluídas
  const pendingActions = actions.filter(a => !a.Done);
  const completedActions = actions.filter(a => a.Done);

  // Função para ordenar por prioridade: Alta > Média > Baixa > sem prioridade
  const priorityOrder = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
  const sortByPriority = (a: Action, b: Action) => {
    const aPriority = (a as NotionAction).Priority || '';
    const bPriority = (b as NotionAction).Priority || '';
    const aOrder = priorityOrder[aPriority as keyof typeof priorityOrder] || 99;
    const bOrder = priorityOrder[bPriority as keyof typeof priorityOrder] || 99;
    return aOrder - bOrder;
  };

  // Ordenar por prioridade
  pendingActions.sort(sortByPriority);
  completedActions.sort(sortByPriority);

  // Agrupar ações pendentes por data
  const pendingActionsByDate = pendingActions.reduce((acc, action) => {
    const date = action.Date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const sortedPendingDates = Object.keys(pendingActionsByDate).sort();

  // Agrupar ações concluídas por data
  const completedActionsByDate = completedActions.reduce((acc, action) => {
    const date = action.Date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const sortedCompletedDates = Object.keys(completedActionsByDate).sort();

  const completedCount = completedActions.length;
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

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as 'Alta' | 'Média' | 'Baixa' | '')}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Edite todos os campos da tarefa
              </DialogDescription>
            </DialogHeader>
            
            {editingAction && (
              <div className="space-y-4 mt-4">
                {/* KPI Selection */}
                <div className="space-y-2">
                  <Label htmlFor="editKPI">KPI</Label>
                  <Select value={editSelectedKPI} onValueChange={setEditSelectedKPI}>
                    <SelectTrigger id="editKPI">
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
                </div>

                {/* Goal Selection */}
                {editSelectedKPI && editGoals.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="editGoal">Meta</Label>
                    <Select value={editSelectedGoal} onValueChange={setEditSelectedGoal}>
                      <SelectTrigger id="editGoal">
                        <SelectValue placeholder="Selecione uma meta" />
                      </SelectTrigger>
                      <SelectContent>
                        {editGoals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Action Type */}
                <div className="space-y-2">
                  <Label htmlFor="editType">Tipo</Label>
                  <Select value={editActionType} onValueChange={(v) => setEditActionType(v as ActionType)}>
                    <SelectTrigger id="editType">
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
                  <Label htmlFor="editName">Nome da Tarefa *</Label>
                  <Input
                    id="editName"
                    value={editActionName}
                    onChange={(e) => setEditActionName(e.target.value)}
                    placeholder="Ex: Enviar áudio para João Silva"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="editDate">Data *</Label>
                  <Input
                    id="editDate"
                    type="date"
                    value={editActionDate}
                    onChange={(e) => setEditActionDate(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="editPriority">Prioridade</Label>
                  <Select value={editPriority} onValueChange={(v) => setEditPriority(v as 'Alta' | 'Média' | 'Baixa' | '')}>
                    <SelectTrigger id="editPriority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contribution */}
                <div className="space-y-2">
                  <Label htmlFor="editContribution">Contribuição</Label>
                  <Input
                    id="editContribution"
                    type="number"
                    step="0.1"
                    value={editContribution}
                    onChange={(e) => setEditContribution(e.target.value)}
                    placeholder="Ex: 1, 5, 0.5"
                  />
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="editContactName">Nome do Contato</Label>
                  <Input
                    id="editContactName"
                    value={editContactName}
                    onChange={(e) => setEditContactName(e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="editContactWhatsApp">WhatsApp</Label>
                  <Input
                    id="editContactWhatsApp"
                    value={editContactWhatsApp}
                    onChange={(e) => setEditContactWhatsApp(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="editNotes">Notas</Label>
                  <Textarea
                    id="editNotes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Observações sobre esta tarefa..."
                    rows={3}
                  />
                </div>

                {/* Public Visible */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editPublicVisible"
                    checked={editPublicVisible}
                    onCheckedChange={(checked) => setEditPublicVisible(checked as boolean)}
                  />
                  <Label htmlFor="editPublicVisible" className="cursor-pointer">
                    Visível no dashboard público
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingAction(null);
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !editActionName.trim()}
                  >
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingAction} onOpenChange={() => setDeletingAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a tarefa "{deletingAction?.Name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingAction(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        {/* Tarefas Pendentes */}
        {sortedPendingDates.length === 0 && sortedCompletedDates.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma tarefa encontrada para Janeiro 2026. Crie sua primeira tarefa usando o botão "Nova Tarefa".
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {sortedPendingDates.length > 0 && (
              <div className="space-y-6">
                {sortedPendingDates.map(date => {
                  const dateActions = pendingActionsByDate[date];
                  const dateObj = new Date(date);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  });

                  return (
                    <Card key={date}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize">
                          {formattedDate}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {dateActions.map(action => {
                          const actionTyped = action as NotionAction;
                          const hasNoGoal = !actionTyped.Goal || actionTyped.Goal.trim() === '';
                          const isRefreshing = refreshing[action.id];
                          const ActionIcon = typeIcons[actionTyped.Type] || Users;
                          const priority = actionTyped.Priority;

                          return (
                            <div
                              key={action.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                "bg-card border-border hover:border-primary/30",
                                hasNoGoal && "border-destructive/30 bg-destructive/5"
                              )}
                            >
                              <Checkbox
                                checked={actionTyped.Done}
                                onCheckedChange={() => handleToggleAction(action.id, !actionTyped.Done)}
                                disabled={isRefreshing || hasNoGoal}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {priority && (
                                      <Flag 
                                        className={cn(
                                          "h-4 w-4 flex-shrink-0",
                                          priority === 'Alta' && "text-red-500",
                                          priority === 'Média' && "text-yellow-500",
                                          priority === 'Baixa' && "text-blue-500"
                                        )} 
                                      />
                                    )}
                                    <p className="font-medium text-sm flex-1 min-w-0">
                                      {actionTyped.Name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenEdit(action)}
                                      className="h-7 px-2"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingAction(action)}
                                      className="h-7 px-2 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
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
                                  {hasNoGoal && (
                                    <Badge variant="destructive" className="text-xs">
                                      Sem meta
                                    </Badge>
                                  )}
                                  {priority && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        priority === 'Alta' && "border-red-500/50 text-red-600 bg-red-50",
                                        priority === 'Média' && "border-yellow-500/50 text-yellow-600 bg-yellow-50",
                                        priority === 'Baixa' && "border-blue-500/50 text-blue-600 bg-blue-50"
                                      )}
                                    >
                                      {priority}
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

            {/* Tarefas Concluídas - Arquivo Morto */}
            {sortedCompletedDates.length > 0 && (
              <div className="space-y-6 mt-8">
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Arquivo Morto</h2>
                  {sortedCompletedDates.map(date => {
                    const dateActions = completedActionsByDate[date];
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    });

                    return (
                      <Card key={date} className="mb-4 opacity-75">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base capitalize text-muted-foreground">
                            {formattedDate}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {dateActions.map(action => {
                            const actionTyped = action as NotionAction;
                            const ActionIcon = typeIcons[actionTyped.Type] || Users;

                            return (
                              <div
                                key={action.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50 border-muted"
                              >
                                <Checkbox
                                  checked={actionTyped.Done}
                                  onCheckedChange={() => handleToggleAction(action.id, !actionTyped.Done)}
                                  disabled={refreshing[action.id]}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-sm flex-1 line-through text-muted-foreground">
                                      {actionTyped.Name}
                                    </p>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenEdit(action)}
                                        className="h-7 px-2"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingAction(action)}
                                        className="h-7 px-2 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge 
                                      variant="outline" 
                                      className="bg-muted text-muted-foreground border-muted text-xs"
                                    >
                                      <ActionIcon className="h-3 w-3 mr-1" />
                                      {actionTyped.Type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
