#!/bin/bash
# SCRIPT AUTOMÁTICO COMPLETO - Execute na VPS
# Este script faz TUDO automaticamente

set -e

PROJECT_PATH="/var/www/founder-dashboard"
PORT=3001

echo "🚀 INICIANDO CORREÇÃO AUTOMÁTICA"
echo "================================"
echo ""

# Verificar se diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório não encontrado: $PROJECT_PATH"
    ALTERNATIVE=$(find / -type d -name "founder-dashboard" 2>/dev/null | head -1)
    if [ -n "$ALTERNATIVE" ]; then
        PROJECT_PATH="$ALTERNATIVE"
        echo "✅ Encontrado em: $PROJECT_PATH"
    else
        echo "❌ Projeto não encontrado!"
        exit 1
    fi
fi

cd "$PROJECT_PATH" || exit 1
echo "📁 Diretório: $(pwd)"
echo ""

# LIMPAR TUDO
echo "🧹 Limpando processos antigos..."
pm2 delete founder-dashboard 2>/dev/null || true
pm2 stop founder-dashboard 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 2

lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
pkill -f "node.*$PORT" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "founder-dashboard" 2>/dev/null || true
sleep 3
echo "✅ Limpeza concluída"
echo ""

# VERIFICAR .env.local
echo "⚙️  Verificando configuração..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local não existe!"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo "✅ Criado a partir do template"
        echo "⚠️  CONFIGURE O NOTION_TOKEN: nano .env.local"
    else
        echo "❌ Template não encontrado!"
        exit 1
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    echo "⚠️  NOTION_TOKEN não configurado!"
    echo "   Execute: nano .env.local"
    echo "   Adicione: NOTION_TOKEN=seu_token_aqui"
    exit 1
fi
echo "✅ Configuração OK"
echo ""

# INSTALAR DEPENDÊNCIAS
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando..."
    npm install
else
    echo "✅ Dependências OK"
fi
echo ""

# BUILD
echo "🔨 Fazendo build..."
rm -rf dist 2>/dev/null || true
npm run build || {
    echo "❌ Erro no build!"
    rm -rf dist node_modules/.vite 2>/dev/null || true
    npm run build || {
        echo "❌ Build falhou!"
        exit 1
    }
}

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Pasta dist vazia!"
    exit 1
fi
echo "✅ Build concluído"
echo ""

# CARREGAR VARIÁVEIS
echo "🔐 Carregando variáveis..."
set -a
source .env.local
set +a

if [ -z "$NOTION_TOKEN" ] || [ "$NOTION_TOKEN" = "<<<INSERIR_TOKEN_AQUI>>>" ]; then
    echo "❌ NOTION_TOKEN não configurado!"
    exit 1
fi

export NODE_ENV=production
export PORT=$PORT
echo "✅ Variáveis carregadas"
echo ""

# LIBERAR PORTA
echo "🔓 Liberando porta $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ Porta livre"
echo ""

# INICIAR PM2
echo "🚀 Iniciando servidor..."
pm2 start npm \
    --name "founder-dashboard" \
    --cwd "$PROJECT_PATH" \
    -- start \
    --update-env \
    --merge-logs \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z"

pm2 save
echo "✅ Servidor iniciado"
echo ""

# AGUARDAR
echo "⏳ Aguardando servidor iniciar (30 segundos)..."
for i in {1..6}; do
    sleep 5
    PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ Servidor online!"
        break
    fi
    echo "   Aguardando... ($i/6)"
done
echo ""

# VERIFICAÇÕES
echo "🔍 Verificando..."
echo ""

PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
echo "📊 Status PM2: $PM2_STATUS"
pm2 list | grep founder-dashboard || echo "Processo não encontrado!"
echo ""

HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null || echo "000")
echo "📊 Health Check: $HEALTH_RESPONSE"
if [ "$HEALTH_RESPONSE" = "200" ]; then
    curl -s http://localhost:$PORT/api/health
    echo ""
    echo "✅✅✅ SUCESSO! SERVIDOR FUNCIONANDO! ✅✅✅"
else
    echo "❌ Health check falhou"
    echo ""
    echo "📋 Logs:"
    pm2 logs founder-dashboard --lines 50 --nostream
    exit 1
fi

echo ""
echo "🌐 Acesse: https://frtechltda.com.br/dashboard"
echo ""





