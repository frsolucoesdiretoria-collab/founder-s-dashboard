// FR Tech OS - Finance Business Logic Service
// Server-side only - handles ALL financial calculations and KPIs

import { getTransactions } from '../lib/notionDataLayer';
import type { NotionTransaction } from '../../src/lib/notion/types';

/**
 * ========================================
 * REGRAS DE NEGÓCIO - FINANÇAS PESSOAIS
 * ========================================
 * 
 * FONTE DA VERDADE: Database TRANSACTIONS
 * 
 * PERÍODO PADRÃO: Mês corrente (data atual)
 * STATUS: Apenas transações confirmadas (Imported = true OU manual)
 * 
 * DEFINIÇÕES:
 * - RECEITA: Type = 'Entrada', Amount > 0
 * - DESPESA: Type = 'Saída', Amount < 0
 * - DÍVIDA: Category = 'Dívida' OU Category contém 'Cartão' OU Category contém 'Empréstimo'
 * - CUSTO DE VIDA: Despesas com Category = 'Essencial' (exclui Dívidas e Variáveis)
 * - TAXA DE POUPANÇA: (Receitas - Despesas) / Receitas * 100
 * 
 * CATEGORIAS ESSENCIAIS (Custo de Vida):
 * - Moradia
 * - Alimentação
 * - Transporte
 * - Saúde
 * - Educação
 * 
 * CATEGORIAS VARIÁVEIS (NÃO entram no Custo de Vida):
 * - Lazer
 * - Compras
 * - Assinaturas
 * - Outros
 * 
 * CATEGORIAS DE DÍVIDA (NÃO entram no Custo de Vida):
 * - Dívida
 * - Cartão de Crédito
 * - Empréstimo
 * - Financiamento
 */

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get current month date range
 */
function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Check if transaction is a debt payment
 */
function isDebtTransaction(transaction: NotionTransaction): boolean {
  if (!transaction.Category) return false;
  
  const category = transaction.Category.toLowerCase();
  const debtKeywords = ['dívida', 'divida', 'cartão', 'cartao', 'empréstimo', 'emprestimo', 'financiamento'];
  
  return debtKeywords.some(keyword => category.includes(keyword));
}

/**
 * Check if transaction is an essential expense (cost of living)
 */
function isEssentialExpense(transaction: NotionTransaction): boolean {
  if (!transaction.Category) return false;
  
  const category = transaction.Category.toLowerCase();
  const essentialKeywords = ['moradia', 'alimentação', 'alimentacao', 'transporte', 'saúde', 'saude', 'educação', 'educacao', 'essencial'];
  
  return essentialKeywords.some(keyword => category.includes(keyword));
}

/**
 * Filter transactions by account (for Flora - only Nubank Pessoa Física)
 */
function filterByAccount(transactions: NotionTransaction[], account?: string): NotionTransaction[] {
  if (!account) return transactions;
  return transactions.filter(t => t.Account === account);
}

// ========================================
// KPI CALCULATION FUNCTIONS
// ========================================

/**
 * Calculate total income for a given period
 */
export function calculateTotalIncome(transactions: NotionTransaction[]): number {
  return transactions
    .filter(t => t.Type === 'Entrada' && t.Amount > 0)
    .reduce((sum, t) => sum + t.Amount, 0);
}

/**
 * Calculate total expenses for a given period
 */
