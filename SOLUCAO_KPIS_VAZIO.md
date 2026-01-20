# 🔍 Por Que os KPIs Não Aparecem?

## ⚠️ Problema Identificado

O site está carregando, mas os KPIs não aparecem. Isso pode acontecer por vários motivos:

## 🔍 Diagnóstico - Execute na VPS

Execute este comando para ver o que está acontecendo:

```bash
cd /var/www/founder-dashboard && echo "=== NOTION_TOKEN ===" && grep "^NOTION_TOKEN=" .env.local | head -c 50 && echo "" && echo "" && echo "=== DATABASE IDs ===" && grep "^NOTION_DB_KPIS=" .env.local && echo "" && echo "=== TESTE API ===" && curl -s http://localhost:3001/api/kpis/public && echo "" && echo "" && echo "=== STATUS CODE ===" && curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://localhost:3001/api/kpis/public && echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 30 --nostream | grep -i -E "kpi|notion|error" | tail -10
```

## 🎯 Possíveis Causas e Soluções

### 1. KPIs Não Estão Marcados Corretamente no Notion

**Problema:** Os KPIs no Notion precisam ter estas propriedades marcadas:
- ✅ **Active** = `true` (marcado)
- ✅ **VisiblePublic** = `true` (marcado)
- ❌ **IsFinancial** = `false` (desmarcado)

**Solução:**
1. Abra a database de KPIs no Notion
2. Para cada KPI que você quer exibir:
   - Marque a checkbox **Active**
   - Marque a checkbox **VisiblePublic**
   - **Desmarque** a checkbox **IsFinancial** (se estiver marcada)
3. Salve as alterações
4. Recarregue o dashboard

### 2. NOTION_TOKEN Não Está Configurado ou Está Incorreto

**Verificar:**
```bash
grep "^NOTION_TOKEN=" /var/www/founder-dashboard/.env.local
```

**Se não aparecer nada ou aparecer com `<<<`:**
1. Obtenha o token em: https://www.notion.so/my-integrations
2. Edite: `nano /var/www/founder-dashboard/.env.local`
3. Adicione: `NOTION_TOKEN=seu_token_aqui`
4. Reinicie: `pm2 restart founder-dashboard`

### 3. Database ID Incorreto

**Verificar:**
```bash
grep "^NOTION_DB_KPIS=" /var/www/founder-dashboard/.env.local
```

**O ID deve ter 32 caracteres** (sem hífens).

**Se estiver incorreto:**
1. Abra a database de KPIs no Notion
2. Copie o ID da URL (parte após o último `/` e antes do `?`)
3. Remova os hífens
4. Atualize no `.env.local`
5. Reinicie: `pm2 restart founder-dashboard`

### 4. Integração Não Tem Acesso à Database

**Verificar:**
1. Abra a database de KPIs no Notion
2. Clique nos `...` no canto superior direito
3. Selecione "Connections" ou "Conexões"
4. Verifique se sua integração está conectada
5. Se não estiver, clique em "Add connections" e adicione sua integração

### 5. Nenhum KPI Atende aos Filtros

**Verificar quantos KPIs existem no total:**
```bash
curl -s http://localhost:3001/api/kpis/admin -H "x-admin-passcode: admin123" | head -c 500
```

Se retornar KPIs no admin mas não no público, significa que os KPIs não têm `VisiblePublic=true` ou têm `IsFinancial=true`.

## ✅ Solução Rápida

Execute este comando para verificar tudo:

```bash
cd /var/www/founder-dashboard && echo "1. Token:" && grep "^NOTION_TOKEN=" .env.local | head -c 40 && echo "..." && echo "" && echo "2. Database ID:" && grep "^NOTION_DB_KPIS=" .env.local && echo "" && echo "3. Teste API:" && curl -s http://localhost:3001/api/kpis/public | jq '. | length' 2>/dev/null || curl -s http://localhost:3001/api/kpis/public | grep -o '"id"' | wc -l && echo "" && echo "4. Logs:" && pm2 logs founder-dashboard --lines 20 --nostream | tail -5
```

## 🎯 Checklist no Notion

Para cada KPI que você quer exibir:

- [ ] KPI existe na database
- [ ] **Active** está marcado ✅
- [ ] **VisiblePublic** está marcado ✅
- [ ] **IsFinancial** está desmarcado ❌
- [ ] Integração tem acesso à database
- [ ] Database ID está correto no `.env.local`
- [ ] NOTION_TOKEN está configurado

## 🆘 Se Ainda Não Funcionar

Execute este diagnóstico completo e me envie o resultado:

```bash
cd /var/www/founder-dashboard && pm2 logs founder-dashboard --lines 100 --nostream | grep -A 5 -B 5 -i "kpi\|notion\|error" && echo "" && echo "=== API Response ===" && curl -v http://localhost:3001/api/kpis/public 2>&1
```





