#!/bin/bash

# Diagnóstico Completo - Erro 502
# Execute na VPS: bash DIAGNOSTICO_COMPLETO_502.sh

set -e

echo "🔍 DIAGNÓSTICO COMPLETO - Erro 502"
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH"

echo "1️⃣ Verificando PM2..."
pm2 status

echo ""
echo "2️⃣ Verificando logs detalhados (últimas 50 linhas)..."
pm2 logs "$PM2_NAME" --lines 50 --nostream

echo ""
echo "3️⃣ Verificando se porta 3001 está em uso..."
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✅ Porta 3001 está em uso"
    lsof -i:3001
else
    echo "❌ Porta 3001 NÃO está em uso"
fi

echo ""
echo "4️⃣ Verificando variáveis de ambiente..."
if [ -f .env ]; then
    echo "✅ Arquivo .env existe"
    if grep -q "NOTION_TOKEN" .env; then
        echo "✅ NOTION_TOKEN configurado"
    else
        echo "❌ NOTION_TOKEN NÃO configurado"
    fi
    if grep -q "NOTION_DB_KPIS" .env; then
        echo "✅ NOTION_DB_KPIS configurado"
    else
        echo "❌ NOTION_DB_KPIS NÃO configurado"
    fi
else
    echo "❌ Arquivo .env NÃO existe"
fi

echo ""
echo "5️⃣ Verificando se dist/ existe..."
if [ -d dist ]; then
    echo "✅ Pasta dist/ existe"
    ls -la dist/ | head -5
else
    echo "❌ Pasta dist/ NÃO existe"
    echo "   Execute: npm run build"
fi

echo ""
echo "6️⃣ Testando servidor manualmente..."
echo "   Parando PM2..."
pm2 delete "$PM2_NAME" 2>/dev/null || true
sleep 2

echo "   Iniciando manualmente para ver erros..."
cd "$PROJECT_PATH"
NODE_ENV=production PORT=3001 npm start 2>&1 | head -30 &
MANUAL_PID=$!

sleep 5

if kill -0 $MANUAL_PID 2>/dev/null; then
    echo "✅ Servidor iniciou manualmente"
    curl -s http://localhost:3001/api/health || echo "❌ API não responde"
    kill $MANUAL_PID 2>/dev/null || true
else
    echo "❌ Servidor NÃO iniciou manualmente"
    echo "   Veja os logs acima para identificar o erro"
fi

echo ""
echo "7️⃣ Reiniciando com PM2..."
pm2 start npm --name "$PM2_NAME" -- start
pm2 save

echo ""
echo "📊 Status final:"
pm2 status

echo ""
echo "📋 Logs finais:"
pm2 logs "$PM2_NAME" --lines 30 --nostream