export function calculateTotalExpenses(transactions: NotionTransaction[]): number {
  return transactions
    .filter(t => t.Type === 'Saída' && t.Amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
}

/**
 * Calculate balance (income - expenses)
 */
export function calculateBalance(transactions: NotionTransaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculate cost of living (essential expenses only, excludes debts)
 */
export function calculateCostOfLiving(transactions: NotionTransaction[]): number {
  return transactions
    .filter(t => 
      t.Type === 'Saída' && 
      t.Amount < 0 && 
      isEssentialExpense(t) && 
      !isDebtTransaction(t)
    )
    .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
}

/**
 * Calculate savings rate (%)
 */
export function calculateSavingsRate(transactions: NotionTransaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  
  if (income === 0) return 0;
  
  const savings = income - expenses;
  return (savings / income) * 100;
}

/**
 * Calculate total balance across all transactions (cumulative)
 */
export function calculateTotalBalance(transactions: NotionTransaction[]): number {
  return transactions.reduce((sum, t) => {
    if (t.Type === 'Entrada') return sum + t.Amount;
    if (t.Type === 'Saída') return sum + t.Amount; // Amount já é negativo
    return sum;
  }, 0);
}

/**
 * Calculate total debt payments
 */
export function calculateTotalDebts(transactions: NotionTransaction[]): number {
  return transactions
    .filter(t => t.Type === 'Saída' && t.Amount < 0 && isDebtTransaction(t))
    .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
}

/**
 * Group expenses by category
 */
export function groupExpensesByCategory(transactions: NotionTransaction[]): Record<string, number> {
  const expenses = transactions.filter(t => t.Type === 'Saída' && t.Amount < 0);
  
  const grouped: Record<string, number> = {};
  
  expenses.forEach(t => {
    const category = t.Category || 'Sem Categoria';
    if (!grouped[category]) {
      grouped[category] = 0;
    }
    grouped[category] += Math.abs(t.Amount);
  });
  
  return grouped;
}

/**
 * Get expense breakdown with percentages
 */
export function getExpenseBreakdown(transactions: NotionTransaction[]): Array<{
  category: string;
  amount: number;
  percentage: number;
}> {
  const grouped = groupExpensesByCategory(transactions);
  const total = calculateTotalExpenses(transactions);
  
  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
}

// ========================================
// MAIN SERVICE FUNCTIONS
// ========================================

/**
 * Get financial summary for current month
 */
export async function getFinancialSummary(account?: string): Promise<{
  period: { startDate: string; endDate: string };
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  costOfLiving: number;
  savingsRate: number;
  totalDebts: number;
  expensesByCategory: Record<string, number>;
}> {
  const { startDate, endDate } = getCurrentMonthRange();
  
  // Get all transactions for current month
  const allTransactions = await getTransactions({
    startDate,
    endDate
  });
  
  // Filter by account if specified (for Flora)
  const transactions = account ? filterByAccount(allTransactions, account) : allTransactions;
  
  return {
    period: { startDate, endDate },
    totalIncome: calculateTotalIncome(transactions),
    totalExpenses: calculateTotalExpenses(transactions),
    balance: calculateBalance(transactions),
    costOfLiving: calculateCostOfLiving(transactions),
    savingsRate: calculateSavingsRate(transactions),
    totalDebts: calculateTotalDebts(transactions),
    expensesByCategory: groupExpensesByCategory(transactions)
  };
}

/**
 * Get financial history (for charts - last 6 months)
 */
export async function getFinancialHistory(account?: string): Promise<Array<{
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}>> {
  const history: Array<{
    month: string;
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
  }> = [];
  
  // Get last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    // Get transactions for this month
    const allTransactions = await getTransactions({
      startDate,
      endDate
    });
    
    // Filter by account if specified
    const transactions = account ? filterByAccount(allTransactions, account) : allTransactions;
    
    const income = calculateTotalIncome(transactions);
    const expenses = calculateTotalExpenses(transactions);
    
    history.push({
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      income,
      expenses,
      balance: income - expenses,
      savingsRate: calculateSavingsRate(transactions)
    });
  }
  
  return history;
}

/**
 * Get account balances (total balance per account)
 */
export async function getAccountBalances(): Promise<Array<{
  account: string;
  balance: number;
  lastUpdate: string;
}>> {
  // Get ALL transactions (no date filter)
  const allTransactions = await getTransactions({});
  
  // Group by account
  const accountMap = new Map<string, NotionTransaction[]>();
  
  allTransactions.forEach(t => {
    if (!accountMap.has(t.Account)) {
      accountMap.set(t.Account, []);
    }
    accountMap.get(t.Account)!.push(t);
  });
  
  // Calculate balance for each account
  const balances: Array<{
    account: string;
    balance: number;
    lastUpdate: string;
  }> = [];
  
  accountMap.forEach((transactions, account) => {
    const balance = calculateTotalBalance(transactions);
    
    // Find last transaction date
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(b.Date).getTime() - new Date(a.Date).getTime()
    );
    const lastUpdate = sortedTransactions[0]?.Date || new Date().toISOString().split('T')[0];
    
    balances.push({
      account,
      balance,
      lastUpdate
    });
  });
  
  return balances.sort((a, b) => b.balance - a.balance);
}

/**
 * Get decisions base data (for decision-making dashboard)
 * Returns raw data to support financial decisions
 */
