#!/bin/bash
# deploy-vm.sh — Sincroniza arquivos locais do Doma Condo para a VM
# Uso: bash deploy-vm.sh

VM="axis-dev-central"
ZONE="us-central1-c"
PROJECT="axis-antivacancia"
VM_PATH="/var/www/domacondo.agendainteligentes.com"
LOCAL_PATH="$(dirname "$0")/site/public"

echo "🚀 Iniciando deploy Doma Condo → VM..."

# Sync todo o site/public para a VM via rsync sobre SSH (gcloud)
gcloud compute ssh "$VM" \
  --zone "$ZONE" \
  --project "$PROJECT" \
  --command "echo 'VM conectada'" 2>/dev/null || { echo "❌ Falha ao conectar na VM"; exit 1; }

# Copiar arquivos HTML
echo "📄 Copiando HTML..."
gcloud compute scp "$LOCAL_PATH"/*.html \
  "$VM:$VM_PATH/" \
  --zone "$ZONE" --project "$PROJECT" 2>&1

# Copiar JS pages
echo "📦 Copiando JS..."
gcloud compute scp "$LOCAL_PATH"/js/pages/*.js \
  "$VM:$VM_PATH/js/pages/" \
  --zone "$ZONE" --project "$PROJECT" 2>&1

# Copiar JS raiz (supabase-client, auth, ui)
gcloud compute scp "$LOCAL_PATH"/js/*.js \
  "$VM:$VM_PATH/js/" \
  --zone "$ZONE" --project "$PROJECT" 2>&1

echo "✅ Deploy concluído!"
echo "🌐 App: http://domacondo.agendainteligentes.com"
