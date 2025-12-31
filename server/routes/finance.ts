// FR Tech OS - Finance Route
// Endpoints for finance metrics (DB11)

import { Router } from 'express';
import { getFinanceMetrics } from '../lib/notionDataLayer';
import { validateAdminPasscode } from '../lib/guards';

export const financeRouter = Router();

/**
 * GET /api/finance/metrics
 * Get finance metrics from DB11 (FinanceMetrics database)
 * Requires admin passcode
 */
financeRouter.get('/metrics', async (req, res) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }

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

