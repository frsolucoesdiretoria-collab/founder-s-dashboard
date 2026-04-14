# Integrações de API — Doma Condo

**Data:** 2026-04-14
**Projeto:** Doma Condo — BPO Financeiro de Condomínios
**Autor:** Agente Claude Code
**Status:** Revisão completa — Gather como canal principal (substitui versão anterior)

---

## Visão Geral

O Doma Condo usa uma arquitetura de bot + orquestrador para que o agente de IA converse com as funcionárias pelo Gather (chat interno) e envie relatórios para a Jéssica via WhatsApp.

**Prioridades:**

| # | Sistema | Papel |
|---|---|---|
| 1 | Gather WebSocket Bot | Conversa do agente com as funcionárias |
| 1 | Gemini API | LLM que processa conversas e gera relatórios |
| 1 | Supabase | Banco de dados (histórico, sessões, dados dos clientes) |
| 1 | N8N | Orquestrador de todos os fluxos |
| 2 | Evolution API (WhatsApp) | Envio de PDFs de relatório para a Jéssica |
| 3 | Trello API | Leitura das tarefas do dia antes de cada coleta |
| 4 | Google Drive API | Contexto de documentos dos clientes para o Gemini |

---

## 1. Gather WebSocket Bot (PRIORIDADE 1 — CRÍTICO)

### O que é e qual o papel

O Gather é uma plataforma de escritório virtual onde as funcionárias já trabalham. O bot é um processo Node.js rodando continuamente na VM, conectado ao espaço Gather via WebSocket. Ele escuta DMs das funcionárias, encaminha para o N8N (onde o Gemini processa), e devolve a resposta como DM no Gather.

O bot também expõe um endpoint HTTP simples para que o N8N possa enviar respostas de volta.

### Instalação

```bash
npm install @gathertown/gather-game-client express
```

### Código completo do bot (`gather-bot.js`)

```javascript
const { Game } = require("@gathertown/gather-game-client");
const express = require("express");
const axios = require("axios");

// ─── Configuração ───────────────────────────────────────────
const GATHER_API_KEY = process.env.GATHER_API_KEY;
const GATHER_SPACE_ID = process.env.GATHER_SPACE_ID;
// Formato do SPACE_ID: "ABC123\\nome-do-espaco"
// Exemplo: "xKj9mN\\doma-condo"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
// URL do webhook do N8N que recebe mensagens das funcionárias

const BOT_HTTP_PORT = process.env.BOT_HTTP_PORT || 3500;
// Porta onde o bot escuta respostas do N8N

// ─── Conectar ao Gather ──────────────────────────────────────
const game = new Game(
  GATHER_SPACE_ID,
  () => Promise.resolve({ apiKey: GATHER_API_KEY })
);

game.connect();

// Confirmar conexão
game.subscribeToEvent("ready", () => {
  console.log("[Gather Bot] Conectado ao espaço com sucesso.");
});

// ─── Receber DMs das funcionárias ────────────────────────────
game.subscribeToEvent("playerChats", async (data, context) => {
  const chat = data.playerChats;

  // Filtrar apenas mensagens diretas (DM)
  // messageType "DM" indica mensagem privada
  if (chat.messageType !== "DM") return;

  const remetenteId = chat.senderId;     // ID do jogador que enviou
  const mensagem = chat.contents;        // Texto da mensagem
  const mapaId = context.spaceId;        // ID do espaço/mapa atual

  console.log(`[Gather Bot] DM recebida de ${remetenteId}: ${mensagem}`);

  // Montar payload para o N8N
  const payload = {
    funcionaria_id: remetenteId,
    mensagem: mensagem,
    sessao_id: `${remetenteId}-${Date.now()}`,
    mapa_id: mapaId,
    timestamp: new Date().toISOString(),
  };

  try {
    // Enviar para o N8N processar com o Gemini
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log(`[Gather Bot] Mensagem enviada ao N8N para processamento.`);
  } catch (err) {
    console.error("[Gather Bot] Erro ao enviar para N8N:", err.message);

    // Avisar a funcionária que houve erro
    game.chat(
      "DM",
      [{ name: "", map: mapaId, target: remetenteId }],
      mapaId,
      "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes."
    );
  }
});

// ─── Endpoint HTTP — receber resposta do N8N ─────────────────
// O N8N chama esta rota com a resposta gerada pelo Gemini
const app = express();
app.use(express.json());

app.post("/responder", (req, res) => {
  const { funcionaria_id, resposta, mapa_id } = req.body;

  if (!funcionaria_id || !resposta) {
    return res.status(400).json({ erro: "funcionaria_id e resposta são obrigatórios" });
  }

  const mapDestino = mapa_id || "main"; // mapa padrão se não informado

  console.log(`[Gather Bot] Enviando resposta para ${funcionaria_id}: ${resposta}`);

  // Enviar DM de volta para a funcionária no Gather
  game.chat(
    "DM",
    [{ name: "", map: mapDestino, target: funcionaria_id }],
    mapDestino,
    resposta
  );

  res.json({ ok: true });
});

app.listen(BOT_HTTP_PORT, () => {
  console.log(`[Gather Bot] Endpoint HTTP rodando na porta ${BOT_HTTP_PORT}`);
});
```

