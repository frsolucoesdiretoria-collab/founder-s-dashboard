// FR Tech OS - Finance Route
// Admin only - handles finance metrics, budget goals, and transactions

import { Router } from 'express';
import multer from 'multer';
import { getFinanceMetrics, getBudgetGoals, createBudgetGoal, updateBudgetGoal, deleteBudgetGoal, getTransactions, createTransaction, updateTransaction, deleteTransaction, bulkCreateTransactions, bulkUpdateTransactions, getFinanceSummary, getAccounts, createAccount, updateAccount, deleteAccount, getAccountsPayable, createAccountPayable, updateAccountPayable, deleteAccountPayable, getAccountsReceivable, createAccountReceivable, updateAccountReceivable, deleteAccountReceivable, getCategorizationRules, createCategorizationRule, updateCategorizationRule, deleteCategorizationRule, applyCategorizationRules, bulkApplyCategorizationRules } from '../lib/notionDataLayer';
import { validateAdminPasscode, validateFinancePasscode } from '../lib/guards';
import { parseCSV } from '../lib/parsers/csvParser';
import { parseOFX, isOFXFormat } from '../lib/parsers/ofxParser';

export const financeRouter = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Middleware to validate finance passcode
 */
function validateFinanceAuth(req: any, res: any, next: any) {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || (!validateAdminPasscode(passcode) && !validateFinancePasscode(passcode))) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
  }

/**
 * GET /api/finance/metrics
 * Get finance metrics from FinanceMetrics database (DB11)
 */
