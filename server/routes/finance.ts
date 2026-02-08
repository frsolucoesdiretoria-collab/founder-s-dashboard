// FR Tech OS - Finance Route

import { Router } from 'express';
import { getTransactions, createTransaction, createTransactionsBulk } from '../lib/notionDataLayer';
import { validateAdminPasscode } from '../lib/guards';
import type { NotionTransaction } from '../../src/lib/notion/types';
import {
  getFinancialSummary,
  getFinancialHistory,
  getAccountBalances,
  getDecisionsBaseData,
  getExpenseAnalysis
} from '../services/finance.service';

export const financeRouter = Router();

/**
 * Validate passcode (admin or Flora's passcode)
 */
function validateFinancePasscode(passcode: string): boolean {
  // Admin passcode
  if (validateAdminPasscode(passcode)) {
    return true;
  }
  
  // Flora's passcode
  const floraPasscode = 'flora123';
  if (passcode === floraPasscode) {
    return true;
  }
  
  // Finance passcode (06092021)
  const financePasscode = '06092021';
  if (passcode === financePasscode) {
    return true;
  }
  
  return false;
}

// Middleware: validate passcode for all finance routes
financeRouter.use((req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateFinancePasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
});

/**
 * GET /api/finance/transactions
 * Get all transactions with optional filters
 */