### Variáveis de ambiente necessárias

```env
GATHER_API_KEY=sua_api_key_aqui
GATHER_SPACE_ID=xKj9mN\nome-do-espaco
N8N_WEBHOOK_URL=http://localhost:5678/webhook/gather-mensagem
BOT_HTTP_PORT=3500
```

**Como obter a API Key:** Acesse https://app.gather.town/apikeys — gere uma chave e guarde.

**Como obter o SPACE_ID:** Abra o espaço no Gather, copie a URL. O ID está no formato `https://app.gather.town/app/ABC123/nome-espaco` → o SPACE_ID é `ABC123\nome-espaco`.

### Como rodar com PM2 na VM

PM2 é o gerenciador de processos que mantém o bot rodando mesmo após reinicialização.

```bash
# Instalar PM2 globalmente (se ainda não tiver)
npm install -g pm2

# Iniciar o bot com as variáveis de ambiente
pm2 start gather-bot.js --name "doma-gather-bot" \
  --env production

# Salvar para reiniciar automaticamente
pm2 save
pm2 startup

# Ver logs em tempo real
pm2 logs doma-gather-bot

# Reiniciar após mudanças no código
pm2 restart doma-gather-bot
```

Arquivo de configuração PM2 (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: "doma-gather-bot",
      script: "./gather-bot.js",
      env: {
        NODE_ENV: "production",
        GATHER_API_KEY: "sua_api_key",
        GATHER_SPACE_ID: "ABC123\\nome-espaco",
        N8N_WEBHOOK_URL: "http://localhost:5678/webhook/gather-mensagem",
        BOT_HTTP_PORT: "3500",
      },
      restart_delay: 5000,     // aguarda 5s antes de reiniciar em caso de crash
      max_restarts: 10,
    },
  ],
};
```

### Como configurar no N8N

**Fluxo de entrada (receber mensagem da funcionária):**

1. Adicione um nó **Webhook** no N8N
   - Método: `POST`
   - Path: `/gather-mensagem`
   - Copie a URL gerada — essa é a `N8N_WEBHOOK_URL` do bot

2. Conecte ao nó **Gemini** (Google AI) com o prompt do agente + a mensagem recebida em `{{ $json.mensagem }}`

3. Após o Gemini processar, adicione um nó **HTTP Request**:
   - Método: `POST`
   - URL: `http://localhost:3500/responder` (ou o IP da VM)
   - Body:
     ```json
     {
       "funcionaria_id": "{{ $json.funcionaria_id }}",
       "resposta": "{{ $json.resposta_gemini }}",
       "mapa_id": "{{ $json.mapa_id }}"
     }
     ```

### Limitações importantes

- **Sem áudio:** A API do Gather não suporta transmissão de voz — apenas texto via DMs
- **DMs são mais confiáveis** que mensagens globais: mensagens no chat do espaço geral enviadas via API podem não aparecer corretamente no painel de chat do cliente
- **Sem webhooks nativos:** O bot precisa estar rodando continuamente (por isso o PM2). Não existe sistema de push do Gather para o N8N sem o bot intermediário
- **Identificação das funcionárias:** O `senderId` retornado é o ID interno do Gather — mapeie para o nome real no Supabase na primeira interação

---

## 2. Evolution API — WhatsApp (PRIORIDADE 2)

### O que é e qual o papel

Usado exclusivamente para enviar PDFs de relatório para a Jéssica ao final de cada coleta. Não é usado para conversa com as funcionárias (isso é papel do Gather).

### Endpoints relevantes

**Enviar mensagem de texto simples:**

```http
POST https://{{EVOLUTION_API_URL}}/message/sendText/{{INSTANCE_NAME}}
Headers:
  apikey: {{EVOLUTION_API_KEY}}
  Content-Type: application/json

Body:
{
  "number": "5511999999999",
  "text": "Relatório do condomínio X pronto. Segue em anexo."
}
```

