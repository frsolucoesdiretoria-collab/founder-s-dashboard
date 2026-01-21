#!/bin/bash
# Script de verificação completa do site

echo "🔍 VERIFICAÇÃO COMPLETA DO SITE"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar PM2
echo "1️⃣  Verificando PM2..."
PM2_STATUS=$(pm2 list | grep founder-dashboard | awk '{print $10}')
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ PM2 está online${NC}"
else
    echo -e "${RED}❌ PM2 está com status: $PM2_STATUS${NC}"
    ERRORS=$((ERRORS + 1))
fi
pm2 list | grep founder-dashboard
echo ""

# 2. Health Check
echo "2️⃣  Testando Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check OK (status: $HEALTH_RESPONSE)${NC}"
    curl -s http://localhost:3001/api/health | head -c 100
    echo ""
else
    echo -e "${RED}❌ Health check falhou (status: $HEALTH_RESPONSE)${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Testar KPIs
echo "3️⃣  Testando endpoint de KPIs..."
KPIS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/kpis/public 2>/dev/null)
if [ "$KPIS_RESPONSE" = "200" ]; then
    KPIS_COUNT=$(curl -s http://localhost:3001/api/kpis/public | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Endpoint de KPIs OK (status: $KPIS_RESPONSE)${NC}"
    echo "   KPIs encontrados: $KPIS_COUNT"
else
    echo -e "${RED}❌ Endpoint de KPIs falhou (status: $KPIS_RESPONSE)${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Verificar porta
echo "4️⃣  Verificando porta 3001..."
PORT_CHECK=$(lsof -i:3001 2>/dev/null | grep -c LISTEN)
if [ "$PORT_CHECK" -gt 0 ]; then
    echo -e "${GREEN}✅ Porta 3001 está em uso${NC}"
    lsof -i:3001 | grep LISTEN
else
    echo -e "${RED}❌ Porta 3001 não está em uso${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar dist
echo "5️⃣  Verificando build (dist)..."
if [ -d "/var/www/founder-dashboard/dist" ]; then
    DIST_SIZE=$(du -sh /var/www/founder-dashboard/dist 2>/dev/null | awk '{print $1}')
    echo -e "${GREEN}✅ Pasta dist existe (tamanho: $DIST_SIZE)${NC}"
else
    echo -e "${RED}❌ Pasta dist não encontrada${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Verificar .env.local
echo "6️⃣  Verificando configuração..."
if [ -f "/var/www/founder-dashboard/.env.local" ]; then
    if grep -q "^NOTION_TOKEN=" /var/www/founder-dashboard/.env.local && ! grep -q "^NOTION_TOKEN=<<<" /var/www/founder-dashboard/.env.local; then
        echo -e "${GREEN}✅ .env.local existe e NOTION_TOKEN configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local existe mas NOTION_TOKEN pode não estar configurado${NC}"
    fi
else
    echo -e "${RED}❌ .env.local não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 7. Logs recentes
echo "7️⃣  Verificando logs recentes..."
echo "Últimas 10 linhas de log:"
pm2 logs founder-dashboard --lines 10 --nostream 2>/dev/null | tail -10
echo ""

# Resumo
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO OK! Site deve estar funcionando!${NC}"
    echo ""
    echo "🌐 Acesse: https://frtechltda.com.br/dashboard"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS problema(s)${NC}"
    echo ""
    echo "Verifique os erros acima e execute:"
    echo "  pm2 logs founder-dashboard --lines 50"
    exit 1
fi






