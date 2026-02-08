# 🔧 Solução: KPIs Financeiros Não Aparecem na VPS

## ✅ Problemas Identificados e Corrigidos

### 1. **Filtro muito restritivo** ✅ CORRIGIDO

**Problema:** O código só mostrava KPIs financeiros que continham "nubank", "pessoa física" ou "pessoal" no nome.

**Solução:** 
- Para Flora: Mantém filtro de KPIs pessoais
- Para Admin: Mostra TODOS os KPIs financeiros sem filtro

### 2. **Deploy na VPS** ⚠️ PRECISA ATUALIZAR

O código foi corrigido localmente, mas precisa ser atualizado na VPS.

---

## 🚀 Como Corrigir na VPS

### **Passo 1: Atualizar código na VPS**

Execute na VPS (copie e cole):

```bash
cd /var/www/founder-dashboard && git stash && git fetch origin main && git reset --hard origin/main && npm install --production && npm run build && pm2 restart founder-dashboard && pm2 save
```

### **Passo 2: Verificar se está funcionando**

Execute na VPS:

```bash
curl -s -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin
```

**Deve retornar:** Array JSON com KPIs (se houver KPIs financeiros no Notion)

---

## 📋 Verificar KPIs no Notion

**IMPORTANTE:** Para os KPIs aparecerem, eles devem estar configurados assim no Notion:

### Para Flora ver:
- ✅ Name: (deve conter "Nubank", "Pessoa Física" ou "Pessoal")
- ✅ IsFinancial: `true` (checkbox marcado)
- ✅ Active: `true` (checkbox marcado)
- ✅ VisibleAdmin: `true` (checkbox marcado)

### Para Admin ver (senha `06092021`):
- ✅ Name: (qualquer nome)
- ✅ IsFinancial: `true` (checkbox marcado)
- ✅ Active: `true` (checkbox marcado)
- ✅ VisibleAdmin: `true` (checkbox marcado)

---

## 🔍 Diagnóstico Completo

Execute na VPS para ver o que está acontecendo:

```bash
cd /var/www/founder-dashboard && \
echo "=== 1. Testando API ===" && \
curl -s -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin | python3 -m json.tool | head -30 && \
echo "" && \
echo "=== 2. Verificando .env ===" && \
cat .env | grep -E "NOTION_TOKEN|NOTION_DB_KPIS" && \
echo "" && \
echo "=== 3. Verificando PM2 ===" && \
pm2 status && \
echo "" && \
echo "=== 4. Últimos logs ===" && \
pm2 logs founder-dashboard --lines 15 --nostream
```

---

## ✅ Solução Completa

Execute tudo de uma vez na VPS:

```bash
cd /var/www/founder-dashboard && \
git stash && \
git fetch origin main && \
git reset --hard origin/main && \
npm install --production && \
npm run build && \
pm2 restart founder-dashboard && \
pm2 save && \
echo "✅ Deploy concluído!" && \
echo "" && \
echo "Testando API..." && \
curl -s -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin | python3 -m json.tool 2>/dev/null | head -20 || curl -s -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin | head -20
```

---

## 🎯 Testar no Navegador

Após o deploy:

1. Acesse: https://frtechltda.com.br/finance
2. Senha Flora: `flora123` (vê apenas KPIs pessoais)
3. Senha Admin: `06092021` (vê TODOS os KPIs financeiros)

---

## ❓ Se ainda não aparecer KPIs

### Verifique no Notion:

1. Abra a database de KPIs
2. Verifique se há KPIs com:
   - ✅ `IsFinancial` = true
   - ✅ `Active` = true
   - ✅ `VisibleAdmin` = true

### Teste a API diretamente:

Na VPS, execute:
```bash
curl -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin
```

**Se retornar `[]`:**
- Não há KPIs financeiros configurados no Notion, OU
- KPIs não estão marcados como `Active` ou `IsFinancial`

**Se retornar erro 401:**
- Problema com senha/autenticação
- Verificar se `validateAdminPasscode` está aceitando `flora123`

**Se retornar erro 500:**
- Problema com Notion/database
- Verificar logs: `pm2 logs founder-dashboard`
- Verificar se `NOTION_TOKEN` está correto no `.env`

