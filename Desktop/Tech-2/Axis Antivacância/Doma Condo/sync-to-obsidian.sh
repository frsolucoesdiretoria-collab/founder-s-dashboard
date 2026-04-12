#!/bin/bash

# ============================================================
# sync-to-obsidian.sh — Sincroniza .md do Doma Condo → Obsidian
# Uso: bash sync-to-obsidian.sh
# ============================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VAULT_DIR="/Users/fabricio/Documents/Obsidian Vault"
DEST_DIR="$VAULT_DIR/Doma Condo"
INDEX_FILE="$VAULT_DIR/000-INDEX-Doma-Condo.md"
TODAY=$(date +"%Y-%m-%d")
COUNT=0

echo "Sincronizando Doma Condo → Obsidian..."
echo "   Origem:  $PROJECT_DIR"
echo "   Destino: $DEST_DIR"
echo ""

# Garante que a pasta destino existe
mkdir -p "$DEST_DIR"

TABLE_ROWS=""
LINKS=""

# Copia cada .md para o vault (compatível com bash 3 do macOS)
while IFS= read -r FILE; do
  FILENAME=$(basename "$FILE")
  RELATIVE="${FILE#$PROJECT_DIR/}"
  cp "$FILE" "$DEST_DIR/$FILENAME"
  FILEBASE="${FILENAME%.md}"
  TABLE_ROWS="${TABLE_ROWS}| ${FILENAME} | [[${FILEBASE}]] | \`${RELATIVE}\` |\n"
  LINKS="${LINKS}- [[${FILEBASE}]]\n"
  COUNT=$((COUNT + 1))
  echo "   OK  $RELATIVE"
done < <(find "$PROJECT_DIR" -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | sort)

echo ""
echo "Atualizando indice..."

# Reescreve o arquivo de índice
{
  echo "# Índice — Doma Condo"
  echo ""
  echo "**Sincronização:** $TODAY"
  echo "**Origem:** \`$PROJECT_DIR\`"
  echo "**Total de arquivos:** $COUNT"
  echo ""
  echo "---"
  echo ""
  echo "## Arquivos Sincronizados"
  echo ""
  echo "| Arquivo | Link | Origem |"
  echo "|---|---|---|"
  printf "%b" "$TABLE_ROWS" | grep -v '^$'
  echo ""
  echo "---"
  echo ""
  echo "## Links Rápidos"
  echo ""
  printf "%b" "$LINKS" | grep -v '^$'
  echo ""
  echo "---"
  echo ""
  echo "> Para re-sincronizar: \`bash sync-to-obsidian.sh\` na raiz do projeto Doma Condo"
  echo "> Última sincronização: $TODAY"
} > "$INDEX_FILE"

echo "   Indice atualizado: $INDEX_FILE"
echo ""
echo "============================================"
echo "  $COUNT arquivo(s) sincronizado(s)"
echo "============================================"
