# 🚨 ERRO 502 - Diagnóstico e Solução

## ⚠️ Problema: 502 Bad Gateway

O erro 502 significa:
- ✅ Nginx está funcionando
- ❌ Nginx não consegue conectar ao backend (porta 3001)

## 🔍 Diagnóstico Rápido

Execute estes comandos **NA VPS** para identificar o problema:

```bash
# 1. Verificar se PM2 está rodando
pm2 list | grep founder-dashboard

# 2. Verificar se porta 3001 está em uso
lsof -i:3001

# 3. Testar se servidor responde localmente
curl http://localhost:3001/api/health

# 4. Ver logs do PM2
pm2 logs founder-dashboard --lines 50

# 5. Verificar se processo está realmente rodando
ps aux | grep node | grep founder
```

## 🔧 Solução Imediata

### Opção 1: Reiniciar Tudo (Recomendado)

```bash
cd /var/www/founder-dashboard && \
pm2 delete founder-dashboard 2>/dev/null || true && \
pm2 stop founder-dashboard 2>/dev/null || true && \
sleep 3 && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
[ ! -d "dist" ] && npm run build || echo "Build OK" && \
set -a && source .env.local && set +a && \
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start && \
pm2 save && \
sleep 15 && \
echo "=== VERIFICANDO ===" && \
pm2 list | grep founder-dashboard && \
curl -v http://localhost:3001/api/health && \
pm2 logs founder-dashboard --lines 30 --nostream
```

### Opção 2: Verificar e Corrigir Problema Específico

```bash
# Ver qual é o erro exato
pm2 logs founder-dashboard --lines 100 --nostream

# Se erro for "port in use"
lsof -ti:3001 | xargs kill -9
pm2 restart founder-dashboard

# Se erro for "NOTION_TOKEN"
cd /var/www/founder-dashboard
nano .env.local
# Verificar se NOTION_TOKEN está configurado

# Se erro for "dist not found"
cd /var/www/founder-dashboard
npm run build
pm2 restart founder-dashboard
```

## 🎯 Comando de Diagnóstico Completo

Execute este comando para ver TUDO de uma vez:

```bash
echo "=== PM2 STATUS ===" && \
pm2 list | grep founder-dashboard && \
echo "" && \
echo "=== PORTA 3001 ===" && \
lsof -i:3001 || echo "Porta 3001 NÃO está em uso!" && \
echo "" && \
echo "=== HEALTH CHECK ===" && \
curl -v http://localhost:3001/api/health 2>&1 || echo "Servidor NÃO está respondendo!" && \
echo "" && \
echo "=== PROCESSOS NODE ===" && \
ps aux | grep node | grep -v grep && \
echo "" && \
echo "=== LOGS PM2 (últimas 30 linhas) ===" && \
pm2 logs founder-dashboard --lines 30 --nostream
```

## 🔍 Problemas Comuns e Soluções

### 1. PM2 mostra "errored" ou "stopped"
**Solução:**
```bash
pm2 delete founder-dashboard
cd /var/www/founder-dashboard
set -a && source .env.local && set +a
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start
```

### 2. Porta 3001 não está em uso
**Solução:**
```bash
cd /var/www/founder-dashboard
pm2 restart founder-dashboard
# Ou se não funcionar:
pm2 delete founder-dashboard
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start
```

### 3. Servidor inicia mas crasha imediatamente
**Verificar logs:**
```bash
pm2 logs founder-dashboard --lines 100
```
**Causas comuns:**
- NOTION_TOKEN não configurado
- Database IDs incorretos
- Erro de sintaxe no código
- Porta em uso por outro processo

### 4. Nginx não consegue conectar
**Verificar configuração do nginx:**
```bash
# Ver configuração
cat /etc/nginx/sites-available/frtechltda.com.br | grep proxy_pass

# Deve mostrar algo como:
# proxy_pass http://localhost:3001;
# ou
# proxy_pass http://127.0.0.1:3001;
```

## ✅ Checklist de Verificação

Após executar a solução, verifique:

- [ ] `pm2 list` mostra `founder-dashboard | online`
- [ ] `lsof -i:3001` mostra processo node
- [ ] `curl http://localhost:3001/api/health` retorna `{"status":"ok"}`
- [ ] `pm2 logs` não mostra erros críticos
- [ ] Site no navegador não mostra mais 502

## 🆘 Se Nada Funcionar

Execute este diagnóstico completo e envie o resultado:

```bash
cd /var/www/founder-dashboard && \
echo "=== INFORMAÇÕES DO SISTEMA ===" && \
echo "Diretório atual: $(pwd)" && \
echo "Usuário: $(whoami)" && \
echo "Data: $(date)" && \
echo "" && \
echo "=== PM2 ===" && \
pm2 list && \
echo "" && \
echo "=== PORTA 3001 ===" && \
lsof -i:3001 && \
echo "" && \
echo "=== PROCESSOS NODE ===" && \
ps aux | grep node && \
echo "" && \
echo "=== .env.local ===" && \
[ -f .env.local ] && echo "Arquivo existe" && grep -c "^NOTION_TOKEN=" .env.local && echo "NOTION_TOKEN configurado" || echo "Arquivo NÃO existe" && \
echo "" && \
echo "=== DIST ===" && \
[ -d "dist" ] && echo "Pasta dist existe" && ls -la dist/ | head -5 || echo "Pasta dist NÃO existe" && \
echo "" && \
echo "=== LOGS COMPLETOS ===" && \
pm2 logs founder-dashboard --lines 100 --nostream
```





