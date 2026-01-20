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
  NotionDoterraLead,
  NotionBudgetGoal,
  NotionTransaction,
  NotionGrowthProposal
} from '../../src/lib/notion/types';
import { DAILY_PROPHECY_ACTION_NAME } from '../../src/constants/dailyRoutine';

const RICH_TEXT_LIMIT = 1800; // margin to Notion 2000-char limit

function toRichTextArray(input?: string): { text: { content: string } }[] {
  if (!input) return [];
  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < input.length; i += RICH_TEXT_LIMIT) {
    chunks.push({ text: { content: input.slice(i, i + RICH_TEXT_LIMIT) } });
  }
  return chunks;
}

// Notion client instances (lazy initialization)
// We support multiple tokens (e.g. AXIS vs client workspaces like Doterra).
const notionClientsByToken = new Map<string, Client>();

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
  const token = assertEnv('NOTION_TOKEN');
  return initNotionClientWithToken(token);
}

export function initNotionClientWithToken(token: string): Client {
  const t = token?.trim();
  if (!t) {
    throw new Error('Missing Notion token');
  }
  const existing = notionClientsByToken.get(t);
  if (existing) return existing;
  const client = new Client({ auth: t });
  notionClientsByToken.set(t, client);
  return client;
}

function initDoterraNotionClient(): Client {
  const token = assertEnv('NOTION_TOKEN_DOTERRA');
  return initNotionClientWithToken(token);
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
      // Log error details for debugging
      if (attempt === 0) {
        console.error(`Notion API error (attempt ${attempt + 1}/${maxRetries}):`, {
          status: error.status,
          code: error.code,
          message: error.message,
        });
      }
      
      // Handle rate limit errors with retry
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limit hit, retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Propagate error with more context
      if (error.code === 'object_not_found') {
        error.message = `Notion database not found: ${error.message}`;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded for Notion API call');
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

type DateRange = { start: string; end: string };

const DEFAULT_CONTACT_DATE_PROP = 'Data de Referência';

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
    Attachments: extractRelation(props.Attachments),
    MorningCompletedAt: extractDate(props.MorningCompletedAt),
    NightSubmittedAt: extractDate(props.NightSubmittedAt),
    Comments: extractText(props.Comments),
    Reviewed: extractBoolean(props.Reviewed),
    ReviewedBy: extractText(props.ReviewedBy),
    ReviewedAt: extractDate(props.ReviewedAt),
    CreatedBy: extractText(props.CreatedBy),
    LastEditedBy: extractText(props.LastEditedBy)
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
 * Convert Notion page to Doterra Lead (single DB, cohort + events + approval)
 */
function pageToDoterraLead(page: any): NotionDoterraLead {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    WhatsApp: extractPhoneNumber(props.WhatsApp) || undefined,
    Cohort: extractSelect(props.Cohort) || undefined,
    MessageVariant: extractSelect(props.MessageVariant) || undefined,
    MessageText: extractText(props.MessageText) || undefined,
    Stage: extractSelect(props.Stage) || undefined,
    ApprovalStatus: extractSelect(props.ApprovalStatus) || undefined,
    SentAt: extractDate(props.SentAt) || undefined,
    DeliveredAt: extractDate(props.DeliveredAt) || undefined,
    ReadAt: extractDate(props.ReadAt) || undefined,
    RepliedAt: extractDate(props.RepliedAt) || undefined,
    InterestedAt: extractDate(props.InterestedAt) || undefined,
    ApprovedAt: extractDate(props.ApprovedAt) || undefined,
    SoldAt: extractDate(props.SoldAt) || undefined,
    LastEventAt: extractDate(props.LastEventAt) || undefined,
    Source: extractSelect(props.Source) || undefined,
    ExternalMessageId: extractText(props.ExternalMessageId) || undefined,
    ExternalLeadId: extractText(props.ExternalLeadId) || undefined,
    Notes: extractText(props.Notes) || undefined,
    Tags: extractMultiSelect(props.Tags),
    DoNotContact: extractBoolean(props.DoNotContact),
    DuplicateOf: extractText(props.DuplicateOf) || undefined,
    AssignedTo: extractSelect(props.AssignedTo) || undefined
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
  if (!dbId) {
    console.error('❌ NOTION_DB_KPIS not configured');
    throw new Error('NOTION_DB_KPIS not configured');
  }

  console.log(`🔍 Buscando KPIs públicos da database: ${dbId.substring(0, 8)}...`);

  try {
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

    const kpis = response.results.map(pageToKPI);
    console.log(`✅ Encontrados ${kpis.length} KPIs públicos`);
    
    if (kpis.length === 0) {
      console.warn('⚠️  Nenhum KPI encontrado com os filtros: Active=true, VisiblePublic=true, IsFinancial=false');
      console.warn('   Verifique se há KPIs no Notion com essas propriedades marcadas');
    }
    
    return kpis;
  } catch (error: any) {
    console.error('❌ Erro ao buscar KPIs do Notion:', error);
    if (error.code === 'object_not_found') {
      throw new Error(`Database do Notion não encontrada. Verifique se NOTION_DB_KPIS está correto e se a integração tem acesso à database.`);
    }
    if (error.status === 401) {
      throw new Error(`Token do Notion inválido ou sem permissões. Verifique o NOTION_TOKEN e se a integração tem acesso à database.`);
    }
    throw error;
  }
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

// ============================================================================
// ENZO CANEI - Dashboard de Vendas (databases separadas)
// ============================================================================

/**
 * Get Enzo's KPIs (allowing financial for his sales dashboard)
 */
export async function getKPIsEnzo(): Promise<NotionKPI[]> {
  const client = initNotionClient();
  
  // Tentar usar database específica do Enzo primeiro
  let dbId = getDatabaseId('KPIs_Enzo');
  
  // Se não estiver configurada, usar a database principal de KPIs como fallback
  if (!dbId) {
    console.warn('⚠️  NOTION_DB_KPIS_ENZO not configured, falling back to NOTION_DB_KPIS');
    dbId = getDatabaseId('KPIs');
    if (!dbId) {
      throw new Error('NOTION_DB_KPIS_ENZO and NOTION_DB_KPIS not configured');
    }
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Active',
        checkbox: { equals: true }
      },
      sorts: [{ property: 'SortOrder', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToKPI);
}

/**
 * Get Enzo's goals
 */
export async function getGoalsEnzo(range?: { start?: string; end?: string }): Promise<NotionGoal[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Goals_Enzo');
  if (!dbId) throw new Error('NOTION_DB_GOALS_ENZO not configured');

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
 * Get Enzo's actions within a date range
 */
export async function getActionsEnzo(range?: { start?: string; end?: string }): Promise<NotionAction[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions_Enzo');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS_ENZO not configured');

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
 * Ensure Enzo's action has a goal before allowing completion
 */
export async function ensureActionHasGoalEnzo(actionId: string): Promise<{ allowed: boolean; reason?: string }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions_Enzo');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS_ENZO not configured');

  const page = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: actionId })
  );

  const action = pageToAction(page);
  if (action.Name?.trim().toLowerCase() === DAILY_PROPHECY_ACTION_NAME.toLowerCase()) {
    return { allowed: true };
  }

  if (!action.Goal || action.Goal.trim() === '') {
    return {
      allowed: false,
      reason: 'Não é possível concluir uma ação sem meta associada'
    };
  }

  return { allowed: true };
}

/**
 * Toggle Enzo's action done status
 */
export async function toggleActionDoneEnzo(actionId: string, done: boolean): Promise<boolean> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions_Enzo');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS_ENZO not configured');

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
 * Create Enzo action
 */
export async function createActionEnzo(
  payload: Partial<NotionAction>
): Promise<NotionAction> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Actions_Enzo');
  if (!dbId) throw new Error('NOTION_DB_ACTIONS_ENZO not configured');

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
 * Convert Notion page to Enzo Contact
 */
function pageToContactEnzo(page: any): { id: string; Name: string; WhatsApp?: string; Status?: string; ValorVenda?: number } {
  const props = page.properties;
  
  // Extrair ValorVenda corretamente (pode ser null ou número)
  let valorVenda: number | undefined = undefined;
  if (props.ValorVenda && props.ValorVenda.number !== null && props.ValorVenda.number !== undefined) {
    valorVenda = props.ValorVenda.number;
  }
  
  return {
    id: page.id,
    Name: extractText(props.Name),
    WhatsApp: extractPhoneNumber(props.WhatsApp) || undefined,
    Status: extractSelect(props.Status) || undefined,
    ValorVenda: valorVenda
  };
}

/**
 * Get Enzo's contacts
 */
export async function getContactsEnzo(): Promise<Array<{ id: string; Name: string; WhatsApp?: string; Status?: string; ValorVenda?: number }>> {
  try {
    const client = initNotionClient();
    const dbId = getDatabaseId('Contacts_Enzo');
    if (!dbId) {
      console.error('❌ NOTION_DB_CONTACTS_ENZO not configured');
      throw new Error('NOTION_DB_CONTACTS_ENZO not configured');
    }

    console.log(`📥 getContactsEnzo: Buscando contatos da database ${dbId}`);

    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        sorts: [{ property: 'DateCreated', direction: 'descending' }]
      })
    );

    console.log(`✅ getContactsEnzo: Encontrados ${response.results.length} contatos na database`);

    const contacts = response.results.map(pageToContactEnzo);
    
    // Log detalhado dos primeiros 5 contatos para debug
    contacts.slice(0, 5).forEach((contact, index) => {
      console.log(`  📋 Contato ${index + 1}: ID=${contact.id}, Nome="${contact.Name || '(vazio)'}", Status="${contact.Status || '(vazio)'}", ValorVenda=${contact.ValorVenda || '(vazio)'}`);
    });

    return contacts;
  } catch (error: any) {
    console.error('❌ Erro em getContactsEnzo:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

/**
 * Create Enzo contact
 */
export async function createContactEnzo(name: string = '', whatsapp?: string): Promise<{ id: string; Name: string; WhatsApp?: string; Status?: string; ValorVenda?: number }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts_Enzo');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS_ENZO not configured');

  const today = new Date().toISOString().split('T')[0];
  const safeName = typeof name === 'string' ? name.trim() : '';
  const isComplete = !!(safeName && whatsapp);

  const properties: any = {
    Name: safeName ? { title: [{ text: { content: safeName } }] } : { title: [] },
    DateCreated: { date: { start: today } },
    Complete: { checkbox: isComplete }
  };

  if (whatsapp) {
    properties.WhatsApp = { phone_number: whatsapp };
  }

  // Tentar adicionar Status padrão (pode falhar se campo não existir)
  try {
    properties.Status = { select: { name: 'Contato Ativado' } };
  } catch (err) {
    // Campo Status não existe ainda, ignorar
    console.warn('Campo Status não existe na database Contacts_Enzo. Adicione manualmente no Notion.');
  }

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToContactEnzo(response);
}

