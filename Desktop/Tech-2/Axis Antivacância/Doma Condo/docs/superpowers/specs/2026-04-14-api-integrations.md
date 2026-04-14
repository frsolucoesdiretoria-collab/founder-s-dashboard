# Planejamento de Integrações de API — Doma Condo

**Data:** 2026-04-14
**Projeto:** Doma Condo — BPO Financeiro de Condomínios
**Autor:** Agente Claude Code
**Status:** Especificação inicial — pronta para implementação

---

## Visão Geral do Sistema

O sistema Doma Condo funciona com os seguintes componentes que se comunicam entre si:

```
Trello (tarefas do dia)
        ↓
   N8N (orquestrador)  ←→  Google Drive (contexto de documentos)
        ↓
   Gemini (IA da conversa)
        ↓
   Evolution API (WhatsApp)
        ↓
   Supabase (banco de dados)
        ↓
   Frontend Web (dashboard)
```

O agente WhatsApp é acionado às **11:30** e às **17:00** para coleta de dados das funcionárias. Antes de iniciar cada coleta, o N8N busca as tarefas do Trello para contextualizar a conversa. Durante a conversa, o Gemini pode buscar documentos do Google Drive quando precisar de contexto específico de um cliente.

---

## Diagrama de Uso — Quando Cada Integração é Chamada

```
11:30 / 17:00 — Disparo agendado (N8N Schedule Trigger)
│
├── 1. [TRELLO] Buscar cards do dia para cada funcionária
│   └── Retorna: lista de tarefas planejadas com título, descrição, prazo
│
├── 2. Iniciar conversa no WhatsApp via Evolution API
│   └── Mensagem inclui contexto das tarefas do Trello
│
├── 3. Funcionária responde sobre o que fez
│   ↓
├── 4. [GOOGLE DRIVE] Se Gemini precisar de contexto do cliente
│   └── Buscar documentos (planilhas, NFs, etc.) daquele cliente
│
├── 5. Gemini processa resposta com contexto completo
│
└── 6. Dados salvos no Supabase

[GATHER] — Uso paralelo, independente do fluxo de coleta
└── Notificações de status / presença da equipe (uso futuro)
```

---

## 1. Trello API

### O que é e qual o papel no sistema

O Trello é onde a Jéssica e sua equipe planejam as tarefas do dia para cada cliente (condomínio). Cada funcionária tem cards atribuídos a ela no quadro do Trello.

**Papel:** Antes de cada coleta (11:30 e 17:00), o N8N busca os cards do dia atribuídos à funcionária e usa essa lista para contextualizar a conversa. Isso evita que o agente pergunte do zero — ele já sabe o que estava planejado e pergunta como foi a execução.

### Autenticação

O Trello usa **API Key + Token** — o método mais simples, sem OAuth. Funciona assim:

