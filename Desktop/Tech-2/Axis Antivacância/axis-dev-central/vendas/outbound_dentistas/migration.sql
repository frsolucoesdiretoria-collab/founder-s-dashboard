-- Migration: Tabela de controle da sequência de outbound para dentistas
-- Executar uma vez na VM: docker exec axis-postgres psql -U axis -d axis_sales -f /tmp/migration_outbound.sql

CREATE TABLE IF NOT EXISTS outbound_dentistas (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id),
    email TEXT NOT NULL,
    empresa TEXT,
    nome TEXT,
    -- Controle da sequência
    etapa_atual INTEGER DEFAULT 0,           -- 0=aguardando, 1=email1 enviado, 2=email2 enviado, 3=email3 enviado, 4=email4 enviado
    status VARCHAR(30) DEFAULT 'ativo',      -- ativo | pausado | finalizado | descadastrado | lead_quente | bounce
    -- Datas de envio de cada email
    email1_sent_at TIMESTAMP,
    email2_sent_at TIMESTAMP,
    email3_sent_at TIMESTAMP,
    email4_sent_at TIMESTAMP,
    -- Rastreamento
    email1_opened BOOLEAN DEFAULT FALSE,
    email2_opened BOOLEAN DEFAULT FALSE,
    email3_opened BOOLEAN DEFAULT FALSE,
    email4_opened BOOLEAN DEFAULT FALSE,
    respondeu BOOLEAN DEFAULT FALSE,
    respondeu_at TIMESTAMP,
    bounce_type VARCHAR(20),
    bounce_at TIMESTAMP,
    -- Metadados
    cold_email_log_id1 INTEGER,
    cold_email_log_id2 INTEGER,
    cold_email_log_id3 INTEGER,
    cold_email_log_id4 INTEGER,
    added_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbound_dentistas_status ON outbound_dentistas(status);
CREATE INDEX IF NOT EXISTS idx_outbound_dentistas_etapa ON outbound_dentistas(etapa_atual);
CREATE INDEX IF NOT EXISTS idx_outbound_dentistas_email ON outbound_dentistas(email);
CREATE INDEX IF NOT EXISTS idx_outbound_dentistas_lead_id ON outbound_dentistas(lead_id);

-- Tabela de controle de throttle (envios por dia)
CREATE TABLE IF NOT EXISTS outbound_throttle (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    emails_enviados INTEGER DEFAULT 0,
    limite_dia INTEGER DEFAULT 30,
    bounce_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_throttle_data ON outbound_throttle(data);

COMMENT ON TABLE outbound_dentistas IS 'Controle da sequência de 4 emails outbound para clínicas odontológicas';
COMMENT ON TABLE outbound_throttle IS 'Controle de warm-up: limite de envios por dia (30→60→120 semana a semana)';
