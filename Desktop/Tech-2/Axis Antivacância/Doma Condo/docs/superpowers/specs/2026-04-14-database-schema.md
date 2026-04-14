# Spec: Schema do Banco de Dados — Doma Condo

**Data:** 2026-04-14
**Status:** Planejamento aprovado — pronto para migration
**Projeto:** Doma Condo — BPO Financeiro para Administradoras de Condomínios
**Relacionado:** [[2026-04-12-agente-whatsapp-design]], [[2026-04-13-doma-condo-frontend-standardization-design]]

---

## 1. Visão Geral do Banco de Dados

O banco de dados do Doma Condo tem uma função dupla:

1. **Fonte de escrita do agente WhatsApp** — tudo que as funcionárias relatam é salvo aqui após confirmação
2. **Fonte de leitura do app web** — todas as telas do app consomem esses dados

O banco roda no **Supabase (PostgreSQL)**. RLS (Row Level Security) é obrigatório em todas as tabelas.

### Contexto de Multi-tenancy

Por ora, o Doma Condo é uma única empresa (um único tenant). A coluna `organization_id` está presente em todas as tabelas para viabilizar expansão futura do produto para outras empresas de BPO, mas na prática haverá apenas uma organização ativa.

---

## 2. Diagrama de Relacionamentos (ERD Simplificado)

```
organizations
    │
    ├── employees (funcionárias)
    │       │
    │       └── agent_sessions (conversas do agente)
    │               │
    │               └── work_logs (registros de trabalho confirmados)
    │                       │
    │                       └── tasks (pendências vinculadas)
    │
    ├── clients (clientes / administradoras)
    │       │
    │       └── work_logs ──────────────────────────── (N-para-1 com clients)
    │
    ├── categories (categorias de atividade)
    │       │
    │       └── work_logs ──────────────────────────── (N-para-1 com categories)
    │
    └── reports (relatórios gerados)
            ├── employee_id (opcional — relatório diário por funcionária)
            └── client_id   (opcional — relatório semanal/mensal por cliente)
```

### Cardinalidades principais

| Relacionamento | Tipo |
|---|---|
| Uma `organization` tem muitos `employees` | 1:N |
| Uma `organization` tem muitos `clients` | 1:N |
| Uma `organization` tem muitas `categories` | 1:N |
| Uma `employee` tem muitos `agent_sessions` | 1:N |
| Uma `agent_session` tem muitos `work_logs` | 1:N |
| Um `work_log` pertence a um `client` | N:1 |
| Um `work_log` pertence a uma `category` | N:1 |
| Um `work_log` pode ter zero ou muitas `tasks` | 1:N |
| Um `report` pode referenciar um `employee` e/ou um `client` | N:1 |

---

## 3. Schema Completo em SQL

### 3.0 — Extensões e configurações

```sql
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
```

---

### 3.1 — Tabela: `organizations`

Registro da empresa Doma Condo. Apenas um registro ativo por enquanto.

```sql
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

-- Seed: inserir a Doma Condo como organização raiz
-- (executar após criar a tabela)
-- INSERT INTO organizations (nome, cnpj) VALUES ('Doma Condo', '00.000.000/0001-00');
```

---

### 3.2 — Tabela: `employees`

Funcionárias que executam o trabalho e interagem com o agente.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS employees;
```

---

### 3.3 — Tabela: `clients`

Clientes da Doma Condo — as administradoras de condomínio.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS clients;
```

---

### 3.4 — Tabela: `categories`

Tipos de atividade financeira executada. Configurável pela gestora.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS categories;
```

---

### 3.5 — Tabela: `agent_sessions`

Cada conversa do agente com uma funcionária. Uma sessão por funcionária por turno.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS agent_sessions;
-- DROP TYPE IF EXISTS session_status;
-- DROP TYPE IF EXISTS turno_type;
```

---

### 3.6 — Tabela: `work_logs`

Registros de trabalho confirmados pelas funcionárias. Tabela central do sistema.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS work_logs;
-- DROP TYPE IF EXISTS work_status;
-- DROP TYPE IF EXISTS work_origem;
```

---

### 3.7 — Tabela: `tasks`

Pendências vinculadas a um registro de trabalho. Criadas automaticamente quando status = Parcial ou Pendente.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS tasks;
-- DROP TYPE IF EXISTS task_status;
```

---

### 3.8 — Tabela: `reports`

Relatórios gerados (diários, semanais, mensais) com link para o PDF.

```sql
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

-- ROLLBACK:
-- DROP TABLE IF EXISTS reports;
-- DROP TYPE IF EXISTS report_tipo;
-- DROP TYPE IF EXISTS report_destinatario;
```

---

## 4. RLS Policies (Row Level Security)

O sistema tem 3 tipos de usuário com acessos distintos:

