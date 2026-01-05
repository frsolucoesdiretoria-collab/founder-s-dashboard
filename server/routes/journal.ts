// FR Tech OS - Journal Route

import { Router } from 'express';
import { getJournalByDate, upsertJournalByDate, getJournals } from '../lib/notionDataLayer';

export const journalRouter = Router();

/**
 * GET /api/journal
 * List journals with pagination and filters
 * Query params: start, end, page, pageSize, query
 */
journalRouter.get('/', async (req, res) => {
  try {
    const start = req.query.start as string | undefined;
    const end = req.query.end as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
    const query = req.query.query as string | undefined;

    const result = await getJournals({
      start,
      end,
      page,
      pageSize
    });

    // Filter by query (search in Summary) if provided
    let items = result.items;
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      items = items.filter((journal) => 
        (journal.Summary || '').toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor
    });
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
 * Must come before /:date route to avoid matching "yesterday" as a date
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

