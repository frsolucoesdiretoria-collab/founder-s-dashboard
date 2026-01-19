// FR Tech OS - Finance Service

import type { KPI } from '@/types/kpi';
import type { NotionTransaction } from '@/lib/notion/types';

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

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(
  passcode: string,
  filters?: {
    account?: string;
    category?: string;
    type?: 'Entrada' | 'Saída';
    startDate?: string;
    endDate?: string;
    imported?: boolean;
  }
): Promise<NotionTransaction[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.account) params.append('account', filters.account);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.imported !== undefined) params.append('imported', String(filters.imported));
    
    const response = await fetch(`/api/finance/transactions?${params.toString()}`, {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Create a single transaction
 */
export async function createTransaction(
  passcode: string,
  transaction: Omit<NotionTransaction, 'id' | 'Imported' | 'ImportedAt' | 'FileSource'>
): Promise<NotionTransaction> {
  try {
    const response = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': passcode
      },
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create transaction: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Import transactions from CSV file
 */
export async function importTransactionsFromCSV(
  passcode: string,
  csv: string,
  filename: string,
  account: string
): Promise<{ created: number; skipped: number; total: number; errors: string[] }> {
  try {
    const response = await fetch('/api/finance/transactions/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': passcode
      },
      body: JSON.stringify({ csv, filename, account })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to import transactions: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error importing transactions:', error);
    throw error;
  }
}
