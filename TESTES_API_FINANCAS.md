# 🧪 TESTES - API DE FINANÇAS

**Data:** 23/01/2026  
**Objetivo:** Validar todos os endpoints e regras de negócio

---

## 🚀 PRÉ-REQUISITOS

### 1. Servidor Rodando
```bash
# Local
npm run dev

# Produção (VPS)
pm2 status founder-dashboard
```

### 2. Variáveis de Ambiente
```env
NOTION_DB_TRANSACTIONS=2dd84566a5fa8051bd52ca792e0f883e
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
```

### 3. Passcodes de Teste
- **Admin:** `FRtechfaturandoumbi`
- **Flora:** `flora123`
- **Finance:** `06092021`

---

## 📋 ENDPOINTS A TESTAR

1. ✅ GET /api/finance/summary
2. ✅ GET /api/finance/history
3. ✅ GET /api/finance/accounts
4. ✅ GET /api/finance/decisions-base
5. ✅ GET /api/finance/expense-analysis
6. ✅ GET /api/finance/transactions (já existia)

---

## 🧪 TESTE 1: Summary (Resumo Financeiro)

### Teste 1.1: Admin (Todas as Contas)
```bash
curl -X GET "http://localhost:3001/api/finance/summary" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected Response:**
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "totalIncome": 5000.00,
  "totalExpenses": 3500.00,
  "balance": 1500.00,
  "costOfLiving": 2800.00,
  "savingsRate": 30.00,
  "totalDebts": 500.00,
  "expensesByCategory": {
    "Moradia": 1200.00,
    "Alimentação": 800.00
  }
}
```

---

### Teste 1.2: Flora (Apenas Nubank PF)
```bash
curl -X GET "http://localhost:3001/api/finance/summary?account=Nubank%20-%20Pessoa%20Física" \
  -H "x-admin-passcode: flora123"
```

**Expected:** Apenas transações do Nubank - Pessoa Física

---

### Teste 1.3: Sem Autenticação (Deve Falhar)
```bash
curl -X GET "http://localhost:3001/api/finance/summary"
```

**Expected Response:**
```json
{
  "error": "Unauthorized: Invalid passcode"
}
```

**Status Code:** 401

---

## 🧪 TESTE 2: History (Histórico 6 Meses)

### Teste 2.1: Histórico Completo
```bash
curl -X GET "http://localhost:3001/api/finance/history" \
  -H "x-admin-passcode: 06092021"
```

**Expected Response:**
```json
[
  {
    "month": "2025-08",
    "income": 4800.00,
    "expenses": 3200.00,
    "balance": 1600.00,
    "savingsRate": 33.33
  },
  {
    "month": "2025-09",
    "income": 5000.00,
    "expenses": 3400.00,
    "balance": 1600.00,
    "savingsRate": 32.00
  }
  // ... últimos 6 meses
]
```

**Validação:**
- Array com 6 elementos
- Ordenado do mais antigo para o mais recente
- Cada objeto tem: month, income, expenses, balance, savingsRate

---

### Teste 2.2: Histórico Filtrado por Conta
```bash
curl -X GET "http://localhost:3001/api/finance/history?account=Nubank%20-%20Pessoa%20Física" \
  -H "x-admin-passcode: flora123"
```

**Expected:** Apenas dados da conta Nubank - PF

---

## 🧪 TESTE 3: Accounts (Saldos por Conta)

### Teste 3.1: Todas as Contas
```bash
curl -X GET "http://localhost:3001/api/finance/accounts" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected Response:**
```json
[
  {
    "account": "Nubank - Empresa",
    "balance": 15000.00,
    "lastUpdate": "2026-01-23"
  },
  {
    "account": "Nubank - Pessoa Física",
    "balance": 2500.00,
    "lastUpdate": "2026-01-23"
  }
]
```

**Validação:**
- Ordenado por saldo (maior primeiro)
- Balance é o saldo acumulado de TODAS as transações da conta
- lastUpdate é a data da transação mais recente

---

## 🧪 TESTE 4: Decisions Base (Dados para Decisão)

### Teste 4.1: Dados Completos
```bash
curl -X GET "http://localhost:3001/api/finance/decisions-base" \
  -H "x-admin-passcode: 06092021"
