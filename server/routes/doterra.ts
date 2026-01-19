// Doterra - Outbound/BDR Reactivation Routes (isolated from AXIS CRM)

import { Router } from 'express';
import { validateAdminPasscode } from '../lib/guards';
import {
  createDatabase,
  createDoterraLead,
  findDoterraLeadByWhatsApp,
  getDoterraLeadById,
  getDoterraLeads,
  updateDoterraLead,
} from '../lib/notionDataLayer';

export const doterraRouter = Router();

const DEFAULT_PARENT_PAGE_ID = '2e084566a5fa801cbeb8ea094fce6433';
const DEFAULT_DB_TITLE = 'Doterra Leads';

function isDoterraPasscodeValid(passcode: string | undefined): boolean {
  if (!passcode) return false;
  // Prefer a dedicated passcode for the Doterra client module, fallback to global admin passcode.
  const stored = process.env.DOTERRA_ADMIN_PASSCODE || process.env.ADMIN_PASSCODE || 'admin123';
  if (process.env.DOTERRA_ADMIN_PASSCODE) {
    return passcode === process.env.DOTERRA_ADMIN_PASSCODE;
  }
  // Back-compat: if no dedicated passcode configured, use existing validator.
  return validateAdminPasscode(passcode) || passcode === stored;
}

function requireAdmin(req: any, res: any): boolean {
  const passcode = req.headers['x-admin-passcode'] as string | undefined;
  if (!isDoterraPasscodeValid(passcode)) {
    res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
    return false;
  }
  return true;
}

function nowIso(): string {
  return new Date().toISOString();
}

type ImportJobStatus = 'running' | 'done' | 'error';
type ImportJob = {
  id: string;
  kind: 'base' | 'ativados';
  startedAt: string;
  finishedAt?: string;
  status: ImportJobStatus;
  total: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: any; error: string }>;
  message?: string;
};

const importJobs = new Map<string, ImportJob>();

function makeJobId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function runImport(job: ImportJob, csvText: string): Promise<void> {
  job.status = 'running';
  job.message = 'Import iniciado';
  const rows = parseCsv(csvText);
  job.total = rows.length;

  // Fetch all current leads once and build a WhatsApp->Lead map for dedupe/upsert.
  const existingLeads = await getDoterraLeads();
  const existingByWhatsApp = new Map<string, any>();
  for (const l of existingLeads) {
    if (l?.WhatsApp) existingByWhatsApp.set(String(l.WhatsApp), l);
  }

  for (const row of rows) {
    const name = maybeFixLatin1Utf8(String(row.Name || row.name || '').trim());
    const phone = String(row.phone || row.WhatsApp || row.whatsapp || '').trim();
    const whatsapp = normalizePhoneToE164(phone);
    const cohort = String(row.COHORT || row.Cohort || row.cohort || '').trim();

    if (!name && !whatsapp) {
      job.skipped++;
      job.processed++;
      continue;
    }

    if (!whatsapp || whatsapp.length < 8 || whatsapp.length > 20) {
      job.errors.push({ row, error: 'Invalid phone/WhatsApp' });
      job.skipped++;
      job.processed++;
      continue;
    }

    const stage =
      job.kind === 'ativados'
        ? 'Contato ativado'
        : job.kind === 'base'
          ? 'Aguardando ativação'
          : row['status envio']?.toLowerCase?.().includes('enviado')
            ? 'Contato ativado'
            : 'Aguardando ativação';

    try {
      const existing = existingByWhatsApp.get(whatsapp) || null;
      if (existing) {
        await updateDoterraLead(existing.id, {
          Name: name || existing.Name,
          WhatsApp: whatsapp,
          Cohort: cohort || existing.Cohort,
          Stage: stage,
          Source: 'CSV import',
          LastEventAt: nowIso(),
          SentAt: stage === 'Contato ativado' ? nowIso() : existing.SentAt,
        });
        job.updated++;
      } else {
        const createdLead = await createDoterraLead({
          Name: name || whatsapp,
          WhatsApp: whatsapp,
          Cohort: cohort || undefined,
          Stage: stage,
          ApprovalStatus: stage.includes('Interessado') ? 'Pendente' : undefined,
          Source: 'CSV import',
          LastEventAt: nowIso(),
          SentAt: stage === 'Contato ativado' ? nowIso() : undefined,
        });
        existingByWhatsApp.set(whatsapp, createdLead);
        job.created++;
      }
    } catch (e: any) {
      job.errors.push({ row, error: e?.message || 'Unknown error' });
    } finally {
      job.processed++;
      if (job.processed % 50 === 0) {
        job.message = `Processados ${job.processed}/${job.total}`;
      }
    }
  }

  job.status = 'done';
  job.finishedAt = nowIso();
  job.message = `Import concluído (${job.created} criados, ${job.updated} atualizados, ${job.skipped} ignorados)`;
}

