#!/bin/bash

# Script de Deploy Rápido - Founder's Dashboard
# Execute este script na VPS para fazer deploy da versão mais recente

set -e  # Para em caso de erro

echo "🚀 Iniciando deploy do Founder's Dashboard..."
echo ""

# Configurações
PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

# Verificar se está no diretório correto
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório do projeto não encontrado: $PROJECT_PATH"
    echo "   Verifique o caminho do projeto na VPS"
    exit 1
fi

cd "$PROJECT_PATH"

echo "📦 Fazendo pull do código mais recente do GitHub..."
git pull origin main

echo ""
echo "📥 Instalando/atualizando dependências (incluindo dev dependencies para build)..."
npm install

echo ""
echo "🔨 Fazendo build da aplicação..."
npm run build

echo ""
echo "🔄 Reiniciando aplicação com PM2..."
pm2 restart "$PM2_NAME" || {
    echo "⚠️  Aplicação não estava rodando, iniciando..."
    pm2 start ecosystem.config.cjs
}

pm2 save

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "🔍 Testando API..."
sleep 2
curl -s http://localhost:3001/api/health && echo "" || echo "⚠️  API pode estar iniciando ainda..."

echo ""
echo "✅ Deploy finalizado com sucesso!"
echo "🌐 Site disponível em: https://frtechltda.com.br/finance"
echo ""
echo "📋 Para ver logs em tempo real: pm2 logs $PM2_NAME"
echo ""

