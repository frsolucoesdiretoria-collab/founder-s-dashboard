# 🔍 Verificar KPIs Financeiros na VPS

## ❌ Problema Identificado

KPIs financeiros não estão sendo exibidos no site da VPS.

## ✅ Checklist de Verificação

### 1. Verificar se o código está atualizado na VPS

Execute na VPS:
```bash
cd /var/www/founder-dashboard
git log --oneline -5
```

Verifique se o último commit inclui as mudanças do Finance.

### 2. Verificar variáveis de ambiente

Execute na VPS:
```bash
cd /var/www/founder-dashboard
cat .env | grep NOTION
```

**Deve ter pelo menos:**
```env
NOTION_TOKEN=secret_xxxxx (não pode ser placeholder)
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
```

### 3. Verificar se a database de KPIs existe no Notion

**No Notion:**
1. Abra a database de KPIs
2. Verifique se há KPIs marcados como:
   - ✅ `Active` = true (checkbox marcado)
   - ✅ `IsFinancial` = true (checkbox marcado)
   - ✅ `VisibleAdmin` = true (checkbox marcado)

### 4. Verificar se o servidor está rodando com as variáveis corretas

Execute na VPS:
```bash
pm2 env founder-dashboard | grep NOTION
```

**Verifique se aparece:**
- NOTION_TOKEN (não pode estar vazio)
- NOTION_DB_KPIS (deve ter o ID correto)

### 5. Testar API diretamente na VPS

Execute na VPS:
```bash
curl -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin | head -20
```

**Deve retornar:** Array JSON com KPIs (incluindo financeiros)

Se retornar erro 401: Senha não está sendo aceita
Se retornar erro 500: Problema com Notion ou database
Se retornar array vazio `[]`: Não há KPIs ou filtro está bloqueando

### 6. Verificar logs do servidor

Execute na VPS:
```bash
pm2 logs founder-dashboard --lines 50
```

**Procure por:**
- ❌ "NOTION_TOKEN not configured"
- ❌ "NOTION_DB_KPIS not configured"
- ❌ "Database not found"
- ❌ "401 Unauthorized" do Notion
- ❌ Erros de conexão com Notion

### 7. Verificar build foi feito

Execute na VPS:
```bash
ls -la /var/www/founder-dashboard/dist
```

**Deve ter arquivos:**
- index.html
- assets/ (pasta com arquivos JS e CSS)

Se não existir, execute: `npm run build`

---

## 🔧 Soluções Comuns

### Problema: KPIs não aparecem

**Solução 1: Verificar filtro no código**
O código filtra KPIs que contêm "nubank", "pessoa física" ou "pessoal" no nome.

**Solução:** 
- No Notion, verifique se os KPIs financeiros têm esses termos no nome
- OU remover o filtro no código (linha 68-72 do Finance.tsx)

**Solução 2: Verificar se KPIs estão marcados corretamente**

No Notion, cada KPI financeiro deve ter:
- ✅ Name: (qualquer nome, mas se for para Flora, deve conter "nubank" ou "pessoa física")
- ✅ IsFinancial: true (checkbox marcado)
- ✅ Active: true (checkbox marcado)
- ✅ VisibleAdmin: true (checkbox marcado)

### Problema: Erro 401 na API

**Solução:**
1. Verificar se senha `flora123` está sendo aceita
2. Verificar se `validateAdminPasscode` aceita `flora123`
3. Reiniciar servidor após mudanças

### Problema: Servidor não está servindo arquivos estáticos

**Solução:**
1. Verificar se pasta `dist/` existe
2. Fazer build: `npm run build`
3. Reiniciar: `pm2 restart founder-dashboard`

---

## 📋 Comandos Rápidos para Verificar Tudo

Execute na VPS (copie e cole tudo):

```bash
cd /var/www/founder-dashboard && \
echo "=== Verificando código ===" && \
git log --oneline -1 && \
echo "" && \
echo "=== Verificando .env ===" && \
cat .env | grep -E "NOTION_TOKEN|NOTION_DB_KPIS" | head -2 && \
echo "" && \
echo "=== Testando API ===" && \
curl -s -H "x-admin-passcode: flora123" http://localhost:3001/api/kpis/admin | head -1 && \
echo "" && \
echo "=== Verificando PM2 ===" && \
pm2 status && \
echo "" && \
echo "=== Últimos logs ===" && \
pm2 logs founder-dashboard --lines 5 --nostream
```

---

## 🔄 Deploy Completo (Recomendado)

Se ainda não funcionar, faça deploy completo novamente:

```bash
cd /var/www/founder-dashboard && \
git stash && \
git fetch origin main && \
git reset --hard origin/main && \
npm install --production && \
npm run build && \
pm2 restart founder-dashboard && \
pm2 save && \
echo "✅ Deploy concluído!"
```

Depois teste novamente no navegador.

