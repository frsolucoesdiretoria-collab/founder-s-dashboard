// FR Tech OS - Enzo Canei Dashboard Routes
// Dashboard de vendas separado da Axis

import { Router } from 'express';
import { getKPIsEnzo, getGoalsEnzo, getActionsEnzo, ensureActionHasGoalEnzo, toggleActionDoneEnzo } from '../lib/notionDataLayer';

export const enzoRouter = Router();

/**
 * GET /api/enzo/kpis
 * Get all Enzo's KPIs (including financial for sales dashboard)
 */
enzoRouter.get('/kpis', async (req, res) => {
  try {
    const kpis = await getKPIsEnzo();
    res.json(kpis);
  } catch (error: any) {
    console.error('Error fetching Enzo KPIs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/enzo/goals
 * Get Enzo's goals (optionally filtered by date range)
 */
enzoRouter.get('/goals', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const goals = await getGoalsEnzo(range);
    res.json(goals);
  } catch (error: any) {
    console.error('Error fetching Enzo goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/enzo/actions
 * Get Enzo's actions (optionally filtered by date range)
 */
enzoRouter.get('/actions', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const actions = await getActionsEnzo(range);
    res.json(actions);
  } catch (error: any) {
    console.error('Error fetching Enzo actions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch actions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/enzo/actions/:id/done
 * Toggle Enzo's action done status
 */
enzoRouter.patch('/actions/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    // Validate action has goal
    const validation = await ensureActionHasGoalEnzo(id);
    if (!validation.allowed && done === true) {
      return res.status(400).json({
        error: 'Action cannot be completed',
        reason: validation.reason
      });
    }

    await toggleActionDoneEnzo(id, done === true);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating Enzo action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

