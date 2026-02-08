// FR Tech OS - Journal Types

export interface Journal {
  id: string;
  Name: string;
  Date: string;
  Filled: boolean;
  Summary: string;
  WhatWorked: string;
  WhatFailed: string;
  Insights: string;
  Objections: string;
  ProcessIdeas: string;
  Tags: string[];
  RelatedContact: string;
  RelatedClient: string;
  Attachments: string[];
  MorningCompletedAt?: string;
  NightSubmittedAt?: string;
  Comments?: string;
  Reviewed?: boolean;
  ReviewedBy?: string;
  ReviewedAt?: string;
  CreatedBy?: string;
  LastEditedBy?: string;
}

export interface JournalCheckResult {
  exists: boolean;
  filled: boolean;
}