function normalizePhoneToE164(input: string): string {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';

  // If already includes country code
  if (digits.startsWith('55')) return `+${digits}`;

  // Assume BR local (10/11 digits)
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;

  // Fallback: treat as international digits
  return `+${digits}`;
}

function maybeFixLatin1Utf8(input: string): string {
  const s = input || '';
  if (!s) return s;
  // Heuristic: common mojibake markers
  if (!s.includes('Ã') && !s.includes('�')) return s;
  try {
    // Interpret as latin1 bytes and decode as utf8
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map(v => v.trim());
}

function parseCsv(csvText: string): Array<Record<string, string>> {
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function buildDoterraDbProperties() {
  const stageOptions = [
    { name: 'Aguardando ativação', color: 'gray' },
    { name: 'Contato ativado', color: 'blue' },
    { name: 'Entregue', color: 'purple' },
    { name: 'Lido', color: 'purple' },
    { name: 'Respondeu', color: 'yellow' },
    { name: 'Interessado (pendente aprovação)', color: 'orange' },
    { name: 'Interessado (aprovado)', color: 'green' },
    { name: 'Venda feita', color: 'green' },
    { name: 'Perdido', color: 'red' },
    { name: 'Não contatar', color: 'red' },
  ];

  const approvalOptions = [
    { name: 'Pendente', color: 'yellow' },
    { name: 'Aprovado', color: 'green' },
    { name: 'Reprovado', color: 'red' },
  ];

  const variantOptions = [
    { name: 'A', color: 'blue' },
    { name: 'B', color: 'purple' },
    { name: 'C', color: 'purple' },
    { name: 'D', color: 'yellow' },
  ];

  const sourceOptions = [
    { name: 'CSV import', color: 'gray' },
    { name: 'n8n webhook', color: 'blue' },
    { name: 'manual', color: 'yellow' },
  ];

  return {
    Name: { type: 'title', name: 'Name' },
    WhatsApp: { type: 'phone_number', name: 'WhatsApp' },
    Cohort: { type: 'select', name: 'Cohort', select: { options: Array.from({ length: 50 }, (_, i) => ({ name: String(i + 1), color: 'gray' })) } },
    MessageVariant: { type: 'select', name: 'MessageVariant', select: { options: variantOptions } },
    MessageText: { type: 'rich_text', name: 'MessageText' },
    Stage: { type: 'select', name: 'Stage', select: { options: stageOptions } },
    ApprovalStatus: { type: 'select', name: 'ApprovalStatus', select: { options: approvalOptions } },
    SentAt: { type: 'date', name: 'SentAt' },
    DeliveredAt: { type: 'date', name: 'DeliveredAt' },
    ReadAt: { type: 'date', name: 'ReadAt' },
    RepliedAt: { type: 'date', name: 'RepliedAt' },
    InterestedAt: { type: 'date', name: 'InterestedAt' },
    ApprovedAt: { type: 'date', name: 'ApprovedAt' },
    SoldAt: { type: 'date', name: 'SoldAt' },
    LastEventAt: { type: 'date', name: 'LastEventAt' },
    Source: { type: 'select', name: 'Source', select: { options: sourceOptions } },
    ExternalMessageId: { type: 'rich_text', name: 'ExternalMessageId' },
    ExternalLeadId: { type: 'rich_text', name: 'ExternalLeadId' },
    Notes: { type: 'rich_text', name: 'Notes' },
    Tags: { type: 'multi_select', name: 'Tags', multi_select: { options: [] } },
    DoNotContact: { type: 'checkbox', name: 'DoNotContact' },
    DuplicateOf: { type: 'rich_text', name: 'DuplicateOf' },
    AssignedTo: { type: 'select', name: 'AssignedTo', select: { options: [{ name: 'Ana', color: 'pink' }, { name: 'Alexandre', color: 'blue' }] } },
  } as const;
}

doterraRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Doterra' });
});

