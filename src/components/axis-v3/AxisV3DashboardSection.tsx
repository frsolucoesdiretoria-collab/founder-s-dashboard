// AXIS V3 — Seção Dashboard Compartilhada (KPIs, Ações, Contatos, Kanban)

import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { ActionChecklist } from '@/components/ActionChecklist';
import { ContactsToActivate } from '@/components/ContactsToActivate';
import { EnzoKanban } from '@/components/EnzoKanban';
import { MetasComerciaisAxis } from '@/components/MetasComerciaisAxis';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw, Info } from 'lucide-react';
import { getEnzoKPIs, getEnzoGoals, getEnzoDailyActions, updateEnzoActionDone, getEnzoContacts, createEnzoContact, updateEnzoContact, deleteEnzoContact } from '@/services';
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
  status?: string;
  saleValue?: number;
}

// Dados mock para fallback
const MOCK_KPIS: KPI[] = [
  {
    id: 'mock-kpi-1',
    Name: 'Contatos Ativados',
    TargetValue: 20,
    SortOrder: 1,
    IsFinancial: false,
    Periodicity: 'Semanal',
    Active: true
  },
  {
    id: 'mock-kpi-2',
    Name: 'Oportunidades Identificadas',
    TargetValue: 10,
    SortOrder: 2,
    IsFinancial: false,
    Periodicity: 'Semanal',
    Active: true
  },
  {
    id: 'mock-kpi-3',
    Name: 'Reuniões Agendadas',
    TargetValue: 5,
    SortOrder: 3,
    IsFinancial: false,
    Periodicity: 'Semanal',
    Active: true
  },
  {
    id: 'mock-kpi-4',
    Name: 'Meta Semanal de Vendas',
    TargetValue: 20000,
    SortOrder: 4,
    IsFinancial: true,
    Periodicity: 'Semanal',
    Active: true
  }
];

const MOCK_GOALS: Goal[] = [
  {
    id: 'mock-goal-1',
    Name: 'Meta Semanal - Contatos Ativados',
    KPI: 'mock-kpi-1',
    Target: 20,
    Actual: 0,
    WeekKey: '',
    Year: 2026,
    Month: 1
  },
  {
    id: 'mock-goal-2',
    Name: 'Meta Semanal - Oportunidades',
    KPI: 'mock-kpi-2',
    Target: 10,
    Actual: 0,
    WeekKey: '',
    Year: 2026,
    Month: 1
  },
  {
    id: 'mock-goal-3',
    Name: 'Meta Semanal - Reuniões',
    KPI: 'mock-kpi-3',
    Target: 5,
    Actual: 0,
    WeekKey: '',
    Year: 2026,
    Month: 1
  },
  {
    id: 'mock-goal-4',
    Name: 'Meta Semanal - Vendas',
    KPI: 'mock-kpi-4',
    Target: 20000,
    Actual: 0,
    WeekKey: '',
    Year: 2026,
    Month: 1
  }
];

const MOCK_ACTIONS: Action[] = [
  {
    id: 'mock-action-1',
    Name: 'Identificar 10 novos contatos',
    Done: false,
    Date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'mock-action-2',
    Name: 'Fazer follow-up com oportunidades abertas',
    Done: false,
    Date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'mock-action-3',
    Name: 'Agendar 2 reuniões comerciais',
    Done: false,
    Date: new Date().toISOString().split('T')[0]
  }
];

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'mock-contact-1',
    name: 'Contato Exemplo 1',
    whatsapp: '(11) 98765-4321',
    status: 'Contato Ativado',
    saleValue: undefined
  },
  {
    id: 'mock-contact-2',
    name: 'Contato Exemplo 2',
    whatsapp: '(11) 91234-5678',
    status: 'Oportunidade Identificada',
    saleValue: undefined
  }
];

