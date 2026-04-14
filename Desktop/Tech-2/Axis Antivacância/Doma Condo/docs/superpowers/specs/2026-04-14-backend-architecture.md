# Arquitetura Backend — Doma Condo

**Data:** 2026-04-14
**Status:** Planejamento aprovado para implementação
**Projeto:** Doma Condo — BPO Financeiro para Administradoras de Condomínios
**Relacionado:** [[2026-04-13-doma-condo-frontend-standardization-design]], [[2026-04-14-database-schema]], [[2026-04-14-api-integrations]]

---

## 1. Visão Geral da Arquitetura

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                            GOOGLE CLOUD VM                                        │
│                       domacondo-axis-1 · 146.148.107.228                          │
│                                                                                   │
│  ┌─────────────────────┐    WebSocket    ┌──────────────────────────────────────┐ │
│  │   GATHER BOT        │◄───────────────►│         gather.town                  │ │
│  │   (Node.js / PM2)   │  (playerChats)  │   Espaço virtual Doma Condo          │ │
│  │   porta: 3001       │                 │   Funcionária 1 e Funcionária 2      │ │
│  └──────────┬──────────┘                 └──────────────────────────────────────┘ │
│             │ HTTP POST (webhook)                                                  │
│             ▼                                                                      │
│  ┌─────────────────────┐                 ┌──────────────────────────────────────┐ │
│  │       N8N           │◄───────────────►│     Evolution API (WhatsApp)         │ │
│  │  Orquestração       │  HTTP (REST)    │     porta: 8080                      │ │
│  │  Crons / Workflows  │                 │     Envia PDF para a Jéssica         │ │
│  │  porta: 5678        │                 └──────────────────────────────────────┘ │
│  └──────────┬──────────┘                                                          │
│             │ chamadas HTTP                                                        │
│             ▼                                                                      │
│  ┌─────────────────────┐                 ┌──────────────────────────────────────┐ │
│  │   Frontend          │                 │     Nginx (proxy reverso)            │ │
│  │   HTML/CSS/JS       │◄───────────────►│     porta: 80 / 443 (HTTPS)         │ │
│  │   estático          │  arquivos       │     domacondo.com.br                 │ │
│  └─────────────────────┘                 └──────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼──────────────────────────────────┐
        │   SERVIÇOS EXTERNOS                               │
        │                                                   │
        │  ┌────────────────────┐   ┌──────────────────────┐│
        │  │   Supabase         │   │   Gemini API         ││
        │  │   PostgreSQL       │   │   (Google AI)        ││
        │  │   Auth + Storage   │◄──┤   LLM — extração,    ││
        │  │   REST API auto-   │   │   narrativa, PDF     ││
        │  │   gerada           │   └──────────────────────┘│
        │  └────────────────────┘                           │
        │                                                   │
        │  ┌────────────────────┐   ┌──────────────────────┐│
        │  │   Trello API       │   │   Google Drive API   ││
        │  │   Tarefas previstas│   │   Documentos e NFs   ││
        │  │   do dia           │   │   dos clientes       ││
        │  └────────────────────┘   └──────────────────────┘│
        └───────────────────────────────────────────────────┘
