#!/bin/bash
# FIX COMPLETO PARA ERRO 502 - Execute na VPS
# Este script corrige TODOS os problemas conhecidos

set -e

PROJECT_PATH="/var/www/founder-dashboard"
PORT=3001

echo "🔧 FIX COMPLETO PARA ERRO 502"
echo "=============================="
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

# PASSO 1: LIMPAR TUDO
echo "1️⃣  LIMPANDO PROCESSOS ANTIGOS..."
pm2 delete founder-dashboard 2>/dev/null || true
pm2 stop founder-dashboard 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 2

# Matar TODOS os processos relacionados
echo "   Matando processos na porta $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
pkill -f "node.*$PORT" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "founder-dashboard" 2>/dev/null || true
sleep 3
echo "✅ Limpeza concluída"
echo ""

# PASSO 2: VERIFICAR/CRIAR .env.local
echo "2️⃣  VERIFICANDO CONFIGURAÇÃO..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local não existe!"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo "✅ Criado a partir do template"
    else
        echo "❌ Template não encontrado!"
        exit 1
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    echo "⚠️  NOTION_TOKEN não configurado!"
    echo "   Edite: nano $PROJECT_PATH/.env.local"
    echo "   Adicione: NOTION_TOKEN=seu_token_aqui"
fi
echo "✅ Configuração verificada"
echo ""

# PASSO 3: INSTALAR DEPENDÊNCIAS
echo "3️⃣  VERIFICANDO DEPENDÊNCIAS..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "⚠️  Instalando dependências..."
    npm install --production=false
else
    echo "✅ Dependências OK"
fi
echo ""

# PASSO 4: BUILD
echo "4️⃣  FAZENDO BUILD..."
rm -rf dist 2>/dev/null || true
npm run build || {
    echo "❌ Erro no build!"
    echo "   Limpando cache..."
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

# PASSO 5: CARREGAR VARIÁVEIS
echo "5️⃣  CARREGANDO VARIÁVEIS..."
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

# PASSO 6: VERIFICAR PORTA
echo "6️⃣  VERIFICANDO PORTA $PORT..."
if lsof -i:$PORT >/dev/null 2>&1; then
    echo "⚠️  Porta ainda em uso! Matando processos..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "✅ Porta livre"
echo ""

# PASSO 7: INICIAR PM2
echo "7️⃣  INICIANDO SERVIDOR..."
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

# PASSO 8: AGUARDAR E VERIFICAR
echo "⏳ Aguardando servidor iniciar (25 segundos)..."
sleep 25

# Verificar múltiplas vezes
for i in {1..6}; do
    PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ PM2 está online!"
        break
    fi
    echo "   Tentativa $i/6... Status: $PM2_STATUS"
    sleep 5
done
echo ""

# PASSO 9: VERIFICAÇÕES FINAIS
echo "8️⃣  VERIFICAÇÕES FINAIS..."
echo ""

# Status PM2
PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
echo "📊 Status PM2: $PM2_STATUS"
pm2 list | grep founder-dashboard || echo "Processo não encontrado!"
echo ""

# Porta
echo "📊 Porta $PORT:"
lsof -i:$PORT || echo "Porta não está em uso!"
echo ""

# Health check
echo "📊 Health Check:"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check OK (status: $HEALTH_RESPONSE)"
    curl -s http://localhost:$PORT/api/health
    echo ""
else
    echo "❌ Health check falhou (status: $HEALTH_RESPONSE)"
    echo "   Tentando curl completo:"
    curl -v http://localhost:$PORT/api/health 2>&1 | head -20
fi
echo ""

# Logs
echo "📊 Últimas 30 linhas de log:"
pm2 logs founder-dashboard --lines 30 --nostream 2>/dev/null || echo "Não foi possível ler logs"
echo ""

# RESUMO
echo "=============================="
if [ "$PM2_STATUS" = "online" ] && [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅✅✅ SUCESSO! SERVIDOR ESTÁ FUNCIONANDO! ✅✅✅"
    echo ""
    echo "🌐 Acesse: https://frtechltda.com.br/dashboard"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs: pm2 logs founder-dashboard"
    echo "   Reiniciar: pm2 restart founder-dashboard"
    echo "   Status: pm2 list"
else
    echo "⚠️  SERVIDOR PODE NÃO ESTAR FUNCIONANDO CORRETAMENTE"
    echo ""
    echo "Status PM2: $PM2_STATUS"
    echo "Health Check: $HEALTH_RESPONSE"
    echo ""
    echo "📋 Execute para ver logs completos:"
    echo "   pm2 logs founder-dashboard --lines 100"
fi
echo ""






