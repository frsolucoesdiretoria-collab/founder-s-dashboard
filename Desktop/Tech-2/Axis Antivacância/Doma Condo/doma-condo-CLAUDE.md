## SEGUNDO CÉREBRO — Vault Obsidian

**Relacionado:** [[INDEX]] · [[brand-guide-domacondo]] · [[escopo-de-entrega]] · [[2026-04-14-backend-architecture]]

**Vault:** `/Users/fabricio/Documents/Obsidian Vault/`
**Pasta deste projeto:** `Projetos/Doma Condo/`
**Índice:** `Projetos/Doma Condo/INDEX.md`

Ao iniciar esta sessão: leia o INDEX.md do vault para entender o estado atual do projeto.
Ao finalizar: salve decisões, arquiteturas e contextos importantes como notas em `Projetos/Doma Condo/`.

---

## Documentos de Referência do Projeto

| Documento | Caminho | Descrição |
|---|---|---|
| Brand Guide | `brand-guide-domacondo.md` | Fonte da verdade para identidade visual: tipografia, cores, paleta, ícones |
| Frontend Bible | `DOMA-CONDO-FRONTEND-BIBLE.md` | Regras obrigatórias de HTML/CSS para todas as páginas |
| Backend Architecture | `docs/superpowers/specs/2026-04-14-backend-architecture.md` | Arquitetura completa: Gather Bot, N8N, Gemini, Supabase |
| API Integrations | `docs/superpowers/specs/2026-04-14-api-integrations.md` | Gather Bot (código completo), Evolution API, Trello, Google Drive, Gemini |
| Database Schema | `docs/superpowers/specs/2026-04-14-database-schema.md` | Schema SQL completo com RLS e seeds |
| Migration SQL | `infra/migrations/001_initial_schema.sql` | Migration pronta para rodar no Supabase |
| Gather Bot | `gather-bot/gather-bot.js` | Código Node.js do bot Gather (WebSocket + HTTP) |

> Sempre consulte o `brand-guide-domacondo.md` antes de tomar qualquer decisão visual ou de design.

---

## Banco de Dados — Supabase (PostgreSQL)

**Projeto:** `rwwheapbsnfxxrvwmwrb` | **URL:** `https://rwwheapbsnfxxrvwmwrb.supabase.co`
**Região:** sa-east-1 (São Paulo) | **Status:** ACTIVE_HEALTHY (criado 2026-04-14)

> ATENÇÃO: Antes de criar qualquer tabela nova, verifique se os dados não cabem em uma tabela existente como coluna ou linha. Nunca duplique dados que já existem em outra tabela — use foreign keys.

### Organização raiz
- **Doma Condo** — `id: ec4c62fa-4158-4c69-a5fb-972d27cb9d48`

### Tabelas existentes (NÃO recriar)

#### `organizations`
Registro da empresa Doma Condo. **Apenas um registro ativo.** Não criar outra tabela para "empresa" ou "tenant".
- `id`, `nome`, `cnpj`, `email_contato`, `telefone`, `created_at`, `updated_at`, `deleted_at`

#### `employees`
Funcionárias que interagem com o agente. **Não criar tabela separada para "usuários internos", "assistentes" ou "colaboradores"** — tudo vai aqui.
- `id`, `organization_id`, `nome`, `telefone_whatsapp`, `email`, `cargo`, `gather_id` (ID da funcionária no Gather), `ativa`, `created_at`, `updated_at`, `deleted_at`

#### `clients`
Clientes da Doma Condo (administradoras de condomínio). **Não criar tabela separada para "condomínios", "administradoras" ou "contratantes"** — tudo vai aqui.
- `id`, `organization_id`, `nome`, `nome_curto`, `contato_nome`, `contato_email`, `contato_telefone`, `ativo`, `observacoes`, `created_at`, `updated_at`, `deleted_at`

