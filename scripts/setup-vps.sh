#!/bin/bash

# Script de Configuração Inicial da VPS
# Execute este script na VPS da Hostinger após conectar via SSH

set -e  # Para em caso de erro

echo "🚀 Iniciando configuração da VPS..."
echo ""

# Variáveis (ajuste conforme necessário)
PROJECT_PATH="/var/www/founder-dashboard"
REPO_URL="https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard.git"
DOMAIN="frtechltda.com.br"

echo "📋 Configurações:"
echo "   - Caminho do projeto: $PROJECT_PATH"
echo "   - Repositório: $REPO_URL"
echo "   - Domínio: $DOMAIN"
echo ""

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt-get update -qq

# 2. Instalar Node.js 20
echo "📦 Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "   ✅ Node.js já está instalado: $(node --version)"
fi

# 3. Instalar PM2
echo "📦 Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "   ✅ PM2 já está instalado: $(pm2 --version)"
fi

# 4. Instalar Git
echo "📦 Instalando Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
else
    echo "   ✅ Git já está instalado: $(git --version)"
fi

# 5. Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
sudo mkdir -p "$PROJECT_PATH"
sudo chown -R $USER:$USER "$PROJECT_PATH"

# 6. Clonar repositório (se não existir)
echo "📥 Clonando repositório..."
if [ ! -d "$PROJECT_PATH/.git" ]; then
    cd "$(dirname $PROJECT_PATH)"
    git clone "$REPO_URL" "$(basename $PROJECT_PATH)"
    cd "$PROJECT_PATH"
    git checkout main
else
    echo "   ✅ Repositório já existe, pulando clone..."
    cd "$PROJECT_PATH"
fi

# 7. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 8. Verificar instalações
echo ""
echo "✅ Verificando instalações..."
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   Git: $(git --version)"
echo ""

echo "✅ Configuração inicial concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Criar arquivo .env na VPS (copiar do .env.local local)"
echo "   2. Executar script para copiar chave SSH pública"
echo "   3. Testar o servidor: npm start"
echo "   4. Iniciar com PM2: pm2 start npm --name 'founder-dashboard' -- start"













