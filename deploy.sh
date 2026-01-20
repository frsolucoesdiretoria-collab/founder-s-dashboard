#!/bin/bash

# Script de Deploy Automático - Founder's Dashboard
# Execute na VPS: bash deploy.sh

set -e

echo "🚀 Iniciando deploy do Founder's Dashboard..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

# Verificar se está no diretório correto
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Diretório do projeto não encontrado: $PROJECT_PATH${NC}"
    echo "   Execute este script na VPS no diretório do projeto"
    exit 1
fi

cd "$PROJECT_PATH"

echo "📦 Atualizando código do repositório..."
git fetch origin main
git reset --hard origin/main

echo ""
echo "📥 Instalando dependências..."
npm install

echo ""
echo "🔨 Fazendo build da aplicação..."
npm run build

echo ""
echo "🔄 Reiniciando aplicação com PM2..."

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 não encontrado, instalando...${NC}"
    npm install -g pm2
fi

# Reiniciar ou iniciar aplicação
if pm2 list | grep -q "$PM2_NAME"; then
    echo "   Reiniciando aplicação existente..."
    pm2 restart "$PM2_NAME"
else
    echo "   Iniciando nova aplicação..."
    pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Últimos logs:"
pm2 logs "$PM2_NAME" --lines 10 --nostream || true

echo ""
echo "🔍 Testando API..."
sleep 2
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API está respondendo!${NC}"
else
    echo -e "${YELLOW}⚠️  API pode estar iniciando ainda...${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deploy finalizado!${NC}"
echo ""
echo "🌐 Site disponível em: https://frtechltda.com.br/finance"
echo "🔑 Nova senha da página inicial: 1000000000"
echo ""
echo "💡 Para ver logs em tempo real: pm2 logs $PM2_NAME"
echo "💡 Para ver status: pm2 status"