| Usuário | Perfil | Acesso |
|---|---|---|
| Jéssica | `admin` | Lê e escreve tudo dentro da organização |
| Funcionárias | `employee` | Lê e escreve apenas seus próprios dados |
| Clientes | `client` | Lê apenas dados relacionados ao próprio cliente |

### Configuração: campo `role` no `auth.users`

O Supabase usa `auth.users` como tabela de autenticação. Para o Doma Condo, cada usuário autenticado terá metadados com:

```json
{
  "organization_id": "uuid-da-organizacao",
  "role": "admin" | "employee" | "client",
  "profile_id": "uuid-do-employee-ou-client"
}
```

Esses dados ficam em `auth.users.raw_app_meta_data` e são acessados nas policies como `auth.jwt() -> 'app_metadata'`.

### Helper functions para policies

```sql
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
```

---

### 4.1 — RLS: `organizations`

```sql
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
```

---

### 4.2 — RLS: `employees`

```sql
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
```

---

### 4.3 — RLS: `clients`

```sql
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
```

---

### 4.4 — RLS: `categories`

```sql
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
```

---

### 4.5 — RLS: `agent_sessions`

```sql
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
```

---

### 4.6 — RLS: `work_logs`

```sql
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
```

---

### 4.7 — RLS: `tasks`

```sql
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
```

---

### 4.8 — RLS: `reports`

```sql
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
```

---

## 5. Seeds Iniciais

Dados de exemplo para inicializar o ambiente. Executar **após** inserir a organização.

```sql
-- ============================================================
-- IMPORTANTE: substituir 'ORG_ID_AQUI' pelo UUID real da organização
-- após executar: SELECT id FROM organizations LIMIT 1;
-- ============================================================

-- 5.1 — Categorias padrão
INSERT INTO categories (organization_id, nome, descricao, cor, ordem) VALUES
  ('ORG_ID_AQUI', 'Conciliação Bancária',    'Conferência e conciliação de extratos bancários',        '#3B82F6', 1),
  ('ORG_ID_AQUI', 'Lançamento de NFs',       'Lançamento e conferência de notas fiscais',              '#10B981', 2),
  ('ORG_ID_AQUI', 'Pagamentos',              'Processamento e confirmação de pagamentos',               '#F59E0B', 3),
  ('ORG_ID_AQUI', 'Cobranças',              'Envio de cobranças e acompanhamento de inadimplência',    '#EF4444', 4),
  ('ORG_ID_AQUI', 'Relatórios',             'Elaboração e envio de relatórios para clientes',          '#8B5CF6', 5),
  ('ORG_ID_AQUI', 'Atendimento ao Cliente', 'Atendimento de dúvidas e solicitações dos clientes',      '#EC4899', 6),
  ('ORG_ID_AQUI', 'Provisionamento',        'Lançamento de provisões e competências',                  '#6366F1', 7),
  ('ORG_ID_AQUI', 'Outros',                 'Atividades diversas não classificadas acima',             '#6B7280', 99);

-- 5.2 — Clientes de exemplo (substituir pelos reais)
INSERT INTO clients (organization_id, nome, nome_curto, ativo) VALUES
  ('ORG_ID_AQUI', 'Administradora Condomínios São Paulo', 'Administ. SP',   true),
  ('ORG_ID_AQUI', 'Gestão Condominial Ltda',              'Gestão Cond.',   true),
  ('ORG_ID_AQUI', 'Condo Solutions',                      'Condo Sol.',     true),
  ('ORG_ID_AQUI', 'Residencial Admin',                    'Resid. Admin',   true),
  ('ORG_ID_AQUI', 'Prime Condominial',                    'Prime',          true);

-- 5.3 — Funcionárias de exemplo (substituir pelos dados reais)
INSERT INTO employees (organization_id, nome, telefone_whatsapp, cargo, ativa) VALUES
  ('ORG_ID_AQUI', 'Funcionária 1', '5511900000001', 'Assistente Financeira', true),
  ('ORG_ID_AQUI', 'Funcionária 2', '5511900000002', 'Assistente Financeira', true);
```

---

## 6. Queries Frequentes

As queries mais importantes que o app e o agente vão usar.

### 6.1 — Dashboard: resumo geral do dia

```sql
-- Total de registros, horas e pendências do dia atual
SELECT
  COUNT(*)                                          AS total_registros,
  COALESCE(SUM(duracao_minutos), 0) / 60.0         AS total_horas,
  COUNT(*) FILTER (WHERE status = 'Concluido')     AS concluidos,
  COUNT(*) FILTER (WHERE status = 'Parcial')       AS parciais,
  COUNT(*) FILTER (WHERE status = 'Pendente')      AS pendentes
FROM work_logs
WHERE
  organization_id = $1
  AND data_execucao = CURRENT_DATE
  AND deleted_at IS NULL;
```

