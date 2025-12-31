import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { KPIChart } from '@/components/KPIChart';
import { ActionChecklist } from '@/components/ActionChecklist';
import { JournalModal } from '@/components/JournalModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [journalBlocked, setJournalBlocked] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisData, goalsData, actionsData, journalStatus] = await Promise.all([
          getPublicKPIs(),
          getPublicGoals(),
          getDailyActions(),
          checkYesterdayJournal()
        ]);

        setKpis(kpisData);
        setGoals(goalsData);
        setActions(actionsData);
        
        // Check if yesterday's journal is not filled
        if (journalStatus.exists && !journalStatus.filled) {
          setJournalBlocked(true);
          setShowJournalModal(true);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggleAction = async (actionId: string, done: boolean) => {
    await updateActionDone(actionId, done);
    // Refresh actions
    const actionsData = await getDailyActions();
    setActions(actionsData);
  };

  const handleJournalSubmit = async (journal: Partial<Journal>) => {
    await createJournalEntry(journal);
    setJournalBlocked(false);
    setShowJournalModal(false);
  };

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Execução diária • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kpis.map((kpi) => {
            const goal = goals.find(g => g.KPI === kpi.id);
            return <KPICard key={kpi.id} kpi={kpi} goal={goal} />;
          })}
        </div>

        {/* Action Checklist */}
        <ActionChecklist 
          actions={actions}
          onToggle={handleToggleAction}
          journalBlocked={journalBlocked}
        />

        {/* Charts Section */}
        <Tabs defaultValue="semanal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semanal">Semanal</TabsTrigger>
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="anual">Anual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="semanal" className="space-y-4 mt-4">
            {kpis.filter(k => k.Periodicity === 'Semanal').map((kpi) => (
              <KPIChart key={kpi.id} kpi={kpi} goals={goals} />
            ))}
          </TabsContent>
          
          <TabsContent value="mensal" className="space-y-4 mt-4">
            {kpis.filter(k => k.Periodicity === 'Mensal').map((kpi) => (
              <KPIChart key={kpi.id} kpi={kpi} goals={goals} />
            ))}
          </TabsContent>
          
          <TabsContent value="anual" className="space-y-4 mt-4">
            {kpis.filter(k => k.Periodicity === 'Anual').map((kpi) => (
              <KPIChart key={kpi.id} kpi={kpi} goals={goals} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Journal Modal */}
      <JournalModal
        open={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        onSubmit={handleJournalSubmit}
        date={yesterday}
      />
    </AppLayout>
  );
}
