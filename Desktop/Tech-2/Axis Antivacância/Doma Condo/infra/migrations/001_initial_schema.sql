-- ============================================================
-- Migration: 001_initial_schema.sql
-- Projeto: Doma Condo — BPO Financeiro para Administradoras de Condomínios
-- Data: 2026-04-14
-- Status: Pronto para execução
-- ============================================================
--
-- COMO USAR:
--   1. Acesse o painel do Supabase: https://supabase.com/dashboard
--   2. Selecione o projeto Doma Condo
--   3. Vá em "SQL Editor" > "New Query"
--   4. Cole TODO o conteúdo deste arquivo
--   5. Clique em "Run" (ou Ctrl+Enter)
--
-- ORDEM DE CRIAÇÃO (respeita dependências de FK):
--   1. Extensões e funções utilitárias
--   2. Helper functions para RLS
--   3. organizations
--   4. employees
--   5. clients
--   6. categories
--   7. agent_sessions
--   8. work_logs
--   9. tasks
--  10. reports
--  11. Seeds iniciais
--
-- ROLLBACK GERAL (executar em ordem inversa se precisar desfazer tudo):
--   DROP TABLE IF EXISTS reports, tasks, work_logs, agent_sessions, categories, clients, employees, organizations CASCADE;
--   DROP TYPE IF EXISTS report_destinatario, report_tipo, task_status, work_origem, work_status, turno_type, session_status;
--   DROP FUNCTION IF EXISTS get_my_profile_id, get_my_role, get_my_org_id, trigger_set_updated_at;
-- ============================================================


-- ============================================================
-- SEÇÃO 1: Extensões e função utilitária de updated_at
-- ============================================================

-- Habilitar UUID nativo (já disponível no Supabase por padrão)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SEÇÃO 2: Helper functions para RLS policies
-- ============================================================

-- Retorna organization_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Retorna role do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Retorna profile_id (employee_id ou client_id) do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'profile_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- SEÇÃO 3: Tabela organizations
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  cnpj             TEXT,
  email_contato    TEXT,
  telefone         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Admin pode ler sua própria organização
CREATE POLICY policy_organizations_select_admin
  ON organizations FOR SELECT
  USING (
    id = get_my_org_id()
    AND get_my_role() = 'admin'
  );

-- Somente admin pode atualizar
CREATE POLICY policy_organizations_update_admin
  ON organizations FOR UPDATE
  USING (get_my_role() = 'admin' AND id = get_my_org_id());

-- Seed da organização (executar após criar a tabela — será usado nos seeds da seção 11)
-- INSERT INTO organizations (nome, cnpj) VALUES ('Doma Condo', '00.000.000/0001-00');


-- ============================================================
-- SEÇÃO 4: Tabela employees
-- ============================================================

CREATE TABLE IF NOT EXISTS employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  nome             TEXT NOT NULL,
  telefone_whatsapp TEXT NOT NULL,           -- Número no formato internacional: 5511999999999
  email            TEXT,
  cargo            TEXT DEFAULT 'Assistente Financeira',
  ativa            BOOLEAN NOT NULL DEFAULT true,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,             -- Soft delete

  CONSTRAINT fk_employees_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_telefone ON employees(telefone_whatsapp);

CREATE TRIGGER set_updated_at_employees
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os employees da organização
-- Funcionária vê apenas seu próprio registro
CREATE POLICY policy_employees_select
  ON employees FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND deleted_at IS NULL
    AND (
      get_my_role() = 'admin'
      OR (get_my_role() = 'employee' AND id = get_my_profile_id())
    )
  );

-- Somente admin pode criar/editar/excluir funcionárias
CREATE POLICY policy_employees_insert_admin
  ON employees FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

