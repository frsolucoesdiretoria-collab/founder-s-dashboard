// FR Tech OS - Actions Service

import type { Action } from '@/types/action';
import { 
  getTodayMockActions, 
  updateMockActionDone, 
  createMockAction,
  getMockActions 
} from '@/mocks/actions.mock';

/**
 * Filters actions for public view
 */
function filterPublicActions(actions: Action[]): Action[] {
  return actions.filter(action => action.PublicVisible === true);
}

/**
 * Check if action can be marked as done
 */
export function canMarkActionDone(action: Action): { allowed: boolean; reason?: string } {
  if (!action.Goal || action.Goal.trim() === '') {
    return {
      allowed: false,
      reason: 'Não é possível concluir uma ação sem meta associada'
    };
  }
  return { allowed: true };
}

/**
 * Get today's actions
 */
export async function getDailyActions(): Promise<Action[]> {
  // TODO: Replace with real API call
  return filterPublicActions(getTodayMockActions());
}

/**
 * Get all actions
 */
export async function getAllActions(): Promise<Action[]> {
  // TODO: Replace with real API call
  return getMockActions();
}

/**
 * Update action done status
 */
export async function updateActionDone(actionId: string, done: boolean): Promise<boolean> {
  // TODO: Replace with real API call
  return updateMockActionDone(actionId, done);
}

/**
 * Create a new action
 */
export async function createAction(action: Omit<Action, 'id'>): Promise<Action> {
  // TODO: Replace with real API call
  return createMockAction(action);
}