```

**Expected Response:**
```json
{
  "currentMonth": {
    "income": 5000.00,
    "expenses": 3500.00,
    "balance": 1500.00,
    "costOfLiving": 2800.00,
    "savingsRate": 30.00
  },
  "lastMonth": {
    "income": 4800.00,
    "expenses": 3200.00,
    "balance": 1600.00,
    "savingsRate": 33.33
  },
  "averageLast3Months": {
    "income": 4900.00,
    "expenses": 3400.00,
    "costOfLiving": 2700.00,
    "savingsRate": 30.61
  },
  "trends": {
    "incomeChange": 4.17,
    "expenseChange": 9.38,
    "savingsRateChange": -3.33
  }
}
```

**Validação:**
- `trends.incomeChange` positivo = crescimento de receita
- `trends.expenseChange` positivo = aumento de despesa
- `trends.savingsRateChange` negativo = taxa de poupança caiu

---

## 🧪 TESTE 5: Expense Analysis (Análise de Despesas)

### Teste 5.1: Análise Completa
```bash
curl -X GET "http://localhost:3001/api/finance/expense-analysis" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected Response:**
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "totalExpenses": 3500.00,
  "essentialExpenses": 2800.00,
  "variableExpenses": 200.00,
  "debtPayments": 500.00,
  "breakdown": [
    {
      "category": "Moradia",
      "amount": 1200.00,
      "percentage": 34.29,
      "type": "essential"
    },
    {
      "category": "Alimentação",
      "amount": 800.00,
      "percentage": 22.86,
      "type": "essential"
    },
    {
      "category": "Dívida",
      "amount": 500.00,
      "percentage": 14.29,
      "type": "debt"
    },
    {
      "category": "Lazer",
      "amount": 300.00,
      "percentage": 8.57,
      "type": "variable"
    }
  ]
}
```

**Validação:**
- `essentialExpenses + variableExpenses + debtPayments = totalExpenses`
- `breakdown` ordenado por amount (maior primeiro)
- Soma de `percentage` deve ser ~100%

---

## 🧪 TESTE 6: Transactions (Existente)

### Teste 6.1: Todas as Transações
```bash
curl -X GET "http://localhost:3001/api/finance/transactions" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected:** Array de transações

---

### Teste 6.2: Filtro por Conta
```bash
curl -X GET "http://localhost:3001/api/finance/transactions?account=Nubank%20-%20Pessoa%20Física" \
  -H "x-admin-passcode: flora123"
```

**Expected:** Apenas transações do Nubank - PF

---

### Teste 6.3: Filtro por Tipo
```bash
curl -X GET "http://localhost:3001/api/finance/transactions?type=Entrada" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected:** Apenas transações do tipo "Entrada"

---

### Teste 6.4: Filtro por Período
```bash
curl -X GET "http://localhost:3001/api/finance/transactions?startDate=2026-01-01&endDate=2026-01-31" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

**Expected:** Apenas transações de janeiro/2026

---

## 🧪 CENÁRIOS DE TESTE

### Cenário 1: Mês Sem Transações

**Setup:**
- Banco de dados vazio OU
- Filtro por mês sem transações

**Expected Behavior:**
```json
{
  "period": { "startDate": "2026-01-01", "endDate": "2026-01-31" },
  "totalIncome": 0,
  "totalExpenses": 0,
  "balance": 0,
  "costOfLiving": 0,
  "savingsRate": 0,
  "totalDebts": 0,
  "expensesByCategory": {}
}
```

---

### Cenário 2: Apenas Receitas (Sem Despesas)

**Setup:**
- 1 transação: R$ 5.000 (Salário)
- 0 despesas

