// FR Tech OS - Actions Route

import { Router } from 'express';
import { getActions, toggleActionDone, ensureActionHasGoal, createAction, updateRelatedGoal } from '../lib/notionDataLayer';
import { canMarkActionDone } from '../lib/guards';

export const actionsRouter = Router();

/**
 * GET /api/actions
 * Get actions (optionally filtered by date range)
 * Query params: start, end (ISO date strings)
 */
actionsRouter.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const actions = await getActions(range);
    res.json(actions);
  } catch (error: any) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch actions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/actions
 * Create a new action
 * Body: { Name, Type, Date, Goal?, KPI?, Contact?, Client?, Notes?, ... }
 */
actionsRouter.post('/', async (req, res) => {
  try {
    const actionData = req.body;
    
    // Basic validation
    if (!actionData.Name || !actionData.Type || !actionData.Date) {
      return res.status(400).json({ 
        error: 'Missing required fields: Name, Type, Date' 
      });
    }

    const newAction = await createAction(actionData);
    res.status(201).json(newAction);
  } catch (error: any) {
    console.error('Error creating action:', error);
    res.status(500).json({ 
      error: 'Failed to create action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/actions/:id/done
 * Toggle action done status
 * Body: { done: boolean }
 */
actionsRouter.patch('/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Body must contain { done: boolean }' });
    }

    // Check if action can be marked as done
    const checkResult = await ensureActionHasGoal(id);
    if (!checkResult.allowed) {
      return res.status(400).json({ 
        error: 'Cannot mark action as done',
        reason: checkResult.reason
      });
    }

    await toggleActionDone(id, done);
    
    // If completed, update related Goal
    if (done) {
      try {
        await updateRelatedGoal(id);
      } catch (err) {
        console.warn('Could not update related goal:', err);
        // Don't fail the request if goal update fails
      }
    }
    
    res.json({ success: true, done });
  } catch (error: any) {
    console.error('Error updating action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

