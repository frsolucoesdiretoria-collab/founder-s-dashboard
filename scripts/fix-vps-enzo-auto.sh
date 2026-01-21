#!/bin/bash

# Script Automático - Corrigir Dashboard Enzo na VPS (Modo Não-Interativo)
# Execute este script na VPS para corrigir automaticamente sem interação

set -e  # Parar em caso de erro

echo "🚀 CORREÇÃO AUTOMÁTICA - Dashboard Enzo na VPS (Modo Automático)"
echo "=================================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto${NC}"
    exit 1
fi

PROJECT_DIR=$(pwd)
echo -e "${BLUE}📁 Diretório: $PROJECT_DIR${NC}"
echo ""

# IDs corretos das databases do Enzo
KPIS_ID="2ed84566a5fa81299c07c412630f9aa4"
GOALS_ID="2ed84566a5fa81ada870cf698ec50bf0"
ACTIONS_ID="2ed84566a5fa81c4a8cbc23841abdc1e"
CONTACTS_ID="2ed84566a5fa81a7bf7afeaa38ea6eff"

# Verificar/criar .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local não encontrado, criando...${NC}"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
    else
        touch .env.local
    fi
fi

# Adicionar databases do Enzo se não existirem
ADDED=0

if ! grep -q "^NOTION_DB_KPIS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_KPIS_ENZO...${NC}"
    echo "" >> .env.local
    echo "# Enzo Canei Dashboard Databases" >> .env.local
    echo "NOTION_DB_KPIS_ENZO=$KPIS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_GOALS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_GOALS_ENZO...${NC}"
    echo "NOTION_DB_GOALS_ENZO=$GOALS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_ACTIONS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_ACTIONS_ENZO...${NC}"
    echo "NOTION_DB_ACTIONS_ENZO=$ACTIONS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_CONTACTS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_CONTACTS_ENZO...${NC}"
    echo "NOTION_DB_CONTACTS_ENZO=$CONTACTS_ID" >> .env.local
    ADDED=1
fi

if [ $ADDED -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as databases do Enzo já estão configuradas${NC}"
else
    echo -e "${GREEN}✅ $ADDED database(s) do Enzo adicionada(s)${NC}"
fi

echo ""

# Reiniciar servidor PM2
if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "founder-dashboard"; then
        echo -e "${YELLOW}🔄 Reiniciando servidor PM2...${NC}"
        pm2 restart founder-dashboard >/dev/null 2>&1
        sleep 5
        echo -e "${GREEN}✅ Servidor reiniciado${NC}"
    else
        echo -e "${YELLOW}🔄 Iniciando servidor PM2...${NC}"
        NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start >/dev/null 2>&1
        pm2 save >/dev/null 2>&1
        sleep 5
        echo -e "${GREEN}✅ Servidor iniciado${NC}"
    fi
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
    exit 1
fi

echo ""

# Testar endpoints
echo -e "${BLUE}🔍 Testando endpoints...${NC}"

sleep 2

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ /api/health OK${NC}"
else
    echo -e "${RED}❌ /api/health falhou (status: $HEALTH)${NC}"
fi

KPIS_COUNT=$(curl -s http://localhost:3001/api/enzo/kpis 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
if [ "$KPIS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ /api/enzo/kpis retornou $KPIS_COUNT KPI(s)${NC}"
else
    echo -e "${YELLOW}⚠️  /api/enzo/kpis retornou array vazio${NC}"
fi

GOALS_COUNT=$(curl -s http://localhost:3001/api/enzo/goals 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
if [ "$GOALS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ /api/enzo/goals retornou $GOALS_COUNT goal(s)${NC}"
else
    echo -e "${YELLOW}⚠️  /api/enzo/goals retornou array vazio ou erro${NC}"
fi

echo ""
echo -e "${GREEN}✅ Correção automática concluída!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse: https://frtechltda.com.br/dashboard-enzo"
echo "   2. Verifique se os KPIs aparecem com dados"
echo ""






