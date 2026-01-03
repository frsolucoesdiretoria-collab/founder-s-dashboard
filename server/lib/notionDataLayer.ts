// FR Tech OS - Notion Data Layer
// Server-side only - handles all Notion API interactions

import { Client } from '@notionhq/client';
import { NOTION_SCHEMA, getDatabaseId } from '../../src/lib/notion/schema';
import type { 
  NotionKPI, 
  NotionGoal, 
  NotionAction, 
  NotionJournal,
  NotionCRMPipeline,
  NotionProduto,
  NotionContact,
  NotionBudgetGoal,
  NotionTransaction,
  NotionAccount,
  NotionAccountPayable,
  NotionAccountReceivable,
  NotionCategorizationRule
} from '../../src/lib/notion/types';

// Notion client instance (lazy initialization)
let notionClient: Client | null = null;

/**
 * Assert that an environment variable exists
 */
export function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Initialize Notion client
 */
export function initNotionClient(): Client {
  if (notionClient) {
    return notionClient;
  }

  const token = assertEnv('NOTION_TOKEN');
  notionClient = new Client({ auth: token });
  return notionClient;
}

/**
 * Retry helper with exponential backoff for rate limits
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Extract text from Notion rich text or title
 */
function extractText(property: any): string {
  if (!property) return '';
  if (property.type === 'title' || property.type === 'rich_text') {
    return property[property.type]?.map((item: any) => item.plain_text || '').join('') || '';
  }
  return String(property[property.type] || '');
}

/**
 * Extract number from Notion property
 */
function extractNumber(property: any): number {
  if (!property) return 0;
  return property.number || 0;
}

/**
 * Extract boolean from Notion property
 */
function extractBoolean(property: any): boolean {
  if (!property) return false;
  return property.checkbox || false;
}

/**
 * Extract date from Notion property
 */
function extractDate(property: any): string {
  if (!property || !property.date) return '';
  return property.date.start || '';
}

/**
 * Normalize date to YYYY-MM-DD format (without timezone)
 * Ensures dates are sent to Notion without timezone issues
 */
function normalizeDate(dateString: string | undefined | null): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // If it's a date string with time, extract just the date part
  // This prevents timezone issues
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract select from Notion property
 */
function extractSelect(property: any): string {
  if (!property || !property.select) return '';
  return property.select.name || '';
}

/**
 * Extract multi-select from Notion property
 */
function extractMultiSelect(property: any): string[] {
  if (!property || !property.multi_select) return [];
  return property.multi_select.map((item: any) => item.name || '');
}

/**
 * Extract relation IDs from Notion property
 */
function extractRelation(property: any): string[] {
  if (!property || !property.relation) return [];
  return property.relation.map((item: any) => item.id || '');
}

/**
 * Extract phone number from Notion property
 */
function extractPhoneNumber(property: any): string {
  if (!property || !property.phone_number) return '';
  return property.phone_number || '';
}

/**
 * Convert Notion page to KPI
 */
function pageToKPI(page: any): NotionKPI {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    Category: extractSelect(props.Category),
    Periodicity: extractSelect(props.Periodicity) as any,
    ChartType: extractSelect(props.ChartType) as any,
    Unit: extractText(props.Unit),
    TargetValue: extractNumber(props.TargetValue),
    VisiblePublic: extractBoolean(props.VisiblePublic),
    VisibleAdmin: extractBoolean(props.VisibleAdmin),
    IsFinancial: extractBoolean(props.IsFinancial),
    SortOrder: extractNumber(props.SortOrder),
    Active: extractBoolean(props.Active),
    Description: extractText(props.Description)
  };
}

/**
 * Convert Notion page to Goal
 */
function pageToGoal(page: any): NotionGoal {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    KPI: extractRelation(props.KPI)[0] || '',
    Year: extractNumber(props.Year),
    Month: extractNumber(props.Month),
    WeekKey: extractText(props.WeekKey),
    PeriodStart: extractDate(props.PeriodStart),
    PeriodEnd: extractDate(props.PeriodEnd),
    Target: extractNumber(props.Target),
    Actions: extractRelation(props.Actions),
    Actual: extractNumber(props.Actual),
    ProgressPct: extractNumber(props.ProgressPct),
    VisiblePublic: extractBoolean(props.VisiblePublic),
    VisibleAdmin: extractBoolean(props.VisibleAdmin),
    Notes: extractText(props.Notes)
  };
}

/**
 * Convert Notion page to Action
 */
function pageToAction(page: any): NotionAction {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    Type: extractSelect(props.Type) as any,
    Date: extractDate(props.Date),
    Done: extractBoolean(props.Done),
    Contribution: extractNumber(props.Contribution),
    Earned: extractNumber(props.Earned),
    Goal: extractRelation(props.Goal)[0] || '',
    Contact: extractRelation(props.Contact)[0] || '',
    Client: extractRelation(props.Client)[0] || '',
    Proposal: extractRelation(props.Proposal)[0] || '',
    Diagnostic: extractRelation(props.Diagnostic)[0] || '',
    WeekKey: extractText(props.WeekKey),
    Month: extractNumber(props.Month),
    Priority: (extractSelect(props.Priority) as 'Alta' | 'Média' | 'Baixa') || undefined,
    PublicVisible: extractBoolean(props.PublicVisible),
    Notes: extractText(props.Notes)
  };
}

/**
 * Convert Notion page to Journal
 */
function pageToJournal(page: any): NotionJournal {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    Date: extractDate(props.Date),
    Filled: extractBoolean(props.Filled),
    Summary: extractText(props.Summary),
    WhatWorked: extractText(props.WhatWorked),
    WhatFailed: extractText(props.WhatFailed),
    Insights: extractText(props.Insights),
    Objections: extractText(props.Objections),
    ProcessIdeas: extractText(props.ProcessIdeas),
    Tags: extractMultiSelect(props.Tags),
    RelatedContact: extractRelation(props.RelatedContact)[0] || '',
    RelatedClient: extractRelation(props.RelatedClient)[0] || '',
    Attachments: extractRelation(props.Attachments)
  };
}

/**
 * Convert Notion page to CRMPipeline
 */
function pageToCRMPipeline(page: any): NotionCRMPipeline {
  const props = page.properties;
  // Use LastUpdate if available, otherwise use last_edited_time from page
  const lastUpdate = extractDate(props.LastUpdate) || 
    (page.last_edited_time ? new Date(page.last_edited_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  
  return {
    id: page.id,
    Name: extractText(props.Name),
    Company: extractText(props.Company) || '',
    Status: (extractSelect(props.Status) as any) || 'Contato Ativado',
    CoffeeDate: extractDate(props.CoffeeDate) || '',
    ProposalDate: extractDate(props.ProposalDate) || '',
    LastUpdate: lastUpdate,
    Notes: extractText(props.Notes) || ''
  };
}

/**
 * Convert Notion page to Contact
 */
function pageToContact(page: any): NotionContact {
  const props = page.properties;
  
  return {
    id: page.id,
    Name: extractText(props.Name),
    Company: extractText(props.Company) || undefined,
    Status: extractSelect(props.Status) || undefined,
    Segment: extractSelect(props.Segment) || undefined,
    City: extractSelect(props.City) || undefined,
    WhatsApp: extractPhoneNumber(props.WhatsApp) || undefined,
    Source: extractSelect(props.Source) || undefined,
    Priority: extractSelect(props.Priority) || undefined,
    Notes: extractText(props.Notes) || undefined
  };
}

/**
 * Convert Notion page to Produto
 */
function pageToProduto(page: any): NotionProduto {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    Status: (extractSelect(props.Status) as any) || 'Ideia',
    ProblemaQueResolve: extractText(props.ProblemaQueResolve),
    PrecoMinimo: extractNumber(props.PrecoMinimo),
    PrecoIdeal: extractNumber(props.PrecoIdeal),
    Tipo: extractSelect(props.Tipo) || '',
    TempoMedioEntrega: extractNumber(props.TempoMedioEntrega),
    DependenciaFundador: (extractSelect(props.DependenciaFundador) as any) || 'Média',
    Replicabilidade: (extractSelect(props.Replicabilidade) as any) || 'Média',
    PrioridadeEstrategica: extractNumber(props.PrioridadeEstrategica)
  };
}

/**
 * Get public KPIs (non-financial, active, visible)
 */
export async function getKPIsPublic(): Promise<NotionKPI[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: 'Active', checkbox: { equals: true } },
          { property: 'VisiblePublic', checkbox: { equals: true } },
          { property: 'IsFinancial', checkbox: { equals: false } }
        ]
      },
      sorts: [{ property: 'SortOrder', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToKPI);
}

/**
 * Get all KPIs (admin only - includes financial)
 */
export async function getKPIsAdmin(): Promise<NotionKPI[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: { property: 'Active', checkbox: { equals: true } },
      sorts: [{ property: 'SortOrder', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToKPI);
}

/**
 * Get all KPIs including inactive ones
 */
export async function getAllKPIsIncludingInactive(): Promise<NotionKPI[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ property: 'SortOrder', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToKPI);
}

/**
 * Find KPI by name (fuzzy match)
 */
export async function findKPIByName(namePattern: string): Promise<NotionKPI | null> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');

  // Get all KPIs and search by name
  const allKPIs = await getAllKPIsIncludingInactive();
  
  // Try exact match first
  let found = allKPIs.find(kpi => 
    kpi.Name.toLowerCase() === namePattern.toLowerCase()
  );
  
  // Try fuzzy match (contains)
  if (!found) {
    found = allKPIs.find(kpi => 
      kpi.Name.toLowerCase().includes(namePattern.toLowerCase()) ||
      namePattern.toLowerCase().includes(kpi.Name.toLowerCase())
    );
  }
  
  return found || null;
}

