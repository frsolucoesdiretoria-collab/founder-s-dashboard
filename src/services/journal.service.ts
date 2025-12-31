// FR Tech OS - Journal Service

import type { Journal, JournalCheckResult } from '@/types/journal';
import { 
  isYesterdayJournalFilled, 
  createMockJournal,
  getYesterdayMockJournal,
  getMockJournals
} from '@/mocks/journal.mock';

/**
 * Check if yesterday's journal is filled
 */
export async function checkYesterdayJournal(): Promise<JournalCheckResult> {
  // TODO: Replace with real API call
  const journal = getYesterdayMockJournal();
  return { 
    exists: !!journal, 
    filled: isYesterdayJournalFilled() 
  };
}

/**
 * Create or update journal entry
 */
export async function createJournalEntry(journal: Partial<Journal>): Promise<Journal> {
  // TODO: Replace with real API call
  return createMockJournal(journal);
}

/**
 * Get all journals
 */
export async function getAllJournals(): Promise<Journal[]> {
  // TODO: Replace with real API call
  return getMockJournals();
}

/**
 * Get journal by date
 */
export async function getJournalByDate(date: string): Promise<Journal | undefined> {
  // TODO: Replace with real API call
  const journals = getMockJournals();
  return journals.find(j => j.Date === date);
}
