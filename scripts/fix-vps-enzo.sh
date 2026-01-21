#!/bin/bash

# Script Master - Corrigir Dashboard Enzo na VPS
# Execute este script na VPS para corrigir automaticamente o problema

set -e  # Parar em caso de erro

echo "🚀 CORREÇÃO AUTOMÁTICA - Dashboard Enzo na VPS"
echo "================================================"
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

# ============================================
# PASSO 1: Executar Diagnóstico
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 1: Executando Diagnóstico${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

if [ -f "scripts/diagnose-vps.sh" ]; then
    bash scripts/diagnose-vps.sh
else
    echo -e "${YELLOW}⚠️  Script de diagnóstico não encontrado, continuando...${NC}"
fi

echo ""
read -p "Pressione ENTER para continuar ou Ctrl+C para cancelar..."
echo ""

# ============================================
# PASSO 2: Verificar .env.local
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 2: Verificando .env.local${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local não encontrado!${NC}"
    echo -e "${YELLOW}⚠️  Criando .env.local a partir de env.local.example...${NC}"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo -e "${YELLOW}⚠️  IMPORTANTE: Você precisa configurar NOTION_TOKEN manualmente!${NC}"
    else
        echo -e "${RED}❌ env.local.example também não encontrado!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.local encontrado${NC}"
fi

echo ""

# ============================================
# PASSO 3: Verificar NOTION_TOKEN
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 3: Verificando NOTION_TOKEN${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

NOTION_TOKEN=$(grep "^NOTION_TOKEN=" .env.local | cut -d'=' -f2 || echo "")

if [ -z "$NOTION_TOKEN" ] || [[ "$NOTION_TOKEN" == *"<<"* ]] || [[ "$NOTION_TOKEN" == *"SET"* ]]; then
    echo -e "${RED}❌ NOTION_TOKEN não está configurado ou tem placeholder!${NC}"
    echo -e "${YELLOW}⚠️  Você precisa configurar NOTION_TOKEN manualmente no .env.local${NC}"
    echo -e "${YELLOW}⚠️  Obtenha o token em: https://www.notion.so/my-integrations${NC}"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Ss]$ ]]; then
        echo "Cancelado."
        exit 1
    fi
else
    TOKEN_PREFIX=$(echo "$NOTION_TOKEN" | cut -c1-10)
    echo -e "${GREEN}✅ NOTION_TOKEN configurado (prefixo: $TOKEN_PREFIX...)${NC}"
fi

echo ""

