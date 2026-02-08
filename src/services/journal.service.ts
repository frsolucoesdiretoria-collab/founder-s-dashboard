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

export interface JournalListResponse {
  items: Journal[];
  hasMore: boolean;
  nextCursor?: string;
}

export async function getJournals(params: {
  start?: string;
  end?: string;
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<JournalListResponse> {
  const search = new URLSearchParams();
  if (params.start) search.append('start', params.start);
  if (params.end) search.append('end', params.end);
  if (params.page) search.append('page', String(params.page));
  if (params.pageSize) search.append('pageSize', String(params.pageSize));
  if (params.query) search.append('query', params.query);

  const response = await fetch(`/api/journal?${search.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to list journals');
  }
  return response.json();
}

export interface JournalTodayStatus {
  date: string;
  morningDone: boolean;
  nightDone: boolean;
  filled: boolean;
}

export async function getJournalTodayStatus(): Promise<JournalTodayStatus> {
  const response = await fetch('/api/journal/today/status');
  if (!response.ok) {
    throw new Error('Failed to get today journal status');
  }
  return response.json();
}
