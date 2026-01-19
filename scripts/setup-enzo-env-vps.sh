#!/bin/bash
# Script para configurar variáveis de ambiente do Enzo na VPS
# Execute este script na VPS após criar as databases no Notion

echo "🔧 Configurando variáveis de ambiente do Enzo na VPS..."
echo ""

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "   Copie o env.local.example para .env.local primeiro"
    exit 1
fi

# Solicitar IDs das databases
echo "📝 Por favor, forneça os IDs das databases do Notion para Enzo:"
echo "   (Você pode obter os IDs dos links das databases no Notion)"
echo ""

read -p "NOTION_DB_KPIS_ENZO: " KPIS_ID
read -p "NOTION_DB_GOALS_ENZO: " GOALS_ID
read -p "NOTION_DB_ACTIONS_ENZO: " ACTIONS_ID
read -p "NOTION_DB_CONTACTS_ENZO (opcional): " CONTACTS_ID

# Remover espaços e hífens dos IDs
KPIS_ID=$(echo "$KPIS_ID" | tr -d ' -')
GOALS_ID=$(echo "$GOALS_ID" | tr -d ' -')
ACTIONS_ID=$(echo "$ACTIONS_ID" | tr -d ' -')
CONTACTS_ID=$(echo "$CONTACTS_ID" | tr -d ' -')

# Adicionar ou atualizar variáveis no .env.local
echo ""
echo "📝 Atualizando .env.local..."

# Remover linhas antigas se existirem
sed -i '/^NOTION_DB_KPIS_ENZO=/d' .env.local
sed -i '/^NOTION_DB_GOALS_ENZO=/d' .env.local
sed -i '/^NOTION_DB_ACTIONS_ENZO=/d' .env.local
sed -i '/^NOTION_DB_CONTACTS_ENZO=/d' .env.local

# Adicionar novas variáveis
echo "" >> .env.local
echo "# Enzo Canei Dashboard Databases" >> .env.local
echo "NOTION_DB_KPIS_ENZO=$KPIS_ID" >> .env.local
echo "NOTION_DB_GOALS_ENZO=$GOALS_ID" >> .env.local
echo "NOTION_DB_ACTIONS_ENZO=$ACTIONS_ID" >> .env.local
if [ ! -z "$CONTACTS_ID" ]; then
    echo "NOTION_DB_CONTACTS_ENZO=$CONTACTS_ID" >> .env.local
fi

echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "🔄 Reinicie o servidor para aplicar as mudanças:"
echo "   pm2 restart founder-dashboard"
echo ""




