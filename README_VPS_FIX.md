# 🚨 GUIA COMPLETO - Corrigir Dashboard Enzo na VPS

## ⚠️ PROBLEMA CRÍTICO IDENTIFICADO

O site **https://frtechltda.com.br/dashboard-enzo** está retornando:
- ✅ Servidor funcionando (`/api/health` OK)
- ❌ `/api/enzo/kpis` retorna `[]` (array vazio)
- ❌ `/api/enzo/goals` retorna erro "Failed to fetch goals"

**Causa:** Databases do Enzo não estão configuradas no `.env.local` da VPS ou não estão acessíveis.

## 🎯 SOLUÇÃO RÁPIDA (5 minutos)

### ⚡ OPÇÃO 1: Correção Automática (Recomendado)

```bash
# Conectar na VPS
ssh seu-usuario@frtechltda.com.br
cd /caminho/do/projeto

# Executar script automático (faz tudo sozinho)
bash scripts/fix-vps-enzo-auto.sh
```

Este script:
- ✅ Adiciona automaticamente as databases do Enzo ao `.env.local`
- ✅ Reinicia o servidor PM2
- ✅ Testa os endpoints
- ✅ Mostra resumo do que foi feito

### 📋 OPÇÃO 2: Passo a Passo Manual

### 1. Conectar na VPS

```bash
ssh seu-usuario@frtechltda.com.br
cd /caminho/do/projeto
```

### 2. Executar Diagnóstico

```bash
bash scripts/diagnose-vps.sh
```

O script vai mostrar exatamente o que está faltando.

### 3. Executar Correção Interativa

```bash
# Script interativo que guia você passo a passo
bash scripts/fix-vps-enzo.sh
```

OU adicionar manualmente:

### 3. Adicionar Databases do Enzo ao .env.local

```bash
# Verificar se já existe
cat .env.local | grep NOTION_DB_KPIS_ENZO

# Se não existir, adicionar:
cat >> .env.local << 'EOF'

# Enzo Canei Dashboard Databases
NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4
NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0
NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e
NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff
EOF
```

### 4. Verificar NOTION_TOKEN

```bash
# Verificar se está configurado (NÃO pode ter <<<SET...>>>)
cat .env.local | grep NOTION_TOKEN

# Se tiver placeholder, você precisa preencher manualmente
```

### 5. Reiniciar Servidor

```bash
pm2 restart founder-dashboard
sleep 3
pm2 logs founder-dashboard --lines 20 --nostream
```

### 6. Testar

```bash
# Deve retornar KPIs, não array vazio
curl http://localhost:3001/api/enzo/kpis

# Deve retornar Goals, não erro
curl http://localhost:3001/api/enzo/goals
```

### 7. Validar no Navegador

Acesse: https://frtechltda.com.br/dashboard-enzo

Deve mostrar:
- ✅ KPIs com dados (não zeros)
- ✅ Goals aparecendo
- ✅ Actions (todos) funcionando

## 📋 CHECKLIST COMPLETO

Execute este checklist na ordem:

- [ ] **1. Conectado na VPS via SSH**
- [ ] **2. Executado `bash scripts/diagnose-vps.sh`**
- [ ] **3. Verificado `.env.local` tem `NOTION_TOKEN` válido**
- [ ] **4. Adicionado `NOTION_DB_KPIS_ENZO` ao `.env.local`**
- [ ] **5. Adicionado `NOTION_DB_GOALS_ENZO` ao `.env.local`**
- [ ] **6. Adicionado `NOTION_DB_ACTIONS_ENZO` ao `.env.local`**
- [ ] **7. Adicionado `NOTION_DB_CONTACTS_ENZO` ao `.env.local`**
- [ ] **8. Reiniciado servidor: `pm2 restart founder-dashboard`**
- [ ] **9. Testado: `curl http://localhost:3001/api/enzo/kpis` retorna KPIs**
- [ ] **10. Testado: `curl http://localhost:3001/api/enzo/goals` retorna Goals**
- [ ] **11. Verificado logs: `pm2 logs founder-dashboard` não mostra erros**
- [ ] **12. Acessado https://frtechltda.com.br/dashboard-enzo no navegador**
- [ ] **13. Validado que KPIs aparecem com dados**
- [ ] **14. Validado que Goals aparecem**
- [ ] **15. Validado que Actions aparecem**

## 🔍 DIAGNÓSTICO DETALHADO

### Se `curl http://localhost:3001/api/enzo/kpis` retorna `[]`:

**Possíveis causas:**
1. Database não está configurada no `.env.local`
2. Database não está compartilhada com a integração do Notion
3. KPIs não estão marcados como "Active" no Notion
4. Token do Notion está inválido

