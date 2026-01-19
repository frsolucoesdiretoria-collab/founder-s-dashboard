#!/bin/bash

# Script de Deploy Completo - Página Financeiro
# Execute este script na VPS: bash DEPLOY_AGORA_VPS.sh

set -e  # Para em caso de erro

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

# Verificar se está conectado como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Aviso: Recomendado executar como root${NC}"
fi

# Verificar se o diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Diretório do projeto não encontrado: $PROJECT_PATH${NC}"
    echo "   Criando diretório..."
    mkdir -p "$PROJECT_PATH"
    cd "$PROJECT_PATH"
    
    # Se não tem .git, clonar repositório
    if [ ! -d ".git" ]; then
        echo "   Clonando repositório..."
        cd /var/www
        git clone https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard.git founder-dashboard
        cd "$PROJECT_PATH"
        git checkout main
    fi
else
    cd "$PROJECT_PATH"
fi

echo ""
echo "📦 Fazendo pull do código mais recente..."
git pull origin main || {
    echo -e "${YELLOW}⚠️  Aviso: Falha ao fazer pull (pode ser normal se já estiver atualizado)${NC}"
}

echo ""
echo "📥 Instalando/atualizando dependências..."
npm install --production

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
    pm2 start npm --name "$PM2_NAME" -- start
fi

pm2 save

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Últimos logs:"
pm2 logs "$PM2_NAME" --lines 15 --nostream || true

echo ""
echo "🔍 Testando API..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ API está respondendo!${NC}"
    curl -s http://localhost:3001/api/health | head -1
else
    echo -e "${RED}❌ API não está respondendo${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deploy finalizado com sucesso!${NC}"
echo ""
echo "🌐 Site disponível em: https://frtechltda.com.br/finance"
echo "🔑 Senha para a Flora: flora123"
echo ""
echo "💡 Para ver logs em tempo real: pm2 logs $PM2_NAME"
echo "💡 Para ver status: pm2 status"

