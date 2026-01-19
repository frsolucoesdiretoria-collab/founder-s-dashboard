#!/bin/bash

# Script COMPLETO - Configura NOTION_TOKEN na VPS automaticamente
# Não precisa usar GitHub Actions - conecta direto na VPS

set -e

echo "🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA"
echo "===================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se tem SSH configurado
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
    echo -e "${BLUE}📋 Preciso das informações da VPS:${NC}"
    echo ""
    read -p "IP ou hostname da VPS: " VPS_HOST
    read -p "Usuário SSH: " VPS_USER
    read -sp "Senha SSH (ou pressione Enter se usar chave): " VPS_PASS
    echo ""
fi

# Pedir NOTION_TOKEN
echo ""
echo -e "${BLUE}🔑 Informe o NOTION_TOKEN:${NC}"
echo "   (Obtenha em: https://www.notion.so/my-integrations)"
read -sp "NOTION_TOKEN: " NOTION_TOKEN
echo ""

if [ -z "$NOTION_TOKEN" ]; then
    echo -e "${RED}❌ NOTION_TOKEN não fornecido${NC}"
    exit 1
fi

# Pedir caminho do projeto na VPS
echo ""
read -p "Caminho do projeto na VPS (ex: /home/usuario/projeto): " PROJECT_PATH

if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Caminho do projeto não fornecido${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Conectando à VPS e configurando tudo...${NC}"
echo ""

# Script que será executado na VPS
VPS_SCRIPT=$(cat << 'EOF'
set -e

cd $PROJECT_PATH

echo "📁 Diretório: $(pwd)"

# Backup
if [ -f .env.local ]; then
    BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env.local "$BACKUP_FILE"
    echo "✅ Backup criado: $BACKUP_FILE"
fi

# Garantir que .env.local existe
[ -f .env.local ] || touch .env.local

# Configurar NOTION_TOKEN
if grep -q "^NOTION_TOKEN=" .env.local; then
    sed -i "s|^NOTION_TOKEN=.*|NOTION_TOKEN=$NOTION_TOKEN_VALUE|" .env.local
    echo "✅ NOTION_TOKEN atualizado"
else
    sed -i "1i NOTION_TOKEN=$NOTION_TOKEN_VALUE" .env.local
    echo "✅ NOTION_TOKEN adicionado"
fi

# IDs corretos das databases
KPIS_ID="2ed84566a5fa81299c07c412630f9aa4"
GOALS_ID="2ed84566a5fa81ada870cf698ec50bf0"
ACTIONS_ID="2ed84566a5fa81c4a8cbc23841abdc1e"
CONTACTS_ID="2ed84566a5fa81a7bf7afeaa38ea6eff"

# Garantir que IDs estão corretos
for var in "NOTION_DB_KPIS_ENZO" "NOTION_DB_GOALS_ENZO" "NOTION_DB_ACTIONS_ENZO" "NOTION_DB_CONTACTS_ENZO"; do
    case $var in
        NOTION_DB_KPIS_ENZO) ID=$KPIS_ID ;;
        NOTION_DB_GOALS_ENZO) ID=$GOALS_ID ;;
        NOTION_DB_ACTIONS_ENZO) ID=$ACTIONS_ID ;;
        NOTION_DB_CONTACTS_ENZO) ID=$CONTACTS_ID ;;
    esac
    
    if grep -q "^${var}=" .env.local; then
        CURRENT_ID=$(grep "^${var}=" .env.local | cut -d'=' -f2 | tr -d '-')
        if [ "$CURRENT_ID" != "$ID" ]; then
            sed -i "s|^${var}=.*|${var}=${ID}|" .env.local
            echo "✅ $var atualizado"
        fi
    else
        echo "${var}=${ID}" >> .env.local
        echo "✅ $var adicionado"
    fi
done

# Reiniciar PM2
echo ""
echo "🔄 Reiniciando PM2..."

if command -v pm2 >/dev/null 2>&1; then
    pm2 stop founder-dashboard 2>/dev/null || true
    pm2 delete founder-dashboard 2>/dev/null || true
    sleep 2
    
    set -a
    source .env.local 2>/dev/null || true
    set +a
    
    cd $PROJECT_PATH
    NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start 2>&1 || {
        pm2 start "npm start" --name "founder-dashboard" --update-env 2>&1 || true
    }
    
    pm2 save 2>/dev/null || true
    sleep 5
    
    if pm2 list | grep -q "founder-dashboard.*online"; then
        echo "✅ PM2 reiniciado com sucesso"
    else
        echo "⚠️  PM2 pode não ter iniciado corretamente"
        pm2 list | grep -i "founder" || true
    fi
else
    echo "⚠️  PM2 não está instalado"
fi

# Testar endpoints
echo ""
echo "🔍 Testando endpoints..."
sleep 3

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check OK"
else
    echo "⚠️  Health check: $HEALTH"
fi

KPIS_RESPONSE=$(curl -s http://localhost:3001/api/enzo/kpis 2>/dev/null || echo "[]")
if echo "$KPIS_RESPONSE" | grep -q '"id"'; then
    KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "✅ KPIs: $KPIS_COUNT encontrado(s)"
else
    echo "⚠️  KPIs: array vazio ou erro"
fi

echo ""
echo "✅ Configuração concluída!"
EOF
)

# Executar na VPS
if [ -n "$VPS_PASS" ] && [ "$VPS_PASS" != "" ]; then
    # Usar sshpass se disponível
    if command -v sshpass &> /dev/null; then
        echo "$VPS_SCRIPT" | sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "PROJECT_PATH='$PROJECT_PATH' NOTION_TOKEN_VALUE='$NOTION_TOKEN' bash"
    else
        echo -e "${YELLOW}⚠️  sshpass não instalado. Tentando sem senha (use chave SSH)${NC}"
        echo "$VPS_SCRIPT" | ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "PROJECT_PATH='$PROJECT_PATH' NOTION_TOKEN_VALUE='$NOTION_TOKEN' bash"
    fi
else
    # Usar chave SSH
    echo "$VPS_SCRIPT" | ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "PROJECT_PATH='$PROJECT_PATH' NOTION_TOKEN_VALUE='$NOTION_TOKEN' bash"
fi

echo ""
echo -e "${GREEN}✅ TUDO CONFIGURADO!${NC}"
echo ""
echo "🌐 Teste o site: https://frtechltda.com.br/dashboard-enzo"

