#!/bin/bash
# Script para verificar por que os KPIs não estão aparecendo

PROJECT_PATH="/var/www/founder-dashboard"

echo "🔍 VERIFICANDO POR QUE KPIs NÃO APARECEM"
echo "=========================================="
echo ""

cd "$PROJECT_PATH" || exit 1

# 1. Verificar NOTION_TOKEN
echo "1️⃣  Verificando NOTION_TOKEN..."
if grep -q "^NOTION_TOKEN=" .env.local; then
    TOKEN=$(grep "^NOTION_TOKEN=" .env.local | cut -d'=' -f2)
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "<<<SET_NOTION_TOKEN_AXIS_HERE>>>" ] || [ "$TOKEN" = "<<<INSERIR_TOKEN_AQUI>>>" ]; then
        echo "❌ NOTION_TOKEN não configurado ou está com placeholder!"
        echo "   Token atual: ${TOKEN:0:20}..."
    else
        echo "✅ NOTION_TOKEN configurado"
        echo "   Token: ${TOKEN:0:20}..."
    fi
else
    echo "❌ NOTION_TOKEN não encontrado no .env.local"
fi
echo ""

# 2. Verificar Database IDs
echo "2️⃣  Verificando Database IDs..."
REQUIRED_DBS=("NOTION_DB_KPIS" "NOTION_DB_GOALS" "NOTION_DB_ACTIONS" "NOTION_DB_JOURNAL")
for DB in "${REQUIRED_DBS[@]}"; do
    if grep -q "^${DB}=" .env.local; then
        DB_ID=$(grep "^${DB}=" .env.local | cut -d'=' -f2)
        if [ -z "$DB_ID" ] || [[ "$DB_ID" == *"<<"* ]]; then
            echo "❌ $DB não configurado ou com placeholder"
        else
            echo "✅ $DB: ${DB_ID:0:10}..."
        fi
    else
        echo "❌ $DB não encontrado no .env.local"
    fi
done
echo ""

# 3. Testar endpoint de KPIs
echo "3️⃣  Testando endpoint /api/kpis/public..."
KPIS_RESPONSE=$(curl -s http://localhost:3001/api/kpis/public)
KPIS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/kpis/public)

if [ "$KPIS_STATUS" = "200" ]; then
    KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "✅ Endpoint respondeu (status: $KPIS_STATUS)"
    echo "   KPIs encontrados: $KPIS_COUNT"
    if [ "$KPIS_COUNT" -eq 0 ]; then
        echo "⚠️  Nenhum KPI retornado!"
        echo "   Resposta completa:"
        echo "$KPIS_RESPONSE" | head -c 500
        echo ""
    else
        echo "   Primeiro KPI:"
        echo "$KPIS_RESPONSE" | head -c 300
        echo ""
    fi
else
    echo "❌ Endpoint falhou (status: $KPIS_STATUS)"
    echo "   Resposta:"
    echo "$KPIS_RESPONSE" | head -c 500
    echo ""
fi
echo ""

# 4. Verificar logs do PM2 para erros do Notion
echo "4️⃣  Verificando logs para erros do Notion..."
pm2 logs founder-dashboard --lines 100 --nostream | grep -i -E "notion|error|database|token|kpi" | tail -20 || echo "Nenhum erro encontrado nos logs recentes"
echo ""

# 5. Testar conexão com Notion (via selftest)
echo "5️⃣  Testando conexão com Notion..."
SELFTEST=$(curl -s http://localhost:3001/api/__selftest 2>/dev/null || echo "{}")
if echo "$SELFTEST" | grep -q "notion"; then
    echo "📋 Resultado do selftest:"
    echo "$SELFTEST" | head -c 500
    echo ""
else
    echo "⚠️  Selftest não disponível ou não retornou dados do Notion"
fi
echo ""

# Resumo
echo "=========================================="
echo "📋 RESUMO:"
echo ""
echo "Se NOTION_TOKEN não está configurado:"
echo "  1. Edite: nano $PROJECT_PATH/.env.local"
echo "  2. Configure: NOTION_TOKEN=seu_token_aqui"
echo "  3. Reinicie: pm2 restart founder-dashboard"
echo ""
echo "Se Database IDs não estão configurados:"
echo "  1. Verifique se as databases existem no Notion"
echo "  2. Configure os IDs no .env.local"
echo ""
echo "Se endpoint retorna vazio:"
echo "  1. Verifique se há KPIs no Notion com:"
echo "     - Active = true"
echo "     - VisiblePublic = true"
echo "     - IsFinancial = false"
echo ""




