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
    
    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
    }
    const goals: Goal[] = await response.json();
    return filterPublicGoals(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
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
