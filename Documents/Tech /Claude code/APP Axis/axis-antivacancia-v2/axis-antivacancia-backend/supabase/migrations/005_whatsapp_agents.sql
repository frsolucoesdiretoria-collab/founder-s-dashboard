-- Migration: WhatsApp Agents configuration + invitation_type
-- Run in Supabase Dashboard SQL Editor

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS agente_confirmacao_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS agente_antecipacao_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS agente_confirmacao_prompt text,
  ADD COLUMN IF NOT EXISTS agente_antecipacao_prompt text,
  ADD COLUMN IF NOT EXISTS whatsapp_notify_number text,
  ADD COLUMN IF NOT EXISTS notification_templates jsonb;

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS invitation_type text DEFAULT 'vacancy',
  ADD COLUMN IF NOT EXISTS appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz;

-- Index for fast lookup by type
CREATE INDEX IF NOT EXISTS invitations_type_idx ON invitations (invitation_type);
CREATE INDEX IF NOT EXISTS invitations_appointment_id_idx ON invitations (appointment_id);

-- Add 'confirmed' and 'cancelled' to appointments status if not present
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'anticipated', 'no_show'));