CREATE POLICY policy_employees_update_admin
  ON employees FOR UPDATE
  USING (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- ROLLBACK: DROP TABLE IF EXISTS employees;


-- ============================================================
-- SEÇÃO 5: Tabela clients
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  nome             TEXT NOT NULL,
  nome_curto       TEXT,                    -- Nome abreviado para uso no app e WhatsApp
  contato_nome     TEXT,                    -- Nome do contato responsável
  contato_email    TEXT,
  contato_telefone TEXT,
  ativo            BOOLEAN NOT NULL DEFAULT true,
  observacoes      TEXT,                    -- Notas internas sobre o cliente

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,

  CONSTRAINT fk_clients_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_clients_organization_id ON clients(organization_id);

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Admin e funcionárias veem todos os clientes ativos
-- Clientes veem apenas seu próprio registro
CREATE POLICY policy_clients_select
  ON clients FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND deleted_at IS NULL
    AND (
      get_my_role() IN ('admin', 'employee')
      OR (get_my_role() = 'client' AND id = get_my_profile_id())
    )
  );

-- Somente admin pode criar/editar clientes
CREATE POLICY policy_clients_insert_admin
  ON clients FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

CREATE POLICY policy_clients_update_admin
  ON clients FOR UPDATE
  USING (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- ROLLBACK: DROP TABLE IF EXISTS clients;


-- ============================================================
-- SEÇÃO 6: Tabela categories
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  nome             TEXT NOT NULL,           -- Ex: "Conciliação Bancária", "Lançamento de NFs"
  descricao        TEXT,
  cor              TEXT DEFAULT '#6B7280',  -- Hex para uso no app (badge de categoria)
  ativa            BOOLEAN NOT NULL DEFAULT true,
  ordem            INTEGER DEFAULT 0,       -- Ordem de exibição nas listas

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,

  CONSTRAINT fk_categories_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT uq_categories_nome_org UNIQUE (organization_id, nome)
);

CREATE INDEX idx_categories_organization_id ON categories(organization_id);

CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados da organização podem ler categorias
CREATE POLICY policy_categories_select
  ON categories FOR SELECT
  USING (organization_id = get_my_org_id() AND deleted_at IS NULL);

-- Somente admin pode criar/editar
CREATE POLICY policy_categories_insert_admin
  ON categories FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

CREATE POLICY policy_categories_update_admin
  ON categories FOR UPDATE
  USING (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- ROLLBACK: DROP TABLE IF EXISTS categories;


-- ============================================================
-- SEÇÃO 7: ENUMs + Tabela agent_sessions
-- ============================================================

CREATE TYPE session_status AS ENUM ('aberta', 'aguardando_confirmacao', 'confirmada', 'cancelada', 'expirada');
CREATE TYPE turno_type AS ENUM ('manha', 'tarde');

CREATE TABLE IF NOT EXISTS agent_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  employee_id      UUID NOT NULL REFERENCES employees(id),
  turno            turno_type NOT NULL,
  data_sessao      DATE NOT NULL,           -- Data de referência da sessão (data do dia de trabalho)
  iniciada_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  encerrada_em     TIMESTAMPTZ,
  status           session_status NOT NULL DEFAULT 'aberta',

  -- Histórico completo da conversa (para auditoria e reprocessamento)
  mensagens        JSONB NOT NULL DEFAULT '[]',
  -- Estrutura de cada item do array:
  -- {
  --   "role": "agent" | "employee",
  --   "content": "texto",
  --   "timestamp": "2026-04-14T11:35:00Z",
  --   "tipo": "texto" | "audio" | "transcricao"
  -- }

  -- Dados extraídos pelo Gemini (pré-confirmação)
  dados_extraidos  JSONB,
  -- Array de atividades estruturadas aguardando confirmação antes de virar work_logs

  -- Metadados
  trello_tarefas_verificadas JSONB,         -- Tarefas do Trello que foram checadas nesta sessão
  notas_agente     TEXT,                    -- Log interno do agente para debug

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_agent_sessions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_agent_sessions_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  -- Evitar duplicata: uma sessão por funcionária por turno por dia
  CONSTRAINT uq_agent_sessions_employee_turno_data UNIQUE (employee_id, turno, data_sessao)
);

CREATE INDEX idx_agent_sessions_organization_id ON agent_sessions(organization_id);
CREATE INDEX idx_agent_sessions_employee_id ON agent_sessions(employee_id);
CREATE INDEX idx_agent_sessions_data_sessao ON agent_sessions(data_sessao);
CREATE INDEX idx_agent_sessions_status ON agent_sessions(status);