### 6.2 — Dashboard: horas por funcionária hoje

```sql
SELECT
  e.nome                                     AS funcionaria,
  COUNT(wl.id)                               AS registros,
  COALESCE(SUM(wl.duracao_minutos), 0)       AS minutos_totais,
  COALESCE(SUM(wl.duracao_minutos), 0) / 60.0 AS horas_totais
FROM employees e
LEFT JOIN work_logs wl
  ON wl.employee_id = e.id
  AND wl.data_execucao = CURRENT_DATE
  AND wl.deleted_at IS NULL
WHERE e.organization_id = $1
  AND e.ativa = true
  AND e.deleted_at IS NULL
GROUP BY e.id, e.nome
ORDER BY e.nome;
```

### 6.3 — Dashboard: distribuição por cliente (semana atual)

```sql
SELECT
  c.nome_curto                              AS cliente,
  COUNT(wl.id)                             AS registros,
  COALESCE(SUM(wl.duracao_minutos), 0)     AS minutos_totais
FROM clients c
LEFT JOIN work_logs wl
  ON wl.client_id = c.id
  AND wl.data_execucao >= date_trunc('week', CURRENT_DATE)
  AND wl.deleted_at IS NULL
WHERE c.organization_id = $1
  AND c.ativo = true
  AND c.deleted_at IS NULL
GROUP BY c.id, c.nome_curto
ORDER BY minutos_totais DESC;
```

### 6.4 — Work Logs: lista paginada com filtros

```sql
SELECT
  wl.id,
  wl.data_execucao,
  wl.turno,
  wl.descricao,
  wl.duracao_minutos,
  wl.status,
  wl.observacoes,
  wl.origem,
  e.nome        AS funcionaria,
  c.nome_curto  AS cliente,
  cat.nome      AS categoria
FROM work_logs wl
JOIN employees e   ON e.id  = wl.employee_id
JOIN clients c     ON c.id  = wl.client_id
JOIN categories cat ON cat.id = wl.category_id
WHERE
  wl.organization_id = $1
  AND wl.deleted_at IS NULL
  -- Filtros opcionais (aplicar apenas se o parâmetro for passado):
  AND ($2::UUID  IS NULL OR wl.employee_id = $2)    -- filtro por funcionária
  AND ($3::UUID  IS NULL OR wl.client_id   = $3)    -- filtro por cliente
  AND ($4::DATE  IS NULL OR wl.data_execucao >= $4) -- data início
  AND ($5::DATE  IS NULL OR wl.data_execucao <= $5) -- data fim
  AND ($6::work_status IS NULL OR wl.status = $6)   -- filtro por status
ORDER BY wl.data_execucao DESC, wl.created_at DESC
LIMIT $7 OFFSET $8;
```

### 6.5 — Tasks: pendências abertas

```sql
SELECT
  t.id,
  t.descricao,
  t.data_estimada,
  t.status,
  t.created_at,
  e.nome       AS responsavel,
  c.nome_curto AS cliente,
  wl.data_execucao AS data_origem
FROM tasks t
JOIN employees e ON e.id = t.employee_id
JOIN clients c   ON c.id = t.client_id
JOIN work_logs wl ON wl.id = t.work_log_id
WHERE
  t.organization_id = $1
  AND t.deleted_at IS NULL
  AND t.status IN ('aberta', 'em_andamento')
  -- Filtros opcionais:
  AND ($2::UUID IS NULL OR t.client_id   = $2)
  AND ($3::UUID IS NULL OR t.employee_id = $3)
ORDER BY
  t.data_estimada ASC NULLS LAST,
  t.created_at ASC;
```

### 6.6 — Client Detail: tudo executado para um cliente em um período

```sql
SELECT
  wl.data_execucao,
  cat.nome         AS categoria,
  wl.descricao,
  wl.duracao_minutos,
  wl.status,
  e.nome           AS funcionaria,
  wl.observacoes
FROM work_logs wl
JOIN categories cat ON cat.id = wl.category_id
JOIN employees e    ON e.id   = wl.employee_id
WHERE
  wl.client_id = $1
  AND wl.organization_id = $2
  AND wl.deleted_at IS NULL
  AND wl.data_execucao BETWEEN $3 AND $4
ORDER BY wl.data_execucao DESC, cat.nome;
```

### 6.7 — Client Detail: horas por categoria para um cliente no mês

```sql
SELECT
  cat.nome                              AS categoria,
  cat.cor,
  COUNT(wl.id)                         AS registros,
  COALESCE(SUM(wl.duracao_minutos), 0) AS minutos_totais,
  ROUND(COALESCE(SUM(wl.duracao_minutos), 0) / 60.0, 1) AS horas_totais
FROM work_logs wl
JOIN categories cat ON cat.id = wl.category_id
WHERE
  wl.client_id = $1
  AND wl.organization_id = $2
  AND wl.deleted_at IS NULL
  AND date_trunc('month', wl.data_execucao) = date_trunc('month', $3::DATE)
GROUP BY cat.id, cat.nome, cat.cor
ORDER BY minutos_totais DESC;
```

