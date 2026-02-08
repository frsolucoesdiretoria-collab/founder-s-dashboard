// FR Tech OS - Security Guards
// Prevents financial data exposure and validates access

import type { NotionKPI, NotionGoal, NotionAction } from './types';
import { DAILY_PROPHECY_ACTION_NAME } from '@/constants/dailyRoutine';

/**
 * Filters KPIs to only show public, non-financial, active items
 */
export function filterPublicKPIs(kpis: NotionKPI[]): NotionKPI[] {
  return kpis.filter(kpi => 
    kpi.VisiblePublic === true && 
    kpi.Active === true && 
    kpi.IsFinancial === false
  );
}

/**
 * Filters goals to only show public items
 */
export function filterPublicGoals(goals: NotionGoal[]): NotionGoal[] {
  return goals.filter(goal => goal.VisiblePublic === true);
}

/**
 * Filters actions to only show public items
 */
export function filterPublicActions(actions: NotionAction[]): NotionAction[] {
  return actions.filter(action => action.PublicVisible === true);
}

/**
 * Validates if an action can be marked as done
 * Rule: Cannot complete action if Goal is empty
 */
export function canMarkActionDone(action: NotionAction): { allowed: boolean; reason?: string } {
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
 * Validates admin passcode
 */
export function validateAdminPasscode(passcode: string, storedPasscode: string): boolean {
  if (!storedPasscode) return false;
  return passcode === storedPasscode;
}

/**
 * Checks if partner feature is enabled
 */
export function isPartnerFeatureEnabled(featureFlag: string | undefined): boolean {
  return featureFlag === 'true';
}

/**
 * Strips financial data from any object (safety net)
 */
export function stripFinancialData<T extends Record<string, unknown>>(obj: T): T {
  const financialKeys = ['Earned', 'Amount', 'Value', 'Price', 'Cost', 'Revenue'];
  const result = { ...obj };
  
  for (const key of financialKeys) {
    if (key in result) {
      delete result[key];
    }
  }
  
  return result;
}