```

### Resumo dos canais

| Canal | Direção | Para quem | Tecnologia |
|---|---|---|---|
| Gather (DM) | Bot ↔ Funcionárias | Funcionária 1, Funcionária 2 | WebSocket SDK `@gathertown/gather-game-client` |
| WhatsApp (PDF) | Bot → Jéssica | Jéssica (gestora) | Evolution API REST |
| App web | Frontend → Supabase | Jéssica + clientes (portal) | Supabase REST API |
| Cron interno | N8N → serviços | Sistêmico | N8N workflows |

---

## 2. Componentes e Responsabilidades

### 2.1 Gather Bot (Node.js)

- **Função:** único ponto de contato com as funcionárias. Envia perguntas, recebe respostas e repassa ao N8N via HTTP.
- **Runtime:** Node.js 20 LTS, gerenciado pelo PM2 (processo persistente)
- **Porta local:** 3001 (servidor HTTP interno para receber comandos do N8N)
- **SDK:** `@gathertown/gather-game-client` (npm)
- **Autenticação:** variável de ambiente `GATHER_API_KEY`
- **Arquivo principal:** `/home/fabricio/domacondo/gather-bot/index.js`

### 2.2 N8N

- **Função:** orquestrador central. Dispara crons, coordena o fluxo entre Gather Bot, Gemini, Supabase, Trello e Evolution API.
- **Porta:** 5678
- **Processo:** Docker container (já em execução na VM)
- **Webhooks internos:** recebe eventos do Gather Bot via HTTP POST

### 2.3 Gemini API (Google AI)

- **Função:** cérebro do agente. Recebe o texto da funcionária (transcrito pelo Gather Bot), extrai atividades estruturadas, identifica lacunas, cruza com o Trello e gera a narrativa dos relatórios.
- **Modelo:** `gemini-1.5-pro` (ou `gemini-2.0-flash` para respostas rápidas)
- **Integração:** chamada HTTP via N8N (HTTP Request node) com `Authorization: Bearer API_KEY`
- **Nota:** O Gather não suporta áudio via API. Toda entrada é texto puro — Gemini processa apenas texto neste contexto.

### 2.4 Evolution API (WhatsApp)

- **Função:** envio de PDFs de relatórios para a Jéssica. NÃO é usado para conversar com funcionárias.
- **Porta:** 8080
- **Processo:** Docker container na VM
- **Uso:** apenas chamada REST do N8N para enviar mensagem com mídia (PDF em base64 ou URL)

### 2.5 Supabase

- **Função:** banco de dados principal do app web. Armazena work_logs, tarefas, clientes, relatórios e usuários.
- **Acesso frontend:** Supabase JS Client (`@supabase/supabase-js`) direto do browser (RLS habilitado)
- **Acesso agente:** Supabase REST API via N8N (com `service_role` key para bypass de RLS quando necessário)
- **Auth:** Supabase Auth (magic link / email+senha)

### 2.6 Trello API

- **Função:** fonte de verdade das tarefas previstas para o dia. O agente consulta antes de perguntar às funcionárias o que fizeram, para identificar divergências.
- **Integração:** N8N HTTP Request com API Key do Trello
- **Fluxo:** N8N busca os cards com due date = hoje antes de iniciar a coleta

### 2.7 Google Drive API

- **Função:** repositório de documentos dos clientes (NFs, extratos, planilhas). O Gemini pode ser alimentado com contexto desses documentos ao gerar relatórios detalhados.
- **Integração:** N8N (Google Drive node nativo ou HTTP Request com OAuth2)

### 2.8 Nginx

- **Função:** proxy reverso e servidor de arquivos estáticos do frontend.
- **Portas:** 80 (HTTP, redireciona para HTTPS) e 443 (HTTPS com certificado Let's Encrypt)
- **Configuração:** `/etc/nginx/sites-enabled/domacondo`

---

## 3. Gather Bot — Especificação Técnica Detalhada

### 3.1 Como o bot funciona

O bot abre uma conexão WebSocket persistente ao espaço Gather da Doma Condo usando o SDK oficial. Ele age como um "usuário invisível" dentro do espaço.

```js
// Inicialização da conexão
const { Game } = require("@gathertown/gather-game-client");
const game = new Game("GATHER_API_KEY", "SPACE_ID\SPACE_NAME");

game.connect();
game.subscribeToConnection((connected) => {
  console.log("Gather bot conectado:", connected);
});
```

### 3.2 Recebendo mensagens das funcionárias

```js
// Subscrição ao evento de chat
game.subscribeToEvent("playerChats", (data, context) => {
  const { senderId, contents, recipient } = data.playerChats;
  
  // Só processa DMs direcionadas ao bot
  if (recipient === BOT_PLAYER_ID) {
    handleFuncionariaMessage(senderId, contents);
  }
});
```

### 3.3 Enviando mensagens para as funcionárias

```js
// Envio de DM para uma funcionária
function sendDM(memberId, message) {
  game.chat("DM", [memberId], CURRENT_MAP_ID, message);
}
```

### 3.4 Comunicação Gather Bot ↔ N8N

O bot expõe um servidor HTTP local (porta 3001) para receber comandos do N8N:

**Endpoints do Gather Bot (recebe do N8N):**

| Método | Rota | Função |
|---|---|---|
| POST | `/bot/send-dm` | N8N ordena o bot a enviar DM para funcionária |
| POST | `/bot/start-session` | N8N inicia uma sessão de coleta com funcionária X |
| GET | `/bot/status` | N8N verifica se o bot está online |

**Webhook do N8N (bot envia para o N8N):**

| Evento | URL | Payload |
|---|---|---|
| Mensagem recebida | `http://localhost:5678/webhook/gather-message` | `{ funcionaria_id, mensagem, timestamp }` |
| Sessão concluída | `http://localhost:5678/webhook/gather-session-done` | `{ funcionaria_id, mensagens[], timestamp }` |