CREATE TRIGGER set_updated_at_agent_sessions
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: agent_sessions
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

-- Admin vê todas as sessões
-- Funcionária vê apenas as suas sessões
CREATE POLICY policy_agent_sessions_select
  ON agent_sessions FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND (
      get_my_role() = 'admin'
      OR (get_my_role() = 'employee' AND employee_id = get_my_profile_id())
    )
  );

-- O agente (service_role) escreve. Funcionárias não escrevem diretamente.
-- O N8N/Gemini usa a service_role key do Supabase — bypassa RLS por design.
-- Nenhuma policy de INSERT/UPDATE para roles normais (proteção intencional).

-- ROLLBACK:
-- DROP TABLE IF EXISTS agent_sessions;
-- DROP TYPE IF EXISTS session_status;
-- DROP TYPE IF EXISTS turno_type;


-- ============================================================
-- SEÇÃO 8: ENUMs + Tabela work_logs
-- ============================================================

CREATE TYPE work_status AS ENUM ('Concluido', 'Parcial', 'Pendente');
CREATE TYPE work_origem AS ENUM ('WhatsApp', 'Manual');

CREATE TABLE IF NOT EXISTS work_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Quem fez, para quem, o quê
  employee_id      UUID NOT NULL REFERENCES employees(id),
  client_id        UUID NOT NULL REFERENCES clients(id),
  category_id      UUID NOT NULL REFERENCES categories(id),
  agent_session_id UUID REFERENCES agent_sessions(id),  -- Nulo se entrada manual

  -- O que foi feito
  descricao        TEXT NOT NULL,           -- Palavras da funcionária
  data_execucao    DATE NOT NULL,           -- Data em que o trabalho foi executado
  hora_inicio      TIME,                    -- Hora aproximada de início (quando informada)
  duracao_minutos  INTEGER,                 -- Duração estimada em minutos
  status           work_status NOT NULL DEFAULT 'Concluido',
  observacoes      TEXT,                    -- Problemas, bloqueios, notas adicionais
  turno            turno_type NOT NULL,     -- Manhã ou tarde
  origem           work_origem NOT NULL DEFAULT 'WhatsApp',

  -- Soft delete
  deleted_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_work_logs_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_work_logs_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_work_logs_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_work_logs_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_work_logs_session FOREIGN KEY (agent_session_id) REFERENCES agent_sessions(id),
  CONSTRAINT chk_work_logs_duracao CHECK (duracao_minutos IS NULL OR duracao_minutos > 0)
);

CREATE INDEX idx_work_logs_organization_id ON work_logs(organization_id);
CREATE INDEX idx_work_logs_employee_id ON work_logs(employee_id);
CREATE INDEX idx_work_logs_client_id ON work_logs(client_id);
CREATE INDEX idx_work_logs_category_id ON work_logs(category_id);
CREATE INDEX idx_work_logs_data_execucao ON work_logs(data_execucao);
CREATE INDEX idx_work_logs_status ON work_logs(status);
-- Index composto para queries de relatório (client + período)
CREATE INDEX idx_work_logs_client_data ON work_logs(client_id, data_execucao);
-- Index composto para queries de dashboard (employee + período)
CREATE INDEX idx_work_logs_employee_data ON work_logs(employee_id, data_execucao);

CREATE TRIGGER set_updated_at_work_logs
  BEFORE UPDATE ON work_logs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: work_logs
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os work_logs da organização
-- Funcionária vê apenas seus próprios work_logs
-- Cliente vê apenas work_logs do seu próprio client_id
CREATE POLICY policy_work_logs_select
  ON work_logs FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND deleted_at IS NULL
    AND (
      get_my_role() = 'admin'
      OR (get_my_role() = 'employee' AND employee_id = get_my_profile_id())
      OR (get_my_role() = 'client' AND client_id = get_my_profile_id())
    )
  );

-- Admin pode inserir manualmente (origem = 'Manual')
CREATE POLICY policy_work_logs_insert_admin
  ON work_logs FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- Admin pode editar (correções)
