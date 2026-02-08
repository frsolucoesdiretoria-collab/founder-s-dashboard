#!/bin/bash

# Script para facilitar o commit e push disparando o deploy automático
# Uso: ./scripts/git-deploy.sh "sua mensagem de commit"

set -e

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "❌ Erro: Você precisa fornecer uma mensagem de commit."
    echo "Exemplo: ./scripts/git-deploy.sh \"Ajuste no design do cabeçalho\""
    exit 1
fi

echo "🚀 Iniciando processo de deploy..."

# 1. Build local para garantir que não há erros
echo "📦 Rodando build local..."
npm run build

# 2. Git
echo "📝 Adicionando alterações..."
git add .

echo "💾 Criando commit..."
git commit -m "$MESSAGE"

echo "📤 Enviando para o GitHub (Deploy automático)..."
git push origin main

echo ""
echo "✅ Alterações enviadas com sucesso!"
echo "🌐 O deploy estará pronto em alguns instantes: https://frtechltda.com.br/v4-9"
