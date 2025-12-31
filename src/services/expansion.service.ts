// FR Tech OS - Expansion Service

import type { ExpansionOpportunity, CustomerWin, Client } from '@/types/expansion';

/**
 * Get all expansion opportunities (optionally filtered by Stage)
 */
export async function getExpansionOpportunities(stage?: string): Promise<ExpansionOpportunity[]> {
  try {
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    
    const response = await fetch(`/api/expansion/opportunities?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching expansion opportunities:', error);
    throw error;
  }
}

/**
 * Get customer wins (optionally filtered by IsGOL and last N days)
 */
export async function getCustomerWins(filters?: { isGOL?: boolean; lastDays?: number }): Promise<CustomerWin[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.isGOL !== undefined) params.append('isGOL', String(filters.isGOL));
    if (filters?.lastDays) params.append('lastDays', String(filters.lastDays));
    
    const response = await fetch(`/api/expansion/customer-wins?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch customer wins: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching customer wins:', error);
    throw error;
  }
}

/**
 * Get active clients
 */
export async function getClients(): Promise<Client[]> {
  try {
    const response = await fetch('/api/expansion/clients');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

/**
 * Create new opportunity
 */
export async function createOpportunity(
  opportunity: Omit<ExpansionOpportunity, 'id'>
): Promise<{ id: string }> {
  try {
    const response = await fetch('/api/expansion/opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create opportunity: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
}

/**
 * Create customer win (triggers GOL flow if Score >= 8)
 */
export async function createCustomerWin(
  win: Omit<CustomerWin, 'id'>
): Promise<{ id: string; isGOL: boolean }> {
  try {
    const response = await fetch('/api/expansion/customer-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(win)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || `Failed to create customer win: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating customer win:', error);
    throw error;
  }
}