/**
 * POST /api/doterra/setup
 * Creates the single Notion database for Doterra under a parent page.
 * Requires x-admin-passcode
 */
doterraRouter.post('/setup', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    // If already configured, avoid creating multiple databases by accident.
    if (process.env.NOTION_DB_DOTERRA_LEADS) {
      return res.json({
        success: true,
        alreadyConfigured: true,
        databaseId: process.env.NOTION_DB_DOTERRA_LEADS,
        message:
          'NOTION_DB_DOTERRA_LEADS já está configurado. Para criar outra database, remova essa env var e reinicie o backend.',
      });
    }
    const parentPageId = (req.body?.parentPageId as string) || DEFAULT_PARENT_PAGE_ID;
    const title = (req.body?.title as string) || DEFAULT_DB_TITLE;
    const database = await createDatabase(parentPageId, title, buildDoterraDbProperties() as any, {
      notionToken: process.env.NOTION_TOKEN_DOTERRA,
    });
    res.json({
      success: true,
      database: { id: database.id, url: database.url, title: database.title, properties: database.properties },
      nextSteps: [
        'Defina a env var NOTION_DB_DOTERRA_LEADS com o database.id (sem hífens) no servidor.',
        'Reinicie o backend.',
      ],
    });
  } catch (error: any) {
    console.error('Error creating Doterra database:', error);
    res.status(500).json({ error: 'Failed to setup Doterra database', message: error.message });
  }
});

/**
 * GET /api/doterra/leads
 * Query leads with optional filters: cohort, stage, approvalStatus, search
 */
