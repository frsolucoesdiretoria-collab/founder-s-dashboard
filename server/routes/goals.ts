// FR Tech OS - Goals Route

import { Router } from 'express';
import { getGoals } from '../lib/notionDataLayer';

export const goalsRouter = Router();

/**
 * GET /api/goals
 * Get goals (optionally filtered by date range)
 * Query params: start, end (ISO date strings)
 */
goalsRouter.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const goals = await getGoals(range);
    res.json(goals);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

