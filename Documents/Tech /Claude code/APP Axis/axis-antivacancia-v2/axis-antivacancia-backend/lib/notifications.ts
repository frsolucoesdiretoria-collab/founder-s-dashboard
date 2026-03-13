// Service para enviar notificações
import { supabase, supabaseAdmin } from './supabase';
import { sendSMSViaTwilio, sendWhatsAppViaTwilio } from './twilio';
import { sendEmailViaSendGrid } from './sendgrid';

interface NotificationPayload {
  organizationId: string;
  patientId?: string;
  type: 'whatsapp' | 'sms' | 'email';
  message: string;
  recipientPhoneOrEmail: string;
}

export const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
export const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
export const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'axis-antivacancia';
const USE_TWILIO_FALLBACK = process.env.USE_TWILIO_FALLBACK === 'true';

/**
 * Envia mensagem WhatsApp via Evolution API.
 * Reutilizável pelo webhook de resposta e pelo sistema de notificações.
 */
export async function sendWhatsAppMessage(phone: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: phone,
          textMessage: { text },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, messageId: data.key?.id || data.messageId || data.id };
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('Evolution API response error:', response.status, errorData);
    return { success: false, error: `Evolution API ${response.status}` };
  } catch (err) {
    console.error('Evolution API error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    // Log notificação no banco
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: payload.organizationId,
        type: payload.type,
        recipient_phone_or_email: payload.recipientPhoneOrEmail,
        message_content: payload.message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Enviar email via SendGrid
    if (payload.type === 'email') {
      const emailResult = await sendEmailViaSendGrid({
        to: payload.recipientPhoneOrEmail,
        subject: 'Notificação Axis Antivacância',
        htmlContent: `<p>${payload.message}</p>`,
        plainText: payload.message,
      });

      if (emailResult.success) {
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            external_message_id: emailResult.messageId,
          })
          .eq('id', notification.id);
      } else {
        await supabase
          .from('notifications')
          .update({
            status: 'failed',
            error_message: emailResult.error,
          })
          .eq('id', notification.id);
      }
    }

    // Enviar via Evolution API (WhatsApp/SMS) com fallback para Twilio
    if (payload.type === 'whatsapp' || payload.type === 'sms') {
      const result = await sendWhatsAppMessage(payload.recipientPhoneOrEmail, payload.message);

      if (result.success) {
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            external_message_id: result.messageId,
          })
          .eq('id', notification.id);
      } else {
        await supabase
          .from('notifications')
          .update({
            status: 'failed',
            error_message: result.error || 'Evolution API failed',
          })
          .eq('id', notification.id);
      }
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
}

/**
 * Notifica o dono da clínica sobre uma antecipação confirmada via WhatsApp.
 * Inclui rate limiting (max 10 msgs/min por org) e logging na tabela notificacoes_whatsapp.
 */
