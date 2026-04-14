# Arquitetura Backend — Doma Condo

**Data:** 2026-04-14
**Status:** Planejamento aprovado para implementação
**Projeto:** Doma Condo — BPO Financeiro para Administradoras de Condomínios
**Relacionado:** [[2026-04-12-agente-whatsapp-design]], [[2026-04-13-doma-condo-frontend-standardization-design]]

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE CLOUD VM                                    │
│                      (domacondo-axis-1 · 146.148.107.228)                   │
│                                                                             │
│  ┌───────────────────┐          ┌────────────────────────────────────────┐  │
│  │   Evolution API   │◄────────►│               N8N                      │  │
│  │   (WhatsApp)      │  webhook │  (Orquestração / Workflows / Crons)    │  │
│  │   porta: 8080     │          │  porta: 5678                           │  │
│  └───────────────────┘          └────────────────┬───────────────────────┘  │
│                                                  │                          │
│  ┌───────────────────┐                           │ HTTP/REST                │
│  │   Frontend        │                           │                          │
│  │   HTML/CSS/JS     │                           ▼                          │
│  │   estático        │          ┌────────────────────────────────────────┐  │
│  │   (nginx)         │          │         Backend API                    │  │
│  │   porta: 80/443   │◄────────►│    (Express.js / Node.js)              │  │
│  └───────────────────┘   REST   │    porta: 3000                         │  │
│                          JSON   └────────────────┬───────────────────────┘  │
└─────────────────────────────────────────────────┼───────────────────────────┘
                                                  │
                    ┌─────────────────────────────┼───────────────────────────┐
                    │         SERVIÇOS EXTERNOS   │                           │
                    │                             │                           │
                    │  ┌──────────────────┐       │  ┌──────────────────────┐ │
                    │  │   Supabase       │◄──────┴─►│   Gemini API         │ │
                    │  │   PostgreSQL     │          │   (Google AI)        │ │
                    │  │   (banco de      │          │   LLM + Áudio        │ │
                    │  │    dados)        │          └──────────────────────┘ │
                    │  └──────────────────┘                                   │
                    │                                                          │
                    │  ┌──────────────────┐       ┌──────────────────────┐   │
                    │  │   Trello API     │       │   Google Drive API   │   │
                    │  │   (tarefas)      │       │   (documentos)       │   │
                    │  └──────────────────┘       └──────────────────────┘   │
                    └─────────────────────────────────────────────────────────┘
```

### Resumo dos fluxos principais

**Fluxo de entrada (agente WhatsApp → banco):**
```
Funcionária (WhatsApp)
  → Evolution API (recebe mensagem)
  → N8N (webhook trigger)
  → Gemini (processa texto/áudio, extrai dados)
  → N8N (orquestra confirmação)
  → Supabase (salva após confirmação)
```

**Fluxo de exibição (banco → app web):**
```
Frontend (browser)
  → Backend API (Express + Node.js na VM)
  → Supabase (consulta PostgreSQL)
  → JSON de volta para o frontend
  → Renderiza na tela
```

**Fluxo de relatórios (cron → PDF → WhatsApp):**
```
N8N Cron (17:30 / segunda 8h / fim de mês)
  → Supabase (busca dados do período)
  → Gemini (gera narrativa estruturada)
  → N8N (gera PDF via biblioteca)
  → Evolution API (envia PDF para Jéssica / Clientes)
