#!/bin/bash

# Script para resolver conflitos git e fazer deploy na VPS
# Execute: bash RESOLVER_E_DEPLOYAR_VPS.sh

set -e

echo "🚀 Resolvendo conflitos e fazendo deploy..."
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH"

echo "📦 Verificando status do git..."
git status

echo ""
echo "🔄 Fazendo backup das mudanças locais (se houver)..."
git stash || echo "   Nenhuma mudança local para fazer backup"

echo ""
echo "📥 Forçando atualização do repositório..."
git fetch origin main

echo ""
echo "🔄 Resetando para versão do GitHub (descartando mudanças locais)..."
git reset --hard origin/main

echo ""
echo "✅ Repositório atualizado!"

echo ""
echo "📥 Instalando/atualizando dependências..."
npm install --production

echo ""
echo "🔨 Fazendo build da aplicação..."
npm run build

echo ""
echo "🔄 Reiniciando aplicação com PM2..."

if pm2 list | grep -q "$PM2_NAME"; then
    pm2 restart "$PM2_NAME"
else
    pm2 start npm --name "$PM2_NAME" -- start
fi

pm2 save

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Últimos logs:"
pm2 logs "$PM2_NAME" --lines 10 --nostream || true

echo ""
echo "🔍 Testando API..."
curl -s http://localhost:3001/api/health && echo "" || echo "❌ API não está respondendo"

echo ""
echo "🌐 Site disponível em: https://frtechltda.com.br/finance"
echo "🔑 Senha para a Flora: flora123"