/**
 * Update KPI properties
 */
export async function updateKPI(
  kpiId: string,
  updates: Partial<{
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
  }>
): Promise<NotionKPI> {
  const client = initNotionClient();
  const properties: any = {};

  if (updates.Name !== undefined) {
    properties.Name = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Periodicity !== undefined) {
    properties.Periodicity = { select: { name: updates.Periodicity } };
  }
  if (updates.ChartType !== undefined) {
    properties.ChartType = { select: { name: updates.ChartType } };
  }
  if (updates.Unit !== undefined) {
    properties.Unit = { rich_text: [{ text: { content: updates.Unit } }] };
  }
  if (updates.TargetValue !== undefined) {
    properties.TargetValue = { number: updates.TargetValue };
  }
  if (updates.VisiblePublic !== undefined) {
    properties.VisiblePublic = { checkbox: updates.VisiblePublic };
  }
  if (updates.VisibleAdmin !== undefined) {
    properties.VisibleAdmin = { checkbox: updates.VisibleAdmin };
  }
  if (updates.IsFinancial !== undefined) {
    properties.IsFinancial = { checkbox: updates.IsFinancial };
  }
  if (updates.SortOrder !== undefined) {
    properties.SortOrder = { number: updates.SortOrder };
  }
  if (updates.Active !== undefined) {
    properties.Active = { checkbox: updates.Active };
  }
  if (updates.Description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: updates.Description } }] };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: kpiId,
      properties
    })
  );

  return pageToKPI(updated);
}

/**
 * Create a new KPI
 */
export async function createKPI(kpi: {
  Name: string;
  Category: string;
  Periodicity: 'Anual' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Semanal' | 'Diário';
  ChartType: 'line' | 'bar' | 'area' | 'number';
  Unit?: string;
  TargetValue?: number;
  VisiblePublic?: boolean;
  VisibleAdmin?: boolean;
  IsFinancial?: boolean;
  SortOrder?: number;
  Active?: boolean;
  Description?: string;
}): Promise<NotionKPI> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: kpi.Name } }] },
    Category: { select: { name: kpi.Category } },
    Periodicity: { select: { name: kpi.Periodicity } },
    ChartType: { select: { name: kpi.ChartType } },
    VisiblePublic: { checkbox: kpi.VisiblePublic ?? true },
    VisibleAdmin: { checkbox: kpi.VisibleAdmin ?? true },
    IsFinancial: { checkbox: kpi.IsFinancial ?? false },
    SortOrder: { number: kpi.SortOrder ?? 999 },
    Active: { checkbox: kpi.Active ?? true }
  };

  if (kpi.Unit !== undefined) {
    properties.Unit = { rich_text: [{ text: { content: kpi.Unit } }] };
  }
  if (kpi.TargetValue !== undefined) {
    properties.TargetValue = { number: kpi.TargetValue };
  }
  if (kpi.Description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: kpi.Description } }] };
  }

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToKPI(created);
}

/**
 * Create a new Goal
 */
export async function createGoal(goal: {
  Name: string;
  KPI: string; // KPI ID
  Year: number;
  Month?: number | null;
  WeekKey?: string;
  PeriodStart: string; // ISO date string
  PeriodEnd: string; // ISO date string
  Target: number;
  Actual?: number;
  VisiblePublic?: boolean;
  VisibleAdmin?: boolean;
  Notes?: string;
}): Promise<NotionGoal> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Goals');
  if (!dbId) throw new Error('NOTION_DB_GOALS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: goal.Name } }] },
    KPI: { relation: [{ id: goal.KPI }] },
    Year: { number: goal.Year },
    PeriodStart: { date: { start: goal.PeriodStart } },
    PeriodEnd: { date: { start: goal.PeriodEnd } },
    Target: { number: goal.Target },
    VisiblePublic: { checkbox: goal.VisiblePublic ?? true },
    VisibleAdmin: { checkbox: goal.VisibleAdmin ?? true }
  };

  if (goal.Month !== undefined && goal.Month !== null) {
    properties.Month = { number: goal.Month };
  }
  if (goal.WeekKey !== undefined) {
    properties.WeekKey = { rich_text: [{ text: { content: goal.WeekKey } }] };
  }
  if (goal.Actual !== undefined) {
    properties.Actual = { number: goal.Actual };
  }
  if (goal.Notes !== undefined) {
    properties.Notes = { rich_text: [{ text: { content: goal.Notes } }] };
  }

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToGoal(created);
}

/**
 * Get goals within a date range
 */
export async function getGoals(range?: { start?: string; end?: string }): Promise<NotionGoal[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Goals');
  if (!dbId) throw new Error('NOTION_DB_GOALS not configured');

  const filter: any = {};
  if (range?.start || range?.end) {
    filter.and = [];
    if (range.start) {
      filter.and.push({ property: 'PeriodStart', date: { on_or_after: range.start } });
    }
    if (range.end) {
      filter.and.push({ property: 'PeriodEnd', date: { on_or_before: range.end } });
    }
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    })
  );

  return response.results.map(pageToGoal);
}

/**
 * Get actions within a date range
 * Handles pagination to fetch all results
 */
export async function getActions(range?: { start?: string; end?: string }): Promise<NotionAction[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  const filter: any = {};
  if (range?.start || range?.end) {
    filter.and = [];
    if (range.start) {
      filter.and.push({ property: 'Date', date: { on_or_after: range.start } });
    }
    if (range.end) {
      filter.and.push({ property: 'Date', date: { on_or_before: range.end } });
    }
  }

  const allResults: any[] = [];
  let hasMore = true;
  let nextCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        start_cursor: nextCursor,
        page_size: 100
      })
    );

    allResults.push(...response.results);
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  return allResults.map(pageToAction);
}

/**
 * Toggle action done status
 */
export async function toggleActionDone(actionId: string, done: boolean): Promise<boolean> {
  const client = initNotionClient();

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: actionId,
      properties: {
        Done: { checkbox: done }
      }
    })
  );

  return true;
}

/**
 * Ensure action has a goal before allowing completion
 */
export async function ensureActionHasGoal(actionId: string): Promise<{ allowed: boolean; reason?: string }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  const page = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: actionId })
  );

  const action = pageToAction(page);
  if (!action.Goal || action.Goal.trim() === '') {
    return {
      allowed: false,
      reason: 'Não é possível concluir uma ação sem meta associada'
    };
  }

  return { allowed: true };
}

/**
 * Create a new action in Actions database (DB3)
 */
export async function createAction(
  payload: Partial<NotionAction>
): Promise<NotionAction> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  // Build Notion properties
  // Normalize date to prevent timezone issues
  const normalizedDate = normalizeDate(payload.Date);
  
  const properties: any = {
    Name: { title: [{ text: { content: payload.Name || '' } }] },
    Type: { select: { name: payload.Type || '' } },
    Date: { date: { start: normalizedDate } },
    Done: { checkbox: false },
    PublicVisible: { checkbox: payload.PublicVisible ?? true },
  };

  // Add optional fields
  if (payload.Contribution !== undefined) {
    properties.Contribution = { number: payload.Contribution };
  }
  if (payload.Earned !== undefined) {
    properties.Earned = { number: payload.Earned };
  }
  if (payload.Goal) {
    properties.Goal = { relation: [{ id: payload.Goal }] };
  }
  if (payload.Notes) {
    properties.Notes = { rich_text: [{ text: { content: payload.Notes } }] };
  }
  if (payload.Contact) {
    properties.Contact = { relation: [{ id: payload.Contact }] };
  }
  if (payload.Client) {
    properties.Client = { relation: [{ id: payload.Client }] };
  }
  if (payload.Proposal) {
    properties.Proposal = { relation: [{ id: payload.Proposal }] };
  }
  if (payload.Diagnostic) {
    properties.Diagnostic = { relation: [{ id: payload.Diagnostic }] };
  }
  if (payload.WeekKey) {
    properties.WeekKey = { rich_text: [{ text: { content: payload.WeekKey } }] };
  }
  if (payload.Month !== undefined) {
    properties.Month = { number: payload.Month };
  }
  if (payload.Priority) {
    properties.Priority = { select: { name: payload.Priority } };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToAction(response);
}

/**
 * Get action by ID
 */
export async function getActionById(id: string): Promise<NotionAction | null> {
  const client = initNotionClient();
  const page = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: id })
  );
  return pageToAction(page);
}

/**
 * Update an existing action
 */
