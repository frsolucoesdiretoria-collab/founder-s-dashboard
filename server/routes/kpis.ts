// FR Tech OS - KPIs Route
// Public and admin endpoints

import { Router } from 'express';
import { getKPIsPublic, getKPIsAdmin, updateKPI } from '../lib/notionDataLayer';
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

/**
 * PATCH /api/kpis/:id
 * Update KPI properties (admin only)
 * Body: { VisiblePublic?, VisibleAdmin?, SortOrder?, Active?, Periodicity?, ChartType?, IsFinancial? }
 * Enforcement: If IsFinancial=true, VisiblePublic is forced to false server-side
 */
kpisRouter.patch('/:id', async (req, res) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }

  try {
    const { id } = req.params;
    const updates = req.body;
    
    await updateKPI(id, updates);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating KPI:', error);
    res.status(500).json({ 
      error: 'Failed to update KPI',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

