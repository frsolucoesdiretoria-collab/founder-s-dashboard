#!/bin/bash

# Script de Acesso Rápido - Axis Antivacância
# Facilita o acesso ao site durante desenvolvimento

clear

echo "=================================="
echo "  🏥 AXIS ANTIVACÂNCIA"
echo "  Site de Landing Pages"
echo "=================================="
echo ""

# Verifica se o servidor está rodando
if curl -s http://localhost:3001/api/axis/health > /dev/null 2>&1; then
    echo "✅ Servidor está rodando!"
    echo ""
else
    echo "⚠️  Servidor não está rodando."
    echo "   Iniciando servidor..."
    echo ""
    npm run dev &
    sleep 5
fi

echo "📍 ACESSO RÁPIDO:"
echo ""
echo "Landing Pages:"
echo "  • Principal:  http://localhost:3001/axis/lp/index.html"
echo "  • Curta:      http://localhost:3001/axis/lp/v2-curta.html"
echo "  • Urgência:   http://localhost:3001/axis/lp/v3-urgencia.html"
echo ""
echo "Formulários:"
echo "  • À Vista:    http://localhost:3001/axis/captura/avista.html"
echo "  • Entrada:    http://localhost:3001/axis/captura/entrada.html"
echo "  • Voucher:    http://localhost:3001/axis/captura/voucher.html"
echo ""
echo "APIs:"
echo "  • Health:     http://localhost:3001/api/axis/health"
echo "  • Leads:      http://localhost:3001/api/axis/leads"
echo ""
echo "=================================="
echo ""

# Menu interativo
echo "O que deseja fazer?"
echo ""
echo "1) Abrir LP Principal no browser"
echo "2) Abrir LP Urgência no browser"
echo "3) Ver status da API"
echo "4) Ver leads capturados"
echo "5) Testar envio de lead"
echo "6) Sair"
echo ""
read -p "Escolha uma opção [1-6]: " opcao

case $opcao in
    1)
        echo "Abrindo LP Principal..."
        open "http://localhost:3001/axis/lp/index.html"
        ;;
    2)
        echo "Abrindo LP Urgência..."
        open "http://localhost:3001/axis/lp/v3-urgencia.html"
        ;;
    3)
        echo ""
        echo "Status da API:"
        curl -s http://localhost:3001/api/axis/health | jq .
        ;;
    4)
        echo ""
        echo "Leads capturados:"
        curl -s http://localhost:3001/api/axis/leads | jq .
        ;;
    5)
        echo ""
        echo "Enviando lead de teste..."
        curl -X POST http://localhost:3001/api/axis/lead \
          -H "Content-Type: application/json" \
          -d '{
            "tipo": "avista",
            "valor": 1997,
            "nome": "Dr. Teste Script",
            "email": "teste@script.com",
            "whatsapp": "(47) 99999-9999",
            "clinica": "Clínica Teste Script",
            "page": "test-script"
          }' | jq .
        ;;
    6)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo "Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Pressione ENTER para sair"
read
