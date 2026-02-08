# 📊 REGRAS DE NEGÓCIO — MÓDULO FINANÇAS PESSOAIS

**Data:** 23/01/2026  
**Versão:** 1.0  
**Responsável:** Backend Finance Service

---

## 🎯 PRINCÍPIO FUNDAMENTAL

❗ **NENHUM KPI FINANCEIRO É CALCULADO NO FRONT-END**  
❗ **TODA A LÓGICA DE NEGÓCIO VIVE NO BACKEND**

O frontend apenas:
- Consome dados prontos via API
- Exibe KPIs calculados
- Envia transações para backend

---

## 📊 FONTE DA VERDADE

### Database Principal: **TRANSACTIONS**

Todas as transações financeiras ficam persistidas no Notion.

**Campos:**
```typescript
{
  id: string;
  Name: string;                    // Descrição
  Date: string;                     // YYYY-MM-DD
  Amount: number;                   // Positivo = Entrada, Negativo = Saída
  Type: 'Entrada' | 'Saída';
  Category?: string;                // Categoria do plano de contas
  Account: string;                  // Conta bancária
  Description?: string;             // Detalhes
  Imported: boolean;                // Se veio de CSV
  ImportedAt?: string;             // Data de importação
  FileSource?: string;             // Nome do arquivo CSV
}
```

---

## ⚙️ DEFINIÇÕES FINANCEIRAS

### 1️⃣ **RECEITA**
- **Critério:** `Type = 'Entrada'` E `Amount > 0`
- **Exemplos:**
  - Salário
  - Freelance
  - Investimentos
  - Outras receitas

### 2️⃣ **DESPESA**
- **Critério:** `Type = 'Saída'` E `Amount < 0`
- **Exemplos:**
  - Compras
  - Contas
  - Serviços

### 3️⃣ **DÍVIDA**
- **Critério:** `Category` contém uma das palavras-chave:
  - "dívida" / "divida"
  - "cartão" / "cartao"
  - "empréstimo" / "emprestimo"
  - "financiamento"
- **Características:**
  - É uma despesa (Type = 'Saída')
  - **NÃO entra no Custo de Vida**
  - Aparece separada nos relatórios

### 4️⃣ **CUSTO DE VIDA**
- **Critério:** Despesas ESSENCIAIS (exclui Dívidas e Variáveis)
- **Categorias Essenciais:**
  - Moradia (aluguel, condomínio, luz, água, gás)
  - Alimentação
  - Transporte
  - Saúde
  - Educação
- **Palavra-chave na Category:** "essencial" ou nome da categoria essencial

### 5️⃣ **TAXA DE POUPANÇA**
- **Fórmula:** `(Receitas - Despesas) / Receitas * 100`
- **Retorna:** Percentual (%)
- **Exemplo:**
  - Receitas: R$ 5.000
  - Despesas: R$ 3.500
  - Taxa: (5000 - 3500) / 5000 * 100 = 30%

---

## 📅 PERÍODO PADRÃO

### Mês Corrente
- **Padrão:** Primeiro dia do mês atual até último dia do mês atual
- **Cálculo Automático:** Backend calcula baseado em `new Date()`
- **Formato:** YYYY-MM-DD

**Exemplo:**
- Hoje: 23/01/2026
- Período: 2026-01-01 até 2026-01-31

---

## 🏷️ CATEGORIAS DO PLANO DE CONTAS

### 📈 RECEITAS
- Salário
- Freelance
- Investimentos
- Outras Receitas

### 🏠 DESPESAS ESSENCIAIS (Custo de Vida)
- Moradia
- Alimentação
- Transporte
- Saúde
- Educação

### 🎮 DESPESAS VARIÁVEIS
- Lazer
- Compras
- Assinaturas
- Outros

### 💳 DÍVIDAS (não entram no Custo de Vida)
- Dívida
- Cartão de Crédito
- Empréstimo
- Financiamento

### 💰 INVESTIMENTOS
- Poupança
- Ações
- Fundos
- Outros

---

## 📊 KPIs CALCULADOS (BACKEND)

### 1. **Total de Receitas (Mês Atual)**
**Função:** `calculateTotalIncome()`  
**Fórmula:** `SUM(Amount WHERE Type = 'Entrada' AND Amount > 0)`  
**Período:** Mês corrente

### 2. **Total de Despesas (Mês Atual)**
**Função:** `calculateTotalExpenses()`  
**Fórmula:** `SUM(ABS(Amount) WHERE Type = 'Saída' AND Amount < 0)`  
**Período:** Mês corrente

