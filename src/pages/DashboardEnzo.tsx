import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { ActionChecklist } from '@/components/ActionChecklist';
import { ContactsToActivate } from '@/components/ContactsToActivate';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getEnzoKPIs, getEnzoGoals, getEnzoDailyActions, updateEnzoActionDone, getEnzoContacts, createEnzoContact, updateEnzoContact } from '@/services';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { Action } from '@/types/action';
import type { NotionKPI, NotionGoal, NotionAction } from '@/lib/notion/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
}

export default function DashboardEnzo() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Retry após 2 segundos se não houver KPIs
    const retryTimer = setTimeout(() => {
      if (kpis.length === 0 && !loading) {
        console.log('🔄 Retrying to load KPIs...');
        loadData();
      }
    }, 2000);
    return () => clearTimeout(retryTimer);
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
      getEnzoDailyActions(),
      loadContacts()
    ]);

    const kpisData = results[0].status === 'fulfilled' ? results[0].value : [];
    const goalsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const actionsData = results[2].status === 'fulfilled' ? results[2].value : [];
    const contactsData = results[3].status === 'fulfilled' ? results[3].value : [];

    console.log('📊 Loaded data:', {
      kpis: kpisData.length,
      goals: goalsData.length,
      actions: actionsData.length,
      contacts: contactsData.length
    });

    // Verificar erros específicos nos KPIs (mais crítico)
    if (results[0].status === 'rejected') {
      const kpiError = results[0].reason;
      console.error('❌ Error loading KPIs:', kpiError);
      
      const errorMsg = kpiError?.message || '';
      
      // Só mostrar erro se for problema de configuração, não de conexão (conexão retorna array vazio)
      if (errorMsg.includes('NOTION_DB_KPIS_ENZO') || errorMsg.includes('not configured')) {
        setError('Database de KPIs não configurada. Verifique NOTION_DB_KPIS_ENZO no .env.local da VPS.');
      } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
        setError('Muitas requisições. Aguarde alguns segundos e recarregue a página.');
      } else {
        // Para outros erros, não mostrar erro (serviço retorna array vazio)
        setError(null);
      }
    } else {
      // KPIs carregaram (mesmo que vazios), limpar erro
      setError(null);
      if (kpisData.length === 0) {
        console.warn('⚠️  No KPIs loaded. Check server logs and Notion database configuration.');
      }
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
    setContacts(contactsData);
    
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
    console.log('🔄 Manual refresh triggered');
    loadData();
  };

  async function loadContacts(): Promise<Contact[]> {
    try {
      const contactsData = await getEnzoContacts();
      return contactsData.map(c => ({
        id: c.id,
        name: c.Name,
        whatsapp: c.WhatsApp
      }));
    } catch (err: any) {
      // Se database não está configurada, retornar array vazio
      if (err.message?.includes('not configured')) {
        return [];
      }
      console.error('Error loading contacts:', err);
      return [];
    }
  }

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

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const notionUpdates: { name?: string; whatsapp?: string } = {};
      if (updates.name !== undefined) {
        notionUpdates.name = updates.name;
      }
      if (updates.whatsapp !== undefined) {
        notionUpdates.whatsapp = updates.whatsapp;
      }

      const updated = await updateEnzoContact(id, notionUpdates);
      
      setContacts(prev => prev.map(c => 
        c.id === id 
          ? { id: updated.id, name: updated.Name, whatsapp: updated.WhatsApp }
          : c
      ));
    } catch (err: any) {
      console.error('Error updating contact:', err);
      toast.error('Erro ao atualizar contato. Tente novamente.');
    }
  };

  const handleAddContact = async () => {
    if (contacts.length >= 20) return;
    try {
      const newContact = await createEnzoContact('');
      
      setContacts(prev => [...prev, {
        id: newContact.id,
        name: newContact.Name,
        whatsapp: newContact.WhatsApp
      }]);
    } catch (err: any) {
      console.error('Error creating contact:', err);
      toast.error('Erro ao adicionar contato. Tente novamente.');
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

        {/* KPIs no Topo - Sempre visível */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <h2 className="text-base md:text-xl font-bold text-foreground">Métricas e Metas</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Progresso semanal até 23/01/2026
            </p>
          </div>
          
          {/* Grid de KPIs - Input KPIs primeiro, Meta Semanal por último */}
          {kpis.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Input KPIs primeiro */}
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
              
              {/* Meta Semanal (output) - sempre por último */}
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
            </div>
          ) : (
            !loading && (
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
                      Carregando KPIs... Se não aparecerem, verifique se os KPIs estão ativos na database do Notion.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )
          )}
          <Separator className="my-3 md:my-6" />
        </div>

        {/* Ações do Dia (To-dos) - Sempre visível */}
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

        {/* Contatos para Ativar - Sempre visível */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <h2 className="text-base md:text-xl font-bold text-foreground">Contatos para Ativar</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Complete os dados até atingir 20 contatos
            </p>
          </div>
          <ContactsToActivate
            contacts={contacts}
            onUpdateContact={handleUpdateContact}
            onAddContact={handleAddContact}
          />
        </div>
      </div>
    </AppLayout>
  );
}

