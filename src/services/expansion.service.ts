// FR Tech OS - Expansion Service

import type { ExpansionOpportunity, CustomerWin } from '@/types/expansion';
import { 
  getMockOpportunities, 
  getMockCustomerWins,
  createMockOpportunity,
  createMockCustomerWin,
  updateMockOpportunityStatus
} from '@/mocks/expansion.mock';

/**
 * Get all expansion opportunities
 */
export async function getExpansionOpportunities(): Promise<ExpansionOpportunity[]> {
  // TODO: Replace with real API call
  return getMockOpportunities();
}

/**
 * Get customer wins (Momento GOL)
 */
export async function getCustomerWins(): Promise<CustomerWin[]> {
  // TODO: Replace with real API call
  return getMockCustomerWins();
}

/**
 * Create new opportunity
 */
export async function createOpportunity(
  opportunity: Omit<ExpansionOpportunity, 'id'>
): Promise<ExpansionOpportunity> {
  // TODO: Replace with real API call
  return createMockOpportunity(opportunity);
}

/**
 * Update opportunity status
 */
export async function updateOpportunityStatus(
  id: string, 
  status: ExpansionOpportunity['Status']
): Promise<boolean> {
  // TODO: Replace with real API call
  return updateMockOpportunityStatus(id, status);
}

/**
 * Create customer win
 */
export async function createCustomerWin(
  win: Omit<CustomerWin, 'id'>
): Promise<CustomerWin> {
  // TODO: Replace with real API call
  return createMockCustomerWin(win);
}
