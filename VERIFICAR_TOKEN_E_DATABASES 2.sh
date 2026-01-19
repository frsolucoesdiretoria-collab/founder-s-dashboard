#!/bin/bash
# Script para verificar token e acesso às databases

cd /var/www/founder-dashboard || exit 1

echo "🔍 VERIFICAÇÃO COMPLETA DO TOKEN E DATABASES"
echo "============================================"
echo ""

# 1. Verificar token
TOKEN=$(grep "^NOTION_TOKEN=" .env.local | cut -d'=' -f2)
if [ -z "$TOKEN" ]; then
    echo "❌ Token não encontrado!"
    exit 1
fi

echo "1️⃣  Token encontrado: ${TOKEN:0:30}..."
echo ""

# 2. Testar token diretamente com API do Notion
echo "2️⃣  Testando token com API do Notion..."
RESPONSE=$(curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Notion-Version: 2022-06-28" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "object.*user"; then
    echo "✅ Token VÁLIDO! API do Notion aceitou o token."
    echo "   Resposta: $(echo "$RESPONSE" | head -c 200)..."
else
    echo "❌ Token INVÁLIDO ou sem permissões!"
    echo "   Resposta: $RESPONSE"
    echo ""
    echo "SOLUÇÃO:"
    echo "1. Vá para: https://www.notion.so/my-integrations"
    echo "2. Crie uma NOVA integração"
    echo "3. Copie o token (deve começar com 'secret_')"
    echo "4. Configure na VPS"
    exit 1
fi

echo ""
echo ""

# 3. Verificar Database IDs
echo "3️⃣  Verificando Database IDs..."
DB_KPIS=$(grep "^NOTION_DB_KPIS=" .env.local | cut -d'=' -f2)
DB_GOALS=$(grep "^NOTION_DB_GOALS=" .env.local | cut -d'=' -f2)

if [ -z "$DB_KPIS" ]; then
    echo "⚠️  NOTION_DB_KPIS não configurado!"
else
    echo "✅ NOTION_DB_KPIS: $DB_KPIS"
fi

if [ -z "$DB_GOALS" ]; then
    echo "⚠️  NOTION_DB_GOALS não configurado!"
else
    echo "✅ NOTION_DB_GOALS: $DB_GOALS"
fi

echo ""
echo ""

# 4. Testar acesso à database de KPIs
if [ ! -z "$DB_KPIS" ]; then
    echo "4️⃣  Testando acesso à database de KPIs..."
    DB_RESPONSE=$(curl -s -X POST "https://api.notion.com/v1/databases/$DB_KPIS/query" \
      -H "Notion-Version: 2022-06-28" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{}')
    
    if echo "$DB_RESPONSE" | grep -q "object.*list"; then
        echo "✅ Acesso à database OK!"
        COUNT=$(echo "$DB_RESPONSE" | grep -o '"id"' | wc -l)
        echo "   Total de páginas encontradas: $COUNT"
    elif echo "$DB_RESPONSE" | grep -q "object_not_found"; then
        echo "❌ Database não encontrada!"
        echo "   Verifique se o ID está correto: $DB_KPIS"
    elif echo "$DB_RESPONSE" | grep -q "unauthorized"; then
        echo "❌ Sem permissão para acessar a database!"
        echo "   SOLUÇÃO: Compartilhe a database com a integração no Notion"
        echo "   1. Abra a database no Notion"
        echo "   2. Clique nos ... → Add connections"
        echo "   3. Escolha sua integração"
    else
        echo "⚠️  Resposta inesperada:"
        echo "$DB_RESPONSE" | head -c 500
    fi
fi

echo ""
echo ""
echo "=== RESUMO ==="
echo "Se o token está válido mas não consegue acessar a database:"
echo "→ Compartilhe a database com a integração no Notion"
echo ""
echo "Se o token está inválido:"
echo "→ Crie uma nova integração em: https://www.notion.so/my-integrations"




