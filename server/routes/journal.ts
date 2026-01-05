// FR Tech OS - Journal Route

import { Router } from 'express';
import { getJournalByDate, upsertJournalByDate, getJournals } from '../lib/notionDataLayer';

export const journalRouter = Router();

/**
 * GET /api/journal/today/status
 * Returns morningDone, nightDone, filled for current date
 */
journalRouter.get('/today/status', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const journal = await getJournalByDate(today);

    const morningDone = !!(
      journal?.MorningCompletedAt ||
      journal?.ReviewedAt ||
      journal?.Reviewed ||
      journal?.Filled
    );
    const nightDone = !!(journal?.NightSubmittedAt || journal?.Filled);
    const filled = nightDone;

    res.json({
      date: today,
      morningDone,
      nightDone,
      filled
    });
  } catch (error: any) {
    console.error('Error checking today status:', error);
    res.status(500).json({
      error: 'Failed to get today status',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/journal/:date
 * Get journal by date (ISO date string: YYYY-MM-DD)
 */
journalRouter.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const journal = await getJournalByDate(date);
    
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }
    
    res.json(journal);
  } catch (error: any) {
    console.error('Error fetching journal:', error);
    res.status(500).json({ 
      error: 'Failed to fetch journal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/journal
 * List journals with optional date range, pagination and query
 * Query params: start, end, page, pageSize, query
 */
journalRouter.get('/', async (req, res) => {
  try {
    const { start, end, page, pageSize } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize as string, 10) : 30;

    const result = await getJournals({
      start: start as string | undefined,
      end: end as string | undefined,
      page: pageNum,
      pageSize: sizeNum
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error listing journals:', error);
    res.status(500).json({
      error: 'Failed to list journals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/journal/yesterday/check
 * Check if yesterday's journal is filled (for lock check)
 */
journalRouter.get('/yesterday/check', async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const journal = await getJournalByDate(yesterdayStr);
    
    res.json({
      exists: !!journal,
      filled: journal?.Filled || false,
      locked: !journal || !journal.Filled
    });
  } catch (error: any) {
    console.error('Error checking yesterday journal:', error);
    res.status(500).json({ 
      error: 'Failed to check journal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/journal/:date
 * Create or update journal by date
 * Body: Partial<NotionJournal>
 */
journalRouter.post('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const payload = req.body;
    
    const journal = await upsertJournalByDate(date, payload);
    res.json(journal);
  } catch (error: any) {
    console.error('Error upserting journal:', error);
    res.status(500).json({ 
      error: 'Failed to save journal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