### 3. **Saldo do Mês**
**Função:** `calculateBalance()`  
**Fórmula:** `Receitas - Despesas`  
**Período:** Mês corrente

### 4. **Custo de Vida**
**Função:** `calculateCostOfLiving()`  
**Fórmula:** `SUM(ABS(Amount) WHERE Type = 'Saída' AND isEssential AND NOT isDivida)`  
**Período:** Mês corrente

### 5. **Taxa de Poupança (%)**
**Função:** `calculateSavingsRate()`  
**Fórmula:** `(Receitas - Despesas) / Receitas * 100`  
**Período:** Mês corrente

### 6. **Saldo Total (Acumulado)**
**Função:** `calculateTotalBalance()`  
**Fórmula:** `SUM(Amount) de TODAS as transações`  
**Período:** Histórico completo

### 7. **Total de Dívidas (Mês Atual)**
**Função:** `calculateTotalDebts()`  
**Fórmula:** `SUM(ABS(Amount) WHERE Type = 'Saída' AND isDivida)`  
**Período:** Mês corrente

### 8. **Despesas por Categoria**
**Função:** `groupExpensesByCategory()`  
**Fórmula:** `GROUP BY Category, SUM(ABS(Amount))`  
**Período:** Mês corrente

---

## 🔌 ENDPOINTS DA API

### 1. **GET /api/finance/summary**
**Descrição:** Resumo financeiro do mês corrente  
**Auth:** x-admin-passcode (admin, Flora, ou finance)

**Query Params:**
- `account` (opcional): Filtrar por conta específica

**Response:**
```typescript
{
  period: { 
    startDate: "2026-01-01", 
    endDate: "2026-01-31" 
  },
  totalIncome: 5000.00,
  totalExpenses: 3500.00,
  balance: 1500.00,
  costOfLiving: 2800.00,
  savingsRate: 30.00,
  totalDebts: 500.00,
  expensesByCategory: {
    "Moradia": 1200.00,
    "Alimentação": 800.00,
    "Transporte": 500.00,
    "Dívida": 500.00,
    "Lazer": 300.00
  }
}
```

---

### 2. **GET /api/finance/history**
**Descrição:** Histórico financeiro (últimos 6 meses)  
**Auth:** x-admin-passcode

**Query Params:**
- `account` (opcional): Filtrar por conta específica

**Response:**
```typescript
[
  {
    month: "2025-08",
    income: 4800.00,
    expenses: 3200.00,
    balance: 1600.00,
    savingsRate: 33.33
  },
  {
    month: "2025-09",
    income: 5000.00,
    expenses: 3400.00,
    balance: 1600.00,
    savingsRate: 32.00
  },
  // ... últimos 6 meses
]
```

---

### 3. **GET /api/finance/accounts**
**Descrição:** Saldos por conta bancária  
**Auth:** x-admin-passcode

**Response:**
```typescript
[
  {
    account: "Nubank - Pessoa Física",
    balance: 2500.00,
    lastUpdate: "2026-01-23"
  },
  {
    account: "Nubank - Empresa",
    balance: 15000.00,
    lastUpdate: "2026-01-22"
  }
]
```

---

### 4. **GET /api/finance/decisions-base**
**Descrição:** Dados para tomada de decisão  
**Auth:** x-admin-passcode

**Query Params:**
- `account` (opcional): Filtrar por conta específica

**Response:**
```typescript
{
  currentMonth: {
    income: 5000.00,
    expenses: 3500.00,
    balance: 1500.00,
    costOfLiving: 2800.00,
    savingsRate: 30.00
  },
  lastMonth: {
    income: 4800.00,
    expenses: 3200.00,
    balance: 1600.00,
    savingsRate: 33.33
  },
  averageLast3Months: {
    income: 4900.00,
    expenses: 3400.00,
    costOfLiving: 2700.00,
    savingsRate: 30.61
  },
  trends: {
    incomeChange: 4.17,        // % mudança vs mês anterior
    expenseChange: 9.38,        // % mudança vs mês anterior
    savingsRateChange: -3.33    // pontos percentuais de mudança
  }
}
```

---

### 5. **GET /api/finance/expense-analysis**
**Descrição:** Análise detalhada de despesas por categoria  
**Auth:** x-admin-passcode

**Query Params:**
- `account` (opcional): Filtrar por conta específica

