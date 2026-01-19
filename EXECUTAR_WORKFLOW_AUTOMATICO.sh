#!/bin/bash

# Script que executa o workflow automaticamente via API do GitHub
# Não precisa usar a interface web!

set -e

echo "🚀 EXECUTANDO WORKFLOW AUTOMATICAMENTE"
echo "======================================="
echo ""

REPO="frsolucoesdiretoria-collab/founder-s-dashboard"
WORKFLOW_FILE="fix-notion-connection.yml"

# Verificar se tem GitHub CLI
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI encontrado"
    
    # Verificar autenticação
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI autenticado"
        echo ""
        echo "🚀 Executando workflow..."
        
        if gh workflow run "$WORKFLOW_FILE" --repo "$REPO" --ref staging; then
            echo ""
            echo "✅ Workflow executado com sucesso!"
            echo ""
            echo "📋 Acompanhe em:"
            echo "   https://github.com/$REPO/actions"
            echo ""
            
            # Tentar abrir no navegador
            if command -v open &> /dev/null; then
                sleep 2
                open "https://github.com/$REPO/actions"
            fi
            
            exit 0
        else
            echo "❌ Erro ao executar workflow"
            exit 1
        fi
    else
        echo "⚠️  GitHub CLI não está autenticado"
        echo ""
        echo "Execute: gh auth login"
        exit 1
    fi
else
    echo "⚠️  GitHub CLI não está instalado"
    echo ""
    echo "Instale com:"
    echo "  brew install gh"
    echo ""
    echo "Depois execute:"
    echo "  gh auth login"
    echo "  bash EXECUTAR_WORKFLOW_AUTOMATICO.sh"
    exit 1
fi