/**
 * Update Enzo contact
 */
export async function updateContactEnzo(id: string, updates: { name?: string; whatsapp?: string; status?: string; saleValue?: number }): Promise<{ id: string; Name: string; WhatsApp?: string; Status?: string; ValorVenda?: number }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts_Enzo');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS_ENZO not configured');

  const properties: any = {};

  if (updates.name !== undefined) {
    const normalizedName = updates.name.trim();
    properties.Name = normalizedName
      ? { title: [{ text: { content: normalizedName } }] }
      : { title: [] };
  }

  if (updates.whatsapp !== undefined) {
    if (updates.whatsapp) {
      properties.WhatsApp = { phone_number: updates.whatsapp };
    } else {
      properties.WhatsApp = { phone_number: null };
    }
  }

  if (updates.status !== undefined) {
    try {
      // Migrar status antigos para novos
      let normalizedStatus = updates.status;
      if (normalizedStatus === 'Proposta Enviada' || normalizedStatus === 'Venda Fechada') {
        normalizedStatus = 'Venda Feita';
      }
      
      if (normalizedStatus) {
        properties.Status = { select: { name: normalizedStatus } };
      } else {
        properties.Status = { select: null };
      }
    } catch (err) {
      // Se o campo Status não existe, apenas logar e continuar sem atualizar
      console.warn('⚠️  Campo Status não existe na database Contacts_Enzo. Adicione um campo Select chamado "Status" com as opções: Contato Ativado, Café Agendado, Café Executado, Venda Feita');
    }
  }

  if (updates.saleValue !== undefined) {
    // Verificar se o campo ValorVenda existe antes de tentar salvar
    try {
      const database = await client.databases.retrieve({ database_id: dbId });
      const hasValorVendaField = database.properties.ValorVenda?.type === 'number';
      
      if (!hasValorVendaField) {
        console.warn('⚠️  Campo ValorVenda não existe. Tentando criar automaticamente...');
        try {
          // Criar o campo ValorVenda automaticamente
          // Formato 'real' é para Real brasileiro (BRL)
          await client.databases.update({
            database_id: dbId,
            properties: {
              ValorVenda: {
                number: {
                  format: 'real'
                }
              }
            }
          });
          console.log('✅ Campo ValorVenda criado com sucesso.');
        } catch (createErr: any) {
          console.error('❌ Erro ao criar campo ValorVenda automaticamente:', createErr.message);
          throw new Error(`Campo ValorVenda não existe e não foi possível criá-lo automaticamente: ${createErr.message}`);
        }
      }
      
      // Agora que o campo existe, definir o valor
      if (updates.saleValue === null) {
        properties.ValorVenda = { number: null };
        console.log(`💰 Setting ValorVenda to null for contact ${id}`);
      } else if (typeof updates.saleValue === 'number') {
        properties.ValorVenda = { number: updates.saleValue };
        console.log(`💰 Setting ValorVenda to ${updates.saleValue} for contact ${id}`);
      }
    } catch (err: any) {
      console.error('❌ Erro ao preparar ValorVenda:', err.message);
      throw err; // Re-throw para que seja tratado na rota
    }
  }

  // Update Complete status based on current values
  // We need to get current page to check both fields
  const currentPage = await retryWithBackoff(() =>
    client.pages.retrieve({ page_id: id })
  );
  
  const currentContact = pageToContactEnzo(currentPage);
  const newName = updates.name !== undefined ? updates.name : currentContact.Name;
  const newWhatsApp = updates.whatsapp !== undefined ? updates.whatsapp : currentContact.WhatsApp;
  const isComplete = !!(newName && newWhatsApp);
  
  properties.Complete = { checkbox: isComplete };

  const response = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  const updated = pageToContactEnzo(response);
  
  // Se atualizou o status, garantir que está no retorno (com normalização)
  if (updates.status !== undefined) {
    let normalizedStatus = updates.status;
    if (normalizedStatus === 'Proposta Enviada' || normalizedStatus === 'Venda Fechada') {
      normalizedStatus = 'Venda Feita';
    }
    updated.Status = normalizedStatus;
  }
  
  // Se atualizou o valor da venda, usar o valor que foi salvo no Notion
  // O valor já deve estar em updated.ValorVenda após pageToContactEnzo processar a resposta
  // Mas vamos garantir que está correto
  if (updates.saleValue !== undefined) {
    // Ler o valor diretamente da resposta do Notion
    const savedValue = response.properties.ValorVenda?.number;
    if (savedValue !== null && savedValue !== undefined) {
      updated.ValorVenda = savedValue;
    } else {
      updated.ValorVenda = undefined;
    }
    console.log('✅ Contact updated in Notion. ValorVenda salvo:', savedValue, 'ValorVenda no retorno:', updated.ValorVenda);
  }
  
  return updated;
}

/**
 * Delete Enzo contact
 */
export async function deleteContactEnzo(id: string): Promise<void> {
  const client = initNotionClient();

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
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
  if (action.Name?.trim().toLowerCase() === DAILY_PROPHECY_ACTION_NAME.toLowerCase()) {
    return { allowed: true };
  }

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
    if (!updates.Priority || updates.Priority === null) {
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
 * List journals with date range and pagination
 */
export async function getJournals(params: {
  start?: string;
  end?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: NotionJournal[]; hasMore: boolean; nextCursor?: string }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Journal');
  if (!dbId) throw new Error('NOTION_DB_JOURNAL not configured');

  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 30;

  const filter: any = {};
  if (params.start || params.end) {
    filter.and = [];
    if (params.start) filter.and.push({ property: 'Date', date: { on_or_after: params.start } });
    if (params.end) filter.and.push({ property: 'Date', date: { on_or_before: params.end } });
  }

  let hasMore = true;
  let nextCursor: string | undefined;
  let collected: any[] = [];

  while (hasMore && collected.length < page * pageSize) {
    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: Math.min(100, pageSize),
        start_cursor: nextCursor
      })
    );

    collected = collected.concat(response.results);
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  const startIndex = (page - 1) * pageSize;
  const paged = collected.slice(startIndex, startIndex + pageSize).map(pageToJournal);

  return {
    items: paged,
    hasMore: hasMore || (collected.length > startIndex + pageSize),
    nextCursor
  };
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
    if (payload.Summary !== undefined) updateProps.Summary = { rich_text: toRichTextArray(payload.Summary) };
    if (payload.WhatWorked !== undefined) updateProps.WhatWorked = { rich_text: toRichTextArray(payload.WhatWorked) };
    if (payload.WhatFailed !== undefined) updateProps.WhatFailed = { rich_text: toRichTextArray(payload.WhatFailed) };
    if (payload.Insights !== undefined) updateProps.Insights = { rich_text: toRichTextArray(payload.Insights) };
    if (payload.Objections !== undefined) updateProps.Objections = { rich_text: toRichTextArray(payload.Objections) };
    if (payload.ProcessIdeas !== undefined) updateProps.ProcessIdeas = { rich_text: toRichTextArray(payload.ProcessIdeas) };
    if (payload.Comments !== undefined) updateProps.Comments = { rich_text: toRichTextArray(payload.Comments) };
    if (payload.Reviewed !== undefined) updateProps.Reviewed = { checkbox: payload.Reviewed };
    if (payload.ReviewedBy !== undefined) updateProps.ReviewedBy = { rich_text: toRichTextArray(payload.ReviewedBy) };
    if (payload.ReviewedAt !== undefined) updateProps.ReviewedAt = { date: payload.ReviewedAt ? { start: payload.ReviewedAt } : null };
    if (payload.MorningCompletedAt !== undefined) updateProps.MorningCompletedAt = { date: payload.MorningCompletedAt ? { start: payload.MorningCompletedAt } : null };
    if (payload.NightSubmittedAt !== undefined) updateProps.NightSubmittedAt = { date: payload.NightSubmittedAt ? { start: payload.NightSubmittedAt } : null };
    if (payload.CreatedBy !== undefined) updateProps.CreatedBy = { rich_text: toRichTextArray(payload.CreatedBy) };
    if (payload.LastEditedBy !== undefined) updateProps.LastEditedBy = { rich_text: toRichTextArray(payload.LastEditedBy) };
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

    if (payload.Summary) createProps.Summary = { rich_text: toRichTextArray(payload.Summary) };
    if (payload.WhatWorked) createProps.WhatWorked = { rich_text: toRichTextArray(payload.WhatWorked) };
    if (payload.WhatFailed) createProps.WhatFailed = { rich_text: toRichTextArray(payload.WhatFailed) };
    if (payload.Insights) createProps.Insights = { rich_text: toRichTextArray(payload.Insights) };
    if (payload.Objections) createProps.Objections = { rich_text: toRichTextArray(payload.Objections) };
    if (payload.ProcessIdeas) createProps.ProcessIdeas = { rich_text: toRichTextArray(payload.ProcessIdeas) };
    if (payload.Comments) createProps.Comments = { rich_text: toRichTextArray(payload.Comments) };
    if (payload.Reviewed !== undefined) createProps.Reviewed = { checkbox: payload.Reviewed };
    if (payload.ReviewedBy) createProps.ReviewedBy = { rich_text: toRichTextArray(payload.ReviewedBy) };
    if (payload.ReviewedAt) createProps.ReviewedAt = { date: { start: payload.ReviewedAt } };
    if (payload.MorningCompletedAt) createProps.MorningCompletedAt = { date: { start: payload.MorningCompletedAt } };
    if (payload.NightSubmittedAt) createProps.NightSubmittedAt = { date: { start: payload.NightSubmittedAt } };
    if (payload.CreatedBy) createProps.CreatedBy = { rich_text: toRichTextArray(payload.CreatedBy) };
    if (payload.LastEditedBy) createProps.LastEditedBy = { rich_text: toRichTextArray(payload.LastEditedBy) };
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
,
  options?: { notionToken?: string; client?: Client }
): Promise<any> {
  const client = options?.client
    ? options.client
    : options?.notionToken
      ? initNotionClientWithToken(options.notionToken)
      : initNotionClient();

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
          database_id: prop.relation.database_id
        };
        // Configurar tipo de relação
        if (prop.relation.type === 'dual_property') {
          baseProperty.relation.dual_property = {};
        } else {
          // single_property é o padrão
          baseProperty.relation.single_property = {};
        }
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
 * Find the first date property in a database (if any)
 */
