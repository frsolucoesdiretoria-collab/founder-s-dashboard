/**
 * Background Jobs
 * - appointmentReminderJob: sends WhatsApp reminders 48h, 24h, 3h before appointments
 * - vacancyNotificationJob: invites waitlist patients when vacancies open
 *
 * Call these from a cron endpoint or external scheduler.
 */
import { supabaseAdmin } from './supabase';
import { sendWhatsAppMessage, buildReminderMessage, buildInviteMessage } from './notifications';

// ---------------------------------------------------------------------------
// Appointment Reminder Job (run every hour)
// ---------------------------------------------------------------------------

export async function appointmentReminderJob(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  let processed = 0;
  let sent = 0;
  let skipped = 0;

  // Find all orgs with agente_confirmacao_enabled = true
  const { data: orgs, error: orgErr } = await supabaseAdmin
    .from('organizations')
    .select('id, name, agente_confirmacao_prompt, notification_templates')
    .eq('agente_confirmacao_enabled', true);

  if (orgErr || !orgs || orgs.length === 0) return { processed, sent, skipped };

  const now = new Date();
  const windows = [
    { label: '48h', from: 47 * 60, to: 49 * 60 },  // minutes from now
    { label: '24h', from: 23 * 60, to: 25 * 60 },
    { label: '3h',  from: 2 * 60,  to: 4 * 60  },
  ];

  for (const org of orgs) {
    for (const window of windows) {
      const fromDate = new Date(now.getTime() + window.from * 60 * 1000);
      const toDate   = new Date(now.getTime() + window.to   * 60 * 1000);

      // Get scheduled appointments in this window (not yet reminded for this slot)
      const { data: appointments } = await supabaseAdmin
        .from('appointments')
        .select('id, scheduled_date, service_type, professional_name, patient_id, patients(id, full_name, phone, preferred_contact)')
        .eq('organization_id', org.id)
        .in('status', ['scheduled'])
        .gte('scheduled_date', fromDate.toISOString())
        .lte('scheduled_date', toDate.toISOString())
        .not('patient_id', 'is', null);

      if (!appointments) continue;

      for (const appt of appointments) {
        processed++;
        const patient = appt.patients as unknown as {
          id: string; full_name: string; phone: string; preferred_contact: string;
        } | null;
        if (!patient?.phone) { skipped++; continue; }

        // Check if reminder already sent for this appointment + window
        const { count } = await supabaseAdmin
          .from('invitations')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_id', appt.id)
          .eq('invitation_type', 'reminder')
          .neq('status', 'expired');

        if ((count || 0) > 0) { skipped++; continue; }

        // Build message using org template or default
        const message = await buildReminderMessage(appt, patient, org);

        // Send WhatsApp
        const result = await sendWhatsAppMessage(patient.phone, message);

        // Log invitation
        const token = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        await supabaseAdmin.from('invitations').insert({
          organization_id: org.id,
          patient_id: patient.id,
          vacancy_id: null as any, // reminders don't have a vacancy
          appointment_id: appt.id,
          token,
          invitation_type: 'reminder',
          status: 'pending',
          invitation_sent_at: new Date().toISOString(),
        });

        if (result.success) sent++;
        else skipped++;
      }
    }
  }

  return { processed, sent, skipped };
}

// ---------------------------------------------------------------------------
// Vacancy Notification Job (run every 5 minutes)
// ---------------------------------------------------------------------------

export async function vacancyNotificationJob(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  let processed = 0;
  let sent = 0;
  let skipped = 0;

  // Get orgs with agente_antecipacao_enabled = true
  const { data: orgs, error: orgErr } = await supabaseAdmin
    .from('organizations')
    .select('id, name, agente_antecipacao_prompt, notification_templates')
    .eq('agente_antecipacao_enabled', true);

  if (orgErr || !orgs || orgs.length === 0) return { processed, sent, skipped };

  for (const org of orgs) {
    // Get open vacancies not yet notified
    const { data: vacancies } = await supabaseAdmin
      .from('vacancies')
      .select('id, vacancy_date, service_type, professional_name')
      .eq('organization_id', org.id)
      .eq('status', 'open')
      .gte('vacancy_date', new Date().toISOString());

    if (!vacancies || vacancies.length === 0) continue;

    for (const vacancy of vacancies) {
      processed++;

      // Already invited anyone for this vacancy?
      const { data: existingInvitations } = await supabaseAdmin
        .from('invitations')
        .select('patient_id')
        .eq('vacancy_id', vacancy.id);

      const invitedIds = (existingInvitations || []).map((i: any) => i.patient_id);

      // Build query for next eligible patient
      let query = supabaseAdmin
        .from('waitlist_items')
        .select('patient_id, patients(id, full_name, phone, service_type, preferred_contact)')
        .eq('organization_id', org.id)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('position', { ascending: true })
        .limit(1);

      // Service type matching: only invite if patient service_type matches vacancy or patient has no preference
      if (vacancy.service_type) {
        query = query.or(`service_type.eq.${vacancy.service_type},service_type.is.null`);
      }

      if (invitedIds.length > 0) {
        query = query.not('patient_id', 'in', `(${invitedIds.join(',')})`);
      }

      const { data: nextItems } = await query;
      if (!nextItems || nextItems.length === 0) { skipped++; continue; }

      const nextItem = nextItems[0];
      const patient = nextItem.patients as unknown as {
        id: string; full_name: string; phone: string; preferred_contact: string;
      } | null;
      if (!patient?.phone) { skipped++; continue; }

      const message = await buildInviteMessage(vacancy, patient, org);

      const result = await sendWhatsAppMessage(patient.phone, message);

      const token = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await supabaseAdmin.from('invitations').insert({
        organization_id: org.id,
        patient_id: nextItem.patient_id,
        vacancy_id: vacancy.id,
        token,
        invitation_type: 'vacancy',
        status: 'pending',
        invitation_sent_at: new Date().toISOString(),
      });

      // Mark vacancy as notified
      await supabaseAdmin
        .from('vacancies')
        .update({ status: 'notified', notified_at: new Date().toISOString() })
        .eq('id', vacancy.id);

      if (result.success) sent++;
      else skipped++;
    }
  }

  return { processed, sent, skipped };
}
