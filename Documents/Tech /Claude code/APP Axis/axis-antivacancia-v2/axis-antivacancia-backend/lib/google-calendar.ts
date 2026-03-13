/**
 * Google Calendar integration library
 * Handles OAuth, token management, event sync, and appointment write-back
 */
import { supabaseAdmin } from './supabase';

// ---------------------------------------------------------------------------
// OAuth Configuration
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/api/integrations/google-calendar/callback';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

// ---------------------------------------------------------------------------
// OAuth URL
// ---------------------------------------------------------------------------

export function getAuthUrl(organizationId: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: organizationId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

export async function exchangeCodeForToken(code: string, organizationId: string): Promise<void> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Token exchange failed: ${JSON.stringify(err)}`);
  }

  const tokens = await res.json();

  // Fetch calendar email
  let calendarEmail: string | null = null;
  try {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      calendarEmail = profile.email || null;
    }
  } catch (_) {}

  // Upsert tokens
  const { error } = await supabaseAdmin
    .from('google_tokens')
    .upsert(
      {
        organization_id: organizationId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || null,
        expiry_date: tokens.expires_in
          ? Date.now() + tokens.expires_in * 1000
          : null,
        calendar_email: calendarEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id' }
    );

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

async function refreshAccessToken(orgId: string): Promise<string> {
  const { data: tokenRow, error } = await supabaseAdmin
    .from('google_tokens')
    .select('refresh_token')
    .eq('organization_id', orgId)
    .single();

  if (error || !tokenRow?.refresh_token) {
    throw new Error('No refresh token available. Please re-authenticate.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Token refresh failed: ${JSON.stringify(err)}`);
  }

  const tokens = await res.json();

  await supabaseAdmin
    .from('google_tokens')
    .update({
      access_token: tokens.access_token,
      expiry_date: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
      updated_at: new Date().toISOString(),
    })
    .eq('organization_id', orgId);

  return tokens.access_token as string;
}

async function getValidAccessToken(orgId: string): Promise<string> {
  const { data: tokenRow, error } = await supabaseAdmin
    .from('google_tokens')
    .select('access_token, expiry_date')
    .eq('organization_id', orgId)
    .single();

  if (error || !tokenRow) {
    throw new Error('No Google tokens found. Please re-authenticate.');
  }

  // Refresh if expired (with 5 min buffer)
  const isExpired = tokenRow.expiry_date && Date.now() > tokenRow.expiry_date - 5 * 60 * 1000;
  if (isExpired) {
    return refreshAccessToken(orgId);
  }

  return tokenRow.access_token as string;
}

// ---------------------------------------------------------------------------
// Connection status
// ---------------------------------------------------------------------------

export async function getConnectionStatus(organizationId: string): Promise<{
  connected: boolean;
  email?: string;
  last_sync?: string;
}> {
  const { data, error } = await supabaseAdmin
    .from('google_tokens')
    .select('calendar_email, last_sync_at, access_token')
    .eq('organization_id', organizationId)
    .single();

  if (error || !data || !data.access_token) {
    return { connected: false };
  }

  return {
    connected: true,
    email: data.calendar_email || undefined,
    last_sync: data.last_sync_at || undefined,
  };
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

export async function disconnectCalendar(organizationId: string): Promise<void> {
  await supabaseAdmin
    .from('google_tokens')
    .delete()
    .eq('organization_id', organizationId);
}

// ---------------------------------------------------------------------------
// Sync calendar events → appointments
// ---------------------------------------------------------------------------

export async function syncCalendarEvents(organizationId: string): Promise<{
  synced_events: number;
  new_appointments_created: number;
  cancellations_detected: number;
  new_vacancies_created: number;
}> {
  const accessToken = await getValidAccessToken(organizationId);

  // Fetch events for next 30 days
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      }),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!calRes.ok) {
    if (calRes.status === 401) throw new Error('Token expired. Please re-authenticate.');
    throw new Error(`Google Calendar API error: ${calRes.status}`);
  }

  const calData = await calRes.json();
  const events: any[] = calData.items || [];

  let newAppointmentsCreated = 0;
  let cancellationsDetected = 0;
  let newVacanciesCreated = 0;

  for (const event of events) {
    if (!event.start?.dateTime && !event.start?.date) continue;

    const scheduledDate = event.start.dateTime || `${event.start.date}T09:00:00`;
    const googleEventId = event.id;
    const eventStatus = event.status; // confirmed | cancelled | tentative

    // Check if appointment already exists
    const { data: existing } = await supabaseAdmin
      .from('appointments')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('google_event_id', googleEventId)
      .single();

    if (!existing) {
      if (eventStatus === 'cancelled') continue; // skip cancelled events with no record

      // Create new appointment
      await supabaseAdmin.from('appointments').insert({
        organization_id: organizationId,
        scheduled_date: scheduledDate,
        professional_name: event.organizer?.displayName || null,
        service_type: event.summary || 'Consulta',
        status: 'scheduled',
        google_event_id: googleEventId,
      });
      newAppointmentsCreated++;
    } else if (eventStatus === 'cancelled' && existing.status !== 'cancelled') {
      // Detect cancellation
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', existing.id);

      cancellationsDetected++;

      // Create vacancy
      const { error: vacErr } = await supabaseAdmin.from('vacancies').insert({
        organization_id: organizationId,
        appointment_id: existing.id,
        vacancy_date: scheduledDate,
        status: 'open',
      });

      if (!vacErr) newVacanciesCreated++;
    }
  }

  // Update last_sync_at
  await supabaseAdmin
    .from('google_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('organization_id', organizationId);

  return {
    synced_events: events.length,
    new_appointments_created: newAppointmentsCreated,
    cancellations_detected: cancellationsDetected,
    new_vacancies_created: newVacanciesCreated,
  };
}