### 3.5 Gerenciamento de sessão de conversa

O bot mantém um objeto de estado em memória por funcionária:

```js
const sessions = {
  "PLAYER_ID_FUNC_1": {
    ativa: true,
    etapa: "aguardando_resposta", // | "confirmacao" | "concluida"
    mensagens: [],
    iniciada_em: "2026-04-14T11:30:00Z"
  }
};
```

- Sessões expiram após 30 minutos sem resposta (timeout com `setTimeout`)
- Se a funcionária demorar, o bot reenvia um lembrete educado via DM
- Apenas uma sessão por funcionária pode estar ativa ao mesmo tempo

### 3.6 Variáveis de ambiente do Gather Bot

```env
GATHER_API_KEY=xxxxx
GATHER_SPACE_ID=xxxxx\doma-condo
GATHER_MAP_ID=blank (ou o mapa padrão do espaço)
GATHER_BOT_PLAYER_ID=xxxxx
FUNCIONARIA_1_PLAYER_ID=xxxxx
FUNCIONARIA_2_PLAYER_ID=xxxxx
N8N_WEBHOOK_BASE=http://localhost:5678/webhook
BOT_HTTP_PORT=3001
```

---

## 4. API Endpoints — Frontend → Supabase

O frontend (páginas HTML estáticas) consome dados diretamente do Supabase via REST API com o client JS. Abaixo estão as queries principais por página.

### 4.1 dashboard.html

```js
// KPIs do período atual
supabase.from("work_logs").select("duration_minutes, client_id, status")
  .gte("date", startOfMonth).lte("date", today);

// Tarefas pendentes
supabase.from("tasks").select("*").eq("status", "pending").limit(5);

// Último relatório gerado
supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(1);
```

### 4.2 work-logs.html

```js
// Listagem de registros com filtros
supabase.from("work_logs")
  .select("*, clients(name), team_members(name)")
  .gte("date", filterStart)
  .lte("date", filterEnd)
  .order("date", { ascending: false });
```

### 4.3 tasks.html

```js
// Tarefas abertas agrupadas por cliente
supabase.from("tasks")
  .select("*, clients(name)")
  .in("status", ["pending", "in_progress"])
  .order("due_date");
```

### 4.4 clients.html

```js
// Lista de clientes com horas do mês
supabase.from("clients").select("*").eq("active", true);

// Horas por cliente no mês
supabase.from("work_logs")
  .select("client_id, duration_minutes")
  .gte("date", startOfMonth);
```

### 4.5 client-detail.html

```js
// Dados do cliente específico
supabase.from("clients").select("*").eq("id", clientId).single();

// Histórico de work_logs do cliente
supabase.from("work_logs")
  .select("*, team_members(name)")
  .eq("client_id", clientId)
  .order("date", { ascending: false })
  .limit(50);

// Tarefas do cliente
supabase.from("tasks").select("*").eq("client_id", clientId);
```

### 4.6 team.html / team-detail.html

```js
// Todas as funcionárias
supabase.from("team_members").select("*").eq("active", true);

// Work logs da funcionária
supabase.from("work_logs")
  .select("*, clients(name)")
  .eq("team_member_id", memberId)
  .gte("date", startOfMonth);
```

### 4.7 reports.html

```js
// Lista de relatórios gerados
supabase.from("reports")
  .select("*, clients(name)")
  .order("created_at", { ascending: false });

// Busca relatório específico por ID para download
supabase.from("reports").select("pdf_url, content").eq("id", reportId).single();
```

### 4.8 portal-overview.html / portal-reports.html (acesso restrito ao cliente)

```js
// RLS garante que o cliente só vê seus próprios dados
// A política de RLS filtra por auth.uid() = clients.portal_user_id

supabase.from("work_logs").select("*").eq("client_id", clientId);
supabase.from("reports").select("*").eq("client_id", clientId);
```

---

## 5. Fluxo de Dados Completo

### 5.1 Fluxo de Coleta via Gather (2x ao dia: 11:30 e 17:00)

