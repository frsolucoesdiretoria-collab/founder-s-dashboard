// FR Tech OS - Goals Service

import type { Goal } from '@/types/goal';

/**
 * Filters goals for public view
 */
function filterPublicGoals(goals: Goal[]): Goal[] {
  return goals.filter(goal => goal.VisiblePublic === true);
}

/**
 * Get all public goals
 */
export async function getPublicGoals(range?: { start?: string; end?: string }): Promise<Goal[]> {
  try {
    const params = new URLSearchParams();
    if (range?.start) params.append('start', range.start);
    if (range?.end) params.append('end', range.end);
    
    const response = await fetch(`/api/goals?${params.toString()}`);
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (response.status === 0 || !response.ok) {
      // Verificar se é erro de conexão
      if (!response.ok && response.status !== 500) {
        throw new Error(`Servidor não está respondendo. Verifique se o servidor está rodando na porta 3001.`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Failed to fetch goals: ${response.statusText}`);
    }
    
    const goals: Goal[] = await response.json();
    return filterPublicGoals(goals);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    // Se for erro de rede, dar mensagem mais clara
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error; // Re-throw to let Dashboard handle it
  }
}

/**
 * Get all goals (admin)
 */
export async function getAllGoals(range?: { start?: string; end?: string }): Promise<Goal[]> {
  try {
    const params = new URLSearchParams();
    if (range?.start) params.append('start', range.start);
    if (range?.end) params.append('end', range.end);
    
    const response = await fetch(`/api/goals?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

/**
 * Get goals for a specific KPI
 */
export async function getGoalsByKPI(kpiId: string): Promise<Goal[]> {
  const goals = await getAllGoals();
  return goals.filter(goal => goal.KPI === kpiId);
}

/**
 * Get current week goals
 */
export async function getCurrentWeekGoals(): Promise<Goal[]> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const goals = await getPublicGoals({
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0]
  });
  
  return goals.filter(goal => goal.WeekKey);
}

/**
 * Get Enzo's goals
 */
export async function getEnzoGoals(range?: { start?: string; end?: string }): Promise<Goal[]> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    
    const params = new URLSearchParams();
    if (range?.start) params.append('start', range.start);
    if (range?.end) params.append('end', range.end);
    
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/goals?${params.toString()}` : `/api/enzo/goals?${params.toString()}`;
    const response = await fetch(apiUrl);
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      // Se for erro 500 ou outro erro do servidor, retornar array vazio
      if (response.status >= 500) {
        console.warn('⚠️  Server error fetching Enzo goals, returning empty array');
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Failed to fetch Enzo goals: ${response.statusText}`);
    }
    
    const goals: Goal[] = await response.json();
    return filterPublicGoals(goals);
  } catch (error: any) {
    console.error('Error fetching Enzo goals:', error);
    // Em caso de erro de conexão, retornar array vazio
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError' || error.message?.includes('conectar ao servidor')) {
      console.warn('⚠️  Connection error, returning empty array for Enzo goals');
      return [];
    }
    // Para outros erros, também retornar array vazio
    console.warn('⚠️  Error fetching Enzo goals, returning empty array');
    return [];
  }
}
