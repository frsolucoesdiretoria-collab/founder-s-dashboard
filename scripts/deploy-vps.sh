#!/bin/bash
set -e

# Script de deploy executado na VPS após rsync do GitHub Actions
# Este script valida o deploy e reinicia serviços se necessário

echo "🚀 Iniciando validação e restart do deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Identificar aplicação em produção
echo -e "${YELLOW}📋 Identificando processos PM2...${NC}"
pm2 list

# 2. Validar código em produção
echo -e "${YELLOW}🔍 Validando código em produção...${NC}"

# Verificar se ainda existe GA antigo
if grep -r "G-JYTV1WNRWS" /var/www/founder-dashboard/dist/ 2>/dev/null | grep -v "gtag/js?id=" | grep -v ".git"; then
    echo -e "${RED}❌ ERRO: Ainda existe referência ao GA antigo (G-JYTV1WNRWS)${NC}"
    exit 1
fi

# Verificar se GTM está presente
if ! grep -r "GTM-KJDNFPPW" /var/www/founder-dashboard/dist/ 2>/dev/null | head -1 > /dev/null; then
    echo -e "${RED}❌ ERRO: GTM não encontrado nos arquivos${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Validação de código OK${NC}"

# 3. Verificar se há aplicação Node.js para reiniciar
echo -e "${YELLOW}🔄 Verificando aplicações PM2...${NC}"

# Listar processos PM2 e identificar qual serve o domínio
PM2_APPS=$(pm2 jlist | jq -r '.[].name' 2>/dev/null || pm2 list | grep -E "^\│.*│" | awk '{print $4}' | grep -v "name" | grep -v "^$" || echo "")

if [ -z "$PM2_APPS" ]; then
    echo -e "${YELLOW}⚠️  Nenhuma aplicação PM2 encontrada. Deploy estático apenas.${NC}"
else
    echo -e "${GREEN}📦 Aplicações PM2 encontradas:${NC}"
    pm2 list
    
    # Reiniciar todas as aplicações relacionadas ao projeto
    for app in $PM2_APPS; do
        if [[ "$app" == *"founder"* ]] || [[ "$app" == *"dashboard"* ]] || [[ "$app" == *"app"* ]]; then
            echo -e "${YELLOW}🔄 Reiniciando $app...${NC}"
            pm2 restart "$app" || echo -e "${YELLOW}⚠️  Não foi possível reiniciar $app${NC}"
        fi
    done
fi

# 4. Validar logs
echo -e "${YELLOW}📊 Últimos logs PM2:${NC}"
pm2 logs --lines 10 --nostream || echo "Nenhum log disponível"

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