```
PASSO 1 — N8N Cron dispara (11:30 ou 17:00)
  → N8N busca na Trello API os cards com due date = hoje
  → N8N monta a lista de tarefas previstas em formato texto

PASSO 2 — Coleta com Funcionária 1
  → N8N envia POST para http://localhost:3001/bot/start-session
     { funcionaria_id: "PLAYER_ID_FUNC_1", contexto_trello: "..." }
  → Gather Bot envia DM para Funcionária 1:
     "Olá! Me conta o que você fez hoje (ou nesta manhã).
      Pode incluir: cliente, atividade, tempo aproximado e se concluiu."
  → Funcionária 1 responde via DM no Gather (texto livre)
  → Gather Bot recebe o evento playerChats
  → Gather Bot envia POST para N8N webhook:
     { funcionaria_id, mensagem: "texto da resposta", timestamp }

PASSO 3 — Processamento Gemini
  → N8N chama Gemini API com:
     - Mensagem da funcionária
     - Contexto: lista de tarefas Trello do dia
     - Prompt: extrair cliente, categoria, atividade, duração, status
  → Gemini retorna JSON estruturado:
     [
       { cliente: "Cond. X", categoria: "conciliacao", atividade: "...", duracao: 90, status: "concluido" },
       { cliente: "Cond. Y", categoria: "pagamento", atividade: "...", duracao: 45, status: "pendente" }
     ]

PASSO 4 — Identificação de lacunas
  → N8N compara o JSON do Gemini com as tarefas Trello
  → Se houver tarefa prevista sem correspondência:
     N8N envia POST para /bot/send-dm com pergunta de cobrança
     → Gather Bot envia DM: "Vi que tinha X previsto para o Condomínio Y.
        Você chegou a fazer? Se não, posso registrar como pendente."
  → Funcionária responde → loop volta ao Passo 2 (Gather Bot → N8N webhook → Gemini)

PASSO 5 — Confirmação
  → N8N manda o Gather Bot enviar resumo de confirmação via DM:
     "Vou registrar assim:
      ✓ Cond. X — Conciliação bancária (1h30)
      ✓ Cond. Y — Pagamento de boleto (45min) — PENDENTE
      Está certo?"
  → Funcionária responde "sim" / "não" / correções
  → Se "sim": N8N salva os registros no Supabase (tabela work_logs)
  → Se "não" / correção: N8N reinicia o loop de extração com Gemini

PASSO 6 — Repete para Funcionária 2
  → Mesmo fluxo do Passo 2 ao 5 com FUNCIONARIA_2_PLAYER_ID
```

### 5.2 Fluxo de Geração e Envio de Relatório PDF via WhatsApp

```
PASSO 1 — N8N Cron dispara (17:30 diário, ou segundo-feira para semanal, ou 1º do mês)

PASSO 2 — Busca de dados
  → N8N busca no Supabase todos os work_logs do período (dia / semana / mês)
  → N8N busca os dados dos clientes e equipe relacionados
  → N8N busca documentos complementares no Google Drive (se necessário)

PASSO 3 — Geração de narrativa com Gemini
  → N8N chama Gemini com os dados estruturados + prompt de relatório
  → Gemini gera:
     - Resumo executivo
     - Horas por cliente e categoria
     - Pendências identificadas
     - Observações relevantes

PASSO 4 — Geração do PDF
  → N8N usa um node de geração de PDF (html-pdf ou Puppeteer via HTTP)
  → Template HTML pré-formatado com a identidade visual da Doma Condo
  → PDF gerado é salvo no Supabase Storage (bucket: relatórios)
  → URL pública do PDF é salva na tabela reports do Supabase

PASSO 5 — Envio via WhatsApp para Jéssica
  → N8N chama Evolution API:
     POST http://localhost:8080/message/sendMedia/doma-condo-instance
     {
       "number": "5511XXXXXXXXX",
       "mediatype": "document",
       "mimetype": "application/pdf",
       "caption": "Relatório Doma Condo — 14/04/2026",
       "media": "https://supabase-url/storage/relatorios/rel-2026-04-14.pdf"
     }
  → Jéssica recebe o PDF no WhatsApp

PASSO 6 — Registro
  → N8N atualiza o registro na tabela reports com:
     { status: "enviado", sent_at: now(), whatsapp_message_id: "..." }
```

---

## 6. Autenticação e Segurança

### 6.1 Perfis de acesso

| Perfil | Quem | Nível de acesso |
|---|---|---|
| Admin | Jéssica | Acesso total: todos os clientes, relatórios, configurações |
| Funcionária | Funcionária 1 / 2 | Acesso ao app web somente para visualização dos próprios registros |
| Cliente | Administradoras (5 clientes) | Portal restrito: vê apenas seus próprios dados |
| Agente (bot) | N8N / Gather Bot | service_role key — acesso total ao Supabase via backend |

