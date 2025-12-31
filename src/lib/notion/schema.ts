// FR Tech OS - Notion Schema Mapping
// Maps database IDs to their property schemas

export const NotionSchema = {
  KPIs: {
    properties: [
      'Name', 'Category', 'Periodicity', 'ChartType', 'Unit',
      'VisiblePublic', 'VisibleAdmin', 'IsFinancial', 'SortOrder', 'Active', 'Description'
    ],
    required: ['Name', 'Category', 'Periodicity', 'VisiblePublic', 'Active', 'IsFinancial']
  },
  Goals: {
    properties: [
      'Name', 'KPI', 'Year', 'Month', 'WeekKey', 'PeriodStart', 'PeriodEnd',
      'Target', 'Actions', 'Actual', 'ProgressPct', 'VisiblePublic', 'VisibleAdmin', 'Notes'
    ],
    required: ['Name', 'KPI', 'Target']
  },
  Actions: {
    properties: [
      'Name', 'Type', 'Date', 'Done', 'Contribution', 'Earned', 'Goal',
      'Contact', 'Client', 'Proposal', 'Diagnostic', 'WeekKey', 'Month', 'PublicVisible', 'Notes'
    ],
    required: ['Name', 'Type', 'Date']
  },
  Journal: {
    properties: [
      'Name', 'Date', 'Filled', 'Summary', 'WhatWorked', 'WhatFailed',
      'Insights', 'Objections', 'ProcessIdeas', 'Tags', 'RelatedContact', 'RelatedClient', 'Attachments'
    ],
    required: ['Name', 'Date', 'Filled']
  },
  Contacts: {
    properties: ['Name'],
    required: ['Name']
  },
  Clients: {
    properties: ['Name'],
    required: ['Name']
  },
  GrowthProposals: {
    properties: ['Name'],
    required: ['Name']
  },
  CoffeeDiagnostics: {
    properties: ['Name', 'Date', 'Contact', 'Notes', 'NextSteps'],
    required: ['Name', 'Date']
  },
  ExpansionOpportunities: {
    properties: ['Name', 'Client', 'Type', 'Status', 'Notes'],
    required: ['Name', 'Client']
  },
  CustomerWins: {
    properties: ['Name', 'Client', 'Date', 'Description'],
    required: ['Name', 'Client', 'Date']
  },
  // Phase 2
  Partners: {
    properties: ['Name', 'Email', 'Status'],
    required: ['Name', 'Email']
  },
  Referrals: {
    properties: ['Name', 'Partner', 'Client', 'Status'],
    required: ['Name', 'Partner']
  },
  CommissionLedger: {
    properties: ['Name', 'Partner', 'Amount', 'Status'],
    required: ['Name', 'Partner', 'Amount']
  },
  PartnerNudges: {
    properties: ['Name', 'Partner', 'Message', 'SentAt'],
    required: ['Name', 'Partner', 'Message']
  }
} as const;

export type NotionDatabaseName = keyof typeof NotionSchema;

export const ENV_VAR_MAPPING: Record<NotionDatabaseName, string> = {
  KPIs: 'NOTION_DB_KPIS',
  Goals: 'NOTION_DB_GOALS',
  Actions: 'NOTION_DB_ACTIONS',
  Journal: 'NOTION_DB_JOURNAL',
  Contacts: 'NOTION_DB_CONTACTS',
  Clients: 'NOTION_DB_CLIENTS',
  GrowthProposals: 'NOTION_DB_GROWTHPROPOSALS',
  CoffeeDiagnostics: 'NOTION_DB_COFFEEDIAGNOSTICS',
  ExpansionOpportunities: 'NOTION_DB_EXPANSIONOPPORTUNITIES',
  CustomerWins: 'NOTION_DB_CUSTOMERWINS',
  Partners: 'NOTION_DB_PARTNERS',
  Referrals: 'NOTION_DB_REFERRALS',
  CommissionLedger: 'NOTION_DB_COMMISSIONLEDGER',
  PartnerNudges: 'NOTION_DB_PARTNERNUDGES'
};
