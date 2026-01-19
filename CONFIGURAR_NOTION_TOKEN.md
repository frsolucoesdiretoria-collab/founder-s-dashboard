# 🔑 Como Configurar NOTION_TOKEN na VPS Automaticamente

## ⚡ Método Automático (Recomendado - 2 Passos)

### Passo 1: Adicionar Secret no GitHub

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Configure:
   - **Name:** `NOTION_TOKEN_VPS`
   - **Secret:** Cole seu token do Notion aqui (começa com `secret_` ou `ntn_`)
   - Clique em **"Add secret"**

### Passo 2: Executar Workflow

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
2. No menu lateral, clique em **"Setup Notion Token on VPS"**
3. Clique em **"Run workflow"**
4. Selecione a branch `staging`
5. Clique em **"Run workflow"**

**Pronto!** O workflow irá:
- ✅ Fazer backup do `.env.local` atual
- ✅ Configurar `NOTION_TOKEN` automaticamente
- ✅ Reiniciar o PM2
- ✅ Verificar se tudo funcionou

## 📋 Como Obter o NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"New integration"** ou selecione uma existente
3. Dê um nome (ex: "FR Tech Dashboard")
4. Copie o **"Internal Integration Token"**
5. **Importante:** Compartilhe a integração com todas as databases necessárias no Notion:
   - KPIs_Enzo
   - Goals_Enzo
   - Actions_Enzo
   - Contacts_Enzo

## ✅ Verificar se Funcionou

Após executar o workflow, teste:

```bash
# Testar health check
curl https://frtechltda.com.br/api/health
# Deve retornar: {"status":"ok"}

# Testar KPIs do Enzo
curl https://frtechltda.com.br/api/enzo/kpis
# Deve retornar array com KPIs (não vazio)
```

Ou acesse no navegador:
- https://frtechltda.com.br/dashboard-enzo
- Os KPIs devem aparecer com dados

## 🔧 Método Manual (Se o Automático Não Funcionar)

Se preferir configurar manualmente na VPS:

```bash
# Conecte-se à VPS
ssh usuario@ip-da-vps

# Vá para o diretório do projeto
cd /caminho/do/projeto

# Edite .env.local
nano .env.local

# Adicione ou substitua a linha:
NOTION_TOKEN=seu_token_aqui

# Salve: Ctrl+O, Enter, Ctrl+X

# Reinicie PM2
pm2 restart founder-dashboard
```

## ⚠️ Sobre o Terminal Local

As mensagens "Process hasn't exited" no terminal local são **normais** em desenvolvimento. O `tsx watch` às vezes não encerra processos antigos corretamente. Isso **não afeta a produção**.

**Solução rápida:**
- Pare o servidor: `Ctrl+C` no terminal
- Execute novamente: `npm run dev`

Ou simplesmente ignore - não afeta o funcionamento.

## 🆘 Problemas Comuns

### Workflow falha com "secret não configurado"
- Verifique se adicionou o secret `NOTION_TOKEN_VPS` no GitHub
- O nome deve ser exatamente `NOTION_TOKEN_VPS`

### PM2 não inicia após configurar token
- Verifique os logs: `pm2 logs founder-dashboard --lines 50`
- Verifique se o token está correto no `.env.local`
- Tente reiniciar manualmente: `pm2 restart founder-dashboard`

### KPIs ainda não aparecem
- Verifique se a integração do Notion está compartilhada com as databases
- Verifique se os KPIs estão marcados como "Active" no Notion
- Verifique os logs do PM2 para erros