### 6.2 Row Level Security (RLS) no Supabase

Políticas obrigatórias:

```sql
-- work_logs: funcionária só vê os próprios registros
CREATE POLICY "funcionaria_proprios_logs" ON work_logs
  FOR SELECT USING (
    auth.uid() = team_member_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- work_logs: clientes só veem os logs do seu client_id
CREATE POLICY "cliente_proprios_logs" ON work_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = work_logs.client_id
      AND portal_user_id = auth.uid()
    )
  );

-- reports: cliente só vê os próprios relatórios
CREATE POLICY "cliente_proprios_relatorios" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = reports.client_id
      AND portal_user_id = auth.uid()
    )
  );
```

### 6.3 Autenticação do app web

- **Jéssica e funcionárias:** Supabase Auth com email+senha
- **Clientes (portal):** Supabase Auth com magic link (email) ou email+senha
- **JWT:** gerenciado automaticamente pelo Supabase JS Client
- **Sessão:** persistida no localStorage, renovada automaticamente

### 6.4 Segurança do Gather Bot

- `GATHER_API_KEY` armazenada apenas em variável de ambiente na VM (arquivo `.env` fora do git)
- Servidor HTTP do bot (porta 3001) acessível apenas em `localhost` — nunca exposto externamente
- N8N e bot comunicam-se internamente na VM via `127.0.0.1`

### 6.5 Segurança da Evolution API

- Porta 8080 não exposta externamente (nginx não faz proxy dessa porta)
- API Key da Evolution armazenada como variável de ambiente no N8N
- Acesso apenas via rede interna da VM

---

## 7. Hosting e Deploy

### 7.1 Estrutura de diretórios na VM

```
/home/fabricio/domacondo/
├── gather-bot/               # Gather Bot Node.js
│   ├── index.js              # Ponto de entrada principal
│   ├── handlers/
│   │   ├── messageHandler.js # Processa playerChats
│   │   └── sessionManager.js # Gerencia estado das sessões
│   ├── server.js             # Servidor HTTP interno (porta 3001)
│   ├── .env                  # Variáveis de ambiente (não sobe pro git)
│   └── package.json
├── frontend/                 # Arquivos HTML/CSS/JS estáticos
│   ├── dashboard.html
│   ├── work-logs.html
│   └── ...
├── n8n-data/                 # Volume persistente do N8N (Docker)
├── docker-compose.yml        # N8N + Evolution API
└── nginx/
    └── domacondo.conf        # Configuração do Nginx
```

### 7.2 PM2 — Gerenciamento do Gather Bot

```bash
# Instalação inicial
npm install -g pm2
cd /home/fabricio/domacondo/gather-bot
pm2 start index.js --name "doma-gather-bot"
pm2 save
pm2 startup  # garante que reinicia automaticamente na VM

# Comandos úteis
pm2 status              # ver se está rodando
pm2 logs doma-gather-bot   # ver logs em tempo real
pm2 restart doma-gather-bot  # reiniciar após atualização
```

### 7.3 Docker Compose (N8N + Evolution API)

```yaml
# /home/fabricio/domacondo/docker-compose.yml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "127.0.0.1:5678:5678"  # apenas localhost
    volumes:
      - ./n8n-data:/home/node/.n8n
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - WEBHOOK_URL=http://localhost:5678
    restart: always

  evolution:
    image: atendai/evolution-api
    ports:
      - "127.0.0.1:8080:8080"  # apenas localhost
    environment:
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
    restart: always
```

### 7.4 Nginx — Configuração do Proxy Reverso

```nginx
# /etc/nginx/sites-enabled/domacondo
server {
    listen 80;
    server_name domacondo.com.br www.domacondo.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name domacondo.com.br www.domacondo.com.br;

    ssl_certificate /etc/letsencrypt/live/domacondo.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domacondo.com.br/privkey.pem;

    # Frontend estático
    root /home/fabricio/domacondo/frontend;
    index dashboard.html;

    location / {
        try_files $uri $uri/ /dashboard.html;
    }

    # N8N não exposto externamente — acesso apenas via VM interna
}
```

### 7.5 GitHub Actions — Deploy Automático