1. Acesse [https://trello.com/app-key](https://trello.com/app-key) com a conta da Jéssica
2. Crie um Power-Up (pode ser um Power-Up pessoal/privado) para obter a **API Key**
3. Gere o **Token** clicando em "Generate a token" na mesma página
4. Ambos são passados como query params em toda requisição:
   `?key=API_KEY&token=API_TOKEN`

Não há expiração do Token se gerado sem prazo definido (opção "Never Expires").

### Endpoints que serão usados

#### a) Listar boards do workspace

```
GET https://api.trello.com/1/members/me/boards
  ?key={API_KEY}
  &token={API_TOKEN}
  &fields=id,name
```

**Uso:** Executar uma vez para descobrir o ID do board principal da Doma Condo.

#### b) Listar listas (colunas) do board

```
GET https://api.trello.com/1/boards/{boardId}/lists
  ?key={API_KEY}
  &token={API_TOKEN}
  &fields=id,name
```

**Uso:** Identificar a coluna "A fazer hoje" ou equivalente.

#### c) Buscar cards de uma lista filtrados por membro

```
GET https://api.trello.com/1/lists/{listId}/cards
  ?key={API_KEY}
  &token={API_TOKEN}
  &fields=id,name,desc,due,idMembers,labels
  &members=true
```

**Uso:** Principal endpoint. Retorna todos os cards da lista. Filtrar por `idMembers` para pegar só os cards da funcionária em questão.

#### d) Buscar informações de um membro (funcionária)

```
GET https://api.trello.com/1/members/{username}
  ?key={API_KEY}
  &token={API_TOKEN}
  &fields=id,username,fullName
```

**Uso:** Uma vez para mapear username → ID de cada funcionária.

### Exemplo de payload retornado

```json
[
  {
    "id": "64abc123def456",
    "name": "Conciliação bancária — Condomínio Vila Verde",
    "desc": "Verificar extrato do Bradesco e lançar no sistema",
    "due": "2026-04-14T17:00:00.000Z",
    "idMembers": ["64xyz789"],
    "labels": [
      { "name": "Urgente", "color": "red" }
    ]
  },
  {
    "id": "64abc789ghi012",
    "name": "Lançamento de NFs — Condomínio Alameda",
    "desc": "NFs de março pendentes",
    "due": "2026-04-14T17:00:00.000Z",
    "idMembers": ["64xyz789"],
    "labels": []
  }
]
```

### Como conectar com o N8N

O N8N tem nó nativo do Trello. Configuração:

1. No N8N, adicionar credencial do tipo **Trello API**
2. Preencher: API Key e API Token
3. Usar o nó **Trello → Get Cards** apontando para a lista correta
4. Se precisar de filtros mais específicos, usar o nó **HTTP Request** com os endpoints acima

**Fluxo recomendado no N8N:**
```
Schedule Trigger (11:30 / 17:00)
  → HTTP Request: GET /lists/{listId}/cards
  → Code node: filtrar cards por idMember da funcionária atual
  → Montar texto: "Hoje você tinha planejado: [lista de tarefas]"
  → Continua para Evolution API (início da conversa)
```

### Limitações e Rate Limits

| Limite | Valor |
|---|---|
| Por API Key | 300 requisições / 10 segundos |
| Por Token | 100 requisições / 10 segundos |
| Endpoint /members/ | 100 requisições / 15 minutos |

Para o volume do Doma Condo (2 funcionárias, 2 coletas/dia), os limites não são problema. A solução fará no máximo ~10 requisições por coleta.

Se o limite for atingido, o Trello retorna **HTTP 429** — o N8N deve ter retry configurado com delay de 30 segundos.

### Variáveis de ambiente necessárias

```env
TRELLO_API_KEY=sua_api_key_aqui
TRELLO_API_TOKEN=seu_token_aqui
TRELLO_BOARD_ID=id_do_board_principal
TRELLO_LIST_ID_HOJE=id_da_coluna_tarefas_do_dia
TRELLO_MEMBER_ID_FUNCIONARIA_1=id_trello_funcionaria_1
TRELLO_MEMBER_ID_FUNCIONARIA_2=id_trello_funcionaria_2
```

---

## 2. Google Drive API

### O que é e qual o papel no sistema

O Google Drive é onde ficam os documentos de trabalho de cada cliente (planilhas de conciliação, notas fiscais, relatórios, etc.). O Gemini pode consultar esses documentos para ter contexto quando a funcionária menciona algo específico.

**Papel:** Quando o Gemini precisar de contexto detalhado de um cliente durante a conversa (ex: "qual foi o saldo do condomínio X no mês passado?"), o N8N busca o documento relevante no Drive e passa o conteúdo para o Gemini.

### Autenticação

Recomendação: **Service Account** (mais simples para automações, sem necessidade de login humano).

**Como configurar:**

1. Acesse [Google Cloud Console](https://console.cloud.google.com/) com a conta Google da Jéssica
2. Crie um projeto (ex: "Doma Condo Automações")
3. Ative a **Google Drive API** no projeto
4. Crie uma **Service Account** (Conta de Serviço):
   - IAM & Admin → Service Accounts → Create
   - Nome: `doma-condo-agent`
   - Faça download do arquivo JSON de credenciais
5. **Compartilhe** as pastas/arquivos do Drive com o e-mail da Service Account
   - O e-mail terá formato: `doma-condo-agent@[projeto].iam.gserviceaccount.com`
   - Compartilhe como "Leitor" (permissão de leitura apenas)
6. No N8N, adicionar credencial **Google Service Account**

**Alternativa OAuth 2.0:** Se preferir usar a conta pessoal do Google sem Service Account, configurar OAuth — mais complexo pois precisa de tela de consentimento e tokens que expiram.

### Endpoints que serão usados

#### a) Listar arquivos de uma pasta de cliente

```
GET https://www.googleapis.com/drive/v3/files
  ?q='FOLDER_ID' in parents and trashed=false
  &fields=files(id,name,mimeType,modifiedTime)
  &orderBy=modifiedTime desc
  &pageSize=20
Authorization: Bearer {access_token}
```

**Uso:** Buscar os arquivos mais recentes de uma pasta de cliente específico.

#### b) Baixar conteúdo de um arquivo (texto/PDF)

```
GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media
Authorization: Bearer {access_token}
```

**Uso:** Baixar o conteúdo de um documento para passar ao Gemini.

#### c) Exportar Google Sheets como CSV (para planilhas)

```
GET https://www.googleapis.com/drive/v3/files/{fileId}/export
  ?mimeType=text/csv
Authorization: Bearer {access_token}
```

**Uso:** Exportar planilhas do Google Sheets em formato texto para o Gemini processar.

#### d) Buscar arquivo por nome

```
GET https://www.googleapis.com/drive/v3/files
  ?q=name contains 'conciliação' and 'FOLDER_ID' in parents
  &fields=files(id,name,modifiedTime)
Authorization: Bearer {access_token}
```

**Uso:** Buscar documento específico quando funcionária menciona pelo nome.

### Exemplo de payload

**Listagem de arquivos:**
```json
{
  "files": [
    {
      "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
      "name": "Conciliação Março 2026 - Vila Verde",
      "mimeType": "application/vnd.google-apps.spreadsheet",
      "modifiedTime": "2026-04-10T14:23:00.000Z"
    },
    {
      "id": "1a2b3c4d5e6f7g8h9i0j",
      "name": "NFs pendentes - Alameda",
      "mimeType": "application/pdf",
      "modifiedTime": "2026-04-12T09:15:00.000Z"
    }
  ]
}
```

### Como conectar com o N8N

O N8N tem nó nativo do **Google Drive**. Configuração:

1. Adicionar credencial **Google Service Account** no N8N
   - Fazer upload do arquivo JSON da Service Account
2. Usar nó **Google Drive → List Files** para listar
3. Usar nó **Google Drive → Download File** para baixar conteúdo
4. Para planilhas: nó **Google Sheets** lê diretamente sem precisar baixar

**Fluxo recomendado no N8N:**
```
[Gemini identifica que precisa de contexto do Cliente X]
  → Code node: montar query de busca para pasta do Cliente X
  → Google Drive: List Files (filtrado por pasta do cliente)
  → Google Drive: Download/Export arquivo mais recente
  → Code node: extrair texto relevante do documento
  → Passa texto para o Gemini como contexto adicional
  → Gemini responde com informação fundamentada
```

### Estrutura de pastas recomendada no Drive

```
📁 Doma Condo — Clientes/
  📁 Cliente 1 — Vila Verde/
    📄 Conciliação Bancária/
    📄 NFs/
    📄 Relatórios/
  📁 Cliente 2 — Alameda/
    ...
```

Cada pasta de cliente terá um ID fixo que será mapeado nas variáveis de ambiente.

### Limitações e Rate Limits

| Limite | Valor |
|---|---|
| Requisições por usuário por 100s | 12.000 |
| Requisições por dia | 1.000.000.000 (praticamente ilimitado) |
| Tamanho máximo de export | 10MB por arquivo |
| Arquivos exportáveis via API | Docs, Sheets, Slides (formatos Google nativos) |

Para o volume do Doma Condo, os limites não são problema. A solução consultará documentos raramente (apenas quando o Gemini precisar de contexto específico).

**Atenção:** PDFs e imagens (NFs digitalizadas) não são lidos como texto pela Drive API — para extrair conteúdo de PDFs, é necessário usar Google Cloud Vision API ou similar. Para o MVP, foco em planilhas e documentos de texto.

### Variáveis de ambiente necessárias

```env
GOOGLE_SERVICE_ACCOUNT_JSON=/caminho/para/service-account.json
# ou o conteúdo JSON diretamente como string:
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":...}

# IDs das pastas de cada cliente no Google Drive:
GDRIVE_FOLDER_CLIENTE_1=id_pasta_vila_verde
GDRIVE_FOLDER_CLIENTE_2=id_pasta_alameda
GDRIVE_FOLDER_CLIENTE_3=id_pasta_cliente_3
GDRIVE_FOLDER_CLIENTE_4=id_pasta_cliente_4
GDRIVE_FOLDER_CLIENTE_5=id_pasta_cliente_5
```

---

## 3. Gather API

### O que é e qual o papel esperado no sistema

O Gather é a plataforma de escritório virtual onde a equipe da Jéssica trabalha online. As funcionárias "entram" no escritório virtual e trabalham de lá durante o dia.

**Papel esperado:** Detectar presença das funcionárias no escritório virtual, enviar notificações dentro do ambiente Gather, ou verificar se alguém está online antes de iniciar a coleta no WhatsApp.

### O que a API do Gather realmente oferece

A Gather tem uma API HTTP pública (v2), documentada em: [https://gathertown.notion.site/Gather-HTTP-API](https://gathertown.notion.site/Gather-HTTP-API-3bbf6c59325f40aca7ef5ce14c677444)

**Autenticação:** API Key passada no header `apiKey`
- Obter em: [https://app.gather.town/apikeys](https://app.gather.town/apikeys)

**O que a API permite atualmente:**

| Funcionalidade | Disponível? |
|---|---|
| Listar/modificar mapa do espaço | Sim (v2) |
| Gerenciar guest list (lista de convidados) | Sim |
| Definir roles/permissões de usuários | Sim |
| Verificar presença/quem está online | **Limitado** — não há endpoint direto e confiável |
| Enviar mensagens/notificações dentro do Gather | **Não disponível** via HTTP API |
| Mover avatar de usuário | Apenas via WebSocket (não HTTP) |

### Limitação crítica

A Gather HTTP API é focada em **configuração de espaços** (mapas, objetos, guest lists), não em **monitoramento em tempo real de presença**. Para saber quem está online, seria necessário usar a API WebSocket deles — que é mais complexa de integrar com N8N.

A API não tem endpoint para:
- Saber se uma funcionária específica está no escritório virtual agora
- Enviar uma notificação que apareça na tela do usuário dentro do Gather
- Acionar algo quando alguém entra ou sai do espaço (via HTTP)

### Endpoints disponíveis (o que dá para fazer)

```
# Buscar mapa do espaço
GET https://api.gather.town/api/v2/spaces/{spaceId}/maps/{mapId}
Headers: apiKey: {API_KEY}

# Gerenciar guest list
GET/POST https://api.gather.town/api/v2/spaces/{spaceId}/users
Headers: apiKey: {API_KEY}

# Verificar espaço
GET https://api.gather.town/api/v2/spaces/{spaceId}
Headers: apiKey: {API_KEY}
```

**Formato do spaceId:** usa barra invertida como separador (`nomeEmpresa\nomeEspaco`), diferente da URL que usa barra normal.

### Avaliação: Vale implementar agora?

**Recomendação: Não priorizar no MVP.**

A API do Gather não atende bem ao caso de uso principal esperado (verificar presença antes da coleta ou notificar dentro do escritório virtual). Para isso, seriam necessárias integrações mais complexas via WebSocket que aumentam muito a complexidade sem benefício claro no curto prazo.

### Alternativas recomendadas

Se o objetivo é **verificar se a funcionária está disponível antes de acionar a coleta**:

| Alternativa | Como funciona | Complexidade |
|---|---|---|
| **Simples: não verificar** | O agente envia WhatsApp de qualquer forma, a funcionária responde quando disponível | Baixíssima |
| **Google Calendar** | Verificar se a funcionária tem compromisso no horário via Google Calendar API | Baixa |
| **Status no WhatsApp** | Usar metadados da Evolution API para saber se a funcionária está ativa | Baixa |
| **Webhook no Gather** | Configurar Gather para disparar webhook quando alguém entra/sai (se suportado na versão do espaço) | Média |
| **WebSocket Gather** | Conexão contínua para monitorar presença em tempo real | Alta |

**Recomendação MVP:** Usar a abordagem simples — o agente dispara no horário programado, independente de presença no Gather. A funcionária responde quando puder. Simples e funciona.

### Variáveis de ambiente (se decidir implementar futuramente)

```env
GATHER_API_KEY=sua_api_key_gather
GATHER_SPACE_ID=nomeEmpresa\nomeEspaco
```

---

## Prioridade de Implementação

### Fase 1 — Trello (implementar primeiro)

**Por quê primeiro:** É o que mais muda a qualidade da conversa. Hoje o agente pergunta do zero o que foi feito. Com o Trello, o agente chega na conversa já sabendo o que estava planejado e pode perguntar especificamente: "Você planejou fazer a conciliação bancária do Vila Verde — conseguiu fazer?". Impacto imediato na experiência das funcionárias e na qualidade dos dados coletados.

**Complexidade:** Baixa. Integração simples, N8N tem nó nativo, autenticação sem OAuth.

**Estimativa:** 1 sessão de implementação.

### Fase 2 — Google Drive (implementar em seguida)

**Por quê segundo:** Agrega inteligência ao Gemini. Com acesso aos documentos dos clientes, o agente pode dar contexto às funcionárias durante a conversa e registrar informações mais precisas. Útil quando a funcionária menciona uma NF específica ou precisa confirmar um valor.

**Complexidade:** Média. Requer configuração de Service Account no Google Cloud e compartilhamento das pastas. Lógica de "quando buscar" precisa ser bem definida para não deixar a conversa lenta.

**Estimativa:** 1-2 sessões de implementação.

### Fase 3 — Gather (implementar no futuro, se necessário)

**Por quê por último:** A API atual do Gather tem limitações que impedem o caso de uso mais valioso (monitoramento de presença). Antes de implementar, definir com a Jéssica exatamente o que ela quer que aconteça com a integração do Gather — pode ser que a alternativa simples (sem integração) seja suficiente.

**Complexidade:** Alta se for presença em tempo real. Baixa se for apenas gerenciar guest list.

**Estimativa:** Requerer reavaliação antes de estimar.

---

## Resumo das Variáveis de Ambiente

Todas as variáveis abaixo devem ser configuradas no N8N (via Settings → Variables) e **nunca** commitadas em repositório Git.

```env
# ============================
# TRELLO
# ============================
TRELLO_API_KEY=
TRELLO_API_TOKEN=
TRELLO_BOARD_ID=
TRELLO_LIST_ID_HOJE=
TRELLO_MEMBER_ID_FUNCIONARIA_1=
TRELLO_MEMBER_ID_FUNCIONARIA_2=

# ============================
# GOOGLE DRIVE
# ============================
GOOGLE_SERVICE_ACCOUNT_KEY=  # JSON completo em string
GDRIVE_FOLDER_CLIENTE_1=
GDRIVE_FOLDER_CLIENTE_2=
GDRIVE_FOLDER_CLIENTE_3=
GDRIVE_FOLDER_CLIENTE_4=
GDRIVE_FOLDER_CLIENTE_5=

# ============================
# GATHER (futuro)
# ============================
GATHER_API_KEY=
GATHER_SPACE_ID=
```

---

## Checklist de Configuração

### Trello
- [ ] Criar Power-Up pessoal em trello.com/app-key
- [ ] Copiar API Key e gerar Token
- [ ] Identificar ID do board principal (GET /members/me/boards)
- [ ] Identificar ID da coluna "A fazer hoje" (GET /boards/{id}/lists)
- [ ] Mapear IDs das funcionárias no Trello
- [ ] Configurar credencial no N8N
- [ ] Testar requisição de cards

### Google Drive
- [ ] Criar projeto no Google Cloud Console
- [ ] Ativar Google Drive API
- [ ] Criar Service Account e baixar JSON
- [ ] Compartilhar pastas dos clientes com o e-mail da Service Account
- [ ] Anotar IDs das pastas de cada cliente
- [ ] Configurar credencial no N8N
- [ ] Testar listagem de arquivos

### Gather (quando decidir implementar)
- [ ] Definir com a Jéssica o que exatamente precisa do Gather
- [ ] Avaliar se alternativas mais simples já resolvem
- [ ] Se avançar: obter API Key em app.gather.town/apikeys

---

*Documento gerado em 2026-04-14. Atualizar conforme a implementação avança.*
