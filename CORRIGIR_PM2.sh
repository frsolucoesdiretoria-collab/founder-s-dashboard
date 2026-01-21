#!/bin/bash

# Script para corrigir PM2 - Configurar diretório correto

PROJECT_PATH="/var/www/founder-dashboard"

echo "🔧 CORRIGINDO PM2 - Configurando diretório correto"
echo "=================================================="
echo ""

# Verificar se diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório não encontrado: $PROJECT_PATH"
    exit 1
fi

echo "✅ Diretório encontrado: $PROJECT_PATH"
cd "$PROJECT_PATH" || exit 1

# Parar e deletar processo antigo
echo ""
echo "1️⃣  Parando processo antigo..."
pm2 stop founder-dashboard 2>/dev/null || true
pm2 delete founder-dashboard 2>/dev/null || true
sleep 2

# Verificar .env.local
echo ""
echo "2️⃣  Verificando configuração..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local não encontrado!"
    echo "   Criando a partir do template..."
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo "⚠️  ATENÇÃO: Configure o NOTION_TOKEN no .env.local"
    else
        echo "❌ env.local.example também não encontrado!"
        exit 1
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    echo "⚠️  NOTION_TOKEN não configurado ou está com placeholder"
    echo "   Edite .env.local e configure o NOTION_TOKEN"
fi

# Verificar build
echo ""
echo "3️⃣  Verificando build..."
if [ ! -d "dist" ]; then
    echo "⚠️  Pasta dist não encontrada. Fazendo build..."
    npm run build || {
        echo "❌ Erro ao fazer build"
        exit 1
    }
else
    echo "✅ Pasta dist existe"
fi

# Liberar porta
echo ""
echo "4️⃣  Liberando porta 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Carregar variáveis de ambiente
echo ""
echo "5️⃣  Carregando variáveis de ambiente..."
set -a
source .env.local
set +a

# Verificar se NOTION_TOKEN foi carregado
if [ -z "$NOTION_TOKEN" ]; then
    echo "❌ NOTION_TOKEN não foi carregado!"
    echo "   Verifique o arquivo .env.local"
    exit 1
fi

echo "✅ Variáveis carregadas"

# Iniciar PM2 com diretório correto
echo ""
echo "6️⃣  Iniciando PM2 com diretório correto..."
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "$PROJECT_PATH" -- start
pm2 save

# Aguardar
echo ""
echo "⏳ Aguardando servidor iniciar..."
sleep 10

# Verificar status
echo ""
echo "7️⃣  Verificando status..."
if pm2 list | grep -q "founder-dashboard.*online"; then
    echo "✅ PM2 está rodando!"
else
    echo "❌ PM2 não está rodando"
    echo ""
    echo "📋 Logs do erro:"
    pm2 logs founder-dashboard --lines 50 --nostream
    exit 1
fi

# Testar endpoint
echo ""
echo "8️⃣  Testando endpoint..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check OK (status: $HEALTH)"
    curl -s http://localhost:3001/api/health | head -c 100
    echo ""
else
    echo "❌ Health check falhou (status: $HEALTH)"
    echo ""
    echo "📋 Logs recentes:"
    pm2 logs founder-dashboard --lines 30 --nostream
    exit 1
fi

echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "🌐 Teste: https://frtechltda.com.br"
echo ""
echo "📋 Para ver logs: pm2 logs founder-dashboard"






