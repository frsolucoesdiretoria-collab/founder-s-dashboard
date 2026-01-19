# Configuração de Ambiente - FR Tech OS

## ⚠️ IMPORTANTE: Configuração Obrigatória

O servidor backend **NÃO iniciará** sem as variáveis de ambiente configuradas.

## 📝 Passo a Passo

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
touch .env.local
```

> Dica: existe um template `env.local.example` (sem ponto) na raiz do repo para você copiar/colar.

### 2. Preencher variáveis obrigatórias

Copie o conteúdo abaixo para `.env.local` e **substitua o NOTION_TOKEN**:

```env
# Notion API Token (REQUIRED)
# Obtenha em: https://www.notion.so/my-integrations
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Notion API Token (Doterra - workspace separado)
NOTION_TOKEN_DOTERRA=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Notion Database IDs (REQUIRED - Core databases)
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88

# Notion Database IDs (OPTIONAL - Supporting databases)
NOTION_DB_CONTACTS=2d984566a5fa81b3b1a1c8abef43421f
NOTION_DB_CLIENTS=2d984566a5fa81a89be6f9bdb271f838
NOTION_DB_GROWTHPROPOSALS=2d984566a5fa81c9bf2fd004c75a7e3c
NOTION_DB_COFFEEDIAGNOSTICS=2d984566a5fa81528aafcd990533eaf5
NOTION_DB_EXPANSIONOPPORTUNITIES=2d984566a5fa81f887ddfe1cac401239
NOTION_DB_CUSTOMERWINS=2d984566a5fa81b0a2bcc690ec281df9
NOTION_DB_FINANCEMETRICS=2d984566a5fa81988982e06722459759

# Notion Database IDs (OPTIONAL - Phase 2 Partner features)
NOTION_DB_PARTNERS=2d984566a5fa814380e8dd8d93f3a582
NOTION_DB_REFERRALS=2d984566a5fa810cbefcd6ff2f139620
NOTION_DB_COMMISSIONLEDGER=2d984566a5fa81578b5bcd07a19bf6c3
NOTION_DB_PARTNERNUDGES=2d984566a5fa8159a321c95e14c52bd6

# Admin Passcode (default: admin123 for development)
ADMIN_PASSCODE=admin123

# Doterra (OPTIONAL - client isolated)
# Após criar a database via POST /api/doterra/setup, defina este ID:
NOTION_DB_DOTERRA_LEADS=<<<SET_DOTERRA_DB_ID_HERE>>>
# Passcode dedicado para o módulo Doterra (recomendado)
DOTERRA_ADMIN_PASSCODE=expandircomtec
# Para gerar variações de mensagem por cohort (botão IA no /doterra):
OPENAI_API_KEY=<<<SET_OPENAI_API_KEY_HERE>>>
# Alternativa ao x-admin-passcode no webhook (n8n/Z-API):
DOTERRA_WEBHOOK_SECRET=<<<OPTIONAL_SECRET>>>

# Frontend passwords (Vite)
# Senha do app geral (AXIS)
VITE_APP_PASSWORD=<<<SET_APP_PASSWORD_HERE>>>
# Senha específica da página Doterra (/doterra)
VITE_DOTERRA_PASSWORD=expandircomtec

# Vende Mais Obras - Notion Databases
# Após executar server/scripts/setupVendeMaisObras.ts, defina estes IDs:
NOTION_DB_SERVICOS=<<<SET_DATABASE_ID_HERE>>>
NOTION_DB_USUARIOS=<<<SET_DATABASE_ID_HERE>>>
NOTION_DB_CLIENTES=<<<SET_DATABASE_ID_HERE>>>
NOTION_DB_ORCAMENTOS=<<<SET_DATABASE_ID_HERE>>>
NOTION_DB_LEADS=<<<SET_DATABASE_ID_HERE>>>

# JWT Secret para autenticação (gerar com: openssl rand -base64 32)
JWT_SECRET=<<<SET_JWT_SECRET_HERE>>>
# Expiração do token JWT (padrão: 7d)
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
VITE_DEV_SERVER_URL=http://localhost:8080
NODE_ENV=development
```

### 3. Obter NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em "New integration"
3. Dê um nome (ex: "FR Tech OS")
4. Selecione o workspace
5. Copie o token (começa com `secret_`)
6. Cole no `.env.local` substituindo `<<<INSERIR_TOKEN_AQUI>>>`

### 4. Compartilhar databases com a integração

Para cada database do Notion:

1. Abra o database no Notion
2. Clique nos "..." no canto superior direito
3. Selecione "Add connections"
4. Escolha sua integração "FR Tech OS"
5. Repita para todos os databases necessários

### 5. Verificar configuração

Após configurar, execute:

```bash
npm run dev
```

O servidor deve iniciar sem erros. Se aparecer erro sobre variáveis faltando, verifique o `.env.local`.

## 🟣 Doterra (Avivamento de clientes inativos)

### Setup da database (uma única database)

1. Suba o projeto (`npm run dev`)
2. Faça POST em `POST /api/doterra/setup` com header `x-admin-passcode` (ex: `expandircomtec`)
3. Copie o `database.id` retornado e defina em `.env.local` como `NOTION_DB_DOTERRA_LEADS=...` (32 chars, sem hífens)
4. Reinicie o backend

Depois disso, acesse `GET /doterra` e use o painel para:
- importar CSV (base e ativados)
- exportar CSV filtrado
- aprovar interessados pendentes
- gerar variações de mensagem por cohort via IA

## 🏗️ Vende Mais Obras (Sistema de Orçamentos)

### Setup das Databases

1. Execute o script de setup:
```bash
tsx server/scripts/setupVendeMaisObras.ts
```

2. O script criará todas as databases necessárias e retornará os IDs
3. Copie os IDs retornados e adicione ao `.env.local`:
   - `NOTION_DB_SERVICOS=...`
   - `NOTION_DB_USUARIOS=...`
   - `NOTION_DB_CLIENTES=...`
   - `NOTION_DB_ORCAMENTOS=...`
   - `NOTION_DB_LEADS=...`

4. Gere um JWT_SECRET:
```bash
openssl rand -base64 32
```

5. Adicione ao `.env.local`:
   - `JWT_SECRET=...` (o resultado do comando acima)

6. Compartilhe todas as databases com a integração do Notion (ver passo 4 da configuração geral)

Depois disso, o sistema de orçamentos estará funcional:
- Usuários podem se cadastrar e fazer login
- Podem criar orçamentos e clientes (isolados por usuário)
- Admin pode visualizar métricas e gerenciar leads

## 🔒 Segurança

- ✅ `.env.local` está no `.gitignore` (não será commitado)
- ✅ Token nunca aparece no código
- ✅ Token só existe server-side

## 🐛 Troubleshooting

### Erro: "Missing required environment variable"

**Causa:** `.env.local` não existe ou está incompleto

**Solução:** 
1. Verifique se `.env.local` existe na raiz do projeto
2. Verifique se todas as variáveis obrigatórias estão preenchidas
3. Verifique se `NOTION_TOKEN` não está como `<<<INSERIR_TOKEN_AQUI>>>`

### Erro: "connect ECONNREFUSED ::1:3001"

**Causa:** Servidor backend não iniciou

**Solução:**
1. Verifique se o servidor iniciou (deve aparecer "🚀 Server running")
2. Se não iniciou, verifique os erros no console
3. Provavelmente faltam env vars - siga o passo a passo acima

### Erro: "object_not_found" no health check

**Causa:** Database não foi compartilhado com a integração

**Solução:**
1. Abra o database no Notion
2. Compartilhe com a integração (ver passo 4 acima)

