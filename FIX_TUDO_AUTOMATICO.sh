#!/bin/bash
# ============================================
# SCRIPT AUTOMÁTICO COMPLETO PARA CORRIGIR 502
# Execute este script na VPS: bash FIX_TUDO_AUTOMATICO.sh
# ============================================

set -e  # Parar em caso de erro crítico

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_PATH="/var/www/founder-dashboard"
PORT=3001
MAX_WAIT_TIME=60  # Tempo máximo de espera em segundos

# Função para imprimir mensagens
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Banner
echo ""
echo "=========================================="
echo "  FIX AUTOMÁTICO PARA ERRO 502"
echo "  Founder's Dashboard"
echo "=========================================="
echo ""

# PASSO 1: Encontrar diretório do projeto
print_step "1️⃣  Localizando projeto..."
if [ ! -d "$PROJECT_PATH" ]; then
    print_warning "Diretório padrão não encontrado. Procurando alternativas..."
    ALTERNATIVE=$(find / -type d -name "founder-dashboard" 2>/dev/null | head -1)
    if [ -n "$ALTERNATIVE" ]; then
        PROJECT_PATH="$ALTERNATIVE"
        print_success "Projeto encontrado em: $PROJECT_PATH"
    else
        print_error "Projeto não encontrado!"
        echo "   Procure manualmente: find / -type d -name 'founder-dashboard'"
        exit 1
    fi
else
    print_success "Projeto encontrado em: $PROJECT_PATH"
fi

cd "$PROJECT_PATH" || exit 1
echo "   Diretório atual: $(pwd)"
echo ""

# PASSO 2: Limpar processos antigos
print_step "2️⃣  Limpando processos antigos..."
pm2 delete founder-dashboard 2>/dev/null || true
pm2 stop founder-dashboard 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 2

# Matar processos na porta
print_step "   Liberando porta $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
pkill -f "node.*$PORT" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "founder-dashboard" 2>/dev/null || true
sleep 3
print_success "Limpeza concluída"
echo ""

# PASSO 3: Verificar/criar .env.local
print_step "3️⃣  Verificando configuração (.env.local)..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local não existe!"
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        print_success "Criado a partir do template"
        print_warning "CONFIGURE O NOTION_TOKEN: nano .env.local"
    else
        print_error "Template não encontrado!"
        echo "   Criando arquivo básico..."
        cat > .env.local << 'EOF'
NOTION_TOKEN=<<<CONFIGURE_SEU_TOKEN_AQUI>>>
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88
PORT=3001
NODE_ENV=production
EOF
        print_warning "Arquivo criado. CONFIGURE O NOTION_TOKEN!"
    fi
fi

# Verificar NOTION_TOKEN
if ! grep -q "^NOTION_TOKEN=" .env.local || grep -q "^NOTION_TOKEN=<<<" .env.local; then
    print_error "NOTION_TOKEN não configurado!"
    echo ""
    echo "   Execute: nano $PROJECT_PATH/.env.local"
    echo "   Adicione: NOTION_TOKEN=seu_token_aqui"
    echo ""
    echo "   Obtenha o token em: https://www.notion.so/my-integrations"
    exit 1
fi
print_success "Configuração OK"
echo ""

# PASSO 4: Instalar dependências
print_step "4️⃣  Verificando dependências..."
if [ ! -d "node_modules" ] || [ ! -f "package.json" ]; then
    print_warning "Instalando dependências (isso pode levar alguns minutos)..."
    npm install --production=false || {
        print_error "Erro ao instalar dependências!"
        exit 1
    }
else
    print_success "Dependências OK"
fi
echo ""

# PASSO 5: Build
print_step "5️⃣  Fazendo build do projeto..."
rm -rf dist 2>/dev/null || true
npm run build || {
    print_error "Erro no build!"
    print_step "   Tentando limpar cache e rebuild..."
    rm -rf dist node_modules/.vite .vite 2>/dev/null || true
    npm run build || {
        print_error "Build falhou novamente!"
        echo ""
        echo "   Verifique os erros acima"
        exit 1
    }
}

# Verificar se dist foi criado
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    print_error "Pasta dist vazia ou não existe!"
    exit 1
fi
print_success "Build concluído"
echo "   Tamanho: $(du -sh dist | awk '{print $1}')"
echo ""

# PASSO 6: Carregar variáveis de ambiente
print_step "6️⃣  Carregando variáveis de ambiente..."
set -a
source .env.local
set +a

# Verificar NOTION_TOKEN
if [ -z "$NOTION_TOKEN" ] || [ "$NOTION_TOKEN" = "<<<CONFIGURE_SEU_TOKEN_AQUI>>>" ] || [ "$NOTION_TOKEN" = "<<<INSERIR_TOKEN_AQUI>>>" ]; then
    print_error "NOTION_TOKEN não configurado corretamente!"
    exit 1
fi

export NODE_ENV=production
export PORT=$PORT

