// FR Tech OS - Goals Service

import type { Goal } from '@/types/goal';
import { mockGoals } from '@/mocks/goals.mock';

/**
 * Filters goals for public view
 */
function filterPublicGoals(goals: Goal[]): Goal[] {
  return goals.filter(goal => goal.VisiblePublic === true);
}

/**
 * Get all public goals
 */
export async function getPublicGoals(): Promise<Goal[]> {
  // TODO: Replace with real API call
  return filterPublicGoals(mockGoals);
}

/**
 * Get all goals (admin)
 */
export async function getAllGoals(): Promise<Goal[]> {
  // TODO: Replace with real API call
  return mockGoals;
}

/**
 * Get goals for a specific KPI
 */
export async function getGoalsByKPI(kpiId: string): Promise<Goal[]> {
  // TODO: Replace with real API call
  return mockGoals.filter(goal => goal.KPI === kpiId);
}

/**
 * Get current week goals
 */
export async function getCurrentWeekGoals(): Promise<Goal[]> {
  // TODO: Replace with real API call
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  
  return mockGoals.filter(goal => 
    goal.WeekKey && goal.VisiblePublic
  );
}
