#!/bin/bash

# Script para adicionar secret do GitHub e executar workflow
# Requer GitHub CLI (gh) ou token de acesso pessoal

set -e

echo "🔧 Configuração Automática - NOTION_TOKEN na VPS"
echo "=================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO="frsolucoesdiretoria-collab/founder-s-dashboard"
SECRET_NAME="NOTION_TOKEN_VPS"
WORKFLOW_FILE="setup-notion-token.yml"

# Verificar se GitHub CLI está instalado
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI encontrado${NC}"
    
    # Verificar se está autenticado
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI autenticado${NC}"
        USE_GH_CLI=true
    else
        echo -e "${YELLOW}⚠️  GitHub CLI não está autenticado${NC}"
        echo "Execute: gh auth login"
        USE_GH_CLI=false
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI não está instalado${NC}"
    USE_GH_CLI=false
fi

# Se não tiver GitHub CLI, pedir token manualmente
if [ "$USE_GH_CLI" = false ]; then
    echo ""
    echo -e "${BLUE}📋 Opção 1: Instalar GitHub CLI (Recomendado)${NC}"
    echo "   macOS: brew install gh"
    echo "   Depois: gh auth login"
    echo ""
    echo -e "${BLUE}📋 Opção 2: Fazer manualmente${NC}"
    echo "   1. Acesse: https://github.com/$REPO/settings/secrets/actions"
    echo "   2. Clique em 'New repository secret'"
    echo "   3. Name: $SECRET_NAME"
    echo "   4. Value: seu token do Notion"
    echo "   5. Clique em 'Add secret'"
    echo ""
    echo "   Depois execute:"
    echo "   gh workflow run $WORKFLOW_FILE --repo $REPO --ref staging"
    echo ""
    exit 0
fi

# Pedir NOTION_TOKEN
echo ""
echo -e "${BLUE}🔑 Informe o NOTION_TOKEN do Notion:${NC}"
echo "   (Obtenha em: https://www.notion.so/my-integrations)"
read -sp "Token: " NOTION_TOKEN
echo ""

if [ -z "$NOTION_TOKEN" ]; then
    echo -e "${RED}❌ Token não fornecido${NC}"
    exit 1
fi

# Adicionar secret via GitHub CLI
echo ""
echo -e "${BLUE}📝 Adicionando secret ao GitHub...${NC}"
if gh secret set "$SECRET_NAME" --repo "$REPO" --body "$NOTION_TOKEN" 2>&1; then
    echo -e "${GREEN}✅ Secret '$SECRET_NAME' adicionado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao adicionar secret${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "  - Você não tem permissão de administrador no repositório"
    echo "  - O secret já existe (use: gh secret set $SECRET_NAME --repo $REPO --body \"$NOTION_TOKEN\")"
    echo ""
    echo "Tente manualmente:"
    echo "  gh secret set $SECRET_NAME --repo $REPO --body \"seu_token\""
    exit 1
fi

# Aguardar um pouco para o secret ser propagado
echo ""
echo -e "${BLUE}⏳ Aguardando propagação do secret...${NC}"
sleep 3

# Executar workflow
echo ""
echo -e "${BLUE}🚀 Executando workflow...${NC}"
if gh workflow run "$WORKFLOW_FILE" --repo "$REPO" --ref staging; then
    echo -e "${GREEN}✅ Workflow acionado com sucesso!${NC}"
    echo ""
    echo "📋 Para acompanhar a execução:"
    echo "   gh run watch --repo $REPO"
    echo ""
    echo "   Ou acesse:"
    echo "   https://github.com/$REPO/actions"
    echo ""
    
    # Perguntar se quer acompanhar
    read -p "Deseja acompanhar a execução agora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "👀 Acompanhando execução..."
        gh run watch --repo "$REPO"
    fi
else
    echo -e "${RED}❌ Erro ao executar workflow${NC}"
    echo ""
    echo "Tente manualmente:"
    echo "  gh workflow run $WORKFLOW_FILE --repo $REPO --ref staging"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Tudo configurado!${NC}"

