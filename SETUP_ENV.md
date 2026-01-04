# Configuração de Ambiente - FR Tech OS

## ⚠️ IMPORTANTE: Configuração Obrigatória

O servidor backend **NÃO iniciará** sem as variáveis de ambiente configuradas.

## 📝 Passo a Passo

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
touch .env.local
```

### 2. Preencher variáveis obrigatórias

Copie o conteúdo abaixo para `.env.local` e **substitua o NOTION_TOKEN**:

```env
# Notion API Token (REQUIRED)
# Obtenha em: https://www.notion.so/my-integrations
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

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