export async function notifyOwnerAboutAnticipation(
  orgId: string,
  invitationId: string,
  vacancyId: string,
  patientId: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // 1. Fetch organization with whatsapp_notify_number
    const { data: org, error: orgErr } = await supabaseAdmin
      .from('organizations')
      .select('id, name, whatsapp_notify_number')
      .eq('id', orgId)
      .single();

    if (orgErr || !org) {
      return { success: false, error: 'Organization not found' };
    }

    if (!org.whatsapp_notify_number) {
      return { success: false, error: 'Organization has no whatsapp_notify_number configured' };
    }

    // 2. Fetch patient data (the one who was anticipated)
    const { data: anticipatedPatient, error: patErr } = await supabaseAdmin
      .from('patients')
      .select('id, full_name, default_consultation_value')
      .eq('id', patientId)
      .single();

    if (patErr || !anticipatedPatient) {
      return { success: false, error: 'Patient not found' };
    }

    // 3. Fetch vacancy data (includes info about the original cancellation)
    const { data: vacancy, error: vacErr } = await supabaseAdmin
      .from('vacancies')
      .select('id, service_type, professional_name, vacancy_date, appointment_id')
      .eq('id', vacancyId)
      .single();

    if (vacErr || !vacancy) {
      return { success: false, error: 'Vacancy not found' };
    }

    // 4. Find the original cancelled patient (from the appointment that created the vacancy)
    let cancelledPatientName = 'um paciente';
    if (vacancy.appointment_id) {
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('patient_id, patient:patients(full_name)')
        .eq('id', vacancy.appointment_id)
        .single();

      if (appointment?.patient) {
        const patient = appointment.patient as unknown as { full_name: string } | null;
        cancelledPatientName = patient?.full_name || 'um paciente';
      }
    }

    // 5. Rate limit: max 10 msgs/min per org
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount, error: rlErr } = await supabaseAdmin
      .from('notificacoes_whatsapp')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', oneMinuteAgo);

    if (rlErr) throw rlErr;

    if ((recentCount || 0) >= 10) {
      return { success: false, error: 'Rate limit exceeded: max 10 messages per minute per organization' };
    }

    // 6. Calculate recovered value
    const recoveredValue = anticipatedPatient.default_consultation_value || 250;

    // 7. Build message
    const message = `\u{1F4B0} Dinheiro recuperado! O paciente ${cancelledPatientName} cancelou, e o paciente ${anticipatedPatient.full_name} foi antecipado! Recuperamos R$ ${recoveredValue.toFixed(2).replace('.', ',')} para o caixa da sua clínica.`;

    // 8. Create notification record as pending
    const { data: notification, error: insertErr } = await supabaseAdmin
      .from('notificacoes_whatsapp')
      .insert({
        organization_id: orgId,
        tipo: 'antecipacao_confirmada',
        destinatario_phone: org.whatsapp_notify_number,
        mensagem: message,
        valor_recuperado: recoveredValue,
        paciente_nome: anticipatedPatient.full_name,
        profissional_nome: vacancy.professional_name || null,
        vacancy_id: vacancyId,
        invitation_id: invitationId,
        status: 'pending',
        tentativas: 0,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 9. Send via Evolution API
    const result = await sendWhatsAppMessage(org.whatsapp_notify_number, message);

    if (result.success) {
      await supabaseAdmin
        .from('notificacoes_whatsapp')
        .update({
          status: 'sent',
          external_message_id: result.messageId || null,
          tentativas: 1,
          enviado_em: new Date().toISOString(),
        })
        .eq('id', notification.id);

      return { success: true, notificationId: notification.id };
    } else {
      await supabaseAdmin
        .from('notificacoes_whatsapp')
        .update({
          status: 'failed',
          erro: result.error || 'Evolution API failed',
          tentativas: 1,
        })
        .eq('id', notification.id);

      return { success: false, notificationId: notification.id, error: result.error };
    }
  } catch (error) {
    console.error('[notifyOwnerAboutAnticipation] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------

function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

const DEFAULT_REMINDER_TEMPLATE =
  'Olá {paciente_nome}! Lembrando da sua consulta de {tipo_servico} com {profissional_nome} às {horario}. Responda *SIM* para confirmar ou *NÃO* para cancelar.';

const DEFAULT_INVITE_TEMPLATE =
  'Olá {paciente_nome}! Surgiu uma vaga de {tipo_servico} com {profissional_nome} para {horario}. Deseja antecipar sua consulta? Responda *SIM* para confirmar ou *NÃO* para recusar.';

export async function buildReminderMessage(
  appointment: { scheduled_date: string; service_type?: string | null; professional_name?: string | null },
  patient: { full_name: string },
  org: { agente_confirmacao_prompt?: string | null; notification_templates?: Record<string, string> | null }
): Promise<string> {
  const template =
    org.agente_confirmacao_prompt ||
    org.notification_templates?.reminder ||
    DEFAULT_REMINDER_TEMPLATE;

  const horario = new Date(appointment.scheduled_date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return interpolateTemplate(template, {
    paciente_nome: patient.full_name,
    profissional_nome: appointment.professional_name || 'nosso profissional',
    horario,
    tipo_servico: appointment.service_type || 'consulta',
  });
}

export async function buildInviteMessage(
  vacancy: { vacancy_date: string; service_type?: string | null; professional_name?: string | null },
  patient: { full_name: string },
  org: { agente_antecipacao_prompt?: string | null; notification_templates?: Record<string, string> | null }
): Promise<string> {
  const template =
    org.agente_antecipacao_prompt ||
    org.notification_templates?.whatsapp ||
    DEFAULT_INVITE_TEMPLATE;

  const horario = new Date(vacancy.vacancy_date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return interpolateTemplate(template, {
    paciente_nome: patient.full_name,
    profissional_nome: vacancy.professional_name || 'nosso profissional',
    horario,
    tipo_servico: vacancy.service_type || 'consulta',
  });
}

// Notificar pacientes sobre vagas (legacy — use buildInviteMessage + sendNotification instead)
export async function notifyPatientAboutVacancy(
  organizationId: string,
  patientId: string,
  vacancy: any,
  patient: any
) {
  const message = `Olá ${patient.full_name}! Surgiu uma vaga em ${vacancy.service_type} com ${vacancy.professional_name} às ${new Date(vacancy.vacancy_date).toLocaleTimeString()}. Tem interesse em antecipar sua consulta?`;

  return sendNotification({
    organizationId,
    patientId,
    type: patient.preferred_contact || 'whatsapp',
    message,
    recipientPhoneOrEmail: patient.phone,
  });
}
