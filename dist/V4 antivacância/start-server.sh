#!/bin/bash

# Axis Antivacância - Servidor Local
# Uso: ./start-server.sh [porta]

PORT=${1:-8080}

echo "=================================="
echo "  AXIS ANTIVACÂNCIA - Dev Server"
echo "=================================="
echo ""
echo "Porta: $PORT"
echo ""
echo "URLs para testar:"
echo "  LP Principal:  http://localhost:$PORT/lp/index.html"
echo "  LP Curta:      http://localhost:$PORT/lp/v2-curta.html"
echo "  LP Urgência:   http://localhost:$PORT/lp/v3-urgencia.html"
echo ""
echo "  Captura:       http://localhost:$PORT/captura/"
echo "  Obrigado:      http://localhost:$PORT/obrigado/"
echo ""
echo "Pressione Ctrl+C para parar"
echo "=================================="
echo ""

cd "$(dirname "$0")"

# Tenta usar python3, senão python
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "Python não encontrado. Tentando com npx serve..."
    npx serve . -p $PORT
fi
