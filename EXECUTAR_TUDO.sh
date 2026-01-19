#!/bin/bash

# Script SUPER SIMPLES - Só responde as perguntas!

clear
echo "🚀 CONFIGURAÇÃO AUTOMÁTICA"
echo "=========================="
echo ""
echo "Vou fazer TUDO automaticamente!"
echo "Só preciso de 3 informações:"
echo ""

# 1. Informações da VPS
read -p "1️⃣  IP ou hostname da VPS: " VPS_HOST
read -p "2️⃣  Usuário SSH: " VPS_USER
read -sp "3️⃣  Senha SSH (ou Enter se usar chave): " VPS_PASS
echo ""

# 2. NOTION_TOKEN
echo ""
read -sp "4️⃣  NOTION_TOKEN (obtenha em: https://www.notion.so/my-integrations): " NOTION_TOKEN
echo ""

# 3. Caminho do projeto
echo ""
read -p "5️⃣  Caminho do projeto na VPS (ex: /home/usuario/projeto): " PROJECT_PATH

echo ""
echo "🔧 Configurando tudo na VPS..."
echo ""

# Script que será executado na VPS
SCRIPT="
cd $PROJECT_PATH
echo 'NOTION_TOKEN=$NOTION_TOKEN' >> .env.local
pm2 restart founder-dashboard || pm2 start npm --name founder-dashboard -- start
sleep 3
pm2 list | grep founder-dashboard
echo ''
echo '✅ PRONTO!'
"

# Executar
if [ -n "$VPS_PASS" ] && [ "$VPS_PASS" != "" ]; then
    if command -v sshpass &> /dev/null; then
        sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "$SCRIPT"
    else
        echo "⚠️  Instale sshpass: brew install sshpass"
        echo "Ou configure chave SSH e execute novamente"
        exit 1
    fi
else
    ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "$SCRIPT"
fi

echo ""
echo "🌐 Teste: https://frtechltda.com.br/dashboard-enzo"