**Enviar documento/PDF:**

```http
POST https://{{EVOLUTION_API_URL}}/message/sendMedia/{{INSTANCE_NAME}}
Headers:
  apikey: {{EVOLUTION_API_KEY}}
  Content-Type: application/json

Body:
{
  "number": "5511999999999",
  "mediatype": "document",
  "mimetype": "application/pdf",
  "caption": "Relatório Condomínio Parque Verde — Abril/2026",
  "media": "https://link-publico-para-o-pdf.com/relatorio.pdf",
  "fileName": "relatorio-abril-2026.pdf"
}
```

O campo `media` aceita URL pública ou base64. Para PDFs gerados dinamicamente, recomenda-se subir para o Google Drive ou Supabase Storage e enviar a URL pública.

**Verificar status da instância:**

```http
GET https://{{EVOLUTION_API_URL}}/instance/fetchInstances
Headers:
  apikey: {{EVOLUTION_API_KEY}}
```

### Como configurar no N8N

1. Adicione um nó **HTTP Request** no final do fluxo de geração de relatório
2. Configure conforme os endpoints acima
3. Use as credenciais via variáveis de ambiente do N8N (Settings → Credentials → Header Auth)

### Variáveis de ambiente

```env
EVOLUTION_API_URL=https://seu-servidor-evolution.com
EVOLUTION_API_KEY=sua_chave_evolution
EVOLUTION_INSTANCE_NAME=doma-condo
JESSICA_WHATSAPP=5511999999999
```

---

## 3. Trello API (PRIORIDADE 3)

### O que é e qual o papel

Antes de iniciar a coleta diária de dados com cada funcionária, o agente lê as tarefas do dia no Trello para saber o que precisa ser coletado. Cada funcionária tem cards atribuídos a ela.

### Endpoints relevantes

**Buscar todos os cards de um board:**

```http
GET https://api.trello.com/1/boards/{{BOARD_ID}}/cards
Query params:
  key={{TRELLO_API_KEY}}
  token={{TRELLO_TOKEN}}
  fields=name,desc,idMembers,due,idList
```

**Filtrar cards por membro (funcionária):**

```http
GET https://api.trello.com/1/members/{{MEMBER_ID}}/cards
Query params:
  key={{TRELLO_API_KEY}}
  token={{TRELLO_TOKEN}}
  fields=name,desc,due,idList,idBoard
```

**Buscar listas do board (para identificar "A Fazer hoje", "Em Andamento", etc.):**

```http
GET https://api.trello.com/1/boards/{{BOARD_ID}}/lists
Query params:
  key={{TRELLO_API_KEY}}
  token={{TRELLO_TOKEN}}
```

**Marcar card como concluído (mover para lista "Concluído"):**

```http
PUT https://api.trello.com/1/cards/{{CARD_ID}}
Query params:
  key={{TRELLO_API_KEY}}
  token={{TRELLO_TOKEN}}
Body (JSON):
{
  "idList": "{{ID_DA_LISTA_CONCLUIDO}}"
}
```

### Como obter as credenciais

1. Acesse https://trello.com/app-key — copie a **API Key**
2. Na mesma página, clique em "Generate a Token" — copie o **Token**
3. O `BOARD_ID` está na URL do board: `https://trello.com/b/ABC123/nome-do-board` → ID é `ABC123`

### Como configurar no N8N

O N8N tem um nó nativo do Trello. Configuração:

1. Settings → Credentials → New → Trello API
2. Informe a API Key e o Token
3. No fluxo matinal, adicione o nó **Trello → Get Cards** com o Board ID
4. Use um nó **Code** ou **Filter** para filtrar apenas os cards da funcionária que está sendo contatada naquele momento

### Variáveis de ambiente

```env
TRELLO_API_KEY=sua_api_key_trello
TRELLO_TOKEN=seu_token_trello
TRELLO_BOARD_ID=id_do_board_principal
```

---

## 4. Google Drive API (PRIORIDADE 4)

### O que é e qual o papel

Os documentos dos clientes (contratos, modelos de relatório, regulamentos de condomínio) ficam no Google Drive. Antes de gerar um relatório, o N8N busca o arquivo do cliente correto e envia o conteúdo como contexto para o Gemini.

### Autenticação recomendada: Service Account

Service Account é uma conta de serviço que não precisa de login humano. É a forma correta para automações em servidor.

**Como criar:**