async function getFirstDatePropertyName(databaseId: string): Promise<string | null> {
  const client = initNotionClient();
  const database = await retryWithBackoff(() =>
    client.databases.retrieve({ database_id: databaseId })
  ) as any;

  const entry = Object.entries(database.properties || {}).find(
    ([, prop]: any) => prop?.type === 'date'
  );

  return entry ? entry[0] : null;
}

/**
 * Ensure Contacts database has at least one date property.
 * If none exists, create "Data de Referência" and return its name.
 */
export async function ensureContactsDateProperty(): Promise<string> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');

  const existing = await getFirstDatePropertyName(dbId);
  if (existing) return existing;

  await retryWithBackoff(() =>
    client.databases.update({
      database_id: dbId,
      properties: {
        [DEFAULT_CONTACT_DATE_PROP]: { date: {} }
      }
    })
  );

  return DEFAULT_CONTACT_DATE_PROP;
}

/**
 * Count contacts by Status within a date range, creating a date property if needed.
 * Falls back to created_time if the date property is empty on some pages.
 */
export async function countContactsByStatusAndDate(
  statuses: string[],
  range: DateRange
): Promise<{ count: number; dateProperty: string }> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Contacts');
  if (!dbId) throw new Error('NOTION_DB_CONTACTS not configured');
  if (!range?.start || !range?.end) {
    throw new Error('range.start and range.end are required for counting contacts');
  }

  const dateProperty = await ensureContactsDateProperty();

  if (!statuses || statuses.length === 0) {
    return { count: 0, dateProperty };
  }

  const statusFilters = statuses.map(name => ({
    property: 'Status',
    select: { equals: name }
  }));

  const statusFilter =
    statusFilters.length === 1 ? statusFilters[0] : { or: statusFilters };

  // Usar apenas property filter para data (mais compatível)
  const dateFilter = {
    property: dateProperty,
    date: { on_or_after: range.start, on_or_before: range.end }
  };

  let total = 0;
  let nextCursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        filter: { and: [statusFilter, dateFilter] },
        page_size: 100,
        start_cursor: nextCursor
      })
    );

    total += response.results.length;
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  return { count: total, dateProperty };
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

function getDoterraDbId(): string {
  const dbId = getDatabaseId('DoterraLeads');
  if (!dbId) throw new Error('NOTION_DB_DOTERRA_LEADS not configured');
  return dbId;
}

type DoterraLeadQuery = {
  cohort?: string;
  stage?: string;
  approvalStatus?: string;
  search?: string;
};

async function queryDoterraLeadsRaw(params: DoterraLeadQuery = {}): Promise<any[]> {
  const client = initDoterraNotionClient();
  const dbId = getDoterraDbId();

  const andFilters: any[] = [];
  if (params.cohort) andFilters.push({ property: 'Cohort', select: { equals: params.cohort } });
  if (params.stage) andFilters.push({ property: 'Stage', select: { equals: params.stage } });
  if (params.approvalStatus) andFilters.push({ property: 'ApprovalStatus', select: { equals: params.approvalStatus } });
  if (params.search && params.search.trim().length > 0) {
    andFilters.push({ property: 'Name', title: { contains: params.search.trim() } });
  }

  const filter = andFilters.length > 0 ? { and: andFilters } : undefined;

  const results: any[] = [];
  let nextCursor: string | undefined = undefined;
  do {
    const response = await retryWithBackoff(() =>
      client.databases.query({
        database_id: dbId,
        filter,
        sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
        start_cursor: nextCursor
      } as any)
    );
    results.push(...response.results);
    nextCursor = response.has_more ? (response.next_cursor as string | undefined) : undefined;
  } while (nextCursor);

  return results;
}

export async function getDoterraLeads(params: DoterraLeadQuery = {}): Promise<NotionDoterraLead[]> {
  const pages = await queryDoterraLeadsRaw(params);
  return pages.map(pageToDoterraLead);
}

export async function getDoterraLeadById(id: string): Promise<NotionDoterraLead> {
  const client = initDoterraNotionClient();
  const page = await retryWithBackoff(() => client.pages.retrieve({ page_id: id })) as any;
  return pageToDoterraLead(page);
}

export async function findDoterraLeadByWhatsApp(whatsapp: string): Promise<NotionDoterraLead | null> {
  const client = initDoterraNotionClient();
  const dbId = getDoterraDbId();
  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: { property: 'WhatsApp', phone_number: { equals: whatsapp } }
    } as any)
  );
  const first = response.results?.[0];
  return first ? pageToDoterraLead(first) : null;
}

export async function createDoterraLead(data: Partial<NotionDoterraLead> & { Name: string }): Promise<NotionDoterraLead> {
  const client = initDoterraNotionClient();
  const dbId = getDoterraDbId();

  const properties: any = {
    Name: { title: [{ text: { content: data.Name } }] }
  };

  if (data.WhatsApp) properties.WhatsApp = { phone_number: data.WhatsApp };
  if (data.Cohort) properties.Cohort = { select: { name: data.Cohort } };
  if (data.MessageVariant) properties.MessageVariant = { select: { name: data.MessageVariant } };
  if (data.MessageText !== undefined) properties.MessageText = { rich_text: data.MessageText ? toRichTextArray(data.MessageText) : [] };
  if (data.Stage) properties.Stage = { select: { name: data.Stage } };
  if (data.ApprovalStatus) properties.ApprovalStatus = { select: { name: data.ApprovalStatus } };

  if (data.SentAt) properties.SentAt = { date: { start: data.SentAt } };
  if (data.DeliveredAt) properties.DeliveredAt = { date: { start: data.DeliveredAt } };
  if (data.ReadAt) properties.ReadAt = { date: { start: data.ReadAt } };
  if (data.RepliedAt) properties.RepliedAt = { date: { start: data.RepliedAt } };
  if (data.InterestedAt) properties.InterestedAt = { date: { start: data.InterestedAt } };
  if (data.ApprovedAt) properties.ApprovedAt = { date: { start: data.ApprovedAt } };
  if (data.SoldAt) properties.SoldAt = { date: { start: data.SoldAt } };
  if (data.LastEventAt) properties.LastEventAt = { date: { start: data.LastEventAt } };

  if (data.Source) properties.Source = { select: { name: data.Source } };
  if (data.ExternalMessageId !== undefined) properties.ExternalMessageId = { rich_text: data.ExternalMessageId ? toRichTextArray(data.ExternalMessageId) : [] };
  if (data.ExternalLeadId !== undefined) properties.ExternalLeadId = { rich_text: data.ExternalLeadId ? toRichTextArray(data.ExternalLeadId) : [] };
  if (data.Notes !== undefined) properties.Notes = { rich_text: data.Notes ? toRichTextArray(data.Notes) : [] };
  if (data.Tags) properties.Tags = { multi_select: data.Tags.map(name => ({ name })) };
  if (data.DoNotContact !== undefined) properties.DoNotContact = { checkbox: !!data.DoNotContact };
  if (data.DuplicateOf !== undefined) properties.DuplicateOf = { rich_text: data.DuplicateOf ? toRichTextArray(data.DuplicateOf) : [] };
  if (data.AssignedTo) properties.AssignedTo = { select: { name: data.AssignedTo } };

  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToDoterraLead(response);
}

