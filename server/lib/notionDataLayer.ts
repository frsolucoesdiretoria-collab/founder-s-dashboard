// FR Tech OS - Notion Data Layer
// Server-side only - handles all Notion API interactions

import { Client } from '@notionhq/client';
import { NOTION_SCHEMA, getDatabaseId } from '../../src/lib/notion/schema';
import type { 
  NotionKPI, 
  NotionGoal, 
  NotionAction, 
  NotionJournal 
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
 * Update KPI properties
 * Enforcement: If IsFinancial=true, force VisiblePublic=false server-side
 */
export async function updateKPI(
  kpiId: string,
  updates: {
    VisiblePublic?: boolean;
    VisibleAdmin?: boolean;
    SortOrder?: number;
    Active?: boolean;
    Periodicity?: string;
    ChartType?: string;
    IsFinancial?: boolean;
  }
): Promise<void> {
  const client = initNotionClient();
  
  // Get current KPI to check IsFinancial
  const dbId = getDatabaseId('KPIs');
  if (!dbId) throw new Error('NOTION_DB_KPIS not configured');
  
  const page = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: kpiId })
  );
  
  const currentKPI = pageToKPI(page);
  const willBeFinancial = updates.IsFinancial !== undefined ? updates.IsFinancial : currentKPI.IsFinancial;
  
  // Enforcement: If financial, force VisiblePublic=false
  const props: any = {};
  
  if (updates.VisiblePublic !== undefined) {
    props.VisiblePublic = { checkbox: willBeFinancial ? false : updates.VisiblePublic };
  }
  if (updates.VisibleAdmin !== undefined) props.VisibleAdmin = { checkbox: updates.VisibleAdmin };
  if (updates.SortOrder !== undefined) props.SortOrder = { number: updates.SortOrder };
  if (updates.Active !== undefined) props.Active = { checkbox: updates.Active };
  if (updates.Periodicity !== undefined) props.Periodicity = { select: { name: updates.Periodicity } };
  if (updates.ChartType !== undefined) props.ChartType = { select: { name: updates.ChartType } };
  if (updates.IsFinancial !== undefined) {
    props.IsFinancial = { checkbox: updates.IsFinancial };
    // If setting to financial, force VisiblePublic=false
    if (updates.IsFinancial) {
      props.VisiblePublic = { checkbox: false };
    }
  }

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: kpiId,
      properties: props
    })
  );
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

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    })
  );

  return response.results.map(pageToAction);
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
 * Convert Notion page to CustomerWin
 */
function pageToCustomerWin(page: any): any {
  const props = page.properties;
  const score = extractNumber(props.Score);
  return {
    id: page.id,
    Name: extractText(props.Name),
    Client: extractRelation(props.Client)[0] || '',
    Date: extractDate(props.Date),
    Description: extractText(props.Description),
    WinType: extractSelect(props.WinType),
    Evidence: extractText(props.Evidence),
    Score: score,
    UpsellRecommended: extractBoolean(props.UpsellRecommended),
    IsGOL: extractBoolean(props.IsGOL) || (score >= 8)
  };
}

/**
 * Convert Notion page to ExpansionOpportunity
 */
function pageToExpansionOpportunity(page: any): any {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    Client: extractRelation(props.Client)[0] || '',
    Type: extractSelect(props.Type),
    Status: extractSelect(props.Status),
    Stage: extractSelect(props.Stage),
    Trigger: extractSelect(props.Trigger),
    PlannedDate: extractDate(props.PlannedDate),
    Health: extractSelect(props.Health),
    Notes: extractText(props.Notes)
  };
}

/**
 * Get customer wins (optionally filtered by IsGOL and date range)
 */
