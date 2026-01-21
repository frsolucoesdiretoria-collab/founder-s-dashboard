#!/bin/bash
# Script para configurar NOTION_TOKEN automaticamente

cd /var/www/founder-dashboard || exit 1

echo "🔑 Configurando NOTION_TOKEN..."
echo ""

# Fazer backup
cp .env.local .env.local.backup
echo "✅ Backup criado"

# Configurar token
sed -i 's/NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE/NOTION_TOKEN=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/' .env.local

# Verificar se foi configurado
if grep -q "^NOTION_TOKEN=ntn_" .env.local; then
    echo "✅ Token configurado com sucesso!"
    echo "   Token: $(grep "^NOTION_TOKEN=" .env.local | head -c 50)..."
else
    echo "❌ Erro ao configurar token!"
    exit 1
fi

echo ""
echo "🔄 Reiniciando servidor..."
pm2 restart founder-dashboard
sleep 8

echo ""
echo "🔍 Verificando..."
echo ""

# Testar API
KPIS_RESPONSE=$(curl -s http://localhost:3001/api/kpis/public)
KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)

echo "📊 KPIs encontrados: $KPIS_COUNT"
echo ""

if [ "$KPIS_COUNT" -gt 0 ]; then
    echo "✅✅✅ SUCESSO! KPIs estão sendo retornados!"
    echo ""
    echo "Primeiros KPIs:"
    echo "$KPIS_RESPONSE" | head -c 300
    echo ""
else
    echo "⚠️  Nenhum KPI retornado ainda"
    echo ""
    echo "Possíveis causas:"
    echo "1. Database não compartilhada com integração no Notion"
    echo "2. KPIs não têm Active=true e VisiblePublic=true"
    echo "3. Verifique os logs abaixo"
    echo ""
    echo "Resposta da API:"
    echo "$KPIS_RESPONSE" | head -c 500
    echo ""
fi

echo ""
echo "📋 Logs recentes:"
pm2 logs founder-dashboard --lines 15 --nostream | tail -10

echo ""
echo "🌐 Acesse: https://frtechltda.com.br/dashboard"






