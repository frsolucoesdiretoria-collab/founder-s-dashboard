#!/bin/bash

# Script de Diagnóstico para VPS - Dashboard Enzo
# Execute este script na VPS para diagnosticar problemas

echo "🔍 DIAGNÓSTICO VPS - Dashboard Enzo"
echo "===================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar se está no diretório correto
echo "📁 1. Verificando diretório do projeto..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
    PROJECT_DIR=$(pwd)
    echo "   Diretório: $PROJECT_DIR"
else
    echo -e "${RED}❌ package.json não encontrado. Execute este script no diretório raiz do projeto.${NC}"
    exit 1
fi
echo ""

# 2. Verificar status do PM2
echo "🔄 2. Verificando status do PM2..."
if command_exists pm2; then
    PM2_STATUS=$(pm2 list | grep -i "founder-dashboard" || echo "NOT_FOUND")
    if [[ "$PM2_STATUS" == *"online"* ]]; then
        echo -e "${GREEN}✅ Servidor PM2 está rodando${NC}"
        pm2 list | grep -i "founder-dashboard"
    else
        echo -e "${RED}❌ Servidor PM2 não está rodando ou não encontrado${NC}"
        pm2 list
    fi
else
    echo -e "${YELLOW}⚠️  PM2 não está instalado${NC}"
fi
echo ""