export async function updateDoterraLead(
  id: string,
  updates: Partial<NotionDoterraLead>
): Promise<NotionDoterraLead> {
  const client = initDoterraNotionClient();
  const properties: any = {};

  if (updates.Name !== undefined) properties.Name = { title: [{ text: { content: updates.Name || '' } }] };
  if (updates.WhatsApp !== undefined) properties.WhatsApp = updates.WhatsApp ? { phone_number: updates.WhatsApp } : { phone_number: null };

  if (updates.Cohort !== undefined) properties.Cohort = updates.Cohort ? { select: { name: updates.Cohort } } : { select: null };
  if (updates.MessageVariant !== undefined) properties.MessageVariant = updates.MessageVariant ? { select: { name: updates.MessageVariant } } : { select: null };
  if (updates.MessageText !== undefined) properties.MessageText = { rich_text: updates.MessageText ? toRichTextArray(updates.MessageText) : [] };
  if (updates.Stage !== undefined) properties.Stage = updates.Stage ? { select: { name: updates.Stage } } : { select: null };
  if (updates.ApprovalStatus !== undefined) properties.ApprovalStatus = updates.ApprovalStatus ? { select: { name: updates.ApprovalStatus } } : { select: null };

  const dateProps: Array<keyof NotionDoterraLead> = [
    'SentAt','DeliveredAt','ReadAt','RepliedAt','InterestedAt','ApprovedAt','SoldAt','LastEventAt'
  ];
  for (const key of dateProps) {
    if (updates[key] !== undefined) {
      properties[key] = updates[key] ? { date: { start: updates[key] as string } } : { date: null };
    }
  }

  if (updates.Source !== undefined) properties.Source = updates.Source ? { select: { name: updates.Source } } : { select: null };
  if (updates.ExternalMessageId !== undefined) properties.ExternalMessageId = { rich_text: updates.ExternalMessageId ? toRichTextArray(updates.ExternalMessageId) : [] };
  if (updates.ExternalLeadId !== undefined) properties.ExternalLeadId = { rich_text: updates.ExternalLeadId ? toRichTextArray(updates.ExternalLeadId) : [] };
  if (updates.Notes !== undefined) properties.Notes = { rich_text: updates.Notes ? toRichTextArray(updates.Notes) : [] };
  if (updates.Tags !== undefined) properties.Tags = { multi_select: (updates.Tags || []).map(name => ({ name })) };
  if (updates.DoNotContact !== undefined) properties.DoNotContact = { checkbox: !!updates.DoNotContact };
  if (updates.DuplicateOf !== undefined) properties.DuplicateOf = { rich_text: updates.DuplicateOf ? toRichTextArray(updates.DuplicateOf) : [] };
  if (updates.AssignedTo !== undefined) properties.AssignedTo = updates.AssignedTo ? { select: { name: updates.AssignedTo } } : { select: null };

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return getDoterraLeadById(id);
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
 * Extract email from Notion property
 */
function extractEmail(property: any): string {
  if (!property || !property.email) return '';
  return property.email || '';
}

/**
 * Extract URL from Notion property
 */
function extractUrl(property: any): string {
  if (!property || !property.url) return '';
  return property.url || '';
}

/**
 * Convert Notion page to GrowthProposal
 */
function pageToGrowthProposal(page: any): NotionGrowthProposal {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Name),
    ProposalNumber: extractText(props.ProposalNumber),
    Date: extractDate(props.Date) || new Date().toISOString().split('T')[0],
    ValidUntil: extractDate(props.ValidUntil),
    Status: (extractSelect(props.Status) as any) || 'Em criação',
    
    // Cliente
    ClientName: extractText(props.ClientName) || '',
    ClientCompany: extractText(props.ClientCompany),
    ClientCNPJ: extractText(props.ClientCNPJ),
    ClientAddress: extractText(props.ClientAddress),
    ClientCity: extractText(props.ClientCity),
    ClientState: extractText(props.ClientState),
    ClientCEP: extractText(props.ClientCEP),
    ClientPhone: extractPhoneNumber(props.ClientPhone),
    ClientEmail: extractEmail(props.ClientEmail),
    
    // Valores
    Subtotal: extractNumber(props.Subtotal),
    DiscountPercent: extractNumber(props.DiscountPercent),
    DiscountAmount: extractNumber(props.DiscountAmount),
    TaxPercent: extractNumber(props.TaxPercent),
    TaxAmount: extractNumber(props.TaxAmount),
    Total: extractNumber(props.Total) || 0,
    
    // Dados estruturados (JSON)
    Services: extractText(props.Services),
    PaymentTerms: extractText(props.PaymentTerms),
    
    // Observações
    Observations: extractText(props.Observations),
    MaterialsNotIncluded: extractText(props.MaterialsNotIncluded),
    
    // Relações
    RelatedContact: extractRelation(props.RelatedContact)?.[0],
    RelatedClient: extractRelation(props.RelatedClient)?.[0],
    RelatedCoffeeDiagnostic: extractRelation(props.RelatedCoffeeDiagnostic)?.[0],
    
    // Follow-up
    SentAt: extractDate(props.SentAt),
    ApprovedAt: extractDate(props.ApprovedAt),
    RejectedAt: extractDate(props.RejectedAt),
    RejectionReason: extractText(props.RejectionReason),
    
    // Anexos
    PDFUrl: extractUrl(props.PDFUrl)
  };
}

/**
 * Get all growth proposals
 */
export async function getGrowthProposals(): Promise<NotionGrowthProposal[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('GrowthProposals');
  if (!dbId) throw new Error('NOTION_DB_GROWTHPROPOSALS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Date', direction: 'descending' }]
    })
  );

  return response.results.map(pageToGrowthProposal);
}

/**
 * Get growth proposal by ID
 */
export async function getGrowthProposalById(id: string): Promise<NotionGrowthProposal> {
  const client = initNotionClient();
  const page = await retryWithBackoff(() => client.pages.retrieve({ page_id: id })) as any;
  return pageToGrowthProposal(page);
}

/**
 * Create growth proposal
 */
export async function createGrowthProposal(data: Partial<NotionGrowthProposal>): Promise<NotionGrowthProposal> {
  const client = initNotionClient();
  const dbId = getDatabaseId('GrowthProposals');
  if (!dbId) throw new Error('NOTION_DB_GROWTHPROPOSALS not configured');

  const properties: any = {
    Name: { title: [{ text: { content: data.Name || 'Nova Proposta' } }] },
    Status: { select: { name: data.Status || 'Em criação' } },
    Total: { number: data.Total || 0 },
    // Obrigatórios
    Date: { date: { start: normalizeDate(data.Date || new Date().toISOString().split('T')[0]) } },
    ClientName: { rich_text: [{ text: { content: data.ClientName || '' } }] }
  };
  if (data.ValidUntil) properties.ValidUntil = { date: { start: normalizeDate(data.ValidUntil) } };

  // Número
  if (data.ProposalNumber) properties.ProposalNumber = { rich_text: [{ text: { content: data.ProposalNumber } }] };

  // Cliente - ClientName já está acima como obrigatório
  if (data.ClientCompany) properties.ClientCompany = { rich_text: [{ text: { content: data.ClientCompany } }] };
  if (data.ClientCNPJ) properties.ClientCNPJ = { rich_text: [{ text: { content: data.ClientCNPJ } }] };
  if (data.ClientAddress) properties.ClientAddress = { rich_text: [{ text: { content: data.ClientAddress } }] };
  if (data.ClientCity) properties.ClientCity = { rich_text: [{ text: { content: data.ClientCity } }] };
  if (data.ClientState) properties.ClientState = { rich_text: [{ text: { content: data.ClientState } }] };
  if (data.ClientCEP) properties.ClientCEP = { rich_text: [{ text: { content: data.ClientCEP } }] };
  if (data.ClientPhone) properties.ClientPhone = { phone_number: data.ClientPhone };
  if (data.ClientEmail) properties.ClientEmail = { email: data.ClientEmail };

  // Valores
  if (data.Subtotal !== undefined) properties.Subtotal = { number: data.Subtotal };
  if (data.DiscountPercent !== undefined) properties.DiscountPercent = { number: data.DiscountPercent };
  if (data.DiscountAmount !== undefined) properties.DiscountAmount = { number: data.DiscountAmount };
  if (data.TaxPercent !== undefined) properties.TaxPercent = { number: data.TaxPercent };
  if (data.TaxAmount !== undefined) properties.TaxAmount = { number: data.TaxAmount };

  // JSON fields
  if (data.Services) properties.Services = { rich_text: [{ text: { content: data.Services } }] };
  if (data.PaymentTerms) properties.PaymentTerms = { rich_text: [{ text: { content: data.PaymentTerms } }] };

  // Observações
  if (data.Observations) properties.Observations = { rich_text: toRichTextArray(data.Observations) };
  if (data.MaterialsNotIncluded) properties.MaterialsNotIncluded = { rich_text: toRichTextArray(data.MaterialsNotIncluded) };

    // Relações - só adiciona se a propriedade existir (evita erro)
    // Se RelatedContact não existir na database, simplesmente não envia
    if (data.RelatedContact) {
      try {
        properties.RelatedContact = { relation: [{ id: data.RelatedContact }] };
      } catch {
        // Ignore if relation property doesn't exist
      }
    }
    if (data.RelatedClient) {
      try {
        properties.RelatedClient = { relation: [{ id: data.RelatedClient }] };
      } catch {
        // Ignore if relation property doesn't exist
      }
    }
    if (data.RelatedCoffeeDiagnostic) {
      try {
        properties.RelatedCoffeeDiagnostic = { relation: [{ id: data.RelatedCoffeeDiagnostic }] };
      } catch {
        // Ignore if relation property doesn't exist
      }
    }

  // Follow-up dates
  if (data.SentAt) properties.SentAt = { date: { start: normalizeDate(data.SentAt) } };
  if (data.ApprovedAt) properties.ApprovedAt = { date: { start: normalizeDate(data.ApprovedAt) } };
  if (data.RejectedAt) properties.RejectedAt = { date: { start: normalizeDate(data.RejectedAt) } };
  if (data.RejectionReason) properties.RejectionReason = { rich_text: toRichTextArray(data.RejectionReason) };

  // PDF
  if (data.PDFUrl) properties.PDFUrl = { url: data.PDFUrl };

  // All properties should now exist in the database (created via setup script)
  // Just create the page with all properties
  const response = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToGrowthProposal(response);
}

/**
 * Update growth proposal
 */