**Response:**
```typescript
{
  period: { 
    startDate: "2026-01-01", 
    endDate: "2026-01-31" 
  },
  totalExpenses: 3500.00,
  essentialExpenses: 2800.00,
  variableExpenses: 200.00,
  debtPayments: 500.00,
  breakdown: [
    {
      category: "Moradia",
      amount: 1200.00,
      percentage: 34.29,
      type: "essential"
    },
    {
      category: "Alimentação",
      amount: 800.00,
      percentage: 22.86,
      type: "essential"
    },
    {
      category: "Dívida",
      amount: 500.00,
      percentage: 14.29,
      type: "debt"
    },
    {
      category: "Lazer",
      amount: 300.00,
      percentage: 8.57,
      type: "variable"
    }
  ]
}
```

---

## 🔐 AUTENTICAÇÃO

### Passcodes Válidos:
1. **Admin:** `FRtechfaturandoumbi` (acesso completo)
2. **Flora:** `flora123` (acesso limitado a Nubank - Pessoa Física)
3. **Finance:** `06092021` (acesso completo)

### Header:
```
x-admin-passcode: [passcode]
```

---

## 🎯 FILTRO POR CONTA (FLORA)

Quando o usuário é **Flora**, o backend automaticamente filtra apenas:
- **Account:** "Nubank - Pessoa Física"

**Implementação:**
```typescript
const account = userRole === 'flora' ? 'Nubank - Pessoa Física' : undefined;
const summary = await getFinancialSummary(account);
```

---

## 📈 HISTÓRICO E TENDÊNCIAS

### Últimos 6 Meses
- Backend busca transações dos últimos 6 meses
- Agrupa por mês (YYYY-MM)
- Calcula KPIs para cada mês
- Retorna array ordenado (mais antigo → mais recente)

### Cálculo de Tendências
- **Mudança de Receita:** `(receitaAtual - receitaMesAnterior) / receitaMesAnterior * 100`
- **Mudança de Despesa:** `(despesaAtual - despesaMesAnterior) / despesaMesAnterior * 100`
- **Mudança Taxa Poupança:** `taxaAtual - taxaMesAnterior` (pontos percentuais)

---

## 🧪 TESTES E VALIDAÇÃO

### Cenário 1: Mês Normal
**Input:**
- Receitas: R$ 5.000 (Salário)
- Despesas Essenciais: R$ 2.800 (Moradia + Alimentação)
- Despesas Variáveis: R$ 200 (Lazer)
- Dívidas: R$ 500 (Cartão)

**Expected Output:**
- Total Receitas: R$ 5.000
- Total Despesas: R$ 3.500
- Saldo: R$ 1.500
- Custo de Vida: R$ 2.800 (exclui dívida e lazer)
- Taxa de Poupança: 30%

---

### Cenário 2: Flora (Filtro por Conta)
**Input:**
- Account: "Nubank - Pessoa Física"
- Transações em outras contas devem ser ignoradas

**Expected Output:**
- Apenas transações do Nubank - PF aparecem
- KPIs calculados apenas sobre essa conta

---

### Cenário 3: Sem Transações
**Input:**
- Mês sem transações

**Expected Output:**
- Total Receitas: R$ 0
- Total Despesas: R$ 0
- Saldo: R$ 0
- Taxa de Poupança: 0%

---

## 🚨 REGRAS DE VALIDAÇÃO

### 1. Valores Negativos
- Despesas (Saída) devem ter `Amount < 0`
- Backend sempre trabalha com valor absoluto para exibição

### 2. Categorias Obrigatórias
- Se `Category` estiver vazio, assume "Sem Categoria"
- Categorização correta é responsabilidade do usuário/Flora

### 3. Filtros de Data
- Sempre usar formato YYYY-MM-DD
- Backend valida período (startDate <= endDate)

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **NUNCA calcular KPIs no frontend**
   - Frontend apenas exibe dados prontos
   - Backend é a única fonte de verdade

2. **Filtro por Conta é opcional**
   - Se não especificado, retorna dados de todas as contas
   - Flora sempre filtra por "Nubank - Pessoa Física"

3. **Histórico é limitado**
   - Máximo 6 meses para performance
   - Backend pode ser expandido se necessário

4. **Categorização é responsabilidade do usuário**
   - Backend não categoriza automaticamente (ainda)
   - Database CATEGORIZATIONRULES pode ser usada no futuro

---

**Documento Técnico**  
**FR Tech OS - Finance Module**  
**Versão 1.0 - Janeiro 2026**
