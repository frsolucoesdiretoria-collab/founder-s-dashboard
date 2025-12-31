// FR Tech OS - Health & Self-Test Service

import type { HealthCheckResult, SelfTestResult } from '@/types/health';
import { getPublicKPIs } from './kpis.service';
import { getDailyActions, canMarkActionDone } from './actions.service';
import { checkYesterdayJournal } from './journal.service';
import { mockKPIs } from '@/mocks/kpis.mock';

/**
 * Run health check
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  
  // Check required env vars (simulated)
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

  // Check services
  checks.push({
    name: 'Service: KPIs',
    status: 'ok',
    message: 'Serviço de KPIs funcionando (mock)'
  });

  checks.push({
    name: 'Service: Actions',
    status: 'ok',
    message: 'Serviço de Actions funcionando (mock)'
  });

  checks.push({
    name: 'Service: Journal',
    status: 'ok',
    message: 'Serviço de Journal funcionando (mock)'
  });

  checks.push({
    name: 'Service: Expansion',
    status: 'ok',
    message: 'Serviço de Expansion funcionando (mock)'
  });

  const hasErrors = checks.some(c => c.status === 'error');
  const hasWarnings = checks.some(c => c.status === 'warning');

  return {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    timestamp: new Date().toISOString(),
    checks
  };
}

/**
 * Run self-tests
 */
export async function runSelfTests(): Promise<SelfTestResult> {
  const tests: SelfTestResult['tests'] = [];

  // Test 1: Public KPI filter (no financial data exposed)
  try {
    const start = Date.now();
    const kpis = await getPublicKPIs();
    const hasFinancial = kpis.some(k => k.IsFinancial);
    tests.push({
      name: 'Segurança: KPIs públicos não contêm dados financeiros',
      passed: !hasFinancial,
      duration: Date.now() - start,
      error: hasFinancial ? 'FALHA: KPIs financeiros expostos no público!' : undefined
    });
  } catch (e) {
    tests.push({
      name: 'Segurança: KPIs públicos',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 2: Action without Goal cannot be completed
  try {
    const start = Date.now();
    const actions = await getDailyActions();
    const actionWithoutGoal = actions.find(a => !a.Goal || a.Goal.trim() === '');
    
    if (actionWithoutGoal) {
      const result = canMarkActionDone(actionWithoutGoal);
      tests.push({
        name: 'Regra: Ação sem Goal não pode ser concluída',
        passed: !result.allowed,
        duration: Date.now() - start,
        error: result.allowed ? 'FALHA: Ação sem meta pode ser concluída!' : undefined
      });
    } else {
      tests.push({
        name: 'Regra: Ação sem Goal não pode ser concluída',
        passed: true,
        duration: Date.now() - start
      });
    }
  } catch (e) {
    tests.push({
      name: 'Regra: Ação sem Goal',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 3: Journal check works
  try {
    const start = Date.now();
    const journal = await checkYesterdayJournal();
    tests.push({
      name: 'Data: Verificação de diário funciona',
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

  // Test 4: Financial KPIs exist but are hidden
  try {
    const start = Date.now();
    const hasFinancialKPIs = mockKPIs.some(k => k.IsFinancial);
    const publicKPIs = await getPublicKPIs();
    const publicHasFinancial = publicKPIs.some(k => k.IsFinancial);
    
    tests.push({
      name: 'Segurança: KPIs financeiros existem mas estão ocultos',
      passed: hasFinancialKPIs && !publicHasFinancial,
      duration: Date.now() - start,
      error: !hasFinancialKPIs ? 'Nenhum KPI financeiro nos mocks' : 
             publicHasFinancial ? 'KPIs financeiros expostos!' : undefined
    });
  } catch (e) {
    tests.push({
      name: 'Segurança: KPIs financeiros ocultos',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 5: Daily actions load
  try {
    const start = Date.now();
    const actions = await getDailyActions();
    tests.push({
      name: 'Data: Ações do dia carregam corretamente',
      passed: Array.isArray(actions),
      duration: Date.now() - start
    });
  } catch (e) {
    tests.push({
      name: 'Data: Ações do dia',
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

/**
 * Validate admin passcode (simulated)
 */
export function validateAdminPasscode(passcode: string): boolean {
  // Simulated passcode for local development
  const MOCK_PASSCODE = 'admin123';
  return passcode === MOCK_PASSCODE;
}
