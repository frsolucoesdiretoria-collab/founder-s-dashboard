// FR Tech OS - Journal Route

import { Router } from 'express';
import { getJournalByDate, upsertJournalByDate } from '../lib/notionDataLayer';

export const journalRouter = Router();

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

