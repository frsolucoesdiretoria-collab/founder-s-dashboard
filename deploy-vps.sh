#!/bin/bash

# Script de Deploy para VPS - Founder's Dashboard
# Execute este script na VPS: bash deploy-vps.sh

set -e  # Para em caso de erro

echo "🚀 Iniciando deploy do Founder's Dashboard..."
echo ""

# Configurações
PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

# Verificar se está no diretório correto
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório do projeto não encontrado: $PROJECT_PATH"
    echo "   Execute primeiro a configuração inicial da VPS"
    exit 1
fi

cd "$PROJECT_PATH"

echo "📦 Fazendo pull do código mais recente..."
git pull origin main || {
    echo "⚠️  Aviso: Falha ao fazer pull (pode ser normal se já estiver atualizado)"
}

echo ""
echo "📥 Instalando/atualizando dependências..."
npm install --production

echo ""
echo "🔨 Fazendo build da aplicação..."
npm run build

echo ""
echo "🔄 Reiniciando aplicação com PM2..."
pm2 restart "$PM2_NAME" || {
    echo "⚠️  Aplicação não estava rodando, iniciando..."
    pm2 start npm --name "$PM2_NAME" -- start
}

pm2 save

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Últimos logs (pressione Ctrl+C para sair):"
echo "   Para ver logs completos: pm2 logs $PM2_NAME"
pm2 logs "$PM2_NAME" --lines 20 --nostream

echo ""
echo "🔍 Testando API..."
curl -s http://localhost:3001/api/health && echo "" || echo "❌ API não está respondendo"

echo ""
echo "✅ Deploy finalizado com sucesso!"
echo "🌐 Site disponível em: https://frtechltda.com.br/finance"
echo ""

