# 🔧 Solução: Erro 502 Bad Gateway

## ❌ Problema

O site está dando erro **502 Bad Gateway** após o deploy.

**Causa comum:** O servidor Node.js não está rodando ou não está respondendo corretamente.

---

## ✅ Solução Rápida

### **Passo 1: Diagnosticar o problema**

Execute na VPS:

```bash
cd /var/www/founder-dashboard && pm2 status && curl -s http://localhost:3001/api/health && pm2 logs founder-dashboard --lines 20 --nostream
```

**Isso vai mostrar:**
- Se o PM2 está rodando
- Se a API está respondendo
- Últimos logs (para ver erros)

### **Passo 2: Reiniciar o servidor**

Execute na VPS:

```bash
cd /var/www/founder-dashboard
pm2 restart founder-dashboard
pm2 save
```

### **Passo 3: Verificar logs**

Execute na VPS:

```bash
pm2 logs founder-dashboard --lines 50
```

**Procure por erros:**
- ❌ "Missing required environment variable"
- ❌ "NOTION_TOKEN not configured"
- ❌ "Port 3001 already in use"
- ❌ Erros de conexão com Notion

---

## 🔍 Diagnóstico Completo

Execute na VPS (copie e cole tudo):

```bash
cd /var/www/founder-dashboard && \
echo "=== 1. Verificando PM2 ===" && \
pm2 status && \
echo "" && \
echo "=== 2. Testando API local ===" && \
curl -s http://localhost:3001/api/health || echo "❌ API não responde" && \
echo "" && \
echo "=== 3. Verificando porta 3001 ===" && \
lsof -ti:3001 || echo "❌ Porta 3001 não está em uso" && \
echo "" && \
echo "=== 4. Verificando .env ===" && \
cat .env | grep -E "NOTION_TOKEN|PORT|NODE_ENV" | head -3 && \
echo "" && \
echo "=== 5. Últimos logs ===" && \
pm2 logs founder-dashboard --lines 30 --nostream
```

---

## 🔧 Soluções Comuns

### Problema 1: Servidor não está rodando

**Solução:**
```bash
cd /var/www/founder-dashboard
pm2 start npm --name "founder-dashboard" -- start
pm2 save
```

### Problema 2: Erro ao iniciar (variáveis de ambiente)

**Verifique:**
```bash
cd /var/www/founder-dashboard
cat .env | grep NOTION_TOKEN
```

**Se não tiver NOTION_TOKEN, adicione:**
```bash
nano .env
# Adicione: NOTION_TOKEN=seu_token_aqui
```

**Depois reinicie:**
```bash
pm2 restart founder-dashboard
```

### Problema 3: Porta 3001 já está em uso

**Solução:**
```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9

# Reiniciar PM2
pm2 restart founder-dashboard
```

### Problema 4: Erro no código (crashes ao iniciar)

**Verifique logs:**
```bash
pm2 logs founder-dashboard --lines 50
```

**Se houver erro, me envie os logs.**

---

## 🚀 Solução Completa (Passo a Passo)

Execute na VPS (UM comando por vez):

### **1. Verificar status**
```bash
pm2 status
```

### **2. Ver logs**
```bash
pm2 logs founder-dashboard --lines 50 --nostream
```

### **3. Testar API**
```bash
curl http://localhost:3001/api/health
```

### **4. Se não responder, reiniciar**
```bash
pm2 restart founder-dashboard
sleep 5
curl http://localhost:3001/api/health
```

### **5. Se ainda não funcionar, recomeçar**
```bash
pm2 delete founder-dashboard
cd /var/www/founder-dashboard
pm2 start npm --name "founder-dashboard" -- start
pm2 save
pm2 logs founder-dashboard --lines 20
```

---

## 📋 Comando Único para Tudo

Execute na VPS (copie e cole):

```bash
cd /var/www/founder-dashboard && pm2 restart founder-dashboard && sleep 5 && curl http://localhost:3001/api/health && echo "" && echo "✅ Se apareceu 'status: ok' acima, o servidor está funcionando!" && pm2 status
```

---

## ❓ Se ainda não funcionar

1. **Me envie os logs:**
   ```bash
   pm2 logs founder-dashboard --lines 50
   ```

2. **Me envie o status:**
   ```bash
   pm2 status
   ```

3. **Me envie o resultado do teste:**
   ```bash
   curl http://localhost:3001/api/health
   ```

Com essas informações, consigo identificar o problema específico!

