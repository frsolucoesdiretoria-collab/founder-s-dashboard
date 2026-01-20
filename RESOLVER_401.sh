#!/bin/bash
# Script rápido para resolver erro 401 (token inválido)

echo "🚨 ERRO 401 - Token Inválido"
echo "=============================="
echo ""
echo "O token está sendo rejeitado pelo Notion."
echo ""
echo "SOLUÇÃO:"
echo ""
echo "1️⃣  Obtenha um NOVO token:"
echo "   https://www.notion.so/my-integrations"
echo ""
echo "2️⃣  Se já tiver integração:"
echo "   - Delete a integração antiga"
echo "   - Crie uma NOVA integração"
echo "   - OU gere um novo token na integração existente"
echo ""
echo "3️⃣  Configure o novo token na VPS:"
echo ""
echo "   nano /var/www/founder-dashboard/.env.local"
echo ""
echo "   Procure: NOTION_TOKEN=..."
echo "   Substitua pelo novo token"
echo "   Salve: Ctrl+O, Enter, Ctrl+X"
echo ""
echo "4️⃣  Reinicie:"
echo "   pm2 restart founder-dashboard --update-env"
echo ""
echo "5️⃣  Compartilhe databases no Notion:"
echo "   - Abra cada database (KPIs, Goals, Actions, Journal)"
echo "   - Clique nos ... → Add connections"
echo "   - Escolha sua integração"
echo ""





