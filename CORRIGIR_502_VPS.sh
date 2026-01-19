#!/bin/bash

# Script para Corrigir Erro 502 Bad Gateway
# Execute na VPS: bash CORRIGIR_502_VPS.sh

set -e

echo "🔍 Diagnosticando erro 502 Bad Gateway..."
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH"

echo "1️⃣ Verificando status do PM2..."
pm2 status

echo ""
echo "2️⃣ Verificando se o servidor está respondendo na porta 3001..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Servidor está respondendo!"
    curl http://localhost:3001/api/health
else
    echo "❌ Servidor NÃO está respondendo na porta 3001"
fi

echo ""
echo "3️⃣ Verificando se a porta 3001 está em uso..."
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✅ Porta 3001 está em uso"
    lsof -ti:3001 | head -1
else
    echo "❌ Porta 3001 NÃO está em uso"
fi

echo ""
echo "4️⃣ Verificando logs do PM2 (últimas 30 linhas)..."
pm2 logs "$PM2_NAME" --lines 30 --nostream

echo ""
echo "5️⃣ Verificando variáveis de ambiente..."
if [ -f .env ]; then
    echo "✅ Arquivo .env existe"
    if grep -q "NOTION_TOKEN" .env; then
        echo "✅ NOTION_TOKEN configurado"
    else
        echo "❌ NOTION_TOKEN NÃO configurado"
    fi
else
    echo "❌ Arquivo .env NÃO existe"
fi

echo ""
echo "6️⃣ Tentando reiniciar o servidor..."
pm2 restart "$PM2_NAME"
sleep 3

echo ""
echo "7️⃣ Verificando novamente..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Servidor está respondendo após reiniciar!"
    curl http://localhost:3001/api/health
else
    echo "❌ Servidor ainda não está respondendo"
    echo ""
    echo "📋 Verifique os logs acima para ver o erro específico"
fi

echo ""
echo "📊 Status final do PM2:"
pm2 status

