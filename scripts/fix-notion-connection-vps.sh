#!/bin/bash

# Script Automático - Corrigir Conexão com Notion na VPS
# Este script diagnostica e corrige problemas de conexão com as databases do Notion
# Pode ser executado via GitHub Actions ou diretamente na VPS

set -e  # Parar em caso de erro crítico

echo "🔧 CORREÇÃO AUTOMÁTICA - Conexão Notion na VPS"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar se está no diretório correto
echo -e "${BLUE}📁 1. Verificando diretório do projeto...${NC}"
if [ -f "package.json" ]; then
    PROJECT_DIR=$(pwd)
    echo -e "${GREEN}✅ package.json encontrado em: $PROJECT_DIR${NC}"
else
    echo -e "${RED}❌ package.json não encontrado. Execute este script no diretório raiz do projeto.${NC}"
    exit 1
fi
echo ""

# 2. Backup do .env.local atual
echo -e "${BLUE}💾 2. Fazendo backup do .env.local...${NC}"
if [ -f ".env.local" ]; then
    BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env.local "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local não existe, será criado${NC}"
fi
echo ""

# 3. Verificar/criar .env.local
echo -e "${BLUE}⚙️  3. Verificando arquivo .env.local...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local não encontrado, criando...${NC}"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo -e "${GREEN}✅ .env.local criado a partir de env.local.example${NC}"
    else
        touch .env.local
        echo -e "${YELLOW}⚠️  .env.local criado vazio${NC}"
    fi
fi
echo ""

# 4. Verificar NOTION_TOKEN
echo -e "${BLUE}🔑 4. Verificando NOTION_TOKEN...${NC}"
NOTION_TOKEN_LINE=$(grep "^NOTION_TOKEN=" .env.local 2>/dev/null || echo "")
if [ -z "$NOTION_TOKEN_LINE" ]; then
    echo -e "${RED}❌ NOTION_TOKEN não encontrado no .env.local${NC}"
    echo -e "${YELLOW}⚠️  NOTA: NOTION_TOKEN precisa ser configurado manualmente${NC}"
    echo -e "${YELLOW}   Adicione a linha: NOTION_TOKEN=seu_token_aqui${NC}"
else
    TOKEN_VALUE=$(echo "$NOTION_TOKEN_LINE" | cut -d'=' -f2)
    if [[ "$TOKEN_VALUE" == *"<<"* ]] || [[ "$TOKEN_VALUE" == "" ]]; then
        echo -e "${RED}❌ NOTION_TOKEN está com placeholder ou vazio${NC}"
        echo -e "${YELLOW}⚠️  NOTA: NOTION_TOKEN precisa ser configurado manualmente${NC}"
    else
        TOKEN_PREFIX=$(echo "$TOKEN_VALUE" | cut -c1-10)
        echo -e "${GREEN}✅ NOTION_TOKEN encontrado (prefixo: $TOKEN_PREFIX...)${NC}"
    fi
fi
echo ""

# 5. IDs corretos das databases do Enzo (32 caracteres, sem hífens)
KPIS_ID="2ed84566a5fa81299c07c412630f9aa4"
GOALS_ID="2ed84566a5fa81ada870cf698ec50bf0"
ACTIONS_ID="2ed84566a5fa81c4a8cbc23841abdc1e"
CONTACTS_ID="2ed84566a5fa81a7bf7afeaa38ea6eff"

# 6. Verificar e corrigir IDs das databases
echo -e "${BLUE}🔍 5. Verificando e corrigindo IDs das databases...${NC}"

