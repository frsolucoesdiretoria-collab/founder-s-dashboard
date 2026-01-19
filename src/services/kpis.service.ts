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
    
    if (response.status === 0 || !response.ok) {
      // Verificar se é erro de conexão
      if (!response.ok && response.status !== 500) {
        throw new Error(`Servidor não está respondendo. Verifique se o servidor está rodando na porta 3001.`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Failed to fetch KPIs: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Error fetching public KPIs:', error);
    // Se for erro de rede, dar mensagem mais clara
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
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
 * Get Enzo's KPIs (including financial for sales dashboard)
 */
export async function getEnzoKPIs(): Promise<KPI[]> {
  try {
    const response = await fetch('/api/enzo/kpis');
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (response.status === 0 || !response.ok) {
      if (!response.ok && response.status !== 500) {
        throw new Error(`Servidor não está respondendo. Verifique se o servidor está rodando na porta 3001.`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Failed to fetch Enzo KPIs: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Error fetching Enzo KPIs:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}