doterraRouter.get('/leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { cohort, stage, approvalStatus, search } = req.query as any;
    const leads = await getDoterraLeads({
      cohort: cohort || undefined,
      stage: stage || undefined,
      approvalStatus: approvalStatus || undefined,
      search: search || undefined,
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

/**
 * POST /api/doterra/leads
 * Create lead manually
 */
doterraRouter.post('/leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { Name, WhatsApp, Cohort, Stage, ApprovalStatus, Notes, MessageVariant, MessageText } = req.body || {};
    if (!Name) return res.status(400).json({ error: 'Name is required' });
    const lead = await createDoterraLead({
      Name: maybeFixLatin1Utf8(String(Name)),
      WhatsApp: WhatsApp ? normalizePhoneToE164(String(WhatsApp)) : undefined,
      Cohort: Cohort ? String(Cohort) : undefined,
      Stage: Stage ? String(Stage) : 'Aguardando ativação',
      ApprovalStatus: ApprovalStatus ? String(ApprovalStatus) : undefined,
      Notes: Notes ? String(Notes) : undefined,
      MessageVariant: MessageVariant ? String(MessageVariant) : undefined,
      MessageText: MessageText ? String(MessageText) : undefined,
      Source: 'manual',
      LastEventAt: nowIso(),
    });
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

/**
 * PUT /api/doterra/leads/:id
 * Update lead fields
 */
doterraRouter.put('/leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (updates.WhatsApp) updates.WhatsApp = normalizePhoneToE164(String(updates.WhatsApp));
    if (updates.Name) updates.Name = maybeFixLatin1Utf8(String(updates.Name));
    updates.LastEventAt = nowIso();
    const updated = await updateDoterraLead(id, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

/**
 * POST /api/doterra/leads/:id/approve
 */
doterraRouter.post('/leads/:id/approve', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const updated = await updateDoterraLead(id, {
      ApprovalStatus: 'Aprovado',
      Stage: 'Interessado (aprovado)',
      ApprovedAt: nowIso(),
      LastEventAt: nowIso(),
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve lead', message: error.message });
  }
});

/**
 * POST /api/doterra/leads/:id/reject
 */
doterraRouter.post('/leads/:id/reject', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const updated = await updateDoterraLead(id, {
      ApprovalStatus: 'Reprovado',
      Stage: 'Perdido',
      LastEventAt: nowIso(),
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject lead', message: error.message });
  }
});

/**
 * POST /api/doterra/webhook
 * Ingest events from n8n/Z-API (sent/delivered/read/replied/interest)
 * Requires x-admin-passcode OR DOTERRA_WEBHOOK_SECRET in header x-doterra-webhook-secret
 */
doterraRouter.post('/webhook', async (req, res) => {
  const passcode = req.headers['x-admin-passcode'] as string | undefined;
  const webhookSecret = req.headers['x-doterra-webhook-secret'] as string | undefined;
  const expectedSecret = process.env.DOTERRA_WEBHOOK_SECRET;
  const passcodeOk = passcode && validateAdminPasscode(passcode);
  const secretOk = expectedSecret && webhookSecret && webhookSecret === expectedSecret;
  if (!passcodeOk && !secretOk) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { eventType, phone, name, cohort, messageVariant, externalMessageId, externalLeadId, raw } = req.body || {};
    const whatsapp = normalizePhoneToE164(String(phone || ''));
    if (!whatsapp) return res.status(400).json({ error: 'phone is required' });

    const leadName = maybeFixLatin1Utf8(String(name || whatsapp));
    let lead = await findDoterraLeadByWhatsApp(whatsapp);
    if (!lead) {
      lead = await createDoterraLead({
        Name: leadName,
        WhatsApp: whatsapp,
        Cohort: cohort ? String(cohort) : undefined,
        MessageVariant: messageVariant ? String(messageVariant) : undefined,
        Source: 'n8n webhook',
        Stage: 'Aguardando ativação',
        LastEventAt: nowIso(),
        ExternalMessageId: externalMessageId ? String(externalMessageId) : undefined,
        ExternalLeadId: externalLeadId ? String(externalLeadId) : undefined,
        Notes: raw ? JSON.stringify(raw).slice(0, 1500) : undefined
      });
    }

    const t = nowIso();
    const updates: any = {
      Cohort: cohort ? String(cohort) : lead.Cohort,
      MessageVariant: messageVariant ? String(messageVariant) : lead.MessageVariant,
      ExternalMessageId: externalMessageId ? String(externalMessageId) : lead.ExternalMessageId,
      ExternalLeadId: externalLeadId ? String(externalLeadId) : lead.ExternalLeadId,
      LastEventAt: t,
      Source: 'n8n webhook'
    };

    switch (String(eventType || '').toLowerCase()) {
      case 'sent':
      case 'enviado':
        updates.Stage = 'Contato ativado';
        updates.SentAt = t;
        break;
      case 'delivered':
      case 'entregue':
        updates.Stage = 'Entregue';
        updates.DeliveredAt = t;
        break;
      case 'read':
      case 'lido':
        updates.Stage = 'Lido';
        updates.ReadAt = t;
        break;
      case 'replied':
      case 'respondeu':
        updates.Stage = 'Respondeu';
        updates.RepliedAt = t;
        break;
      case 'interest':
      case 'interesse':
        updates.Stage = 'Interessado (pendente aprovação)';
        updates.ApprovalStatus = 'Pendente';
        updates.InterestedAt = t;
        break;
      default:
        // unknown event: just stamp lastEventAt
        break;
    }

    const updated = await updateDoterraLead(lead.id, updates);
    res.json({ success: true, lead: updated });
  } catch (error: any) {
    console.error('Webhook ingest error:', error);
    res.status(500).json({ error: 'Failed to ingest webhook', message: error.message });
  }
});

/**
 * GET /api/doterra/cohorts/summary
 * Aggregates counts and conversions by cohort + message variant.
 */
doterraRouter.get('/cohorts/summary', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const leads = await getDoterraLeads();
    const groups = new Map<string, any>();

    const stages = [
      'Aguardando ativação',
      'Contato ativado',
      'Entregue',
      'Lido',
      'Respondeu',
      'Interessado (pendente aprovação)',
      'Interessado (aprovado)',
      'Venda feita',
    ];

    for (const lead of leads) {
      const cohort = lead.Cohort || '—';
      const variant = lead.MessageVariant || '—';
      const key = `${cohort}||${variant}`;
      if (!groups.has(key)) {
        groups.set(key, { cohort, variant, total: 0, counts: Object.fromEntries(stages.map(s => [s, 0])) });
      }
      const g = groups.get(key);
      g.total += 1;
      const st = lead.Stage || 'Aguardando ativação';
      if (g.counts[st] !== undefined) g.counts[st] += 1;
    }

    const summary = Array.from(groups.values()).map(g => {
      const total = g.total || 0;
      const activated = g.counts['Contato ativado'] || 0;
      const delivered = g.counts['Entregue'] || 0;
      const replied = g.counts['Respondeu'] || 0;
      const interested = (g.counts['Interessado (pendente aprovação)'] || 0) + (g.counts['Interessado (aprovado)'] || 0);
      const approved = g.counts['Interessado (aprovado)'] || 0;
      const sold = g.counts['Venda feita'] || 0;

      const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);

      return {
        cohort: g.cohort,
        variant: g.variant,
        total,
        counts: g.counts,
        conversion: {
          activated_pct: pct(activated, total),
          delivered_pct: pct(delivered, activated || total),
          replied_pct: pct(replied, delivered || activated || total),
          interested_pct: pct(interested, replied || delivered || activated || total),
          approved_pct: pct(approved, interested || replied || delivered || activated || total),
          sold_pct: pct(sold, approved || interested || replied || delivered || activated || total),
        },
      };
    });

    res.json(summary.sort((a, b) => (a.cohort + a.variant).localeCompare(b.cohort + b.variant)));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to build cohort summary', message: error.message });
  }
});

async function callOpenAI(prompt: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content:
            'Você é um CRO e copywriter especialista em reativação de base (clientes inativos). Gere mensagens éticas, claras e objetivas para WhatsApp.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`OpenAI error: HTTP ${response.status} ${errText}`);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  // Expect JSON array; fallback to splitting lines
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // ignore
  }
  return content
    .split('\n')
    .map((l: string) => l.replace(/^\s*[-*\d.]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 10);
}

/**
 * POST /api/doterra/cohorts/:cohortId/generate-variants
 * Generates message variants for the cohort.
 */
doterraRouter.post('/cohorts/:cohortId/generate-variants', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { cohortId } = req.params;
    const context = req.body?.context || '';
    const prompt = [
      `Crie 8 variações de mensagem de WhatsApp para reativar clientes inativos da doTERRA.`,
      `Objetivo: gerar demanda de recompra (não venda direta).`,
      `CTA: peça para responder exatamente "EU QUERO" para receber mais detalhes.`,
      `Regras: curto, humano, sem promessas exageradas, sem spam, com tom respeitoso.`,
      `Cohort: ${cohortId}.`,
      context ? `Contexto adicional: ${context}` : '',
      `Responda em JSON válido: ["mensagem 1", "mensagem 2", ...]`,
    ]
      .filter(Boolean)
      .join('\n');

    const variants = await callOpenAI(prompt);
    res.json({ cohortId, variants });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate variants', message: error.message });
  }
});