```yaml
# .github/workflows/deploy-domacondo.yml
name: Deploy Doma Condo

on:
  push:
    branches: [main]
    paths:
      - 'Doma Condo/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy para VM via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: 146.148.107.228
          username: fabricio
          key: ${{ secrets.GCP_SSH_KEY }}
          script: |
            cd /home/fabricio/domacondo
            git pull origin main
            
            # Atualiza o Gather Bot
            cd gather-bot
            npm install --production
            pm2 restart doma-gather-bot
            
            # Copia frontend estático
            cp -r /home/fabricio/domacondo/frontend/* /var/www/domacondo/
            
            # Recarrega nginx se config mudou
            sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Fases de Implementação

### Fase 1 — Gather Bot (PRIORIDADE MÁXIMA)

**O que é:** implementar o bot Node.js que conecta ao Gather e se comunica com o N8N.

**Entregáveis:**
1. Projeto Node.js criado em `/home/fabricio/domacondo/gather-bot/`
2. Conexão WebSocket funcionando com o espaço Gather da Doma Condo
3. Bot recebe DMs das funcionárias e repassa ao N8N via webhook
4. N8N consegue enviar DMs para funcionárias via HTTP POST no bot
5. PM2 configurado — bot reinicia automaticamente se cair
6. Teste manual: funcionária manda mensagem no Gather → N8N recebe → N8N manda resposta → funcionária recebe

**Critério de sucesso:** o bot fica online 24/7 sem intervenção manual, e a comunicação DM ↔ N8N funciona de ponta a ponta.

---

### Fase 2 — Workflow N8N de Coleta

**O que é:** construir o workflow no N8N que usa o Gather Bot para fazer a coleta 2x ao dia.

**Entregáveis:**
1. Cron configurado para 11:30 e 17:00 (horário de Brasília)
2. Integração com Trello API para buscar tarefas do dia
3. Integração com Gemini para extrair dados estruturados das respostas
4. Lógica de lacunas: identifica tarefas do Trello sem correspondência
5. Fluxo de confirmação via Gather Bot
6. Gravação dos registros confirmados no Supabase (tabela work_logs)

**Critério de sucesso:** ao final do ciclo, os work_logs aparecem corretamente no app web.

---

### Fase 3 — Relatórios PDF via WhatsApp

**O que é:** workflow N8N que gera PDF com Gemini e envia para Jéssica via WhatsApp.

**Entregáveis:**
1. Template HTML de relatório com identidade visual Doma Condo
2. Geração de PDF a partir do HTML (Puppeteer ou html-pdf via container)
3. Upload do PDF para Supabase Storage
4. Envio via Evolution API (WhatsApp) para o número da Jéssica
5. Crons: diário (17:30), semanal (segunda, 08:00) e mensal (1º do mês, 08:00)

**Critério de sucesso:** Jéssica recebe o PDF no WhatsApp nos horários corretos, com dados reais do Supabase.

---

### Fase 4 — Portal do Cliente

**O que é:** acesso restrito para as 5 administradoras de condomínio visualizarem seus próprios dados.

**Entregáveis:**
1. Fluxo de login via magic link (email) para os clientes
2. RLS no Supabase garantindo isolamento total de dados
3. Páginas portal-overview.html e portal-reports.html funcionando com dados reais
4. Download de PDF dos relatórios pelo portal

**Critério de sucesso:** cada cliente loga e vê apenas seus próprios dados — sem acesso aos dados de outros clientes.

---

### Fase 5 — Automações complementares

**O que é:** integrações secundárias para enriquecer o contexto do agente.

**Entregáveis:**
1. Integração com Google Drive API para contexto documental no Gemini
2. Alertas automáticos via WhatsApp para Jéssica quando houver anomalias (muitas pendências, horas abaixo do esperado)
3. Dashboard de produtividade com métricas semanais e mensais

---

## 9. Referências e Documentação

| Recurso | URL |
|---|---|
| Gather SDK (@gathertown/gather-game-client) | https://github.com/gathertown/gather-game-client |
| Gather API Docs | https://gathertown.notion.site/Gather-HTTP-API |
| N8N Docs | https://docs.n8n.io |
| Supabase Docs | https://supabase.com/docs |
| Evolution API Docs | https://doc.evolution-api.com |
| Gemini API Docs | https://ai.google.dev/docs |
| Trello API Docs | https://developer.atlassian.com/cloud/trello/rest |
| Google Drive API Docs | https://developers.google.com/drive/api/reference/rest/v3 |