export async function getDecisionsBaseData(account?: string): Promise<{
  currentMonth: {
    income: number;
    expenses: number;
    balance: number;
    costOfLiving: number;
    savingsRate: number;
  };
  lastMonth: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
  };
  averageLast3Months: {
    income: number;
    expenses: number;
    costOfLiving: number;
    savingsRate: number;
  };
  trends: {
    incomeChange: number; // % change from last month
    expenseChange: number; // % change from last month
    savingsRateChange: number; // percentage points change
  };
}> {
  const now = new Date();
  
  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
  
  // Get transactions
  const currentMonthTransactions = await getTransactions({ startDate: currentMonthStart, endDate: currentMonthEnd });
  const lastMonthTransactions = await getTransactions({ startDate: lastMonthStart, endDate: lastMonthEnd });
  
  // Filter by account if specified
  const currentFiltered = account ? filterByAccount(currentMonthTransactions, account) : currentMonthTransactions;
  const lastFiltered = account ? filterByAccount(lastMonthTransactions, account) : lastMonthTransactions;
  
  // Current month data
  const currentIncome = calculateTotalIncome(currentFiltered);
  const currentExpenses = calculateTotalExpenses(currentFiltered);
  const currentBalance = currentIncome - currentExpenses;
  const currentCostOfLiving = calculateCostOfLiving(currentFiltered);
  const currentSavingsRate = calculateSavingsRate(currentFiltered);
  
  // Last month data
  const lastIncome = calculateTotalIncome(lastFiltered);
  const lastExpenses = calculateTotalExpenses(lastFiltered);
  const lastBalance = lastIncome - lastExpenses;
  const lastSavingsRate = calculateSavingsRate(lastFiltered);
  
  // Average last 3 months (including current)
  let totalIncome3M = 0;
  let totalExpenses3M = 0;
  let totalCostOfLiving3M = 0;
  let totalSavingsRate3M = 0;
  let count3M = 0;
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const transactions = await getTransactions({ startDate, endDate });
    const filtered = account ? filterByAccount(transactions, account) : transactions;
    
    totalIncome3M += calculateTotalIncome(filtered);
    totalExpenses3M += calculateTotalExpenses(filtered);
    totalCostOfLiving3M += calculateCostOfLiving(filtered);
    totalSavingsRate3M += calculateSavingsRate(filtered);
    count3M++;
  }
  
  const avgIncome = totalIncome3M / count3M;
  const avgExpenses = totalExpenses3M / count3M;
  const avgCostOfLiving = totalCostOfLiving3M / count3M;
  const avgSavingsRate = totalSavingsRate3M / count3M;
  
  // Calculate trends
  const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
  const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
  const savingsRateChange = currentSavingsRate - lastSavingsRate;
  
  return {
    currentMonth: {
      income: currentIncome,
      expenses: currentExpenses,
      balance: currentBalance,
      costOfLiving: currentCostOfLiving,
      savingsRate: currentSavingsRate
    },
    lastMonth: {
      income: lastIncome,
      expenses: lastExpenses,
      balance: lastBalance,
      savingsRate: lastSavingsRate
    },
    averageLast3Months: {
      income: avgIncome,
      expenses: avgExpenses,
      costOfLiving: avgCostOfLiving,
      savingsRate: avgSavingsRate
    },
    trends: {
      incomeChange,
      expenseChange,
      savingsRateChange
    }
  };
}

/**
 * Get expense breakdown with detailed categorization
 */
export async function getExpenseAnalysis(account?: string): Promise<{
  period: { startDate: string; endDate: string };
  totalExpenses: number;
  essentialExpenses: number;
  variableExpenses: number;
  debtPayments: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    type: 'essential' | 'variable' | 'debt';
  }>;
}> {
  const { startDate, endDate } = getCurrentMonthRange();
  
  const allTransactions = await getTransactions({ startDate, endDate });
  const transactions = account ? filterByAccount(allTransactions, account) : allTransactions;
  
  const expenses = transactions.filter(t => t.Type === 'Saída' && t.Amount < 0);
  const totalExpenses = calculateTotalExpenses(transactions);
  
  let essentialExpenses = 0;
  let variableExpenses = 0;
  let debtPayments = 0;
  
  const breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    type: 'essential' | 'variable' | 'debt';
  }> = [];
  
  const categoryMap = new Map<string, { amount: number; type: 'essential' | 'variable' | 'debt' }>();
  
  expenses.forEach(t => {
    const amount = Math.abs(t.Amount);
    const category = t.Category || 'Sem Categoria';
    
    let type: 'essential' | 'variable' | 'debt' = 'variable';
    
    if (isDebtTransaction(t)) {
      type = 'debt';
      debtPayments += amount;
    } else if (isEssentialExpense(t)) {
      type = 'essential';
      essentialExpenses += amount;
    } else {
      variableExpenses += amount;
    }
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { amount: 0, type });
    }
    
    const entry = categoryMap.get(category)!;
    entry.amount += amount;
  });
  
  categoryMap.forEach((data, category) => {
    breakdown.push({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      type: data.type
    });
  });
  
  breakdown.sort((a, b) => b.amount - a.amount);
  
  return {
    period: { startDate, endDate },
    totalExpenses,
    essentialExpenses,
    variableExpenses,
    debtPayments,
    breakdown
  };
}