# ============================================
# PASSO 4: Adicionar Databases do Enzo
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 4: Configurando Databases do Enzo${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# IDs corretos das databases do Enzo
KPIS_ID="2ed84566a5fa81299c07c412630f9aa4"
GOALS_ID="2ed84566a5fa81ada870cf698ec50bf0"
ACTIONS_ID="2ed84566a5fa81c4a8cbc23841abdc1e"
CONTACTS_ID="2ed84566a5fa81a7bf7afeaa38ea6eff"

ADDED_COUNT=0

# Verificar e adicionar KPIS_ENZO
if ! grep -q "^NOTION_DB_KPIS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_KPIS_ENZO...${NC}"
    echo "" >> .env.local
    echo "# Enzo Canei Dashboard Databases" >> .env.local
    echo "NOTION_DB_KPIS_ENZO=$KPIS_ID" >> .env.local
    ADDED_COUNT=$((ADDED_COUNT + 1))
else
    EXISTING_ID=$(grep "^NOTION_DB_KPIS_ENZO=" .env.local | cut -d'=' -f2)
    if [ "$EXISTING_ID" != "$KPIS_ID" ]; then
        echo -e "${YELLOW}⚠️  NOTION_DB_KPIS_ENZO existe mas com ID diferente${NC}"
        echo -e "${YELLOW}   Existente: $EXISTING_ID${NC}"
        echo -e "${YELLOW}   Esperado:  $KPIS_ID${NC}"
        read -p "Deseja atualizar? (s/N): " UPDATE
        if [[ "$UPDATE" =~ ^[Ss]$ ]]; then
            sed -i.bak "s/^NOTION_DB_KPIS_ENZO=.*/NOTION_DB_KPIS_ENZO=$KPIS_ID/" .env.local
            echo -e "${GREEN}✅ Atualizado${NC}"
        fi
    else
        echo -e "${GREEN}✅ NOTION_DB_KPIS_ENZO já configurado corretamente${NC}"
    fi
fi

# Verificar e adicionar GOALS_ENZO
if ! grep -q "^NOTION_DB_GOALS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_GOALS_ENZO...${NC}"
    echo "NOTION_DB_GOALS_ENZO=$GOALS_ID" >> .env.local
    ADDED_COUNT=$((ADDED_COUNT + 1))
else
    EXISTING_ID=$(grep "^NOTION_DB_GOALS_ENZO=" .env.local | cut -d'=' -f2)
    if [ "$EXISTING_ID" != "$GOALS_ID" ]; then
        echo -e "${YELLOW}⚠️  NOTION_DB_GOALS_ENZO existe mas com ID diferente${NC}"
        read -p "Deseja atualizar? (s/N): " UPDATE
        if [[ "$UPDATE" =~ ^[Ss]$ ]]; then
            sed -i.bak "s/^NOTION_DB_GOALS_ENZO=.*/NOTION_DB_GOALS_ENZO=$GOALS_ID/" .env.local
            echo -e "${GREEN}✅ Atualizado${NC}"
        fi
    else
        echo -e "${GREEN}✅ NOTION_DB_GOALS_ENZO já configurado corretamente${NC}"
    fi
fi

# Verificar e adicionar ACTIONS_ENZO
if ! grep -q "^NOTION_DB_ACTIONS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_ACTIONS_ENZO...${NC}"
    echo "NOTION_DB_ACTIONS_ENZO=$ACTIONS_ID" >> .env.local
    ADDED_COUNT=$((ADDED_COUNT + 1))
else
    EXISTING_ID=$(grep "^NOTION_DB_ACTIONS_ENZO=" .env.local | cut -d'=' -f2)
    if [ "$EXISTING_ID" != "$ACTIONS_ID" ]; then
        echo -e "${YELLOW}⚠️  NOTION_DB_ACTIONS_ENZO existe mas com ID diferente${NC}"
        read -p "Deseja atualizar? (s/N): " UPDATE
        if [[ "$UPDATE" =~ ^[Ss]$ ]]; then
            sed -i.bak "s/^NOTION_DB_ACTIONS_ENZO=.*/NOTION_DB_ACTIONS_ENZO=$ACTIONS_ID/" .env.local
            echo -e "${GREEN}✅ Atualizado${NC}"
        fi
    else
        echo -e "${GREEN}✅ NOTION_DB_ACTIONS_ENZO já configurado corretamente${NC}"
    fi
fi

# Verificar e adicionar CONTACTS_ENZO
if ! grep -q "^NOTION_DB_CONTACTS_ENZO=" .env.local; then
    echo -e "${YELLOW}➕ Adicionando NOTION_DB_CONTACTS_ENZO...${NC}"
    echo "NOTION_DB_CONTACTS_ENZO=$CONTACTS_ID" >> .env.local
    ADDED_COUNT=$((ADDED_COUNT + 1))
else
    EXISTING_ID=$(grep "^NOTION_DB_CONTACTS_ENZO=" .env.local | cut -d'=' -f2)
    if [ "$EXISTING_ID" != "$CONTACTS_ID" ]; then
        echo -e "${YELLOW}⚠️  NOTION_DB_CONTACTS_ENZO existe mas com ID diferente${NC}"
        read -p "Deseja atualizar? (s/N): " UPDATE
        if [[ "$UPDATE" =~ ^[Ss]$ ]]; then
            sed -i.bak "s/^NOTION_DB_CONTACTS_ENZO=.*/NOTION_DB_CONTACTS_ENZO=$CONTACTS_ID/" .env.local
            echo -e "${GREEN}✅ Atualizado${NC}"
        fi
    else
        echo -e "${GREEN}✅ NOTION_DB_CONTACTS_ENZO já configurado corretamente${NC}"
    fi
fi

if [ $ADDED_COUNT -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✅ $ADDED_COUNT database(s) do Enzo adicionada(s)${NC}"
else
    echo ""
    echo -e "${GREEN}✅ Todas as databases do Enzo já estão configuradas${NC}"
fi

echo ""

# ============================================
# PASSO 5: Reiniciar Servidor
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 5: Reiniciando Servidor${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

if command -v pm2 >/dev/null 2>&1; then
    # Verificar se o processo existe
    if pm2 list | grep -q "founder-dashboard"; then
        echo -e "${YELLOW}🔄 Reiniciando servidor PM2...${NC}"
        pm2 restart founder-dashboard
        sleep 3
        
        # Verificar status
        if pm2 list | grep -q "founder-dashboard.*online"; then
            echo -e "${GREEN}✅ Servidor reiniciado com sucesso${NC}"
            echo ""
            echo -e "${BLUE}📋 Últimas linhas dos logs:${NC}"
            pm2 logs founder-dashboard --lines 20 --nostream
        else
            echo -e "${RED}❌ Servidor não está online após reiniciar${NC}"
            echo -e "${YELLOW}📋 Logs de erro:${NC}"
            pm2 logs founder-dashboard --lines 50 --nostream
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Processo founder-dashboard não encontrado no PM2${NC}"
        echo -e "${YELLOW}🔄 Iniciando servidor...${NC}"
        NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start
        pm2 save
        sleep 3
        
        if pm2 list | grep -q "founder-dashboard.*online"; then
            echo -e "${GREEN}✅ Servidor iniciado com sucesso${NC}"
        else
            echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
            pm2 logs founder-dashboard --lines 50 --nostream
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
    echo -e "${YELLOW}⚠️  Instale o PM2: npm install -g pm2${NC}"
    exit 1
fi

echo ""

# ============================================
# PASSO 6: Testar Endpoints
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}PASSO 6: Testando Endpoints${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

sleep 2  # Aguardar servidor estabilizar

# Testar health
echo -e "${BLUE}🔍 Testando /api/health...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /api/health respondeu com status 200${NC}"
    curl -s http://localhost:3001/api/health | head -c 100
    echo ""
else
    echo -e "${RED}❌ /api/health não respondeu (status: $HEALTH_RESPONSE)${NC}"
fi

echo ""

# Testar KPIs
echo -e "${BLUE}🔍 Testando /api/enzo/kpis...${NC}"
KPIS_RESPONSE=$(curl -s http://localhost:3001/api/enzo/kpis 2>/dev/null || echo "ERROR")
if [ "$KPIS_RESPONSE" != "ERROR" ]; then
    KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l || echo "0")
    if [ "$KPIS_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ /api/enzo/kpis retornou $KPIS_COUNT KPI(s)${NC}"
    else
        echo -e "${YELLOW}⚠️  /api/enzo/kpis retornou array vazio${NC}"
        echo -e "${YELLOW}   Verifique se as databases estão compartilhadas com a integração do Notion${NC}"
        echo -e "${YELLOW}   Verifique se os KPIs estão marcados como 'Active' no Notion${NC}"
    fi
else
    echo -e "${RED}❌ Erro ao acessar /api/enzo/kpis${NC}"
fi

echo ""

# Testar Goals
echo -e "${BLUE}🔍 Testando /api/enzo/goals...${NC}"
GOALS_RESPONSE=$(curl -s http://localhost:3001/api/enzo/goals 2>/dev/null || echo "ERROR")
if [ "$GOALS_RESPONSE" != "ERROR" ]; then
    if echo "$GOALS_RESPONSE" | grep -q '"id"'; then
        GOALS_COUNT=$(echo "$GOALS_RESPONSE" | grep -o '"id"' | wc -l || echo "0")
        echo -e "${GREEN}✅ /api/enzo/goals retornou $GOALS_COUNT goal(s)${NC}"
    elif echo "$GOALS_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ /api/enzo/goals retornou erro${NC}"
        echo "$GOALS_RESPONSE" | head -c 200
        echo ""
    else
        echo -e "${YELLOW}⚠️  /api/enzo/goals retornou array vazio${NC}"
    fi
else
    echo -e "${RED}❌ Erro ao acessar /api/enzo/goals${NC}"
fi

echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ CORREÇÃO CONCLUÍDA${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Acesse o site: https://frtechltda.com.br/dashboard-enzo"
echo "2. Verifique se os KPIs aparecem com dados"
echo "3. Verifique se as Goals aparecem"
echo "4. Verifique se as Actions aparecem"
echo ""
echo "📝 Se ainda houver problemas:"
echo "   - Execute: bash scripts/diagnose-vps.sh"
echo "   - Verifique logs: pm2 logs founder-dashboard --lines 100"
echo "   - Verifique no Notion se as databases estão compartilhadas"
echo ""
echo -e "${GREEN}✅ Script concluído!${NC}"
echo ""