export const AxisV3DashboardSection = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    setUsingMockData(false);
    
    try {
      const results = await Promise.allSettled([
        getEnzoKPIs().catch(() => []),
        getEnzoGoals().catch(() => []),
        getEnzoDailyActions().catch(() => []),
        loadContacts().catch(() => [])
      ]);

      const kpisData = results[0].status === 'fulfilled' ? results[0].value : [];
      const goalsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const actionsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const contactsData = results[3].status === 'fulfilled' ? results[3].value : [];

      if (kpisData.length === 0 && goalsData.length === 0 && actionsData.length === 0 && contactsData.length === 0) {
        setUsingMockData(true);
        const sortedMockKpis = [...MOCK_KPIS].sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
        setKpis(sortedMockKpis);
        setGoals(MOCK_GOALS);
        setActions(MOCK_ACTIONS);
        setContacts(MOCK_CONTACTS);
      } else {
        const finalKpis = kpisData.length > 0 ? kpisData : MOCK_KPIS;
        const finalGoals = goalsData.length > 0 ? goalsData : MOCK_GOALS;
        const finalActions = actionsData.length > 0 ? actionsData : MOCK_ACTIONS;
        const finalContacts = contactsData.length > 0 ? contactsData : MOCK_CONTACTS;
        
        if (kpisData.length === 0) setUsingMockData(true);
        
        const sortedKpis = finalKpis.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
        setKpis(sortedKpis);
        setGoals(finalGoals);
        setActions(finalActions);
        setContacts(finalContacts);
      }

      if (refreshing && kpisData.length > 0) {
        toast.success('Dados atualizados');
      }
    } catch (err: any) {
      setUsingMockData(true);
      const sortedMockKpis = [...MOCK_KPIS].sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
      setKpis(sortedMockKpis);
      setGoals(MOCK_GOALS);
      setActions(MOCK_ACTIONS);
      setContacts(MOCK_CONTACTS);
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  async function loadContacts(): Promise<Contact[]> {
    try {
      const contactsData = await getEnzoContacts();
      return contactsData.map(c => {
        let status = c.Status || 'Contato Ativado';
        if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
          status = 'Contato Ativado';
        }
        return {
          id: c.id,
          name: c.Name,
          whatsapp: c.WhatsApp,
          status: status,
          saleValue: (c as any).ValorVenda || undefined
        };
      });
    } catch (err: any) {
      return [];
    }
  }

  const handleUpdateContactStatus = async (id: string, status: string) => {
    if (usingMockData) {
      setContacts(prev => prev.map(c => 
        c.id === id ? { ...c, status } : c
      ));
      toast.success(`Contato movido para "${status}"`);
      return;
    }

    try {
      setContacts(prev => prev.map(c => 
        c.id === id ? { ...c, status } : c
      ));

      const updated = await updateEnzoContact(id, { status });
      
      setContacts(prev => prev.map(c => 
        c.id === id 
          ? { 
              id: updated.id, 
              name: updated.Name, 
              whatsapp: updated.WhatsApp, 
              status: updated.Status || status,
              saleValue: (updated as any).ValorVenda || undefined
            }
          : c
      ));

      const [updatedGoals, updatedKpis] = await Promise.all([
        getEnzoGoals().catch(() => []),
        getEnzoKPIs().catch(() => [])
      ]);
      
      if (updatedGoals.length > 0) setGoals(updatedGoals);
      if (updatedKpis.length > 0) {
        setKpis(updatedKpis.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0)));
      }
      
      toast.success(`Contato movido para "${status}" - Métricas atualizadas`);
    } catch (err: any) {
      const contact = contacts.find(c => c.id === id);
      if (contact) {
        setContacts(prev => prev.map(c => 
          c.id === id ? contact : c
        ));
      }
      toast.error(`Erro ao atualizar status: ${err?.message || 'Erro desconhecido'}`);
    }
  };

  const handleToggleAction = async (actionId: string, done: boolean) => {
    if (usingMockData) {
      setActions(prev => prev.map(a => 
        a.id === actionId ? { ...a, Done: done } : a
      ));
      toast.success(done ? 'Ação concluída!' : 'Ação reaberta');
      return;
    }

    try {
      await updateEnzoActionDone(actionId, done);
      const [updatedActions, updatedGoals] = await Promise.all([
        getEnzoDailyActions().catch(() => []),
        getEnzoGoals().catch(() => [])
      ]);
      if (updatedActions.length > 0) setActions(updatedActions);
      if (updatedGoals.length > 0) setGoals(updatedGoals);
      toast.success(done ? 'Ação concluída!' : 'Ação reaberta');
    } catch (err: any) {
      toast.error(err.reason || err.message || 'Erro ao atualizar ação');
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    const previousContact = contacts.find(c => c.id === id);
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));

    if (usingMockData) {
      if (updates.saleValue !== undefined) {
        toast.success('Valor de venda salvo!');
      } else {
        toast.success('Contato atualizado!');
      }
      return;
    }

    try {
      const notionUpdates: { name?: string; whatsapp?: string; saleValue?: number | null } = {};
      if (updates.name !== undefined) notionUpdates.name = updates.name;
      if (updates.whatsapp !== undefined) notionUpdates.whatsapp = updates.whatsapp;
      if (updates.saleValue !== undefined) notionUpdates.saleValue = updates.saleValue ?? null;

      const updated = await updateEnzoContact(id, notionUpdates);
      
      const updatedSaleValue = (updated as any).ValorVenda;
      
      setContacts(prev => prev.map(c => 
        c.id === id 
          ? { 
              id: updated.id, 
              name: updated.Name, 
              whatsapp: updated.WhatsApp, 
              status: updated.Status || 'Contato Ativado',
              saleValue: updatedSaleValue !== undefined && updatedSaleValue !== null ? updatedSaleValue : undefined
            }
          : c
      ));

      const [updatedGoals, updatedKpis] = await Promise.all([
        getEnzoGoals().catch(() => []),
        getEnzoKPIs().catch(() => [])
      ]);
      
      if (updatedGoals.length > 0) setGoals(updatedGoals);
      if (updatedKpis.length > 0) {
        setKpis(updatedKpis.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0)));
      }
      
      if (updates.saleValue !== undefined) {
        toast.success(`Valor de venda salvo! Meta Semanal atualizada.`);
      }
    } catch (err: any) {
      if (previousContact) {
        setContacts(prev => prev.map(c => 
          c.id === id ? previousContact : c
        ));
      }
      toast.error('Erro ao atualizar contato. Tente novamente.');
    }
  };

  const handleUpdateContactSaleValue = async (id: string, saleValue: number | null) => {
    await handleUpdateContact(id, { saleValue });
  };

  const handleDeleteContact = async (id: string) => {
    const contactToDelete = contacts.find(c => c.id === id);
    const contactName = contactToDelete?.name || 'Contato';
    
    setContacts(prev => prev.filter(c => c.id !== id));

    if (usingMockData) {
      toast.success(`Contato "${contactName}" excluído`);
      return;
    }

    try {
      await deleteEnzoContact(id);
      toast.success(`Contato "${contactName}" excluído com sucesso`);
      
      const [updatedGoals, updatedKpis] = await Promise.all([
        getEnzoGoals().catch(() => []),
        getEnzoKPIs().catch(() => [])
      ]);
      
      if (updatedGoals.length > 0) setGoals(updatedGoals);
      if (updatedKpis.length > 0) {
        setKpis(updatedKpis.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0)));
      }
    } catch (err: any) {
      const updatedContacts = await loadContacts().catch(() => []);
      setContacts(updatedContacts.length > 0 ? updatedContacts : MOCK_CONTACTS);
      toast.error(`Erro ao excluir contato: ${err?.message || 'Erro desconhecido'}`);
    }
  };

  const handleAddContact = async () => {
    if (contacts.length >= 20) {
      toast.error('Limite de 20 contatos atingido');
      return;
    }
    
    if (usingMockData) {
      const newContact: Contact = {
        id: `mock-contact-${Date.now()}`,
        name: '',
        whatsapp: '',
        status: 'Contato Ativado'
      };
      setContacts(prev => [...prev, newContact]);
      toast.success('Contato adicionado com sucesso');
      return;
    }

    try {
      const newContact = await createEnzoContact('');
      setContacts(prev => [...prev, {
        id: newContact.id,
        name: newContact.Name || '',
        whatsapp: newContact.WhatsApp || '',
        status: newContact.Status || 'Contato Ativado'
      }]);
      toast.success('Contato adicionado com sucesso');
    } catch (err: any) {
      toast.error(`Erro ao adicionar contato: ${err?.message || 'Erro desconhecido'}`);
    }
  };

  const outputKPI = kpis.find(kpi => kpi.IsFinancial === true);
  const inputKPIs = kpis.filter(kpi => kpi.IsFinancial === false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6 pb-4 md:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="flex-1 min-w-0">
          <MetasComerciaisAxis />
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={loading || refreshing}
          className="w-full md:w-auto md:flex-shrink-0 h-9 self-start"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin mr-2' : 'mr-2'}`} />
          <span className="text-xs md:text-sm">Atualizar</span>
        </Button>
      </div>

      {/* Aviso de dados mock */}
      {usingMockData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs md:text-sm">
            Dashboard funcionando com dados de exemplo. Configure o Notion para usar dados reais.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="space-y-3 md:space-y-4">
        <div>
          <h2 className="text-base md:text-xl font-bold text-foreground">Métricas e Metas</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Progresso semanal até 23/01/2026
          </p>
        </div>
        
        {kpis.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
            
            {outputKPI && (() => {
              const outputGoal = goals.find(g => g.KPI === outputKPI.id);
              return (
                <Card key={outputKPI.id} className="border-2 border-primary/50 overflow-hidden">
                  <CardContent className="pt-4 md:pt-6">
                    <KPICard 
                      kpi={outputKPI as NotionKPI}
                      goal={outputGoal as NotionGoal | undefined}
                    />
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              Carregando métricas...
            </AlertDescription>
          </Alert>
        )}
        <Separator className="my-3 md:my-6" />
      </div>

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

      {/* Contatos para Ativar */}
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

      {/* CRM Kanban */}
      <div className="space-y-3 md:space-y-4">
        <Separator className="my-3 md:my-6" />
        <EnzoKanban
          contacts={contacts}
          onUpdateContactStatus={handleUpdateContactStatus}
          onUpdateContactSaleValue={handleUpdateContactSaleValue}
          onDeleteContact={handleDeleteContact}
        />
      </div>

      <Separator className="my-8 md:my-12" />
    </div>
  );
};