**Expected:**
- `totalIncome: 5000`
- `totalExpenses: 0`
- `balance: 5000`
- `savingsRate: 100` (100% de poupança)

---

### Cenário 3: Despesas > Receitas (Déficit)

**Setup:**
- Receitas: R$ 3.000
- Despesas: R$ 4.000

**Expected:**
- `balance: -1000` (negativo)
- `savingsRate: -33.33` (taxa negativa)

---

### Cenário 4: Transações de Diferentes Contas

**Setup:**
- Conta A: R$ 2.000 receita
- Conta B: R$ 3.000 receita

**Expected (sem filtro):**
- `totalIncome: 5000`

**Expected (filtro Conta A):**
- `totalIncome: 2000`

---

## 🐛 TESTES DE ERRO

### Erro 1: Sem Autenticação
```bash
curl -X GET "http://localhost:3001/api/finance/summary"
```

**Expected:**
- Status Code: 401
- Message: "Unauthorized: Invalid passcode"

---

### Erro 2: Passcode Inválido
```bash
curl -X GET "http://localhost:3001/api/finance/summary" \
  -H "x-admin-passcode: senhaErrada"
```

**Expected:**
- Status Code: 401
- Message: "Unauthorized: Invalid passcode"

---

### Erro 3: Database Não Configurada

**Setup:**
- Remover `NOTION_DB_TRANSACTIONS` do .env

**Expected:**
- Status Code: 404 ou 500
- Message: "Transactions database not found"

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Backend
- [ ] Todos os endpoints retornam 200 OK
- [ ] KPIs calculados corretamente
- [ ] Filtro por conta funciona
- [ ] Filtro por período funciona
- [ ] Autenticação bloqueando acesso não autorizado
- [ ] Erros retornando status codes corretos

### Regras de Negócio
- [ ] Receitas são positivas
- [ ] Despesas são negativas
- [ ] Custo de Vida exclui dívidas
- [ ] Taxa de poupança calculada corretamente
- [ ] Categorização de dívidas funciona
- [ ] Histórico limitado a 6 meses
- [ ] Tendências calculadas corretamente

### Performance
- [ ] Endpoint /summary responde em < 2s
- [ ] Endpoint /history responde em < 5s
- [ ] Sem timeouts com muitas transações

---

## 📊 TESTES EM PRODUÇÃO (VPS)

### 1. Conectar na VPS
```bash
ssh root@frtechltda.com.br
cd /var/www/founder-dashboard
```

### 2. Testar API Local
```bash
curl -X GET "http://localhost:3001/api/finance/summary" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

### 3. Testar via HTTPS (público)
```bash
curl -X GET "https://frtechltda.com.br/api/finance/summary" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

### 4. Ver Logs
```bash
pm2 logs founder-dashboard --lines 50
```

---

## 🔧 TROUBLESHOOTING

### Problema: Endpoint retorna array vazio

**Causa Possível:**
- Sem transações no período
- Filtro muito restritivo
- Database ID errado

**Solução:**
1. Verificar se há transações no Notion
2. Testar sem filtros
3. Verificar `NOTION_DB_TRANSACTIONS` no .env

---

### Problema: KPIs zerados

**Causa Possível:**
- Transações não têm o campo `Type` correto
- Valores não são números
- Filtro por período errado

**Solução:**
1. Verificar formato das transações no Notion
2. Validar campos: Date (YYYY-MM-DD), Amount (number), Type ('Entrada'/'Saída')

---

### Problema: Erro 500 (Internal Server Error)

**Causa Possível:**
- Database não compartilhada com integração
- Token Notion inválido
- Rate limit atingido

**Solução:**
1. Verificar logs: `pm2 logs founder-dashboard`
2. Compartilhar database com integração no Notion
3. Verificar `NOTION_TOKEN` no .env

---

**Documento de Testes**  
**FR Tech OS - Finance Module**  
**Versão 1.0 - Janeiro 2026**
