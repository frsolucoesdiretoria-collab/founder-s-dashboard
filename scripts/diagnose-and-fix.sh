#!/bin/bash

# Script de Diagnóstico e Correção Automática
# Execute: bash scripts/diagnose-and-fix.sh

set -e

echo "🔍 DIAGNÓSTICO E CORREÇÃO AUTOMÁTICA"
echo "===================================="
echo ""

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

cd "$PROJECT_PATH" 2>/dev/null || {
  echo "❌ Diretório não encontrado: $PROJECT_PATH"
  echo "   Execute este script na VPS ou ajuste PROJECT_PATH"
  exit 1
}

echo "📁 Diretório: $(pwd)"
echo ""

# 1. Verificar .env.local
echo "1️⃣  Verificando .env.local..."
if [ ! -f .env.local ]; then
  echo "   ❌ .env.local não existe!"
  echo "   Criando..."
  if [ -f env.local.example ]; then
    cp env.local.example .env.local
    echo "   ✅ Criado a partir do template"
  else
    echo "   ❌ Template não encontrado!"
    exit 1
  fi
else
  echo "   ✅ .env.local existe"
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local || grep -q "^NOTION_TOKEN=$" .env.local; then
  echo "   ❌ NOTION_TOKEN não configurado!"
  echo "   Configure antes de continuar"
  exit 1
else
  echo "   ✅ NOTION_TOKEN configurado"
fi

# 2. Verificar node_modules
echo ""
echo "2️⃣  Verificando dependências..."
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "   ⚠️  node_modules vazio ou não existe"
  echo "   Instalando dependências..."
  rm -rf node_modules package-lock.json 2>/dev/null || true
  npm cache clean --force 2>/dev/null || true
  npm install --include=dev --legacy-peer-deps --no-audit --no-fund
  echo "   ✅ Dependências instaladas"
else
  echo "   ✅ node_modules existe"
fi

# 3. Verificar build
echo ""
echo "3️⃣  Verificando build..."
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "   ⚠️  dist não existe ou está vazio"
  echo "   Fazendo build..."
  NODE_ENV=production npm run build
  echo "   ✅ Build concluído"
else
  echo "   ✅ dist existe"
fi

# 4. Verificar PM2
echo ""
echo "4️⃣  Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
  echo "   ⚠️  PM2 não instalado"
  echo "   Instalando..."
  npm install -g pm2
  echo "   ✅ PM2 instalado"
else
  echo "   ✅ PM2 instalado"
fi

# 5. Verificar servidor
echo ""
echo "5️⃣  Verificando servidor..."
PM2_STATUS=$(pm2 list | grep "$PM2_NAME" | awk '{print $10}' 2>/dev/null || echo "notfound")

if [ "$PM2_STATUS" != "online" ]; then
  echo "   ⚠️  Servidor não está online (Status: $PM2_STATUS)"
  echo "   Reiniciando..."
  
  # Parar processo antigo
  pm2 stop "$PM2_NAME" 2>/dev/null || true
  pm2 delete "$PM2_NAME" 2>/dev/null || true
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  sleep 2
  
  # Carregar .env.local
  set -a
  source .env.local 2>/dev/null || true
  set +a
  export NODE_ENV=production
  export PORT=3001
  
  # Iniciar
  if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs
  else
    pm2 start npm --name "$PM2_NAME" -- start
  fi
  pm2 save
  
  echo "   ⏳ Aguardando servidor iniciar..."
  sleep 15
  
  # Verificar novamente
  PM2_STATUS=$(pm2 list | grep "$PM2_NAME" | awk '{print $10}' 2>/dev/null || echo "notfound")
  if [ "$PM2_STATUS" = "online" ]; then
    echo "   ✅ Servidor iniciado!"
  else
    echo "   ❌ Servidor não iniciou"
    echo "   Logs:"
    pm2 logs "$PM2_NAME" --lines 30 --nostream
    exit 1
  fi
else
  echo "   ✅ Servidor está online"
fi

# 6. Verificar API
echo ""
echo "6️⃣  Verificando API..."
if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "   ✅ API está respondendo!"
  curl http://localhost:3001/api/health
  echo ""
else
  echo "   ❌ API não está respondendo"
  echo "   Logs:"
  pm2 logs "$PM2_NAME" --lines 30 --nostream
  exit 1
fi

# Resumo final
echo ""
echo "================================"
echo "✅ TUDO FUNCIONANDO!"
echo ""
echo "📊 Status:"
pm2 list | grep "$PM2_NAME"
echo ""
echo "🌐 Site disponível em:"
echo "   https://frtechltda.com.br/dashboard"
echo ""

