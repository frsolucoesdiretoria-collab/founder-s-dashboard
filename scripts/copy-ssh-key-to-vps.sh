#!/bin/bash

# Script para copiar chave SSH pública para VPS
# Execute no seu MacBook (não na VPS)

set -e

VPS_HOST="frtechltda.com.br"
VPS_USER="root"
SSH_KEY_PATH="$HOME/.ssh/vps_deploy_key.pub"

echo "🔑 Copiando chave SSH pública para VPS..."
echo ""

# Verificar se a chave existe
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ Erro: Chave pública não encontrada em $SSH_KEY_PATH"
    echo "   Execute primeiro: ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/vps_deploy_key -N ''"
    exit 1
fi

echo "📋 Configuração:"
echo "   VPS: $VPS_USER@$VPS_HOST"
echo "   Chave: $SSH_KEY_PATH"
echo ""

# Copiar chave para VPS
echo "📤 Copiando chave..."
ssh-copy-id -i "$SSH_KEY_PATH" "$VPS_USER@$VPS_HOST" 2>/dev/null || {
    # Se ssh-copy-id falhar, tentar método manual
    echo "   Tentando método alternativo..."
    cat "$SSH_KEY_PATH" | ssh "$VPS_USER@$VPS_HOST" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
}

echo ""
echo "✅ Chave SSH copiada com sucesso!"
echo ""
echo "🧪 Testando conexão..."
ssh -i ~/.ssh/vps_deploy_key -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo '✅ Conexão SSH funcionando!'" || {
    echo "⚠️  Aviso: Teste de conexão falhou, mas a chave foi copiada."
    echo "   Isso pode ser normal se você não configurou a chave privada para uso automático."
}

echo ""
echo "✅ Processo concluído!"

