#!/bin/bash
# SCRIPT COMPLETO PARA EXECUTAR DIRETAMENTE NA VPS
# Copie TODO este conteúdo e cole no terminal da VPS

set -e

echo "🚀 CORREÇÃO AUTOMÁTICA - Dashboard Enzo na VPS"
echo "================================================"
echo ""

# Encontrar diretório do projeto
PROJECT_DIR=$(find /home /root -name "package.json" -path "*founder-s-dashboard*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null || echo "")

if [ -z "$PROJECT_DIR" ]; then
    echo "❌ Projeto não encontrado automaticamente."
    echo ""
    echo "Por favor, execute manualmente:"
    echo "  1. cd /caminho/do/projeto"
    echo "  2. git pull origin staging"
    echo "  3. bash scripts/fix-vps-enzo-auto.sh"
    exit 1
fi

echo "📁 Diretório encontrado: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Fazer pull do código atualizado
echo ""
echo "📥 Fazendo pull do código atualizado..."
git pull origin staging || echo "⚠️  Git pull falhou, continuando..."

# IDs corretos das databases do Enzo
KPIS_ID="2ed84566a5fa81299c07c412630f9aa4"
GOALS_ID="2ed84566a5fa81ada870cf698ec50bf0"
ACTIONS_ID="2ed84566a5fa81c4a8cbc23841abdc1e"
CONTACTS_ID="2ed84566a5fa81a7bf7afeaa38ea6eff"

# Verificar/criar .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local não encontrado, criando..."
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
    else
        touch .env.local
    fi
fi

# Adicionar databases do Enzo se não existirem
ADDED=0

if ! grep -q "^NOTION_DB_KPIS_ENZO=" .env.local; then
    echo "➕ Adicionando NOTION_DB_KPIS_ENZO..."
    echo "" >> .env.local
    echo "# Enzo Canei Dashboard Databases" >> .env.local
    echo "NOTION_DB_KPIS_ENZO=$KPIS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_GOALS_ENZO=" .env.local; then
    echo "➕ Adicionando NOTION_DB_GOALS_ENZO..."
    echo "NOTION_DB_GOALS_ENZO=$GOALS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_ACTIONS_ENZO=" .env.local; then
    echo "➕ Adicionando NOTION_DB_ACTIONS_ENZO..."
    echo "NOTION_DB_ACTIONS_ENZO=$ACTIONS_ID" >> .env.local
    ADDED=1
fi

if ! grep -q "^NOTION_DB_CONTACTS_ENZO=" .env.local; then
    echo "➕ Adicionando NOTION_DB_CONTACTS_ENZO..."
    echo "NOTION_DB_CONTACTS_ENZO=$CONTACTS_ID" >> .env.local
    ADDED=1
fi

if [ $ADDED -eq 0 ]; then
    echo "✅ Todas as databases do Enzo já estão configuradas"
else
    echo "✅ $ADDED database(s) do Enzo adicionada(s)"
fi

echo ""

# Reiniciar servidor PM2
if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "founder-dashboard"; then
        echo "🔄 Reiniciando servidor PM2..."
        pm2 restart founder-dashboard >/dev/null 2>&1
        sleep 5
        echo "✅ Servidor reiniciado"
    else
        echo "🔄 Iniciando servidor PM2..."
        NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start >/dev/null 2>&1
        pm2 save >/dev/null 2>&1
        sleep 5
        echo "✅ Servidor iniciado"
    fi
else
    echo "❌ PM2 não está instalado"
    exit 1
fi

echo ""

# Testar endpoints
echo "🔍 Testando endpoints..."

sleep 2

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo "✅ /api/health OK"
else
    echo "❌ /api/health falhou (status: $HEALTH)"
fi

KPIS_COUNT=$(curl -s http://localhost:3001/api/enzo/kpis 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
if [ "$KPIS_COUNT" -gt 0 ]; then
    echo "✅ /api/enzo/kpis retornou $KPIS_COUNT KPI(s)"
else
    echo "⚠️  /api/enzo/kpis retornou array vazio"
fi

GOALS_COUNT=$(curl -s http://localhost:3001/api/enzo/goals 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
if [ "$GOALS_COUNT" -gt 0 ]; then
    echo "✅ /api/enzo/goals retornou $GOALS_COUNT goal(s)"
else
    echo "⚠️  /api/enzo/goals retornou array vazio ou erro"
fi

echo ""
echo "✅ Correção automática concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse: https://frtechltda.com.br/dashboard-enzo"
echo "   2. Verifique se os KPIs aparecem com dados"
echo ""