CREATE POLICY policy_work_logs_update_admin
  ON work_logs FOR UPDATE
  USING (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- Nota: INSERT do agente usa service_role (bypassa RLS — intencional)

-- ROLLBACK:
-- DROP TABLE IF EXISTS work_logs;
-- DROP TYPE IF EXISTS work_status;
-- DROP TYPE IF EXISTS work_origem;


-- ============================================================
-- SEÇÃO 9: ENUMs + Tabela tasks
-- ============================================================

CREATE TYPE task_status AS ENUM ('aberta', 'em_andamento', 'concluida', 'cancelada');

CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  work_log_id      UUID NOT NULL REFERENCES work_logs(id),
  employee_id      UUID NOT NULL REFERENCES employees(id),   -- Responsável (herdado do work_log)
  client_id        UUID NOT NULL REFERENCES clients(id),     -- Cliente (herdado do work_log)

  descricao        TEXT NOT NULL,           -- O que ainda precisa ser feito
  data_estimada    DATE,                    -- Prazo estimado (quando informado)
  status           task_status NOT NULL DEFAULT 'aberta',
  resolvida_em     TIMESTAMPTZ,             -- Quando foi marcada como concluída
  resolvida_no_log UUID REFERENCES work_logs(id),  -- Qual work_log registrou a conclusão

  deleted_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_tasks_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_tasks_work_log FOREIGN KEY (work_log_id) REFERENCES work_logs(id),
  CONSTRAINT fk_tasks_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_tasks_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_tasks_resolved_log FOREIGN KEY (resolvida_no_log) REFERENCES work_logs(id)
);

CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_work_log_id ON tasks(work_log_id);
CREATE INDEX idx_tasks_employee_id ON tasks(employee_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
-- Index para listar pendências abertas por cliente (usado no portal do cliente)
CREATE INDEX idx_tasks_client_status ON tasks(client_id, status) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Admin vê todas as tasks
-- Funcionária vê apenas as tasks vinculadas a ela
-- Cliente vê apenas tasks do seu client_id
CREATE POLICY policy_tasks_select
  ON tasks FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND deleted_at IS NULL
    AND (
      get_my_role() = 'admin'
      OR (get_my_role() = 'employee' AND employee_id = get_my_profile_id())
      OR (get_my_role() = 'client' AND client_id = get_my_profile_id())
    )
  );

-- Admin pode criar/editar tasks manualmente
CREATE POLICY policy_tasks_insert_admin
  ON tasks FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

CREATE POLICY policy_tasks_update_admin
  ON tasks FOR UPDATE
  USING (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- ROLLBACK:
-- DROP TABLE IF EXISTS tasks;
-- DROP TYPE IF EXISTS task_status;


-- ============================================================
-- SEÇÃO 10: ENUMs + Tabela reports
-- ============================================================

CREATE TYPE report_tipo AS ENUM ('diario', 'semanal', 'mensal');
CREATE TYPE report_destinatario AS ENUM ('jessica', 'cliente', 'funcionaria');

CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  tipo             report_tipo NOT NULL,
  periodo_inicio   DATE NOT NULL,
  periodo_fim      DATE NOT NULL,

  -- Destinatário (pelo menos um deve ser preenchido)
  employee_id      UUID REFERENCES employees(id),   -- Para relatórios diários por funcionária
  client_id        UUID REFERENCES clients(id),     -- Para relatórios por cliente

  destinatario     report_destinatario NOT NULL,
  pdf_url          TEXT,                            -- URL do PDF no Google Drive ou Storage
  enviado_em       TIMESTAMPTZ,                    -- Quando foi enviado via WhatsApp
  enviado_para     TEXT,                           -- Número WhatsApp para quem foi enviado

  -- Dados consolidados usados para gerar o relatório (snapshot)
  dados_snapshot   JSONB,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_reports_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_reports_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_reports_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT chk_reports_periodo CHECK (periodo_fim >= periodo_inicio),
  -- Ao menos employee ou cliente deve estar preenchido
  CONSTRAINT chk_reports_destinatario CHECK (employee_id IS NOT NULL OR client_id IS NOT NULL)
);

