#!/bin/bash
# Script para diagnosticar e corrigir erro nos KPIs

cd /var/www/founder-dashboard || exit 1

echo "🔍 DIAGNÓSTICO DO ERRO DE KPIs"
echo "=============================="
echo ""

# 1. Verificar token
echo "1️⃣  Verificando NOTION_TOKEN..."
TOKEN=$(grep "^NOTION_TOKEN=" .env.local | cut -d'=' -f2)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "SET_NOTION_TOKEN_AXIS_HERE" ]; then
    echo "❌ Token não configurado!"
    exit 1
else
    echo "✅ Token configurado: ${TOKEN:0:30}..."
fi
echo ""

# 2. Verificar Database IDs
echo "2️⃣  Verificando Database IDs..."
if ! grep -q "^NOTION_DB_KPIS=" .env.local; then
    echo "⚠️  NOTION_DB_KPIS não encontrado!"
    echo "   Adicionando..."
    echo "" >> .env.local
    echo "# Core Databases" >> .env.local
    echo "NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3" >> .env.local
    echo "NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55" >> .env.local
    echo "NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836" >> .env.local
    echo "NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88" >> .env.local
    echo "✅ Database IDs adicionados"
else
    echo "✅ Database IDs configurados"
fi
echo ""

# 3. Ver logs de erro
echo "3️⃣  Verificando logs de erro..."
echo "Últimas 30 linhas de log:"
pm2 logs founder-dashboard --lines 30 --nostream | grep -i -E "error|notion|kpi|database|token" | tail -15
echo ""

# 4. Testar API com detalhes
echo "4️⃣  Testando API com detalhes..."
curl -v http://localhost:3001/api/kpis/public 2>&1 | head -30
echo ""

# 5. Reiniciar com variáveis atualizadas
echo "5️⃣  Reiniciando servidor..."
set -a
source .env.local
set +a
pm2 restart founder-dashboard --update-env
sleep 5

# 6. Testar novamente
echo ""
echo "6️⃣  Testando novamente após reiniciar..."
KPIS_RESPONSE=$(curl -s http://localhost:3001/api/kpis/public)
KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)

if [ "$KPIS_COUNT" -gt 0 ]; then
    echo "✅✅✅ SUCESSO! $KPIS_COUNT KPIs encontrados!"
else
    echo "⚠️  Ainda sem KPIs"
    echo "Resposta: $KPIS_RESPONSE"
    echo ""
    echo "Verifique:"
    echo "1. Database compartilhada com integração no Notion"
    echo "2. KPIs têm Active=true e VisiblePublic=true"
    echo "3. Logs acima para erro específico"
fi