export async function updateGrowthProposal(
  id: string,
  updates: Partial<NotionGrowthProposal>
): Promise<NotionGrowthProposal> {
  const client = initNotionClient();
  const properties: any = {};

  if (updates.Name) properties.Name = { title: [{ text: { content: updates.Name } }] };
  if (updates.Status) properties.Status = { select: { name: updates.Status } };
  if (updates.ProposalNumber) properties.ProposalNumber = { rich_text: [{ text: { content: updates.ProposalNumber } }] };
  
  if (updates.Date) properties.Date = { date: { start: normalizeDate(updates.Date) } };
  if (updates.ValidUntil) properties.ValidUntil = { date: { start: normalizeDate(updates.ValidUntil) } };
  
  if (updates.ClientName) properties.ClientName = { rich_text: [{ text: { content: updates.ClientName } }] };
  if (updates.ClientCompany !== undefined) properties.ClientCompany = { rich_text: [{ text: { content: updates.ClientCompany || '' } }] };
  if (updates.ClientCNPJ !== undefined) properties.ClientCNPJ = { rich_text: [{ text: { content: updates.ClientCNPJ || '' } }] };
  if (updates.ClientAddress !== undefined) properties.ClientAddress = { rich_text: [{ text: { content: updates.ClientAddress || '' } }] };
  if (updates.ClientCity !== undefined) properties.ClientCity = { rich_text: [{ text: { content: updates.ClientCity || '' } }] };
  if (updates.ClientState !== undefined) properties.ClientState = { rich_text: [{ text: { content: updates.ClientState || '' } }] };
  if (updates.ClientCEP !== undefined) properties.ClientCEP = { rich_text: [{ text: { content: updates.ClientCEP || '' } }] };
  if (updates.ClientPhone !== undefined) properties.ClientPhone = { phone_number: updates.ClientPhone || null };
  if (updates.ClientEmail !== undefined) properties.ClientEmail = { email: updates.ClientEmail || null };
  
  if (updates.Subtotal !== undefined) properties.Subtotal = { number: updates.Subtotal };
  if (updates.DiscountPercent !== undefined) properties.DiscountPercent = { number: updates.DiscountPercent };
  if (updates.DiscountAmount !== undefined) properties.DiscountAmount = { number: updates.DiscountAmount };
  if (updates.TaxPercent !== undefined) properties.TaxPercent = { number: updates.TaxPercent };
  if (updates.TaxAmount !== undefined) properties.TaxAmount = { number: updates.TaxAmount };
  if (updates.Total !== undefined) properties.Total = { number: updates.Total };
  
  if (updates.Services) properties.Services = { rich_text: [{ text: { content: updates.Services } }] };
  if (updates.PaymentTerms) properties.PaymentTerms = { rich_text: [{ text: { content: updates.PaymentTerms } }] };
  
  if (updates.Observations !== undefined) properties.Observations = { rich_text: updates.Observations ? toRichTextArray(updates.Observations) : [] };
  if (updates.MaterialsNotIncluded !== undefined) properties.MaterialsNotIncluded = { rich_text: updates.MaterialsNotIncluded ? toRichTextArray(updates.MaterialsNotIncluded) : [] };
  
  if (updates.RelatedContact !== undefined) {
    if (updates.RelatedContact) {
      properties.RelatedContact = { relation: [{ id: updates.RelatedContact }] };
    } else {
      properties.RelatedContact = { relation: [] };
    }
  }
  if (updates.RelatedClient !== undefined) {
    if (updates.RelatedClient) {
      properties.RelatedClient = { relation: [{ id: updates.RelatedClient }] };
    } else {
      properties.RelatedClient = { relation: [] };
    }
  }
  if (updates.RelatedCoffeeDiagnostic !== undefined) {
    if (updates.RelatedCoffeeDiagnostic) {
      properties.RelatedCoffeeDiagnostic = { relation: [{ id: updates.RelatedCoffeeDiagnostic }] };
    } else {
      properties.RelatedCoffeeDiagnostic = { relation: [] };
    }
  }
  
  if (updates.SentAt) properties.SentAt = { date: { start: normalizeDate(updates.SentAt) } };
  if (updates.ApprovedAt) properties.ApprovedAt = { date: { start: normalizeDate(updates.ApprovedAt) } };
  if (updates.RejectedAt) properties.RejectedAt = { date: { start: normalizeDate(updates.RejectedAt) } };
  if (updates.RejectionReason !== undefined) properties.RejectionReason = { rich_text: updates.RejectionReason ? toRichTextArray(updates.RejectionReason) : [] };
  
  if (updates.PDFUrl !== undefined) properties.PDFUrl = { url: updates.PDFUrl || null };

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return getGrowthProposalById(id);
}

/**
 * Delete growth proposal
 */
export async function deleteGrowthProposal(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * Ensure GrowthProposals database has all required properties
 * Creates missing properties automatically
 */
export async function ensureGrowthProposalsSchema(): Promise<{
  created: string[];
  skipped: string[];
  errors: { property: string; error: string }[];
}> {
  const client = initNotionClient();
  const dbId = getDatabaseId('GrowthProposals');
  if (!dbId) {
    throw new Error('NOTION_DB_GROWTHPROPOSALS not configured');
  }

  // Get current database structure
  let db: any;
  try {
    db = await retryWithBackoff(() =>
      client.databases.retrieve({ database_id: dbId })
    );
  } catch (error: any) {
    throw new Error(`Failed to retrieve database: ${error.message}`);
  }

  const existingProps = Object.keys(db.properties || {});
  const schema = NOTION_SCHEMA.GrowthProposals;
  
  const toCreate: Record<string, any> = {};
  const created: string[] = [];
  const skipped: string[] = [];
  const errors: { property: string; error: string }[] = [];

  // Map of property type to Notion API format
  const typeMap: Record<string, any> = {
    'title': { title: {} },
    'rich_text': { rich_text: {} },
    'date': { date: {} },
    'number': { number: {} },
    'email': { email: {} },
    'phone_number': { phone_number: {} },
    'url': { url: {} }
  };

  // Special handling for Status select
  if (!existingProps.includes('Status')) {
    toCreate['Status'] = {
      select: {
        options: [
          { name: 'Em criação', color: 'gray' },
          { name: 'Enviada', color: 'blue' },
          { name: 'Aprovada', color: 'green' },
          { name: 'Recusada', color: 'red' }
        ]
      }
    };
  }

  // Process all properties from schema
  for (const propSchema of schema.properties) {
    const propName = propSchema.name;
    
    // Skip if already exists
    if (existingProps.includes(propName)) {
      skipped.push(propName);
      continue;
    }

    // Skip title (always exists by default)
    if (propSchema.type === 'title') {
      skipped.push(propName);
      continue;
    }

    // Handle relations (need manual setup - can't create programmatically easily)
    if (propSchema.type === 'relation') {
      skipped.push(propName); // Skip for now, user needs to create manually
      continue;
    }

    // Map property type
    const notionType = typeMap[propSchema.type];
    if (!notionType) {
      errors.push({
        property: propName,
        error: `Unknown type: ${propSchema.type}`
      });
      continue;
    }

    toCreate[propName] = notionType;
  }

  // Create all missing properties
  if (Object.keys(toCreate).length > 0) {
    try {
      // Try to create all at once first
      await retryWithBackoff(() =>
        client.databases.update({
          database_id: dbId,
          properties: toCreate
        })
      );
      
      created.push(...Object.keys(toCreate));
      console.log(`✅ Created ${created.length} properties in GrowthProposals database: ${created.join(', ')}`);
    } catch (error: any) {
      // If batch fails, try creating one by one
      console.warn('⚠️ Batch creation failed, trying individual creation...', error.message);
      
      for (const [propName, propDef] of Object.entries(toCreate)) {
        try {
          await retryWithBackoff(() =>
            client.databases.update({
              database_id: dbId,
              properties: {
                [propName]: propDef
              }
            })
          );
          created.push(propName);
          console.log(`✅ Created property: ${propName}`);
        } catch (err: any) {
          errors.push({
            property: propName,
            error: err.message || 'Failed to create'
          });
          console.error(`❌ Failed to create property ${propName}:`, err.message);
        }
      }
    }
  }

  return { created, skipped, errors };
}

/**
 * Validate GrowthProposals database schema (read-only check)
 */
export async function validateGrowthProposalsSchema(): Promise<{
  valid: boolean;
  existing: string[];
  missing: string[];
  totalExpected: number;
  totalExisting: number;
  errors?: string[];
}> {
  try {
    const client = initNotionClient();
    const dbId = getDatabaseId('GrowthProposals');
    if (!dbId) {
      return {
        valid: false,
        existing: [],
        missing: [],
        totalExpected: 0,
        totalExisting: 0,
        errors: ['NOTION_DB_GROWTHPROPOSALS not configured']
      };
    }

    const db = await retryWithBackoff(() =>
      client.databases.retrieve({ database_id: dbId })
    );

    const existingProps = Object.keys(db.properties || {});
    const schema = NOTION_SCHEMA.GrowthProposals;
    const requiredProps = schema.properties.map(p => p.name);
    
    // Filter out title (always exists) and relations (need manual setup)
    const checkableProps = requiredProps.filter(name => {
      const prop = schema.properties.find(p => p.name === name);
      return prop && prop.type !== 'title' && prop.type !== 'relation';
    });
    
    const missing = checkableProps.filter(name => !existingProps.includes(name));

    return {
      valid: missing.length === 0,
      existing: existingProps,
      missing: missing,
      totalExpected: requiredProps.length,
      totalExisting: existingProps.length
    };
  } catch (error: any) {
    return {
      valid: false,
      existing: [],
      missing: [],
      totalExpected: 0,
      totalExisting: 0,
      errors: [error.message || 'Unknown error']
    };
  }
}

// ==========================================
// VENDE MAIS OBRAS - FUNCTIONS
// ==========================================

/**
 * Convert Notion page to Servico
 */
function pageToServico(page: any): any {
  const props = page.properties;
  return {
    id: page.id,
    Codigo: extractText(props.Codigo),
    Nome: extractText(props.Nome),
    Descricao: extractText(props.Descricao),
    Categoria: extractSelect(props.Categoria),
    Preco: extractNumber(props.Preco),
    Unidade: extractSelect(props.Unidade),
    Ativo: extractBoolean(props.Ativo),
    CreatedAt: page.created_time,
    UpdatedAt: page.last_edited_time
  };
}

/**
 * Convert Notion page to Usuario
 */
function pageToUsuario(page: any): any {
  const props = page.properties;
  return {
    id: page.id,
    Nome: extractText(props.Nome),
    Email: extractEmail(props.Email),
    Telefone: extractPhoneNumber(props.Telefone),
    PasswordHash: extractText(props.PasswordHash), // nunca retornar ao frontend
    Status: extractSelect(props.Status),
    TrialInicio: extractDate(props.TrialInicio),
    TrialFim: extractDate(props.TrialFim),
    PlanoAtivo: extractBoolean(props.PlanoAtivo),
    MercadoPagoSubscriptionId: extractText(props.MercadoPagoSubscriptionId),
    CreatedAt: page.created_time,
    ActivatedAt: extractDate(props.ActivatedAt),
    LastAccessAt: extractDate(props.LastAccessAt),
    ChurnedAt: extractDate(props.ChurnedAt)
  };
}

/**
 * Convert Notion page to Cliente
 */
function pageToCliente(page: any): any {
  const props = page.properties;
  const usuarioRelation = extractRelation(props.Usuario);
  return {
    id: page.id,
    Nome: extractText(props.Nome),
    Email: extractEmail(props.Email),
    Telefone: extractPhoneNumber(props.Telefone),
    Documento: extractText(props.Documento),
    Endereco: extractText(props.Endereco),
    Cidade: extractText(props.Cidade),
    Estado: extractSelect(props.Estado),
    UsuarioId: usuarioRelation[0] || '',
    CreatedAt: page.created_time,
    UpdatedAt: page.last_edited_time
  };
}

/**
 * Convert Notion page to Orcamento
 */
function pageToOrcamento(page: any): any {
  const props = page.properties;
  const usuarioRelation = extractRelation(props.Usuario);
  const clienteRelation = extractRelation(props.Cliente);
  const itensJson = extractText(props.Itens);
  
  let itens: any[] = [];
  try {
    itens = itensJson ? JSON.parse(itensJson) : [];
  } catch {
    itens = [];
  }
  
  return {
    id: page.id,
    Numero: extractText(props.Numero),
    UsuarioId: usuarioRelation[0] || '',
    ClienteId: clienteRelation[0] || '',
    Status: extractSelect(props.Status),
    Total: extractNumber(props.Total),
    Itens: itens,
    Observacoes: extractText(props.Observacoes),
    Validade: extractDate(props.Validade),
    CreatedAt: page.created_time,
    UpdatedAt: page.last_edited_time,
    EnviadoAt: extractDate(props.EnviadoAt),
    AprovadoAt: extractDate(props.AprovadoAt)
  };
}

/**
 * Convert Notion page to Lead
 */
function pageToLead(page: any): any {
  const props = page.properties;
  return {
    id: page.id,
    Name: extractText(props.Nome),
    Email: extractEmail(props.Email),
    Telefone: extractPhoneNumber(props.Telefone),
    Profissao: extractText(props.Profissao),
    Cidade: extractText(props.Cidade),
    Status: extractSelect(props.Status),
    Source: extractSelect(props.Source),
    Notes: extractText(props.Notes),
    CreatedAt: page.created_time,
    ContactedAt: extractDate(props.ContactedAt),
    QualifiedAt: extractDate(props.QualifiedAt),
    ActivatedAt: extractDate(props.ActivatedAt),
    ConvertedAt: extractDate(props.ConvertedAt),
    ChurnedAt: extractDate(props.ChurnedAt)
  };
}

/**
 * ==========================================
 * SERVIÇOS
 * ==========================================
 */

export async function getServicos(categoria?: string, ativo?: boolean): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Servicos');
  if (!dbId) throw new Error('NOTION_DB_SERVICOS not configured');

  const filters: any[] = [];
  if (categoria) {
    filters.push({ property: 'Categoria', select: { equals: categoria } });
  }
  if (ativo !== undefined) {
    filters.push({ property: 'Ativo', checkbox: { equals: ativo } });
  }

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: filters.length > 0 ? { and: filters } : undefined,
      sorts: [{ property: 'Nome', direction: 'ascending' }]
    })
  );

  return response.results.map(pageToServico);
}