CREATE INDEX idx_reports_organization_id ON reports(organization_id);
CREATE INDEX idx_reports_employee_id ON reports(employee_id);
CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_tipo ON reports(tipo);
CREATE INDEX idx_reports_periodo ON reports(periodo_inicio, periodo_fim);

CREATE TRIGGER set_updated_at_reports
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os relatórios
-- Funcionária vê relatórios diários dela
-- Cliente vê relatórios mensais/semanais do seu client_id
CREATE POLICY policy_reports_select
  ON reports FOR SELECT
  USING (
    organization_id = get_my_org_id()
    AND (
      get_my_role() = 'admin'
      OR (get_my_role() = 'employee' AND employee_id = get_my_profile_id())
      OR (get_my_role() = 'client' AND client_id = get_my_profile_id())
    )
  );

-- Somente admin e service_role criam relatórios
CREATE POLICY policy_reports_insert_admin
  ON reports FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND get_my_role() = 'admin');

-- ROLLBACK:
-- DROP TABLE IF EXISTS reports;
-- DROP TYPE IF EXISTS report_tipo;
-- DROP TYPE IF EXISTS report_destinatario;


-- ============================================================
-- SEÇÃO 11: Seeds iniciais
-- ============================================================
-- IMPORTANTE: Antes de executar os seeds abaixo, primeiro crie a
-- organização Doma Condo e anote o UUID gerado:
--
--   INSERT INTO organizations (nome, cnpj) VALUES ('Doma Condo', '00.000.000/0001-00');
--   SELECT id FROM organizations WHERE nome = 'Doma Condo';
--
-- Depois, substitua 'ORG_ID_AQUI' pelo UUID real em todos os INSERTs abaixo.
-- ============================================================

-- 11.1 — Categorias padrão
-- INSERT INTO categories (organization_id, nome, descricao, cor, ordem) VALUES
--   ('ORG_ID_AQUI', 'Conciliação Bancária',    'Conferência e conciliação de extratos bancários',        '#3B82F6', 1),
--   ('ORG_ID_AQUI', 'Lançamento de NFs',       'Lançamento e conferência de notas fiscais',              '#10B981', 2),
--   ('ORG_ID_AQUI', 'Pagamentos',              'Processamento e confirmação de pagamentos',               '#F59E0B', 3),
--   ('ORG_ID_AQUI', 'Cobranças',              'Envio de cobranças e acompanhamento de inadimplência',    '#EF4444', 4),
--   ('ORG_ID_AQUI', 'Relatórios',             'Elaboração e envio de relatórios para clientes',          '#8B5CF6', 5),
--   ('ORG_ID_AQUI', 'Atendimento ao Cliente', 'Atendimento de dúvidas e solicitações dos clientes',      '#EC4899', 6),
--   ('ORG_ID_AQUI', 'Provisionamento',        'Lançamento de provisões e competências',                  '#6366F1', 7),
--   ('ORG_ID_AQUI', 'Outros',                 'Atividades diversas não classificadas acima',             '#6B7280', 99);

-- 11.2 — Clientes de exemplo (substituir pelos reais)
-- INSERT INTO clients (organization_id, nome, nome_curto, ativo) VALUES
--   ('ORG_ID_AQUI', 'Administradora Condomínios São Paulo', 'Administ. SP',   true),
--   ('ORG_ID_AQUI', 'Gestão Condominial Ltda',              'Gestão Cond.',   true),
--   ('ORG_ID_AQUI', 'Condo Solutions',                      'Condo Sol.',     true),
--   ('ORG_ID_AQUI', 'Residencial Admin',                    'Resid. Admin',   true),
--   ('ORG_ID_AQUI', 'Prime Condominial',                    'Prime',          true);

-- 11.3 — Funcionárias de exemplo (substituir pelos dados reais)
-- INSERT INTO employees (organization_id, nome, telefone_whatsapp, cargo, ativa) VALUES
--   ('ORG_ID_AQUI', 'Funcionária 1', '5511900000001', 'Assistente Financeira', true),
--   ('ORG_ID_AQUI', 'Funcionária 2', '5511900000002', 'Assistente Financeira', true);


