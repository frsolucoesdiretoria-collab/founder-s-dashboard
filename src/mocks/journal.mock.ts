// FR Tech OS - Journal Mock Data

import type { Journal } from '@/types/journal';

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

// In-memory state for journals
let journalsState: Journal[] = [
  {
    id: '1',
    Name: `Diário ${yesterday}`,
    Date: yesterday,
    Filled: false, // Not filled - will trigger modal
    Summary: '',
    WhatWorked: '',
    WhatFailed: '',
    Insights: '',
    Objections: '',
    ProcessIdeas: '',
    Tags: [],
    RelatedContact: '',
    RelatedClient: '',
    Attachments: []
  }
];

export function getMockJournals(): Journal[] {
  return [...journalsState];
}

export function getYesterdayMockJournal(): Journal | undefined {
  return journalsState.find(j => j.Date === yesterday);
}

export function isYesterdayJournalFilled(): boolean {
  const journal = getYesterdayMockJournal();
  return journal?.Filled ?? true; // If doesn't exist, consider filled
}

export function createMockJournal(journal: Partial<Journal>): Journal {
  const existingIndex = journalsState.findIndex(j => j.Date === journal.Date);
  
  if (existingIndex >= 0) {
    // Update existing
    journalsState[existingIndex] = {
      ...journalsState[existingIndex],
      ...journal,
      Filled: true
    };
    return journalsState[existingIndex];
  }
  
  // Create new
  const newJournal: Journal = {
    id: String(Date.now()),
    Name: `Diário ${journal.Date || today}`,
    Date: journal.Date || today,
    Filled: true,
    Summary: journal.Summary || '',
    WhatWorked: journal.WhatWorked || '',
    WhatFailed: journal.WhatFailed || '',
    Insights: journal.Insights || '',
    Objections: journal.Objections || '',
    ProcessIdeas: journal.ProcessIdeas || '',
    Tags: journal.Tags || [],
    RelatedContact: journal.RelatedContact || '',
    RelatedClient: journal.RelatedClient || '',
    Attachments: journal.Attachments || []
  };
  journalsState.push(newJournal);
  return newJournal;
}

export function updateMockJournalFilled(date: string): void {
  const journal = journalsState.find(j => j.Date === date);
  if (journal) {
    journal.Filled = true;
  }
}
