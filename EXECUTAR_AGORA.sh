#!/bin/bash

# Script Rápido - Execute este arquivo para configurar tudo automaticamente

echo "🚀 CONFIGURAÇÃO AUTOMÁTICA - NOTION_TOKEN na VPS"
echo "=================================================="
echo ""

# Verificar se tem os comandos necessários
MISSING_DEPS=false

if ! command -v curl &> /dev/null; then
    echo "❌ curl não está instalado"
    MISSING_DEPS=true
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq não está instalado (será necessário)"
    echo "   Instale com: brew install jq"
    MISSING_DEPS=true
fi

if [ "$MISSING_DEPS" = true ]; then
    echo ""
    echo "📋 Instale as dependências faltantes e execute novamente"
    exit 1
fi

echo "✅ Dependências OK"
echo ""

# Executar script automático
bash scripts/auto-setup-notion-token.sh