print_success "Variáveis carregadas"
echo "   NOTION_TOKEN: ${NOTION_TOKEN:0:20}..."
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo ""

# PASSO 7: Verificar porta
print_step "7️⃣  Verificando porta $PORT..."
if lsof -i:$PORT >/dev/null 2>&1; then
    print_warning "Porta ainda em uso! Matando processos..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi
print_success "Porta livre"
echo ""

# PASSO 8: Iniciar PM2
print_step "8️⃣  Iniciando servidor com PM2..."
pm2 start npm \
    --name "founder-dashboard" \
    --cwd "$PROJECT_PATH" \
    -- start \
    --update-env \
    --merge-logs \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --max-memory-restart 500M

pm2 save
print_success "Servidor iniciado"
echo ""

# PASSO 9: Aguardar e verificar
print_step "9️⃣  Aguardando servidor iniciar..."
WAIT_COUNT=0
PM2_STATUS="notfound"

while [ $WAIT_COUNT -lt 12 ]; do  # 12 tentativas de 5 segundos = 60 segundos
    sleep 5
    WAIT_COUNT=$((WAIT_COUNT + 1))
    PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
    
    if [ "$PM2_STATUS" = "online" ]; then
        print_success "Servidor está online! (após ${WAIT_COUNT} tentativas)"
        break
    fi
    
    echo "   Aguardando... ($WAIT_COUNT/12) - Status: $PM2_STATUS"
done

if [ "$PM2_STATUS" != "online" ]; then
    print_error "Servidor não ficou online após $MAX_WAIT_TIME segundos!"
    echo ""
    echo "📋 Logs do erro:"
    pm2 logs founder-dashboard --lines 100 --nostream
    exit 1
fi
echo ""

# PASSO 10: Verificações finais
print_step "🔟 Verificações finais..."
echo ""

# Status PM2
PM2_STATUS=$(pm2 list 2>/dev/null | grep founder-dashboard | awk '{print $10}' || echo "notfound")
echo "📊 Status PM2: $PM2_STATUS"
pm2 list | grep founder-dashboard || print_error "Processo não encontrado!"
echo ""

# Porta
echo "📊 Porta $PORT:"
if lsof -i:$PORT >/dev/null 2>&1; then
    lsof -i:$PORT | grep LISTEN
    print_success "Porta está em uso"
else
    print_warning "Porta não está em uso (mas PM2 diz online)"
fi
echo ""

# Health check
echo "📊 Health Check:"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_success "Health check OK (status: $HEALTH_RESPONSE)"
    HEALTH_BODY=$(curl -s http://localhost:$PORT/api/health)
    echo "   Resposta: $HEALTH_BODY"
else
    print_error "Health check falhou (status: $HEALTH_RESPONSE)"
    echo "   Tentando curl completo:"
    curl -v http://localhost:$PORT/api/health 2>&1 | head -15
fi
echo ""

# Testar KPIs
echo "📊 Teste de KPIs:"
KPIS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/kpis/public 2>/dev/null || echo "000")
if [ "$KPIS_RESPONSE" = "200" ]; then
    KPIS_COUNT=$(curl -s http://localhost:$PORT/api/kpis/public 2>/dev/null | grep -o '"id"' | wc -l)
    print_success "Endpoint de KPIs OK (encontrados: $KPIS_COUNT)"
else
    print_warning "Endpoint de KPIs retornou: $KPIS_RESPONSE"
fi
echo ""

# Logs recentes
echo "📊 Últimas 20 linhas de log:"
pm2 logs founder-dashboard --lines 20 --nostream 2>/dev/null | tail -20 || echo "Não foi possível ler logs"
echo ""

# RESUMO FINAL
echo "=========================================="
if [ "$PM2_STATUS" = "online" ] && [ "$HEALTH_RESPONSE" = "200" ]; then
    echo ""
    print_success "✅✅✅ SUCESSO! SERVIDOR ESTÁ FUNCIONANDO! ✅✅✅"
    echo ""
    echo "🌐 Acesse no navegador:"
    echo "   https://frtechltda.com.br/dashboard"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs:        pm2 logs founder-dashboard"
    echo "   Reiniciar:       pm2 restart founder-dashboard"
    echo "   Status:          pm2 list"
    echo "   Parar:           pm2 stop founder-dashboard"
    echo ""
    exit 0
else
    echo ""
    print_error "⚠️  SERVIDOR PODE NÃO ESTAR FUNCIONANDO CORRETAMENTE"
    echo ""
    echo "Status PM2: $PM2_STATUS"
    echo "Health Check: $HEALTH_RESPONSE"
    echo ""
    echo "📋 Execute para ver logs completos:"
    echo "   pm2 logs founder-dashboard --lines 100"
    echo ""
    echo "📋 Execute para diagnóstico completo:"
    echo "   pm2 list && lsof -i:3001 && curl -v http://localhost:3001/api/health"
    echo ""
    exit 1
fi






