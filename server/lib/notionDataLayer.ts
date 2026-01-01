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
  NotionProduto
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
    Name: { title: [{ text: { content: data.Name } }] },
    LastUpdate: { date: { start: normalizeDate(new Date().toISOString()) } }
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
  
  // Always update LastUpdate
  properties.LastUpdate = { date: { start: normalizeDate(new Date().toISOString()) } };

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return getCRMPipelineContactById(id);
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

