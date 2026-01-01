// FR Tech OS - Notion Schema Types
// EXACT property names from Notion - DO NOT RENAME

export interface NotionKPI {
  id: string;
  Name: string;
  Category: string;
  Periodicity: 'Anual' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Semanal' | 'Diário';
  ChartType: 'line' | 'bar' | 'area' | 'number';
  Unit: string;
  TargetValue: number;
  VisiblePublic: boolean;
  VisibleAdmin: boolean;
  IsFinancial: boolean;
  SortOrder: number;
  Active: boolean;
  Description: string;
}

export interface NotionGoal {
  id: string;
  Name: string;
  KPI: string;
  Year: number;
  Month: number;
  WeekKey: string;
  PeriodStart: string;
  PeriodEnd: string;
  Target: number;
  Actions: string[];
  Actual: number;
  ProgressPct: number;
  VisiblePublic: boolean;
  VisibleAdmin: boolean;
  Notes: string;
}

export interface NotionAction {
  id: string;
  Name: string;
  Type: 'Café' | 'Ativação de Rede' | 'Proposta' | 'Processo' | 'Rotina' | 'Automação' | 'Agente' | 'Diário';
  Date: string;
  Done: boolean;
  Contribution: number;
  Earned: number;
  Goal: string;
  Contact: string;
  Client: string;
  Proposal: string;
  Diagnostic: string;
  WeekKey: string;
  Month: number;
  PublicVisible: boolean;
  Notes: string;
}

export interface NotionJournal {
  id: string;
  Name: string;
  Date: string;
  Filled: boolean;
  Summary: string;
  WhatWorked: string;
  WhatFailed: string;
  Insights: string;
  Objections: string;
  ProcessIdeas: string;
  Tags: string[];
  RelatedContact: string;
  RelatedClient: string;
  Attachments: string[];
}

export interface NotionContact {
  id: string;
  Name: string;
  Company?: string;
  Status?: string;
  Segment?: string;
  City?: string;
  WhatsApp?: string;
  Source?: string;
  Priority?: string;
  Notes?: string;
}

export interface NotionClient {
  id: string;
  Name: string;
}

export interface NotionGrowthProposal {
  id: string;
  Name: string;
}

export interface NotionCoffeeDiagnostic {
  id: string;
  Name: string;
  Date: string;
  Contact: string;
  Notes: string;
  NextSteps: string;
}

export interface NotionExpansionOpportunity {
  id: string;
  Name: string;
  Client: string;
  Type: string;
  Status: string;
  Notes: string;
}

export interface NotionCustomerWin {
  id: string;
  Name: string;
  Client: string;
  Date: string;
  Description: string;
}

export interface NotionCRMPipeline {
  id: string;
  Name: string;
  Company: string;
  Status: 'Contato Ativado' | 'Café Agendado' | 'Café Executado' | 'Proposta Enviada' | 'Follow-up Ativo' | 'Venda Fechada' | 'Perdido';
  CoffeeDate: string;
  ProposalDate: string;
  LastUpdate: string;
  Notes: string;
}

export interface NotionProduto {
  id: string;
  Name: string;
  Status: 'Ativo' | 'Ideia' | 'Pausado' | 'Morto';
  ProblemaQueResolve: string;
  PrecoMinimo: number;
  PrecoIdeal: number;
  Tipo: string;
  TempoMedioEntrega: number;
  DependenciaFundador: 'Alta' | 'Média' | 'Baixa';
  Replicabilidade: 'Alta' | 'Média' | 'Baixa';
  PrioridadeEstrategica: number;
}

// Phase 2 types (feature flag)
export interface NotionPartner {
  id: string;
  Name: string;
  Email: string;
  Status: string;
}

export interface NotionReferral {
  id: string;
  Name: string;
  Partner: string;
  Client: string;
  Status: string;
}

export interface NotionCommissionLedger {
  id: string;
  Name: string;
  Partner: string;
  Amount: number;
  Status: string;
}

export interface NotionPartnerNudge {
  id: string;
  Name: string;
  Partner: string;
  Message: string;
  SentAt: string;
}

// Environment variables schema
export interface NotionEnvVars {
  NOTION_TOKEN: string;
  NOTION_DB_KPIS: string;
  NOTION_DB_GOALS: string;
  NOTION_DB_ACTIONS: string;
  NOTION_DB_CONTACTS: string;
  NOTION_DB_CLIENTS: string;
  NOTION_DB_GROWTHPROPOSALS: string;
  NOTION_DB_COFFEEDIAGNOSTICS: string;
  NOTION_DB_JOURNAL: string;
  NOTION_DB_EXPANSIONOPPORTUNITIES: string;
  NOTION_DB_CUSTOMERWINS: string;
  NOTION_DB_FINANCEMETRICS: string;
  NOTION_DB_CRMPIPELINE?: string;
  NOTION_DB_PRODUTOS?: string;
  // Phase 2
  NOTION_DB_PARTNERS?: string;
  NOTION_DB_REFERRALS?: string;
  NOTION_DB_COMMISSIONLEDGER?: string;
  NOTION_DB_PARTNERNUDGES?: string;
  ADMIN_PASSCODE?: string;
  PARTNER_FEATURE_FLAG?: string;
}

// Health check result
export interface HealthCheckResult {
  status: 'ok' | 'warning' | 'error';
  timestamp: string;
  checks: {
    name: string;
    status: 'ok' | 'warning' | 'error';
    message: string;
  }[];
}

// Self-test result
export interface SelfTestResult {
  passed: boolean;
  timestamp: string;
  tests: {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
  }[];
}