financeRouter.get('/transactions', async (req, res) => {
  try {
    const { account, category, type, startDate, endDate, imported } = req.query;
    
    const filters: any = {};
    if (account) filters.account = account as string;
    if (category) filters.category = category as string;
    if (type && (type === 'Entrada' || type === 'Saída')) {
      filters.type = type;
    }
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;
    if (imported !== undefined) {
      filters.imported = imported === 'true';
    }
    
    const transactions = await getTransactions(filters);
    res.json(transactions);
  } catch (error: any) {
    console.error('❌ Error fetching transactions:', error);
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }
    if (error.code === 'object_not_found') {
      return res.status(404).json({ 
        error: 'Database not found',
        message: 'Transactions database not found. Please check your NOTION_DB_TRANSACTIONS configuration.'
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions
 * Create a single transaction
 */
financeRouter.post('/transactions', async (req, res) => {
  try {
    const { Name, Date, Amount, Type, Category, Account, Description, BudgetGoal } = req.body;
    
    if (!Name || !Date || Amount === undefined || !Type || !Account) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, Date, Amount, Type, and Account are required'
      });
    }
    
    const transaction = await createTransaction({
      Name,
      Date,
      Amount: Number(Amount),
      Type: Type as 'Entrada' | 'Saída',
      Category: Category || undefined,
      Account,
      Description: Description || undefined,
      BudgetGoal: BudgetGoal || undefined,
      Imported: false
    });
    
    res.json(transaction);
  } catch (error: any) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions/import
 * Import transactions from CSV file
 */
financeRouter.post('/transactions/import', async (req, res) => {
  try {
    const { csv, filename, account } = req.body;
    
    if (!csv || !filename || !account) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'csv, filename, and account are required'
      });
    }
    
    // Parse CSV
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid CSV',
        message: 'CSV must have at least a header and one data row'
      });
    }
    
    // Try to detect CSV format (Nubank style: Data, Descrição, Valor)
    const header = lines[0].toLowerCase();
    let dateIndex = -1;
    let descriptionIndex = -1;
    let amountIndex = -1;
    
    const headers = header.split(',').map((h: string) => h.trim().toLowerCase());
    
    // Find column indices
    dateIndex = headers.findIndex((h: string) => 
      h.includes('data') || h.includes('date')
    );
    descriptionIndex = headers.findIndex((h: string) => 
      h.includes('descri') || h.includes('description') || h.includes('histórico') || h.includes('detalhes')
    );
    amountIndex = headers.findIndex((h: string) => 
      h.includes('valor') || h.includes('amount') || h.includes('value')
    );
    
    if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
      return res.status(400).json({ 
        error: 'Invalid CSV format',
        message: 'CSV must have columns for Date, Description, and Amount'
      });
    }
    
    // Parse transactions
    const transactionsToCreate: Omit<NotionTransaction, 'id'>[] = [];
    const importDate = new Date().toISOString().split('T')[0];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV values that might contain commas (quoted)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length < Math.max(dateIndex, descriptionIndex, amountIndex) + 1) {
        continue; // Skip invalid rows
      }
      
      const dateStr = values[dateIndex]?.trim();
      const description = values[descriptionIndex]?.trim();
      const amountStr = values[amountIndex]?.trim();
      
      if (!dateStr || !description || !amountStr) {
        continue; // Skip incomplete rows
      }
      
      // Parse date (try different formats)
      let date = dateStr;
      // Nubank format: DD/MM/YYYY
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Parse amount (remove currency symbols, handle negative)
      let amount = parseFloat(amountStr.replace(/[R$\s.]/g, '').replace(',', '.'));
      if (isNaN(amount)) {
        continue; // Skip invalid amounts
      }
      
      // Determine type based on amount
      const type: 'Entrada' | 'Saída' = amount >= 0 ? 'Entrada' : 'Saída';
      // Store absolute value (negative for Saída)
      amount = Math.abs(amount);
      
      transactionsToCreate.push({
        Name: description.substring(0, 200) || 'Transação sem descrição',
        Date: date,
        Amount: type === 'Saída' ? -amount : amount,
        Type,
        Account: account,
        Description: description,
        Imported: true,
        ImportedAt: importDate,
        FileSource: filename
      });
    }
    
    if (transactionsToCreate.length === 0) {
      return res.status(400).json({ 
        error: 'No valid transactions found',
        message: 'Could not parse any valid transactions from the CSV'
      });
    }
    
    // Create transactions in bulk
    const result = await createTransactionsBulk(transactionsToCreate);
    
    res.json({
      success: true,
      created: result.created,
      skipped: result.skipped,
      total: transactionsToCreate.length,
      errors: result.errors
    });
  } catch (error: any) {
    console.error('❌ Error importing transactions:', error);
    res.status(500).json({ 
      error: 'Failed to import transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/summary
 * Get financial summary for current month
 * Returns all main KPIs calculated on backend
 */
financeRouter.get('/summary', async (req, res) => {
  try {
    const { account } = req.query;
    const summary = await getFinancialSummary(account as string | undefined);
    res.json(summary);
  } catch (error: any) {
    console.error('❌ Error fetching financial summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial summary',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/history
 * Get financial history (last 6 months)
 * Returns data for charts and trend analysis
 */
financeRouter.get('/history', async (req, res) => {
  try {
    const { account } = req.query;
    const history = await getFinancialHistory(account as string | undefined);
    res.json(history);
  } catch (error: any) {
    console.error('❌ Error fetching financial history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial history',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/accounts
 * Get account balances (total balance per account)
 */
financeRouter.get('/accounts', async (req, res) => {
  try {
    const balances = await getAccountBalances();
    res.json(balances);
  } catch (error: any) {
    console.error('❌ Error fetching account balances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch account balances',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/decisions-base
 * Get raw data for decision-making dashboard
 * Includes trends, comparisons, and insights
 */
financeRouter.get('/decisions-base', async (req, res) => {
  try {
    const { account } = req.query;
    const data = await getDecisionsBaseData(account as string | undefined);
    res.json(data);
  } catch (error: any) {
    console.error('❌ Error fetching decisions base data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch decisions base data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/expense-analysis
 * Get detailed expense analysis by category
 * Includes breakdown by type (essential, variable, debt)
 */
financeRouter.get('/expense-analysis', async (req, res) => {
  try {
    const { account } = req.query;
    const analysis = await getExpenseAnalysis(account as string | undefined);
    res.json(analysis);
  } catch (error: any) {
    console.error('❌ Error fetching expense analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch expense analysis',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance
 * Get finance metrics (placeholder - returns empty array if no metrics)
 * @deprecated Use /api/finance/summary instead
 */
financeRouter.get('/', async (req, res) => {
  try {
    // For now, return empty array - can be extended to return metrics
    res.json([]);
  } catch (error: any) {
    console.error('Error in finance route:', error);
    res.status(500).json({ 
      error: 'Failed to process finance request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
