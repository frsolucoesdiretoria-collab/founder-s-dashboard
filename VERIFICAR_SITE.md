# ✅ Verificar se o Site Está Funcionando

## 🌐 Teste no Navegador

### 1. Acesse o site principal:
```
https://frtechltda.com.br
```

### 2. Acesse o dashboard:
```
https://frtechltda.com.br/dashboard
```

### 3. Verifique se:
- ✅ A página carrega sem erro 502
- ✅ A senha é solicitada (se configurada)
- ✅ Os KPIs aparecem na tela
- ✅ Os dados estão sendo exibidos (não está vazio)
- ✅ Não há erros no console do navegador (F12)

## 🔍 Verificação Técnica na VPS

Execute estes comandos na VPS para verificar:

### 1. Status do PM2:
```bash
pm2 list | grep founder-dashboard
```
**Deve mostrar:** `status: online` (não "errored" ou "stopped")

### 2. Health Check:
```bash
curl http://localhost:3001/api/health
```
**Deve retornar:** `{"status":"ok","timestamp":"..."}`

### 3. Testar endpoint de KPIs:
```bash
curl http://localhost:3001/api/kpis/public | head -c 200
```
**Deve retornar:** JSON com array de KPIs (não erro)

### 4. Ver logs recentes:
```bash
pm2 logs founder-dashboard --lines 30 --nostream
```
**Deve mostrar:** Logs normais sem erros críticos

### 5. Verificar porta:
```bash
lsof -i:3001
```
**Deve mostrar:** Processo node rodando na porta 3001

## ✅ Checklist Completo

- [ ] Site carrega sem erro 502
- [ ] Dashboard acessível
- [ ] KPIs aparecem na tela
- [ ] Dados do Notion estão sendo exibidos
- [ ] PM2 status: online
- [ ] Health check retorna OK
- [ ] Endpoint de KPIs funciona
- [ ] Logs sem erros críticos
- [ ] Porta 3001 está em uso pelo processo correto

## 🆘 Se Algo Não Estiver Funcionando

### Erro 502 ainda aparece:
```bash
# Ver logs do erro
pm2 logs founder-dashboard --lines 50

# Verificar se servidor está rodando
pm2 list
curl http://localhost:3001/api/health
```

### KPIs não aparecem:
```bash
# Verificar NOTION_TOKEN
grep "^NOTION_TOKEN=" /var/www/founder-dashboard/.env.local

# Testar conexão com Notion
curl http://localhost:3001/api/kpis/public

# Ver logs de erro do Notion
pm2 logs founder-dashboard | grep -i "notion\|error\|database"
```

### Site carrega mas está vazio:
```bash
# Verificar se dist existe e tem conteúdo
ls -la /var/www/founder-dashboard/dist/

# Verificar build
cd /var/www/founder-dashboard
npm run build
```

## 🎯 Comando de Verificação Completa

Execute este comando na VPS para verificar tudo de uma vez:

```bash
echo "=== STATUS PM2 ===" && \
pm2 list | grep founder-dashboard && \
echo "" && \
echo "=== HEALTH CHECK ===" && \
curl -s http://localhost:3001/api/health && \
echo "" && \
echo "" && \
echo "=== TESTE KPIs ===" && \
curl -s http://localhost:3001/api/kpis/public | head -c 300 && \
echo "" && \
echo "" && \
echo "=== PORTA 3001 ===" && \
lsof -i:3001 && \
echo "" && \
echo "=== LOGS RECENTES ===" && \
pm2 logs founder-dashboard --lines 10 --nostream
```

## 🌐 URLs para Testar

- **Dashboard Principal:** https://frtechltda.com.br/dashboard
- **Dashboard Enzo:** https://frtechltda.com.br/dashboard-enzo
- **Finance:** https://frtechltda.com.br/finance
- **Tasks:** https://frtechltda.com.br/tasks
- **CRM:** https://frtechltda.com.br/crm

## ✅ Tudo Funcionando?

Se todos os testes passarem:
- ✅ Site acessível
- ✅ KPIs aparecendo
- ✅ Dados do Notion sendo exibidos
- ✅ PM2 online
- ✅ Sem erros nos logs

**Parabéns! 🎉 O site está funcionando corretamente!**