```

---

## 2. Componentes e Responsabilidades

### 2.1 Evolution API (WhatsApp Gateway)
- **O que faz:** Ponto de entrada e saída de todas as mensagens WhatsApp
- **Responsabilidades:**
  - Receber mensagens das funcionárias (texto e áudio)
  - Enviar mensagens do agente para as funcionárias
  - Enviar PDFs de relatório para Jéssica e clientes
  - Disparar webhook para o N8N a cada mensagem recebida
- **Configuração:** Uma instância por número de telefone do agente
- **Porta:** 8080 na VM
- **Autenticação:** API Key configurada no `.env`

### 2.2 N8N (Orquestrador de Workflows)
- **O que faz:** Cérebro da automação — coordena todos os passos do agente
- **Responsabilidades:**
  - Executar crons (11:30, 17:00, 17:30, segunda 8h, fim de mês)
  - Receber webhooks da Evolution API
  - Chamar a API do Gemini com o contexto certo
  - Consultar e atualizar o Supabase
  - Chamar Trello API para buscar tarefas do dia
  - Gerar PDFs e enviá-los via Evolution API
  - Gerenciar estado da conversa (qual etapa cada funcionária está)
- **Porta:** 5678 na VM
- **Dados de estado:** Tabela `conversation_sessions` no Supabase

### 2.3 Gemini API (Inteligência)
- **O que faz:** Processa toda inteligência do agente — linguagem e áudio
- **Responsabilidades:**
  - Transcrever mensagens de áudio das funcionárias
  - Extrair atividades estruturadas do relato livre
  - Identificar cliente, categoria, duração, status de cada atividade
  - Cruzar o relato com as tarefas do Trello
  - Formular perguntas de cobrança sobre tarefas não mencionadas
  - Gerar resumo de confirmação para a funcionária
  - Gerar narrativa para relatórios PDF
- **Modelo:** `gemini-2.0-flash` para coleta (rápido), `gemini-1.5-pro` para relatórios mensais (qualidade)
- **Acesso:** Via N8N usando nó HTTP Request com API Key do Google AI Studio

### 2.4 Supabase (Banco de Dados)
- **O que faz:** Armazena todos os dados do sistema — compartilhado entre agente e app web
- **Responsabilidades:**
  - Persistir registros de trabalho confirmados pelas funcionárias
  - Armazenar clientes, funcionárias, categorias de atividade
  - Guardar estado das conversas em andamento
  - Expor dados via REST API para o backend da VM
  - Armazenar pendências, observações e metadados
- **Acesso pelo N8N:** Via Supabase API Key (service_role) — escrita e leitura total
- **Acesso pelo Backend API:** Via Supabase API Key (anon) + Row Level Security

### 2.5 Backend API (Express.js na VM)
- **O que faz:** Camada de serviço entre o frontend HTML estático e o Supabase
- **Responsabilidades:**
  - Autenticar requisições do frontend (verificar JWT)
  - Consultar Supabase e retornar dados formatados para o frontend
  - Agrupar, filtrar e formatar dados (ex: totais por cliente, por período)
  - Proteger dados sensíveis (não expor API Keys do Supabase diretamente no frontend)
  - Fornecer endpoints REST simples que o frontend chama via `fetch()`
- **Tecnologia:** Node.js + Express (leve, sem framework pesado)
- **Porta:** 3000 na VM (exposta via nginx como `/api`)
- **Autenticação:** JWT assinado com secret local — Jéssica e funcionárias fazem login uma vez

### 2.6 Frontend HTML/CSS/JS (Estático)
- **O que faz:** Interface visual do app — painéis, relatórios, visão do cliente
- **Responsabilidades:**
  - Exibir dados buscados do Backend API
  - Permitir navegação entre as telas do painel
  - Mostrar work logs, tarefas, relatórios, detalhes de cliente
- **Hospedagem:** nginx na VM, servindo arquivos estáticos da pasta `/var/www/domacondo/`
- **Comunicação:** `fetch()` para o Backend API em `/api/*`

### 2.7 Trello API (Tarefas Planejadas)
- **O que faz:** Fonte de verdade das tarefas que as funcionárias deveriam ter feito no dia
- **Acesso:** Somente leitura via API Key + Token do Trello
- **Uso:** Chamado pelo N8N antes de cada coleta (11:30 e 17:00) para buscar cards do dia

### 2.8 Google Drive API (Documentos)
- **O que faz:** Repositório de documentos dos clientes (contratos, planilhas, etc.)
- **Acesso:** Somente leitura via Google Service Account
- **Uso:** Chamado pelo N8N quando a funcionária menciona um documento específico — Gemini usa como contexto

### 2.9 Nginx (Reverse Proxy)
- **O que faz:** Porta de entrada de toda a VM para o mundo externo
- **Responsabilidades:**
  - Servir os arquivos HTML/CSS/JS estáticos do frontend
  - Rotear `/api/*` para o Backend API (porta 3000)
  - Rotear `/webhook/*` para o N8N (porta 5678)
  - Gerenciar certificado SSL (HTTPS)
- **Config:** `/etc/nginx/sites-available/domacondo`

---

## 3. Schema do Banco de Dados (Supabase)

### Tabela: `employees` (Funcionárias)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  whatsapp_phone VARCHAR(20) NOT NULL UNIQUE,  -- ex: "5511999999999"
  role VARCHAR(50) DEFAULT 'operacional',      -- 'operacional' | 'gestora'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `clients` (Clientes — Administradoras)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  contact_whatsapp VARCHAR(20),
  contact_email VARCHAR(200),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `activity_categories` (Categorias)
```sql
CREATE TABLE activity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,  -- 'Conciliação Bancária', 'Lançamento de NFs', etc.
  color VARCHAR(7),                   -- hex color para UI
  active BOOLEAN DEFAULT true
);
```

### Tabela: `work_logs` (Registros de Trabalho)
```sql
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  category_id UUID REFERENCES activity_categories(id),
  description TEXT NOT NULL,           -- relato com as palavras da funcionária
  work_date DATE NOT NULL,             -- data em que o trabalho foi executado
  shift VARCHAR(10) NOT NULL,          -- 'manha' | 'tarde'
  duration_minutes INT,                -- duração estimada em minutos
  status VARCHAR(20) NOT NULL,         -- 'concluido' | 'parcial' | 'pendente'
  observations TEXT,                   -- problemas, bloqueios
  source VARCHAR(20) DEFAULT 'whatsapp',
  confirmed_at TIMESTAMPTZ,            -- quando a funcionária confirmou
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `pending_tasks` (Pendências)
```sql
CREATE TABLE pending_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id UUID NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  description TEXT NOT NULL,           -- o que ainda falta fazer
  due_date DATE,                        -- previsão de conclusão (opcional)
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `conversation_sessions` (Estado das Conversas)
```sql
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  session_date DATE NOT NULL,
  shift VARCHAR(10) NOT NULL,            -- 'manha' | 'tarde'
  status VARCHAR(30) NOT NULL,           -- 'iniciada' | 'aguardando_relato' | 'processando'
                                         -- | 'aguardando_trello' | 'aguardando_confirmacao'
                                         -- | 'confirmada' | 'cancelada'
  raw_messages JSONB DEFAULT '[]',       -- histórico bruto da conversa
  extracted_activities JSONB,            -- atividades extraídas pelo Gemini (antes da confirmação)
  trello_tasks JSONB,                    -- tarefas Trello do dia (buscadas no início)
  gemini_context JSONB,                  -- contexto acumulado do Gemini
  started_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ                 -- sessão expira 4h após início
);
```

### Tabela: `pdf_reports` (Relatórios Gerados)
```sql
CREATE TABLE pdf_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) NOT NULL,     -- 'diario' | 'semanal' | 'mensal'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  employee_id UUID REFERENCES employees(id),  -- NULL para relatórios por cliente
  client_id UUID REFERENCES clients(id),       -- NULL para relatórios por funcionária
  file_path TEXT,                               -- caminho na VM ou URL Drive
  sent_to_whatsapp BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `system_config` (Configurações)
```sql
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Exemplos de chaves:
-- 'morning_shift_time' = '11:30'
-- 'afternoon_shift_time' = '17:00'
-- 'daily_report_time' = '17:30'
-- 'jessica_whatsapp' = '5511999999999'
```

### Tabela: `users` (Acesso ao App Web)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,        -- 'gestora' | 'funcionaria' | 'cliente'
  employee_id UUID REFERENCES employees(id),  -- se for funcionária
  client_id UUID REFERENCES clients(id),       -- se for cliente (portal)
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. API Endpoints do Backend

O Backend API roda em Node.js + Express na porta 3000, acessível via nginx em `/api`.

**Base URL:** `https://domacondo.com.br/api`

---

### 4.1 Autenticação

#### `POST /api/auth/login`
Login de usuário (Jéssica, funcionárias, clientes).

**Request:**
```json
{
  "email": "jessica@domacondo.com.br",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Jéssica",
    "role": "gestora"
  }
}
```

#### `POST /api/auth/logout`
Invalida o token da sessão.

#### `GET /api/auth/me`
Retorna dados do usuário autenticado.

---

### 4.2 Dashboard

#### `GET /api/dashboard/summary`
Resumo geral para a tela `dashboard.html`.

**Query params:** `date` (opcional, default = hoje)

**Response:**
```json
{
  "date": "2026-04-14",
  "total_hours_today": 14.5,
  "total_tasks_completed": 23,
  "total_tasks_pending": 4,
  "active_clients": 5,
  "employees_active_today": 2,
  "collection_status": {
    "morning": {
      "employee1": "confirmada",
      "employee2": "aguardando_confirmacao"
    },
    "afternoon": {
      "employee1": "nao_iniciada",
      "employee2": "nao_iniciada"
    }
  }
}
```

#### `GET /api/dashboard/recent-activity`
Últimos 20 registros de trabalho (todas as funcionárias).

---

### 4.3 Work Logs (Registros de Trabalho)

#### `GET /api/work-logs`
Lista de registros de trabalho com filtros.

**Query params:**
- `date` — data específica (YYYY-MM-DD)
- `date_from` / `date_to` — intervalo de datas
- `employee_id` — filtrar por funcionária
- `client_id` — filtrar por cliente
- `status` — `concluido` | `parcial` | `pendente`
- `category_id` — filtrar por categoria
- `shift` — `manha` | `tarde`
- `page` — paginação (default: 1)
- `per_page` — itens por página (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employee": { "id": "uuid", "name": "Ana" },
      "client": { "id": "uuid", "name": "Condomínio Bela Vista" },
      "category": { "id": "uuid", "name": "Conciliação Bancária" },
      "description": "Conciliei o extrato de março...",
      "work_date": "2026-04-14",
      "shift": "manha",
      "duration_minutes": 45,
      "status": "concluido",
      "observations": null,
      "confirmed_at": "2026-04-14T11:47:22Z"
    }
  ],
  "pagination": {
    "total": 128,
    "page": 1,
    "per_page": 50,
    "total_pages": 3
  }
}
```

#### `GET /api/work-logs/:id`
Detalhes de um registro específico.

#### `GET /api/work-logs/summary`
Totalizadores agrupados.

**Query params:** mesmos filtros acima

**Response:**
```json
{
  "total_duration_minutes": 480,
  "total_tasks": 12,
  "by_status": {
    "concluido": 9,
    "parcial": 2,
    "pendente": 1
  },
  "by_client": [
    { "client_id": "uuid", "client_name": "Bela Vista", "duration_minutes": 120, "tasks": 3 }
  ],
  "by_category": [
    { "category_id": "uuid", "category_name": "Conciliação Bancária", "duration_minutes": 90, "tasks": 2 }
  ]
}
```

---

### 4.4 Clientes

#### `GET /api/clients`
Lista todos os clientes ativos.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Condomínio Bela Vista",
      "contact_name": "Roberto Alves",
      "contact_email": "roberto@belavista.com.br",
      "stats": {
        "total_hours_this_month": 32.5,
        "pending_tasks": 2,
        "last_activity_date": "2026-04-14"
      }
    }
  ]
}
```

#### `GET /api/clients/:id`
Detalhes de um cliente específico — alimenta `client-detail.html`.

**Response:**
```json
{
  "id": "uuid",
  "name": "Condomínio Bela Vista",
  "contact_name": "Roberto Alves",
  "contact_email": "roberto@belavista.com.br",
  "stats": {
    "total_hours_this_month": 32.5,
    "total_hours_last_month": 28.0,
    "total_tasks_this_month": 18,
    "pending_tasks": 2,
    "categories_breakdown": [
      { "category": "Conciliação Bancária", "hours": 12.0, "tasks": 6 },
      { "category": "Lançamento de NFs", "hours": 8.5, "tasks": 5 }
    ]
  },
  "recent_work_logs": []
}
```

#### `GET /api/clients/:id/work-logs`
Registros de trabalho de um cliente específico (com filtros de data).

---

### 4.5 Pendências

#### `GET /api/pending-tasks`
Lista de pendências abertas.

**Query params:** `client_id`, `employee_id`, `resolved` (true|false)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Faltam 3 NFs do mês de março para lançar",
      "client": { "id": "uuid", "name": "Bela Vista" },
      "employee": { "id": "uuid", "name": "Ana" },
      "due_date": "2026-04-15",
      "resolved": false,
      "created_at": "2026-04-14T11:47:22Z"
    }
  ]
}
```

#### `GET /api/pending-tasks/:id`
Detalhes de uma pendência.

---

### 4.6 Equipe

#### `GET /api/team`
Lista todas as funcionárias — alimenta `team.html`.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ana",
      "role": "operacional",
      "stats": {
        "total_hours_today": 3.75,
        "total_hours_this_week": 18.0,
        "total_tasks_this_month": 45,
        "collection_status_today": {
          "morning": "confirmada",
          "afternoon": "nao_iniciada"
        }
      }
    }
  ]
}
```

#### `GET /api/team/:id`
Detalhes de uma funcionária — alimenta `team-detail.html`.

#### `GET /api/team/:id/work-logs`
Registros de trabalho de uma funcionária (com filtros de data).

---

### 4.7 Categorias

#### `GET /api/categories`
Lista categorias de atividade — alimenta `categories.html`.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Conciliação Bancária",
      "color": "#4F46E5",
      "stats": {
        "total_tasks_this_month": 24,
        "total_hours_this_month": 48.0
      }
    }
  ]
}
```

---

### 4.8 Relatórios

#### `GET /api/reports`
Lista de relatórios PDF gerados.

**Query params:** `type` (`diario`|`semanal`|`mensal`), `date_from`, `date_to`

#### `GET /api/reports/:id`
Metadados de um relatório específico.

#### `GET /api/reports/summary`
Dados consolidados para `reports.html`.

**Query params:** `period` (`week`|`month`|`quarter`), `client_id`

**Response:**
```json
{
  "period": "2026-04",
  "total_hours": 280.5,
  "by_client": [],
  "by_employee": [],
  "by_category": [],
  "pending_tasks_open": 7,
  "pending_tasks_resolved": 31
}
```

---

### 4.9 Portal do Cliente

Os endpoints do portal são idênticos aos acima, mas filtrados automaticamente pelo `client_id` do usuário autenticado (Role: `cliente`). O backend aplica esse filtro no middleware antes de qualquer consulta.

#### `GET /api/portal/overview`
Alimenta `portal-overview.html`. Retorna sumário do cliente autenticado.

#### `GET /api/portal/reports`
Lista relatórios do cliente autenticado — alimenta `portal-reports.html`.

#### `GET /api/portal/pending`
Pendências do cliente autenticado — alimenta `portal-pending.html`.

---

### 4.10 My Work (Funcionária)

Endpoints filtrados automaticamente pelo `employee_id` da funcionária autenticada.

#### `GET /api/my-work/today`
Tudo que a funcionária registrou hoje — alimenta `my-work.html`.

#### `GET /api/my-tasks`
Pendências abertas da funcionária autenticada — alimenta `my-tasks.html`.

#### `GET /api/my-messages`
Histórico das conversas WhatsApp da funcionária (da tabela `conversation_sessions`) — alimenta `my-messages.html`.

---

### 4.11 Agente / N8N (Endpoints internos)

Estes endpoints são chamados pelo N8N, não pelo frontend. Protegidos por API Key interna.

#### `POST /api/internal/work-logs`
N8N cria um registro de trabalho após confirmação da funcionária.

**Header:** `X-Internal-Key: {INTERNAL_API_KEY}`

#### `POST /api/internal/pending-tasks`
N8N cria uma pendência.

#### `PUT /api/internal/conversation-sessions/:id`
N8N atualiza o estado de uma sessão de conversa.

#### `POST /api/internal/conversation-sessions`
N8N inicia uma nova sessão de conversa.

---

## 5. Fluxo de Dados Completo

### 5.1 Fluxo de Coleta (WhatsApp → Supabase)

```
1. N8N Cron dispara às 11:30
   ↓
2. N8N busca tarefas Trello do dia para cada funcionária
   ↓
3. N8N cria sessão de conversa no Supabase
   (status: 'iniciada')
   ↓
4. N8N instrui Evolution API a enviar mensagem de abertura
   para o número da funcionária via WhatsApp
   ↓
5. Funcionária responde (texto ou áudio)
   ↓
6. Evolution API recebe a mensagem
   → dispara webhook para N8N (POST /webhook/whatsapp)
   ↓
7. N8N recebe o webhook
   → identifica a funcionária pelo número de telefone
   → identifica a sessão ativa (busca conversation_sessions)
   → atualiza sessão com a nova mensagem (raw_messages)
   ↓
8. N8N envia para Gemini:
   - Mensagem da funcionária (texto ou áudio base64)
   - Contexto: clientes ativos, categorias, tarefas do Trello do dia
   - Instrução: extrair atividades estruturadas
   ↓
9. Gemini retorna JSON estruturado com atividades extraídas:
   [{ cliente, categoria, descrição, duração, status, observações }]
   ↓
10. N8N salva extracted_activities na sessão
    ↓
11. N8N compara atividades com tarefas do Trello
    → identifica tarefas não mencionadas
    ↓
12. Se há lacunas: N8N envia pergunta de cobrança via Evolution API
    → Aguarda resposta → repete o ciclo (volta ao passo 5)
    ↓
13. Quando tudo cobrado: N8N pede ao Gemini que gere resumo de confirmação
    ↓
14. N8N envia resumo via Evolution API para a funcionária confirmar
    ↓
15. Funcionária responde "sim" ou corrige
    ↓
16. Se correção: N8N processa a correção, atualiza extracted_activities
    → volta ao passo 13
    ↓
17. Se confirmação: N8N salva cada atividade como work_log no Supabase
    → cria pending_tasks para status 'parcial' e 'pendente'
    → atualiza sessão (status: 'confirmada', confirmed_at: agora)
    ↓
18. Dados disponíveis imediatamente no app web via Backend API
```

### 5.2 Fluxo de Exibição (App Web → Dados)

```
1. Usuário abre dashboard.html no browser
   ↓
2. JavaScript na página faz:
   fetch('/api/dashboard/summary', {
     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
   })
   ↓
3. Backend API (Express) recebe a requisição
   → valida JWT
   → identifica usuário e role
   → monta query para o Supabase
   ↓
4. Supabase executa a query no PostgreSQL
   → retorna dados brutos
   ↓
5. Backend API formata os dados em JSON
   → aplica filtros de role (gestora vê tudo, cliente vê só os seus)
   ↓
6. Frontend recebe o JSON
   → renderiza os cards, gráficos e tabelas na tela
```

### 5.3 Fluxo de Relatório PDF

```
1. N8N Cron dispara às 17:30
   ↓
2. N8N busca work_logs do dia de cada funcionária no Supabase
   (SQL: SELECT * FROM work_logs WHERE work_date = hoje)
   ↓
3. N8N envia para Gemini:
   - Dados estruturados das atividades do dia
   - Template de relatório diário
   - Instrução: gerar narrativa profissional de fechamento do dia
   ↓
4. Gemini retorna conteúdo formatado em Markdown / HTML
   ↓
5. N8N usa biblioteca de PDF (Puppeteer ou pdfkit via HTTP Function)
   para gerar o arquivo PDF
   ↓
6. N8N salva metadados do PDF na tabela pdf_reports no Supabase
   ↓
7. N8N instrui Evolution API a enviar o PDF para o WhatsApp da Jéssica
   ↓
8. Jéssica recebe o PDF no WhatsApp
```

---

## 6. Autenticação e Segurança

### 6.1 Modelo de Roles

| Role | Quem | O que acessa |
|---|---|---|
| `gestora` | Jéssica | Tudo — todas as funcionárias, todos os clientes, todas as configurações |
| `funcionaria` | Ana, Maria | Apenas seus próprios work logs, suas tarefas, suas mensagens |
| `cliente` | Administradoras | Apenas dados do seu condomínio (portal) — via portal-overview, portal-reports, portal-pending |

### 6.2 Autenticação no Frontend

- Usuário faz login via `POST /api/auth/login`
- Backend valida email/senha (bcrypt) na tabela `users` do Supabase
- Backend gera JWT assinado com `JWT_SECRET` (secret na VM, nunca no GitHub)
- JWT tem validade de 8 horas
- Frontend guarda o token no `localStorage`
- Toda requisição envia `Authorization: Bearer {token}` no header
- Backend valida o JWT antes de qualquer operação

### 6.3 Proteção dos Endpoints

```
Middleware de autenticação (aplicado em todas as rotas /api/* exceto /api/auth/login):
  1. Verifica presença do header Authorization
  2. Valida assinatura do JWT
  3. Verifica expiração
  4. Anexa user.id, user.role, user.employee_id, user.client_id ao request
  5. Passa para o próximo middleware

Middleware de role (aplicado onde necessário):
  requireRole('gestora')       → bloqueia se role !== 'gestora'
  requireRole('funcionaria')   → bloqueia se role não for funcionaria ou gestora
  requireClientAccess()        → garante que cliente só vê seus próprios dados
```

### 6.4 Endpoints Internos (N8N → Backend)

Os endpoints `/api/internal/*` são protegidos por uma API Key diferente do JWT.
- Header: `X-Internal-Key: {INTERNAL_API_KEY}`
- `INTERNAL_API_KEY` definida no `.env` da VM
- N8N tem essa chave configurada como credencial
- Esses endpoints NUNCA são expostos ao frontend

### 6.5 Supabase — Row Level Security

O Backend API usa a `SERVICE_ROLE_KEY` do Supabase (que ignora RLS) para todas as operações. O frontend nunca tem acesso direto ao Supabase — sempre passa pelo Backend API. Isso garante que toda a lógica de permissão está centralizada no Backend.

### 6.6 Variáveis de Ambiente (apenas na VM, nunca no GitHub)

```env
# Backend API (.env na VM)
JWT_SECRET=<string aleatória 64 chars>
INTERNAL_API_KEY=<string aleatória 32 chars>
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<chave service role>
PORT=3000

# N8N (configurado via interface N8N)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=<chave evolution>
GEMINI_API_KEY=<chave google ai studio>
TRELLO_API_KEY=<chave trello>
TRELLO_TOKEN=<token trello>
GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON=<json da service account>
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<chave service role>
JESSICA_WHATSAPP=5511999999999
```

---

## 7. Hosting e Deploy na VM

### 7.1 Estrutura de diretórios na VM

```
/home/fabricio/domacondo/
├── frontend/               ← Arquivos HTML/CSS/JS copiados do GitHub
│   ├── dashboard.html
│   ├── work-logs.html
│   ├── clients.html
│   └── ... (todas as páginas)
├── backend/                ← Backend API Node.js
│   ├── src/
│   │   ├── index.js        ← Entry point Express
│   │   ├── middleware/
│   │   │   ├── auth.js     ← Validação JWT
│   │   │   └── role.js     ← Controle de roles
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── work-logs.js
│   │   │   ├── clients.js
│   │   │   ├── team.js
│   │   │   ├── categories.js
│   │   │   ├── reports.js
│   │   │   ├── pending-tasks.js
│   │   │   ├── portal.js
│   │   │   ├── my-work.js
│   │   │   └── internal.js
│   │   └── lib/
│   │       └── supabase.js ← Cliente Supabase configurado
│   ├── package.json
│   └── .env                ← NUNCA vai para o GitHub
└── logs/
    └── backend.log
```

### 7.2 Configuração Nginx

```nginx
server {
    listen 443 ssl;
    server_name domacondo.com.br;

    # SSL (Let's Encrypt via Certbot)
    ssl_certificate /etc/letsencrypt/live/domacondo.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domacondo.com.br/privkey.pem;

    # Frontend estático
    root /home/fabricio/domacondo/frontend;
    index dashboard.html;

    location / {
        try_files $uri $uri/ /dashboard.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # N8N Webhooks (somente webhooks, não expõe o painel N8N)
    location /webhook/ {
        proxy_pass http://localhost:5678/webhook/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name domacondo.com.br;
    return 301 https://$host$request_uri;
}
```

### 7.3 Gerenciamento de Processos (PM2)

O Backend API roda sob PM2 para garantir que reinicia automaticamente se cair.

```bash
# Iniciar o backend
cd /home/fabricio/domacondo/backend
pm2 start src/index.js --name "domacondo-api"
pm2 save
pm2 startup  # configura para reiniciar no boot da VM
```

### 7.4 Deploy via GitHub Actions

```yaml
# .github/workflows/deploy-domacondo.yml
on:
  push:
    branches: [main]
    paths:
      - 'Doma Condo/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy para VM
        uses: appleboy/ssh-action@master
        with:
          host: 146.148.107.228
          username: fabricio
          key: ${{ secrets.GCP_SSH_KEY }}
          script: |
            # Copia frontend
            cp -r /home/fabricio/repo/Doma\ Condo/frontend/* /home/fabricio/domacondo/frontend/
            # Copia backend (sem .env)
            rsync -av --exclude='.env' /home/fabricio/repo/Doma\ Condo/backend/ /home/fabricio/domacondo/backend/
            cd /home/fabricio/domacondo/backend
            npm install --production
            pm2 restart domacondo-api
```

---

## 8. Fases de Implementação

### Fase 0 — Infraestrutura Base (1-2 dias)
**Objetivo:** VM pronta para receber tudo.

- [ ] Criar estrutura de pastas na VM (`/home/fabricio/domacondo/`)
- [ ] Instalar Node.js, PM2, nginx na VM
- [ ] Configurar nginx (frontend estático + proxy para porta 3000)
- [ ] Configurar SSL com Let's Encrypt (Certbot)
- [ ] Criar projeto no Supabase e apontar domínio
- [ ] Configurar Evolution API (instância WhatsApp do agente)
- [ ] Configurar N8N (instalado via Docker na VM)

**Critério de conclusão:** Acessar `https://domacondo.com.br` e ver o `dashboard.html` carregando.

---

### Fase 1 — Banco de Dados (2-3 dias)
**Objetivo:** Schema completo criado e populado com dados iniciais.

- [ ] Criar todas as tabelas no Supabase (SQL das seções acima)
- [ ] Inserir dados iniciais: 2 funcionárias, 5 clientes, categorias de atividade
- [ ] Inserir usuário inicial da Jéssica (gestora)
- [ ] Testar queries básicas via Supabase Dashboard

**Critério de conclusão:** Consultar `work_logs` via Supabase Dashboard e ver dados de teste.

---

### Fase 2 — Backend API (3-5 dias)
**Objetivo:** Todos os endpoints funcionando e retornando dados reais.

- [ ] Criar projeto Node.js + Express no repositório
- [ ] Implementar middleware de autenticação (JWT)
- [ ] Implementar middleware de roles
- [ ] Implementar endpoints de autenticação (`/api/auth/*`)
- [ ] Implementar endpoints de dashboard
- [ ] Implementar endpoints de work-logs (com filtros e paginação)
- [ ] Implementar endpoints de clients
- [ ] Implementar endpoints de team
- [ ] Implementar endpoints de categories
- [ ] Implementar endpoints de pending-tasks
- [ ] Implementar endpoints de portal (filtrado por cliente)
- [ ] Implementar endpoints de my-work (filtrado por funcionária)
- [ ] Implementar endpoints internos (`/api/internal/*`)
- [ ] Deploy na VM com PM2

**Critério de conclusão:** Testar cada endpoint via Postman/Insomnia com token JWT válido e receber dados reais do Supabase.

---

### Fase 3 — Frontend Conectado ao Backend (3-4 dias)
**Objetivo:** App web mostrando dados reais em todas as telas.

- [ ] Criar `js/api.js` — módulo central com fetch autenticado
- [ ] Criar `js/auth.js` — tela de login, guarda token, redireciona
- [ ] Conectar `dashboard.html` ao endpoint `/api/dashboard/summary`
- [ ] Conectar `work-logs.html` ao endpoint `/api/work-logs`
- [ ] Conectar `clients.html` ao endpoint `/api/clients`
- [ ] Conectar `client-detail.html` ao endpoint `/api/clients/:id`
- [ ] Conectar `team.html` ao endpoint `/api/team`
- [ ] Conectar `team-detail.html` ao endpoint `/api/team/:id`
- [ ] Conectar `categories.html` ao endpoint `/api/categories`
- [ ] Conectar `reports.html` ao endpoint `/api/reports/summary`
- [ ] Conectar `my-work.html` ao endpoint `/api/my-work/today`
- [ ] Conectar `my-tasks.html` ao endpoint `/api/my-tasks`
- [ ] Conectar `my-messages.html` ao endpoint `/api/my-messages`
- [ ] Conectar `portal-overview.html` ao endpoint `/api/portal/overview`
- [ ] Conectar `portal-reports.html` ao endpoint `/api/portal/reports`
- [ ] Conectar `portal-pending.html` ao endpoint `/api/portal/pending`

**Critério de conclusão:** Jéssica consegue abrir o app, fazer login e ver dados reais de todas as telas.

---

### Fase 4 — Agente WhatsApp (5-7 dias)
**Objetivo:** Agente coletando dados automaticamente 2x por dia.

- [ ] Configurar instância Evolution API com o número do agente
- [ ] Criar Workflow N8N 1 — Coleta Manhã (Cron 11:30)
  - [ ] Busca Trello do dia
  - [ ] Cria sessão no Supabase
  - [ ] Envia mensagem de abertura via Evolution API
  - [ ] Recebe resposta (webhook)
  - [ ] Chama Gemini para extrair atividades
  - [ ] Cruza com Trello, faz cobrança
  - [ ] Envia resumo para confirmação
  - [ ] Salva no Supabase após confirmação
- [ ] Criar Workflow N8N 2 — Coleta Tarde (Cron 17:00, idêntico)
- [ ] Testar fluxo completo com mensagem real de uma funcionária

**Critério de conclusão:** Funcionária recebe mensagem às 11:30, responde, confirma, e o work log aparece no app web.

---

### Fase 5 — Relatórios PDF (3-4 dias)
**Objetivo:** PDFs gerados e enviados automaticamente.

- [ ] Criar Workflow N8N 3 — PDF Diário (Cron 17:30)
- [ ] Criar Workflow N8N 4 — PDF Semanal (Cron segunda 8h)
- [ ] Criar Workflow N8N 5 — PDF Mensal (Cron último dia útil)
- [ ] Integrar geração de PDF (Puppeteer via endpoint HTTP ou serviço externo)
- [ ] Testar envio de PDF para WhatsApp da Jéssica

**Critério de conclusão:** Jéssica recebe PDF diário no WhatsApp às 17:30.

---

### Fase 6 — Portal do Cliente (2-3 dias)
**Objetivo:** Cada cliente acessa seu próprio portal.

- [ ] Criar usuários no sistema para cada um dos 5 clientes (role: `cliente`)
- [ ] Testar acesso ao portal — verificar que cliente A só vê dados do cliente A
- [ ] Verificar portal-overview.html, portal-reports.html, portal-pending.html

**Critério de conclusão:** Cliente faz login e vê apenas seus dados.

---

## 9. Dependências e Riscos

### Dependências Externas Críticas
| Dependência | Risco | Mitigação |
|---|---|---|
| Evolution API | Instabilidade ou banimento do número WhatsApp | Manter número no warm-up, não enviar spam |
| Gemini API | Latência alta em áudios longos | Timeout de 60s no N8N, retry automático |
| Supabase | Limite de requisições no plano gratuito | Monitorar uso, migrar para plano pago se necessário |
| Trello API | Rate limit (300 req/10min) | Cachear tarefas do dia por 1h no Supabase |

### Riscos de Implementação
| Risco | Impacto | Mitigação |
|---|---|---|
| Funcionária não responder no horário | Sessão fica pendente indefinidamente | `expires_at` na sessão — expirar após 4h, Jéssica recebe alerta |
| Gemini extrai cliente errado | Dados salvos no cliente errado | Sempre confirmar com a funcionária antes de salvar |
| N8N perde o estado da conversa | Sessão reinicia do zero | Estado da sessão sempre no Supabase, nunca apenas em memória N8N |
| VM reinicia durante uma conversa | Sessão perdida | PM2 reinicia o backend, N8N reinicia automático, sessão continua do Supabase |

---

## 10. Decisões de Arquitetura Registradas

| Decisão | Alternativa considerada | Motivo da escolha |
|---|---|---|
| Backend API separado (Express) em vez de Supabase direto no frontend | Expor Supabase diretamente com RLS | Evita vazar API Keys no browser, centraliza lógica de permissão, mais seguro |
| N8N como orquestrador do agente em vez de script Python/Node | FastAPI como orquestrador | N8N é visual, mais fácil de debugar e manter, Gemini é o cérebro real |
| Estado da conversa no Supabase em vez de memória do N8N | Variáveis em memória no workflow N8N | Persistente entre reinicializações, rastreável, auditável |
| JWT assinado localmente em vez de Supabase Auth | Supabase Auth nativo | Simplicidade — não precisa de OAuth, apenas login simples email/senha |
| PDF gerado no N8N em vez de serviço separado | Serviço Python de geração de PDF | Menos infraestrutura, N8N tem nós de HTTP que podem chamar Puppeteer ou serviço de PDF externo |
| Gemini 2.0 Flash para coleta, Gemini 1.5 Pro para relatórios mensais | Usar um único modelo | Flash é mais rápido e barato para conversas em tempo real; Pro tem qualidade superior para narrativas longas |
