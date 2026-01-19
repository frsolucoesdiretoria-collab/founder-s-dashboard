# 🚨 SOLUÇÃO IMEDIATA - Execute na VPS

## ⚡ Problema Identificado

- ✅ Projeto encontrado em: `/var/www/founder-dashboard`
- ❌ Processo PM2 está em estado "errored"
- ❌ Servidor não está respondendo na porta 3001
- ❌ **CAUSA:** PM2 executando no diretório errado (`/root/` em vez de `/var/www/founder-dashboard`)

## 🚀 SOLUÇÃO RÁPIDA - Copie e Cole Tudo:

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && pm2 stop founder-dashboard 2>/dev/null || true && sleep 2 && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && [ ! -d "dist" ] && npm run build || echo "Build OK" && set -a && source .env.local && set +a && NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start && pm2 save && sleep 10 && pm2 list | grep founder-dashboard && curl http://localhost:3001/api/health && echo "" && pm2 logs founder-dashboard --lines 20 --nostream
```

## 🔧 OU Execute Estes Comandos (Um Por Vez)

### 1️⃣ Ir para o diretório correto

```bash
cd /var/www/founder-dashboard
```

### 2️⃣ Ver os logs do erro

```bash
pm2 logs founder-dashboard --lines 50
```

**Isso vai mostrar QUAL é o erro que está impedindo o servidor de iniciar.**

### 3️⃣ Parar processo com erro

```bash
pm2 delete founder-dashboard
```

### 4️⃣ Verificar se .env.local existe

```bash
ls -la .env.local
```

Se não existir, você precisa criá-lo (veja passo 5).

### 5️⃣ Verificar NOTION_TOKEN

```bash
grep "^NOTION_TOKEN=" .env.local
```

Se não aparecer nada, você precisa configurar o token.

### 6️⃣ Fazer build (se necessário)

```bash
# Verificar se dist existe
ls -la dist/

# Se não existir, fazer build
npm run build
```

### 7️⃣ Iniciar corretamente (COM --cwd!)

```bash
# Carregar variáveis de ambiente
set -a
source .env.local
set +a

# Verificar se NOTION_TOKEN foi carregado
echo "Token carregado: ${NOTION_TOKEN:0:20}..."

# Iniciar servidor COM DIRETÓRIO CORRETO (--cwd é ESSENCIAL!)
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start
pm2 save
```

### 8️⃣ Aguardar e verificar

```bash
# Aguardar 10 segundos
sleep 10

# Ver status
pm2 list | grep founder-dashboard

# Ver logs
pm2 logs founder-dashboard --lines 30

# Testar endpoint
curl http://localhost:3001/api/health
```

## 🆘 Se Ainda Não Funcionar

### Ver logs detalhados:

```bash
pm2 logs founder-dashboard --lines 100 --nostream
```

### Erros comuns e soluções:

#### Erro: "NOTION_TOKEN not configured"
```bash
# Editar .env.local
nano .env.local
# Adicionar: NOTION_TOKEN=seu_token_aqui
```

#### Erro: "Database not found"
```bash
# Verificar se database IDs estão configurados
grep "NOTION_DB_" .env.local
```

#### Erro: "Port 3001 already in use"
```bash
# Matar processo na porta
lsof -ti:3001 | xargs kill -9
```

#### Erro: "dist directory not found"
```bash
# Fazer build
npm run build
```

## 📋 Comando Completo (Copiar e Colar)

```bash
cd /var/www/founder-dashboard && \
pm2 delete founder-dashboard 2>/dev/null || true && \
pm2 logs founder-dashboard --lines 50 --nostream 2>/dev/null || echo "Sem logs anteriores" && \
echo "=== Verificando configuração ===" && \
[ -f .env.local ] && echo "✅ .env.local existe" || echo "❌ .env.local NÃO existe" && \
grep -q "^NOTION_TOKEN=" .env.local && echo "✅ NOTION_TOKEN configurado" || echo "❌ NOTION_TOKEN NÃO configurado" && \
[ -d "dist" ] && echo "✅ dist existe" || (echo "⚠️  dist não existe, fazendo build..." && npm run build) && \
echo "=== Iniciando servidor ===" && \
set -a && source .env.local && set +a && \
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start && \
pm2 save && \
sleep 10 && \
echo "=== Verificando status ===" && \
pm2 list | grep founder-dashboard && \
echo "=== Testando endpoint ===" && \
curl http://localhost:3001/api/health && \
echo "" && \
echo "=== Logs recentes ===" && \
pm2 logs founder-dashboard --lines 20 --nostream
```

## ✅ Resultado Esperado

Após executar, você deve ver:

```
✅ PM2 status: founder-dashboard | online
✅ Health check: {"status":"ok","timestamp":"..."}
✅ Site acessível: https://frtechltda.com.br
```

## 🔍 Próximo Passo

**Execute primeiro o comando do passo 2 para ver os logs do erro!**

Isso vai mostrar exatamente qual é o problema que está impedindo o servidor de iniciar.

