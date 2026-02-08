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
    
    // Log para debug
    console.log(`📊 Retornando ${kpis.length} KPIs públicos`);
    
    res.json(kpis);
  } catch (error: any) {
    console.error('❌ Error fetching public KPIs:', error);
    console.error('   Error code:', error.code);
    console.error('   Error status:', error.status);
    console.error('   Error message:', error.message);
    
    // Handle rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    // Handle Notion API errors
    if (error.code === 'object_not_found' || error.message?.includes('not found') || error.message?.includes('Database')) {
      return res.status(404).json({ 
        error: 'Database not found',
        message: 'KPIs database not found. Please check your NOTION_DB_KPIS configuration and ensure the integration has access to the database.'
      });
    }
    
    // Handle authentication errors
    if (error.status === 401 || error.message?.includes('Token') || error.message?.includes('permission')) {
      return res.status(401).json({ 
        error: 'Notion authentication failed',
        message: 'Invalid NOTION_TOKEN or integration does not have access to the database. Check your token and database permissions.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching KPIs. Check server logs for details.'
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

