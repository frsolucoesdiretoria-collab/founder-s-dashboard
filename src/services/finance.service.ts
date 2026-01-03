// FR Tech OS - Finance Service

import type { KPI } from '@/types/kpi';
import type { BudgetGoal, Transaction, FinanceSummary, ImportPreview, CategorizationRule } from '@/types/finance';

const FINANCE_PASSCODE = '06092021';

/**
 * Get auth headers
 */
function getAuthHeaders(passcode?: string) {
  return {
    'x-admin-passcode': passcode || FINANCE_PASSCODE
  };
}

/**
 * Get financial KPIs
 */
export async function getFinancialKPIs(passcode?: string): Promise<KPI[]> {
  try {
    const response = await fetch('/api/kpis/admin', {
      headers: getAuthHeaders(passcode)
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
      headers: getAuthHeaders(passcode)
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

/**
 * Get budget goals
 */
export async function getBudgetGoals(month?: number, year?: number, passcode?: string): Promise<BudgetGoal[]> {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await fetch(`/api/finance/budget-goals?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch budget goals: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching budget goals:', error);
    throw error;
  }
}

/**
 * Create a budget goal
 */
export async function createBudgetGoal(data: Omit<BudgetGoal, 'id' | 'SpentAmount' | 'Status'>, passcode?: string): Promise<BudgetGoal> {
  try {
    const response = await fetch('/api/finance/budget-goals', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create budget goal');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating budget goal:', error);
    throw error;
  }
}

/**
 * Update a budget goal
 */
export async function updateBudgetGoal(id: string, updates: Partial<BudgetGoal>, passcode?: string): Promise<BudgetGoal> {
  try {
    const response = await fetch(`/api/finance/budget-goals/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update budget goal');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating budget goal:', error);
    throw error;
  }
}

/**
 * Delete a budget goal
 */
export async function deleteBudgetGoal(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/budget-goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete budget goal');
    }
  } catch (error) {
    console.error('Error deleting budget goal:', error);
    throw error;
  }
}

/**
 * Get transactions
 */
export async function getTransactions(filters?: {
  category?: string;
  account?: string;
  type?: 'Entrada' | 'Saída';
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  uncategorized?: boolean;
}, passcode?: string): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.account) params.append('account', filters.account);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.uncategorized) params.append('uncategorized', 'true');
    
    const response = await fetch(`/api/finance/transactions?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
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
 * Create a transaction
 */
export async function createTransaction(data: Omit<Transaction, 'id' | 'Imported' | 'ImportedAt' | 'FileSource'>, passcode?: string): Promise<Transaction> {
  try {
    const response = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create transaction');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>, passcode?: string): Promise<Transaction> {
  try {
    const response = await fetch(`/api/finance/transactions/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update transaction');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete transaction');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Preview transactions from file (without importing)
 */
export async function previewTransactions(file: File, account: string, passcode?: string): Promise<{
  success: boolean;
  total: number;
  duplicates: number;
  transactions: Array<{
    Name: string;
    Date: string;
    Amount: number;
    Type: 'Entrada' | 'Saída';
    Account: string;
    isDuplicate: boolean;
    index: number;
  }>;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account', account);
    
    const response = await fetch('/api/finance/transactions/preview', {
      method: 'POST',
      headers: getAuthHeaders(passcode),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to preview transactions');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error previewing transactions:', error);
    throw error;
  }
}

/**
 * Import transactions from file
 */
export async function importTransactions(file: File, account: string, passcode?: string): Promise<{
  success: boolean;
  imported: number;
  duplicates: number;
  total: number;
  transactions: Transaction[];
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account', account);
    
    const response = await fetch('/api/finance/transactions/import', {
      method: 'POST',
      headers: getAuthHeaders(passcode),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to import transactions');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error importing transactions:', error);
    throw error;
  }
}

/**
 * Bulk categorize transactions
 */
