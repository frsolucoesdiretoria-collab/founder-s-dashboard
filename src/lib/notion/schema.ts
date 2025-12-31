// FR Tech OS - Notion Schema Definition
// EXACT property names from Notion - DO NOT RENAME

export interface DatabaseSchema {
  name: string;
  envVar: string;
  required: boolean;
  properties: PropertySchema[];
}

export interface PropertySchema {
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'relation' | 'rollup' | 'formula';
  required: boolean;
  description?: string;
}

/**
 * Schema definition for all Notion databases
 * Properties must match EXACTLY the Notion database structure
 */
export const NOTION_SCHEMA: Record<string, DatabaseSchema> = {
  KPIs: {
    name: 'KPIs',
    envVar: 'NOTION_DB_KPIS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do KPI' },
      { name: 'Category', type: 'select', required: true, description: 'Categoria do KPI' },
      { name: 'Periodicity', type: 'select', required: true, description: 'Periodicidade: Anual, Mensal, Semanal, Diário' },
      { name: 'ChartType', type: 'select', required: true, description: 'Tipo de gráfico: line, bar, area, number' },
      { name: 'Unit', type: 'rich_text', required: false, description: 'Unidade de medida' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'IsFinancial', type: 'checkbox', required: true, description: 'Indica se é KPI financeiro (R$)' },
      { name: 'SortOrder', type: 'number', required: true, description: 'Ordem de exibição' },
      { name: 'Active', type: 'checkbox', required: true, description: 'KPI ativo' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição do KPI' }
    ]
  },
  Goals: {
    name: 'Goals',
    envVar: 'NOTION_DB_GOALS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da meta' },
      { name: 'KPI', type: 'relation', required: true, description: 'Relacionamento com KPI' },
      { name: 'Year', type: 'number', required: true, description: 'Ano da meta' },
      { name: 'Month', type: 'number', required: false, description: 'Mês da meta (1-12)' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana (YYYY-WW)' },
      { name: 'PeriodStart', type: 'date', required: true, description: 'Início do período' },
      { name: 'PeriodEnd', type: 'date', required: true, description: 'Fim do período' },
      { name: 'Target', type: 'number', required: true, description: 'Valor alvo' },
      { name: 'Actions', type: 'relation', required: false, description: 'Ações relacionadas' },
      { name: 'Actual', type: 'number', required: false, description: 'Valor atual' },
      { name: 'ProgressPct', type: 'formula', required: false, description: 'Percentual de progresso' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Actions: {
    name: 'Actions',
    envVar: 'NOTION_DB_ACTIONS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da ação' },
      { name: 'Type', type: 'select', required: true, description: 'Tipo: Café, Ativação de Rede, Proposta, Processo, Rotina, Automação, Agente, Diário' },
      { name: 'Date', type: 'date', required: true, description: 'Data da ação' },
      { name: 'Done', type: 'checkbox', required: true, description: 'Ação concluída' },
      { name: 'Contribution', type: 'number', required: false, description: 'Contribuição para a meta' },
      { name: 'Earned', type: 'number', required: false, description: 'Valor ganho (financeiro)' },
      { name: 'Goal', type: 'relation', required: false, description: 'Meta relacionada (OBRIGATÓRIO para concluir)' },
      { name: 'Contact', type: 'relation', required: false, description: 'Contato relacionado' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente relacionado' },
      { name: 'Proposal', type: 'relation', required: false, description: 'Proposta relacionada' },
      { name: 'Diagnostic', type: 'relation', required: false, description: 'Diagnóstico relacionado' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana' },
      { name: 'Month', type: 'number', required: false, description: 'Mês (1-12)' },
      { name: 'PublicVisible', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Journal: {
    name: 'Journal',
    envVar: 'NOTION_DB_JOURNAL',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do diário' },
      { name: 'Date', type: 'date', required: true, description: 'Data do diário' },
      { name: 'Filled', type: 'checkbox', required: true, description: 'Diário preenchido (LOCK se false para ontem)' },
      { name: 'Summary', type: 'rich_text', required: false, description: 'Resumo do dia' },
      { name: 'WhatWorked', type: 'rich_text', required: false, description: 'O que funcionou' },
      { name: 'WhatFailed', type: 'rich_text', required: false, description: 'O que falhou' },
      { name: 'Insights', type: 'rich_text', required: false, description: 'Insights' },
      { name: 'Objections', type: 'rich_text', required: false, description: 'Objeções' },
      { name: 'ProcessIdeas', type: 'rich_text', required: false, description: 'Ideias de processo' },
      { name: 'Tags', type: 'multi_select', required: false, description: 'Tags' },
      { name: 'RelatedContact', type: 'relation', required: false, description: 'Contato relacionado' },
      { name: 'RelatedClient', type: 'relation', required: false, description: 'Cliente relacionado' },
      { name: 'Attachments', type: 'relation', required: false, description: 'Anexos' }
    ]
  },
  Contacts: {
    name: 'Contacts',
    envVar: 'NOTION_DB_CONTACTS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do contato' }
    ]
  },
  Clients: {
    name: 'Clients',
    envVar: 'NOTION_DB_CLIENTS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do cliente' }
    ]
  },
  GrowthProposals: {
    name: 'GrowthProposals',
    envVar: 'NOTION_DB_GROWTHPROPOSALS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da proposta' }
    ]
  },
  CoffeeDiagnostics: {
    name: 'CoffeeDiagnostics',
    envVar: 'NOTION_DB_COFFEEDIAGNOSTICS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do diagnóstico' },
      { name: 'Date', type: 'date', required: true, description: 'Data' },
      { name: 'Contact', type: 'relation', required: true, description: 'Contato (obrigatório)' },
      { name: 'Segment', type: 'rich_text', required: false, description: 'Segmento' },
      { name: 'TeamSize', type: 'number', required: false, description: 'Tamanho do time' },
      { name: 'Channels', type: 'multi_select', required: false, description: 'Canais' },
      { name: 'WhatsAppPrimary', type: 'checkbox', required: false, description: 'WhatsApp como canal primário' },
      { name: 'ResponseSpeed', type: 'select', required: false, description: 'Velocidade de resposta' },
      { name: 'MainPain', type: 'rich_text', required: false, description: 'Principal dor' },
      { name: 'Symptoms', type: 'rich_text', required: false, description: 'Sintomas' },
      { name: 'FunnelLeak', type: 'rich_text', required: false, description: 'Vazamento no funil' },
      { name: 'Goal30', type: 'rich_text', required: false, description: 'Objetivo 30 dias' },
      { name: 'Goal60', type: 'rich_text', required: false, description: 'Objetivo 60 dias' },
      { name: 'Goal90', type: 'rich_text', required: false, description: 'Objetivo 90 dias' },
      { name: 'ScopeLockAccepted', type: 'checkbox', required: true, description: 'Escopo travado aceito (obrigatório)' },
      { name: 'AdditivesPolicyAccepted', type: 'checkbox', required: true, description: 'Política de aditivos aceita (obrigatório)' },
      { name: 'NextStepAgreed', type: 'rich_text', required: false, description: 'Próximo passo acordado' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' },
      { name: 'NextSteps', type: 'rich_text', required: false, description: 'Próximos passos' }
    ]
  },
  ExpansionOpportunities: {
    name: 'ExpansionOpportunities',
    envVar: 'NOTION_DB_EXPANSIONOPPORTUNITIES',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da oportunidade' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente' },
      { name: 'Type', type: 'select', required: false, description: 'Tipo' },
      { name: 'Status', type: 'select', required: false, description: 'Status' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' }
    ]
  },
  CustomerWins: {
    name: 'CustomerWins',
    envVar: 'NOTION_DB_CUSTOMERWINS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da vitória' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente' },
      { name: 'Date', type: 'date', required: true, description: 'Data' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição' }
    ]
  },
  FinanceMetrics: {
    name: 'FinanceMetrics',
    envVar: 'NOTION_DB_FINANCEMETRICS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da métrica financeira' }
    ]
  }
};

/**
 * Get database ID from environment variable
 */
export function getDatabaseId(dbName: string): string | null {
  const schema = NOTION_SCHEMA[dbName];
  if (!schema) return null;
  return process.env[schema.envVar] || null;
}

/**
 * Get all required database IDs
 */
export function getRequiredDatabaseIds(): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const [name, schema] of Object.entries(NOTION_SCHEMA)) {
    if (schema.required) {
      result[name] = getDatabaseId(name);
    }
  }
  return result;
}

/**
 * Validate that a database schema property exists
 */
export function validateProperty(
  dbName: string,
  propertyName: string,
  propertyType?: string
): { valid: boolean; message?: string } {
  const schema = NOTION_SCHEMA[dbName];
  if (!schema) {
    return { valid: false, message: `Database ${dbName} not found in schema` };
  }

  const property = schema.properties.find(p => p.name === propertyName);
  if (!property) {
    return { valid: false, message: `Property ${propertyName} not found in ${dbName} schema` };
  }

  if (propertyType && property.type !== propertyType) {
    return { 
      valid: false, 
      message: `Property ${propertyName} type mismatch: expected ${property.type}, got ${propertyType}` 
    };
  }

  return { valid: true };
}

