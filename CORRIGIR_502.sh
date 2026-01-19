#!/bin/bash

# Script para corrigir erro 502 Bad Gateway

echo "🔧 CORRIGINDO ERRO 502"
echo "======================"
echo ""

# Verificar se PM2 está rodando
echo "1️⃣  Verificando PM2..."
pm2 list | grep founder-dashboard || echo "⚠️  PM2 não está rodando"

# Parar e deletar processo antigo
echo ""
echo "2️⃣  Parando processo antigo..."
pm2 stop founder-dashboard 2>/dev/null || true
pm2 delete founder-dashboard 2>/dev/null || true
sleep 2

# Carregar variáveis de ambiente
echo ""
echo "3️⃣  Carregando variáveis de ambiente..."
set -a
[ -f .env.local ] && source .env.local 2>/dev/null || true
set +a

# Verificar se NOTION_TOKEN está configurado
if [ -z "$NOTION_TOKEN" ]; then
    echo "❌ NOTION_TOKEN não encontrado nas variáveis de ambiente"
    echo "Verificando .env.local..."
    if grep -q "^NOTION_TOKEN=" .env.local; then
        echo "✅ NOTION_TOKEN encontrado no .env.local"
        # Recarregar
        set -a
        source .env.local
        set +a
    else
        echo "❌ NOTION_TOKEN não encontrado no .env.local"
        exit 1
    fi
else
    echo "✅ NOTION_TOKEN carregado"
fi

# Verificar porta
PORT=${PORT:-3001}
echo ""
echo "4️⃣  Porta configurada: $PORT"

# Verificar se porta está em uso
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Porta $PORT já está em uso"
    echo "Matando processo na porta $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Ir para o diretório do projeto
PROJECT_PATH=$(pwd)
echo ""
echo "5️⃣  Diretório do projeto: $PROJECT_PATH"

# Verificar se dist existe
if [ ! -d "dist" ]; then
    echo "⚠️  Pasta dist não encontrada. Executando build..."
    npm run build || {
        echo "❌ Erro ao fazer build"
        exit 1
    }
fi

# Iniciar PM2 com variáveis de ambiente atualizadas
echo ""
echo "6️⃣  Iniciando PM2..."
cd $PROJECT_PATH
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start --update-env 2>&1 || {
    echo "⚠️  Tentando método alternativo..."
    pm2 start "npm start" --name "founder-dashboard" --update-env
}

pm2 save 2>/dev/null || true

# Aguardar alguns segundos
echo ""
echo "⏳ Aguardando servidor iniciar..."
sleep 5

# Verificar se iniciou
echo ""
echo "7️⃣  Verificando status..."
if pm2 list | grep -q "founder-dashboard.*online"; then
    echo "✅ PM2 está rodando"
else
    echo "❌ PM2 não está rodando"
    echo ""
    echo "📋 Logs do PM2:"
    pm2 logs founder-dashboard --lines 30 --nostream 2>/dev/null || echo "Não foi possível ler logs"
    exit 1
fi

# Testar endpoints
echo ""
echo "8️⃣  Testando endpoints..."
sleep 3

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check OK (status: $HEALTH)"
else
    echo "❌ Health check falhou (status: $HEALTH)"
    echo ""
    echo "📋 Logs recentes:"
    pm2 logs founder-dashboard --lines 50 --nostream 2>/dev/null || true
    echo ""
    echo "🔍 Verifique os logs acima para identificar o problema"
    exit 1
fi

# Testar KPIs
KPIS_RESPONSE=$(curl -s http://localhost:$PORT/api/enzo/kpis 2>/dev/null || echo "[]")
if echo "$KPIS_RESPONSE" | grep -q '"id"'; then
    KPIS_COUNT=$(echo "$KPIS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "✅ KPIs: $KPIS_COUNT encontrado(s)"
else
    echo "⚠️  KPIs: array vazio ou erro"
    echo "Resposta: $(echo "$KPIS_RESPONSE" | head -c 200)"
fi

echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "🌐 Teste: https://frtechltda.com.br/dashboard-enzo"

