#!/bin/bash

# Script para acionar o workflow de correção Notion via GitHub Actions
# Requer GitHub CLI (gh) instalado e autenticado

set -e

echo "🚀 Acionando workflow de correção Notion na VPS..."
echo ""

# Verificar se GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo ""
    echo "Opções para executar a correção:"
    echo ""
    echo "1. Instalar GitHub CLI e executar novamente:"
    echo "   brew install gh  # macOS"
    echo "   gh auth login"
    echo ""
    echo "2. Executar manualmente via GitHub:"
    echo "   - Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions"
    echo "   - Clique em 'Fix Notion Connection on VPS'"
    echo "   - Clique em 'Run workflow'"
    echo "   - Selecione branch 'staging'"
    echo ""
    echo "3. Executar diretamente na VPS:"
    echo "   ssh usuario@vps 'cd /caminho/do/projeto && git pull && bash scripts/fix-notion-connection-vps.sh'"
    echo ""
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI não está autenticado."
    echo "Execute: gh auth login"
    exit 1
fi

# Acionar workflow
echo "✅ GitHub CLI encontrado e autenticado"
echo "🔄 Acionando workflow 'Fix Notion Connection on VPS'..."
echo ""

REPO="frsolucoesdiretoria-collab/founder-s-dashboard"
WORKFLOW="fix-notion-connection.yml"
BRANCH="staging"

gh workflow run "$WORKFLOW" \
    --repo "$REPO" \
    --ref "$BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Workflow acionado com sucesso!"
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
    echo ""
    echo "❌ Erro ao acionar workflow"
    echo ""
    echo "Tente executar manualmente:"
    echo "   gh workflow run $WORKFLOW --repo $REPO --ref $BRANCH"
    exit 1
fi

