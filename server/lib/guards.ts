// FR Tech OS - Security Guards
// Server-side guards to prevent financial data exposure

import type { NotionKPI, NotionAction } from '../../src/lib/notion/types';

/**
 * Assert that a KPI is not financial (blocks financial KPIs in public routes)
 */
export function assertNotFinancialKPI(kpi: NotionKPI): void {
  if (kpi.IsFinancial) {
    throw new Error(`KPI "${kpi.Name}" is financial and cannot be exposed in public routes`);
  }
}

/**
 * Assert that no financial KPIs are in the array (public routes)
 */
export function assertNoFinancialKPIs(kpis: NotionKPI[]): void {
  const financialKPIs = kpis.filter(k => k.IsFinancial);
  if (financialKPIs.length > 0) {
    throw new Error(
      `Found ${financialKPIs.length} financial KPI(s) in public route: ${financialKPIs.map(k => k.Name).join(', ')}`
    );
  }
}

/**
 * Validate admin passcode
 */
export function validateAdminPasscode(passcode: string): boolean {
  const storedPasscode = process.env.ADMIN_PASSCODE || 'admin123'; // Default for dev
  return passcode === storedPasscode;
}

/**
 * Validate finance passcode
 */
export function validateFinancePasscode(passcode: string): boolean {
  const financePasscode = '06092021';
  return passcode === financePasscode;
}

/**
 * Check if action can be marked as done (must have Goal)
 */
export function canMarkActionDone(action: NotionAction): { allowed: boolean; reason?: string } {
  if (!action.Goal || action.Goal.trim() === '') {
    return {
      allowed: false,
      reason: 'Não é possível concluir uma ação sem meta associada'
    };
  }
  return { allowed: true };
}

