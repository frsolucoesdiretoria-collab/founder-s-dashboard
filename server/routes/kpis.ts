// FR Tech OS - KPIs Route
// Public and admin endpoints

import { Router } from 'express';
import { getKPIsPublic, getKPIsAdmin } from '../lib/notionDataLayer';
import { assertNoFinancialKPIs } from '../lib/guards';
import { validateAdminPasscode } from '../lib/guards';

export const kpisRouter = Router();

/**
 * GET /api/kpis/public
 * Get public KPIs (non-financial, active, visible)
 */
kpisRouter.get('/public', async (req, res) => {
  try {
    const kpis = await getKPIsPublic();
    
    // Double-check with guard (safety net)
    assertNoFinancialKPIs(kpis);
    
    res.json(kpis);
  } catch (error: any) {
    console.error('Error fetching public KPIs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/kpis/admin
 * Get all KPIs including financial (admin only)
 */
kpisRouter.get('/admin', async (req, res) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }

  try {
    const kpis = await getKPIsAdmin();
    res.json(kpis);
  } catch (error: any) {
    console.error('Error fetching admin KPIs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

