// FR Tech OS - KPI Service
// All data access goes through services - replace with real API later

import type { KPI } from '@/types/kpi';
import { mockKPIs } from '@/mocks/kpis.mock';

/**
 * Filters KPIs for public view (non-financial, active, visible)
 */
function filterPublicKPIs(kpis: KPI[]): KPI[] {
  return kpis.filter(kpi => 
    kpi.VisiblePublic === true && 
    kpi.Active === true && 
    kpi.IsFinancial === false
  );
}

/**
 * Get all public KPIs (safe for public dashboard)
 */
export async function getPublicKPIs(): Promise<KPI[]> {
  // TODO: Replace with real API call
  // const response = await fetch('/api/kpis/public');
  // return response.json();
  
  return filterPublicKPIs(mockKPIs);
}

/**
 * Get all KPIs including financial (admin only)
 */
export async function getAllKPIs(): Promise<KPI[]> {
  // TODO: Replace with real API call
  return mockKPIs;
}

/**
 * Get KPI by ID
 */
export async function getKPIById(id: string): Promise<KPI | undefined> {
  // TODO: Replace with real API call
  return mockKPIs.find(kpi => kpi.id === id);
}
