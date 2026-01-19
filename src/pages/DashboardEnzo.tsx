import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { KPIChart } from '@/components/KPIChart';
import { ActionChecklist } from '@/components/ActionChecklist';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getEnzoKPIs, getEnzoGoals, getEnzoDailyActions, updateEnzoActionDone } from '@/services';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { Action } from '@/types/action';
import type { NotionKPI, NotionGoal, NotionAction } from '@/lib/notion/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardEnzo() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    
    // Carregar dados de forma independente para não falhar tudo se uma parte falhar
    const results = await Promise.allSettled([
      getEnzoKPIs(),
      getEnzoGoals(),
      getEnzoDailyActions()
    ]);

    const kpisData = results[0].status === 'fulfilled' ? results[0].value : [];
    const goalsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const actionsData = results[2].status === 'fulfilled' ? results[2].value : [];

    // Verificar erros específicos nos KPIs (mais crítico)
    if (results[0].status === 'rejected') {
      const kpiError = results[0].reason;
      console.error('Error loading KPIs:', kpiError);
      
      if (kpiError?.message?.includes('429') || kpiError?.message?.includes('rate limit')) {
        setError('Muitas requisições. Aguarde alguns segundos e recarregue a página.');
      } else if (kpiError?.message?.includes('NOTION_DB_KPIS_ENZO') || kpiError?.message?.includes('not configured')) {
        setError('Database de KPIs não configurada. Verifique NOTION_DB_KPIS_ENZO no .env.local da VPS.');
      } else if (kpiError?.message?.includes('Failed to fetch') || kpiError?.message?.includes('NetworkError') || kpiError?.message?.includes('conectar ao servidor')) {
        setError('Não foi possível conectar ao servidor. Verifique se o servidor está rodando na VPS.');
      } else {
        setError(`Erro ao carregar KPIs: ${kpiError?.message || 'Erro desconhecido'}`);
      }
    } else if (kpisData.length === 0) {
      // KPIs carregaram mas estão vazios (não é erro, apenas não há dados)
      setError(null);
    } else {
      // KPIs carregaram com sucesso, limpar erro
      setError(null);
    }
    
    // Log erros de Goals e Actions (mas não bloqueiam o dashboard)
    if (results[1].status === 'rejected') {
      console.error('Error loading Goals:', results[1].reason);
    }
    if (results[2].status === 'rejected') {
      console.error('Error loading Actions:', results[2].reason);
    }

    const sortedKpis = kpisData.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
    setKpis(sortedKpis);
    setGoals(goalsData);
    setActions(actionsData);
    
    if (refreshing) {
      if (kpisData.length > 0) {
        toast.success('Dados atualizados');
      } else if (error) {
        toast.error('Erro ao atualizar dados');
      }
    }
    
    setLoading(false);
    setRefreshing(false);
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleAction = async (actionId: string, done: boolean) => {
    try {
      await updateEnzoActionDone(actionId, done);
      // Reload actions to get updated data
      const updatedActions = await getEnzoDailyActions();
      setActions(updatedActions);
      // Reload goals to update progress
      const updatedGoals = await getEnzoGoals();
      setGoals(updatedGoals);
    } catch (err: any) {
      console.error('Error updating action:', err);
      toast.error(err.reason || err.message || 'Erro ao atualizar ação');
    }
  };

  // Separate KPIs: output (financial) vs inputs (non-financial)
  const outputKPI = kpis.find(kpi => kpi.IsFinancial === true); // KPI 4 - Meta Semanal
  const inputKPIs = kpis.filter(kpi => kpi.IsFinancial === false); // KPI 1, 2, 3

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-3 md:space-y-6 pb-4 md:pb-6 px-2 md:px-0">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-foreground leading-tight">
              Dashboard Enzo Canei
            </h1>
            <p className="text-xs md:text-base text-muted-foreground mt-1">
              PDA Semana 3 | Meta: R$ 20K até 23/01
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading || refreshing}
            className="w-full md:w-auto md:flex-shrink-0 h-9"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin mr-2' : 'mr-2'}`} />
            <span className="text-xs md:text-sm">Atualizar</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KPIs no Topo - Sempre visível quando existirem */}
        {kpis.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div>
              <h2 className="text-base md:text-xl font-bold text-foreground">Métricas e Metas</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Progresso semanal até 23/01/2026
              </p>
            </div>
            {/* Grid de KPIs - Meta Semanal destacada + Input KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Meta Semanal (output) - primeira se for financeiro, senão após os inputs */}
              {outputKPI && (
                <Card key={outputKPI.id} className="border-2 border-primary/50 overflow-hidden">
                  <CardContent className="pt-4 md:pt-6">
                    <KPICard 
                      kpi={outputKPI as NotionKPI}
                      goal={goals.find(g => g.KPI === outputKPI.id) as NotionGoal | undefined}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Input KPIs */}
              {inputKPIs.map((kpi) => {
                const goal = goals.find(g => g.KPI === kpi.id);
                return (
                  <Card key={kpi.id} className="overflow-hidden">
                    <CardContent className="pt-4 md:pt-6">
                      <KPICard 
                        kpi={kpi as NotionKPI}
                        goal={goal as NotionGoal | undefined}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Separator className="my-3 md:my-6" />
          </div>
        )}

        {/* Mensagem se não houver KPIs */}
        {kpis.length === 0 && !loading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              {error ? (
                <>
                  {error}
                  <br />
                  <br />
                  <strong>Verifique:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Se NOTION_DB_KPIS_ENZO está configurado no .env.local</li>
                    <li>Se o servidor foi reiniciado após configurar as variáveis</li>
                    <li>Se os KPIs estão marcados como "Active" na database do Notion</li>
                  </ul>
                </>
              ) : (
                <>
                  Nenhum KPI encontrado. Verifique se os KPIs estão ativos na database do Notion.
                  <br />
                  <br />
                  Para criar KPIs iniciais, execute: <code className="text-xs">npx tsx scripts/populate-enzo-kpis.ts</code>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Ações do Dia (To-dos) */}
        {kpis.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div>
              <h2 className="text-base md:text-xl font-bold text-foreground">Ações do Dia</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Checklist para hoje
              </p>
            </div>
            <ActionChecklist
              actions={actions as NotionAction[]}
              onToggle={handleToggleAction}
              journalBlocked={false}
              refreshing={refreshing}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

