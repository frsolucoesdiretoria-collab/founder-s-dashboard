#!/bin/bash

# Script de Deploy Completo - Corrige o problema do vite
# Execute: bash DEPLOY_COMPLETO_VPS.sh

set -e

echo "🚀 Iniciando deploy completo..."
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH"

echo "📦 Atualizando código..."
git stash || true
git fetch origin main
git reset --hard origin/main

echo ""
echo "📥 Instalando TODAS as dependências (incluindo dev para build)..."
npm install

echo ""
echo "🔨 Fazendo build..."
npm run build

echo ""
echo "🔄 Reiniciando servidor..."
if pm2 list | grep -q "$PM2_NAME"; then
    pm2 restart "$PM2_NAME"
else
    pm2 start npm --name "$PM2_NAME" -- start
fi

pm2 save

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "🌐 Teste em: https://frtechltda.com.br/finance"
echo "🔑 Senha Flora: flora123"
echo "🔑 Senha Admin: 06092021"