export async function updateAction(
  actionId: string,
  updates: Partial<NotionAction>
): Promise<NotionAction> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties.Name = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Type !== undefined) {
    properties.Type = { select: { name: updates.Type } };
  }
  if (updates.Date !== undefined) {
    // Normalize date to prevent timezone issues
    const normalizedDate = normalizeDate(updates.Date);
    properties.Date = { date: { start: normalizedDate } };
  }
  if (updates.Done !== undefined) {
    properties.Done = { checkbox: updates.Done };
  }
  if (updates.Contribution !== undefined) {
    properties.Contribution = { number: updates.Contribution };
  }
  if (updates.Earned !== undefined) {
    properties.Earned = { number: updates.Earned };
  }
  if (updates.Goal !== undefined) {
    if (updates.Goal === '' || updates.Goal === null) {
      // Remove relation by setting to empty array
      properties.Goal = { relation: [] };
    } else {
      properties.Goal = { relation: [{ id: updates.Goal }] };
    }
  }
  if (updates.Notes !== undefined) {
    if (updates.Notes === '' || updates.Notes === null) {
      properties.Notes = { rich_text: [] };
    } else {
      properties.Notes = { rich_text: [{ text: { content: updates.Notes } }] };
    }
  }
  if (updates.Contact !== undefined) {
    if (updates.Contact === '' || updates.Contact === null) {
      properties.Contact = { relation: [] };
    } else {
      properties.Contact = { relation: [{ id: updates.Contact }] };
    }
  }
  if (updates.Client !== undefined) {
    if (updates.Client === '' || updates.Client === null) {
      properties.Client = { relation: [] };
    } else {
      properties.Client = { relation: [{ id: updates.Client }] };
    }
  }
  if (updates.Proposal !== undefined) {
    if (updates.Proposal === '' || updates.Proposal === null) {
      properties.Proposal = { relation: [] };
    } else {
      properties.Proposal = { relation: [{ id: updates.Proposal }] };
    }
  }
  if (updates.Diagnostic !== undefined) {
    if (updates.Diagnostic === '' || updates.Diagnostic === null) {
      properties.Diagnostic = { relation: [] };
    } else {
      properties.Diagnostic = { relation: [{ id: updates.Diagnostic }] };
    }
  }
  if (updates.WeekKey !== undefined) {
    if (updates.WeekKey === '' || updates.WeekKey === null) {
      properties.WeekKey = { rich_text: [] };
    } else {
      properties.WeekKey = { rich_text: [{ text: { content: updates.WeekKey } }] };
    }
  }
  if (updates.Month !== undefined) {
    properties.Month = { number: updates.Month };
  }
  if (updates.Priority !== undefined) {
    if (updates.Priority === '' || updates.Priority === null) {
      properties.Priority = { select: null };
    } else {
      properties.Priority = { select: { name: updates.Priority } };
    }
  }
  if (updates.PublicVisible !== undefined) {
    properties.PublicVisible = { checkbox: updates.PublicVisible };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: actionId,
      properties
    })
  );

  return pageToAction(updated);
}

/**
 * Get goal by ID
 */
async function getGoalById(id: string): Promise<NotionGoal | null> {
  const client = initNotionClient();
  const page = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: id })
  );
  return pageToGoal(page);
}

/**
 * Find Goal by name (fuzzy match)
 */
export async function findGoalByName(namePattern: string): Promise<NotionGoal | null> {
  // Get all Goals and search by name
  const allGoals = await getGoals();
  
  // Try exact match first
  let found = allGoals.find(goal => 
    goal.Name.toLowerCase() === namePattern.toLowerCase()
  );
  
  // Try fuzzy match (contains)
  if (!found) {
    found = allGoals.find(goal => 
      goal.Name.toLowerCase().includes(namePattern.toLowerCase()) ||
      namePattern.toLowerCase().includes(goal.Name.toLowerCase())
    );
  }
  
  return found || null;
}

/**
 * Update Goal properties
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<{
    Name: string;
    KPI: string;
    Year: number;
    Month: number | null;
    WeekKey: string;
    PeriodStart: string;
    PeriodEnd: string;
    Target: number;
    Actual: number;
    VisiblePublic: boolean;
    VisibleAdmin: boolean;
    Notes: string;
  }>
): Promise<NotionGoal> {
  const client = initNotionClient();

  const properties: any = {};
  
  if (updates.Name !== undefined) {
    properties.Name = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.KPI !== undefined) {
    properties.KPI = { relation: [{ id: updates.KPI }] };
  }
  if (updates.Year !== undefined) {
    properties.Year = { number: updates.Year };
  }
  if (updates.Month !== undefined) {
    if (updates.Month === null) {
      properties.Month = { number: null };
    } else {
      properties.Month = { number: updates.Month };
    }
  }
  if (updates.WeekKey !== undefined) {
    properties.WeekKey = { rich_text: [{ text: { content: updates.WeekKey } }] };
  }
  if (updates.PeriodStart !== undefined) {
    properties.PeriodStart = { date: { start: updates.PeriodStart } };
  }
  if (updates.PeriodEnd !== undefined) {
    properties.PeriodEnd = { date: { start: updates.PeriodEnd } };
  }
  if (updates.Target !== undefined) {
    properties.Target = { number: updates.Target };
  }
  if (updates.Actual !== undefined) {
    properties.Actual = { number: updates.Actual };
  }
  if (updates.VisiblePublic !== undefined) {
    properties.VisiblePublic = { checkbox: updates.VisiblePublic };
  }
  if (updates.VisibleAdmin !== undefined) {
    properties.VisibleAdmin = { checkbox: updates.VisibleAdmin };
  }
  if (updates.Notes !== undefined) {
    properties.Notes = { rich_text: [{ text: { content: updates.Notes } }] };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: goalId,
      properties
    })
  );

  return pageToGoal(updated);
}

/**
 * Update related Goal when Action is completed
 */
export async function updateRelatedGoal(actionId: string): Promise<void> {
  const client = initNotionClient();
  
  // Get Action to find related Goal
  const action = await getActionById(actionId);
  if (!action || !action.Goal) return;

  // Get Goal
  const goal = await getGoalById(action.Goal);
  if (!goal) return;

  // Get all actions related to this goal
  const allActions = await getActions();
  const relatedActions = allActions.filter(
    a => a.Goal === goal.id && a.Done === true
  );
  
  // Calculate new Actual based on completed actions
  // Sum Contribution or Earned values
  const newActual = relatedActions.reduce((sum, a) => {
    return sum + (a.Contribution || a.Earned || 0);
  }, 0);

  // Update Goal in Notion
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: goal.id,
      properties: {
        Actual: { number: newActual }
      }
    })
  );
}

/**
 * Get journal by date
 */
export async function getJournalByDate(date: string): Promise<NotionJournal | null> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Journal');
  if (!dbId) throw new Error('NOTION_DB_JOURNAL not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Date',
        date: { equals: date }
      },
      page_size: 1
    })
  );

  if (response.results.length === 0) return null;
  return pageToJournal(response.results[0]);
}

/**
 * Upsert journal by date (create or update)
 */
export async function upsertJournalByDate(
  date: string,
  payload: Partial<NotionJournal>
): Promise<NotionJournal> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Journal');
  if (!dbId) throw new Error('NOTION_DB_JOURNAL not configured');

  // Check if journal exists
  const existing = await getJournalByDate(date);

  if (existing) {
    // Update existing
    const updateProps: any = {};
    if (payload.Filled !== undefined) updateProps.Filled = { checkbox: payload.Filled };
    if (payload.Summary !== undefined) updateProps.Summary = { rich_text: [{ text: { content: payload.Summary } }] };
    if (payload.WhatWorked !== undefined) updateProps.WhatWorked = { rich_text: [{ text: { content: payload.WhatWorked } }] };
    if (payload.WhatFailed !== undefined) updateProps.WhatFailed = { rich_text: [{ text: { content: payload.WhatFailed } }] };
    if (payload.Insights !== undefined) updateProps.Insights = { rich_text: [{ text: { content: payload.Insights } }] };
    if (payload.Objections !== undefined) updateProps.Objections = { rich_text: [{ text: { content: payload.Objections } }] };
    if (payload.ProcessIdeas !== undefined) updateProps.ProcessIdeas = { rich_text: [{ text: { content: payload.ProcessIdeas } }] };
    if (payload.Tags) updateProps.Tags = { multi_select: payload.Tags.map(tag => ({ name: tag })) };

    await retryWithBackoff(() =>
      client.pages.update({
        page_id: existing.id,
        properties: updateProps
      })
    );

    return { ...existing, ...payload };
  } else {
    // Create new
    const createProps: any = {
      Name: { title: [{ text: { content: payload.Name || `Journal ${date}` } }] },
      Date: { date: { start: date } },
      Filled: { checkbox: payload.Filled || false }
    };

    if (payload.Summary) createProps.Summary = { rich_text: [{ text: { content: payload.Summary } }] };
    if (payload.WhatWorked) createProps.WhatWorked = { rich_text: [{ text: { content: payload.WhatWorked } }] };
    if (payload.WhatFailed) createProps.WhatFailed = { rich_text: [{ text: { content: payload.WhatFailed } }] };
    if (payload.Insights) createProps.Insights = { rich_text: [{ text: { content: payload.Insights } }] };
    if (payload.Objections) createProps.Objections = { rich_text: [{ text: { content: payload.Objections } }] };
    if (payload.ProcessIdeas) createProps.ProcessIdeas = { rich_text: [{ text: { content: payload.ProcessIdeas } }] };
    if (payload.Tags) createProps.Tags = { multi_select: payload.Tags.map(tag => ({ name: tag })) };

    const page = await retryWithBackoff(() =>
      client.pages.create({
        parent: { database_id: dbId },
        properties: createProps
      })
    );

    return pageToJournal(page);
  }
}

/**
 * Create coffee diagnostic
 */
export async function createCoffeeDiagnostic(payload: {
  Name: string;
  Date: string;
  Contact?: string;
  Notes?: string;
  NextSteps?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CoffeeDiagnostics');
  if (!dbId) throw new Error('NOTION_DB_COFFEEDIAGNOSTICS not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Date: { date: { start: payload.Date } }
  };

  if (payload.Notes) props.Notes = { rich_text: [{ text: { content: payload.Notes } }] };
  if (payload.NextSteps) props.NextSteps = { rich_text: [{ text: { content: payload.NextSteps } }] };
  if (payload.Contact) props.Contact = { relation: [{ id: payload.Contact }] };

  const page = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties: props
    })
  );

  return page.id;
}

/**
 * Create customer win
 */
export async function createCustomerWin(payload: {
  Name: string;
  Client?: string;
  Date: string;
  Description?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CustomerWins');
  if (!dbId) throw new Error('NOTION_DB_CUSTOMERWINS not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Date: { date: { start: payload.Date } }
  };

  if (payload.Description) props.Description = { rich_text: [{ text: { content: payload.Description } }] };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };

  const page = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties: props
    })
  );

  return page.id;
}