-- ============================================================
-- SEÇÃO 12: Queries úteis para referência (comentadas)
-- ============================================================

-- 12.1 — Dashboard: resumo geral do dia
-- SELECT
--   COUNT(*)                                          AS total_registros,
--   COALESCE(SUM(duracao_minutos), 0) / 60.0         AS total_horas,
--   COUNT(*) FILTER (WHERE status = 'Concluido')     AS concluidos,
--   COUNT(*) FILTER (WHERE status = 'Parcial')       AS parciais,
--   COUNT(*) FILTER (WHERE status = 'Pendente')      AS pendentes
-- FROM work_logs
-- WHERE
--   organization_id = $1
--   AND data_execucao = CURRENT_DATE
--   AND deleted_at IS NULL;

-- 12.2 — Dashboard: horas por funcionária hoje
-- SELECT
--   e.nome                                     AS funcionaria,
--   COUNT(wl.id)                               AS registros,
--   COALESCE(SUM(wl.duracao_minutos), 0)       AS minutos_totais,
--   COALESCE(SUM(wl.duracao_minutos), 0) / 60.0 AS horas_totais
-- FROM employees e
-- LEFT JOIN work_logs wl
--   ON wl.employee_id = e.id
--   AND wl.data_execucao = CURRENT_DATE
--   AND wl.deleted_at IS NULL
-- WHERE e.organization_id = $1
--   AND e.ativa = true
--   AND e.deleted_at IS NULL
-- GROUP BY e.id, e.nome
-- ORDER BY e.nome;

-- 12.3 — Dashboard: distribuição por cliente (semana atual)
-- SELECT
--   c.nome_curto                              AS cliente,
--   COUNT(wl.id)                             AS registros,
--   COALESCE(SUM(wl.duracao_minutos), 0)     AS minutos_totais
-- FROM clients c
-- LEFT JOIN work_logs wl
--   ON wl.client_id = c.id
--   AND wl.data_execucao >= date_trunc('week', CURRENT_DATE)
--   AND wl.deleted_at IS NULL
-- WHERE c.organization_id = $1
--   AND c.ativo = true
--   AND c.deleted_at IS NULL
-- GROUP BY c.id, c.nome_curto
-- ORDER BY minutos_totais DESC;

-- 12.4 — Work Logs: lista paginada com filtros
-- SELECT
--   wl.id, wl.data_execucao, wl.turno, wl.descricao, wl.duracao_minutos,
--   wl.status, wl.observacoes, wl.origem,
--   e.nome AS funcionaria, c.nome_curto AS cliente, cat.nome AS categoria
-- FROM work_logs wl
-- JOIN employees e    ON e.id   = wl.employee_id
-- JOIN clients c      ON c.id   = wl.client_id
-- JOIN categories cat ON cat.id = wl.category_id
-- WHERE
--   wl.organization_id = $1
--   AND wl.deleted_at IS NULL
--   AND ($2::UUID IS NULL OR wl.employee_id = $2)
--   AND ($3::UUID IS NULL OR wl.client_id   = $3)
--   AND ($4::DATE IS NULL OR wl.data_execucao >= $4)
--   AND ($5::DATE IS NULL OR wl.data_execucao <= $5)
--   AND ($6::work_status IS NULL OR wl.status = $6)
-- ORDER BY wl.data_execucao DESC, wl.created_at DESC
-- LIMIT $7 OFFSET $8;

-- 12.5 — Tasks: pendências abertas
-- SELECT
--   t.id, t.descricao, t.data_estimada, t.status, t.created_at,
--   e.nome AS responsavel, c.nome_curto AS cliente, wl.data_execucao AS data_origem
-- FROM tasks t
-- JOIN employees e ON e.id = t.employee_id
-- JOIN clients c   ON c.id = t.client_id
-- JOIN work_logs wl ON wl.id = t.work_log_id
-- WHERE
--   t.organization_id = $1
--   AND t.deleted_at IS NULL
--   AND t.status IN ('aberta', 'em_andamento')
--   AND ($2::UUID IS NULL OR t.client_id   = $2)
--   AND ($3::UUID IS NULL OR t.employee_id = $3)
-- ORDER BY t.data_estimada ASC NULLS LAST, t.created_at ASC;

