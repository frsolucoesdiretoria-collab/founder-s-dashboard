// FR Tech OS - Actions Service

import type { Action } from '@/types/action';

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
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/actions?start=${today}&end=${today}`);
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch actions: ${response.statusText}`);
    }
    const actions: Action[] = await response.json();
    return actions.filter(action => action.PublicVisible === true);
  } catch (error) {
    console.error('Error fetching daily actions:', error);
    throw error; // Re-throw to let Dashboard handle it
  }
}

/**
 * Get all actions
 */
export async function getAllActions(range?: { start?: string; end?: string }): Promise<Action[]> {
  try {
    const params = new URLSearchParams();
    if (range?.start) params.append('start', range.start);
    if (range?.end) params.append('end', range.end);
    
    const response = await fetch(`/api/actions?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch actions: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching actions:', error);
    return [];
  }
}

/**
 * Update action done status
 */
export async function updateActionDone(actionId: string, done: boolean): Promise<boolean> {
  try {
    const response = await fetch(`/api/actions/${actionId}/done`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ done })
    });
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.reason || error.error || 'Failed to update action');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating action:', error);
    throw error;
  }
}

/**
 * Create a new action (not implemented in API yet - would need to be added)
 */
export async function createAction(action: Omit<Action, 'id'>): Promise<Action> {
  // TODO: Implement in API if needed
  throw new Error('Create action not yet implemented in API');
}
