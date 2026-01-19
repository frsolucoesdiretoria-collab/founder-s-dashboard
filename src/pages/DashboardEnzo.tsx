import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { KPIChart } from '@/components/KPIChart';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  }, []);

  async function loadData() {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    
    // Carregar dados de forma independente para não falhar tudo se uma parte falhar
    let kpisError: any = null;
    let goalsError: any = null;
    let actionsError: any = null;
    
    const results = await Promise.allSettled([
      getEnzoKPIs().catch(err => {
        console.error('Error loading KPIs:', err);
        kpisError = err;
        throw err; // Re-throw para que Promise.allSettled capture como rejected
      }),
      getEnzoGoals().catch(err => {
        console.error('Error loading Goals:', err);
        goalsError = err;
        throw err;
      }),
      getEnzoDailyActions().catch(err => {
        console.error('Error loading Actions:', err);
        actionsError = err;
        throw err;
      }),
      loadContacts() // Já trata erros internamente
    ]);

    const kpisData = results[0].status === 'fulfilled' ? results[0].value : [];
    const goalsData = results[1].status === 'fulfilled' ? results[1].value : [];
    const actionsData = results[2].status === 'fulfilled' ? results[2].value : [];
    const contactsData = results[3].status === 'fulfilled' ? results[3].value : [];

    // Verificar erros específicos nos KPIs (mais crítico)
    if (kpisData.length === 0) {
      const kpiResult = results[0];
      const error = kpiResult.status === 'rejected' ? kpiResult.reason : kpisError;
      
      if (error) {
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          setError('Muitas requisições. Aguarde alguns segundos e recarregue a página.');
        } else if (error.message?.includes('NOTION_DB_KPIS_ENZO') || error.message?.includes('not configured')) {
          setError('Database de KPIs não configurada. Verifique NOTION_DB_KPIS_ENZO no .env.local da VPS.');
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('conectar ao servidor')) {
          setError('Não foi possível conectar ao servidor. Verifique se o servidor está rodando na VPS.');
        } else {
          setError(`Erro ao carregar KPIs: ${error.message || 'Erro desconhecido'}`);
        }
      } else {
        // KPIs carregaram mas estão vazios (não é erro, apenas não há dados)
        setError(null);
      }
    } else {
      // KPIs carregaram com sucesso, limpar erro
      setError(null);
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

  async function loadContacts(): Promise<Contact[]> {
    try {
      const contactsData = await getEnzoContacts();
      // Convert from API format (Name) to component format (name)
      const convertedContacts: Contact[] = contactsData.map(c => ({
        id: c.id,
        name: c.Name,
        whatsapp: c.WhatsApp
      }));
      setContacts(convertedContacts);
      return convertedContacts;
    } catch (err: any) {
      console.error('Error loading contacts:', err);
      // If contacts DB is not configured, return empty array (don't fail entire load)
      if (err.message?.includes('NOTION_DB_CONTACTS_ENZO') || err.message?.includes('not configured')) {
        console.warn('Contacts database not configured, using empty list');
        return [];
      }
      // For other errors, also return empty array to not break the dashboard
      return [];
    }
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

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      // Update in Notion
      const notionUpdates: { name?: string; whatsapp?: string } = {};
      if (updates.name !== undefined) {
        notionUpdates.name = updates.name;
      }
      if (updates.whatsapp !== undefined) {
        notionUpdates.whatsapp = updates.whatsapp;
      }

      const updated = await updateEnzoContact(id, notionUpdates);
      
      // Update local state
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
      
      // Update local state
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

        {/* Ações do Dia */}
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