/**
 * Create expansion opportunity
 */
export async function createExpansionOpportunity(payload: {
  Name: string;
  Client?: string;
  Type?: string;
  Status?: string;
  Notes?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('ExpansionOpportunities');
  if (!dbId) throw new Error('NOTION_DB_EXPANSIONOPPORTUNITIES not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] }
  };

  if (payload.Notes) props.Notes = { rich_text: [{ text: { content: payload.Notes } }] };
  if (payload.Type) props.Type = { select: { name: payload.Type } };
  if (payload.Status) props.Status = { select: { name: payload.Status } };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };

  const page = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties: props
    })
  );

  return page.id;
}

/**
 * Get finance metrics from FinanceMetrics database (DB11)
 */
export async function getFinanceMetrics(): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('FinanceMetrics');
  if (!dbId) throw new Error('NOTION_DB_FINANCEMETRICS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId
    })
  );

  // Map results based on FinanceMetrics schema
  // For now, return basic structure - can be extended based on actual schema
  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      Name: extractText(props.Name),
      // Add other properties as needed based on actual schema
      // For now, return basic structure
    };
  });
}

/**
 * Update database properties (rename columns, change types, etc.)
 * @param databaseId - The ID of the database to update
 * @param properties - Object mapping property names to their new configurations
 */
export async function updateDatabaseProperties(
  databaseId: string,
  properties: Record<string, {
    name?: string;
    type?: string;
    // Additional property-specific options can be added here
  }>
): Promise<any> {
  const client = initNotionClient();

  const updatePayload: any = {};
  
  // First, retrieve the database to get current properties
  const database = await retryWithBackoff(() =>
    client.databases.retrieve({ database_id: databaseId })
  );

  // Build the properties update object
  for (const [oldName, config] of Object.entries(properties)) {
    const currentProperty = database.properties[oldName];
    if (!currentProperty) {
      throw new Error(`Property "${oldName}" not found in database`);
    }

    // If renaming, we need to update the property name
    if (config.name && config.name !== oldName) {
      updatePayload[oldName] = {
        name: config.name
      };
    }

    // If changing type, we need to provide the new type configuration
    // Note: Notion API has limitations on type changes - some types cannot be changed
    if (config.type && config.type !== currentProperty.type) {
      // This is a simplified version - actual implementation depends on target type
      throw new Error('Changing property types is complex and type-specific. Please use Notion UI for type changes.');
    }
  }

  const updated = await retryWithBackoff(() =>
    client.databases.update({
      database_id: databaseId,
      properties: updatePayload
    })
  );

  return updated;
}

/**
 * Create a new database in Notion
 * @param parentPageId - The ID of the parent page where the database will be created
 * @param title - The title of the database
 * @param properties - Object defining the properties (columns) of the database
 */
export async function createDatabase(
  parentPageId: string,
  title: string,
  properties: Record<string, {
    type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 
          'date' | 'people' | 'files' | 'checkbox' | 'url' | 'email' | 
          'phone_number' | 'formula' | 'relation' | 'rollup' | 'created_time' | 
          'created_by' | 'last_edited_time' | 'last_edited_by';
    name: string;
    // Type-specific options
    select?: { options: Array<{ name: string; color?: string }> };
    multi_select?: { options: Array<{ name: string; color?: string }> };
    relation?: { database_id: string; type?: 'single_property' | 'dual_property' };
    formula?: { expression: string };
    rollup?: { 
      relation_property_name: string;
      relation_property_id: string;
      rollup_property_name: string;
      rollup_property_id: string;
      function: 'count' | 'sum' | 'average' | 'min' | 'max' | 'range' | 'checkbox' | 'percent_checked' | 'show_original' | 'show_unique' | 'unique' | 'empty' | 'not_empty' | 'date';
    };
  }>
): Promise<any> {
  const client = initNotionClient();

  // Build properties object for Notion API
  const notionProperties: any = {};
  
  for (const [key, prop] of Object.entries(properties)) {
    const baseProperty: any = {};
    
    switch (prop.type) {
      case 'title':
        baseProperty.title = {};
        break;
      case 'rich_text':
        baseProperty.rich_text = {};
        break;
      case 'number':
        baseProperty.number = {};
        break;
      case 'select':
        baseProperty.select = prop.select || { options: [] };
        break;
      case 'multi_select':
        baseProperty.multi_select = prop.multi_select || { options: [] };
        break;
      case 'date':
        baseProperty.date = {};
        break;
      case 'people':
        baseProperty.people = {};
        break;
      case 'files':
        baseProperty.files = {};
        break;
      case 'checkbox':
        baseProperty.checkbox = {};
        break;
      case 'url':
        baseProperty.url = {};
        break;
      case 'email':
        baseProperty.email = {};
        break;
      case 'phone_number':
        baseProperty.phone_number = {};
        break;
      case 'formula':
        if (!prop.formula) throw new Error(`Formula property "${key}" requires formula expression`);
        baseProperty.formula = { expression: prop.formula.expression };
        break;
      case 'relation':
        if (!prop.relation) throw new Error(`Relation property "${key}" requires relation configuration`);
        baseProperty.relation = {
          database_id: prop.relation.database_id,
          type: prop.relation.type || 'single_property'
        };
        break;
      case 'rollup':
        if (!prop.rollup) throw new Error(`Rollup property "${key}" requires rollup configuration`);
        baseProperty.rollup = prop.rollup;
        break;
      case 'created_time':
        baseProperty.created_time = {};
        break;
      case 'created_by':
        baseProperty.created_by = {};
        break;
      case 'last_edited_time':
        baseProperty.last_edited_time = {};
        break;
      case 'last_edited_by':
        baseProperty.last_edited_by = {};
        break;
      default:
        throw new Error(`Unsupported property type: ${prop.type}`);
    }
    
    notionProperties[prop.name] = baseProperty;
  }

  const database = await retryWithBackoff(() =>
    client.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: title
          }
        }
      ],
      properties: notionProperties
    })
  );

  return database;
}

/**
 * Get database information
 */
export async function getDatabaseInfo(databaseId: string): Promise<any> {
  const client = initNotionClient();

  const database = await retryWithBackoff(() =>
    client.databases.retrieve({ database_id: databaseId })
  ) as any;

  return {
    id: database.id,
    title: database.title,
    properties: database.properties,
    created_time: database.created_time,
    last_edited_time: database.last_edited_time
  };
}

/**
 * Get all CRM pipeline contacts
 */
export async function getCRMPipeline(): Promise<NotionCRMPipeline[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      // Sort by last_edited_time (always available in Notion)
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToCRMPipeline);
}

/**
 * Get CRM pipeline contacts by status
 */
export async function getCRMPipelineByStatus(status: string): Promise<NotionCRMPipeline[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Status',
        select: { equals: status }
      },
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToCRMPipeline);
}

/**
 * Get CRM pipeline contact by ID
 */
export async function getCRMPipelineContactById(id: string): Promise<NotionCRMPipeline> {
  const client = initNotionClient();
  const page = await retryWithBackoff(() => client.pages.retrieve({ page_id: id })) as any;
  return pageToCRMPipeline(page);
}

/**
 * Create new CRM pipeline contact
 */
export async function createCRMPipelineContact(data: {
  Name: string;
  Company?: string;
  Status?: string;
  CoffeeDate?: string;
  ProposalDate?: string;
  Notes?: string;
}): Promise<NotionCRMPipeline> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: data.Name } }] }
    // Não incluir LastUpdate - essa propriedade não existe na database Contacts (DB04)
    // O Notion já mantém last_edited_time automaticamente
  };

  if (data.Company) properties.Company = { rich_text: [{ text: { content: data.Company } }] };
  if (data.Status) properties.Status = { select: { name: data.Status } };
  if (data.CoffeeDate) properties.CoffeeDate = { date: { start: normalizeDate(data.CoffeeDate) } };
  if (data.ProposalDate) properties.ProposalDate = { date: { start: normalizeDate(data.ProposalDate) } };
  if (data.Notes) properties.Notes = { rich_text: [{ text: { content: data.Notes } }] };

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToCRMPipeline(response);
}

/**
 * Update CRM pipeline contact
 */
export async function updateCRMPipelineContact(
  id: string,
  updates: Partial<{
    Name: string;
    Company: string;
    Status: string;
    CoffeeDate: string;
    ProposalDate: string;
    Notes: string;
  }>
): Promise<NotionCRMPipeline> {
  const client = initNotionClient();
  const properties: any = {};

  if (updates.Name) properties.Name = { title: [{ text: { content: updates.Name } }] };
  if (updates.Company !== undefined) properties.Company = { rich_text: [{ text: { content: updates.Company } }] };
  if (updates.Status) properties.Status = { select: { name: updates.Status } };
  if (updates.CoffeeDate) properties.CoffeeDate = { date: { start: normalizeDate(updates.CoffeeDate) } };
  if (updates.ProposalDate) properties.ProposalDate = { date: { start: normalizeDate(updates.ProposalDate) } };
  if (updates.Notes !== undefined) properties.Notes = { rich_text: [{ text: { content: updates.Notes } }] };
  
  // Não atualizar LastUpdate - essa propriedade não existe na database Contacts (DB04)
  // O Notion já mantém last_edited_time automaticamente, que usamos como fallback na leitura

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return getCRMPipelineContactById(id);
}

/**
 * Get all contacts
 */
export async function getContacts(): Promise<NotionContact[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Name', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToContact);
}

/**
 * Get contact by ID
 */
export async function getContactById(id: string): Promise<NotionContact> {
  const client = initNotionClient();
  const page = await retryWithBackoff(() => client.pages.retrieve({ page_id: id })) as any;
  return pageToContact(page);
}

/**
 * Update contact
 */
