// FR Tech OS - Finance Route
// Admin only - requires passcode

import { Router } from 'express';
import { getFinanceMetrics } from '../lib/financeDataLayer';
import { validateAdminPasscode } from '../lib/guards';

export const financeRouter = Router();

// Middleware: validate passcode for all routes
financeRouter.use((req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
});

/**
 * GET /api/finance/metrics
 * Get finance metrics (admin only)
 */
financeRouter.get('/metrics', async (req, res) => {
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

