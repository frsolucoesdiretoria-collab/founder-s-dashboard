// FR Tech OS - Notion Data Layer
// Server-side data access abstraction

import type { 
  NotionKPI, NotionGoal, NotionAction, NotionJournal,
  NotionExpansionOpportunity, NotionCustomerWin,
  HealthCheckResult, SelfTestResult 
} from './types';
import { NotionSchema, ENV_VAR_MAPPING, type NotionDatabaseName } from './schema';
import { filterPublicKPIs, filterPublicGoals, filterPublicActions } from './guards';
import { 
  mockKPIs, mockGoals, mockActions, mockJournals,
  mockExpansionOpportunities, mockCustomerWins,
  getTodayActions, hasYesterdayJournal
} from './mock-data';

// Check if Notion is configured
export function isNotionConfigured(): boolean {
  // In production, this would check actual env vars
  // For now, always return false to use mocks
  return false;
}

// Get public KPIs (filtered for security)
export async function getPublicKPIs(): Promise<NotionKPI[]> {
  if (!isNotionConfigured()) {
    return filterPublicKPIs(mockKPIs);
  }
  // TODO: Implement actual Notion API call via edge function
  return filterPublicKPIs(mockKPIs);
}

// Get public goals
export async function getPublicGoals(): Promise<NotionGoal[]> {
  if (!isNotionConfigured()) {
    return filterPublicGoals(mockGoals);
  }
  return filterPublicGoals(mockGoals);
}

// Get today's actions
export async function getDailyActions(): Promise<NotionAction[]> {
  if (!isNotionConfigured()) {
    return filterPublicActions(getTodayActions());
  }
  return filterPublicActions(getTodayActions());
}

// Check yesterday's journal status
export async function checkYesterdayJournal(): Promise<{ exists: boolean; filled: boolean }> {
  if (!isNotionConfigured()) {
    const filled = hasYesterdayJournal();
    return { exists: true, filled };
  }
  return { exists: true, filled: hasYesterdayJournal() };
}

// Get expansion opportunities
export async function getExpansionOpportunities(): Promise<NotionExpansionOpportunity[]> {
  if (!isNotionConfigured()) {
    return mockExpansionOpportunities;
  }
  return mockExpansionOpportunities;
}

// Get customer wins (Momento GOL)
export async function getCustomerWins(): Promise<NotionCustomerWin[]> {
  if (!isNotionConfigured()) {
    return mockCustomerWins;
  }
  return mockCustomerWins;
}

// Update action done status
export async function updateActionDone(actionId: string, done: boolean): Promise<boolean> {
  if (!isNotionConfigured()) {
    const action = mockActions.find(a => a.id === actionId);
    if (action) {
      action.Done = done;
      return true;
    }
    return false;
  }
  // TODO: Implement actual Notion API call
  return true;
}

// Create journal entry
export async function createJournalEntry(journal: Partial<NotionJournal>): Promise<boolean> {
  if (!isNotionConfigured()) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const existingJournal = mockJournals.find(j => j.Date === yesterday);
    if (existingJournal) {
      Object.assign(existingJournal, journal, { Filled: true });
    }
    return true;
  }
  return true;
}

// Run health check
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  
  // Check required env vars
  const requiredEnvVars = [
    'NOTION_TOKEN',
    'NOTION_DB_KPIS',
    'NOTION_DB_GOALS',
    'NOTION_DB_ACTIONS',
    'NOTION_DB_JOURNAL'
  ];

  for (const envVar of requiredEnvVars) {
    checks.push({
      name: `ENV: ${envVar}`,
      status: 'warning',
      message: 'Não configurado (usando mocks)'
    });
  }

  // Check database schemas
  const databases: NotionDatabaseName[] = ['KPIs', 'Goals', 'Actions', 'Journal'];
  for (const db of databases) {
    checks.push({
      name: `Schema: ${db}`,
      status: 'ok',
      message: `${NotionSchema[db].properties.length} propriedades definidas`
    });
  }

  const hasErrors = checks.some(c => c.status === 'error');
  const hasWarnings = checks.some(c => c.status === 'warning');

  return {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    timestamp: new Date().toISOString(),
    checks
  };
}

// Run self-tests
export async function runSelfTests(): Promise<SelfTestResult> {
  const tests: SelfTestResult['tests'] = [];
  const startTime = Date.now();

  // Test 1: Public KPI filter
  try {
    const start = Date.now();
    const kpis = await getPublicKPIs();
    const hasFinancial = kpis.some(k => k.IsFinancial);
    tests.push({
      name: 'Filter: Public KPIs não contêm dados financeiros',
      passed: !hasFinancial,
      duration: Date.now() - start,
      error: hasFinancial ? 'KPIs financeiros expostos!' : undefined
    });
  } catch (e) {
    tests.push({
      name: 'Filter: Public KPIs',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 2: Daily actions
  try {
    const start = Date.now();
    const actions = await getDailyActions();
    tests.push({
      name: 'Data: Actions do dia carregadas',
      passed: Array.isArray(actions),
      duration: Date.now() - start
    });
  } catch (e) {
    tests.push({
      name: 'Data: Actions do dia',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 3: Journal check
  try {
    const start = Date.now();
    const journal = await checkYesterdayJournal();
    tests.push({
      name: 'Data: Verificação de diário',
      passed: typeof journal.filled === 'boolean',
      duration: Date.now() - start
    });
  } catch (e) {
    tests.push({
      name: 'Data: Verificação de diário',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 4: Schema validation
  try {
    const start = Date.now();
    const hasRequiredProps = NotionSchema.KPIs.required.every(
      prop => NotionSchema.KPIs.properties.includes(prop)
    );
    tests.push({
      name: 'Schema: Propriedades required existem',
      passed: hasRequiredProps,
      duration: Date.now() - start
    });
  } catch (e) {
    tests.push({
      name: 'Schema: Validação',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  return {
    passed: tests.every(t => t.passed),
    timestamp: new Date().toISOString(),
    tests
  };
}