export async function getServicoById(id: string): Promise<any | null> {
  const client = initNotionClient();
  try {
    const page = await retryWithBackoff(() =>
      client.pages.retrieve({ page_id: id })
    );
    return pageToServico(page);
  } catch {
    return null;
  }
}

export async function createServico(servico: any): Promise<any> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Servicos');
  if (!dbId) throw new Error('NOTION_DB_SERVICOS not configured');

  const properties: any = {
    Codigo: { title: [{ text: { content: servico.Codigo } }] },
    Nome: { rich_text: [{ text: { content: servico.Nome } }] },
    Categoria: { select: { name: servico.Categoria } },
    Preco: { number: servico.Preco },
    Unidade: { select: { name: servico.Unidade } },
    Ativo: { checkbox: servico.Ativo ?? true }
  };

  if (servico.Descricao) {
    properties.Descricao = { rich_text: [{ text: { content: servico.Descricao } }] };
  }

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToServico(created);
}

export async function updateServico(id: string, servico: any): Promise<any> {
  const client = initNotionClient();
  const properties: any = {};

  if (servico.Codigo !== undefined) {
    properties.Codigo = { title: [{ text: { content: servico.Codigo } }] };
  }
  if (servico.Nome !== undefined) {
    properties.Nome = { rich_text: [{ text: { content: servico.Nome } }] };
  }
  if (servico.Descricao !== undefined) {
    properties.Descricao = servico.Descricao
      ? { rich_text: [{ text: { content: servico.Descricao } }] }
      : { rich_text: [] };
  }
  if (servico.Categoria !== undefined) {
    properties.Categoria = { select: { name: servico.Categoria } };
  }
  if (servico.Preco !== undefined) {
    properties.Preco = { number: servico.Preco };
  }
  if (servico.Unidade !== undefined) {
    properties.Unidade = { select: { name: servico.Unidade } };
  }
  if (servico.Ativo !== undefined) {
    properties.Ativo = { checkbox: servico.Ativo };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToServico(updated);
}

export async function deleteServico(id: string): Promise<void> {
  const client = initNotionClient();
  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * ==========================================
 * USUÁRIOS
 * ==========================================
 */

export async function getUsuarioByEmail(email: string): Promise<any | null> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Usuarios');
  if (!dbId) throw new Error('NOTION_DB_USUARIOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: { property: 'Email', email: { equals: email } },
      page_size: 1
    })
  );

  if (response.results.length === 0) return null;
  return pageToUsuario(response.results[0]);
}

export async function getUsuarioById(id: string): Promise<any | null> {
  const client = initNotionClient();
  try {
    const page = await retryWithBackoff(() =>
      client.pages.retrieve({ page_id: id })
    );
    return pageToUsuario(page);
  } catch {
    return null;
  }
}

export async function getAllUsuarios(): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Usuarios');
  if (!dbId) throw new Error('NOTION_DB_USUARIOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToUsuario);
}

export async function createUsuario(usuario: any, passwordHash: string): Promise<any> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Usuarios');
  if (!dbId) throw new Error('NOTION_DB_USUARIOS not configured');

  // Verificar se email já existe
  const existing = await getUsuarioByEmail(usuario.Email);
  if (existing) {
    throw new Error('Email já cadastrado');
  }

  const trialInicio = new Date();
  const trialFim = new Date();
  trialFim.setDate(trialFim.getDate() + 7); // 7 dias de trial

  const properties: any = {
    Nome: { title: [{ text: { content: usuario.Nome } }] },
    Email: { email: usuario.Email },
    PasswordHash: { rich_text: [{ text: { content: passwordHash } }] },
    Status: { select: { name: usuario.Status || 'Trial' } },
    TrialInicio: { date: { start: normalizeDate(trialInicio.toISOString()) } },
    TrialFim: { date: { start: normalizeDate(trialFim.toISOString()) } },
    PlanoAtivo: { checkbox: false }
  };

  if (usuario.Telefone) {
    properties.Telefone = { phone_number: usuario.Telefone };
  }

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToUsuario(created);
}

export async function updateUsuario(id: string, usuario: any, passwordHash?: string): Promise<any> {
  const client = initNotionClient();
  const properties: any = {};

  if (usuario.Nome !== undefined) {
    properties.Nome = { title: [{ text: { content: usuario.Nome } }] };
  }
  if (usuario.Email !== undefined) {
    // Verificar se email já existe em outro usuário
    const existing = await getUsuarioByEmail(usuario.Email);
    if (existing && existing.id !== id) {
      throw new Error('Email já cadastrado');
    }
    properties.Email = { email: usuario.Email };
  }
  if (usuario.Telefone !== undefined) {
    properties.Telefone = usuario.Telefone
      ? { phone_number: usuario.Telefone }
      : { phone_number: null };
  }
  if (passwordHash) {
    properties.PasswordHash = { rich_text: [{ text: { content: passwordHash } }] };
  }
  if (usuario.Status !== undefined) {
    properties.Status = { select: { name: usuario.Status } };
  }
  if (usuario.TrialInicio !== undefined) {
    properties.TrialInicio = usuario.TrialInicio
      ? { date: { start: normalizeDate(usuario.TrialInicio) } }
      : { date: null };
  }
  if (usuario.TrialFim !== undefined) {
    properties.TrialFim = usuario.TrialFim
      ? { date: { start: normalizeDate(usuario.TrialFim) } }
      : { date: null };
  }
  if (usuario.PlanoAtivo !== undefined) {
    properties.PlanoAtivo = { checkbox: usuario.PlanoAtivo };
  }
  if (usuario.MercadoPagoSubscriptionId !== undefined) {
    properties.MercadoPagoSubscriptionId = usuario.MercadoPagoSubscriptionId
      ? { rich_text: [{ text: { content: usuario.MercadoPagoSubscriptionId } }] }
      : { rich_text: [] };
  }
  if (usuario.LastAccessAt !== undefined) {
    properties.LastAccessAt = usuario.LastAccessAt
      ? { date: { start: normalizeDate(usuario.LastAccessAt) } }
      : { date: null };
  }
  if (usuario.ActivatedAt !== undefined) {
    properties.ActivatedAt = usuario.ActivatedAt
      ? { date: { start: normalizeDate(usuario.ActivatedAt) } }
      : { date: null };
  }
  if (usuario.ChurnedAt !== undefined) {
    properties.ChurnedAt = usuario.ChurnedAt
      ? { date: { start: normalizeDate(usuario.ChurnedAt) } }
      : { date: null };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToUsuario(updated);
}

/**
 * ==========================================
 * ORÇAMENTOS
 * ==========================================
 */

export async function getOrcamentosByUsuario(usuarioId: string): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Orcamentos');
  if (!dbId) throw new Error('NOTION_DB_ORCAMENTOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: { property: 'Usuario', relation: { contains: usuarioId } },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    })
  );

  const orcamentos = response.results.map(pageToOrcamento);
  
  // Buscar nomes dos clientes para cada orçamento
  const orcamentosComClienteNome = await Promise.all(
    orcamentos.map(async (orcamento) => {
      if (orcamento.ClienteId) {
        try {
          const cliente = await getClienteById(orcamento.ClienteId);
          if (cliente) {
            orcamento.ClienteNome = cliente.Nome;
          }
        } catch (error) {
          // Se não conseguir buscar o cliente, continua sem o nome
          console.error(`Erro ao buscar cliente ${orcamento.ClienteId}:`, error);
        }
      }
      return orcamento;
    })
  );
  
  return orcamentosComClienteNome;
}