-- 12.6 — Client Detail: tudo executado para um cliente em um período
-- SELECT
--   wl.data_execucao, cat.nome AS categoria, wl.descricao,
--   wl.duracao_minutos, wl.status, e.nome AS funcionaria, wl.observacoes
-- FROM work_logs wl
-- JOIN categories cat ON cat.id = wl.category_id
-- JOIN employees e    ON e.id   = wl.employee_id
-- WHERE
--   wl.client_id = $1 AND wl.organization_id = $2
--   AND wl.deleted_at IS NULL
--   AND wl.data_execucao BETWEEN $3 AND $4
-- ORDER BY wl.data_execucao DESC, cat.nome;

-- 12.7 — Client Detail: horas por categoria para um cliente no mês
-- SELECT
--   cat.nome AS categoria, cat.cor,
--   COUNT(wl.id) AS registros,
--   COALESCE(SUM(wl.duracao_minutos), 0) AS minutos_totais,
--   ROUND(COALESCE(SUM(wl.duracao_minutos), 0) / 60.0, 1) AS horas_totais
-- FROM work_logs wl
-- JOIN categories cat ON cat.id = wl.category_id
-- WHERE
--   wl.client_id = $1 AND wl.organization_id = $2
--   AND wl.deleted_at IS NULL
--   AND date_trunc('month', wl.data_execucao) = date_trunc('month', $3::DATE)
-- GROUP BY cat.id, cat.nome, cat.cor
-- ORDER BY minutos_totais DESC;

-- 12.8 — Team Detail: histórico de uma funcionária
-- SELECT
--   wl.data_execucao, wl.turno, c.nome_curto AS cliente,
--   cat.nome AS categoria, wl.descricao, wl.duracao_minutos, wl.status
-- FROM work_logs wl
-- JOIN clients c      ON c.id   = wl.client_id
-- JOIN categories cat ON cat.id = wl.category_id
-- WHERE
--   wl.employee_id = $1 AND wl.organization_id = $2
--   AND wl.deleted_at IS NULL
--   AND wl.data_execucao BETWEEN $3 AND $4
-- ORDER BY wl.data_execucao DESC, wl.turno;

-- 12.9 — Agente: buscar sessão ativa da funcionária
-- SELECT * FROM agent_sessions
-- WHERE employee_id = $1
--   AND data_sessao = CURRENT_DATE
--   AND turno = $2
--   AND status IN ('aberta', 'aguardando_confirmacao')
-- LIMIT 1;

-- 12.10 — Agente: work_logs do dia para geração do PDF diário
-- SELECT
--   wl.descricao, wl.duracao_minutos, wl.status, wl.observacoes, wl.turno,
--   c.nome_curto AS cliente, cat.nome AS categoria
-- FROM work_logs wl
-- JOIN clients c      ON c.id   = wl.client_id
-- JOIN categories cat ON cat.id = wl.category_id
-- WHERE
--   wl.employee_id = $1
--   AND wl.data_execucao = CURRENT_DATE
--   AND wl.deleted_at IS NULL
-- ORDER BY wl.turno, c.nome_curto;

-- 12.11 — Relatório semanal: consolidado por cliente e categoria
-- SELECT
--   c.nome AS cliente, cat.nome AS categoria,
--   COUNT(wl.id) AS registros,
--   COALESCE(SUM(wl.duracao_minutos), 0) AS minutos_totais,
--   STRING_AGG(wl.descricao, ' | ' ORDER BY wl.data_execucao) AS descricoes
-- FROM work_logs wl
-- JOIN clients c      ON c.id   = wl.client_id
-- JOIN categories cat ON cat.id = wl.category_id
-- WHERE
--   wl.organization_id = $1
--   AND wl.deleted_at IS NULL
--   AND wl.data_execucao BETWEEN $2 AND $3
-- GROUP BY c.id, c.nome, cat.id, cat.nome
-- ORDER BY c.nome, minutos_totais DESC;

-- ============================================================
-- FIM DA MIGRATION 001
-- ============================================================