export async function updateContact(
  id: string,
  updates: Partial<NotionContact>
): Promise<NotionContact> {
  const client = initNotionClient();
  const properties: any = {};

  if (updates.Name !== undefined) properties.Name = { title: [{ text: { content: updates.Name } }] };
  if (updates.Company !== undefined) {
    properties.Company = updates.Company 
      ? { rich_text: [{ text: { content: updates.Company } }] }
      : { rich_text: [] };
  }
  if (updates.Status !== undefined) {
    properties.Status = updates.Status 
      ? { select: { name: updates.Status } }
      : { select: null };
  }
  if (updates.Segment !== undefined) {
    properties.Segment = updates.Segment 
      ? { select: { name: updates.Segment } }
      : { select: null };
  }
  if (updates.City !== undefined) {
    properties.City = updates.City 
      ? { select: { name: updates.City } }
      : { select: null };
  }
  if (updates.WhatsApp !== undefined) {
    properties.WhatsApp = updates.WhatsApp 
      ? { phone_number: updates.WhatsApp }
      : { phone_number: null };
  }
  if (updates.Source !== undefined) {
    properties.Source = updates.Source 
      ? { select: { name: updates.Source } }
      : { select: null };
  }
  if (updates.Priority !== undefined) {
    properties.Priority = updates.Priority 
      ? { select: { name: updates.Priority } }
      : { select: null };
  }
  if (updates.Notes !== undefined) {
    properties.Notes = updates.Notes 
      ? { rich_text: [{ text: { content: updates.Notes } }] }
      : { rich_text: [] };
  }

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return getContactById(id);
}

/**
 * Delete contact
 */
export async function deleteContact(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Delete action
 */
export async function deleteAction(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Create new contact
 */
export async function createContact(data: {
  Name: string;
  Company?: string;
  Status?: string;
  Segment?: string;
  City?: string;
  WhatsApp?: string;
  Source?: string;
  Priority?: string;
  Notes?: string;
}): Promise<NotionContact> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: data.Name } }] }
  };

  if (data.Company) properties.Company = { rich_text: [{ text: { content: data.Company } }] };
  if (data.Status) properties.Status = { select: { name: data.Status } };
  if (data.Segment) properties.Segment = { select: { name: data.Segment } };
  if (data.City) properties.City = { select: { name: data.City } };
  if (data.WhatsApp) properties.WhatsApp = { phone_number: data.WhatsApp };
  if (data.Source) properties.Source = { select: { name: data.Source } };
  if (data.Priority) properties.Priority = { select: { name: data.Priority } };
  if (data.Notes) properties.Notes = { rich_text: [{ text: { content: data.Notes } }] };

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToContact(response);
}

/**
 * Get all products
 */
export async function getProdutos(): Promise<NotionProduto[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Produtos');
  if (!dbId) throw new Error('NOTION_DB_PRODUTOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ property: 'PrioridadeEstrategica', direction: 'descending' }]
    })
  );

  return response.results.map(pageToProduto);
}

/**
 * Get products by status
 */
export async function getProdutosByStatus(status: string): Promise<NotionProduto[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Produtos');
  if (!dbId) throw new Error('NOTION_DB_PRODUTOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Status',
        select: { equals: status }
      },
      sorts: [{ property: 'PrioridadeEstrategica', direction: 'descending' }]
    })
  );

  return response.results.map(pageToProduto);
}

/**
 * Create a new produto
 */
export async function createProduto(payload: Partial<NotionProduto>): Promise<NotionProduto> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Produtos');
  if (!dbId) throw new Error('NOTION_DB_PRODUTOS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: payload.Name || '' } }] },
    Status: { select: { name: payload.Status || 'Ideia' } },
  };

  if (payload.ProblemaQueResolve) {
    properties.ProblemaQueResolve = { rich_text: [{ text: { content: payload.ProblemaQueResolve } }] };
  }
  if (payload.PrecoMinimo !== undefined) {
    properties.PrecoMinimo = { number: payload.PrecoMinimo };
  }
  if (payload.PrecoIdeal !== undefined) {
    properties.PrecoIdeal = { number: payload.PrecoIdeal };
  }
  if (payload.Tipo) {
    properties.Tipo = { select: { name: payload.Tipo } };
  }
  if (payload.TempoMedioEntrega !== undefined) {
    properties.TempoMedioEntrega = { number: payload.TempoMedioEntrega };
  }
  if (payload.DependenciaFundador) {
    properties.DependenciaFundador = { select: { name: payload.DependenciaFundador } };
  }
  if (payload.Replicabilidade) {
    properties.Replicabilidade = { select: { name: payload.Replicabilidade } };
  }
  if (payload.PrioridadeEstrategica !== undefined) {
    properties.PrioridadeEstrategica = { number: payload.PrioridadeEstrategica };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToProduto(response);
}

/**
 * Convert Notion page to BudgetGoal
 */
function pageToBudgetGoal(page: any): NotionBudgetGoal {
  const props = page.properties;
  
  // Find the title property dynamically
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Category: extractSelect(props.Category),
    Month: extractNumber(props.Month),
    Year: extractNumber(props.Year),
    BudgetAmount: extractNumber(props.BudgetAmount),
    SpentAmount: extractNumber(props.SpentAmount),
    PeriodStart: extractDate(props.PeriodStart),
    PeriodEnd: extractDate(props.PeriodEnd),
    Status: extractSelect(props.Status) as any || 'Não iniciado',
    Notes: extractText(props.Notes)
  };
}

/**
 * Convert Notion page to Transaction
 */
function pageToTransaction(page: any): NotionTransaction {
  const props = page.properties;
  
  // Find the title property dynamically
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Date: extractDate(props.Date),
    Amount: extractNumber(props.Amount),
    Type: extractSelect(props.Type) as any,
    Category: extractSelect(props.Category),
    Account: extractSelect(props.Account),
    Description: extractText(props.Description),
    BudgetGoal: extractRelation(props.BudgetGoal)[0] || '',
    Imported: extractBoolean(props.Imported),
    ImportedAt: extractDate(props.ImportedAt),
    FileSource: extractText(props.FileSource)
  };
}

/**
 * Get budget goals with optional filters
 */
export async function getBudgetGoals(month?: number, year?: number): Promise<NotionBudgetGoal[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('BudgetGoals');
  if (!dbId) throw new Error('NOTION_DB_BUDGETGOALS not configured');

  const filters: any[] = [];
  
  if (month !== undefined) {
    filters.push({
      property: 'Month',
      number: { equals: month }
    });
  }
  
  if (year !== undefined) {
    filters.push({
      property: 'Year',
      number: { equals: year }
    });
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: filters.length > 0 ? { and: filters } : undefined
    })
  );

  return response.results.map(pageToBudgetGoal);
}

/**
 * Create a new budget goal
 */