/**
 * POST /api/doterra/cohorts/:cohortId/apply-variant
 * Apply MessageVariant + MessageText to all leads in cohort.
 */
doterraRouter.post('/cohorts/:cohortId/apply-variant', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { cohortId } = req.params;
    const { MessageVariant, MessageText } = req.body || {};
    if (!MessageVariant || !MessageText) {
      return res.status(400).json({ error: 'MessageVariant and MessageText are required' });
    }

    const cohortLeads = await getDoterraLeads({ cohort: cohortId });
    let updatedCount = 0;
    for (const lead of cohortLeads) {
      await updateDoterraLead(lead.id, {
        MessageVariant: String(MessageVariant),
        MessageText: String(MessageText),
        LastEventAt: nowIso(),
      });
      updatedCount++;
    }

    res.json({ success: true, cohortId, updatedCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to apply variant', message: error.message });
  }
});

/**
 * POST /api/doterra/import/csv
 * Body: { kind: "base" | "ativados", csvText: string }
 */
doterraRouter.post('/import/csv', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { kind, csvText } = req.body || {};
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ error: 'csvText is required' });
    }

    const rows = parseCsv(csvText);
    // Performance: avoid querying Notion once per row (very slow on large CSVs).
    // We fetch all current leads once and build a WhatsApp->Lead map for dedupe/upsert.
    const existingLeads = await getDoterraLeads();
    const existingByWhatsApp = new Map<string, any>();
    for (const l of existingLeads) {
      if (l?.WhatsApp) existingByWhatsApp.set(String(l.WhatsApp), l);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ row: any; error: string }> = [];

    for (const row of rows) {
      const name = maybeFixLatin1Utf8(String(row.Name || row.name || '').trim());
      const phone = String(row.phone || row.WhatsApp || row.whatsapp || '').trim();
      const whatsapp = normalizePhoneToE164(phone);
      const cohort = String(row.COHORT || row.Cohort || row.cohort || '').trim();

      if (!name && !whatsapp) {
        skipped++;
        continue;
      }

      if (!whatsapp || whatsapp.length < 8 || whatsapp.length > 20) {
        errors.push({ row, error: 'Invalid phone/WhatsApp' });
        skipped++;
        continue;
      }

      const stage =
        kind === 'ativados'
          ? 'Contato ativado'
          : kind === 'base'
            ? 'Aguardando ativação'
            : row['status envio']?.toLowerCase?.().includes('enviado')
              ? 'Contato ativado'
              : 'Aguardando ativação';

      try {
        const existing = existingByWhatsApp.get(whatsapp) || null;
        if (existing) {
          await updateDoterraLead(existing.id, {
            Name: name || existing.Name,
            WhatsApp: whatsapp,
            Cohort: cohort || existing.Cohort,
            Stage: stage,
            Source: 'CSV import',
            LastEventAt: nowIso(),
            SentAt: stage === 'Contato ativado' ? nowIso() : existing.SentAt
          });
          updated++;
        } else {
          const createdLead = await createDoterraLead({
            Name: name || whatsapp,
            WhatsApp: whatsapp,
            Cohort: cohort || undefined,
            Stage: stage,
            ApprovalStatus: stage.includes('Interessado') ? 'Pendente' : undefined,
            Source: 'CSV import',
            LastEventAt: nowIso(),
            SentAt: stage === 'Contato ativado' ? nowIso() : undefined
          });
          existingByWhatsApp.set(whatsapp, createdLead);
          created++;
        }
      } catch (e: any) {
        errors.push({ row, error: e.message || 'Unknown error' });
      }
    }

    res.json({ success: true, kind, created, updated, skipped, errors: errors.slice(0, 25) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to import CSV', message: error.message });
  }
});

