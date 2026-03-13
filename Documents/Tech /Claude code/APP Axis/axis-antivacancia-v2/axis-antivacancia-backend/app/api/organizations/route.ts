import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth-middleware';
import type { JwtPayload } from '@/lib/jwt';
import { z } from 'zod';

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp_template: z.string().optional(),
  sms_template: z.string().optional(),
  email_template: z.string().optional(),
  notification_templates: z.record(z.string()).optional(),
  whatsapp_notify_number: z.string().optional(),
  agente_confirmacao_enabled: z.boolean().optional(),
  agente_antecipacao_enabled: z.boolean().optional(),
  agente_confirmacao_prompt: z.string().optional(),
  agente_antecipacao_prompt: z.string().optional(),
});

export const PATCH = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const organizationId = user.organizationId;
    const body = await req.json();

    const validatedData = updateOrganizationSchema.parse(body);

    // Filter out undefined values so we only update provided fields
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        errorResponse('Nenhum campo para atualizar'),
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(successResponse(data), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse(error.errors[0]?.message || 'Dados inválidos'),
        { status: 400 }
      );
    }

    return NextResponse.json(
      errorResponse(error instanceof Error ? error.message : 'Falha ao atualizar organização'),
      { status: 400 }
    );
  }
});
