#!/bin/bash
# SOLUÇÃO DEFINITIVA PARA ERRO 502
# Execute este script na VPS

set -e

PROJECT_PATH="/var/www/founder-dashboard"

echo "🚀 SOLUÇÃO DEFINITIVA PARA ERRO 502"
echo "===================================="
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

# 1. PARAR TUDO
echo ""
echo "1️⃣  PARANDO TUDO..."
pm2 delete founder-dashboard 2>/dev/null || true
pm2 stop founder-dashboard 2>/dev/null || true
pm2 stop all 2>/dev/null || true
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
        echo "⚠️  ATENÇÃO: Configure o NOTION_TOKEN no .env.local"
    else
        echo "❌ Template não encontrado. Criando básico..."
        cat > .env.local << EOF
NOTION_TOKEN=<<<CONFIGURE_SEU_TOKEN_AQUI>>>
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88
PORT=3001
NODE_ENV=production
EOF
        echo "⚠️  Arquivo criado. CONFIGURE O NOTION_TOKEN!"
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    echo "⚠️  NOTION_TOKEN não configurado ou está com placeholder"
    echo "   Edite: nano $PROJECT_PATH/.env.local"
fi

# 3. INSTALAR DEPENDÊNCIAS
echo ""
echo "3️⃣  VERIFICANDO DEPENDÊNCIAS..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado. Instalando..."
    npm install
else
    echo "✅ node_modules existe"
fi

# 4. BUILD
echo ""
echo "4️⃣  FAZENDO BUILD..."
npm run build || {
    echo "❌ Erro no build!"
    echo "   Tentando limpar e rebuild..."
    rm -rf dist node_modules/.vite 2>/dev/null || true
    npm run build || {
        echo "❌ Build falhou novamente!"
        exit 1
    }
}
echo "✅ Build concluído"

# Verificar se dist existe e tem conteúdo
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Pasta dist vazia ou não existe!"
    exit 1
fi

# 5. CARREGAR VARIÁVEIS
echo ""
echo "5️⃣  CARREGANDO VARIÁVEIS DE AMBIENTE..."
set -a
source .env.local
set +a

# Verificar se NOTION_TOKEN foi carregado
if [ -z "$NOTION_TOKEN" ] || [ "$NOTION_TOKEN" = "<<<CONFIGURE_SEU_TOKEN_AQUI>>>" ]; then
    echo "❌ NOTION_TOKEN não configurado!"
    echo "   Edite: nano $PROJECT_PATH/.env.local"
    exit 1
fi

echo "✅ Variáveis carregadas"
echo "   NOTION_TOKEN: ${NOTION_TOKEN:0:20}..."

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
echo "7️⃣  INICIANDO SERVIDOR..."
export NODE_ENV=production
export PORT=3001

# Usar pm2 ecosystem ou comando direto
pm2 start npm --name "founder-dashboard" \
    --cwd "$PROJECT_PATH" \
    --interpreter bash \
    -- start \
    --update-env

pm2 save

# 8. AGUARDAR E VERIFICAR
echo ""
echo "⏳ Aguardando servidor iniciar (20 segundos)..."
sleep 20

# Verificar status múltiplas vezes
for i in {1..5}; do
    echo "   Tentativa $i/5..."
    PM2_STATUS=$(pm2 list | grep founder-dashboard | awk '{print $10}' || echo "notfound")
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ PM2 está online!"
        break
    fi
    sleep 3
done

# 9. VERIFICAÇÕES FINAIS
echo ""
echo "8️⃣  VERIFICAÇÕES FINAIS..."

# Status PM2
PM2_STATUS=$(pm2 list | grep founder-dashboard | awk '{print $10}' || echo "notfound")
if [ "$PM2_STATUS" != "online" ]; then
    echo "❌ PM2 não está online! Status: $PM2_STATUS"
    echo ""
    echo "📋 Logs do erro:"
    pm2 logs founder-dashboard --lines 100 --nostream
    exit 1
fi

# Porta
if ! lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  Porta 3001 não está em uso!"
    echo "   Mas PM2 diz que está online. Verificando logs..."
    pm2 logs founder-dashboard --lines 50 --nostream
fi

# Health check
echo ""
echo "9️⃣  TESTANDO ENDPOINTS..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo "❌ Health check falhou! Status: $HEALTH_RESPONSE"
    echo ""
    echo "📋 Tentando curl completo:"
    curl -v http://localhost:3001/api/health || true
    echo ""
    echo "📋 Logs completos:"
    pm2 logs founder-dashboard --lines 100 --nostream
    exit 1
fi

echo "✅ Health check OK"

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
pm2 list | grep founder-dashboard
echo ""
echo "🌐 Teste no navegador:"
echo "   https://frtechltda.com.br/dashboard"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: pm2 logs founder-dashboard"
echo "   Reiniciar: pm2 restart founder-dashboard"
echo "   Status: pm2 list"
echo ""