export async function getOrcamentoById(id: string, usuarioId?: string): Promise<any | null> {
  const client = initNotionClient();
  try {
    const page = await retryWithBackoff(() =>
      client.pages.retrieve({ page_id: id })
    );
    const orcamento = pageToOrcamento(page);
    
    // Verificar ownership se usuarioId fornecido
    if (usuarioId && orcamento.UsuarioId !== usuarioId) {
      return null;
    }
    
    // Buscar nome do cliente se existir
    if (orcamento.ClienteId) {
      try {
        const cliente = await getClienteById(orcamento.ClienteId);
        if (cliente) {
          orcamento.ClienteNome = cliente.Nome;
        }
      } catch (error) {
        // Se não conseguir buscar o cliente, continua sem o nome
        console.error(`Erro ao buscar cliente ${orcamento.ClienteId}:`, error);
      }
    }
    
    return orcamento;
  } catch {
    return null;
  }
}

export async function getAllOrcamentos(): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Orcamentos');
  if (!dbId) throw new Error('NOTION_DB_ORCAMENTOS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToOrcamento);
}

export async function createOrcamento(orcamento: any): Promise<any> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Orcamentos');
  if (!dbId) throw new Error('NOTION_DB_ORCAMENTOS not configured');

  // Gerar número se não fornecido
  if (!orcamento.Numero) {
    const all = await getAllOrcamentos();
    const numero = `ORC-${String(all.length + 1).padStart(4, '0')}`;
    orcamento.Numero = numero;
  }

  const properties: any = {
    Numero: { title: [{ text: { content: orcamento.Numero } }] },
    Usuario: { relation: [{ id: orcamento.UsuarioId }] },
    Cliente: { relation: [{ id: orcamento.ClienteId }] },
    Status: { select: { name: orcamento.Status || 'Rascunho' } },
    Total: { number: orcamento.Total },
    Itens: { rich_text: [{ text: { content: JSON.stringify(orcamento.Itens || []) } }] }
  };

  if (orcamento.Observacoes) {
    properties.Observacoes = { rich_text: [{ text: { content: orcamento.Observacoes } }] };
  }
  if (orcamento.Validade) {
    properties.Validade = { date: { start: normalizeDate(orcamento.Validade) } };
  }

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToOrcamento(created);
}

export async function updateOrcamento(id: string, orcamento: any, usuarioId: string): Promise<any> {
  const client = initNotionClient();
  
  // Verificar ownership
  const existing = await getOrcamentoById(id, usuarioId);
  if (!existing) {
    throw new Error('Orçamento não encontrado ou não pertence ao usuário');
  }

  const properties: any = {};

  if (orcamento.ClienteId !== undefined) {
    properties.Cliente = { relation: [{ id: orcamento.ClienteId }] };
  }
  if (orcamento.Status !== undefined) {
    properties.Status = { select: { name: orcamento.Status } };
  }
  if (orcamento.Total !== undefined) {
    properties.Total = { number: orcamento.Total };
  }
  if (orcamento.Itens !== undefined) {
    properties.Itens = { rich_text: [{ text: { content: JSON.stringify(orcamento.Itens) } }] };
  }
  if (orcamento.Observacoes !== undefined) {
    properties.Observacoes = orcamento.Observacoes
      ? { rich_text: [{ text: { content: orcamento.Observacoes } }] }
      : { rich_text: [] };
  }
  if (orcamento.Validade !== undefined) {
    properties.Validade = orcamento.Validade
      ? { date: { start: normalizeDate(orcamento.Validade) } }
      : { date: null };
  }
  if (orcamento.EnviadoAt !== undefined) {
    properties.EnviadoAt = orcamento.EnviadoAt
      ? { date: { start: normalizeDate(orcamento.EnviadoAt) } }
      : { date: null };
  }
  if (orcamento.AprovadoAt !== undefined) {
    properties.AprovadoAt = orcamento.AprovadoAt
      ? { date: { start: normalizeDate(orcamento.AprovadoAt) } }
      : { date: null };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToOrcamento(updated);
}

export async function deleteOrcamento(id: string, usuarioId: string): Promise<void> {
  const client = initNotionClient();
  
  // Verificar ownership
  const existing = await getOrcamentoById(id, usuarioId);
  if (!existing) {
    throw new Error('Orçamento não encontrado ou não pertence ao usuário');
  }

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * ==========================================
 * CLIENTES
 * ==========================================
 */

export async function getClientesByUsuario(usuarioId: string): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Clientes');
  if (!dbId) throw new Error('NOTION_DB_CLIENTES not configured');

  console.log('[getClientesByUsuario] Buscando clientes para usuarioId:', usuarioId);

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter: { property: 'Usuario', relation: { contains: usuarioId } },
      sorts: [{ property: 'Nome', direction: 'ascending' }]
    })
  );

  console.log('[getClientesByUsuario] Encontrados', response.results.length, 'clientes');
  
  const clientes = response.results.map(pageToCliente);
  clientes.forEach((c, idx) => {
    console.log(`[getClientesByUsuario] Cliente ${idx + 1}: ${c.Nome}, UsuarioId: ${c.UsuarioId}`);
  });

  return clientes;
}

export async function getClienteById(id: string, usuarioId?: string): Promise<any | null> {
  const client = initNotionClient();
  try {
    const page = await retryWithBackoff(() =>
      client.pages.retrieve({ page_id: id })
    );
    const cliente = pageToCliente(page);
    
    // Verificar ownership se usuarioId fornecido (apenas para operações que exigem permissão)
    // Se usuarioId não for fornecido ou for undefined, retorna o cliente mesmo assim
    // Isso permite buscar clientes para popular dados como ClienteNome em orçamentos
    if (usuarioId !== undefined && cliente.UsuarioId !== usuarioId) {
      return null;
    }
    
    return cliente;
  } catch {
    return null;
  }
}

export async function createCliente(cliente: any): Promise<any> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Clientes');
  if (!dbId) throw new Error('NOTION_DB_CLIENTES not configured');

  // Validar que UsuarioId foi fornecido
  if (!cliente.UsuarioId) {
    throw new Error('UsuarioId é obrigatório para criar cliente');
  }

  const properties: any = {
    Nome: { title: [{ text: { content: cliente.Nome } }] },
    Usuario: { relation: [{ id: cliente.UsuarioId }] }
  };

  if (cliente.Email) properties.Email = { email: cliente.Email };
  if (cliente.Telefone) properties.Telefone = { phone_number: cliente.Telefone };
  if (cliente.Documento) properties.Documento = { rich_text: [{ text: { content: cliente.Documento } }] };
  if (cliente.Endereco) properties.Endereco = { rich_text: [{ text: { content: cliente.Endereco } }] };
  if (cliente.Cidade) properties.Cidade = { rich_text: [{ text: { content: cliente.Cidade } }] };
  if (cliente.Estado) properties.Estado = { select: { name: cliente.Estado } };

  console.log('[createCliente] Criando cliente com properties:', JSON.stringify(properties, null, 2));
  console.log('[createCliente] UsuarioId recebido:', cliente.UsuarioId);

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  console.log('[createCliente] Cliente criado:', created.id);
  const clienteResultado = pageToCliente(created);
  console.log('[createCliente] Cliente resultado UsuarioId:', clienteResultado.UsuarioId);
  
  return clienteResultado;
}

export async function updateCliente(id: string, cliente: any, usuarioId: string): Promise<any> {
  const client = initNotionClient();
  
  // Verificar ownership
  const existing = await getClienteById(id, usuarioId);
  if (!existing) {
    throw new Error('Cliente não encontrado ou não pertence ao usuário');
  }

  const properties: any = {};

  if (cliente.Nome !== undefined) {
    properties.Nome = { title: [{ text: { content: cliente.Nome } }] };
  }
  if (cliente.Email !== undefined) {
    properties.Email = cliente.Email ? { email: cliente.Email } : { email: null };
  }
  if (cliente.Telefone !== undefined) {
    properties.Telefone = cliente.Telefone ? { phone_number: cliente.Telefone } : { phone_number: null };
  }
  if (cliente.Documento !== undefined) {
    properties.Documento = cliente.Documento
      ? { rich_text: [{ text: { content: cliente.Documento } }] }
      : { rich_text: [] };
  }
  if (cliente.Endereco !== undefined) {
    properties.Endereco = cliente.Endereco
      ? { rich_text: [{ text: { content: cliente.Endereco } }] }
      : { rich_text: [] };
  }
  if (cliente.Cidade !== undefined) {
    properties.Cidade = cliente.Cidade
      ? { rich_text: [{ text: { content: cliente.Cidade } }] }
      : { rich_text: [] };
  }
  if (cliente.Estado !== undefined) {
    properties.Estado = cliente.Estado ? { select: { name: cliente.Estado } } : { select: null };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToCliente(updated);
}

export async function deleteCliente(id: string, usuarioId: string): Promise<void> {
  const client = initNotionClient();
  
  // Verificar ownership
  const existing = await getClienteById(id, usuarioId);
  if (!existing) {
    throw new Error('Cliente não encontrado ou não pertence ao usuário');
  }

  await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      archived: true
    })
  );
}

/**
 * ==========================================
 * LEADS
 * ==========================================
 */