# 3. Verificar arquivo .env.local
echo "⚙️  3. Verificando arquivo .env.local..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local encontrado${NC}"
    
    # Verificar NOTION_TOKEN
    if grep -q "NOTION_TOKEN=" .env.local && ! grep -q "NOTION_TOKEN=<<<" .env.local; then
        TOKEN_LINE=$(grep "NOTION_TOKEN=" .env.local | head -1)
        TOKEN_PREFIX=$(echo "$TOKEN_LINE" | cut -d'=' -f2 | cut -c1-10)
        echo -e "${GREEN}✅ NOTION_TOKEN configurado (prefixo: $TOKEN_PREFIX...)${NC}"
    else
        echo -e "${RED}❌ NOTION_TOKEN não configurado ou está com placeholder${NC}"
    fi
    
    # Verificar databases do Enzo
    echo "   Verificando databases do Enzo:"
    if grep -q "NOTION_DB_KPIS_ENZO=" .env.local; then
        KPIS_ID=$(grep "NOTION_DB_KPIS_ENZO=" .env.local | cut -d'=' -f2)
        if [ ${#KPIS_ID} -eq 32 ]; then
            echo -e "${GREEN}   ✅ NOTION_DB_KPIS_ENZO: $KPIS_ID${NC}"
        else
            echo -e "${YELLOW}   ⚠️  NOTION_DB_KPIS_ENZO tem formato inválido (esperado 32 chars)${NC}"
        fi
    else
        echo -e "${RED}   ❌ NOTION_DB_KPIS_ENZO não configurado${NC}"
    fi
    
    if grep -q "NOTION_DB_GOALS_ENZO=" .env.local; then
        GOALS_ID=$(grep "NOTION_DB_GOALS_ENZO=" .env.local | cut -d'=' -f2)
        if [ ${#GOALS_ID} -eq 32 ]; then
            echo -e "${GREEN}   ✅ NOTION_DB_GOALS_ENZO: $GOALS_ID${NC}"
        else
            echo -e "${YELLOW}   ⚠️  NOTION_DB_GOALS_ENZO tem formato inválido${NC}"
        fi
    else
        echo -e "${RED}   ❌ NOTION_DB_GOALS_ENZO não configurado${NC}"
    fi
    
    if grep -q "NOTION_DB_ACTIONS_ENZO=" .env.local; then
        ACTIONS_ID=$(grep "NOTION_DB_ACTIONS_ENZO=" .env.local | cut -d'=' -f2)
        if [ ${#ACTIONS_ID} -eq 32 ]; then
            echo -e "${GREEN}   ✅ NOTION_DB_ACTIONS_ENZO: $ACTIONS_ID${NC}"
        else
            echo -e "${YELLOW}   ⚠️  NOTION_DB_ACTIONS_ENZO tem formato inválido${NC}"
        fi
    else
        echo -e "${RED}   ❌ NOTION_DB_ACTIONS_ENZO não configurado${NC}"
    fi
    
    if grep -q "NOTION_DB_CONTACTS_ENZO=" .env.local; then
        CONTACTS_ID=$(grep "NOTION_DB_CONTACTS_ENZO=" .env.local | cut -d'=' -f2)
        if [ ${#CONTACTS_ID} -eq 32 ]; then
            echo -e "${GREEN}   ✅ NOTION_DB_CONTACTS_ENZO: $CONTACTS_ID${NC}"
        else
            echo -e "${YELLOW}   ⚠️  NOTION_DB_CONTACTS_ENZO tem formato inválido${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠️  NOTION_DB_CONTACTS_ENZO não configurado (opcional)${NC}"
    fi
else
    echo -e "${RED}❌ .env.local não encontrado${NC}"
fi
echo ""

# 4. Verificar se porta 3001 está em uso
echo "🔌 4. Verificando porta 3001..."
if command_exists lsof; then
    PORT_CHECK=$(lsof -ti:3001 2>/dev/null)
    if [ -n "$PORT_CHECK" ]; then
        echo -e "${GREEN}✅ Porta 3001 está em uso (PID: $PORT_CHECK)${NC}"
    else
        echo -e "${RED}❌ Porta 3001 não está em uso${NC}"
    fi
elif command_exists netstat; then
    PORT_CHECK=$(netstat -tuln | grep ":3001" || echo "")
    if [ -n "$PORT_CHECK" ]; then
        echo -e "${GREEN}✅ Porta 3001 está em uso${NC}"
    else
        echo -e "${RED}❌ Porta 3001 não está em uso${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Não foi possível verificar a porta (lsof/netstat não disponível)${NC}"
fi
echo ""

# 5. Testar endpoints localmente
echo "🌐 5. Testando endpoints da API..."
if command_exists curl; then
    echo "   Testando /api/health..."
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        echo -e "${GREEN}   ✅ /api/health respondeu com status 200${NC}"
        curl -s http://localhost:3001/api/health | head -c 100
        echo ""
    else
        echo -e "${RED}   ❌ /api/health não respondeu (status: $HEALTH_RESPONSE)${NC}"
    fi
    
    echo "   Testando /api/enzo/kpis..."
    KPIS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/enzo/kpis 2>/dev/null)
    if [ "$KPIS_RESPONSE" = "200" ]; then
        KPIS_COUNT=$(curl -s http://localhost:3001/api/enzo/kpis | grep -o '"id"' | wc -l)
        echo -e "${GREEN}   ✅ /api/enzo/kpis respondeu com status 200 (${KPIS_COUNT} KPIs)${NC}"
    else
        echo -e "${RED}   ❌ /api/enzo/kpis não respondeu corretamente (status: $KPIS_RESPONSE)${NC}"
        echo "   Resposta:"
        curl -s http://localhost:3001/api/enzo/kpis | head -c 200
        echo ""
    fi
    
    echo "   Testando /api/enzo/goals..."
    GOALS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/enzo/goals 2>/dev/null)
    if [ "$GOALS_RESPONSE" = "200" ]; then
        GOALS_COUNT=$(curl -s http://localhost:3001/api/enzo/goals | grep -o '"id"' | wc -l)
        echo -e "${GREEN}   ✅ /api/enzo/goals respondeu com status 200 (${GOALS_COUNT} goals)${NC}"
    else
        echo -e "${RED}   ❌ /api/enzo/goals não respondeu corretamente (status: $GOALS_RESPONSE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl não está disponível para testar endpoints${NC}"
fi
echo ""

# 6. Verificar build de produção
echo "📦 6. Verificando build de produção..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Pasta dist/ existe${NC}"
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    DIST_FILES=$(find dist -type f | wc -l)
    DIST_MODIFIED=$(stat -c %y dist 2>/dev/null || stat -f "%Sm" dist 2>/dev/null || echo "N/A")
    echo "   Tamanho: $DIST_SIZE"
    echo "   Arquivos: $DIST_FILES"
    echo "   Última modificação: $DIST_MODIFIED"
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}   ✅ dist/index.html existe${NC}"
    else
        echo -e "${RED}   ❌ dist/index.html não encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Pasta dist/ não existe. Execute: npm run build${NC}"
fi
echo ""

# 7. Verificar logs do PM2
echo "📋 7. Últimas linhas dos logs do PM2..."
if command_exists pm2; then
    if pm2 list | grep -q "founder-dashboard"; then
        echo "   Logs (últimas 20 linhas):"
        pm2 logs founder-dashboard --lines 20 --nostream 2>/dev/null | tail -20 || echo "   Não foi possível ler logs"
    else
        echo -e "${YELLOW}   ⚠️  Processo founder-dashboard não encontrado no PM2${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  PM2 não está instalado${NC}"
fi
echo ""

# 8. Verificar Node.js e npm
echo "🟢 8. Verificando Node.js e npm..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado${NC}"
fi
echo ""

# Resumo
echo "===================================="
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "===================================="
echo ""
echo "Próximos passos recomendados:"
echo "1. Se .env.local estiver incompleto, configure as variáveis faltantes"
echo "2. Se o servidor não estiver rodando, execute: pm2 start npm --name 'founder-dashboard' -- start"
echo "3. Se o build estiver desatualizado, execute: npm run build"
echo "4. Se os endpoints não responderem, verifique os logs: pm2 logs founder-dashboard"
echo ""
echo "Para mais informações, consulte: README_ENZO_SETUP.md"
echo ""