// ---------------------------------------------------------------------------
// Write-back: update event when appointment is confirmed/cancelled
// ---------------------------------------------------------------------------

export async function updateAppointmentInCalendar(
  orgId: string,
  appointmentId: string
): Promise<void> {
  const { data: appointment } = await supabaseAdmin
    .from('appointments')
    .select('google_event_id, status, scheduled_date, service_type, duration_minutes, patient_id, patients(full_name)')
    .eq('id', appointmentId)
    .single();

  if (!appointment?.google_event_id) return;

  const accessToken = await getValidAccessToken(orgId).catch(() => null);
  if (!accessToken) return;

  const patient = appointment.patients as unknown as { full_name: string } | null;
  const colorId = appointment.status === 'confirmed' ? '2' : appointment.status === 'cancelled' ? '4' : undefined;

  const body: Record<string, unknown> = {
    summary: `${appointment.service_type || 'Consulta'}${patient?.full_name ? ` - ${patient.full_name}` : ''} [${appointment.status}]`,
    status: appointment.status === 'cancelled' ? 'cancelled' : 'confirmed',
    ...(colorId ? { colorId } : {}),
  };

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.google_event_id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
}

// ---------------------------------------------------------------------------
// Write-back: create new event when anticipation is accepted
// ---------------------------------------------------------------------------

export async function createAppointmentInCalendar(
  orgId: string,
  appointmentId: string
): Promise<void> {
  const { data: appointment } = await supabaseAdmin
    .from('appointments')
    .select('scheduled_date, service_type, duration_minutes, professional_name, patient_id, patients(full_name, email)')
    .eq('id', appointmentId)
    .single();

  if (!appointment?.scheduled_date) return;

  const accessToken = await getValidAccessToken(orgId).catch(() => null);
  if (!accessToken) return;

  const patient = appointment.patients as unknown as { full_name: string; email?: string } | null;
  const startDate = new Date(appointment.scheduled_date);
  const endDate = new Date(startDate.getTime() + (appointment.duration_minutes || 30) * 60 * 1000);

  const attendees = patient?.email ? [{ email: patient.email }] : [];

  const body = {
    summary: `${appointment.service_type || 'Consulta'}${patient?.full_name ? ` - ${patient.full_name}` : ''}`,
    description: `Paciente antecipado via Axis Antivacância\nProfissional: ${appointment.professional_name || 'N/A'}`,
    start: { dateTime: startDate.toISOString(), timeZone: 'America/Sao_Paulo' },
    end: { dateTime: endDate.toISOString(), timeZone: 'America/Sao_Paulo' },
    attendees,
    colorId: '2', // green = confirmed
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (res.ok) {
    const created = await res.json();
    await supabaseAdmin
      .from('appointments')
      .update({ google_event_id: created.id })
      .eq('id', appointmentId);
  }
}
