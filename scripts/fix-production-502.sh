#!/bin/bash

# Script Completo para Corrigir Erro 502 Bad Gateway
# Este script resolve todos os problemas comuns que causam erro 502

set -e

PROJECT_PATH="/var/www/founder-dashboard"
PM2_NAME="founder-dashboard"

echo "🚀 CORREÇÃO COMPLETA DO ERRO 502"
echo "=================================="
echo ""

# Verificar se diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Diretório não encontrado: $PROJECT_PATH"
    echo "   Procurando alternativas..."
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

# 1. PARAR TUDO
echo "1️⃣  PARANDO TODOS OS PROCESSOS..."
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 stop "$PM2_NAME" 2>/dev/null || true
sleep 2

# Matar TODOS os processos na porta 3001
echo "   Matando processos na porta 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 3

# 2. VERIFICAR E CRIAR .env.local
echo ""
echo "2️⃣  VERIFICANDO .env.local..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local não existe! Criando..."
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        echo "✅ Criado a partir do template"
        echo "❌ ERRO: Configure o NOTION_TOKEN no .env.local antes de continuar!"
        exit 1
    else
        echo "❌ Template não encontrado. Criando básico..."
        cat > .env.local << 'EOF'
NOTION_TOKEN=<<<CONFIGURE_SEU_TOKEN_AQUI>>>
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88
PORT=3001
NODE_ENV=production
EOF
        echo "❌ ERRO: Configure o NOTION_TOKEN no .env.local!"
        exit 1
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local || grep -q "^NOTION_TOKEN=$" .env.local; then
    echo "❌ ERRO CRÍTICO: NOTION_TOKEN não está configurado no .env.local!"
    echo "   Edite: nano $PROJECT_PATH/.env.local"
    exit 1
fi

echo "✅ .env.local existe e NOTION_TOKEN está configurado"

# 3. INSTALAR DEPENDÊNCIAS
echo ""
echo "3️⃣  VERIFICANDO DEPENDÊNCIAS..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado. Instalando..."
    npm install --include=dev
else
    echo "✅ node_modules existe"
    # Atualizar dependências críticas
    echo "   Atualizando dependências..."
    npm install --include=dev
fi

# 4. BUILD
echo ""
echo "4️⃣  FAZENDO BUILD..."
# Limpar build anterior
rm -rf dist node_modules/.vite 2>/dev/null || true

# Fazer build
NODE_ENV=production npm run build || {
    echo "❌ Erro no build!"
    echo "   Verificando logs acima..."
    exit 1
}

# Verificar se dist existe e tem conteúdo
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Pasta dist vazia ou não existe após build!"
    exit 1
fi

echo "✅ Build concluído com sucesso"

# 5. CARREGAR VARIÁVEIS DE AMBIENTE
echo ""
echo "5️⃣  CARREGANDO VARIÁVEIS DE AMBIENTE..."
set -a
source .env.local 2>/dev/null || true
set +a

# Garantir variáveis críticas
export NODE_ENV=production
export PORT=3001

# Verificar se NOTION_TOKEN foi carregado
if [ -z "$NOTION_TOKEN" ] || [ "$NOTION_TOKEN" = "<<<CONFIGURE_SEU_TOKEN_AQUI>>>" ]; then
    echo "❌ NOTION_TOKEN não configurado ou inválido!"
    exit 1
fi

echo "✅ Variáveis carregadas"
echo "   NOTION_TOKEN: ${NOTION_TOKEN:0:20}..."
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"

# 6. VERIFICAR PORTA
echo ""
echo "6️⃣  VERIFICANDO PORTA 3001..."
if lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  Porta 3001 ainda está em uso!"
    lsof -i:3001
    echo "   Matando processos..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 7. INICIAR PM2 COM CONFIGURAÇÃO CORRETA
echo ""
echo "7️⃣  INICIANDO SERVIDOR COM PM2..."

# Iniciar com variáveis de ambiente explícitas
cd "$PROJECT_PATH"
pm2 start npm --name "$PM2_NAME" -- start --update-env
pm2 save

# 8. AGUARDAR E VERIFICAR
echo ""
echo "⏳ Aguardando servidor iniciar (15 segundos)..."
sleep 15

# Verificar status múltiplas vezes
MAX_RETRIES=5
RETRY_COUNT=0
SERVER_ONLINE=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    PM2_STATUS=$(pm2 list | grep "$PM2_NAME" | awk '{print $10}' || echo "notfound")
    if [ "$PM2_STATUS" = "online" ]; then
        SERVER_ONLINE=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Tentativa $RETRY_COUNT/$MAX_RETRIES - Status: $PM2_STATUS"
    sleep 3
done

# 9. VERIFICAÇÕES FINAIS
echo ""
echo "8️⃣  VERIFICAÇÕES FINAIS..."

# Status PM2
PM2_STATUS=$(pm2 list | grep "$PM2_NAME" | awk '{print $10}' || echo "notfound")
if [ "$PM2_STATUS" != "online" ]; then
    echo "❌ PM2 não está online! Status: $PM2_STATUS"
    echo ""
    echo "📋 Logs do erro (últimas 100 linhas):"
    pm2 logs "$PM2_NAME" --lines 100 --nostream
    exit 1
fi

echo "✅ PM2 está online"

# Porta
if ! lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  Porta 3001 não está em uso!"
    echo "   Verificando logs..."
    pm2 logs "$PM2_NAME" --lines 50 --nostream
    exit 1
fi

echo "✅ Porta 3001 está em uso"

# Health check
echo ""
echo "9️⃣  TESTANDO ENDPOINTS..."
RETRY_COUNT=0
API_RESPONDING=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        API_RESPONDING=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Tentativa $RETRY_COUNT/$MAX_RETRIES - Status HTTP: $HEALTH_RESPONSE"
    sleep 3
done

if [ "$API_RESPONDING" = false ]; then
    echo "❌ Health check falhou!"
    echo ""
    echo "📋 Tentando curl completo:"
    curl -v http://localhost:3001/api/health || true
    echo ""
    echo "📋 Logs completos:"
    pm2 logs "$PM2_NAME" --lines 100 --nostream
    exit 1
fi

echo "✅ Health check OK"
curl http://localhost:3001/api/health
echo ""

# Testar KPIs
KPIS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/kpis/public 2>/dev/null || echo "000")
if [ "$KPIS_RESPONSE" = "200" ]; then
    echo "✅ Endpoint de KPIs OK"
else
    echo "⚠️  Endpoint de KPIs retornou: $KPIS_RESPONSE"
fi

# RESUMO FINAL
echo ""
echo "================================"
echo "✅ SERVIDOR INICIADO COM SUCESSO!"
echo ""
echo "📊 Status:"
pm2 list | grep "$PM2_NAME"
echo ""
echo "🌐 Site disponível em:"
echo "   https://frtechltda.com.br/dashboard"
echo "   https://frtechltda.com.br/finance"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: pm2 logs $PM2_NAME"
echo "   Reiniciar: pm2 restart $PM2_NAME"
echo "   Status: pm2 list"
echo ""