### 6.8 — Team Detail: histórico de uma funcionária

```sql
SELECT
  wl.data_execucao,
  wl.turno,
  c.nome_curto  AS cliente,
  cat.nome      AS categoria,
  wl.descricao,
  wl.duracao_minutos,
  wl.status
FROM work_logs wl
JOIN clients c     ON c.id   = wl.client_id
JOIN categories cat ON cat.id = wl.category_id
WHERE
  wl.employee_id = $1
  AND wl.organization_id = $2
  AND wl.deleted_at IS NULL
  AND wl.data_execucao BETWEEN $3 AND $4
ORDER BY wl.data_execucao DESC, wl.turno;
```

### 6.9 — Agente: buscar sessão ativa da funcionária

```sql
SELECT *
FROM agent_sessions
WHERE
  employee_id = $1
  AND data_sessao = CURRENT_DATE
  AND turno = $2
  AND status IN ('aberta', 'aguardando_confirmacao')
LIMIT 1;
```

### 6.10 — Agente: work_logs do dia para geração do PDF diário

```sql
SELECT
  wl.descricao,
  wl.duracao_minutos,
  wl.status,
  wl.observacoes,
  wl.turno,
  c.nome_curto  AS cliente,
  cat.nome      AS categoria
FROM work_logs wl
JOIN clients c     ON c.id   = wl.client_id
JOIN categories cat ON cat.id = wl.category_id
WHERE
  wl.employee_id = $1
  AND wl.data_execucao = CURRENT_DATE
  AND wl.deleted_at IS NULL
ORDER BY wl.turno, c.nome_curto;
```

### 6.11 — Relatório semanal: consolidado por cliente e categoria

```sql
SELECT
  c.nome                               AS cliente,
  cat.nome                             AS categoria,
  COUNT(wl.id)                        AS registros,
  COALESCE(SUM(wl.duracao_minutos), 0) AS minutos_totais,
  STRING_AGG(wl.descricao, ' | ' ORDER BY wl.data_execucao) AS descricoes
FROM work_logs wl
JOIN clients c     ON c.id   = wl.client_id
JOIN categories cat ON cat.id = wl.category_id
WHERE
  wl.organization_id = $1
  AND wl.deleted_at IS NULL
  AND wl.data_execucao BETWEEN $2 AND $3  -- início e fim da semana
GROUP BY c.id, c.nome, cat.id, cat.nome
ORDER BY c.nome, minutos_totais DESC;
```

---

## 7. Notas de Implementação

### 7.1 — Service Role no Agente

O agente N8N usa a `service_role` key do Supabase, que bypassa completamente o RLS. Isso é intencional: o agente precisa escrever work_logs e agent_sessions em nome de qualquer funcionária, sem estar autenticado como ela.

**Regra de segurança:** a `service_role` key nunca deve ser exposta no frontend. Ela fica exclusivamente nos ambientes de backend (N8N, variáveis de ambiente da VM).

### 7.2 — Soft Delete

Todas as tabelas de dados operacionais têm `deleted_at`. Nunca usar `DELETE` direto — sempre `UPDATE SET deleted_at = now()`. Todas as queries de leitura devem incluir `AND deleted_at IS NULL`.

### 7.3 — Enum Types

Os tipos ENUM (`work_status`, `work_origem`, `session_status`, `turno_type`, `task_status`, `report_tipo`, `report_destinatario`) são criados uma única vez no banco. Se precisar adicionar valores, usar `ALTER TYPE nome ADD VALUE 'novo_valor'`.

### 7.4 — Ordem de criação das tabelas (para evitar erros de FK)

1. `organizations`
2. `employees`
3. `clients`
4. `categories`
5. `agent_sessions`
6. `work_logs`
7. `tasks`
8. `reports`

### 7.5 — Migrations

Cada alteração futura deve ser um arquivo `.sql` separado, nomeado como:
`YYYY-MM-DD-descricao-da-alteracao.sql`

Sempre incluir o rollback comentado no final do arquivo.

---

## 8. Próximos Passos

1. Criar a organização Doma Condo no Supabase e anotar o UUID gerado
2. Executar as migrations na ordem da seção 7.4
3. Executar os seeds substituindo `ORG_ID_AQUI` pelo UUID real
4. Configurar os metadados dos usuários no `auth.users` (organization_id, role, profile_id)
5. Testar as RLS policies com cada tipo de usuário (admin, employee, client)
6. Integrar o N8N com a `service_role` key para escrita do agente
