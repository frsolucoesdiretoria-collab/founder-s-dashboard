// FR Tech OS - Finance Service

import type { KPI } from '@/types/kpi';

/**
 * Get financial KPIs (admin only)
 */
export async function getFinancialKPIs(passcode: string): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/admin', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial KPIs: ${response.statusText}`);
    }
    
    const kpis: KPI[] = await response.json();
    // Filter only financial KPIs
    return kpis.filter(kpi => kpi.IsFinancial === true);
  } catch (error) {
    console.error('Error fetching financial KPIs:', error);
    throw error;
  }
}

/**
 * Get finance metrics from DB11
 */
export async function getFinanceMetrics(passcode: string): Promise<any[]> {
  try {
    const response = await fetch('/api/finance', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (!response.ok) {
      // Return empty array if finance endpoint is not available
      console.warn('Finance metrics endpoint not available');
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching finance metrics:', error);
    return [];
  }
}
