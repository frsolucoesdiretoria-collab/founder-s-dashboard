// FR Tech OS - Notion Data Layer
// Server-side only - handles all Notion API interactions

import { Client } from '@notionhq/client';
import { NOTION_SCHEMA, getDatabaseId } from '../../src/lib/notion/schema';
import type { 
  NotionKPI, 
  NotionGoal, 
  NotionAction, 
  NotionJournal,
  NotionContact
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
 * Convert Notion page to Contact
 */
function pageToContact(page: any): NotionContact {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name)
  };
}

/**
 * Get all contacts (for autocomplete)
 */
export async function getContacts(): Promise<NotionContact[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) return []; // Contacts is optional

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId
    })
  );

  return response.results.map(pageToContact);
}

/**
 * Search contacts by name (for autocomplete)
 */
export async function searchContacts(query: string): Promise<NotionContact[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) return [];

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Name',
        title: {
          contains: query
        }
      }
    })
  );

  return response.results.map(pageToContact);
}

/**
 * Create a new contact
 */
export async function createContact(name: string): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const page = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: name } }] }
      }
    })
  );

  return page.id;
}

/**
 * Get KPI by name (to find Network_Coffees or similar)
 * Tries exact match first, then contains
 */
export async function getKPIByName(name: string): Promise<NotionKPI | null> {
  const client = initNotionClient();
  const dbId = getDatabaseId('KPIs');
  if (!dbId) return null;

  // Try exact match first
  const exactResponse = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Name',
        title: {
          equals: name
        }
      },
      page_size: 1
    })
  );

  if (exactResponse.results.length > 0) {
    return pageToKPI(exactResponse.results[0]);
  }

  // Fallback to contains
  const containsResponse = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Name',
        title: {
          contains: name
        }
      },
      page_size: 1
    })
  );

  if (containsResponse.results.length === 0) return null;
  return pageToKPI(containsResponse.results[0]);
}

/**
 * Get coffee goals (Goals related to Network_Coffees KPI)
 * Priority: monthly goal for current month, then annual goal for current year
 */
export async function getCoffeeGoals(): Promise<{ monthly?: NotionGoal; annual?: NotionGoal }> {
  const coffeeKPI = await getKPIByName('Network_Coffees');
  if (!coffeeKPI) return {};

  const allGoals = await getGoals();
  const coffeeGoals = allGoals.filter(g => g.KPI === coffeeKPI.id);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthly = coffeeGoals.find(g => g.Year === currentYear && g.Month === currentMonth);
  const annual = coffeeGoals.find(g => g.Year === currentYear && !g.Month);

  return { monthly, annual };
}

/**
 * Create a new action
 */
export async function createAction(payload: {
  Name: string;
  Type: 'Café' | 'Ativação de Rede' | 'Proposta' | 'Processo' | 'Rotina' | 'Automação' | 'Agente' | 'Diário';
  Date: string;
  Done: boolean;
  Contribution?: number;
  Earned?: number;
  Goal?: string;
  Contact?: string;
  Client?: string;
  Proposal?: string;
  Diagnostic?: string;
  WeekKey?: string;
  Month?: number;
  PublicVisible: boolean;
  Notes?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Type: { select: { name: payload.Type } },
    Date: { date: { start: payload.Date } },
    Done: { checkbox: payload.Done },
    PublicVisible: { checkbox: payload.PublicVisible }
  };

  if (payload.Contribution !== undefined) props.Contribution = { number: payload.Contribution };
  if (payload.Earned !== undefined) props.Earned = { number: payload.Earned };
  if (payload.Goal) props.Goal = { relation: [{ id: payload.Goal }] };
  if (payload.Contact) props.Contact = { relation: [{ id: payload.Contact }] };
  if (payload.Client) props.Client = { relation: [{ id: payload.Client }] };
  if (payload.Proposal) props.Proposal = { relation: [{ id: payload.Proposal }] };
  if (payload.Diagnostic) props.Diagnostic = { relation: [{ id: payload.Diagnostic }] };
  if (payload.WeekKey) props.WeekKey = { rich_text: [{ text: { content: payload.WeekKey } }] };
  if (payload.Month !== undefined) props.Month = { number: payload.Month };
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
 * Create coffee diagnostic (updated with all properties)
 */
export async function createCoffeeDiagnostic(payload: {
  Name: string;
  Date: string;
  Contact: string;
  Segment?: string;
  TeamSize?: number;
  Channels?: string[];
  WhatsAppPrimary?: boolean;
  ResponseSpeed?: string;
  MainPain?: string;
  Symptoms?: string;
  FunnelLeak?: string;
  Goal30?: string;
  Goal60?: string;
  Goal90?: string;
  ScopeLockAccepted: boolean;
  AdditivesPolicyAccepted: boolean;
  NextStepAgreed?: string;
  Notes?: string;
  NextSteps?: string;
}): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('CoffeeDiagnostics');
  if (!dbId) throw new Error('NOTION_DB_COFFEEDIAGNOSTICS not configured');

  const props: any = {
    Name: { title: [{ text: { content: payload.Name } }] },
    Date: { date: { start: payload.Date } },
    Contact: { relation: [{ id: payload.Contact }] },
    ScopeLockAccepted: { checkbox: payload.ScopeLockAccepted },
    AdditivesPolicyAccepted: { checkbox: payload.AdditivesPolicyAccepted }
  };

  if (payload.Segment) props.Segment = { rich_text: [{ text: { content: payload.Segment } }] };
  if (payload.TeamSize !== undefined) props.TeamSize = { number: payload.TeamSize };
  if (payload.Channels && payload.Channels.length > 0) {
    props.Channels = { multi_select: payload.Channels.map(ch => ({ name: ch })) };
  }
  if (payload.WhatsAppPrimary !== undefined) props.WhatsAppPrimary = { checkbox: payload.WhatsAppPrimary };
  if (payload.ResponseSpeed) props.ResponseSpeed = { select: { name: payload.ResponseSpeed } };
  if (payload.MainPain) props.MainPain = { rich_text: [{ text: { content: payload.MainPain } }] };
  if (payload.Symptoms) props.Symptoms = { rich_text: [{ text: { content: payload.Symptoms } }] };
  if (payload.FunnelLeak) props.FunnelLeak = { rich_text: [{ text: { content: payload.FunnelLeak } }] };
  if (payload.Goal30) props.Goal30 = { rich_text: [{ text: { content: payload.Goal30 } }] };
  if (payload.Goal60) props.Goal60 = { rich_text: [{ text: { content: payload.Goal60 } }] };
  if (payload.Goal90) props.Goal90 = { rich_text: [{ text: { content: payload.Goal90 } }] };
  if (payload.NextStepAgreed) props.NextStepAgreed = { rich_text: [{ text: { content: payload.NextStepAgreed } }] };
  if (payload.Notes) props.Notes = { rich_text: [{ text: { content: payload.Notes } }] };
  if (payload.NextSteps) props.NextSteps = { rich_text: [{ text: { content: payload.NextSteps } }] };

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

