import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createAction } from '@/services/actions.service';
import { getPublicKPIs } from '@/services';
import { getPublicGoals } from '@/services';
import type { ActionType } from '@/types/action';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';

export default function ActionsCreatePage() {
  const [formData, setFormData] = useState({
    Name: '',
    Type: '' as ActionType | '',
    Date: new Date().toISOString().split('T')[0],
    Goal: '',
    KPI: '',
    Contribution: '',
    Earned: '',
    Notes: '',
  });
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const actionTypes: ActionType[] = [
    'Café',
    'Ativação de Rede',
    'Proposta',
    'Processo',
    'Rotina',
    'Automação',
    'Agente',
    'Diário',
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter goals based on selected KPI
    if (formData.KPI) {
      const filtered = goals.filter(goal => goal.KPI === formData.KPI);
      setFilteredGoals(filtered);
      // Clear Goal selection if it's not in the filtered list
      if (formData.Goal && !filtered.find(g => g.id === formData.Goal)) {
        setFormData(prev => ({ ...prev, Goal: '' }));
      }
    } else {
      setFilteredGoals([]);
      setFormData(prev => ({ ...prev, Goal: '' }));
    }
  }, [formData.KPI, goals]);

  async function loadData() {
    setLoading(true);
    try {
      const [kpisData, goalsData] = await Promise.all([
        getPublicKPIs(),
        getPublicGoals(),
      ]);
      setKpis(kpisData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.Name.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }
    if (!formData.Type) {
      toast.error('Tipo da tarefa é obrigatório');
      return;
    }
    if (!formData.Date) {
      toast.error('Data é obrigatória');
      return;
    }

    setSubmitting(true);

    try {
      const actionPayload: any = {
        Name: formData.Name,
        Type: formData.Type,
        Date: formData.Date,
        PublicVisible: true,
      };

      // Add optional fields
      if (formData.Goal) {
        actionPayload.Goal = formData.Goal;
      }
      if (formData.Contribution) {
        actionPayload.Contribution = parseFloat(formData.Contribution) || 0;
      }
      if (formData.Earned) {
        actionPayload.Earned = parseFloat(formData.Earned) || 0;
      }
      if (formData.Notes) {
        actionPayload.Notes = formData.Notes;
      }

      await createAction(actionPayload);
      setSubmitted(true);
      toast.success('Tarefa criada com sucesso!');
      
      // Reset form
      setTimeout(() => {
        setFormData({
          Name: '',
          Type: '' as ActionType | '',
          Date: new Date().toISOString().split('T')[0],
          Goal: '',
          KPI: '',
          Contribution: '',
          Earned: '',
          Notes: '',
        });
        setSubmitted(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error creating action:', error);
      toast.error(error.message || 'Erro ao criar tarefa');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Tarefa Criada!</h1>
          <p className="text-muted-foreground mb-6">
            A tarefa foi salva e estará disponível no dashboard.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Criar Nova Tarefa
          </h1>
          <p className="text-muted-foreground">
            Cadastre uma nova tarefa e relacione com um KPI para atualização automática
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Tarefa</CardTitle>
            <CardDescription>
              Preencha os dados da tarefa. Campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Tarefa *</Label>
              <Input
                id="name"
                placeholder="Ex: Reunião com cliente X"
                value={formData.Name}
                onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.Type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, Type: value as ActionType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.Date}
                onChange={(e) => setFormData(prev => ({ ...prev, Date: e.target.value }))}
              />
            </div>

            {/* KPI Selection */}
            <div className="space-y-2">
              <Label htmlFor="kpi">KPI Relacionado</Label>
              <Select
                value={formData.KPI}
                onValueChange={(value) => setFormData(prev => ({ ...prev, KPI: value, Goal: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um KPI (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecione um KPI para relacionar a tarefa. Após a conclusão, o gráfico será atualizado automaticamente.
              </p>
            </div>

            {/* Goal Selection (only if KPI is selected) */}
            {formData.KPI && (
              <div className="space-y-2">
                <Label htmlFor="goal">Meta Relacionada</Label>
                {filteredGoals.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma meta encontrada para este KPI. A tarefa pode ser criada sem meta, mas será necessário associar uma meta antes de concluí-la.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={formData.Goal}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, Goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma meta (recomendado)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.Name} ({goal.PeriodStart} - {goal.PeriodEnd})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  Selecione uma meta relacionada ao KPI. Isso permite atualizar automaticamente o progresso ao concluir a tarefa.
                </p>
              </div>
            )}

            {/* Contribution */}
            <div className="space-y-2">
              <Label htmlFor="contribution">Contribuição</Label>
              <Input
                id="contribution"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.Contribution}
                onChange={(e) => setFormData(prev => ({ ...prev, Contribution: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Valor que esta tarefa contribui para a meta (opcional)
              </p>
            </div>

            {/* Earned */}
            <div className="space-y-2">
              <Label htmlFor="earned">Valor Ganho (R$)</Label>
              <Input
                id="earned"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.Earned}
                onChange={(e) => setFormData(prev => ({ ...prev, Earned: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Valor financeiro ganho com esta tarefa (opcional)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais sobre a tarefa..."
                value={formData.Notes}
                onChange={(e) => setFormData(prev => ({ ...prev, Notes: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || !formData.Name.trim() || !formData.Type || !formData.Date}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