export async function createBudgetGoal(data: {
  Name: string;
  Category: string;
  Month: number;
  Year: number;
  BudgetAmount: number;
  PeriodStart: string;
  PeriodEnd: string;
  Notes?: string;
}): Promise<NotionBudgetGoal> {
  const client = initNotionClient();
  const dbId = getDatabaseId('BudgetGoals');
  if (!dbId) throw new Error('NOTION_DB_BUDGETGOALS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name'; // Fallback to 'Name' if not found

  // Normalize dates to ensure YYYY-MM-DD format
  const normalizedStart = normalizeDate(data.PeriodStart);
  const normalizedEnd = normalizeDate(data.PeriodEnd);
  
  // Validate dates
  if (!normalizedStart || !normalizedEnd) {
    throw new Error('Datas inválidas. Use o formato YYYY-MM-DD');
  }
  
  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Category: { select: { name: data.Category } },
    Month: { number: data.Month },
    Year: { number: data.Year },
    BudgetAmount: { number: data.BudgetAmount },
    SpentAmount: { number: 0 },
    PeriodStart: { date: { start: normalizedStart } },
    PeriodEnd: { date: { start: normalizedEnd } },
    Status: { select: { name: 'Não iniciado' } }
  };

  if (data.Notes) {
    properties.Notes = { rich_text: [{ text: { content: data.Notes } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToBudgetGoal(response);
}

/**
 * Update a budget goal
 */
export async function updateBudgetGoal(
  id: string,
  updates: Partial<{
    Name: string;
    Category: string;
    Month: number;
    Year: number;
    BudgetAmount: number;
    SpentAmount: number;
    PeriodStart: string;
    PeriodEnd: string;
    Status: string;
    Notes: string;
  }>
): Promise<NotionBudgetGoal> {
  const client = initNotionClient();
  const dbId = getDatabaseId('BudgetGoals');
  if (!dbId) throw new Error('NOTION_DB_BUDGETGOALS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name'; // Fallback to 'Name' if not found

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Month !== undefined) {
    properties.Month = { number: updates.Month };
  }
  if (updates.Year !== undefined) {
    properties.Year = { number: updates.Year };
  }
  if (updates.BudgetAmount !== undefined) {
    properties.BudgetAmount = { number: updates.BudgetAmount };
  }
  if (updates.SpentAmount !== undefined) {
    properties.SpentAmount = { number: updates.SpentAmount };
  }
  if (updates.PeriodStart !== undefined) {
    const normalized = normalizeDate(updates.PeriodStart);
    if (normalized) {
      properties.PeriodStart = { date: { start: normalized } };
    }
  }
  if (updates.PeriodEnd !== undefined) {
    const normalized = normalizeDate(updates.PeriodEnd);
    if (normalized) {
      properties.PeriodEnd = { date: { start: normalized } };
    }
  }
  if (updates.Status !== undefined) {
    properties.Status = { select: { name: updates.Status } };
  }
  if (updates.Notes !== undefined) {
    properties.Notes = { rich_text: [{ text: { content: updates.Notes } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToBudgetGoal(response);
}

/**
 * Delete a budget goal
 */
export async function deleteBudgetGoal(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(filters?: {
  category?: string;
  account?: string;
  type?: 'Entrada' | 'Saída';
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  uncategorized?: boolean;
}): Promise<NotionTransaction[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Transactions');
  if (!dbId) throw new Error('NOTION_DB_TRANSACTIONS not configured');

  const notionFilters: any[] = [];

  if (filters?.category) {
    notionFilters.push({
      property: 'Category',
      select: { equals: filters.category }
    });
  }

  if (filters?.account) {
    notionFilters.push({
      property: 'Account',
      select: { equals: filters.account }
    });
  }

  if (filters?.type) {
    notionFilters.push({
      property: 'Type',
      select: { equals: filters.type }
    });
  }

  if (filters?.startDate || filters?.endDate) {
    const dateFilter: any = { property: 'Date', date: {} };
    if (filters.startDate) {
      dateFilter.date.on_or_after = normalizeDate(filters.startDate);
    }
    if (filters.endDate) {
      dateFilter.date.on_or_before = normalizeDate(filters.endDate);
    }
    notionFilters.push(dateFilter);
  }

  if (filters?.uncategorized) {
    notionFilters.push({
      property: 'Category',
      select: { is_empty: true }
    });
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: notionFilters.length > 0 ? { and: notionFilters } : undefined,
      sorts: [{ property: 'Date', direction: 'descending' }]
    })
  );

  let transactions = response.results.map(pageToTransaction);

  // Filter by month/year if specified (client-side since Notion date filters are complex)
  if (filters?.month !== undefined || filters?.year !== undefined) {
    transactions = transactions.filter(t => {
      const date = new Date(t.Date);
      if (filters.month !== undefined && date.getMonth() + 1 !== filters.month) return false;
      if (filters.year !== undefined && date.getFullYear() !== filters.year) return false;
      return true;
    });
  }

  return transactions;
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: {
  Name: string;
  Date: string;
  Amount: number;
  Type: 'Entrada' | 'Saída';
  Account: string;
  Category?: string;
  Description?: string;
  BudgetGoal?: string;
  Imported?: boolean;
  ImportedAt?: string;
  FileSource?: string;
}): Promise<NotionTransaction> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Transactions');
  if (!dbId) throw new Error('NOTION_DB_TRANSACTIONS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name'; // Fallback to 'Name' if not found

  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Date: { date: { start: normalizeDate(data.Date) } },
    Amount: { number: data.Amount },
    Type: { select: { name: data.Type } },
    Account: { select: { name: data.Account } },
    Imported: { checkbox: data.Imported || false }
  };

  if (data.Category) {
    properties.Category = { select: { name: data.Category } };
  }
  if (data.Description) {
    properties.Description = { rich_text: [{ text: { content: data.Description } }] };
  }
  if (data.BudgetGoal) {
    properties.BudgetGoal = { relation: [{ id: data.BudgetGoal }] };
  }
  if (data.ImportedAt) {
    properties.ImportedAt = { date: { start: normalizeDate(data.ImportedAt) } };
  }
  if (data.FileSource) {
    properties.FileSource = { rich_text: [{ text: { content: data.FileSource } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToTransaction(response);
}

/**
 * Bulk create transactions
 */
export async function bulkCreateTransactions(
  transactions: Array<{
    Name: string;
    Date: string;
    Amount: number;
    Type: 'Entrada' | 'Saída';
    Account: string;
    Category?: string;
    Description?: string;
    FileSource?: string;
  }>
): Promise<NotionTransaction[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Transactions');
  if (!dbId) throw new Error('NOTION_DB_TRANSACTIONS not configured');

  const now = new Date().toISOString().split('T')[0];
  const created: NotionTransaction[] = [];

  // Notion API has rate limits, so we'll create in batches
  const batchSize = 10;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    
    const promises = batch.map(t => {
      const properties: any = {
        Name: { title: [{ text: { content: t.Name } }] },
        Date: { date: { start: normalizeDate(t.Date) } },
        Amount: { number: t.Amount },
        Type: { select: { name: t.Type } },
        Account: { select: { name: t.Account } },
        Imported: { checkbox: true },
        ImportedAt: { date: { start: now } }
      };

      if (t.Category) {
        properties.Category = { select: { name: t.Category } };
      }
      if (t.Description) {
        properties.Description = { rich_text: [{ text: { content: t.Description } }] };
      }
      if (t.FileSource) {
        properties.FileSource = { rich_text: [{ text: { content: t.FileSource } }] };
      }

      return retryWithBackoff(() =>
        client.pages.create({
          parent: { database_id: dbId },
          properties
        })
      );
    });

    const results = await Promise.all(promises);
    created.push(...results.map(pageToTransaction));
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return created;
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string,
  updates: Partial<{
    Name: string;
    Date: string;
    Amount: number;
    Type: 'Entrada' | 'Saída';
    Category: string;
    Account: string;
    Description: string;
    BudgetGoal: string;
  }>
): Promise<NotionTransaction> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Transactions');
  if (!dbId) throw new Error('NOTION_DB_TRANSACTIONS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name'; // Fallback to 'Name' if not found

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Date !== undefined) {
    properties.Date = { date: { start: normalizeDate(updates.Date) } };
  }
  if (updates.Amount !== undefined) {
    properties.Amount = { number: updates.Amount };
  }
  if (updates.Type !== undefined) {
    properties.Type = { select: { name: updates.Type } };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Account !== undefined) {
    properties.Account = { select: { name: updates.Account } };
  }
  if (updates.Description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: updates.Description } }] };
  }
  if (updates.BudgetGoal !== undefined) {
    if (updates.BudgetGoal) {
      properties.BudgetGoal = { relation: [{ id: updates.BudgetGoal }] };
    } else {
      properties.BudgetGoal = { relation: [] };
    }
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToTransaction(response);
}

/**
 * Bulk update transactions (for categorization)
 */
export async function bulkUpdateTransactions(
  updates: Array<{ id: string; category?: string; budgetGoal?: string }>
): Promise<NotionTransaction[]> {
  const client = initNotionClient();
  const results: NotionTransaction[] = [];

  for (const update of updates) {
    const properties: any = {};
    
    if (update.category !== undefined) {
      properties.Category = { select: { name: update.category } };
    }
    if (update.budgetGoal !== undefined) {
      if (update.budgetGoal) {
        properties.BudgetGoal = { relation: [{ id: update.budgetGoal }] };
      } else {
        properties.BudgetGoal = { relation: [] };
      }
    }

    if (Object.keys(properties).length > 0) {
      const response = await retryWithBackoff(() =>
        client.pages.update({
          page_id: update.id,
          properties
        })
      );
      results.push(pageToTransaction(response));
    }
  }

  return results;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Get finance summary for a given month/year
 */
export async function getFinanceSummary(month: number, year: number): Promise<{
  totalBudgeted: number;
  totalSpent: number;
  availableBalance: number;
  utilizationPercentage: number;
  categoryBreakdown: Array<{
    category: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }>;
  topCategories: Array<{
    category: string;
    spent: number;
    percentage: number;
  }>;
}> {
  const budgetGoals = await getBudgetGoals(month, year);
  const transactions = await getTransactions({ month, year, type: 'Saída' });

  const totalBudgeted = budgetGoals.reduce((sum, goal) => sum + goal.BudgetAmount, 0);
  const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.Amount), 0);
  const availableBalance = totalBudgeted - totalSpent;
  const utilizationPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map<string, { budgeted: number; spent: number }>();
  
  budgetGoals.forEach(goal => {
    const existing = categoryMap.get(goal.Category) || { budgeted: 0, spent: 0 };
    existing.budgeted += goal.BudgetAmount;
    existing.spent += goal.SpentAmount;
    categoryMap.set(goal.Category, existing);
  });

  transactions.forEach(t => {
    if (t.Category) {
      const existing = categoryMap.get(t.Category) || { budgeted: 0, spent: 0 };
      existing.spent += Math.abs(t.Amount);
      categoryMap.set(t.Category, existing);
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    budgeted: data.budgeted,
    spent: data.spent,
    percentage: data.budgeted > 0 ? (data.spent / data.budgeted) * 100 : 0
  }));

  // Top categories by spending
  const categorySpending = new Map<string, number>();
  transactions.forEach(t => {
    if (t.Category) {
      const current = categorySpending.get(t.Category) || 0;
      categorySpending.set(t.Category, current + Math.abs(t.Amount));
    }
  });

  const topCategories = Array.from(categorySpending.entries())
    .map(([category, spent]) => ({
      category,
      spent,
      percentage: totalSpent > 0 ? (spent / totalSpent) * 100 : 0
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  return {
    totalBudgeted,
    totalSpent,
    availableBalance,
    utilizationPercentage,
    categoryBreakdown,
    topCategories
  };
}

// ============================================================================
// ACCOUNTS (Contas Bancárias)
// ============================================================================

/**
 * Convert Notion page to Account
 */
function pageToAccount(page: any): NotionAccount {
  const props = page.properties;
  
  // Find the title property dynamically
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Type: extractSelect(props.Type) as any || 'Corrente',
    Bank: extractSelect(props.Bank) || '',
    AccountType: extractSelect(props.AccountType) as any || 'Pessoal',
    InitialBalance: extractNumber(props.InitialBalance),
    CurrentBalance: extractNumber(props.CurrentBalance),
    Limit: extractNumber(props.Limit) || undefined,
    Active: extractBoolean(props.Active),
    Notes: extractText(props.Notes)
  };
}

/**
 * Get all accounts
 */
export async function getAccounts(activeOnly?: boolean): Promise<NotionAccount[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Accounts');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTS not configured');

  const filters: any[] = [];
  if (activeOnly) {
    filters.push({
      property: 'Active',
      checkbox: { equals: true }
    });
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: filters.length > 0 ? { and: filters } : undefined
    })
  );

  return response.results.map(pageToAccount);
}

/**
 * Create a new account
 */
export async function createAccount(data: {
  Name: string;
  Type: 'Corrente' | 'Poupança' | 'Cartão de Crédito' | 'Investimento';
  Bank: string;
  AccountType: 'Empresarial' | 'Pessoal';
  InitialBalance: number;
  Limit?: number;
  Notes?: string;
}): Promise<NotionAccount> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Accounts');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Type: { select: { name: data.Type } },
    Bank: { select: { name: data.Bank } },
    AccountType: { select: { name: data.AccountType } },
    InitialBalance: { number: data.InitialBalance },
    CurrentBalance: { number: data.InitialBalance }, // Start with initial balance
    Active: { checkbox: true }
  };

  if (data.Limit !== undefined) {
    properties.Limit = { number: data.Limit };
  }
  if (data.Notes) {
    properties.Notes = { rich_text: [{ text: { content: data.Notes } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToAccount(response);
}

/**
 * Update an account
 */
export async function updateAccount(
  id: string,
  updates: Partial<{
    Name: string;
    Type: 'Corrente' | 'Poupança' | 'Cartão de Crédito' | 'Investimento';
    Bank: string;
    AccountType: 'Empresarial' | 'Pessoal';
    InitialBalance: number;
    CurrentBalance: number;
    Limit: number;
    Active: boolean;
    Notes: string;
  }>
): Promise<NotionAccount> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Accounts');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTS not configured');

  // Get database to find the actual title property name
  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Type !== undefined) {
    properties.Type = { select: { name: updates.Type } };
  }
  if (updates.Bank !== undefined) {
    properties.Bank = { select: { name: updates.Bank } };
  }
  if (updates.AccountType !== undefined) {
    properties.AccountType = { select: { name: updates.AccountType } };
  }
  if (updates.InitialBalance !== undefined) {
    properties.InitialBalance = { number: updates.InitialBalance };
  }
  if (updates.CurrentBalance !== undefined) {
    properties.CurrentBalance = { number: updates.CurrentBalance };
  }
  if (updates.Limit !== undefined) {
    properties.Limit = { number: updates.Limit };
  }
  if (updates.Active !== undefined) {
    properties.Active = { checkbox: updates.Active };
  }
  if (updates.Notes !== undefined) {
    properties.Notes = { rich_text: [{ text: { content: updates.Notes } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToAccount(response);
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

// ============================================================================
// ACCOUNTS PAYABLE (Contas a Pagar)
// ============================================================================

/**
 * Convert Notion page to AccountPayable
 */
function pageToAccountPayable(page: any): NotionAccountPayable {
  const props = page.properties;
  
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Description: extractText(props.Description),
    Amount: extractNumber(props.Amount),
    DueDate: extractDate(props.DueDate),
    PaidDate: extractDate(props.PaidDate),
    Status: extractSelect(props.Status) as any || 'Pendente',
    Category: extractSelect(props.Category),
    Account: extractRelation(props.Account)[0] || '',
    Paid: extractBoolean(props.Paid),
    Recurring: extractBoolean(props.Recurring),
    RecurringRule: extractText(props.RecurringRule)
  };
}

/**
 * Get accounts payable
 */
export async function getAccountsPayable(filters?: {
  status?: 'Pendente' | 'Pago' | 'Vencido';
  paid?: boolean;
  startDate?: string;
  endDate?: string;
}): Promise<NotionAccountPayable[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsPayable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSPAYABLE not configured');

  const filterConditions: any[] = [];

  if (filters?.status) {
    filterConditions.push({
      property: 'Status',
      select: { equals: filters.status }
    });
  }

  if (filters?.paid !== undefined) {
    filterConditions.push({
      property: 'Paid',
      checkbox: { equals: filters.paid }
    });
  }

  if (filters?.startDate || filters?.endDate) {
    const dateFilter: any = { property: 'DueDate', date: {} };
    if (filters.startDate) dateFilter.date.on_or_after = filters.startDate;
    if (filters.endDate) dateFilter.date.on_or_before = filters.endDate;
    filterConditions.push(dateFilter);
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: filterConditions.length > 0 ? { and: filterConditions } : undefined
    })
  );

  return response.results.map(pageToAccountPayable);
}

/**
 * Create an account payable
 */
export async function createAccountPayable(data: {
  Name: string;
  Description?: string;
  Amount: number;
  DueDate: string;
  Category?: string;
  Account?: string;
  Recurring?: boolean;
  RecurringRule?: string;
}): Promise<NotionAccountPayable> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsPayable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSPAYABLE not configured');

  const normalizedDate = normalizeDate(data.DueDate);
  if (!normalizedDate) {
    throw new Error('Data de vencimento inválida');
  }

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  // Determine status based on due date
  const dueDateObj = new Date(normalizedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = dueDateObj < today ? 'Vencido' : 'Pendente';

  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Amount: { number: data.Amount },
    DueDate: { date: { start: normalizedDate } },
    Status: { select: { name: status } },
    Paid: { checkbox: false }
  };

  if (data.Description) {
    properties.Description = { rich_text: [{ text: { content: data.Description } }] };
  }
  if (data.Category) {
    properties.Category = { select: { name: data.Category } };
  }
  if (data.Account) {
    properties.Account = { relation: [{ id: data.Account }] };
  }
  if (data.Recurring) {
    properties.Recurring = { checkbox: data.Recurring };
  }
  if (data.RecurringRule) {
    properties.RecurringRule = { rich_text: [{ text: { content: data.RecurringRule } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToAccountPayable(response);
}

/**
 * Update an account payable
 */
export async function updateAccountPayable(
  id: string,
  updates: Partial<{
    Name: string;
    Description: string;
    Amount: number;
    DueDate: string;
    PaidDate: string;
    Status: 'Pendente' | 'Pago' | 'Vencido';
    Category: string;
    Account: string;
    Paid: boolean;
    Recurring: boolean;
    RecurringRule: string;
  }>
): Promise<NotionAccountPayable> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsPayable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSPAYABLE not configured');

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: updates.Description } }] };
  }
  if (updates.Amount !== undefined) {
    properties.Amount = { number: updates.Amount };
  }
  if (updates.DueDate !== undefined) {
    const normalized = normalizeDate(updates.DueDate);
    if (normalized) {
      properties.DueDate = { date: { start: normalized } };
      // Update status if date changed
      const dueDateObj = new Date(normalized);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj < today && !updates.Paid) {
        properties.Status = { select: { name: 'Vencido' } };
      }
    }
  }
  if (updates.PaidDate !== undefined) {
    const normalized = normalizeDate(updates.PaidDate);
    if (normalized) {
      properties.PaidDate = { date: { start: normalized } };
    }
  }
  if (updates.Status !== undefined) {
    properties.Status = { select: { name: updates.Status } };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Account !== undefined) {
    if (updates.Account) {
      properties.Account = { relation: [{ id: updates.Account }] };
    } else {
      properties.Account = { relation: [] };
    }
  }
  if (updates.Paid !== undefined) {
    properties.Paid = { checkbox: updates.Paid };
    if (updates.Paid && !updates.PaidDate) {
      properties.PaidDate = { date: { start: normalizeDate(new Date().toISOString()) || '' } };
      properties.Status = { select: { name: 'Pago' } };
    }
  }
  if (updates.Recurring !== undefined) {
    properties.Recurring = { checkbox: updates.Recurring };
  }
  if (updates.RecurringRule !== undefined) {
    properties.RecurringRule = { rich_text: [{ text: { content: updates.RecurringRule } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToAccountPayable(response);
}

/**
 * Delete an account payable
 */
export async function deleteAccountPayable(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

// ============================================================================
// ACCOUNTS RECEIVABLE (Contas a Receber)
// ============================================================================

/**
 * Convert Notion page to AccountReceivable
 */
function pageToAccountReceivable(page: any): NotionAccountReceivable {
  const props = page.properties;
  
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Description: extractText(props.Description),
    Amount: extractNumber(props.Amount),
    DueDate: extractDate(props.DueDate),
    ReceivedDate: extractDate(props.ReceivedDate),
    Status: extractSelect(props.Status) as any || 'Pendente',
    Category: extractSelect(props.Category),
    Account: extractRelation(props.Account)[0] || '',
    Received: extractBoolean(props.Received),
    Recurring: extractBoolean(props.Recurring),
    RecurringRule: extractText(props.RecurringRule)
  };
}

/**
 * Get accounts receivable
 */
export async function getAccountsReceivable(filters?: {
  status?: 'Pendente' | 'Recebido' | 'Atrasado';
  received?: boolean;
  startDate?: string;
  endDate?: string;
}): Promise<NotionAccountReceivable[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsReceivable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSRECEIVABLE not configured');

  const filterConditions: any[] = [];

  if (filters?.status) {
    filterConditions.push({
      property: 'Status',
      select: { equals: filters.status }
    });
  }

  if (filters?.received !== undefined) {
    filterConditions.push({
      property: 'Received',
      checkbox: { equals: filters.received }
    });
  }

  if (filters?.startDate || filters?.endDate) {
    const dateFilter: any = { property: 'DueDate', date: {} };
    if (filters.startDate) dateFilter.date.on_or_after = filters.startDate;
    if (filters.endDate) dateFilter.date.on_or_before = filters.endDate;
    filterConditions.push(dateFilter);
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: filterConditions.length > 0 ? { and: filterConditions } : undefined
    })
  );

  return response.results.map(pageToAccountReceivable);
}

/**
 * Create an account receivable
 */
export async function createAccountReceivable(data: {
  Name: string;
  Description?: string;
  Amount: number;
  DueDate: string;
  Category?: string;
  Account?: string;
  Recurring?: boolean;
  RecurringRule?: string;
}): Promise<NotionAccountReceivable> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsReceivable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSRECEIVABLE not configured');

  const normalizedDate = normalizeDate(data.DueDate);
  if (!normalizedDate) {
    throw new Error('Data de vencimento inválida');
  }

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  // Determine status based on due date
  const dueDateObj = new Date(normalizedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = dueDateObj < today ? 'Atrasado' : 'Pendente';

  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Amount: { number: data.Amount },
    DueDate: { date: { start: normalizedDate } },
    Status: { select: { name: status } },
    Received: { checkbox: false }
  };

  if (data.Description) {
    properties.Description = { rich_text: [{ text: { content: data.Description } }] };
  }
  if (data.Category) {
    properties.Category = { select: { name: data.Category } };
  }
  if (data.Account) {
    properties.Account = { relation: [{ id: data.Account }] };
  }
  if (data.Recurring) {
    properties.Recurring = { checkbox: data.Recurring };
  }
  if (data.RecurringRule) {
    properties.RecurringRule = { rich_text: [{ text: { content: data.RecurringRule } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToAccountReceivable(response);
}

/**
 * Update an account receivable
 */
export async function updateAccountReceivable(
  id: string,
  updates: Partial<{
    Name: string;
    Description: string;
    Amount: number;
    DueDate: string;
    ReceivedDate: string;
    Status: 'Pendente' | 'Recebido' | 'Atrasado';
    Category: string;
    Account: string;
    Received: boolean;
    Recurring: boolean;
    RecurringRule: string;
  }>
): Promise<NotionAccountReceivable> {
  const client = initNotionClient();
  const dbId = getDatabaseId('AccountsReceivable');
  if (!dbId) throw new Error('NOTION_DB_ACCOUNTSRECEIVABLE not configured');

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: updates.Description } }] };
  }
  if (updates.Amount !== undefined) {
    properties.Amount = { number: updates.Amount };
  }
  if (updates.DueDate !== undefined) {
    const normalized = normalizeDate(updates.DueDate);
    if (normalized) {
      properties.DueDate = { date: { start: normalized } };
      // Update status if date changed
      const dueDateObj = new Date(normalized);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj < today && !updates.Received) {
        properties.Status = { select: { name: 'Atrasado' } };
      }
    }
  }
  if (updates.ReceivedDate !== undefined) {
    const normalized = normalizeDate(updates.ReceivedDate);
    if (normalized) {
      properties.ReceivedDate = { date: { start: normalized } };
    }
  }
  if (updates.Status !== undefined) {
    properties.Status = { select: { name: updates.Status } };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Account !== undefined) {
    if (updates.Account) {
      properties.Account = { relation: [{ id: updates.Account }] };
    } else {
      properties.Account = { relation: [] };
    }
  }
  if (updates.Received !== undefined) {
    properties.Received = { checkbox: updates.Received };
    if (updates.Received && !updates.ReceivedDate) {
      properties.ReceivedDate = { date: { start: normalizeDate(new Date().toISOString()) || '' } };
      properties.Status = { select: { name: 'Recebido' } };
    }
  }
  if (updates.Recurring !== undefined) {
    properties.Recurring = { checkbox: updates.Recurring };
  }
  if (updates.RecurringRule !== undefined) {
    properties.RecurringRule = { rich_text: [{ text: { content: updates.RecurringRule } }] };
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToAccountReceivable(response);
}

/**
 * Delete an account receivable
 */
export async function deleteAccountReceivable(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

// ============================================================================
// CATEGORIZATION RULES (Regras de Categorização Automática)
// ============================================================================

/**
 * Convert Notion page to CategorizationRule
 */
function pageToCategorizationRule(page: any): NotionCategorizationRule {
  const props = page.properties;
  
  const titlePropertyName = Object.keys(props).find(
    (key) => props[key]?.type === 'title'
  ) || 'Name';
  
  return {
    id: page.id,
    Name: extractText(props[titlePropertyName]),
    Pattern: extractText(props.Pattern),
    Category: extractSelect(props.Category) || '',
    Priority: extractNumber(props.Priority),
    Active: extractBoolean(props.Active),
    AccountType: extractSelect(props.AccountType) as any || 'Ambos'
  };
}

/**
 * Get all categorization rules
 */
export async function getCategorizationRules(activeOnly?: boolean): Promise<NotionCategorizationRule[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CategorizationRules');
  if (!dbId) {
    // Database não configurada, retornar array vazio
    return [];
  }

  const filters: any[] = [];
  if (activeOnly) {
    filters.push({
      property: 'Active',
      checkbox: { equals: true }
    });
  }

  try {
    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        filter: filters.length > 0 ? { and: filters } : undefined
      })
    );

    return response.results.map(pageToCategorizationRule).sort((a, b) => b.Priority - a.Priority);
  } catch (error: any) {
    console.warn('CategorizationRules database não encontrada ou não configurada');
    return [];
  }
}