export async function getCustomerWins(filters?: { isGOL?: boolean; lastDays?: number }): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CustomerWins');
  if (!dbId) throw new Error('NOTION_DB_CUSTOMERWINS not configured');

  const filter: any = {};
  
  if (filters?.isGOL !== undefined || filters?.lastDays) {
    filter.and = [];
    
    if (filters.isGOL !== undefined) {
      filter.and.push({ property: 'IsGOL', checkbox: { equals: filters.isGOL } });
    }
    
    if (filters.lastDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.lastDays);
      filter.and.push({ 
        property: 'Date', 
        date: { on_or_after: cutoffDate.toISOString().split('T')[0] }
      });
    }
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sorts: [{ property: 'Date', direction: 'descending' }]
    })
  );

  return response.results.map(pageToCustomerWin);
}

/**
 * Get expansion opportunities (optionally filtered by Stage)
 */
export async function getExpansionOpportunities(filters?: { stage?: string }): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('ExpansionOpportunities');
  if (!dbId) throw new Error('NOTION_DB_EXPANSIONOPPORTUNITIES not configured');

  const filter: any = {};
  
  if (filters?.stage) {
    filter.property = 'Stage';
    filter.select = { equals: filters.stage };
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sorts: [{ property: 'Name', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToExpansionOpportunity);
}

/**
 * Get clients
 */
export async function getClients(): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Clients');
  if (!dbId) return []; // Optional database

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId
    })
  );

  return response.results.map((page: any) => ({
    id: page.id,
    Name: extractText(page.properties.Name)
  }));
}

/**
 * Get goal by name (for finding specific goals like GOL_Moments_Detected)
 */
export async function getGoalByName(name: string): Promise<any | null> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Goals');
  if (!dbId) throw new Error('NOTION_DB_GOALS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Name',
        title: { contains: name }
      },
      page_size: 1
    })
  );

  if (response.results.length === 0) return null;
  return pageToGoal(response.results[0]);
}

/**
 * Create action
 */
export async function createAction(payload: {
  Name: string;
  Type: string;
  Date: string;
  Done?: boolean;
  Contribution?: number;
  Goal?: string;
  Client?: string;
  Notes?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Type: { select: { name: payload.Type } },
    Date: { date: { start: payload.Date } },
    Done: { checkbox: payload.Done || false },
    PublicVisible: { checkbox: false }
  };

  if (payload.Contribution !== undefined) props.Contribution = { number: payload.Contribution };
  if (payload.Goal) props.Goal = { relation: [{ id: payload.Goal }] };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };
  if (payload.Notes) props.Notes = { rich_text: [{ text: { content: payload.Notes } }] };

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
  WinType?: string;
  Evidence?: string;
  Score?: number;
  UpsellRecommended?: boolean;
  IsGOL?: boolean;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CustomerWins');
  if (!dbId) throw new Error('NOTION_DB_CUSTOMERWINS not configured');

  const score = payload.Score || 0;
  const isGOL = payload.IsGOL !== undefined ? payload.IsGOL : (score >= 8);

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Date: { date: { start: payload.Date } },
    IsGOL: { checkbox: isGOL }
  };

  if (payload.Description) props.Description = { rich_text: [{ text: { content: payload.Description } }] };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };
  if (payload.WinType) props.WinType = { select: { name: payload.WinType } };
  if (payload.Evidence) props.Evidence = { rich_text: [{ text: { content: payload.Evidence } }] };
  if (payload.Score !== undefined) props.Score = { number: payload.Score };
  if (payload.UpsellRecommended !== undefined) props.UpsellRecommended = { checkbox: payload.UpsellRecommended };

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
  Stage?: string;
  Trigger?: string;
  PlannedDate?: string;
  Health?: string;
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
  if (payload.Stage) props.Stage = { select: { name: payload.Stage } };
  if (payload.Trigger) props.Trigger = { select: { name: payload.Trigger } };
  if (payload.PlannedDate) props.PlannedDate = { date: { start: payload.PlannedDate } };
  if (payload.Health) props.Health = { select: { name: payload.Health } };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };

  const page = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties: props
    })
  );

  return page.id;
}

