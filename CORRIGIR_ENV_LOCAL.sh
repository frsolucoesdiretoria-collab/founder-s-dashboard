#!/bin/bash
# Script para corrigir erro no .env.local

PROJECT_PATH="/var/www/founder-dashboard"

echo "🔧 CORRIGINDO ERRO NO .env.local"
echo "================================="
echo ""

cd "$PROJECT_PATH" || exit 1

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local não encontrado!"
    exit 1
fi

echo "✅ Arquivo encontrado"
echo ""

# Fazer backup
echo "📦 Fazendo backup..."
cp .env.local .env.local.backup
echo "✅ Backup criado: .env.local.backup"
echo ""

# Corrigir linhas com <<< e >>>
echo "🔧 Corrigindo caracteres problemáticos..."
sed -i 's/<<<//g' .env.local
sed -i 's/>>>//g' .env.local
echo "✅ Caracteres removidos"
echo ""

# Verificar se há erros de sintaxe
echo "🔍 Verificando sintaxe..."
if bash -n .env.local 2>/dev/null; then
    echo "✅ Sintaxe OK"
else
    echo "⚠️  Ainda há erros. Verificando linha 9..."
    sed -n '9p' .env.local
fi
echo ""

# Mostrar linha 9 corrigida
echo "📋 Linha 9 (corrigida):"
sed -n '9p' .env.local
echo ""

echo "✅ Correção concluída!"
echo ""
echo "Agora execute novamente o comando de inicialização."






