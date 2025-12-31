import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { KPIChart } from '@/components/KPIChart';
import { ActionChecklist } from '@/components/ActionChecklist';
import { JournalModal } from '@/components/JournalModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { 
  getPublicKPIs, 
  getPublicGoals, 
  getDailyActions, 
  checkYesterdayJournal, 
  updateActionDone, 
  createJournalEntry 
} from '@/services';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { Action } from '@/types/action';
import type { Journal } from '@/types/journal';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';
import { toast } from 'sonner';

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [journalBlocked, setJournalBlocked] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Debug: Log KPIs and goals
  useEffect(() => {
    if (kpis.length > 0) {
      console.log('📊 KPIs carregados:', kpis.length);
      console.log('📈 KPIs por periodicidade:', {
        semanal: kpis.filter(k => k.Periodicity?.toLowerCase() === 'semanal' || k.Periodicity === 'Semanal').length,
        mensal: kpis.filter(k => k.Periodicity?.toLowerCase() === 'mensal' || k.Periodicity === 'Mensal').length,
        anual: kpis.filter(k => k.Periodicity?.toLowerCase() === 'anual' || k.Periodicity === 'Anual').length,
      });
      console.log('🎯 Goals carregados:', goals.length);
    }
  }, [kpis, goals]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [kpisData, goalsData, actionsData, journalStatus] = await Promise.all([
        getPublicKPIs(),
        getPublicGoals(),
        getDailyActions(),
        checkYesterdayJournal()
      ]);

      // Remove duplicate KPIs by name (keep first occurrence, prefer higher SortOrder)
      const uniqueKPIs = new Map<string, KPI>();
      kpisData.forEach(kpi => {
        const key = kpi.Name.trim().toLowerCase();
        const existing = uniqueKPIs.get(key);
        if (!existing) {
          uniqueKPIs.set(key, kpi);
        } else {
          // Keep the one with higher SortOrder (or first if equal)
          if ((kpi.SortOrder || 0) > (existing.SortOrder || 0)) {
            uniqueKPIs.set(key, kpi);
          }
        }
      });

      // Sort KPIs by SortOrder (ascending)
      const sortedKpis = Array.from(uniqueKPIs.values()).sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
      setKpis(sortedKpis);
      setGoals(goalsData);
      setActions(actionsData);
      
      // Check if yesterday's journal is not filled (LOCK)
      const isLocked = !journalStatus.exists || !journalStatus.filled;
      setJournalBlocked(isLocked);
      
      // Show modal if locked (obrigatório)
      if (isLocked) {
        setShowJournalModal(true);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      
      // Handle rate limit (429)
      if (err.message?.includes('429') || err.message?.includes('rate limit')) {
        setError('Muitas requisições. Aguarde alguns segundos e recarregue a página.');
        toast.error('Limite de requisições atingido. Aguarde um momento.');
      } else {
        setError('Erro ao carregar dados. Verifique sua conexão.');
        toast.error('Erro ao carregar dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleToggleAction = async (actionId: string, done: boolean) => {
    if (journalBlocked && done) {
      toast.error('Preencha o diário de ontem antes de concluir ações');
      return;
    }

    try {
      setRefreshing(true);
      await updateActionDone(actionId, done);
      // Refresh actions and goals to update progress
      const [actionsData, goalsData] = await Promise.all([
        getDailyActions(),
        getPublicGoals()
      ]);
      setActions(actionsData);
      setGoals(goalsData);
      toast.success(done ? 'Ação concluída!' : 'Ação reaberta');
    } catch (err: any) {
      console.error('Error updating action:', err);
      const message = err.message || 'Erro ao atualizar ação';
      toast.error(message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJournalSubmit = async (journal: Partial<Journal>) => {
    try {
      await createJournalEntry(journal);
      setJournalBlocked(false);
      setShowJournalModal(false);
      toast.success('Diário salvo! Execução desbloqueada.');
      // Refresh data to update UI
      await loadData();
    } catch (err: any) {
      console.error('Error saving journal:', err);
      toast.error('Erro ao salvar diário');
      throw err;
    }
  };

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
      <div className="space-y-4 md:space-y-6 pb-6">
        {/* Header - Mobile First */}
        <div className="px-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Execução diária • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Journal Lock Alert */}
        {journalBlocked && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Execução bloqueada:</strong> Preencha o diário de ontem para continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards Grid - Mobile First */}
        {kpis.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum KPI configurado. Configure os KPIs na área administrativa.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {kpis.map((kpi) => {
              const goal = goals.find(g => g.KPI === kpi.id);
              return <KPICard key={kpi.id} kpi={kpi as NotionKPI} goal={goal as NotionGoal | undefined} />;
            })}
          </div>
        )}

        {/* Action Checklist */}
        <ActionChecklist 
          actions={actions}
          onToggle={handleToggleAction}
          journalBlocked={journalBlocked}
          refreshing={refreshing}
        />

        {/* Charts Section - Mobile First */}
        {kpis.length > 0 && (
          <Tabs defaultValue="anual" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="semanal" className="text-xs md:text-sm">Semanal</TabsTrigger>
              <TabsTrigger value="mensal" className="text-xs md:text-sm">Mensal</TabsTrigger>
              <TabsTrigger value="anual" className="text-xs md:text-sm">Anual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="semanal" className="space-y-4 mt-4 min-h-[200px]">
              {(() => {
                const weeklyKPIs = kpis.filter(k => 
                  k.Periodicity?.toLowerCase() === 'semanal' || 
                  k.Periodicity === 'Semanal'
                );
                
                if (weeklyKPIs.length === 0) {
                  return (
                    <Alert>
                      <AlertDescription>
                        Nenhum KPI semanal configurado.
                      </AlertDescription>
                    </Alert>
                  );
                }
                
                return weeklyKPIs.map((kpi) => {
                  const kpiGoals = goals.filter(g => g.KPI === kpi.id);
                  return (
                    <KPIChart 
                      key={kpi.id} 
                      kpi={kpi as NotionKPI} 
                      goals={kpiGoals as NotionGoal[]} 
                    />
                  );
                });
              })()}
            </TabsContent>
            
            <TabsContent value="mensal" className="space-y-4 mt-4 min-h-[200px]">
              {(() => {
                const monthlyKPIs = kpis.filter(k => 
                  k.Periodicity?.toLowerCase() === 'mensal' || 
                  k.Periodicity === 'Mensal'
                );
                
                if (monthlyKPIs.length === 0) {
                  return (
                    <Alert>
                      <AlertDescription>
                        Nenhum KPI mensal configurado.
                      </AlertDescription>
                    </Alert>
                  );
                }
                
                return monthlyKPIs.map((kpi) => {
                  const kpiGoals = goals.filter(g => g.KPI === kpi.id);
                  return (
                    <KPIChart 
                      key={kpi.id} 
                      kpi={kpi as NotionKPI} 
                      goals={kpiGoals as NotionGoal[]} 
                    />
                  );
                });
              })()}
            </TabsContent>
            
            <TabsContent value="anual" className="space-y-4 mt-4 min-h-[200px]">
              {(() => {
                const annualKPIs = kpis.filter(k => 
                  k.Periodicity?.toLowerCase() === 'anual' || 
                  k.Periodicity === 'Anual'
                );
                
                if (annualKPIs.length === 0) {
                  return (
                    <Alert>
                      <AlertDescription>
                        Nenhum KPI anual configurado.
                      </AlertDescription>
                    </Alert>
                  );
                }
                
                return annualKPIs.map((kpi) => {
                  const kpiGoals = goals.filter(g => g.KPI === kpi.id);
                  return (
                    <KPIChart 
                      key={kpi.id} 
                      kpi={kpi as NotionKPI} 
                      goals={kpiGoals as NotionGoal[]} 
                    />
                  );
                });
              })()}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Journal Modal - Obrigatório se bloqueado */}
      <JournalModal
        open={showJournalModal}
        onClose={journalBlocked ? undefined : () => setShowJournalModal(false)}
        onSubmit={handleJournalSubmit}
        date={yesterday}
        required={journalBlocked}
      />
    </AppLayout>
  );
}
