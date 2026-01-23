#!/bin/bash

# 🚀 DEPLOY FINANCE V2 NA VPS
# Execute este comando DIRETAMENTE na VPS (SSH):

set -e

echo "🚀 Iniciando deploy Finance Flora V2..."
echo ""

# Ir para o diretório do projeto
cd /var/www/founder-dashboard

echo "📦 Atualizando código do GitHub..."
git fetch origin main
git reset --hard origin/main

echo ""
echo "📥 Instalando dependências..."
npm install

echo ""
echo "🔨 Fazendo build (inclui Finance V2)..."
npm run build

echo ""
echo "🔄 Reiniciando servidor..."
pm2 restart founder-dashboard

echo ""
echo "💾 Salvando configuração PM2..."
pm2 save

echo ""
echo "⏳ Aguardando servidor iniciar..."
sleep 5

echo ""
echo "✅ Deploy Finance V2 concluído!"
echo ""
echo "🌐 ACESSO:"
echo "   https://frtechltda.com.br/finance/flora-v2"
echo ""
echo "📊 Status PM2:"
pm2 status

echo ""
echo "🔍 Testando servidor..."
curl -s http://localhost:3001/api/health && echo "✅ API OK" || echo "⚠️ Verificar logs"

echo ""
echo "📋 Últimos logs:"
pm2 logs founder-dashboard --lines 15 --nostream

echo ""
echo "🎯 Finance V2 está no ar!"
echo "   URL: https://frtechltda.com.br/finance/flora-v2"
