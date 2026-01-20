# 🚀 Instruções de Deploy e Correção - Dashboard Enzo na VPS

## Problema Identificado

O site https://frtechltda.com.br/dashboard-enzo não está carregando KPIs com dados das databases do Notion, enquanto funciona perfeitamente no ambiente local.

## Diagnóstico Rápido

Execute o script de diagnóstico na VPS:

```bash
cd /caminho/do/projeto
bash scripts/diagnose-vps.sh
```

Este script verifica:
- ✅ Status do PM2
- ✅ Configuração do .env.local
- ✅ Endpoints da API
- ✅ Build de produção
- ✅ Logs do servidor

## Correções Necessárias

### 1. Verificar e Configurar .env.local na VPS

Conecte-se na VPS via SSH e verifique o arquivo `.env.local`:

```bash
cd /caminho/do/projeto
cat .env.local | grep -E "NOTION_TOKEN|NOTION_DB.*ENZO"
```

**Verifique se está configurado:**

```env
# Token do Notion (OBRIGATÓRIO - não pode ter placeholder)
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Databases do Enzo (OBRIGATÓRIAS para /dashboard-enzo funcionar)
NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4
NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0
NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e
NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff
```

**Se faltar alguma variável, adicione:**

```bash
# Editar .env.local
nano .env.local

# Ou adicionar via echo (substitua os IDs se necessário)
echo "" >> .env.local
echo "# Enzo Canei Dashboard Databases" >> .env.local
echo "NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4" >> .env.local
echo "NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0" >> .env.local
echo "NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e" >> .env.local
echo "NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff" >> .env.local
```

### 2. Verificar Status do Servidor

```bash
# Verificar se PM2 está rodando
pm2 list

# Se não estiver rodando, iniciar:
pm2 start npm --name "founder-dashboard" -- start

# Se já estiver rodando mas com problemas, reiniciar:
pm2 restart founder-dashboard
```

### 3. Verificar Logs do Servidor

```bash
# Ver logs em tempo real
pm2 logs founder-dashboard

# Ver últimas 50 linhas
pm2 logs founder-dashboard --lines 50 --nostream
```

**Procurar por erros:**
- ❌ "NOTION_TOKEN not configured"
- ❌ "NOTION_DB_KPIS_ENZO not configured"
- ❌ "Failed to fetch" ou erros de conexão
- ❌ Erros de autenticação do Notion

### 4. Testar Endpoints Localmente na VPS

```bash
# Testar health
curl http://localhost:3001/api/health

# Testar KPIs do Enzo
curl http://localhost:3001/api/enzo/kpis

# Testar Goals do Enzo
curl http://localhost:3001/api/enzo/goals
```

**Se retornar arrays vazios `[]`:**
- Verifique se as databases do Notion estão compartilhadas com a integração
- Verifique se os KPIs estão marcados como "Active" no Notion
- Verifique se há dados nas databases

**Se retornar erro 500:**
- Verifique os logs do PM2
- Verifique se o NOTION_TOKEN está válido
- Verifique se as databases existem e estão acessíveis

### 5. Rebuild e Restart

Se fez alterações no código ou no .env.local:

```bash
# Rebuild da aplicação
npm run build

# Reiniciar servidor
pm2 restart founder-dashboard

# Verificar se iniciou corretamente
pm2 list
pm2 logs founder-dashboard --lines 20 --nostream
```

### 6. Verificar Build de Produção

```bash
# Verificar se dist/ existe e está atualizado
ls -la dist/

# Verificar data de modificação
stat dist/

# Se dist/ não existir ou estiver desatualizado:
npm run build
```

## Checklist de Validação

Após fazer as correções, valide:

- [ ] `.env.local` tem `NOTION_TOKEN` configurado (sem placeholder)
- [ ] Todas as databases do Enzo estão configuradas
- [ ] PM2 está rodando (`pm2 list` mostra `founder-dashboard` como `online`)
- [ ] Endpoint `/api/health` responde com `{"status":"ok"}`
- [ ] Endpoint `/api/enzo/kpis` retorna array com KPIs (não vazio)
- [ ] Endpoint `/api/enzo/goals` retorna array com Goals
- [ ] Pasta `dist/` existe e está atualizada
- [ ] Logs do PM2 não mostram erros críticos
- [ ] Site https://frtechltda.com.br/dashboard-enzo carrega KPIs

## Problemas Comuns e Soluções

### Problema: KPIs aparecem mas com valores 0

**Causa:** Goals não estão configuradas ou não têm valores

**Solução:**
1. Verifique se há Goals na database `NOTION_DB_GOALS_ENZO`
2. Verifique se as Goals estão relacionadas aos KPIs corretos
3. Verifique se as Goals têm valores em `Target` e `Actual`

### Problema: Erro "Nenhum KPI configurado"

**Causa:** Database de KPIs não configurada ou KPIs não estão marcados como "Active"

**Solução:**
1. Verifique se `NOTION_DB_KPIS_ENZO` está no `.env.local`
2. No Notion, verifique se os KPIs estão marcados como "Active" (checkbox)
3. Verifique se a database está compartilhada com a integração do Notion

### Problema: Erro "Erro ao carregar dados. Verifique sua conexão"

**Causa:** Servidor não está respondendo ou há erro de conexão

**Solução:**
1. Verifique se o servidor está rodando: `pm2 list`
2. Verifique logs: `pm2 logs founder-dashboard`
3. Teste endpoint localmente: `curl http://localhost:3001/api/health`
4. Verifique se o Nginx/proxy está configurado corretamente

### Problema: Site não carrega (erro 502/503)

**Causa:** Servidor não está rodando ou porta não está acessível

**Solução:**
1. Verifique PM2: `pm2 list`
2. Se não estiver rodando: `pm2 start npm --name "founder-dashboard" -- start`
3. Verifique se porta 3001 está em uso: `lsof -ti:3001`
4. Verifique configuração do Nginx/proxy

## Comandos Úteis

```bash
# Ver status completo
pm2 list
pm2 logs founder-dashboard --lines 50

# Reiniciar servidor
pm2 restart founder-dashboard

# Parar servidor
pm2 stop founder-dashboard

# Ver variáveis de ambiente do processo
pm2 env founder-dashboard

# Rebuild e restart
npm run build && pm2 restart founder-dashboard

# Verificar se dist/ está atualizado
ls -lht dist/ | head -5
```

## Próximos Passos Após Correção

1. **Testar no navegador:**
   - Acesse https://frtechltda.com.br/dashboard-enzo
   - Abra console do navegador (F12)
   - Verifique se há erros
   - Verifique se os KPIs carregam

2. **Monitorar logs:**
   - Deixe `pm2 logs founder-dashboard` rodando
   - Acesse o site e veja os logs em tempo real

3. **Validar dados:**
   - Verifique se os KPIs mostram valores corretos
   - Verifique se as Goals aparecem
   - Verifique se as Actions (todos) aparecem

## Suporte

Se após seguir todas as instruções o problema persistir:

1. Execute o script de diagnóstico: `bash scripts/diagnose-vps.sh`
2. Salve a saída completa
3. Verifique os logs: `pm2 logs founder-dashboard --lines 100`
4. Teste os endpoints: `curl http://localhost:3001/api/enzo/kpis`
5. Documente os erros encontrados

## Notas Importantes

- ⚠️ O arquivo `.env.local` na VPS pode estar diferente do local
- ⚠️ O build de produção pode estar desatualizado
- ⚠️ O servidor precisa ser reiniciado após alterar `.env.local`
- ⚠️ As databases do Notion precisam estar compartilhadas com a integração
- ⚠️ Em produção, o frontend usa URLs relativas (`/api/...`) automaticamente





