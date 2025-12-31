// FR Tech OS - Actions Route

import { Router } from 'express';
import { getActions, toggleActionDone, ensureActionHasGoal } from '../lib/notionDataLayer';
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
    res.json({ success: true, done });
  } catch (error: any) {
    console.error('Error updating action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