/**
 * POST /api/doterra/import/start
 * Starts a background import job (recommended for large CSVs)
 * Body: { kind: "base" | "ativados", csvText: string }
 */
doterraRouter.post('/import/start', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { kind, csvText } = req.body || {};
    if (kind !== 'base' && kind !== 'ativados') {
      return res.status(400).json({ error: 'kind must be base or ativados' });
    }
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ error: 'csvText is required' });
    }

    const job: ImportJob = {
      id: makeJobId(),
      kind,
      startedAt: nowIso(),
      status: 'running',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      message: 'Agendado',
    };
    importJobs.set(job.id, job);

    setImmediate(async () => {
      try {
        await runImport(job, csvText);
      } catch (e: any) {
        job.status = 'error';
        job.finishedAt = nowIso();
        job.message = e?.message || 'Erro no import';
      }
    });

    res.json({ success: true, jobId: job.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to start import', message: error.message });
  }
});

/**
 * GET /api/doterra/import/status/:jobId
 */
doterraRouter.get('/import/status/:jobId', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const job = importJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

/**
 * GET /api/doterra/export.csv
 * Export leads (filtered) as CSV
 */
doterraRouter.get('/export.csv', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { cohort, stage, approvalStatus, search } = req.query as any;
    const leads = await getDoterraLeads({
      cohort: cohort || undefined,
      stage: stage || undefined,
      approvalStatus: approvalStatus || undefined,
      search: search || undefined,
    });

    const headers = [
      'id',
      'Name',
      'WhatsApp',
      'Cohort',
      'MessageVariant',
      'Stage',
      'ApprovalStatus',
      'SentAt',
      'DeliveredAt',
      'ReadAt',
      'RepliedAt',
      'InterestedAt',
      'ApprovedAt',
      'SoldAt',
      'Source',
      'Notes',
    ];

    const esc = (v: any) => {
      const s = String(v ?? '');
      if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [headers.join(',')];
    for (const l of leads) {
      lines.push(
        [
          l.id,
          l.Name,
          l.WhatsApp || '',
          l.Cohort || '',
          l.MessageVariant || '',
          l.Stage || '',
          l.ApprovalStatus || '',
          l.SentAt || '',
          l.DeliveredAt || '',
          l.ReadAt || '',
          l.RepliedAt || '',
          l.InterestedAt || '',
          l.ApprovedAt || '',
          l.SoldAt || '',
          l.Source || '',
          l.Notes || '',
        ].map(esc).join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="doterra_export.csv"');
    res.send(lines.join('\n'));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export CSV', message: error.message });
  }
});

/**
 * POST /api/doterra/seed
 * Generates mock data for validation (admin only)
 */
doterraRouter.post('/seed', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const cohorts = ['1', '2', '3'];
    const variants = ['A', 'B'];
    const names = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Giovana', 'Henrique'];
    const stages = ['Aguardando ativação', 'Contato ativado', 'Entregue', 'Respondeu', 'Interessado (pendente aprovação)', 'Interessado (aprovado)', 'Venda feita'];

    const count = Math.min(Number(req.body?.count || 60), 200);
    const createdIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const cohort = cohorts[i % cohorts.length];
      const variant = variants[i % variants.length];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const whatsapp = `+55${(Math.floor(10000000000 + Math.random() * 89999999999)).toString()}`;
      const lead = await createDoterraLead({
        Name: `${names[i % names.length]} ${i + 1}`,
        WhatsApp: whatsapp,
        Cohort: cohort,
        MessageVariant: variant,
        Stage: stage,
        ApprovalStatus: stage.includes('pendente') ? 'Pendente' : stage.includes('aprovado') ? 'Aprovado' : undefined,
        Source: 'manual',
        LastEventAt: nowIso(),
      });
      createdIds.push(lead.id);
    }

    res.json({ success: true, created: createdIds.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to seed', message: error.message });
  }
});


