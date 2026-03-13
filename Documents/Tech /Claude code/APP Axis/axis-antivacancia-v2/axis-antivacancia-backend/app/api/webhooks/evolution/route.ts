import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { EVOLUTION_API_KEY, sendWhatsAppMessage, notifyOwnerAboutAnticipation } from '@/lib/notifications';
import { phoneFromJid, normalizePhone } from '@/lib/phone-utils';
import { createAppointmentInCalendar, updateAppointmentInCalendar } from '@/lib/google-calendar';

// POST: Webhook público chamado pela Evolution API ao receber mensagens WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Verificar apikey (segurança)
    if (body.apikey !== EVOLUTION_API_KEY && EVOLUTION_API_KEY) {
      return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
    }

    // 2. Filtrar: só processar messages.upsert de mensagens recebidas (não enviadas por nós)
    const event = body.event;
    if (event !== 'messages.upsert') {
      return NextResponse.json({ status: 'ignored', reason: 'event not messages.upsert' });
    }

    const data = body.data;
    if (!data?.key || data.key.fromMe) {
      return NextResponse.json({ status: 'ignored', reason: 'fromMe or no key' });
    }

    // 3. Extrair telefone do remoteJid
    const remoteJid = data.key.remoteJid;
    if (!remoteJid || !remoteJid.endsWith('@s.whatsapp.net')) {
      return NextResponse.json({ status: 'ignored', reason: 'not a private chat' });
    }

    const phone = phoneFromJid(remoteJid);

    // 4. Extrair texto da mensagem
    const text =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      '';

    if (!text.trim()) {
      return NextResponse.json({ status: 'ignored', reason: 'no text content' });
    }

    // 5. Detectar intenção
    const normalized = text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const acceptWords = ['sim', 's', 'yes', 'confirmar', 'confirmo', 'aceito', 'aceitar', 'quero'];
    const declineWords = ['nao', 'n', 'no', 'recusar', 'recuso', 'cancelar', 'cancelo', 'nope'];

    let intention: 'accepted' | 'declined' | null = null;

    if (acceptWords.includes(normalized)) {
      intention = 'accepted';
    } else if (declineWords.includes(normalized)) {
      intention = 'declined';
    }

    if (!intention) {
      await sendWhatsAppMessage(
        phone,
        'Não entendi sua resposta. Por favor, responda *SIM* para confirmar ou *NÃO* para recusar.'
      );
      return NextResponse.json({ status: 'clarification_sent' });
    }

    // 6. Buscar paciente por telefone (match pelos últimos 11 dígitos)
    const normalizedPhone = normalizePhone(phone);

    const { data: patients, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, full_name, phone, organization_id')
      .or(`phone.like.%${normalizedPhone},phone.like.%${normalizedPhone.slice(-10)}`);

    if (patientError || !patients || patients.length === 0) {
      console.warn(`[Webhook] Paciente não encontrado para telefone: ${phone}`);
      return NextResponse.json({ status: 'patient_not_found' });
    }

    const patientIds = patients.map((p) => p.id);

    // 7. Buscar convite pending mais recente
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('invitations')
      .select('*, vacancy:vacancies(*), patient:patients(*)')
      .in('patient_id', patientIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (invError || !invitation) {
      await sendWhatsAppMessage(
        phone,
        'No momento você não possui convites pendentes. Obrigado!'
      );
      return NextResponse.json({ status: 'no_pending_invitation' });
    }

    // 8. Bifurcar por invitation_type
    const invitationType = invitation.invitation_type || 'vacancy';

    if (invitationType === 'reminder') {
      await handleReminderResponse(invitation, intention, phone);
    } else {
      await handleVacancyResponse(invitation, intention, phone);
    }

    return NextResponse.json({ status: 'processed', intention, invitation_type: invitationType });
  } catch (error) {
    console.error('[Webhook Evolution] Error:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Internal error' },
      { status: 200 }
    );
  }
}

// ---------------------------------------------------------------------------
// Fluxo 1 — Resposta ao lembrete de confirmação
// ---------------------------------------------------------------------------