export async function getLeads(status?: string): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Leads');
  if (!dbId) throw new Error('NOTION_DB_LEADS not configured');

  const filter = status
    ? { property: 'Status', select: { equals: status } }
    : undefined;

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      filter,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToLead);
}

export async function createLead(lead: any): Promise<any> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Leads');
  if (!dbId) throw new Error('NOTION_DB_LEADS not configured');

  const properties: any = {
    Nome: { title: [{ text: { content: lead.Nome } }] },
    Status: { select: { name: lead.Status || 'Novo' } }
  };

  if (lead.Email) properties.Email = { email: lead.Email };
  if (lead.Telefone) properties.Telefone = { phone_number: lead.Telefone };
  if (lead.Profissao) properties.Profissao = { rich_text: [{ text: { content: lead.Profissao } }] };
  if (lead.Cidade) properties.Cidade = { rich_text: [{ text: { content: lead.Cidade } }] };
  if (lead.Source) properties.Source = { select: { name: lead.Source } };
  if (lead.Notes) properties.Notes = { rich_text: [{ text: { content: lead.Notes } }] };

  const created = await retryWithBackoff(() =>
    client.pages.create({
      parent: { database_id: dbId },
      properties
    })
  );

  return pageToLead(created);
}

export async function updateLeadStatus(id: string, status: string, dataAtualizacao?: Date): Promise<any> {
  const client = initNotionClient();
  const properties: any = {
    Status: { select: { name: status } }
  };

  const dataStr = dataAtualizacao ? normalizeDate(dataAtualizacao.toISOString()) : normalizeDate(new Date().toISOString());

  // Atualizar campo de data apropriado baseado no status
  if (status === 'Contactado') {
    properties.ContactedAt = { date: { start: dataStr } };
  } else if (status === 'Qualificado' || status === 'Cadastrado') {
    properties.QualifiedAt = { date: { start: dataStr } };
  } else if (status === 'Ativado' || status === 'Usuário Ativo') {
    properties.ActivatedAt = { date: { start: dataStr } };
  } else if (status === 'Pago' || status === 'Usuário Pagante') {
    properties.ConvertedAt = { date: { start: dataStr } };
  } else if (status === 'Perdido' || status === 'Churn') {
    properties.ChurnedAt = { date: { start: dataStr } };
  }

  const updated = await retryWithBackoff(() =>
    client.pages.update({
      page_id: id,
      properties
    })
  );

  return pageToLead(updated);
}

export async function getAllLeads(): Promise<any[]> {
  const client = initNotionClient();
  const dbId = getDatabaseId('Leads');
  if (!dbId) throw new Error('NOTION_DB_LEADS not configured');

  const response = await retryWithBackoff(() =>
    client.databases.query({
      database_id: dbId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    })
  );

  return response.results.map(pageToLead);
}

/**
 * ==========================================
 * MÉTRICAS
 * ==========================================
 */

export async function getVendeMaisObrasMetricas(): Promise<any> {
  const leads = await getAllLeads();
  const usuarios = await getAllUsuarios();
  const orcamentos = await getAllOrcamentos();

  const leadsTotal = leads.length;
  const leadsContactados = leads.filter(l => l.Status === 'Contactado').length;
  const leadsInteressados = leads.filter(l => l.Status === 'Interessado' || l.Status === 'Respondeu').length;
  
  const usuariosTrial = usuarios.filter(u => u.Status === 'Trial').length;
  const usuariosAtivos = usuarios.filter(u => u.Status === 'Ativo').length;
  const usuariosPagantes = usuarios.filter(u => u.PlanoAtivo === true).length;
  
  const orcamentosCriados = orcamentos.length;
  const orcamentosAprovados = orcamentos.filter(o => o.Status === 'Aprovado').length;

  const usuariosQuePagaram = usuarios.filter(u => u.PlanoAtivo === true).length;
  const usuariosTrialTotal = usuarios.filter(u => u.Status === 'Trial' || (u.TrialFim && new Date(u.TrialFim) < new Date())).length;
  const conversaoTrialParaPago = usuariosTrialTotal > 0
    ? (usuariosQuePagaram / usuariosTrialTotal) * 100
    : 0;

  const usuariosChurned = usuarios.filter(u => u.ChurnedAt && u.Status === 'Cancelado').length;
  const usuariosTotais = usuarios.length;
  const churn = usuariosTotais > 0 ? (usuariosChurned / usuariosTotais) * 100 : 0;

  return {
    leadsTotal,
    leadsContactados,
    leadsInteressados,
    usuariosTrial,
    usuariosAtivos,
    usuariosPagantes,
    orcamentosCriados,
    orcamentosAprovados,
    conversaoTrialParaPago: Math.round(conversaoTrialParaPago * 100) / 100,
    churn: Math.round(churn * 100) / 100
  };
}

// ==========================================
// TRANSACTIONS - FUNCTIONS
// ==========================================

/**
 * Convert Notion page to Transaction
 */
function pageToTransaction(page: any): NotionTransaction {
  const props = page.properties;
  const budgetGoalRelation = extractRelation(props.BudgetGoal);
  
  return {
    id: page.id,
    Name: extractText(props.Name),
    Date: extractDate(props.Date) || new Date().toISOString().split('T')[0],
    Amount: extractNumber(props.Amount) || 0,
    Type: (extractSelect(props.Type) as 'Entrada' | 'Saída') || 'Saída',
    Category: extractSelect(props.Category) || undefined,
    Account: extractSelect(props.Account) || '',
    Description: extractText(props.Description) || undefined,
    BudgetGoal: budgetGoalRelation[0] || undefined,
    Imported: extractBoolean(props.Imported),
    ImportedAt: extractDate(props.ImportedAt) || undefined,
    FileSource: extractText(props.FileSource) || undefined
  };
}

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(filters?: {
  account?: string;
  category?: string;
  type?: 'Entrada' | 'Saída';
  startDate?: string;
  endDate?: string;
  imported?: boolean;
}): Promise<NotionTransaction[]> {
  try {
    const client = initNotionClient();
    const dbId = getDatabaseId('Transactions');
    if (!dbId) {
      console.warn('NOTION_DB_TRANSACTIONS not configured');
      return [];
    }

    const filterConditions: any[] = [];

    if (filters?.account) {
      filterConditions.push({
        property: 'Account',
        select: { equals: filters.account }
      });
    }

    if (filters?.category) {
      filterConditions.push({
        property: 'Category',
        select: { equals: filters.category }
      });
    }

    if (filters?.type) {
      filterConditions.push({
        property: 'Type',
        select: { equals: filters.type }
      });
    }

    if (filters?.startDate || filters?.endDate) {
      const dateFilter: any = { property: 'Date', date: {} };
      if (filters.startDate) {
        dateFilter.date.on_or_after = filters.startDate;
      }
      if (filters.endDate) {
        dateFilter.date.on_or_before = filters.endDate;
      }
      filterConditions.push(dateFilter);
    }

    if (filters?.imported !== undefined) {
      filterConditions.push({
        property: 'Imported',
        checkbox: { equals: filters.imported }
      });
    }

    const query: any = {
      database_id: dbId,
      sorts: [{ property: 'Date', direction: 'descending' }]
    };

    if (filterConditions.length > 0) {
      query.filter = filterConditions.length === 1 
        ? filterConditions[0]
        : { and: filterConditions };
    }

    const response = await retryWithBackoff(() =>
      client.databases.query(query)
    );

    return response.results.map(pageToTransaction);
  } catch (error: any) {
    console.error('❌ Erro ao buscar transações do Notion:', error);
    if (error.code === 'object_not_found') {
      throw new Error(`Database do Notion não encontrada. Verifique se NOTION_DB_TRANSACTIONS está correto e se a integração tem acesso à database.`);
    }
    if (error.status === 401) {
      throw new Error(`Token do Notion inválido ou sem permissões. Verifique o NOTION_TOKEN e se a integração tem acesso à database.`);
    }
    throw error;
  }
}

/**
 * Create a single transaction in Notion
 */
export async function createTransaction(transaction: Omit<NotionTransaction, 'id'>): Promise<NotionTransaction> {
  try {
    const client = initNotionClient();
    const dbId = getDatabaseId('Transactions');
    if (!dbId) {
      throw new Error('NOTION_DB_TRANSACTIONS not configured');
    }

    const properties: any = {
      Name: {
        title: [{ text: { content: transaction.Name } }]
      },
      Date: {
        date: { start: normalizeDate(transaction.Date) }
      },
      Amount: {
        number: transaction.Amount
      },
      Type: {
        select: { name: transaction.Type }
      },
      Account: {
        select: { name: transaction.Account }
      },
      Imported: {
        checkbox: transaction.Imported || false
      }
    };

    if (transaction.Category) {
      properties.Category = {
        select: { name: transaction.Category }
      };
    }

    if (transaction.Description) {
      properties.Description = {
        rich_text: toRichTextArray(transaction.Description)
      };
    }

    if (transaction.BudgetGoal) {
      properties.BudgetGoal = {
        relation: [{ id: transaction.BudgetGoal }]
      };
    }

    if (transaction.ImportedAt) {
      properties.ImportedAt = {
        date: { start: normalizeDate(transaction.ImportedAt) }
      };
    }

    if (transaction.FileSource) {
      properties.FileSource = {
        rich_text: toRichTextArray(transaction.FileSource)
      };
    }

    const response = await retryWithBackoff(() =>
      client.pages.create({
        parent: { database_id: dbId },
        properties
      })
    );

    return pageToTransaction(response);
  } catch (error: any) {
    console.error('❌ Erro ao criar transação no Notion:', error);
    throw error;
  }
}

/**
 * Create multiple transactions in bulk
 */
export async function createTransactionsBulk(
  transactions: Omit<NotionTransaction, 'id'>[]
): Promise<{ created: number; skipped: number; errors: string[] }> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const transaction of transactions) {
    try {
      await createTransaction(transaction);
      created++;
    } catch (error: any) {
      skipped++;
      errors.push(`Erro ao criar transação "${transaction.Name}": ${error.message}`);
      console.error(`Erro ao criar transação:`, error);
    }
  }

  return { created, skipped, errors };
}