**Solução:**
```bash
# 1. Verificar se está configurado
cat .env.local | grep NOTION_DB_KPIS_ENZO

# 2. Se não estiver, adicionar (veja passo 3 acima)

# 3. Verificar se token está válido
cat .env.local | grep NOTION_TOKEN

# 4. No Notion, verificar:
#    - Database está compartilhada com a integração?
#    - KPIs estão marcados como "Active"?
```

### Se `curl http://localhost:3001/api/enzo/goals` retorna erro:

**Possíveis causas:**
1. Database não está configurada
2. Database não está compartilhada
3. Token inválido

**Solução:**
```bash
# Adicionar NOTION_DB_GOALS_ENZO ao .env.local
# Reiniciar servidor
pm2 restart founder-dashboard
```

## 📚 DOCUMENTAÇÃO ADICIONAL

- **`VPS_DEPLOY_INSTRUCTIONS.md`** - Instruções detalhadas de deploy
- **`VPS_FIX_SUMMARY.md`** - Resumo da correção
- **`scripts/diagnose-vps.sh`** - Script de diagnóstico automático

## 🚀 DEPLOY AUTOMÁTICO

O workflow de deploy (`.github/workflows/deploy.yml`) foi atualizado para:
- ✅ Adicionar automaticamente os IDs corretos das databases do Enzo
- ✅ Incluir `NOTION_DB_CONTACTS_ENZO`
- ✅ Preservar configurações existentes

**Próximo deploy automático vai:**
1. Adicionar as databases do Enzo se não existirem
2. Fazer rebuild da aplicação
3. Reiniciar o servidor

## ⚡ COMANDOS RÁPIDOS

```bash
# CORREÇÃO AUTOMÁTICA (Recomendado - faz tudo sozinho)
bash scripts/fix-vps-enzo-auto.sh

# CORREÇÃO INTERATIVA (com prompts e validações)
bash scripts/fix-vps-enzo.sh

# Diagnóstico completo
bash scripts/diagnose-vps.sh

# Ver configuração atual
cat .env.local | grep -E "NOTION_TOKEN|NOTION_DB.*ENZO"

# Adicionar databases do Enzo (se faltarem)
cat >> .env.local << 'EOF'

# Enzo Canei Dashboard Databases
NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4
NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0
NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e
NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff
EOF

# Reiniciar servidor
pm2 restart founder-dashboard

# Testar endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/enzo/kpis
curl http://localhost:3001/api/enzo/goals

# Ver logs
pm2 logs founder-dashboard --lines 50
```

## ✅ VALIDAÇÃO FINAL

Após seguir todos os passos, o site deve:

1. ✅ Carregar KPIs com dados reais (não zeros)
2. ✅ Mostrar Goals relacionadas aos KPIs
3. ✅ Exibir Actions (todos) do dia
4. ✅ Permitir interação (marcar ações como feitas)
5. ✅ Mostrar contatos para ativar

## 🆘 SE AINDA NÃO FUNCIONAR

1. Execute diagnóstico completo:
   ```bash
   bash scripts/diagnose-vps.sh > diagnostico.txt
   ```

2. Verifique logs detalhados:
   ```bash
   pm2 logs founder-dashboard --lines 100 > logs.txt
   ```

3. Teste todos os endpoints:
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/enzo/kpis
   curl http://localhost:3001/api/enzo/goals
   curl http://localhost:3001/api/enzo/actions
   curl http://localhost:3001/api/enzo/contacts
   ```

4. Verifique no Notion:
   - Databases estão compartilhadas com a integração?
   - KPIs estão marcados como "Active"?
   - Há dados nas databases?

5. Documente os erros específicos encontrados

## 📝 NOTAS IMPORTANTES

- ⚠️ **O `.env.local` na VPS é diferente do local** - precisa ser configurado separadamente
- ⚠️ **Servidor DEVE ser reiniciado** após alterar `.env.local`
- ⚠️ **Databases DEVEM estar compartilhadas** com a integração do Notion
- ⚠️ **KPIs DEVEM estar marcados como "Active"** no Notion
- ⚠️ **Token do Notion DEVE ser válido** (não pode ter placeholder)

## 🎯 RESULTADO ESPERADO

Após seguir este guia:

✅ Site https://frtechltda.com.br/dashboard-enzo funcionando
✅ KPIs carregando dados das databases do Notion
✅ Goals aparecendo corretamente
✅ Actions (todos) funcionando
✅ Contatos para ativar funcionando

**Tempo estimado:** 5-10 minutos