async function handleReminderResponse(
  invitation: any,
  intention: 'accepted' | 'declined',
  phone: string
) {
  const appointmentId = invitation.appointment_id;
  const patientName = invitation.patient?.full_name || 'Paciente';

  if (intention === 'accepted') {
    // Marcar convite como aceito
    await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), response_channel: 'whatsapp' })
      .eq('id', invitation.id);

    // Atualizar appointment para confirmed
    if (appointmentId) {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      // Write-back no Google Calendar (fire-and-forget)
      updateAppointmentInCalendar(invitation.organization_id, appointmentId).catch((err) =>
        console.error('[Webhook] GCal update error:', err)
      );
    }

    const vacancyDate = invitation.vacancy?.vacancy_date
      ? new Date(invitation.vacancy.vacancy_date).toLocaleDateString('pt-BR')
      : '';

    await sendWhatsAppMessage(
      phone,
      `✅ ${patientName}, sua consulta foi confirmada com sucesso!${vacancyDate ? ` Até ${vacancyDate}.` : ''} Obrigado!`
    );

    console.log(`[Webhook] Lembrete ${invitation.id} confirmado por ${invitation.patient_id}`);
  } else {
    // Marcar convite como recusado
    await supabaseAdmin
      .from('invitations')
      .update({ status: 'declined', declined_at: new Date().toISOString(), response_channel: 'whatsapp' })
      .eq('id', invitation.id);

    // Cancelar appointment
    if (appointmentId) {
      await supabaseAdmin
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Paciente cancelou via WhatsApp',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      // Criar vaga para este horário
      const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('scheduled_date, service_type, professional_name, duration_minutes')
        .eq('id', appointmentId)
        .single();

      if (appt) {
        await supabaseAdmin.from('vacancies').insert({
          organization_id: invitation.organization_id,
          appointment_id: appointmentId,
          vacancy_date: appt.scheduled_date,
          service_type: appt.service_type,
          professional_name: appt.professional_name,
          duration_minutes: appt.duration_minutes,
          status: 'open',
        });
      }

      // Write-back no Google Calendar (fire-and-forget)
      updateAppointmentInCalendar(invitation.organization_id, appointmentId).catch((err) =>
        console.error('[Webhook] GCal cancel update error:', err)
      );
    }

    await sendWhatsAppMessage(
      phone,
      'Entendido! Sua consulta foi cancelada. Caso mude de ideia, entre em contato com a clínica. Obrigado!'
    );

    // Tentar convidar próximo da fila (vacancy recém-criada)
    if (appointmentId) {
      const { data: vacancy } = await supabaseAdmin
        .from('vacancies')
        .select('id, service_type, professional_name, vacancy_date')
        .eq('appointment_id', appointmentId)
        .single();

      if (vacancy) {
        await tryNextWaitlistPatient(invitation.organization_id, vacancy.id, vacancy);
      }
    }

    console.log(`[Webhook] Lembrete ${invitation.id} recusado por ${invitation.patient_id} — vaga criada`);
  }
}

// ---------------------------------------------------------------------------
// Fluxo 2 — Resposta ao convite de antecipação
// ---------------------------------------------------------------------------