/**
 * Create a categorization rule
 */
export async function createCategorizationRule(data: {
  Name: string;
  Pattern: string;
  Category: string;
  Priority: number;
  AccountType: 'Empresarial' | 'Pessoal' | 'Ambos';
  Active?: boolean;
}): Promise<NotionCategorizationRule> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CategorizationRules');
  if (!dbId) throw new Error('NOTION_DB_CATEGORIZATIONRULES not configured');

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {
    [titlePropertyName]: { title: [{ text: { content: data.Name } }] },
    Pattern: { rich_text: [{ text: { content: data.Pattern } }] },
    Category: { select: { name: data.Category } },
    Priority: { number: data.Priority },
    Active: { checkbox: data.Active !== undefined ? data.Active : true },
    AccountType: { select: { name: data.AccountType } }
  };

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToCategorizationRule(response);
}

/**
 * Update a categorization rule
 */
export async function updateCategorizationRule(
  id: string,
  updates: Partial<{
    Name: string;
    Pattern: string;
    Category: string;
    Priority: number;
    Active: boolean;
    AccountType: 'Empresarial' | 'Pessoal' | 'Ambos';
  }>
): Promise<NotionCategorizationRule> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CategorizationRules');
  if (!dbId) throw new Error('NOTION_DB_CATEGORIZATIONRULES not configured');

  const database = await client.databases.retrieve({ database_id: dbId });
  const titlePropertyName = Object.keys(database.properties).find(
    (key) => database.properties[key].type === 'title'
  ) || 'Name';

  const properties: any = {};

  if (updates.Name !== undefined) {
    properties[titlePropertyName] = { title: [{ text: { content: updates.Name } }] };
  }
  if (updates.Pattern !== undefined) {
    properties.Pattern = { rich_text: [{ text: { content: updates.Pattern } }] };
  }
  if (updates.Category !== undefined) {
    properties.Category = { select: { name: updates.Category } };
  }
  if (updates.Priority !== undefined) {
    properties.Priority = { number: updates.Priority };
  }
  if (updates.Active !== undefined) {
    properties.Active = { checkbox: updates.Active };
  }
  if (updates.AccountType !== undefined) {
    properties.AccountType = { select: { name: updates.AccountType } };
  }

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToCategorizationRule(response);
}