financeRouter.get('/metrics', validateFinanceAuth, async (req, res) => {
  try {
    const metrics = await getFinanceMetrics();
    res.json(metrics);
  } catch (error: any) {
    console.error('Error fetching finance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch finance metrics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/budget-goals
 * Get budget goals with optional filters
 */
financeRouter.get('/budget-goals', validateFinanceAuth, async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    
    const goals = await getBudgetGoals(month, year);
    res.json(goals);
  } catch (error: any) {
    console.error('Error fetching budget goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch budget goals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/budget-goals
 * Create a new budget goal
 */
financeRouter.post('/budget-goals', validateFinanceAuth, async (req, res) => {
  try {
    const goal = await createBudgetGoal(req.body);
    res.json(goal);
  } catch (error: any) {
    console.error('Error creating budget goal:', error);
    res.status(500).json({ 
      error: 'Failed to create budget goal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/budget-goals/:id
 * Update a budget goal
 */
financeRouter.put('/budget-goals/:id', validateFinanceAuth, async (req, res) => {
  try {
    const goal = await updateBudgetGoal(req.params.id, req.body);
    res.json(goal);
  } catch (error: any) {
    console.error('Error updating budget goal:', error);
    res.status(500).json({ 
      error: 'Failed to update budget goal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/budget-goals/:id
 * Delete a budget goal
 */
financeRouter.delete('/budget-goals/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteBudgetGoal(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting budget goal:', error);
    res.status(500).json({ 
      error: 'Failed to delete budget goal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/transactions
 * Get transactions with optional filters
 */
financeRouter.get('/transactions', validateFinanceAuth, async (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.account) filters.account = req.query.account as string;
    if (req.query.type) filters.type = req.query.type as 'Entrada' | 'Saída';
    if (req.query.month) filters.month = parseInt(req.query.month as string);
    if (req.query.year) filters.year = parseInt(req.query.year as string);
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    if (req.query.uncategorized === 'true') filters.uncategorized = true;
    
    const transactions = await getTransactions(filters);
    res.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions
 * Create a new transaction
 */
financeRouter.post('/transactions', validateFinanceAuth, async (req, res) => {
  try {
    const transaction = await createTransaction(req.body);
    res.json(transaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/transactions/:id
 * Update a transaction
 */
financeRouter.put('/transactions/:id', validateFinanceAuth, async (req, res) => {
  try {
    const transaction = await updateTransaction(req.params.id, req.body);
    res.json(transaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ 
      error: 'Failed to update transaction',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/transactions/:id
 * Delete a transaction
 */
financeRouter.delete('/transactions/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      error: 'Failed to delete transaction',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions/preview
 * Preview transactions from CSV or OFX file without importing
 */
financeRouter.post('/transactions/preview', validateFinanceAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const account = req.body.account || 'Unknown';
    const fileContent = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;

    let parsedTransactions: Array<{
      Name: string;
      Date: string;
      Amount: number;
      Type: 'Entrada' | 'Saída';
      Account: string;
      Category?: string;
      FileSource?: string;
    }>;

    // Detect and parse file format
    if (isOFXFormat(fileContent)) {
      const ofxTransactions = parseOFX(fileContent);
      parsedTransactions = ofxTransactions.map(t => ({
        Name: t.description,
        Date: t.date,
        Amount: t.amount,
        Type: t.type,
        Account: account,
        FileSource: fileName
      }));
    } else {
      const csvTransactions = parseCSV(fileContent, account);
      parsedTransactions = csvTransactions.map(t => ({
        Name: t.description,
        Date: t.date,
        Amount: t.amount,
        Type: t.type,
        Account: account,
        FileSource: fileName
      }));
    }

    // Check for duplicates (by date, amount, and description)
    const existingTransactions = await getTransactions({
      startDate: parsedTransactions[0]?.Date,
      endDate: parsedTransactions[parsedTransactions.length - 1]?.Date
    });

    const transactionsWithDuplicates = parsedTransactions.map((newT, index) => {
      const isDuplicate = existingTransactions.some(existing => 
        existing.Date === newT.Date &&
        Math.abs(existing.Amount - newT.Amount) < 0.01 &&
        existing.Name.toLowerCase().includes(newT.Name.toLowerCase().substring(0, 20))
      );
      return {
        ...newT,
        isDuplicate,
        index
      };
    });

    res.json({
      success: true,
      total: parsedTransactions.length,
      duplicates: transactionsWithDuplicates.filter(t => t.isDuplicate).length,
      transactions: transactionsWithDuplicates
    });
  } catch (error: any) {
    console.error('Error previewing transactions:', error);
    res.status(500).json({ 
      error: 'Failed to preview transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions/import
 * Import transactions from CSV or OFX file
 */
financeRouter.post('/transactions/import', validateFinanceAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const account = req.body.account || 'Unknown';
    const fileContent = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;

    let parsedTransactions: Array<{
      Name: string;
      Date: string;
      Amount: number;
      Type: 'Entrada' | 'Saída';
      Account: string;
      Category?: string;
      FileSource?: string;
    }>;

    // Detect and parse file format
    if (isOFXFormat(fileContent)) {
      const ofxTransactions = parseOFX(fileContent);
      parsedTransactions = ofxTransactions.map(t => ({
        Name: t.description,
        Date: t.date,
        Amount: t.amount,
        Type: t.type,
        Account: account,
        FileSource: fileName
      }));
    } else {
      const csvTransactions = parseCSV(fileContent, account);
      parsedTransactions = csvTransactions.map(t => ({
        Name: t.description,
        Date: t.date,
        Amount: t.amount,
        Type: t.type,
        Account: account,
        FileSource: fileName
      }));
    }

    // Check for duplicates (by date, amount, and description)
    const existingTransactions = await getTransactions({
      startDate: parsedTransactions[0]?.Date,
      endDate: parsedTransactions[parsedTransactions.length - 1]?.Date
    });

    const duplicates: number[] = [];
    const toCreate = parsedTransactions.filter((newT, index) => {
      const isDuplicate = existingTransactions.some(existing => 
        existing.Date === newT.Date &&
        Math.abs(existing.Amount - newT.Amount) < 0.01 &&
        existing.Name.toLowerCase().includes(newT.Name.toLowerCase().substring(0, 20))
      );
      if (isDuplicate) {
        duplicates.push(index);
      }
      return !isDuplicate;
    });

    // Create transactions
    const created = await bulkCreateTransactions(toCreate);

    res.json({
      success: true,
      imported: created.length,
      duplicates: duplicates.length,
      total: parsedTransactions.length,
      transactions: created
    });
  } catch (error: any) {
    console.error('Error importing transactions:', error);
    res.status(500).json({ 
      error: 'Failed to import transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/transactions/bulk-categorize
 * Categorize multiple transactions at once
 */
financeRouter.post('/transactions/bulk-categorize', validateFinanceAuth, async (req, res) => {
  try {
    const { transactionIds, category, budgetGoal } = req.body;
    
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: 'transactionIds must be a non-empty array' });
    }

    const updates = transactionIds.map((id: string) => ({
      id,
      category,
      budgetGoal
    }));

    const updated = await bulkUpdateTransactions(updates);
    res.json({ success: true, updated: updated.length, transactions: updated });
  } catch (error: any) {
    console.error('Error bulk categorizing transactions:', error);
    res.status(500).json({ 
      error: 'Failed to bulk categorize transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/summary
 * Get finance summary for a given month/year
 */
financeRouter.get('/summary', validateFinanceAuth, async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    const summary = await getFinanceSummary(month, year);
    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch finance summary',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/accounts
 * Get all accounts
 */
financeRouter.get('/accounts', validateFinanceAuth, async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const accounts = await getAccounts(activeOnly);
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accounts',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/accounts
 * Create a new account
 */
financeRouter.post('/accounts', validateFinanceAuth, async (req, res) => {
  try {
    const account = await createAccount(req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ 
      error: 'Failed to create account',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/accounts/:id
 * Update an account
 */
financeRouter.put('/accounts/:id', validateFinanceAuth, async (req, res) => {
  try {
    const account = await updateAccount(req.params.id, req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ 
      error: 'Failed to update account',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/accounts/:id
 * Delete an account
 */
financeRouter.delete('/accounts/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteAccount(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/accounts-payable
 * Get accounts payable
 */
financeRouter.get('/accounts-payable', validateFinanceAuth, async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.paid !== undefined) filters.paid = req.query.paid === 'true';
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    
    const accounts = await getAccountsPayable(filters);
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts payable:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accounts payable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/accounts-payable
 * Create an account payable
 */
financeRouter.post('/accounts-payable', validateFinanceAuth, async (req, res) => {
  try {
    const account = await createAccountPayable(req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error creating account payable:', error);
    res.status(500).json({ 
      error: 'Failed to create account payable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/accounts-payable/:id
 * Update an account payable
 */
financeRouter.put('/accounts-payable/:id', validateFinanceAuth, async (req, res) => {
  try {
    const account = await updateAccountPayable(req.params.id, req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error updating account payable:', error);
    res.status(500).json({ 
      error: 'Failed to update account payable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/accounts-payable/:id
 * Delete an account payable
 */
financeRouter.delete('/accounts-payable/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteAccountPayable(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account payable:', error);
    res.status(500).json({ 
      error: 'Failed to delete account payable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/accounts-receivable
 * Get accounts receivable
 */
financeRouter.get('/accounts-receivable', validateFinanceAuth, async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.received !== undefined) filters.received = req.query.received === 'true';
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    
    const accounts = await getAccountsReceivable(filters);
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts receivable:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accounts receivable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/accounts-receivable
 * Create an account receivable
 */
financeRouter.post('/accounts-receivable', validateFinanceAuth, async (req, res) => {
  try {
    const account = await createAccountReceivable(req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error creating account receivable:', error);
    res.status(500).json({ 
      error: 'Failed to create account receivable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/accounts-receivable/:id
 * Update an account receivable
 */
financeRouter.put('/accounts-receivable/:id', validateFinanceAuth, async (req, res) => {
  try {
    const account = await updateAccountReceivable(req.params.id, req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Error updating account receivable:', error);
    res.status(500).json({ 
      error: 'Failed to update account receivable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/accounts-receivable/:id
 * Delete an account receivable
 */
financeRouter.delete('/accounts-receivable/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteAccountReceivable(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account receivable:', error);
    res.status(500).json({ 
      error: 'Failed to delete account receivable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/finance/categorization-rules
 * Get all categorization rules
 */
financeRouter.get('/categorization-rules', validateFinanceAuth, async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const rules = await getCategorizationRules(activeOnly);
    res.json(rules);
  } catch (error: any) {
    console.error('Error fetching categorization rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categorization rules',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/categorization-rules
 * Create a categorization rule
 */
financeRouter.post('/categorization-rules', validateFinanceAuth, async (req, res) => {
  try {
    const rule = await createCategorizationRule(req.body);
    res.json(rule);
  } catch (error: any) {
    console.error('Error creating categorization rule:', error);
    res.status(500).json({ 
      error: 'Failed to create categorization rule',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/finance/categorization-rules/:id
 * Update a categorization rule
 */
financeRouter.put('/categorization-rules/:id', validateFinanceAuth, async (req, res) => {
  try {
    const rule = await updateCategorizationRule(req.params.id, req.body);
    res.json(rule);
  } catch (error: any) {
    console.error('Error updating categorization rule:', error);
    res.status(500).json({ 
      error: 'Failed to update categorization rule',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/finance/categorization-rules/:id
 * Delete a categorization rule
 */
financeRouter.delete('/categorization-rules/:id', validateFinanceAuth, async (req, res) => {
  try {
    await deleteCategorizationRule(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting categorization rule:', error);
    res.status(500).json({ 
      error: 'Failed to delete categorization rule',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/categorization-rules/apply
 * Apply categorization rules to transactions
 */
financeRouter.post('/categorization-rules/apply', validateFinanceAuth, async (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: 'transactionIds must be a non-empty array' });
    }

    const result = await bulkApplyCategorizationRules(transactionIds);
    res.json(result);
  } catch (error: any) {
    console.error('Error applying categorization rules:', error);
    res.status(500).json({ 
      error: 'Failed to apply categorization rules',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/finance/categorization-rules/suggest
 * Get category suggestion for a transaction
 */
financeRouter.post('/categorization-rules/suggest', validateFinanceAuth, async (req, res) => {
  try {
    const { transactionName, accountType } = req.body;
    
    if (!transactionName) {
      return res.status(400).json({ error: 'transactionName is required' });
    }

    const suggestedCategory = await applyCategorizationRules(transactionName, accountType);
    res.json({ category: suggestedCategory });
  } catch (error: any) {
    console.error('Error getting category suggestion:', error);
    res.status(500).json({ 
      error: 'Failed to get category suggestion',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
