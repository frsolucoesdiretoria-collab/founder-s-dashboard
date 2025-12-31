// FR Tech OS - KPI Service
// All data access goes through services - now using real API

import type { KPI } from '@/types/kpi';

/**
 * Get all public KPIs (safe for public dashboard)
 */
export async function getPublicKPIs(): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/public');
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching public KPIs:', error);
    throw error; // Re-throw to let Dashboard handle it
  }
}

/**
 * Get all KPIs including financial (admin only)
 */
export async function getAllKPIs(passcode: string): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/admin', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch admin KPIs: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching admin KPIs:', error);
    throw error;
  }
}

/**
 * Get KPI by ID
 */
export async function getKPIById(id: string): Promise<KPI | undefined> {
  // Get from public list (or admin if needed)
  const kpis = await getPublicKPIs();
  return kpis.find(kpi => kpi.id === id);
}

/**
 * Update KPI (admin only)
 */
export async function updateKPI(
  id: string,
  updates: {
    VisiblePublic?: boolean;
    VisibleAdmin?: boolean;
    SortOrder?: number;
    Active?: boolean;
    Periodicity?: string;
    ChartType?: string;
    IsFinancial?: boolean;
  },
  passcode: string
): Promise<void> {
  try {
    const response = await fetch(`/api/kpis/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': passcode
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update KPI: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating KPI:', error);
    throw error;
  }
}
