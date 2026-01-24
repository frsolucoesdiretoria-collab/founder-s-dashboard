#!/bin/bash
# AXIS TEMPO REAL V1 — Copy Lock Validator
# Este script valida que o conteúdo do arquivo não foi modificado

CONTENT_FILE="content/axis-tempo-real.v1.md"
EXPECTED_HASH="574445c2f77206db228ba9df4cd9d92c2a078fa539b9ffa55c790f1262cde971"

# Calcula o hash do conteúdo (ignorando as 3 primeiras linhas de header)
CURRENT_HASH=$(tail -n +4 "$CONTENT_FILE" | shasum -a 256 | awk '{print $1}')

echo "==================================="
echo "AXIS TEMPO REAL V1 - COPY LOCK TEST"
echo "==================================="
echo ""
echo "Arquivo: $CONTENT_FILE"
echo ""
echo "Hash esperado (original): $EXPECTED_HASH"
echo "Hash atual    (conteúdo): $CURRENT_HASH"
echo ""

if [ "$CURRENT_HASH" = "$EXPECTED_HASH" ]; then
  echo "✅ COPY LOCK VÁLIDO: O conteúdo está intacto."
  echo ""
  exit 0
else
  echo "❌ COPY LOCK QUEBRADO: O conteúdo foi modificado!"
  echo ""
  echo "AÇÃO NECESSÁRIA:"
  echo "  1. Reverta as alterações no arquivo $CONTENT_FILE"
  echo "  2. Ou atualize o hash esperado se a mudança foi intencional"
  echo ""
  exit 1
fi