1. Acesse https://console.cloud.google.com/
2. Crie um projeto (ou use o existente)
3. APIs & Services → Enable APIs → Ative "Google Drive API"
4. APIs & Services → Credentials → Create Credentials → Service Account
5. Baixe o arquivo JSON de credenciais
6. No Google Drive, compartilhe a pasta dos clientes com o e-mail da Service Account (formato: `nome@projeto.iam.gserviceaccount.com`)

### Endpoints relevantes

**Listar arquivos de uma pasta:**

```http
GET https://www.googleapis.com/drive/v3/files
Query params:
  q='{{FOLDER_ID}}' in parents and trashed=false
  fields=files(id,name,mimeType,modifiedTime)
Headers:
  Authorization: Bearer {{ACCESS_TOKEN}}
```

**Baixar conteúdo de um arquivo de texto (.txt, .csv, .gdoc exportado):**

```http
GET https://www.googleapis.com/drive/v3/files/{{FILE_ID}}/export
Query params:
  mimeType=text/plain
Headers:
  Authorization: Bearer {{ACCESS_TOKEN}}
```

**Baixar arquivo binário (PDF, imagem):**

```http
GET https://www.googleapis.com/drive/v3/files/{{FILE_ID}}?alt=media
Headers:
  Authorization: Bearer {{ACCESS_TOKEN}}
```

### Autenticação com Service Account no N8N

1. Settings → Credentials → New → Google API (Service Account)
2. Cole o conteúdo do arquivo JSON da Service Account
3. Use o nó **Google Drive → List Files** e **Google Drive → Download File** no fluxo

### Dica de uso com o Gemini

Baixe o conteúdo do documento como texto e injete no prompt:

```
Contexto do cliente:
---
{{conteudo_do_arquivo_drive}}
---

Com base nesse contexto, responda a pergunta da funcionária: {{mensagem}}
```

### Variáveis de ambiente

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
GOOGLE_DRIVE_FOLDER_ID=id_da_pasta_raiz_dos_clientes
```

---

## 5. Gemini API — via N8N (PRIORIDADE 1)

### O que é e qual o papel

O Gemini é o cérebro do agente. Ele processa as mensagens das funcionárias, faz perguntas de coleta, analisa os dados e gera os relatórios em PDF.

### Modelo recomendado

- **`gemini-1.5-pro`** — para conversas longas e geração de relatórios (contexto grande)
- **`gemini-1.5-flash`** — para respostas rápidas em coleta simples (mais barato)

### Configuração no N8N

1. Settings → Credentials → New → Google Gemini (PaLM) API
2. Informe a API Key (obtida em https://aistudio.google.com/app/apikey)
3. Adicione o nó **Basic LLM Chain** ou **AI Agent** no fluxo
4. Configure o modelo e o system prompt do agente

**System prompt base para o agente Doma Condo:**

```
Você é o assistente financeiro do Doma Condo, um BPO financeiro de condomínios.
Sua função é coletar dados financeiros diários das funcionárias (Fulana e Ciclana) e gerar relatórios para os clientes.

Ao iniciar uma conversa, leia as tarefas do dia que serão fornecidas como contexto.
Faça uma pergunta por vez. Seja objetivo, profissional e amigável.
Quando tiver todos os dados, confirme com a funcionária antes de fechar a coleta.

Clientes atuais: [listar os 5 clientes administradoras de condomínio]
```

### Variáveis de ambiente

```env
GEMINI_API_KEY=sua_api_key_gemini
```

---

## 6. Supabase (PRIORIDADE 1)

### O que é e qual o papel

Banco de dados central do sistema. Armazena:
- Histórico de conversas entre o bot e as funcionárias
- Dados coletados em cada sessão
- Status das tarefas diárias
- Registros dos relatórios gerados
- Mapeamento de `funcionaria_id` (Gather) → nome real

### Conexão no N8N

Use o nó **Supabase** nativo do N8N ou o nó **HTTP Request** com a API REST do Supabase.

**Exemplo via HTTP Request (inserir registro de conversa):**

```http
POST https://{{SUPABASE_URL}}/rest/v1/conversas
Headers:
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SUPABASE_ANON_KEY}}
  Content-Type: application/json
  Prefer: return=minimal

