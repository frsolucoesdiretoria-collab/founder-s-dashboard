#!/bin/bash

# Script para criar template .env para produção na VPS
# Baseado no .env.local local

cat > .env.production.template << 'EOF'
# FR Tech OS - Environment Variables para Produção
# IMPORTANTE: Este arquivo é apenas um template
# Copie este arquivo para .env na VPS e preencha o NOTION_TOKEN

# Notion API Token (REQUIRED)
# Obtenha em: https://www.notion.so/my-integrations
NOTION_TOKEN=<<<INSERIR_TOKEN_AQUI>>>

# Notion Database IDs (REQUIRED - Core databases)
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88

# Notion Database IDs (OPTIONAL - Supporting databases)
NOTION_DB_CONTACTS=2d984566a5fa81b3b1a1c8abef43421f
NOTION_DB_CLIENTS=2d984566a5fa81a89be6f9bdb271f838
NOTION_DB_GROWTHPROPOSALS=2d984566a5fa81c9bf2fd004c75a7e3c
NOTION_DB_COFFEEDIAGNOSTICS=2d984566a5fa81528aafcd990533eaf5
NOTION_DB_EXPANSIONOPPORTUNITIES=2d984566a5fa81f887ddfe1cac401239
NOTION_DB_CUSTOMERWINS=2d984566a5fa81b0a2bcc690ec281df9
NOTION_DB_FINANCEMETRICS=2d984566a5fa81988982e06722459759

# Notion Database IDs (OPTIONAL - Phase 2 Partner features)
NOTION_DB_PARTNERS=2d984566a5fa814380e8dd8d93f3a582
NOTION_DB_REFERRALS=2d984566a5fa810cbefcd6ff2f139620
NOTION_DB_COMMISSIONLEDGER=2d984566a5fa81578b5bcd07a19bf6c3
NOTION_DB_PARTNERNUDGES=2d984566a5fa8159a321c95e14c52bd6

# Admin Passcode (ALTERE PARA UMA SENHA FORTE EM PRODUÇÃO)
ADMIN_PASSCODE=<<<GERAR_SENHA_FORTE_AQUI>>>

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://frtechltda.com.br
EOF

echo "✅ Template .env para produção criado: .env.production.template"
echo ""
echo "📝 Próximos passos:"
echo "   1. Copie este arquivo para a VPS"
echo "   2. Na VPS, renomeie para .env: mv .env.production.template .env"
echo "   3. Edite o .env e preencha NOTION_TOKEN e ADMIN_PASSCODE"
echo "   4. Execute: npm start para testar"

