# 🚀 Setup Automático - NOTION_TOKEN na VPS

## ⚡ Método Mais Rápido (GitHub CLI)

### 1. Instalar GitHub CLI (se não tiver)

```bash
# macOS
brew install gh

# Autenticar
gh auth login
```

### 2. Executar Script Automático

```bash
bash scripts/setup-github-secret-and-run-workflow.sh
```

O script irá:
- ✅ Pedir seu NOTION_TOKEN
- ✅ Adicionar como secret no GitHub automaticamente
- ✅ Executar o workflow automaticamente
- ✅ Mostrar progresso em tempo real

## 📋 Método Manual (Sem GitHub CLI)

### Passo 1: Adicionar Secret no GitHub

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Configure:
   - **Name:** `NOTION_TOKEN_VPS`
   - **Secret:** Cole seu token do Notion (começa com `secret_` ou `ntn_`)
   - Clique em **"Add secret"**

### Passo 2: Executar Workflow

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
2. No menu lateral, clique em **"Setup Notion Token on VPS"**
3. Clique em **"Run workflow"**
4. Selecione a branch `staging`
5. Clique em **"Run workflow"**

## 🔑 Como Obter NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"New integration"** ou selecione uma existente
3. Dê um nome (ex: "FR Tech Dashboard")
4. Copie o **"Internal Integration Token"**
5. **Importante:** Compartilhe a integração com todas as databases no Notion

## ✅ Verificar se Funcionou

Após alguns minutos, teste:

```bash
curl https://frtechltda.com.br/api/health
# Deve retornar: {"status":"ok"}

curl https://frtechltda.com.br/api/enzo/kpis
# Deve retornar array com KPIs
```

Ou acesse: https://frtechltda.com.br/dashboard-enzo

