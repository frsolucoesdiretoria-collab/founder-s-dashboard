import type { DoterraCohortSummary, DoterraLead } from '@/types/doterra';

function withPasscodeHeaders(passcode: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-passcode': passcode,
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message || data?.error || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function doterraHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch('/api/doterra/health');
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function doterraSetup(passcode: string, parentPageId?: string): Promise<any> {
  const res = await fetch('/api/doterra/setup', {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ parentPageId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getDoterraLeads(passcode: string, params?: {
  cohort?: string;
  stage?: string;
  approvalStatus?: string;
  search?: string;
}): Promise<DoterraLead[]> {
  const qs = new URLSearchParams();
  if (params?.cohort) qs.set('cohort', params.cohort);
  if (params?.stage) qs.set('stage', params.stage);
  if (params?.approvalStatus) qs.set('approvalStatus', params.approvalStatus);
  if (params?.search) qs.set('search', params.search);

  const res = await fetch(`/api/doterra/leads${qs.toString() ? `?${qs.toString()}` : ''}`, {
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateDoterraLead(passcode: string, id: string, updates: Partial<DoterraLead>): Promise<DoterraLead> {
  const res = await fetch(`/api/doterra/leads/${id}`, {
    method: 'PUT',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function approveDoterraLead(passcode: string, id: string): Promise<DoterraLead> {
  const res = await fetch(`/api/doterra/leads/${id}/approve`, {
    method: 'POST',
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function rejectDoterraLead(passcode: string, id: string): Promise<DoterraLead> {
  const res = await fetch(`/api/doterra/leads/${id}/reject`, {
    method: 'POST',
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getDoterraCohortsSummary(passcode: string): Promise<DoterraCohortSummary[]> {
  const res = await fetch('/api/doterra/cohorts/summary', {
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function generateCohortVariants(passcode: string, cohortId: string, context?: string): Promise<string[]> {
  const res = await fetch(`/api/doterra/cohorts/${encodeURIComponent(cohortId)}/generate-variants`, {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ context }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.variants || [];
}

export async function applyCohortVariant(passcode: string, cohortId: string, variant: string, text: string): Promise<{ updatedCount: number }> {
  const res = await fetch(`/api/doterra/cohorts/${encodeURIComponent(cohortId)}/apply-variant`, {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ MessageVariant: variant, MessageText: text }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function seedDoterra(passcode: string, count?: number): Promise<{ created: number }> {
  const res = await fetch('/api/doterra/seed', {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function importDoterraCsv(passcode: string, kind: 'base' | 'ativados', csvText: string): Promise<any> {
  // Legacy sync import (kept for small CSVs / debugging)
  const res = await fetch('/api/doterra/import/csv', {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ kind, csvText }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type DoterraImportJob = {
  id: string;
  kind: 'base' | 'ativados';
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'done' | 'error';
  total: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: any; error: string }>;
  message?: string;
};

export async function startDoterraImport(passcode: string, kind: 'base' | 'ativados', csvText: string): Promise<{ jobId: string }> {
  const res = await fetch('/api/doterra/import/start', {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
    body: JSON.stringify({ kind, csvText }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getDoterraImportStatus(passcode: string, jobId: string): Promise<DoterraImportJob> {
  const res = await fetch(`/api/doterra/import/status/${encodeURIComponent(jobId)}`, {
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function exportDoterraCsv(passcode: string, params?: {
  cohort?: string;
  stage?: string;
  approvalStatus?: string;
  search?: string;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  if (params?.cohort) qs.set('cohort', params.cohort);
  if (params?.stage) qs.set('stage', params.stage);
  if (params?.approvalStatus) qs.set('approvalStatus', params.approvalStatus);
  if (params?.search) qs.set('search', params.search);

  const res = await fetch(`/api/doterra/export.csv${qs.toString() ? `?${qs.toString()}` : ''}`, {
    headers: { 'x-admin-passcode': passcode },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.blob();
}


