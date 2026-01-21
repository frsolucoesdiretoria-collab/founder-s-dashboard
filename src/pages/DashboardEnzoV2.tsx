import { useState, useEffect } from 'react';
import { EnzoLayout } from '@/components/EnzoLayout';
import { KPICard } from '@/components/KPICard';
import { ActionChecklist } from '@/components/ActionChecklist';
import { ContactsToActivate } from '@/components/ContactsToActivate';
import { EnzoKanban } from '@/components/EnzoKanban';
import { MetasComerciaisAxis } from '@/components/MetasComerciaisAxis';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw, Info, User, Building, FileText, Phone, Sparkles, TrendingUp, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getEnzoKPIs, getEnzoGoals, getEnzoDailyActions, updateEnzoActionDone, getEnzoContacts, createEnzoContact, updateEnzoContact, deleteEnzoContact, createEnzoDiagnosticoV2 } from '@/services';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { Action } from '@/types/action';
import type { NotionKPI, NotionGoal, NotionAction } from '@/lib/notion/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
  status?: string;
  saleValue?: number;
}

// Dados mock para fallback quando Notion não está configurado
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

function DashboardEnzoV2Content() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Estados para identificação do cliente
  const [clientInfo, setClientInfo] = useState({
    nome: '',
    empresa: '',
    cnpj: '',
    whatsapp: ''
  });

  // Estados para o questionário de diagnóstico
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string | string[]>>({});
  const [diagnosticFreeText, setDiagnosticFreeText] = useState<Record<string, string>>({});
  const [showDiagnosticResult, setShowDiagnosticResult] = useState(false);
  const [isSubmittingDiagnostic, setIsSubmittingDiagnostic] = useState(false);
  
  // Tipo de questão
  interface DiagnosticQuestion {
    id: string;
    title: string;
    type: 'text' | 'select' | 'radio' | 'checkbox';
    options?: string[];
    allowFreeText?: boolean;
  }

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
      // Tentar carregar dados reais, mas com fallback automático
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

      // Se nenhum dado real foi carregado, usar dados mock
      if (kpisData.length === 0 && goalsData.length === 0 && actionsData.length === 0 && contactsData.length === 0) {
        console.log('📊 Usando dados mock - Notion não configurado');
        setUsingMockData(true);
        const sortedMockKpis = [...MOCK_KPIS].sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
        setKpis(sortedMockKpis);
        setGoals(MOCK_GOALS);
        setActions(MOCK_ACTIONS);
        setContacts(MOCK_CONTACTS);
      } else {
        // Usar dados reais, mas preencher vazios com mock se necessário
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
      console.error('❌ Erro ao carregar dados:', err);
      // Em caso de erro total, usar dados mock
      setUsingMockData(true);
      const sortedMockKpis = [...MOCK_KPIS].sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
      setKpis(sortedMockKpis);
      setGoals(MOCK_GOALS);
      setActions(MOCK_ACTIONS);
      setContacts(MOCK_CONTACTS);
      setError(null); // Não mostrar erro se temos dados mock
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
      console.warn('⚠️ Erro ao carregar contatos, usando mock:', err);
      return [];
    }
  }

  const handleUpdateContactStatus = async (id: string, status: string) => {
    // Se usando mock, apenas atualizar localmente
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
      console.error('Error updating contact status:', err);
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
    // Se usando mock, apenas atualizar localmente
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
      console.error('Error updating action:', err);
      toast.error(err.reason || err.message || 'Erro ao atualizar ação');
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    const previousContact = contacts.find(c => c.id === id);
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));

    // Se usando mock, apenas atualizar localmente
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
      console.error('Error updating contact:', err);
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

    // Se usando mock, apenas atualizar localmente
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
      console.error('Error deleting contact:', err);
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
    
    // Se usando mock, apenas adicionar localmente
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
      console.error('Error creating contact:', err);
      toast.error(`Erro ao adicionar contato: ${err?.message || 'Erro desconhecido'}`);
    }
  };

  // Separate KPIs: output (financial) vs inputs (non-financial)
  const outputKPI = kpis.find(kpi => kpi.IsFinancial === true);
  const inputKPIs = kpis.filter(kpi => kpi.IsFinancial === false);

  if (loading) {
    return (
      <EnzoLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </EnzoLayout>
    );
  }

  // Dados dos produtos (hardcoded)
  const produtos = [
    {
      nome: 'Base de Leads Qualificada',
      dor: 'Falta de oportunidades e previsibilidade de vendas',
      quem: 'Empresários dependentes de indicação',
      como: 'Scraping e organização de leads'
    },
    {
      nome: 'Organização do Funil Comercial',
      dor: 'Vendas desorganizadas',
      quem: 'Empresas sem CRM',
      como: 'Funil simples e acompanhamento'
    },
    {
      nome: 'Dashboard de Indicadores Essenciais',
      dor: 'Decisões no feeling',
      quem: 'Empresários sem KPIs',
      como: 'Dashboards simples'
    },
    {
      nome: 'Automação de Atendimento e Follow-up',
      dor: 'Perda de oportunidades',
      quem: 'Alto volume de mensagens',
      como: 'Automação básica'
    }
  ];

  // Perguntas do questionário com estrutura completa
  const diagnosticQuestions: DiagnosticQuestion[] = [
    {
      id: 'q1',
      title: 'Qual é o principal desafio do seu negócio hoje?',
      type: 'text',
      allowFreeText: true
    },
    {
      id: 'q2',
      title: 'Como você gerencia seus contatos e leads atualmente?',
      type: 'radio',
      options: ['CRM', 'Planilha', 'WhatsApp', 'Papel/Memória', 'Não controla']
    },
    {
      id: 'q3',
      title: 'Você tem visibilidade dos indicadores do seu negócio?',
      type: 'radio',
      options: ['Sim (dashboard)', 'Sim (manual)', 'Raramente', 'Não']
    },
    {
      id: 'q4',
      title: 'Qual é o volume médio de mensagens/contatos por dia?',
      type: 'select',
      options: ['0–10', '11–30', '31–80', '80+']
    },
    {
      id: 'q5',
      title: 'Como você organiza seu funil de vendas?',
      type: 'radio',
      options: ['Funil bem definido', 'Parcial', 'Cada venda é de um jeito', 'Não tenho funil']
    },
    {
      id: 'q6',
      title: 'Você já utiliza CRM ou sistema de gestão?',
      type: 'radio',
      options: ['Sim', 'Não', 'Estou escolhendo']
    },
    {
      id: 'q7',
      title: 'Quanto tempo você gasta com atividades repetitivas por semana?',
      type: 'select',
      options: ['0–2h', '3–5h', '6–10h', '10h+']
    },
    {
      id: 'q8',
      title: 'Você tem dificuldade em prever vendas?',
      type: 'radio',
      options: ['Sim', 'Mais ou menos', 'Não']
    },
    {
      id: 'q9',
      title: 'Onde você sente mais gargalo hoje?',
      type: 'checkbox',
      options: ['Captação de leads', 'Follow-up', 'Organização do funil', 'Indicadores', 'Atendimento demorado'],
      allowFreeText: true
    },
    {
      id: 'q10',
      title: 'Qual é o maior gargalo no processo de vendas?',
      type: 'text',
      allowFreeText: true
    }
  ];

  const handleDiagnosticAnswerChange = (questionId: string, value: string) => {
    setDiagnosticAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleDiagnosticCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setDiagnosticAnswers(prev => {
      const current = prev[questionId] as string[] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter(item => item !== option) };
      }
    });
  };

  const handleDiagnosticFreeTextChange = (questionId: string, value: string) => {
    setDiagnosticFreeText(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Agente de IA Local - Lógica de Recomendação
  interface ProductScore {
    id: number;
    nome: string;
    score: number;
    dor: string;
    como: string;
  }

  const calculateProductScores = (): ProductScore[] => {
    const answers = diagnosticAnswers;
    const q1 = (answers['q1'] as string) || '';
    const q2 = (answers['q2'] as string) || '';
    const q3 = (answers['q3'] as string) || '';
    const q4 = (answers['q4'] as string) || '';
    const q5 = (answers['q5'] as string) || '';
    const q8 = (answers['q8'] as string) || '';
    const q9 = (answers['q9'] as string[]) || [];
    const q10 = (answers['q10'] as string) || '';

    // Inicializar scores
    const scores: ProductScore[] = [
      { id: 1, nome: 'Base de Leads Qualificada', score: 0, dor: produtos[0].dor, como: produtos[0].como },
      { id: 2, nome: 'Organização do Funil Comercial', score: 0, dor: produtos[1].dor, como: produtos[1].como },
      { id: 3, nome: 'Dashboard de Indicadores Essenciais', score: 0, dor: produtos[2].dor, como: produtos[2].como },
      { id: 4, nome: 'Automação de Atendimento e Follow-up', score: 0, dor: produtos[3].dor, como: produtos[3].como }
    ];

    // P1 (Base de Leads) - Score
    if (q2 === 'Não controla' || q2 === 'WhatsApp' || q2 === 'Papel/Memória') {
      scores[0].score += 30;
    }
    if (q9.includes('Captação de leads')) {
      scores[0].score += 40;
    }
    if (q1.toLowerCase().includes('lead') || q1.toLowerCase().includes('cliente') || q1.toLowerCase().includes('venda')) {
      scores[0].score += 20;
    }

    // P2 (Funil Comercial) - Score
    if (q5 === 'Cada venda é de um jeito' || q5 === 'Não tenho funil') {
      scores[1].score += 40;
    }
    if (q2 !== 'CRM') {
      scores[1].score += 20;
    }
    if (q9.includes('Organização do funil')) {
      scores[1].score += 30;
    }

    // P3 (Dashboard Indicadores) - Score
    if (q3 === 'Raramente' || q3 === 'Não') {
      scores[2].score += 40;
    }
    if (q3 === 'Não') {
      scores[2].score += 30; // Extra para "Não"
    }
    if (q9.includes('Indicadores')) {
      scores[2].score += 20;
    }
    if (q8 === 'Sim' || q8 === 'Mais ou menos') {
      scores[2].score += 15;
    }

    // P4 (Automação) - Score
    if (q4 === '31–80' || q4 === '80+') {
      scores[3].score += 35;
    }
    if (q4 === '80+') {
      scores[3].score += 25; // Extra para volume alto
    }
    if (q9.includes('Atendimento demorado') || q9.includes('Follow-up')) {
      scores[3].score += 30;
    }

    // Regras duras (hard rules) - Forçar prioridade
    // Se Q2 = "Não controla" OU Q5 = "Não tenho funil" → garantir P2 no top 3
    if (q2 === 'Não controla' || q5 === 'Não tenho funil') {
      scores[1].score = Math.max(scores[1].score, 80); // Garantir pelo menos 80
    }

    // Se Q3 = "Não" → garantir P3 no top 3
    if (q3 === 'Não') {
      scores[2].score = Math.max(scores[2].score, 85); // Garantir pelo menos 85
    }

    // Se Q4 = "80+" → garantir P4 no top 3
    if (q4 === '80+') {
      scores[3].score = Math.max(scores[3].score, 85); // Garantir pelo menos 85
    }

    return scores;
  };

  const generateRecommendations = () => {
    const scores = calculateProductScores();
    
    // Ordenar por score descrescente
    scores.sort((a, b) => b.score - a.score);
    
    // Selecionar 1-3 produtos (mínimo 1, máximo 3, apenas se score > 20)
    const recommended = scores
      .filter(p => p.score > 20)
      .slice(0, 3);
    
    // Garantir pelo menos 1 produto
    if (recommended.length === 0) {
      return [scores[0]]; // Pegar o de maior score mesmo se for baixo
    }
    
    return recommended;
  };

  const generateExecutiveSummary = (recommended: ProductScore[]) => {
    const answers = diagnosticAnswers;
    const q1 = (answers['q1'] as string) || '';
    const q2 = (answers['q2'] as string) || '';
    const q3 = (answers['q3'] as string) || '';
    const q5 = (answers['q5'] as string) || '';
    const q9 = (answers['q9'] as string[]) || [];
    const q10 = (answers['q10'] as string) || '';

    // Situação atual
    let situacaoAtual = '';
    if (q2 === 'Não controla') {
      situacaoAtual = 'O negócio não possui controle estruturado sobre contatos e leads.';
    } else if (q2 === 'CRM') {
      situacaoAtual = 'O negócio já possui CRM, mas pode ter oportunidades de melhoria.';
    } else {
      situacaoAtual = 'O negócio gerencia contatos de forma básica (planilhas ou métodos manuais).';
    }

    // Maior gargalo
    let maiorGargalo = '';
    if (q9.length > 0) {
      const gargalos = q9.join(', ');
      maiorGargalo = `Os principais gargalos identificados são: ${gargalos}.`;
    } else if (q10) {
      maiorGargalo = q10.substring(0, 100) + (q10.length > 100 ? '...' : '');
    } else if (q5 === 'Não tenho funil' || q5 === 'Cada venda é de um jeito') {
      maiorGargalo = 'Falta de organização no funil de vendas e processo despadronizado.';
    } else if (q3 === 'Não' || q3 === 'Raramente') {
      maiorGargalo = 'Ausência de visibilidade sobre indicadores e métricas do negócio.';
    } else {
      maiorGargalo = 'Oportunidades de otimização em processos e automações.';
    }

    // Oportunidade mais rápida
    const topProduct = recommended[0];
    let oportunidade = '';
    if (topProduct.id === 1) {
      oportunidade = 'Implementar captação e organização de leads pode gerar impacto imediato no pipeline.';
    } else if (topProduct.id === 2) {
      oportunidade = 'Organizar o funil comercial permitirá melhor controle e previsibilidade de vendas.';
    } else if (topProduct.id === 3) {
      oportunidade = 'Ter visibilidade de indicadores é fundamental para decisões baseadas em dados.';
    } else {
      oportunidade = 'Automatizar atendimento e follow-up pode reduzir perda de oportunidades.';
    }

    return {
      situacaoAtual,
      maiorGargalo,
      oportunidade
    };
  };

  const determineNextStep = (recommended: ProductScore[]) => {
    const answers = diagnosticAnswers;
    const q1 = (answers['q1'] as string) || '';
    const q10 = (answers['q10'] as string) || '';
    const topScore = recommended[0]?.score || 0;
    
    const dorClara = (q1.trim().length > 20) || (q10.trim().length > 20);
    
    // Se (topScore >= 75) e as respostas indicam dor clara → "Conduzir o café para fechamento imediato"
    if (topScore >= 75 && dorClara) {
      return 'Conduzir o café para fechamento imediato';
    }
    
    // Senão se recomenda 2+ produtos → "Agendar reunião de proposta"
    if (recommended.length >= 2) {
      return 'Agendar reunião de proposta';
    }
    
    // Senão → "Apresentar demo"
    return 'Apresentar demo';
  };

  // Função para verificar se todos os campos estão preenchidos
  const isAllFieldsValid = (): boolean => {
    // Validar campos básicos
    if (!clientInfo.nome || !clientInfo.nome.trim()) return false;
    if (!clientInfo.empresa || !clientInfo.empresa.trim()) return false;
    if (!clientInfo.cnpj || !clientInfo.cnpj.trim()) return false;
    if (!clientInfo.whatsapp || !clientInfo.whatsapp.trim()) return false;

    // Validar TODAS as perguntas (q1 até q10) - todas obrigatórias
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
    
    for (const qId of questions) {
      const answer = diagnosticAnswers[qId];
      if (!answer) return false;
      if (Array.isArray(answer) && answer.length === 0) return false;
      if (typeof answer === 'string' && !answer.trim()) return false;
    }

    return true;
  };

  const handleFinalizeDiagnostic = async () => {
    // VALIDAÇÃO COMPLETA - TODOS OS CAMPOS OBRIGATÓRIOS
    const errors: string[] = [];

    // Validar campos básicos
    if (!clientInfo.nome || !clientInfo.nome.trim()) {
      errors.push('Nome do cliente é obrigatório');
    }
    if (!clientInfo.empresa || !clientInfo.empresa.trim()) {
      errors.push('Empresa é obrigatória');
    }
    if (!clientInfo.cnpj || !clientInfo.cnpj.trim()) {
      errors.push('CNPJ é obrigatório');
    }
    if (!clientInfo.whatsapp || !clientInfo.whatsapp.trim()) {
      errors.push('WhatsApp é obrigatório');
    }

    // Validar TODAS as perguntas (q1 até q10) - todas obrigatórias
    const questions = [
      { id: 'q1', label: 'Pergunta 1' },
      { id: 'q2', label: 'Pergunta 2' },
      { id: 'q3', label: 'Pergunta 3' },
      { id: 'q4', label: 'Pergunta 4' },
      { id: 'q5', label: 'Pergunta 5' },
      { id: 'q6', label: 'Pergunta 6' },
      { id: 'q7', label: 'Pergunta 7' },
      { id: 'q8', label: 'Pergunta 8' },
      { id: 'q9', label: 'Pergunta 9' },
      { id: 'q10', label: 'Pergunta 10' }
    ];

    questions.forEach(({ id, label }) => {
      const answer = diagnosticAnswers[id];
      if (!answer) {
        errors.push(`${label} é obrigatória`);
      } else if (Array.isArray(answer)) {
        if (answer.length === 0) {
          errors.push(`${label} é obrigatória`);
        }
      } else if (typeof answer === 'string' && !answer.trim()) {
        errors.push(`${label} é obrigatória`);
      }
    });

    // Se houver erros, mostrar e bloquear submit
    if (errors.length > 0) {
      toast.error(`Preencha todos os campos: ${errors.join(', ')}`);
      return;
    }

    // Show loading state
    setIsSubmittingDiagnostic(true);

    try {
      // Converter respostas para formato simples (string)
      // Arrays devem vir como string separada por vírgula
      const formatarResposta = (valor: any): string => {
        if (Array.isArray(valor)) {
          return valor.join(', ');
        }
        if (typeof valor === 'object' && valor !== null) {
          return JSON.stringify(valor);
        }
        return String(valor || '').trim();
      };

      // Prepare data for API - TODOS OS CAMPOS OBRIGATÓRIOS - valores simples apenas
      const diagnosticData = {
        nome: clientInfo.nome.trim(),
        empresa: clientInfo.empresa.trim(),
        cnpj: clientInfo.cnpj.trim(),
        whatsapp: clientInfo.whatsapp.trim(),
        pergunta_01: formatarResposta(diagnosticAnswers.q1 || ''),
        pergunta_02: formatarResposta(diagnosticAnswers.q2 || ''),
        pergunta_03: formatarResposta(diagnosticAnswers.q3 || ''),
        pergunta_04: formatarResposta(diagnosticAnswers.q4 || ''),
        pergunta_05: formatarResposta(diagnosticAnswers.q5 || ''),
        pergunta_06: formatarResposta(diagnosticAnswers.q6 || ''),
        pergunta_07: formatarResposta(diagnosticAnswers.q7 || ''),
        pergunta_08: formatarResposta(diagnosticAnswers.q8 || ''),
        pergunta_09: formatarResposta(diagnosticAnswers.q9 || ''),
        pergunta_10: formatarResposta(diagnosticAnswers.q10 || diagnosticFreeText.q10 || '')
      };

      // Save to Notion
      await createEnzoDiagnosticoV2(diagnosticData);
      
      // Show result
      setShowDiagnosticResult(true);
      toast.success('Diagnóstico salvo com sucesso no Notion!');
    } catch (error: any) {
      console.error('Error saving diagnostic:', error);
      toast.error(error.message || 'Erro ao salvar diagnóstico');
      // Still show result even if save failed
      setShowDiagnosticResult(true);
    } finally {
      setIsSubmittingDiagnostic(false);
    }
  };

  // Gerar resultado dinâmico baseado nas respostas
  const getDiagnosticResult = () => {
    const recommended = generateRecommendations();
    const summary = generateExecutiveSummary(recommended);
    const nextStep = determineNextStep(recommended);

    return {
      resumoExecutivo: {
        situacaoAtual: summary.situacaoAtual,
        maiorGargalo: summary.maiorGargalo,
        oportunidade: summary.oportunidade
      },
      produtosRecomendados: recommended.map(p => ({
        nome: p.nome,
        dor: p.dor,
        como: p.como
      })),
      proximoPasso: nextStep
    };
  };

  // Calcular resultado apenas quando necessário (quando showDiagnosticResult é true)
  const diagnosticResult = showDiagnosticResult ? getDiagnosticResult() : {
    resumoExecutivo: { situacaoAtual: '', maiorGargalo: '', oportunidade: '' },
    produtosRecomendados: [],
    proximoPasso: ''
  };

  return (
    <EnzoLayout>
      <div className="space-y-3 md:space-y-6 pb-4 md:pb-6 px-2 md:px-0">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Metas CORE - Experiência Visual Premium */}
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

        {/* CRM Kanban - Funil de Vendas */}
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

        {/* SEÇÃO DE DIAGNÓSTICO - BLOCO 1: IDENTIFICAÇÃO DO CLIENTE */}
        {!showDiagnosticResult && (
          <div className="space-y-8 md:space-y-12">
            {/* Executive Card - Identificação do Cliente */}
            <div className="relative">
              <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl transition-all duration-300 hover:shadow-[0_10px_40px_0_rgba(0,0,0,0.08)]">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                        Cliente em Diagnóstico
                      </h2>
                      <p className="text-sm md:text-base text-gray-500 font-light">
                        Essas informações vinculam o diagnóstico a um lead real
                      </p>
                    </div>

                    {/* Grid de Campos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nome do Cliente */}
                      <div className="space-y-2">
                        <Label htmlFor="client-nome" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Nome do Cliente
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="client-nome"
                            value={clientInfo.nome}
                            onChange={(e) => setClientInfo(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Nome completo"
                            className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Empresa */}
                      <div className="space-y-2">
                        <Label htmlFor="client-empresa" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Empresa
                        </Label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="client-empresa"
                            value={clientInfo.empresa}
                            onChange={(e) => setClientInfo(prev => ({ ...prev, empresa: e.target.value }))}
                            placeholder="Nome da empresa"
                            className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* CNPJ */}
                      <div className="space-y-2">
                        <Label htmlFor="client-cnpj" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          CNPJ
                        </Label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="client-cnpj"
                            value={clientInfo.cnpj}
                            onChange={(e) => setClientInfo(prev => ({ ...prev, cnpj: e.target.value }))}
                            placeholder="00.000.000/0000-00"
                            className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-2">
                        <Label htmlFor="client-whatsapp" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          WhatsApp
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="client-whatsapp"
                            value={clientInfo.whatsapp}
                            onChange={(e) => setClientInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                            placeholder="(00) 00000-0000"
                            className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8 md:my-12" />

        {/* BLOCO A - Tabela de Produtos */}
        <div className="space-y-3 md:space-y-4">
          <Card className="overflow-hidden border-[rgba(0,0,0,0.04)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] bg-white rounded-2xl transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-xl font-semibold text-gray-900 tracking-tight">Produtos de Tecnologia Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                      <TableHead className="w-[200px] text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Produto</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Dor</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Quem</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Como</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto, index) => (
                      <TableRow 
                        key={index}
                        className="border-b border-gray-50 hover:bg-[rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer group"
                      >
                        <TableCell className="font-medium text-gray-900 py-4 text-sm group-hover:text-gray-700 transition-colors">
                          {produto.nome}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 py-4 font-medium">
                          {produto.dor}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 py-4">
                          {produto.quem}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 py-4">
                          {produto.como}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* BLOCO 2: DIAGNÓSTICO GUIADO - Wizard Premium */}
            <div className="relative">
              <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl transition-all duration-300">
                <CardContent className="p-8 md:p-12">
                  {/* Header do Wizard */}
                  <div className="space-y-4 mb-10">
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                        Diagnóstico Guiado
                      </h2>
                      <p className="text-sm md:text-base text-gray-500 font-light">
                        Uma conversa inteligente para entender suas necessidades
                      </p>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="relative">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(Object.keys(diagnosticAnswers).filter(k => diagnosticAnswers[k] && (Array.isArray(diagnosticAnswers[k]) ? (diagnosticAnswers[k] as string[]).length > 0 : true)).length / diagnosticQuestions.length) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                        <span>
                          Pergunta {Object.keys(diagnosticAnswers).filter(k => diagnosticAnswers[k] && (Array.isArray(diagnosticAnswers[k]) ? (diagnosticAnswers[k] as string[]).length > 0 : true)).length || 0} de {diagnosticQuestions.length}
                        </span>
                        <span>{Math.round((Object.keys(diagnosticAnswers).filter(k => diagnosticAnswers[k] && (Array.isArray(diagnosticAnswers[k]) ? (diagnosticAnswers[k] as string[]).length > 0 : true)).length / diagnosticQuestions.length) * 100)}% completo</span>
                      </div>
                    </div>
                  </div>

                  {/* Perguntas Sequenciais */}
                  <div className="space-y-6">
                    {diagnosticQuestions.map((question, index) => (
                      <Card 
                        key={question.id}
                        className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] overflow-hidden"
                      >
                        <CardContent className="p-6 md:p-8">
                          <div className="space-y-6">
                            {/* Cabeçalho da Pergunta */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <Label 
                                  htmlFor={`question-${question.id}`} 
                                  className="text-lg md:text-xl font-semibold text-gray-900 leading-tight"
                                >
                                  {question.title}
                                </Label>
                              </div>
                            </div>
                    
                            {/* Renderização baseada no tipo */}
                            {question.type === 'text' && (
                              <div className="space-y-4">
                                <Input
                                  id={`question-${question.id}`}
                                  value={(diagnosticAnswers[question.id] as string) || ''}
                                  onChange={(e) => handleDiagnosticAnswerChange(question.id, e.target.value)}
                                  placeholder="Digite sua resposta..."
                                  className="w-full h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                                />
                                {question.allowFreeText && (
                                  <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <Label htmlFor={`freetext-${question.id}`} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Observações Adicionais
                                    </Label>
                                    <Textarea
                                      id={`freetext-${question.id}`}
                                      value={diagnosticFreeText[question.id] || ''}
                                      onChange={(e) => handleDiagnosticFreeTextChange(question.id, e.target.value)}
                                      placeholder="Adicione informações complementares..."
                                      className="w-full min-h-[100px] rounded-xl border-gray-200 bg-gray-50 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white resize-none placeholder:text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {question.type === 'select' && question.options && (
                              <Select
                                value={(diagnosticAnswers[question.id] as string) || ''}
                                onValueChange={(value) => handleDiagnosticAnswerChange(question.id, value)}
                              >
                                <SelectTrigger 
                                  id={`question-${question.id}`} 
                                  className="w-full h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
                                >
                                  <SelectValue placeholder="Selecione uma opção..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                                  {question.options.map((option) => (
                                    <SelectItem key={option} value={option} className="text-base rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors cursor-pointer">
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {question.type === 'radio' && question.options && (
                              <RadioGroup
                                value={(diagnosticAnswers[question.id] as string) || ''}
                                onValueChange={(value) => handleDiagnosticAnswerChange(question.id, value)}
                                className="space-y-2"
                              >
                                {question.options.map((option) => (
                                  <div 
                                    key={option} 
                                    className="flex items-center space-x-4 group cursor-pointer p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                                  >
                                    <RadioGroupItem 
                                      value={option} 
                                      id={`${question.id}-${option}`}
                                      className="border-gray-300 transition-all duration-200 group-hover:border-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 w-5 h-5"
                                    />
                                    <Label
                                      htmlFor={`${question.id}-${option}`}
                                      className="text-base font-normal text-gray-700 cursor-pointer flex-1 transition-colors group-hover:text-gray-900"
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {question.type === 'checkbox' && question.options && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  {question.options.map((option) => {
                                    const checked = ((diagnosticAnswers[question.id] as string[]) || []).includes(option);
                                    return (
                                      <div 
                                        key={option} 
                                        className={`flex items-center space-x-4 group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                                          checked 
                                            ? 'border-blue-300 bg-blue-50/50' 
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                        }`}
                                      >
                                        <Checkbox
                                          id={`${question.id}-${option}`}
                                          checked={checked}
                                          onCheckedChange={(checked) =>
                                            handleDiagnosticCheckboxChange(question.id, option, checked as boolean)
                                          }
                                          className="border-gray-300 transition-all duration-200 group-hover:border-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 w-5 h-5"
                                        />
                                        <Label
                                          htmlFor={`${question.id}-${option}`}
                                          className="text-base font-normal text-gray-700 cursor-pointer flex-1 transition-colors group-hover:text-gray-900"
                                        >
                                          {option}
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                                {question.allowFreeText && (
                                  <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <Label htmlFor={`freetext-${question.id}`} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Observações Adicionais
                                    </Label>
                                    <Textarea
                                      id={`freetext-${question.id}`}
                                      value={diagnosticFreeText[question.id] || ''}
                                      onChange={(e) => handleDiagnosticFreeTextChange(question.id, e.target.value)}
                                      placeholder="Adicione informações complementares..."
                                      className="w-full min-h-[100px] rounded-xl border-gray-200 bg-gray-50 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white resize-none placeholder:text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Botão Finalizar */}
                  <div className="pt-8 mt-8 border-t border-gray-100">
                    <Button 
                      onClick={handleFinalizeDiagnostic}
                      disabled={isSubmittingDiagnostic || !isAllFieldsValid()}
                      className="w-full md:w-auto h-14 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isSubmittingDiagnostic ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Salvar Diagnóstico
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

            {/* BLOCO 3: RESULTADO DO DIAGNÓSTICO - Insight View */}
            {showDiagnosticResult && diagnosticResult.produtosRecomendados.length > 0 && (
              <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="overflow-hidden border-0 shadow-[0_10px_50px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.1)] bg-white rounded-3xl transition-all duration-300">
                  <CardContent className="p-8 md:p-12">
                    {/* Header com Ícone */}
                    <div className="flex items-start justify-between mb-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                            Análise Estratégica
                          </h2>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-light ml-[60px]">
                          Leitura consultiva baseada nas respostas do diagnóstico
                        </p>
                      </div>
                    </div>

                    {/* Seção 1: Leitura do Cenário Atual */}
                    <div className="mb-10 space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                          Leitura do Cenário Atual
                        </h3>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Insight 1: Situação Atual */}
                        <div className="space-y-3 p-6 bg-gradient-to-br from-blue-50/50 to-gray-50/30 rounded-2xl border border-blue-100/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Situação Atual</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-light">
                            {diagnosticResult.resumoExecutivo.situacaoAtual}
                          </p>
                        </div>

                        {/* Insight 2: Maior Gargalo */}
                        <div className="space-y-3 p-6 bg-gradient-to-br from-orange-50/50 to-gray-50/30 rounded-2xl border border-orange-100/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Maior Gargalo</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-light">
                            {diagnosticResult.resumoExecutivo.maiorGargalo}
                          </p>
                        </div>

                        {/* Insight 3: Oportunidade */}
                        <div className="space-y-3 p-6 bg-gradient-to-br from-green-50/50 to-gray-50/30 rounded-2xl border border-green-100/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Oportunidade Rápida</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-light">
                            {diagnosticResult.resumoExecutivo.oportunidade}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Seção 2: Oportunidades Prioritárias */}
                    <div className="mb-10 space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                          Oportunidades Prioritárias
                        </h3>
                      </div>
                      
                      <div className="grid gap-4">
                        {diagnosticResult.produtosRecomendados.map((produto, index) => (
                          <Card 
                            key={index}
                            className={`border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_10px_30px_0_rgba(0,0,0,0.12)] overflow-hidden ${
                              index === 0 ? 'ring-2 ring-blue-500/20 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <CardContent className="p-6 md:p-8">
                              <div className="flex items-start justify-between gap-6">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-3">
                                    {index === 0 && (
                                      <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                                        Recomendação Principal
                                      </span>
                                    )}
                                    <h4 className="text-lg font-semibold text-gray-900 tracking-tight">
                                      {produto.nome}
                                    </h4>
                                  </div>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex gap-2">
                                      <span className="font-medium text-gray-700 min-w-[60px]">Dor:</span>
                                      <span className="text-gray-600">{produto.dor}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="font-medium text-gray-700 min-w-[60px]">Como:</span>
                                      <span className="text-gray-600">{produto.como}</span>
                                    </div>
                                  </div>
                                </div>
                                {index === 0 && (
                                  <div className="flex-shrink-0">
                                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Seção 3: Próximo Passo Recomendado */}
                    <div className="mb-8">
                      <div className="relative p-8 md:p-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl shadow-2xl border border-blue-600/20 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                          }}></div>
                        </div>
                        
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center gap-3">
                            <ArrowRight className="h-6 w-6 text-white/90" />
                            <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                              Próximo Passo Recomendado
                            </h3>
                          </div>
                          <p className="text-lg md:text-xl font-semibold text-white/95 leading-relaxed max-w-3xl">
                            {diagnosticResult.proximoPasso}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão Novo Diagnóstico */}
                    <div className="flex justify-center pt-4 border-t border-gray-100">
                      <Button 
                        onClick={() => {
                          setShowDiagnosticResult(false);
                          setDiagnosticAnswers({});
                          setDiagnosticFreeText({});
                          setClientInfo({ nome: '', empresa: '', cnpj: '', whatsapp: '' });
                        }}
                        variant="outline"
                        className="h-12 px-8 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-300/50 font-medium"
                      >
                        Iniciar Novo Diagnóstico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
      </div>
    </EnzoLayout>
  );
}

export default function DashboardEnzoV2() {
  return (
    <ErrorBoundary>
      <DashboardEnzoV2Content />
    </ErrorBoundary>
  );
}