/**
 * Delete a categorization rule
 */
export async function deleteCategorizationRule(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Apply categorization rules to a transaction
 * Returns the suggested category or null
 */
export async function applyCategorizationRules(
  transactionName: string,
  accountType?: 'Empresarial' | 'Pessoal'
): Promise<string | null> {
  try {
    const rules = await getCategorizationRules(true); // Apenas regras ativas
    
    if (rules.length === 0) {
      return null;
    }

    const searchText = transactionName.toLowerCase();

    // Aplicar regras ordenadas por prioridade (maior primeiro)
    for (const rule of rules) {
      // Verificar se a regra se aplica ao tipo de conta
      if (rule.AccountType !== 'Ambos' && accountType && rule.AccountType !== accountType) {
        continue;
      }

      // Tentar como regex primeiro
      try {
        const regex = new RegExp(rule.Pattern, 'i');
        if (regex.test(searchText)) {
          return rule.Category;
        }
      } catch {
        // Se não for regex válido, tratar como texto simples
        if (searchText.includes(rule.Pattern.toLowerCase())) {
          return rule.Category;
        }
      }
    }

    return null;
  } catch (error) {
    console.warn('Erro ao aplicar regras de categorização:', error);
    return null;
  }
}

/**
 * Bulk apply categorization rules to transactions
 */
export async function bulkApplyCategorizationRules(
  transactionIds: string[]
): Promise<{ updated: number; errors: number }> {
  const client = initNotionClient();
  let updated = 0;
  let errors = 0;

  try {
    // Buscar todas as transações
    const transactions = await getTransactions({});
    const rules = await getCategorizationRules(true);

    if (rules.length === 0) {
      return { updated: 0, errors: 0 };
    }

    for (const transactionId of transactionIds) {
      try {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction || transaction.Category) {
          // Já tem categoria, pular
          continue;
        }

        // Aplicar regras
        const suggestedCategory = await applyCategorizationRules(
          transaction.Name,
          undefined // Poderia buscar o tipo da conta se necessário
        );

        if (suggestedCategory) {
          await updateTransaction(transactionId, { Category: suggestedCategory });
          updated++;
        }
      } catch (error) {
        console.error(`Erro ao aplicar regra para transação ${transactionId}:`, error);
        errors++;
      }
    }

    return { updated, errors };
  } catch (error) {
    console.error('Erro ao aplicar regras em massa:', error);
    return { updated, errors };
  }
}

