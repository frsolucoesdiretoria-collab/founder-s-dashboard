// FR Tech OS - Finance Service
// Service for financial KPIs and metrics

import type { KPI } from '@/types/kpi';

/**
 * Get financial KPIs only (requires admin passcode)
 */
export async function getFinancialKPIs(passcode: string): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/financial', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid passcode');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial KPIs: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching financial KPIs:', error);
    throw error;
  }
}

/**
 * Get finance metrics from DB11 (FinanceMetrics database)
 */
export async function getFinanceMetrics(passcode: string): Promise<any[]> {
  try {
    const response = await fetch('/api/finance/metrics', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid passcode');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch finance metrics: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching finance metrics:', error);
    throw error;
  }
}

