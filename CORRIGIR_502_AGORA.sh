#!/bin/bash
# Script para corrigir erro 502 - EXECUTE ISSO NA VPS

set -e  # Parar em caso de erro

PROJECT_PATH="/var/www/founder-dashboard"

echo "🔧 CORRIGINDO ERRO 502 BAD GATEWAY"
echo "=================================="
echo ""

# Verificar se diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório não encontrado: $PROJECT_PATH"
    exit 1
fi

cd "$PROJECT_PATH" || exit 1
echo "✅ Diretório: $PROJECT_PATH"

# 1. Parar tudo
echo ""
echo "1️⃣  Parando processos antigos..."
pm2 delete founder-dashboard 2>/dev/null || true
pm2 stop founder-dashboard 2>/dev/null || true
sleep 3

# Matar qualquer processo na porta 3001
echo "   Liberando porta 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# 2. Verificar configuração
echo ""
echo "2️⃣  Verificando configuração..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local não encontrado!"
    exit 1
fi

if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    echo "⚠️  NOTION_TOKEN pode não estar configurado corretamente"
    echo "   Verifique o arquivo .env.local"
fi

# 3. Build
echo ""
echo "3️⃣  Verificando build..."
if [ ! -d "dist" ]; then
    echo "⚠️  Fazendo build..."
    npm run build || {
        echo "❌ Erro ao fazer build"
        exit 1
    }
fi

# 4. Carregar variáveis
echo ""
echo "4️⃣  Carregando variáveis de ambiente..."
set -a
source .env.local
set +a

if [ -z "$NOTION_TOKEN" ]; then
    echo "❌ NOTION_TOKEN não foi carregado!"
    exit 1
fi

# 5. Iniciar PM2
echo ""
echo "5️⃣  Iniciando servidor..."
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "$PROJECT_PATH" -- start
pm2 save

# 6. Aguardar
echo ""
echo "⏳ Aguardando servidor iniciar (15 segundos)..."
sleep 15

# 7. Verificar status
echo ""
echo "6️⃣  Verificando status..."
PM2_STATUS=$(pm2 list | grep founder-dashboard | awk '{print $10}')

if [ "$PM2_STATUS" != "online" ]; then
    echo "❌ PM2 não está online! Status: $PM2_STATUS"
    echo ""
    echo "📋 Logs do erro:"
    pm2 logs founder-dashboard --lines 50 --nostream
    exit 1
fi

echo "✅ PM2 está online"

# 8. Testar endpoint
echo ""
echo "7️⃣  Testando endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo "❌ Health check falhou! Status: $HEALTH_RESPONSE"
    echo ""
    echo "📋 Tentando curl completo:"
    curl -v http://localhost:3001/api/health || true
    echo ""
    echo "📋 Logs:"
    pm2 logs founder-dashboard --lines 30 --nostream
    exit 1
fi

echo "✅ Health check OK"

# 9. Verificar porta
echo ""
echo "8️⃣  Verificando porta 3001..."
if ! lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  Porta 3001 não está em uso (mas PM2 diz que está online)"
    echo "   Isso pode indicar um problema"
fi

# Resumo
echo ""
echo "================================"
echo "✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "📊 Status:"
pm2 list | grep founder-dashboard
echo ""
echo "🌐 Teste: https://frtechltda.com.br/dashboard"
echo ""
echo "📋 Para ver logs: pm2 logs founder-dashboard"