export async function bulkCategorizeTransactions(
  transactionIds: string[],
  category?: string,
  budgetGoal?: string,
  passcode?: string
): Promise<{ success: boolean; updated: number; transactions: Transaction[] }> {
  try {
    const response = await fetch('/api/finance/transactions/bulk-categorize', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionIds, category, budgetGoal })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to bulk categorize transactions');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error bulk categorizing transactions:', error);
    throw error;
  }
}

/**
 * Get finance summary
 */
export async function getFinanceSummary(month?: number, year?: number, passcode?: string): Promise<FinanceSummary> {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await fetch(`/api/finance/summary?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch finance summary: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    throw error;
  }
}

// ============================================================================
// ACCOUNTS (Contas Bancárias)
// ============================================================================

export interface Account {
  id: string;
  Name: string;
  Type: 'Corrente' | 'Poupança' | 'Cartão de Crédito' | 'Investimento';
  Bank: string;
  AccountType: 'Empresarial' | 'Pessoal';
  InitialBalance: number;
  CurrentBalance: number;
  Limit?: number;
  Active: boolean;
  Notes?: string;
}

/**
 * Get all accounts
 */
export async function getAccounts(activeOnly?: boolean, passcode?: string): Promise<Account[]> {
  try {
    const params = new URLSearchParams();
    if (activeOnly) params.append('activeOnly', 'true');
    
    const response = await fetch(`/api/finance/accounts?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

/**
 * Create an account
 */
export async function createAccount(data: Omit<Account, 'id' | 'CurrentBalance'>, passcode?: string): Promise<Account> {
  try {
    const response = await fetch('/api/finance/accounts', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create account');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

/**
 * Update an account
 */
export async function updateAccount(id: string, updates: Partial<Account>, passcode?: string): Promise<Account> {
  try {
    const response = await fetch(`/api/finance/accounts/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update account');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// ============================================================================
// ACCOUNTS PAYABLE (Contas a Pagar)
// ============================================================================

export interface AccountPayable {
  id: string;
  Name: string;
  Description?: string;
  Amount: number;
  DueDate: string;
  PaidDate?: string;
  Status: 'Pendente' | 'Pago' | 'Vencido';
  Category?: string;
  Account?: string;
  Paid: boolean;
  Recurring?: boolean;
  RecurringRule?: string;
}

/**
 * Get accounts payable
 */
export async function getAccountsPayable(filters?: {
  status?: 'Pendente' | 'Pago' | 'Vencido';
  paid?: boolean;
  startDate?: string;
  endDate?: string;
}, passcode?: string): Promise<AccountPayable[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paid !== undefined) params.append('paid', filters.paid.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await fetch(`/api/finance/accounts-payable?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts payable: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching accounts payable:', error);
    throw error;
  }
}

/**
 * Create an account payable
 */
export async function createAccountPayable(data: Omit<AccountPayable, 'id' | 'Status' | 'Paid' | 'PaidDate'>, passcode?: string): Promise<AccountPayable> {
  try {
    const response = await fetch('/api/finance/accounts-payable', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create account payable');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating account payable:', error);
    throw error;
  }
}

/**
 * Update an account payable
 */
export async function updateAccountPayable(id: string, updates: Partial<AccountPayable>, passcode?: string): Promise<AccountPayable> {
  try {
    const response = await fetch(`/api/finance/accounts-payable/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update account payable');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating account payable:', error);
    throw error;
  }
}

/**
 * Delete an account payable
 */
export async function deleteAccountPayable(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/accounts-payable/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete account payable');
    }
  } catch (error) {
    console.error('Error deleting account payable:', error);
    throw error;
  }
}

// ============================================================================
// ACCOUNTS RECEIVABLE (Contas a Receber)
// ============================================================================

export interface AccountReceivable {
  id: string;
  Name: string;
  Description?: string;
  Amount: number;
  DueDate: string;
  ReceivedDate?: string;
  Status: 'Pendente' | 'Recebido' | 'Atrasado';
  Category?: string;
  Account?: string;
  Received: boolean;
  Recurring?: boolean;
  RecurringRule?: string;
}

/**
 * Get accounts receivable
 */
export async function getAccountsReceivable(filters?: {
  status?: 'Pendente' | 'Recebido' | 'Atrasado';
  received?: boolean;
  startDate?: string;
  endDate?: string;
}, passcode?: string): Promise<AccountReceivable[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.received !== undefined) params.append('received', filters.received.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await fetch(`/api/finance/accounts-receivable?${params.toString()}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts receivable: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching accounts receivable:', error);
    throw error;
  }
}

/**
 * Create an account receivable
 */
export async function createAccountReceivable(data: Omit<AccountReceivable, 'id' | 'Status' | 'Received' | 'ReceivedDate'>, passcode?: string): Promise<AccountReceivable> {
  try {
    const response = await fetch('/api/finance/accounts-receivable', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create account receivable');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating account receivable:', error);
    throw error;
  }
}

/**
 * Update an account receivable
 */
export async function updateAccountReceivable(id: string, updates: Partial<AccountReceivable>, passcode?: string): Promise<AccountReceivable> {
  try {
    const response = await fetch(`/api/finance/accounts-receivable/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update account receivable');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating account receivable:', error);
    throw error;
  }
}

/**
 * Delete an account receivable
 */
export async function deleteAccountReceivable(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/accounts-receivable/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete account receivable');
    }
  } catch (error) {
    console.error('Error deleting account receivable:', error);
    throw error;
  }
}

// ============================================================================
// CATEGORIZATION RULES (Regras de Categorização Automática)
// ============================================================================

/**
 * Get all categorization rules
 */
export async function getCategorizationRules(activeOnly: boolean = false, passcode?: string): Promise<CategorizationRule[]> {
  try {
    const response = await fetch(`/api/finance/categorization-rules?activeOnly=${activeOnly}`, {
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch categorization rules');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching categorization rules:', error);
    throw error;
  }
}

/**
 * Create a categorization rule
 */
export async function createCategorizationRule(data: Omit<CategorizationRule, 'id'>, passcode?: string): Promise<CategorizationRule> {
  try {
    const response = await fetch('/api/finance/categorization-rules', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create categorization rule');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating categorization rule:', error);
    throw error;
  }
}

/**
 * Update a categorization rule
 */
export async function updateCategorizationRule(id: string, updates: Partial<CategorizationRule>, passcode?: string): Promise<CategorizationRule> {
  try {
    const response = await fetch(`/api/finance/categorization-rules/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update categorization rule');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating categorization rule:', error);
    throw error;
  }
}

/**
 * Delete a categorization rule
 */
export async function deleteCategorizationRule(id: string, passcode?: string): Promise<void> {
  try {
    const response = await fetch(`/api/finance/categorization-rules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(passcode)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete categorization rule');
    }
  } catch (error) {
    console.error('Error deleting categorization rule:', error);
    throw error;
  }
}

/**
 * Apply categorization rules to transactions
 */
export async function applyCategorizationRules(transactionIds: string[], passcode?: string): Promise<{ updated: number; errors: number }> {
  try {
    const response = await fetch('/api/finance/categorization-rules/apply', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionIds })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to apply categorization rules');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error applying categorization rules:', error);
    throw error;
  }
}

/**
 * Get category suggestion for a transaction
 */
export async function suggestCategory(transactionName: string, accountType?: 'Empresarial' | 'Pessoal', passcode?: string): Promise<string | null> {
  try {
    const response = await fetch('/api/finance/categorization-rules/suggest', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(passcode),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionName, accountType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to get category suggestion');
    }
    
    const data = await response.json();
    return data.category || null;
  } catch (error) {
    console.error('Error getting category suggestion:', error);
    throw error;
  }
}

