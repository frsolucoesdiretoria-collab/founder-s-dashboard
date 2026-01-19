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

1. **Acesse este link direto:**
   ```
   https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions/workflows/setup-notion-token.yml
   ```

2. **Clique no botão azul:** `Run workflow`

3. **Selecione:**
   - Branch: `staging`
   - Use secret from GitHub: `true` (deixe marcado)

4. **Clique em:** `Run workflow`

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
- **Executar Workflow:** https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions/workflows/setup-notion-token.yml
- **Ver Workflows:** https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
- **Obter NOTION_TOKEN:** https://www.notion.so/my-integrations
- **Testar Site:** https://frtechltda.com.br/dashboard-enzo