#### `categories`
Tipos de atividade financeira. **Não criar tabela para "tipos de serviço", "serviços" ou "áreas"** — tudo vai aqui.
- `id`, `organization_id`, `nome`, `descricao`, `cor` (hex para badge no app), `ativa`, `ordem`, `created_at`, `updated_at`, `deleted_at`
- **Seeds inseridos:** Conciliação Bancária, Lançamento de NFs, Pagamentos, Cobranças, Relatórios, Atendimento ao Cliente, Provisionamento, Outros

#### `agent_sessions`
Cada conversa do agente com uma funcionária (uma sessão por funcionária por turno por dia).
- `id`, `organization_id`, `employee_id` (FK employees), `turno` (enum: manha/tarde), `data_sessao`, `iniciada_em`, `encerrada_em`, `status` (enum: aberta/aguardando_confirmacao/confirmada/cancelada/expirada), `mensagens` (JSONB — histórico completo da conversa), `dados_extraidos` (JSONB — dados estruturados antes da confirmação), `trello_tarefas_verificadas` (JSONB), `notas_agente`, `created_at`, `updated_at`
- **UNIQUE:** (employee_id, turno, data_sessao) — sem duplicata de sessão

#### `work_logs`
Registros de trabalho confirmados pelas funcionárias. **Tabela central do sistema.** Não criar tabela para "registros", "atividades", "tarefas executadas" ou "histórico de trabalho" — tudo vai aqui.
- `id`, `organization_id`, `employee_id` (FK employees), `client_id` (FK clients), `category_id` (FK categories), `agent_session_id` (FK agent_sessions, nullable), `descricao`, `data_execucao`, `hora_inicio`, `duracao_minutos`, `status` (enum: Concluido/Parcial/Pendente), `observacoes`, `turno` (enum: manha/tarde), `origem` (enum: Gather/Manual), `deleted_at`, `created_at`, `updated_at`

#### `tasks`
Pendências abertas vinculadas a um work_log (criadas quando status = Parcial ou Pendente). **Não criar tabela para "pendências", "follow-ups" ou "to-dos"** — tudo vai aqui.
- `id`, `organization_id`, `work_log_id` (FK work_logs), `employee_id` (FK employees), `client_id` (FK clients), `descricao`, `data_estimada`, `status` (enum: aberta/em_andamento/concluida/cancelada), `resolvida_em`, `resolvida_no_log` (FK work_logs, nullable), `deleted_at`, `created_at`, `updated_at`

#### `reports`
Relatórios gerados (diários, semanais, mensais) com link para o PDF enviado à Jéssica via WhatsApp. **Não criar tabela para "PDFs", "relatórios enviados" ou "documentos"** — tudo vai aqui.
- `id`, `organization_id`, `tipo` (enum: diario/semanal/mensal), `periodo_inicio`, `periodo_fim`, `employee_id` (nullable FK employees), `client_id` (nullable FK clients), `destinatario` (enum: jessica/cliente/funcionaria), `pdf_url`, `enviado_em`, `enviado_para` (número WhatsApp), `dados_snapshot` (JSONB — snapshot dos dados usados), `created_at`, `updated_at`

### ENUMs existentes (NÃO recriar)
- `session_status`: aberta, aguardando_confirmacao, confirmada, cancelada, expirada
- `turno_type`: manha, tarde
- `work_status`: Concluido, Parcial, Pendente
- `work_origem`: Gather, Manual
- `task_status`: aberta, em_andamento, concluida, cancelada
- `report_tipo`: diario, semanal, mensal
- `report_destinatario`: jessica, cliente, funcionaria

### RLS (Row Level Security)
Todas as tabelas têm RLS ativado. O agente N8N/Gemini usa a `service_role key` para bypass do RLS (gravação automática). Usuários humanos acessam via anon key com role no JWT (`admin`, `employee`, `client`).

### Migrations aplicadas
Ver: `infra/migrations/001_initial_schema.sql`

---
