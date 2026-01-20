#!/bin/bash

# Script para atualizar código na VPS e reiniciar servidor
# Execute na VPS: bash ATUALIZAR_VPS_ENZO.sh

set -e

echo "🚀 ATUALIZANDO DASHBOARD ENZO NA VPS"
echo "================================================"
echo ""

# Encontrar diretório do projeto
PROJECT_DIR=$(find /home /root -name "package.json" -path "*founder-s-dashboard*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null || echo "")

if [ -z "$PROJECT_DIR" ]; then
    echo "❌ Projeto não encontrado automaticamente."
    echo "Por favor, navegue até o diretório do projeto e execute:"
    echo "  cd /caminho/do/projeto"
    echo "  bash ATUALIZAR_VPS_ENZO.sh"
    exit 1
fi

echo "📁 Diretório encontrado: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo ""
echo "📥 Fazendo pull do código atualizado..."
git pull origin main || {
    echo "⚠️  Git pull falhou. Tentando continuar..."
}

echo ""
echo "📦 Instalando dependências (se necessário)..."
npm install --production

echo ""
echo "🔨 Fazendo build do frontend..."
npm run build

echo ""
echo "🔄 Reiniciando servidor PM2..."
pm2 restart founder-dashboard || {
    echo "⚠️  PM2 restart falhou. Tentando iniciar..."
    pm2 start ecosystem.config.cjs || {
        echo "❌ Erro ao iniciar PM2. Verifique os logs: pm2 logs"
        exit 1
    }
}

echo ""
echo "✅ Atualização concluída!"
echo ""
echo "📊 Verificando status do servidor..."
pm2 status

echo ""
echo "📝 Para ver os logs: pm2 logs founder-dashboard"
echo "🌐 Para verificar se está funcionando: curl http://localhost:3001/api/enzo/kpis"

