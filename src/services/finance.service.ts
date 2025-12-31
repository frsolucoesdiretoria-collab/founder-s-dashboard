// FR Tech OS - Finance Service

import type { KPI } from '@/types/kpi';

/**
 * Get financial KPIs
 */
export async function getFinancialKPIs(passcode?: string): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/admin', {
      headers: {
        'x-admin-passcode': passcode || localStorage.getItem('admin_passcode') || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial KPIs: ${response.statusText}`);
    }
    
    const allKPIs: KPI[] = await response.json();
    // Filter only financial KPIs
    return allKPIs.filter(kpi => kpi.IsFinancial === true);
  } catch (error) {
    console.error('Error fetching financial KPIs:', error);
    return [];
  }
}

/**
 * Get finance metrics
 */
export async function getFinanceMetrics(passcode?: string): Promise<any[]> {
  try {
    const response = await fetch('/api/finance/metrics', {
      headers: {
        'x-admin-passcode': passcode || localStorage.getItem('admin_passcode') || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch finance metrics: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching finance metrics:', error);
    return [];
  }
}

