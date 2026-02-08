# 🏥 Axis Antivacância - Site de Landing Pages

## 📍 Localização

O site está integrado ao Founder's Dashboard na pasta:
```
/axis-antivacancia/
```

## 🌐 Como Acessar

### Desenvolvimento Local

1. **Inicie o servidor do Founder's Dashboard:**
```bash
npm run dev
```

2. **Acesse as landing pages:**
- LP Principal: http://localhost:3001/axis/lp/index.html
- LP Curta: http://localhost:3001/axis/lp/v2-curta.html
- LP Urgência: http://localhost:3001/axis/lp/v3-urgencia.html
- Todas as LPs: http://localhost:3001/axis/lp/

3. **Páginas de captura:**
- À Vista: http://localhost:3001/axis/captura/avista.html
- Entrada: http://localhost:3001/axis/captura/entrada.html
- Voucher: http://localhost:3001/axis/captura/voucher.html

4. **Páginas de obrigado:**
- http://localhost:3001/axis/obrigado/

## 🔧 Integrações Configuradas

### ✅ Webhooks
- **Lead Capture:** `/api/axis/lead` - Recebe dados dos formulários
- **Notifications:** `/api/axis/notify` - Envia notificações
- **Health Check:** `/api/axis/health` - Verifica status do serviço

### ✅ Analytics
- **Google Analytics:** G-JYTV1WNRWS (FR Tech)
- **Google Ads:** AW-16460564445 (FR Tech)
- **Tracking:** Scroll depth, tempo na página, UTMs

### ✅ Pagamentos
- **À Vista (R$1.997):** https://mpago.la/2mox6KZ
- **Entrada (R$1.000):** https://mpago.la/29M9mhq
- **Completo (R$4.000):** https://mpago.la/164FDaK

### ✅ Dados Legais
- **CNPJ:** 56.213.927/0001-89
- **Razão Social:** FR Tech LTDA
- **LGPD:** Conformidade implementada
- **CFM:** Resolução nº 2.336/2023

## 📊 Estrutura do Projeto

```
axis-antivacancia/
├── lp/                      # Landing Pages
│   ├── index.html           # LP Principal (completa)
│   ├── v2-curta.html        # LP Curta
│   ├── v3-urgencia.html     # LP Urgência
│   └── [+11 variações]      # Outras versões para teste
│
├── captura/                 # Páginas de Captura
│   ├── avista.html          # Checkout R$1.997
│   ├── entrada.html         # Checkout R$1.000
│   └── voucher.html         # Voucher Fevereiro
│
├── obrigado/                # Páginas de Agradecimento
│   ├── avista.html
│   ├── entrada.html
│   └── voucher.html
│
└── assets/
    ├── css/style.css        # Estilos globais
    ├── js/main.js           # JavaScript (tracking, webhooks)
    └── img/                 # Imagens (Midjourney)
```

## 🔄 Fluxo do Usuário

```
LP → Calculadora → CTA → Captura (formulário) → Checkout MP → Thank You Page
                                    ↓
                              Webhook recebe dados
                                    ↓
                            Backend salva no array
                                    ↓
                    (TODO: Integrar com Notion/DB)
```

## 📝 API Endpoints

### POST /api/axis/lead
Recebe dados do formulário de captura.

**Body:**
```json
{
  "tipo": "avista",
  "valor": 1997,
  "nome": "Dr. João Silva",
  "email": "joao@clinica.com",
  "whatsapp": "(47) 99999-9999",
  "clinica": "Clínica Vida Nova",
  "timestamp": "2026-01-28T...",
  "page": "captura-avista"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead recebido com sucesso",
  "leadId": "AXIS_1738099200000"
}
```

### GET /api/axis/leads
Lista todos os leads recebidos (admin).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "leads": [...]
}
```

### GET /api/axis/health
Verifica status do serviço.

**Response:**
```json
{
  "success": true,
  "service": "Axis Antivacância",
  "status": "running",
  "leadsCount": 5
}
```

## 🚀 Deploy em Produção

### VPS
O site já está integrado ao Founder's Dashboard, então o deploy é automático:

```bash
# Na VPS
cd ~/founder-s-dashboard
git pull
npm run build
pm2 restart all
```

### URLs em Produção
- Site: https://seu-dominio.com/axis/
- API: https://seu-dominio.com/api/axis/

## ⚠️ Próximos Passos (TODO)

### Alta Prioridade
- [ ] Integrar webhooks com Notion para salvar leads
- [ ] Configurar notificações Telegram/WhatsApp
- [ ] Adicionar autenticação admin para `/api/axis/leads`
- [ ] Implementar rate limiting nos endpoints

### Média Prioridade
- [ ] Criar dashboard admin para visualizar leads
- [ ] Adicionar testes A/B entre as LPs
- [ ] Implementar pixels do Facebook/Meta
- [ ] Configurar domínio customizado (axis.frtech.com.br)

### Baixa Prioridade
- [ ] Adicionar mais variações de LP
- [ ] Implementar chat widget
- [ ] Criar fluxo de remarketing
- [ ] Adicionar mais idiomas

## 🧪 Como Testar

1. **Testar formulário de captura:**
```bash
curl -X POST http://localhost:3001/api/axis/lead \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "avista",
    "valor": 1997,
    "nome": "Teste",
    "email": "teste@test.com",
    "whatsapp": "47999999999"
  }'
```

2. **Ver leads recebidos:**
```bash
curl http://localhost:3001/api/axis/leads
```

3. **Health check:**
```bash
curl http://localhost:3001/api/axis/health
```

## 📱 Contato

WhatsApp: 47 99647-5947
