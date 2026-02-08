# 🔧 Solução Definitiva: Erro 502 Bad Gateway

## ❌ Problema Identificado

O PM2 mostra "online" mas o servidor **NÃO está respondendo** na porta 3001.

**Possíveis causas:**
1. Servidor está crashando ao iniciar
2. Variáveis de ambiente faltando
3. Erro ao carregar código
4. Porta 3001 não está sendo escutada

---

## ✅ Solução: Ver Logs Detalhados

O problema é que precisamos ver **os logs reais** para identificar o erro.

### **Passo 1: Ver Logs Detalhados**

Execute na VPS:

```bash
cd /var/www/founder-dashboard
pm2 logs founder-dashboard --lines 50 --nostream
```

**Isso vai mostrar:**
- ✅ Erros de inicialização
- ✅ Erros de variáveis de ambiente
- ✅ Erros de conexão
- ✅ Qualquer problema real

### **Passo 2: Se não mostrar nada, ver logs de erro**

Execute:

```bash
pm2 logs founder-dashboard --err --lines 50 --nostream
```

### **Passo 3: Testar Início Manual (VER ERRO DIRETO)**

Execute:

```bash
cd /var/www/founder-dashboard
pm2 delete founder-dashboard 2>/dev/null || true
NODE_ENV=production PORT=3001 npm start
```

**Isso vai mostrar o erro diretamente no terminal!**

Pressione `Ctrl+C` para parar após ver o erro.

---

## 🔍 Diagnosticar Problema

Execute este comando completo na VPS:

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && echo "=== LOGS ANTIGOS ===" && pm2 logs founder-dashboard --lines 30 --nostream 2>&1 || echo "Sem logs antigos" && echo "" && echo "=== VERIFICANDO .env ===" && cat .env | grep -E "NOTION_TOKEN|NOTION_DB_KPIS|PORT|NODE_ENV" | head -5 && echo "" && echo "=== TESTANDO INÍCIO MANUAL ===" && timeout 10 npm start 2>&1 | head -30 || echo "Servidor não iniciou em 10 segundos"
```

---

## 🔧 Soluções Comuns

### Problema 1: "Missing required environment variable"

**Solução:**
```bash
cd /var/www/founder-dashboard
nano .env
# Verifique se NOTION_TOKEN está configurado
# Se não estiver, adicione: NOTION_TOKEN=seu_token_aqui
```

### Problema 2: "Port 3001 already in use"

**Solução:**
```bash
lsof -ti:3001 | xargs kill -9
pm2 restart founder-dashboard
```

### Problema 3: "Database not found"

**Solução:**
- Verifique se `NOTION_DB_KPIS` está no `.env`
- Verifique se o ID está correto
- Verifique se a database está compartilhada com a integração

### Problema 4: Erro ao iniciar Node.js

**Solução:**
- Verifique versão do Node: `node --version` (deve ser 18+)
- Reinstale dependências: `npm install`

---

## 📋 Comando de Diagnóstico Completo

Execute na VPS:

```bash
cd /var/www/founder-dashboard && \
echo "=== 1. Status PM2 ===" && \
pm2 status && \
echo "" && \
echo "=== 2. Logs (últimas 30 linhas) ===" && \
pm2 logs founder-dashboard --lines 30 --nostream && \
echo "" && \
echo "=== 3. Logs de ERRO ===" && \
pm2 logs founder-dashboard --err --lines 30 --nostream && \
echo "" && \
echo "=== 4. Verificando .env ===" && \
cat .env | grep -E "NOTION_TOKEN|NOTION_DB_KPIS|PORT" | head -3 && \
echo "" && \
echo "=== 5. Testando porta 3001 ===" && \
lsof -i:3001 || echo "Porta 3001 não está em uso" && \
echo "" && \
echo "=== 6. Verificando dist/ ===" && \
ls -la dist/ 2>/dev/null | head -3 || echo "Pasta dist/ não existe"
```

---

## 🚀 Testar Início Manual

**Execute para ver o erro real:**

```bash
cd /var/www/founder-dashboard
pm2 delete founder-dashboard 2>/dev/null || true
NODE_ENV=production PORT=3001 npm start
```

**Isso vai mostrar o erro diretamente!**

**Me envie o que aparecer e eu corrijo!**

---

## ✅ Próximos Passos

1. **Execute o comando de diagnóstico acima**
2. **Me envie o resultado** (especialmente os logs)
3. **Com isso, identifico o problema específico**

**Execute e me diga o que apareceu!**