fix_database_id() {
    local VAR_NAME=$1
    local CORRECT_ID=$2
    
    if grep -q "^${VAR_NAME}=" .env.local; then
        CURRENT_ID=$(grep "^${VAR_NAME}=" .env.local | cut -d'=' -f2)
        CURRENT_ID_CLEAN=$(echo "$CURRENT_ID" | tr -d '-')
        
        # Verificar se tem hífens ou formato incorreto
        if [[ "$CURRENT_ID" == *"-"* ]] || [ ${#CURRENT_ID_CLEAN} -ne 32 ]; then
            echo -e "${YELLOW}⚠️  $VAR_NAME tem formato incorreto: $CURRENT_ID${NC}"
            echo -e "${BLUE}   Corrigindo para: $CORRECT_ID${NC}"
            # Remover linha antiga e adicionar nova
            sed -i "/^${VAR_NAME}=/d" .env.local
            echo "${VAR_NAME}=${CORRECT_ID}" >> .env.local
            echo -e "${GREEN}   ✅ $VAR_NAME corrigido${NC}"
        else
            if [ "$CURRENT_ID_CLEAN" = "$CORRECT_ID" ]; then
                echo -e "${GREEN}✅ $VAR_NAME está correto${NC}"
            else
                echo -e "${YELLOW}⚠️  $VAR_NAME tem ID diferente do esperado: $CURRENT_ID${NC}"
                echo -e "${BLUE}   Atualizando para ID padrão...${NC}"
                sed -i "s|^${VAR_NAME}=.*|${VAR_NAME}=${CORRECT_ID}|" .env.local
                echo -e "${GREEN}   ✅ $VAR_NAME atualizado${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  $VAR_NAME não encontrado, adicionando...${NC}"
        echo "${VAR_NAME}=${CORRECT_ID}" >> .env.local
        echo -e "${GREEN}   ✅ $VAR_NAME adicionado${NC}"
    fi
}

# Verificar se há seção de comentário para databases do Enzo
if ! grep -q "# Enzo Canei Dashboard Databases" .env.local; then
    echo "" >> .env.local
    echo "# Enzo Canei Dashboard Databases" >> .env.local
fi

fix_database_id "NOTION_DB_KPIS_ENZO" "$KPIS_ID"
fix_database_id "NOTION_DB_GOALS_ENZO" "$GOALS_ID"
fix_database_id "NOTION_DB_ACTIONS_ENZO" "$ACTIONS_ID"
fix_database_id "NOTION_DB_CONTACTS_ENZO" "$CONTACTS_ID"

echo ""

# 7. Verificar formato final dos IDs
echo -e "${BLUE}🔍 6. Validando formato final dos IDs...${NC}"
ALL_CORRECT=true
for var in "NOTION_DB_KPIS_ENZO" "NOTION_DB_GOALS_ENZO" "NOTION_DB_ACTIONS_ENZO" "NOTION_DB_CONTACTS_ENZO"; do
    if grep -q "^${var}=" .env.local; then
        ID=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        ID_CLEAN=$(echo "$ID" | tr -d '-')
        if [ ${#ID_CLEAN} -eq 32 ]; then
            echo -e "${GREEN}✅ $var: formato correto (32 caracteres)${NC}"
        else
            echo -e "${RED}❌ $var: formato incorreto (${#ID_CLEAN} caracteres)${NC}"
            ALL_CORRECT=false
        fi
    else
        echo -e "${RED}❌ $var: não encontrado${NC}"
        ALL_CORRECT=false
    fi
done
echo ""

# 8. Verificar status do PM2
echo -e "${BLUE}🔄 7. Verificando status do PM2...${NC}"
if command_exists pm2; then
    if pm2 list | grep -q "founder-dashboard.*online"; then
        echo -e "${GREEN}✅ Servidor PM2 está rodando${NC}"
        PM2_RUNNING=true
    else
        echo -e "${YELLOW}⚠️  Servidor PM2 não está rodando${NC}"
        PM2_RUNNING=false
    fi
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
    PM2_RUNNING=false
fi
echo ""

# 9. Reiniciar servidor PM2 com variáveis corretas
echo -e "${BLUE}🔄 8. Gerenciando servidor PM2...${NC}"
if command_exists pm2; then
    # Parar processo existente se houver
    pm2 stop founder-dashboard >/dev/null 2>&1 || true
    pm2 delete founder-dashboard >/dev/null 2>&1 || true
    
    # Aguardar um pouco
    sleep 2
    
    # Verificar se precisa fazer build
    if [ ! -d "dist" ] || [ "dist/index.html" -ot "package.json" ]; then
        echo -e "${YELLOW}   ⚠️  Build pode estar desatualizado, fazendo rebuild...${NC}"
        npm run build >/dev/null 2>&1 || npm run build
    fi
    
    # Iniciar PM2 com variáveis de ambiente do .env.local
    echo -e "${BLUE}   🚀 Iniciando servidor PM2...${NC}"
    
    # Carregar variáveis do .env.local e iniciar PM2
    set -a
    source .env.local 2>/dev/null || true
    set +a
    
    cd $PROJECT_DIR
    NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start || {
        echo -e "${RED}   ❌ Erro ao iniciar PM2, tentando método alternativo...${NC}"
        # Método alternativo: usar ecosystem file ou start direto
        pm2 start "npm start" --name "founder-dashboard" --update-env || {
            echo -e "${RED}   ❌ Falha ao iniciar PM2${NC}"
            pm2 logs founder-dashboard --lines 20 --nostream 2>/dev/null || true
        }
    }
    
    pm2 save >/dev/null 2>&1 || pm2 save || true
    
    # Aguardar e verificar se iniciou
    sleep 5
    if pm2 list | grep -q "founder-dashboard.*online"; then
        echo -e "${GREEN}✅ Servidor PM2 iniciado com sucesso${NC}"
        PM2_RUNNING=true
    else
        echo -e "${YELLOW}⚠️  PM2 pode não ter iniciado corretamente${NC}"
        pm2 list | grep -i "founder" || true
        PM2_RUNNING=false
    fi
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
    PM2_RUNNING=false
fi
echo ""

# 10. Verificar logs do PM2
echo -e "${BLUE}📋 9. Verificando logs do PM2...${NC}"
if command_exists pm2 && pm2 list | grep -q "founder-dashboard"; then
    echo "   Últimas 10 linhas dos logs:"
    pm2 logs founder-dashboard --lines 10 --nostream 2>/dev/null | tail -10 || echo "   Não foi possível ler logs"
else
    echo -e "${YELLOW}⚠️  PM2 não está disponível ou processo não encontrado${NC}"
fi
echo ""

# 11. Testar endpoints
echo -e "${BLUE}🌐 10. Testando endpoints da API...${NC}"
sleep 2

if command_exists curl; then
    # Testar health
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ /api/health: OK (status 200)${NC}"
    else
        echo -e "${RED}❌ /api/health: Falhou (status $HEALTH_RESPONSE)${NC}"
    fi
    
    # Testar KPIs do Enzo
    KPIS_RESPONSE=$(curl -s http://localhost:3001/api/enzo/kpis 2>/dev/null || echo "[]")
    if echo "$KPIS_RESPONSE" | grep -q '"id"'; then
        KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)
        echo -e "${GREEN}✅ /api/enzo/kpis: Retornou $KPIS_COUNT KPI(s)${NC}"
    elif echo "$KPIS_RESPONSE" | grep -q "\[\]"; then
        echo -e "${YELLOW}⚠️  /api/enzo/kpis: Retornou array vazio${NC}"
    else
        echo -e "${RED}❌ /api/enzo/kpis: Erro na resposta${NC}"
        echo "   Resposta: $(echo "$KPIS_RESPONSE" | head -c 200)"
    fi
    
    # Testar Goals do Enzo
    GOALS_RESPONSE=$(curl -s http://localhost:3001/api/enzo/goals 2>/dev/null || echo "[]")
    if echo "$GOALS_RESPONSE" | grep -q '"id"'; then
        GOALS_COUNT=$(echo "$GOALS_RESPONSE" | grep -o '"id"' | wc -l)
        echo -e "${GREEN}✅ /api/enzo/goals: Retornou $GOALS_COUNT goal(s)${NC}"
    elif echo "$GOALS_RESPONSE" | grep -q "\[\]"; then
        echo -e "${YELLOW}⚠️  /api/enzo/goals: Retornou array vazio${NC}"
    else
        echo -e "${YELLOW}⚠️  /api/enzo/goals: Resposta inesperada${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl não está disponível para testar endpoints${NC}"
fi
echo ""

# 12. Resumo final
echo "================================================"
echo -e "${BLUE}📊 RESUMO DA CORREÇÃO${NC}"
echo "================================================"
echo ""

if [ "$ALL_CORRECT" = true ]; then
    echo -e "${GREEN}✅ Todos os IDs das databases estão corretos${NC}"
else
    echo -e "${YELLOW}⚠️  Alguns IDs podem precisar de atenção manual${NC}"
fi

if [ "$PM2_RUNNING" = true ]; then
    echo -e "${GREEN}✅ Servidor PM2 está rodando${NC}"
else
    echo -e "${RED}❌ Servidor PM2 não está rodando${NC}"
fi

echo ""
echo "📋 Próximos passos:"
echo "   1. Verifique se NOTION_TOKEN está configurado corretamente no .env.local"
echo "   2. Acesse: https://frtechltda.com.br/dashboard-enzo"
echo "   3. Verifique se os KPIs aparecem com dados"
echo "   4. Se ainda houver problemas, execute: pm2 logs founder-dashboard"
echo ""
echo -e "${GREEN}✅ Correção automática concluída!${NC}"
echo ""

