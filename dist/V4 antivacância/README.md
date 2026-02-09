# Axis Antivacância - Landing Pages

## Estrutura do Projeto

```
projeto-axis/
├── lp/                      # Landing Pages
│   ├── index.html           # LP Principal (completa)
│   ├── v2-curta.html        # LP Curta (direto ao ponto)
│   └── v3-urgencia.html     # LP Urgência (escassez máxima)
│
├── captura/                 # Páginas de Captura de Leads
│   ├── avista.html          # Captura → Checkout R$1.997
│   ├── entrada.html         # Captura → Checkout R$1.000 (entrada + plano)
│   └── voucher.html         # Captura → Voucher Fevereiro
│
├── obrigado/                # Páginas de Agradecimento
│   ├── avista.html          # Obrigado - Pagamento completo
│   ├── entrada.html         # Obrigado - Entrada paga
│   └── voucher.html         # Obrigado - Voucher reservado
│
├── assets/
│   ├── css/
│   │   └── style.css        # Estilos globais
│   ├── js/
│   │   └── main.js          # JavaScript (tracking, webhooks)
│   └── img/                 # Imagens (Midjourney)
│
└── README.md                # Este arquivo
```

## Como Testar Localmente

### Opção 1: Python (mais fácil)
```bash
cd /root/clawd/projeto-axis
python3 -m http.server 8080
```
Acesse: http://localhost:8080/lp/

### Opção 2: Node.js
```bash
npx serve /root/clawd/projeto-axis -p 8080
```

### Opção 3: PHP
```bash
cd /root/clawd/projeto-axis
php -S localhost:8080
```

## URLs para Testar

- LP Principal: http://localhost:8080/lp/index.html
- LP Curta: http://localhost:8080/lp/v2-curta.html
- LP Urgência: http://localhost:8080/lp/v3-urgencia.html
- Captura À Vista: http://localhost:8080/captura/avista.html
- Captura Entrada: http://localhost:8080/captura/entrada.html
- Captura Voucher: http://localhost:8080/captura/voucher.html

## ⚠️ AÇÕES PENDENTES

### 1. Criar Links de Checkout no Mercado Pago

Os valores mudaram para preço de lançamento. Criar novos links:

- **R$1.997 à vista** → Substituir em `captura/avista.html` e `assets/js/main.js`
- **R$1.000 entrada** (com R$1.500 na entrega e 12x R$99) → Usar para as capturas de entrada e webhook

Links atuais (para referência):
- R$1.000: https://mpago.la/29M9mhq
- R$4.000: https://mpago.la/164FDaK

### 2. Configurar Webhook para Leads

No arquivo `assets/js/main.js`, alterar:

```javascript
const CONFIG = {
  webhookUrl: 'https://SEU_WEBHOOK_AQUI.com/lead',     // ← Alterar
  notifyUrl: 'https://SEU_WEBHOOK_AQUI.com/notify',    // ← Alterar
  ...
}
```

### 3. Configurar Google Analytics e Ads

Em cada arquivo HTML, substituir os placeholders:
- `G-XXXXXXXXXX` → ID do GA4
- `AW-XXXXXXXXX` → ID do Google Ads

### 4. Thank You Pages

Configurar redirecionamento do Mercado Pago:
- Após pagamento R$1.997 → https://seudominio.com/obrigado/avista.html
- Após pagamento R$1.000 (entrada) → https://seudominio.com/obrigado/entrada.html

### 5. Imagens Midjourney

Gerar e colocar em `assets/img/`:
- Hero image (clínica moderna, agenda)
- Imagem "problema" (agenda vazia, stress)
- Imagem "solução" (agenda cheia, tranquilidade)
- Logos DoctorConnect / WIO Clinic (ou prints)

## Fluxo do Usuário

```
LP → Captura (coleta dados) → Checkout MP → Thank You Page
         ↓
   Webhook dispara notificação
         ↓
   Você recebe no Telegram/WhatsApp
```

## Tracking

O JavaScript já inclui:
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- Tempo na página
- UTM parameters salvos
- Eventos de conversão para GA4/GAds

## Variações para Teste A/B

1. **LP Principal** - Para tráfego frio, pessoa lê tudo
2. **LP Curta** - Para retargeting ou quem já conhece
3. **LP Urgência** - Para campanhas de escassez

Recomendação: começar com LP Principal, depois testar contra LP Urgência.
