#!/bin/bash

# Script Completo - Resolve Tudo Automaticamente
# Execute na VPS: bash SCRIPT_RESOLVER_TUDO.sh

set -e

echo "🚀 Script Automático - Resolvendo Tudo..."
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH"

echo "1️⃣ Atualizando código..."
git stash || true
git fetch origin main
git reset --hard origin/main

echo ""
echo "2️⃣ Instalando dependências..."
npm install

echo ""
echo "3️⃣ Fazendo build..."
npm run build

echo ""
echo "4️⃣ Verificando/Corrigindo PM2..."

# Parar se estiver rodando
pm2 delete "$PM2_NAME" 2>/dev/null || true

# Iniciar novamente
pm2 start npm --name "$PM2_NAME" -- start
pm2 save

echo ""
echo "5️⃣ Aguardando servidor iniciar..."
sleep 8

echo ""
echo "6️⃣ Testando API..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Servidor está funcionando!"
    curl http://localhost:3001/api/health
    echo ""
else
    echo "❌ Servidor não está respondendo"
    echo ""
    echo "📋 Logs do servidor:"
    pm2 logs "$PM2_NAME" --lines 30 --nostream
    echo ""
    echo "⚠️  Verifique os logs acima para identificar o problema"
    exit 1
fi

echo ""
echo "7️⃣ Status final:"
pm2 status

echo ""
echo "✅ TUDO RESOLVIDO!"
echo ""
echo "🌐 Teste em: https://frtechltda.com.br/finance"
echo "🔑 Senha Flora: flora123"
echo "🔑 Senha Admin: 06092021"

