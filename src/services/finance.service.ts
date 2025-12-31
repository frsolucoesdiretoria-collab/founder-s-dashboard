// FR Tech OS - Finance Service
// Admin only - requires passcode

export interface FinanceMetrics {
  mrr: number;
  arr: number;
  churn: number;
  nrr: number;
  expansion: number;
  contraction: number;
}

/**
 * Get finance metrics (admin only)
 */
export async function getFinanceMetrics(passcode: string): Promise<FinanceMetrics> {
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

