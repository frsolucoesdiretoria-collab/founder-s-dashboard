# ⚡ PASSO A PASSO RÁPIDO - Configurar NOTION_TOKEN na VPS

## 🎯 Objetivo
Configurar o `NOTION_TOKEN` na VPS automaticamente em 2 passos.

## 📋 Passo 1: Adicionar Secret no GitHub (2 minutos)

1. **Acesse este link direto:**
   ```
   https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/settings/secrets/actions
   ```

2. **Clique no botão verde:** `New repository secret`

3. **Preencha:**
   - **Name:** `NOTION_TOKEN_VPS` (exatamente assim, sem espaços)
   - **Secret:** Cole seu token do Notion aqui
     - Obtenha em: https://www.notion.so/my-integrations
     - O token começa com `secret_` ou `ntn_`

4. **Clique em:** `Add secret`

✅ **Pronto! Secret adicionado.**

## 🚀 Passo 2: Executar Workflow (1 minuto)

**Opção A: Via página de Actions (Recomendado)**

1. **Acesse este link:**
   ```
   https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
   ```

2. **No menu lateral esquerdo**, procure por **"Setup Notion Token on VPS"**
   - Se não aparecer, clique em **"All workflows"** primeiro
   - Depois procure na lista

3. **Clique em "Setup Notion Token on VPS"**

4. **Clique no botão azul:** `Run workflow` (no canto superior direito)

5. **Selecione:**
   - Branch: `staging`
   - Deixe tudo como está

6. **Clique em:** `Run workflow` (botão verde)

**Opção B: Se o workflow não aparecer**

O GitHub pode levar alguns minutos para processar. Enquanto isso:

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
2. Clique em **"New workflow"** (botão verde no canto superior direito)
3. Procure por **"Setup Notion Token on VPS"** na lista
4. Ou use o workflow **"Fix Notion Connection on VPS"** que já existe e funciona

✅ **Pronto! O workflow está executando.**

## ⏱️ Aguardar (2-3 minutos)

O workflow irá:
- ✅ Conectar à VPS
- ✅ Configurar NOTION_TOKEN no .env.local
- ✅ Reiniciar PM2
- ✅ Verificar se funcionou

## ✅ Verificar se Funcionou

Após 2-3 minutos, teste:

```bash
# No terminal ou navegador
curl https://frtechltda.com.br/api/health
```

Ou acesse no navegador:
```
https://frtechltda.com.br/dashboard-enzo
```

Os KPIs devem aparecer com dados! 🎉

## 🔑 Como Obter NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"New integration"**
3. Dê um nome: "FR Tech Dashboard"
4. Copie o **"Internal Integration Token"**
5. **Importante:** Compartilhe a integração com estas databases no Notion:
   - KPIs_Enzo
   - Goals_Enzo  
   - Actions_Enzo
   - Contacts_Enzo

## 🆘 Se Algo Der Errado

1. Verifique os logs do workflow:
   - Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
   - Clique no workflow que falhou
   - Veja os logs para identificar o problema

2. Verifique se o secret foi adicionado:
   - Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/settings/secrets/actions
   - Deve aparecer `NOTION_TOKEN_VPS` na lista

3. Tente executar o workflow novamente

## 📞 Resumo dos Links Importantes

- **Adicionar Secret:** https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/settings/secrets/actions
- **Executar Workflow:** https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions (use "Fix Notion Connection on VPS")
- **Ver Workflows:** https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
- **Obter NOTION_TOKEN:** https://www.notion.so/my-integrations
- **Testar Site:** https://frtechltda.com.br/dashboard-enzo

