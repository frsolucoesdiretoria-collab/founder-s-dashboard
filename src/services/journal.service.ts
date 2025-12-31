// FR Tech OS - Journal Service

import type { Journal, JournalCheckResult } from '@/types/journal';

/**
 * Check if yesterday's journal is filled
 */
export async function checkYesterdayJournal(): Promise<JournalCheckResult> {
  try {
    const response = await fetch('/api/journal/yesterday/check');
    if (!response.ok) {
      throw new Error(`Failed to check journal: ${response.statusText}`);
    }
    const result = await response.json();
    return {
      exists: result.exists,
      filled: result.filled
    };
  } catch (error) {
    console.error('Error checking yesterday journal:', error);
    return { exists: false, filled: false };
  }
}

/**
 * Create or update journal entry
 */
export async function createJournalEntry(journal: Partial<Journal>): Promise<Journal> {
  if (!journal.Date) {
    throw new Error('Journal date is required');
  }
  
  try {
    const response = await fetch(`/api/journal/${journal.Date}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(journal)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save journal: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving journal:', error);
    throw error;
  }
}

/**
 * Get all journals (not implemented in API - would need date range)
 */
export async function getAllJournals(): Promise<Journal[]> {
  // TODO: Implement if needed with date range
  return [];
}

/**
 * Get journal by date
 */
export async function getJournalByDate(date: string): Promise<Journal | undefined> {
  try {
    const response = await fetch(`/api/journal/${date}`);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch journal: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching journal:', error);
    return undefined;
  }
}
