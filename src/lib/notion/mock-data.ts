// FR Tech OS - Mock Data for UI Development
// Used when Notion is not configured

import type { NotionKPI, NotionGoal, NotionAction, NotionJournal, NotionExpansionOpportunity, NotionCustomerWin } from './types';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const mockKPIs: NotionKPI[] = [
  {
    id: '1',
    Name: 'Cafés Realizados',
    Category: 'Rede',
    Periodicity: 'Semanal',
    ChartType: 'line',
    Unit: 'cafés',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 1,
    Active: true,
    Description: 'Quantidade de cafés de diagnóstico realizados'
  },
  {
    id: '2',
    Name: 'Ativações de Rede',
    Category: 'Rede',
    Periodicity: 'Semanal',
    ChartType: 'bar',
    Unit: 'ativações',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 2,
    Active: true,
    Description: 'Ativações de contatos na rede'
  },
  {
    id: '3',
    Name: 'Propostas de Crescimento',
    Category: 'Vendas',
    Periodicity: 'Mensal',
    ChartType: 'bar',
    Unit: 'propostas',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 3,
    Active: true,
    Description: 'Propostas enviadas a clientes'
  },
  {
    id: '4',
    Name: 'Processos Documentados',
    Category: 'Operações',
    Periodicity: 'Mensal',
    ChartType: 'area',
    Unit: 'processos',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 4,
    Active: true,
    Description: 'Processos internos documentados'
  },
  {
    id: '5',
    Name: 'Automações Criadas',
    Category: 'Tech',
    Periodicity: 'Mensal',
    ChartType: 'line',
    Unit: 'automações',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 5,
    Active: true,
    Description: 'Automações implementadas'
  },
  {
    id: '6',
    Name: 'Diários Preenchidos',
    Category: 'Reflexão',
    Periodicity: 'Diário',
    ChartType: 'number',
    Unit: 'dias',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 6,
    Active: true,
    Description: 'Dias com diário preenchido'
  }
];

export const mockGoals: NotionGoal[] = [
  {
    id: '1',
    Name: 'Meta Semanal Cafés',
    KPI: '1',
    Year: 2025,
    Month: 1,
    WeekKey: '2025-W01',
    PeriodStart: '2024-12-30',
    PeriodEnd: '2025-01-05',
    Target: 5,
    Actions: [],
    Actual: 3,
    ProgressPct: 60,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  },
  {
    id: '2',
    Name: 'Meta Semanal Ativações',
    KPI: '2',
    Year: 2025,
    Month: 1,
    WeekKey: '2025-W01',
    PeriodStart: '2024-12-30',
    PeriodEnd: '2025-01-05',
    Target: 10,
    Actions: [],
    Actual: 7,
    ProgressPct: 70,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  },
  {
    id: '3',
    Name: 'Meta Mensal Propostas',
    KPI: '3',
    Year: 2025,
    Month: 1,
    WeekKey: '',
    PeriodStart: '2025-01-01',
    PeriodEnd: '2025-01-31',
    Target: 8,
    Actions: [],
    Actual: 2,
    ProgressPct: 25,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  }
];

export const mockActions: NotionAction[] = [
  {
    id: '1',
    Name: 'Café com João Silva',
    Type: 'Café',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '1',
    Contact: 'João Silva',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Discussão sobre parceria'
  },
  {
    id: '2',
    Name: 'Ativação LinkedIn - Maria Santos',
    Type: 'Ativação de Rede',
    Date: today,
    Done: true,
    Contribution: 1,
    Earned: 0,
    Goal: '2',
    Contact: 'Maria Santos',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: ''
  },
  {
    id: '3',
    Name: 'Proposta Empresa ABC',
    Type: 'Proposta',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '3',
    Contact: '',
    Client: 'Empresa ABC',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Proposta de consultoria'
  },
  {
    id: '4',
    Name: 'Documentar processo de onboarding',
    Type: 'Processo',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '',
    Contact: '',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Ação sem meta - bloqueada'
  },
  {
    id: '5',
    Name: 'Criar automação de follow-up',
    Type: 'Automação',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '5',
    Contact: '',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: ''
  }
];

export const mockJournals: NotionJournal[] = [
  {
    id: '1',
    Name: `Diário ${yesterday}`,
    Date: yesterday,
    Filled: false,
    Summary: '',
    WhatWorked: '',
    WhatFailed: '',
    Insights: '',
    Objections: '',
    ProcessIdeas: '',
    Tags: [],
    RelatedContact: '',
    RelatedClient: '',
    Attachments: []
  }
];

export const mockExpansionOpportunities: NotionExpansionOpportunity[] = [
  {
    id: '1',
    Name: 'Upsell Automações - Cliente X',
    Client: 'Cliente X',
    Type: 'Upsell',
    Status: 'Em Negociação',
    Notes: 'Cliente interessado em expandir automações'
  },
  {
    id: '2',
    Name: 'Cross-sell Consultoria - Cliente Y',
    Client: 'Cliente Y',
    Type: 'Cross-sell',
    Status: 'Identificado',
    Notes: 'Oportunidade de consultoria estratégica'
  }
];

export const mockCustomerWins: NotionCustomerWin[] = [
  {
    id: '1',
    Name: 'Momento GOL - Cliente Z',
    Client: 'Cliente Z',
    Date: '2024-12-28',
    Description: 'Cliente atingiu meta de automação'
  }
];

// Check if yesterday's journal is filled
export function hasYesterdayJournal(): boolean {
  const yesterdayJournal = mockJournals.find(j => j.Date === yesterday);
  return yesterdayJournal?.Filled ?? false;
}

// Get today's actions
export function getTodayActions(): NotionAction[] {
  return mockActions.filter(a => a.Date === today);
}