Body:
{
  "funcionaria_id": "gather-id-da-funcionaria",
  "funcionaria_nome": "Ana",
  "mensagem": "o valor do condomínio X foi R$ 1.200",
  "tipo": "coleta",
  "sessao_id": "ana-1713123456789",
  "created_at": "2026-04-14T10:00:00Z"
}
```

### Variáveis de ambiente

```env
SUPABASE_URL=https://xyzxyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
```

---

## Diagrama de Sequência — Fluxo Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                     FLUXO MATINAL (coleta diária)                │
└──────────────────────────────────────────────────────────────────┘

6:00 — N8N dispara fluxo agendado
  │
  ├─→ [Trello API] Busca tarefas do dia de cada funcionária
  │
  ├─→ [Google Drive API] Busca documentos dos clientes relacionados
  │
  └─→ [Gather Bot HTTP] Envia mensagem inicial para cada funcionária
         "Bom dia! Hoje precisamos coletar: [tarefas do Trello]"

──────────────────────────────────────────────────────────────────

DURANTE A CONVERSA (loop por mensagem):

Funcionária digita no Gather
  │
  ↓
[Gather Bot - WebSocket] Captura DM
  │
  └─→ POST para N8N webhook { funcionaria_id, mensagem, sessao_id }
         │
         ├─→ [Supabase] Salva mensagem no histórico
         │
         ├─→ [Gemini API] Processa com contexto do agente + histórico
         │
         └─→ POST para [Gather Bot HTTP] /responder { funcionaria_id, resposta }
                │
                └─→ Gather Bot envia DM de volta para a funcionária

──────────────────────────────────────────────────────────────────

AO FINAL DA COLETA:

N8N detecta que todos os dados foram coletados
  │
  ├─→ [Gemini API] Gera relatório em texto/estruturado
  │
  ├─→ [Supabase] Salva relatório gerado
  │
  ├─→ [Gather Bot] Envia confirmação para a funcionária no Gather
  │
  └─→ [Evolution API - WhatsApp] Envia PDF do relatório para a Jéssica
```

---

## Checklist de Configuração (na ordem correta)

Execute nesta sequência para garantir que cada dependência esteja pronta antes da próxima:

### Fase 1 — Infraestrutura base

- [ ] **1.** Criar e configurar projeto no Google Cloud (para Drive API e Gemini)
- [ ] **2.** Gerar Gemini API Key em https://aistudio.google.com/app/apikey
- [ ] **3.** Criar Service Account para Google Drive e compartilhar pasta dos clientes
- [ ] **4.** Configurar Supabase: criar tabelas `conversas`, `coletas`, `relatorios`, `funcionarias`
- [ ] **5.** Instalar N8N na VM (ou usar N8N Cloud) e anotar a URL base

### Fase 2 — Bot do Gather

- [ ] **6.** Obter Gather API Key em https://app.gather.town/apikeys
- [ ] **7.** Anotar o SPACE_ID do espaço do Doma Condo
- [ ] **8.** Criar pasta do projeto na VM: `/home/fabricio/doma-gather-bot/`
- [ ] **9.** Instalar dependências: `npm install @gathertown/gather-game-client express axios`
- [ ] **10.** Criar o arquivo `gather-bot.js` com o código desta spec
- [ ] **11.** Criar `ecosystem.config.js` com as variáveis de ambiente
- [ ] **12.** Iniciar com PM2: `pm2 start ecosystem.config.js`
- [ ] **13.** Testar: enviar DM no Gather e verificar se o bot recebe (checar `pm2 logs`)

### Fase 3 — N8N e integrações

- [ ] **14.** Criar credenciais no N8N: Gemini, Google Drive (Service Account), Supabase, Trello, Evolution API
- [ ] **15.** Criar fluxo no N8N com Webhook `/gather-mensagem` (anotar URL e colocar em `N8N_WEBHOOK_URL`)
- [ ] **16.** Conectar Webhook → Supabase (salvar) → Gemini (processar) → HTTP Request para o bot `/responder`
- [ ] **17.** Testar o fluxo completo: enviar DM no Gather → aguardar resposta do Gemini
- [ ] **18.** Criar fluxo matinal agendado (Trello + Drive + mensagem inicial no Gather)

### Fase 4 — WhatsApp e relatórios

- [ ] **19.** Configurar Evolution API e criar instância `doma-condo`
- [ ] **20.** Conectar WhatsApp na instância (escanear QR code)
- [ ] **21.** Testar envio de PDF para o número da Jéssica
- [ ] **22.** Integrar geração de relatório no fluxo do N8N (após coleta completa)

### Fase 5 — Validação final

- [ ] **23.** Simular um dia completo de coleta (manhã → coleta → relatório → envio)
- [ ] **24.** Confirmar com as funcionárias que o Gather está funcionando bem
- [ ] **25.** Confirmar com a Jéssica que os PDFs chegam corretamente no WhatsApp
