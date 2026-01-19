// FR Tech OS - Actions Service

import { DAILY_PROPHECY_ACTION_NAME } from '@/constants/dailyRoutine';
import type { Action } from '@/types/action';

/**
 * Check if action can be marked as done
 */
export function canMarkActionDone(action: Action): { allowed: boolean; reason?: string } {
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
    
    const url = `/api/actions?${params.toString()}`;
    console.log('🔍 Buscando actions:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', response.status, errorText);
      throw new Error(`Failed to fetch actions: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Recebidas ${data.length} actions do backend`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching actions:', error);
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
 * Create a new action
 */
export async function createAction(action: Omit<Action, 'id'>): Promise<Action> {
  try {
    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(action)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create action');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating action:', error);
    throw error;
  }
}

/**
 * Update an existing action
 */
export async function updateAction(
  actionId: string,
  updates: Partial<Action & { ContactName?: string; ContactWhatsApp?: string }>
): Promise<Action> {
  try {
    const response = await fetch(`/api/actions/${actionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update action');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating action:', error);
    throw error;
  }
}

/**
 * Delete an action
 */
export async function deleteAction(actionId: string): Promise<void> {
  try {
    const response = await fetch(`/api/actions/${actionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete action');
    }
  } catch (error) {
    console.error('Error deleting action:', error);
    throw error;
  }
}

/**
 * Get Enzo's daily actions
 */
export async function getEnzoDailyActions(): Promise<Action[]> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/actions?start=${today}&end=${today}` : `/api/enzo/actions?start=${today}&end=${today}`;
    const response = await fetch(apiUrl);
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Enzo actions: ${response.statusText}`);
    }
    const actions: Action[] = await response.json();
    return actions.filter(action => action.PublicVisible === true);
  } catch (error) {
    console.error('Error fetching Enzo daily actions:', error);
    throw error;
  }
}

/**
 * Get all Enzo's actions
 */
export async function getEnzoActions(range?: { start?: string; end?: string }): Promise<Action[]> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    
    const params = new URLSearchParams();
    if (range?.start) params.append('start', range.start);
    if (range?.end) params.append('end', range.end);
    
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/actions?${params.toString()}` : `/api/enzo/actions?${params.toString()}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Enzo actions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Enzo actions:', error);
    return [];
  }
}

/**
 * Update Enzo's action done status
 */
export async function updateEnzoActionDone(actionId: string, done: boolean): Promise<boolean> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/actions/${actionId}/done` : `/api/enzo/actions/${actionId}/done`;
    const response = await fetch(apiUrl, {
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
      throw new Error(error.reason || error.error || 'Failed to update Enzo action');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating Enzo action:', error);
    throw error;
  }
}
