#!/bin/bash

# Script Automático Completo - Configurar NOTION_TOKEN na VPS
# Este script tenta fazer tudo automaticamente usando a API do GitHub

set -e

echo "🚀 SETUP AUTOMÁTICO - NOTION_TOKEN na VPS"
echo "=========================================="
echo ""

REPO="frsolucoesdiretoria-collab/founder-s-dashboard"
SECRET_NAME="NOTION_TOKEN_VPS"
WORKFLOW_FILE="setup-notion-token.yml"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se tem curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl não está instalado${NC}"
    exit 1
fi

# Verificar se tem jq (para processar JSON)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq não está instalado (necessário para processar JSON)${NC}"
    echo "Instalando jq..."
    if command -v brew &> /dev/null; then
        brew install jq
    else
        echo -e "${RED}❌ Não foi possível instalar jq automaticamente${NC}"
        echo "Instale manualmente: https://stedolan.github.io/jq/download/"
        exit 1
    fi
fi

echo -e "${BLUE}📋 Este script precisa de um token de acesso pessoal do GitHub${NC}"
echo "   (com permissões: repo, admin:repo_hook, workflow)"
echo ""
echo "Como obter:"
echo "  1. Acesse: https://github.com/settings/tokens"
echo "  2. Clique em 'Generate new token' > 'Generate new token (classic)'"
echo "  3. Dê um nome (ex: 'Setup Notion Token')"
echo "  4. Marque: repo, admin:repo_hook, workflow"
echo "  5. Clique em 'Generate token'"
echo "  6. Copie o token (você só verá uma vez!)"
echo ""

read -sp "GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token do GitHub não fornecido${NC}"
    exit 1
fi

# Verificar se o token funciona
echo ""
echo -e "${BLUE}🔍 Verificando token do GitHub...${NC}"
USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | jq -r '.login' 2>/dev/null || echo "")

if [ -z "$USER" ] || [ "$USER" == "null" ]; then
    echo -e "${RED}❌ Token inválido ou sem permissões${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado como: $USER${NC}"

# Pedir NOTION_TOKEN
echo ""
echo -e "${BLUE}🔑 Informe o NOTION_TOKEN do Notion:${NC}"
echo "   (Obtenha em: https://www.notion.so/my-integrations)"
read -sp "NOTION_TOKEN: " NOTION_TOKEN
echo ""

if [ -z "$NOTION_TOKEN" ]; then
    echo -e "${RED}❌ NOTION_TOKEN não fornecido${NC}"
    exit 1
fi

# Adicionar secret via API do GitHub
echo ""
echo -e "${BLUE}📝 Adicionando secret '$SECRET_NAME' ao GitHub...${NC}"

# GitHub API para adicionar secret requer criptografia especial
# Vamos usar uma abordagem mais simples: gh CLI se disponível, senão instruções

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "Usando GitHub CLI..."
    if gh secret set "$SECRET_NAME" --repo "$REPO" --body "$NOTION_TOKEN" 2>&1; then
        echo -e "${GREEN}✅ Secret adicionado com sucesso!${NC}"
    else
        echo -e "${YELLOW}⚠️  Erro ao adicionar via CLI, tentando via API...${NC}"
        # Continuar para tentar via API
    fi
fi

# Tentar via API do GitHub (requer permissões especiais)
echo "Tentando via API do GitHub..."
SECRET_RESPONSE=$(curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO/actions/secrets/$SECRET_NAME" \
  -d "{\"encrypted_value\":\"$NOTION_TOKEN\",\"key_id\":\"$(curl -s -H \"Authorization: token $GITHUB_TOKEN\" \"https://api.github.com/repos/$REPO/actions/secrets/public-key\" | jq -r '.key_id')\"}" 2>&1)

if echo "$SECRET_RESPONSE" | grep -q "204\|201\|200"; then
    echo -e "${GREEN}✅ Secret adicionado com sucesso via API!${NC}"
elif echo "$SECRET_RESPONSE" | grep -q "404\|403\|401"; then
    echo -e "${YELLOW}⚠️  Não foi possível adicionar secret via API (sem permissões)${NC}"
    echo ""
    echo -e "${BLUE}📋 Adicione manualmente:${NC}"
    echo "   1. Acesse: https://github.com/$REPO/settings/secrets/actions"
    echo "   2. Clique em 'New repository secret'"
    echo "   3. Name: $SECRET_NAME"
    echo "   4. Value: $NOTION_TOKEN"
    echo "   5. Clique em 'Add secret'"
    echo ""
    read -p "Pressione Enter após adicionar o secret manualmente..."
else
    echo -e "${YELLOW}⚠️  Resposta inesperada da API${NC}"
    echo "Resposta: $SECRET_RESPONSE"
    echo ""
    echo -e "${BLUE}📋 Adicione manualmente:${NC}"
    echo "   1. Acesse: https://github.com/$REPO/settings/secrets/actions"
    echo "   2. Name: $SECRET_NAME"
    echo "   3. Value: $NOTION_TOKEN"
    read -p "Pressione Enter após adicionar..."
fi

# Executar workflow
echo ""
echo -e "${BLUE}🚀 Executando workflow...${NC}"

WORKFLOW_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/actions/workflows/$WORKFLOW_FILE/dispatches" \
  -d "{\"ref\":\"staging\"}" 2>&1)

if echo "$WORKFLOW_RESPONSE" | grep -q "204\|201"; then
    echo -e "${GREEN}✅ Workflow acionado com sucesso!${NC}"
    echo ""
    echo "📋 Acompanhe a execução em:"
    echo "   https://github.com/$REPO/actions"
    echo ""
    
    # Tentar abrir no navegador
    if command -v open &> /dev/null; then
        echo "Abrindo no navegador..."
        open "https://github.com/$REPO/actions"
    fi
else
    echo -e "${YELLOW}⚠️  Erro ao executar workflow${NC}"
    echo "Resposta: $WORKFLOW_RESPONSE"
    echo ""
    echo -e "${BLUE}📋 Execute manualmente:${NC}"
    echo "   1. Acesse: https://github.com/$REPO/actions"
    echo "   2. Clique em 'Setup Notion Token on VPS'"
    echo "   3. Clique em 'Run workflow'"
    echo "   4. Selecione branch 'staging'"
fi

echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"