async function handleVacancyResponse(
  invitation: any,
  intention: 'accepted' | 'declined',
  phone: string
) {
  if (intention === 'accepted') {
    const { error: updateInvError } = await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), response_channel: 'whatsapp' })
      .eq('id', invitation.id);

    if (updateInvError) throw updateInvError;

    // Preencher a vaga
    const { error: vacancyError } = await supabaseAdmin
      .from('vacancies')
      .update({
        status: 'filled',
        filled_by_patient_id: invitation.patient_id,
        filled_at: new Date().toISOString(),
      })
      .eq('id', invitation.vacancy_id);

    if (vacancyError) throw vacancyError;

    // Atualizar appointment associado
    let newAppointmentId: string | null = null;

    if (invitation.vacancy?.appointment_id) {
      await supabaseAdmin
        .from('appointments')
        .update({
          status: 'anticipated',
          patient_id: invitation.patient_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.vacancy.appointment_id);

      newAppointmentId = invitation.vacancy.appointment_id;
    }

    // Cancelar outros convites pendentes para esta vaga e notificar
    const { data: otherInvitations } = await supabaseAdmin
      .from('invitations')
      .select('id, patient_id, patient:patients(full_name, phone)')
      .eq('vacancy_id', invitation.vacancy_id)
      .eq('status', 'pending')
      .neq('id', invitation.id);

    if (otherInvitations && otherInvitations.length > 0) {
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('vacancy_id', invitation.vacancy_id)
        .eq('status', 'pending')
        .neq('id', invitation.id);

      for (const otherInv of otherInvitations) {
        const otherPatient = otherInv.patient as unknown as { full_name: string; phone: string } | null;
        if (otherPatient?.phone) {
          sendWhatsAppMessage(
            otherPatient.phone,
            `Olá ${otherPatient.full_name || 'Paciente'}! Informamos que o horário já foi preenchido por outro paciente. Fique tranquilo(a), assim que surgir nova vaga entraremos em contato. Obrigado!`
          ).catch((err) => {
            console.error(`[Webhook] Erro ao notificar paciente ${otherInv.patient_id}:`, err);
          });
        }
      }
    }

    // Write-back Google Calendar (criar evento para o paciente antecipado)
    if (newAppointmentId) {
      createAppointmentInCalendar(invitation.organization_id, newAppointmentId).catch((err) =>
        console.error('[Webhook] GCal create error:', err)
      );
    }

    // Enviar confirmação ao paciente
    const patientName = invitation.patient?.full_name || 'Paciente';
    const vacancyDate = invitation.vacancy?.vacancy_date
      ? new Date(invitation.vacancy.vacancy_date).toLocaleDateString('pt-BR')
      : '';

    await sendWhatsAppMessage(
      phone,
      `✅ ${patientName}, sua consulta foi confirmada com sucesso!${vacancyDate ? ` Data: ${vacancyDate}.` : ''} Obrigado por antecipar!`
    );

    // Notificar dono da clínica
    notifyOwnerAboutAnticipation(
      invitation.organization_id,
      invitation.id,
      invitation.vacancy_id,
      invitation.patient_id
    ).catch((err) => {
      console.error('[Webhook] Error notifying owner:', err);
    });

    console.log(`[Webhook] Convite ${invitation.id} aceito via WhatsApp pelo paciente ${invitation.patient_id}`);
  } else {
    const { error: updateInvError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        response_channel: 'whatsapp',
      })
      .eq('id', invitation.id);

    if (updateInvError) throw updateInvError;

    await tryNextWaitlistPatient(
      invitation.organization_id,
      invitation.vacancy_id,
      invitation.vacancy
    );

    await sendWhatsAppMessage(
      phone,
      'Entendido! Seu convite foi recusado. Caso mude de ideia, entre em contato com a clínica. Obrigado!'
    );

    console.log(`[Webhook] Convite ${invitation.id} recusado via WhatsApp pelo paciente ${invitation.patient_id}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tryNextWaitlistPatient(
  organizationId: string,
  vacancyId: string,
  vacancy: Record<string, unknown> | null
) {
  try {
    if (!vacancy) return;

    const { data: existingInvitations } = await supabaseAdmin
      .from('invitations')
      .select('patient_id')
      .eq('vacancy_id', vacancyId);

    const invitedPatientIds = (existingInvitations || []).map(
      (inv: { patient_id: string }) => inv.patient_id
    );

    let query = supabaseAdmin
      .from('waitlist_items')
      .select('patient_id, patients(*)')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('position', { ascending: true })
      .limit(1);

    if (vacancy.service_type) {
      query = query.or(`service_type.eq.${vacancy.service_type as string},service_type.is.null`);
    }

    if (invitedPatientIds.length > 0) {
      query = query.not('patient_id', 'in', `(${invitedPatientIds.join(',')})`);
    }

    const { data: nextItems, error: wlError } = await query;

    if (wlError || !nextItems || nextItems.length === 0) return;

    const nextItem = nextItems[0];
    const patient = nextItem.patients as unknown as Record<string, unknown> | null;
    if (!patient) return;

    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: organizationId,
        patient_id: nextItem.patient_id,
        vacancy_id: vacancyId,
        token: invitationToken,
        invitation_type: 'vacancy',
        status: 'pending',
        invitation_sent_at: new Date().toISOString(),
      });

    const patientName = (patient.full_name as string) || 'Paciente';
    const message = `Olá ${patientName}! Surgiu uma vaga para você. Responda *SIM* para confirmar ou *NÃO* para recusar.`;

    await sendWhatsAppMessage(
      (patient.phone as string) || '',
      message
    );
  } catch (error) {
    console.error('[Webhook] Error trying next waitlist patient:', error);
  }
}
