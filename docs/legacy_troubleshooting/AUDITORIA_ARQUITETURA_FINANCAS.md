# 🏗️ AUDITORIA DE ARQUITETURA — MÓDULO FINANÇAS PESSOAIS

**Data:** 23/01/2026  
**Responsável:** Arquiteto de Sistemas Sênior  
**Objetivo:** Validar arquitetura de dados Notion antes de implementar UI

---

## 📊 SUMÁRIO EXECUTIVO

### ✅ Status Geral: **APROVADO COM AJUSTES MÍNIMOS**

A arquitetura atual possui as databases necessárias, mas algumas não estão integradas ao backend. Proposta: **ajustes mínimos sem criar novas databases**.

---

## 🗄️ DATABASES EXISTENTES NO NOTION

### 1️⃣ **Transações Financeiras** ✅ INTEGRADA
**Env Var:** `NOTION_DB_TRANSACTIONS`  
**ID Configurado:** `2dd84566a5fa8051bd52ca792e0f883e`  
**Status:** ✅ Integrada ao backend  
**Uso Atual:** Importação de extratos CSV (Nubank, outros bancos)

**Campos Implementados:**
```typescript
interface NotionTransaction {
  id: string;
  Name: string;                    // Descrição da transação
  Date: string;                     // Data da transação
  Amount: number;                   // Valor (negativo = saída, positivo = entrada)
  Type: 'Entrada' | 'Saída';       // Tipo
  Category?: string;                // Categoria do plano de contas
  Account: string;                  // Conta bancária (select)
  Description?: string;             // Descrição detalhada
  BudgetGoal?: string;             // Relação com meta orçamentária (relation)
  Imported: boolean;                // Se foi importado de extrato
  ImportedAt?: string;             // Data de importação
  FileSource?: string;             // Nome do arquivo CSV
}
```

**Backend:**
- ✅ `getTransactions()` - com filtros (account, category, type, dateRange)
- ✅ `createTransaction()` - criar transação manual
- ✅ `createTransactionsBulk()` - importar extrato CSV
- ✅ Endpoint: `GET /api/finance/transactions`
- ✅ Endpoint: `POST /api/finance/transactions`
- ✅ Endpoint: `POST /api/finance/transactions/import`

**Contas Bancárias Disponíveis:**
- Nubank - Pessoa Física ⭐ (Flora)
- Nubank - Empresa
- Banco do Brasil
- Itaú
- Outros

---

### 2️⃣ **Metas de Orçamento (Budget Goals)** ⚠️ DEFINIDA MAS NÃO USADA
**Env Var:** `NOTION_DB_BUDGETGOALS`  
**ID Configurado:** `2dd84566a5fa80b6b749de2f7ff328c8`  
**Status:** ⚠️ Schema definido, mas SEM backend integrado

**Campos Definidos no Schema:**
```typescript
interface NotionBudgetGoal {
  id: string;
  Name: string;                    // Nome da meta
  Category: string;                // Categoria (Essencial, Variável, Dívida, etc)
  Month: number;                   // Mês (1-12)
  Year: number;                    // Ano
  BudgetAmount: number;            // Valor previsto
  SpentAmount: number;             // Valor gasto (calculado)
  PeriodStart: string;             // Data início
  PeriodEnd: string;               // Data fim
  Status: 'Em andamento' | 'Atingido' | 'Excedido' | 'Não iniciado';
  Notes?: string;                  // Observações
}
```

**Ação Necessária:**
- [ ] Backend ainda não implementado
- [ ] Relacionamento com Transactions existe no schema
- [ ] Pode ser usado para KPIs de "% do orçamento gasto"

---

### 3️⃣ **Contas Bancárias (Accounts)** ⚠️ EXISTE MAS NÃO INTEGRADA
**Env Var:** `NOTION_DB_ACCOUNTS`  
**ID Configurado:** `2dd84566a5fa817ea101d06cfba6e38a`  
**Status:** ⚠️ Existe no .env mas NÃO tem schema definido

**Proposta de Campos Mínimos:**
```typescript
interface NotionAccount {
  id: string;
  Name: string;                    // Nome da conta (ex: "Nubank - PF")
  Type: string;                    // Banco | Carteira | Investimento
  CurrentBalance: number;          // Saldo atual
  Currency: string;                // BRL (padrão)
  Active: boolean;                 // Conta ativa?
  Notes?: string;                  // Observações
}
```

**Ação Necessária:**
- [ ] Adicionar schema ao `schema.ts`
- [ ] Criar backend functions (getAccounts, updateBalance)
- [ ] Integrar com Transactions para calcular saldos automáticos

---

### 4️⃣ **Contas a Pagar (Accounts Payable)** ⚠️ EXISTE MAS NÃO INTEGRADA
**Env Var:** `NOTION_DB_ACCOUNTSPAYABLE`  
**ID Configurado:** `2dd84566a5fa8131a438d089be016fcb`  
**Status:** ⚠️ Existe no .env mas NÃO tem schema definido

**Proposta de Campos (Dívidas):**
```typescript
interface NotionAccountPayable {
  id: string;
  Name: string;                    // Nome do credor/dívida
  OriginalAmount: number;          // Valor original
  RemainingBalance: number;        // Saldo devedor atual
  MonthlyPayment: number;          // Parcela mensal
  InterestRate: number;            // Taxa de juros (%)
  DueDate: string;                 // Data de vencimento
  Status: 'Ativo' | 'Quitado' | 'Atrasado';
  Account?: string;                // Relação com conta (relation)
  Notes?: string;                  // Observações
}
```

**Ação Necessária:**
- [ ] Adicionar schema ao `schema.ts`
- [ ] Criar backend functions (getAccountsPayable, updateBalance)
- [ ] KPI: Total de dívidas ativas

---

### 5️⃣ **Contas a Receber (Accounts Receivable)** ⚠️ EXISTE MAS NÃO INTEGRADA
**Env Var:** `NOTION_DB_ACCOUNTSRECEIVABLE`  
**ID Configurado:** `2dd84566a5fa8109a3c9ccb91894ad22`  
**Status:** ⚠️ Existe no .env mas NÃO tem schema definido

**Proposta de Campos:**
```typescript
interface NotionAccountReceivable {
  id: string;
  Name: string;                    // Nome do devedor/cliente
  OriginalAmount: number;          // Valor original
  RemainingBalance: number;        // Saldo a receber
  DueDate: string;                 // Data de vencimento
  Status: 'Pendente' | 'Recebido' | 'Atrasado';
  Account?: string;                // Relação com conta (relation)
  Notes?: string;                  // Observações
}
```

**Ação Necessária:**
- [ ] Adicionar schema ao `schema.ts`
- [ ] Criar backend functions (getAccountsReceivable)
- [ ] KPI: Total a receber

---

### 6️⃣ **Metas Financeiras (Goals + KPIs)** ✅ INTEGRADA
**Env Var:** `NOTION_DB_GOALS` + `NOTION_DB_KPIS`  
**Status:** ✅ Totalmente integrada

**Uso Atual:**
- Database de **KPIs** com campo `IsFinancial: boolean`
- KPIs financeiros (IsFinancial = true) aparecem na página Finance
- Database de **Goals** para definir metas de KPIs
- Relacionamento: Goal → KPI (relation)

**Exemplo de KPI Financeiro:**
```typescript
{
  Name: "Saldo Nubank - Pessoa Física",
  Category: "Pessoal",
  IsFinancial: true,
  Unit: "R$",
  Current: 5000,
  Target: 10000
}
```

---

### 7️⃣ **Métricas Financeiras (Finance Metrics)** ⚠️ EXISTE MAS VAZIA
**Env Var:** `NOTION_DB_FINANCEMETRICS`  
**ID Configurado:** `2d984566a5fa81988982e06722459759`  
**Status:** ⚠️ Definida mas não usada (retorna array vazio)

**Schema Atual (minimalista):**
```typescript
interface NotionFinanceMetric {
  id: string;
  Name: string;  // Apenas título
}
```

**Recomendação:**
- ❌ **NÃO USAR** - é redundante com KPIs (IsFinancial)
- ✅ Usar apenas KPIS com `IsFinancial: true`

---

### 8️⃣ **Regras de Categorização** ⚠️ EXISTE MAS NÃO INTEGRADA
**Env Var:** `NOTION_DB_CATEGORIZATIONRULES`  
**ID Configurado:** `2dd84566a5fa81208f87e9e9a1aaaafc`  
**Status:** ⚠️ Existe no .env mas NÃO tem schema definido

**Proposta (futuro - automação):**
```typescript
interface NotionCategorizationRule {
  id: string;
  Name: string;                    // Nome da regra
  Pattern: string;                 // Padrão de texto (ex: "IFOOD")
  Category: string;                // Categoria (Alimentação)
  Active: boolean;                 // Regra ativa?
}
```

**Prioridade:** 🔽 BAIXA (não essencial para MVP)

---

## 🎯 VALIDAÇÃO DOS REQUISITOS

### ✅ Requisito 1: Transações Financeiras
**Status:** ✅ ATENDIDO COMPLETAMENTE

- ✅ Data
- ✅ Valor
- ✅ Tipo (Entrada/Saída)
- ✅ Categoria
- ✅ Conta relacionada
- ✅ Status (Imported = Confirmado, manual = Pendente)

**Ações pendentes:** NENHUMA

---

### ⚠️ Requisito 2: Contas & Saldos
**Status:** ⚠️ PARCIALMENTE ATENDIDO

**Situação Atual:**
- ✅ Database existe no Notion
- ❌ Schema não definido no código
- ❌ Backend não implementado

**Campos Necessários:**
- Nome da conta ✅ (pode ser select em Transactions)
- Tipo ❌ (precisa ser adicionado)
- Saldo atual ❌ (precisa ser calculado ou armazenado)

**Proposta:**
1. **OPÇÃO A (Mínimo):** Calcular saldos a partir das Transactions
   - Sem usar a database ACCOUNTS
   - Saldo = SUM(Transactions WHERE Account = X)
   
2. **OPÇÃO B (Recomendada):** Integrar database ACCOUNTS
   - Adicionar schema ao código
   - Criar função `getAccounts()` no backend
   - Atualizar saldo sempre que Transactions mudar

**Decisão Técnica:** **OPÇÃO A** para MVP (calcular saldo)

---

### ⚠️ Requisito 3: Dívidas
**Status:** ⚠️ PARCIALMENTE ATENDIDO

**Situação Atual:**
- ✅ Database ACCOUNTSPAYABLE existe
- ❌ Schema não definido
- ❌ Backend não implementado

**Proposta:**
1. **OPÇÃO A (MVP):** Usar Transactions com Category = "Dívida"
   - Não integrar ACCOUNTSPAYABLE agora
   - KPI: Total de saídas com Category = "Dívida"

2. **OPÇÃO B (Completo):** Integrar ACCOUNTSPAYABLE
   - Adicionar schema
   - Backend: `getAccountsPayable()`
   - KPI: Saldo devedor total

**Decisão Técnica:** **OPÇÃO A** para MVP

---

### ⚠️ Requisito 4: Metas Financeiras
**Status:** ✅ ATENDIDO (via KPIs + Goals)

**Situação Atual:**
- ✅ Database GOALS existe e está integrada
- ✅ Database KPIS existe e está integrada
- ✅ Campo `IsFinancial` separa KPIs financeiros
- ⚠️ Database BUDGETGOALS existe mas não está integrada

**Tipos de Meta Suportados:**
- ✅ Reserva de emergência (KPI)
- ✅ Redução de dívida (KPI)
- ✅ Patrimônio líquido (KPI)
- ⚠️ Orçamento mensal por categoria (precisa integrar BUDGETGOALS)

**Proposta:**
- Fase 1 (MVP): Usar apenas KPIs (IsFinancial = true)
- Fase 2: Integrar BUDGETGOALS para orçamento mensal

**Decisão Técnica:** Manter apenas KPIs financeiros no MVP

---

## 📋 ARQUITETURA FINAL PROPOSTA (MVP)

### 🔵 DATABASES ATIVAS NO MVP

#### 1. TRANSACTIONS (principal)
- ✅ Já integrada
- ✅ Backend completo
- ✅ Suporta importação CSV
- ✅ Filtros por conta, categoria, tipo, período

#### 2. KPIS (com IsFinancial = true)
- ✅ Já integrada
- ✅ KPIs financeiros separados por flag
- ✅ Relacionamento com GOALS

#### 3. GOALS (metas)
- ✅ Já integrada
- ✅ Relacionamento com KPIs

---

### 🔴 DATABASES NÃO USADAS NO MVP (futuro)

#### 1. BUDGETGOALS
- ⏳ Fase 2: Orçamento mensal por categoria
- ⏳ Precisa backend: `getBudgetGoals()`, `updateSpent()`

#### 2. ACCOUNTS
- ⏳ Fase 2: Gestão de contas e saldos
- ⏳ Por enquanto: calcular saldo via Transactions

#### 3. ACCOUNTSPAYABLE / ACCOUNTSRECEIVABLE
- ⏳ Fase 2: Gestão de dívidas e recebíveis
- ⏳ Por enquanto: usar Transactions com Category

#### 4. FINANCEMETRICS
- ❌ Não usar (redundante com KPIs)

#### 5. CATEGORIZATIONRULES
- ⏳ Fase 3: Automação de categorização

---

## 🔗 RELACIONAMENTOS ENTRE DATABASES

### Diagrama de Relacionamentos (MVP)

```
┌─────────────────┐
│     KPIs        │◄─────┐
│  (IsFinancial)  │      │
└────────┬────────┘      │
         │               │
         │ relation      │
         ▼               │
    ┌────────┐           │
    │ GOALS  │           │
    └────────┘           │
                         │
┌────────────────────────┤
│   TRANSACTIONS         │
│                        │
│ - Account (select)     │
│ - Category (select)    │
│ - BudgetGoal (relation)│── aponta para BUDGETGOALS (não usado no MVP)
└────────────────────────┘
```

---

## 📊 CAMPOS PARA CATEGORIAS

### Categories (Select Field em Transactions)

**Sugestão de Categorias:**
```
Receitas:
- Salário
- Freelance
- Investimentos
- Outras Receitas

Despesas Essenciais:
- Moradia (aluguel, condomínio)
- Alimentação
- Transporte
- Saúde
- Educação

Despesas Variáveis:
- Lazer
- Compras
- Assinaturas
- Outros

Dívidas:
- Cartão de Crédito
- Empréstimo
- Financiamento
- Outras Dívidas

Investimentos:
- Poupança
- Ações
- Fundos
- Outros
```

---

## 🎯 KPIS CALCULADOS (A PARTIR DAS TRANSACTIONS)

### KPIs Automaticamente Gerados

1. **Total de Receitas (mês atual)**
   - SUM(Amount WHERE Type = 'Entrada' AND Month = current)

2. **Total de Despesas (mês atual)**
   - SUM(ABS(Amount) WHERE Type = 'Saída' AND Month = current)

3. **Saldo do Mês**
   - Receitas - Despesas

4. **Saldo Acumulado (conta específica)**
   - SUM(Amount WHERE Account = X)

5. **Despesas por Categoria (mês atual)**
   - GROUP BY Category WHERE Type = 'Saída'

6. **Taxa de Poupança**
   - (Receitas - Despesas) / Receitas * 100

7. **Dívidas Totais**
   - SUM(ABS(Amount) WHERE Category IN ['Dívidas'])

---

## ✅ VALIDAÇÕES FINAIS

### ✅ Arquitetura Suporta KPIs?
**SIM** - Via KPIs com `IsFinancial = true` + Transactions

### ✅ Arquitetura Suporta Histórico?
**SIM** - Transactions possui campo `Date` e todos os dados ficam persistidos

### ✅ Backend Pode Consumir Tudo?
**SIM** - Apenas Transactions + KPIs + Goals (3 databases)

### ✅ É Escalável?
**SIM** - Databases futuras (Accounts, BudgetGoals, etc) já existem no Notion

---

## 📝 AÇÕES RECOMENDADAS (ANTES DA UI)

### 🚀 Prioridade ALTA (MVP)

1. ✅ **NENHUMA** - Arquitetura atual é suficiente
   - Transactions já está integrada
   - KPIs financeiros já existem
   - Backend está funcional

### ⏳ Prioridade MÉDIA (Pós-MVP)

2. **Integrar BUDGETGOALS**
   - Adicionar backend: `getBudgetGoals()`, `updateSpent()`
   - Calcular % do orçamento gasto por categoria

3. **Integrar ACCOUNTS**
   - Adicionar schema ao código
   - Backend: `getAccounts()`, `updateBalance()`
   - Calcular saldos por conta

### 🔽 Prioridade BAIXA (Futuro)

4. **Integrar ACCOUNTSPAYABLE / ACCOUNTSRECEIVABLE**
   - Para gestão avançada de dívidas e recebíveis

5. **Integrar CATEGORIZATIONRULES**
   - Para automação de categorização de transações

---

## 🎯 DECISÃO FINAL

### ✅ **ARQUITETURA APROVADA PARA IMPLEMENTAÇÃO DE UI**

**Justificativa:**
- ✅ Database TRANSACTIONS está 100% funcional
- ✅ Backend possui todos os endpoints necessários
- ✅ KPIs financeiros já existem (IsFinancial = true)
- ✅ Importação de CSV já funciona
- ✅ Filtros por conta, categoria, tipo já existem
- ✅ Histórico completo está disponível

**Próximo Passo:**
- ✅ Implementar UI da página Finance para Flora
- ✅ Mostrar KPIs financeiros (IsFinancial = true)
- ✅ Mostrar lista de transações
- ✅ Permitir importação de extrato CSV
- ✅ Mostrar resumos (Total Entradas, Total Saídas, Saldo)

---

## 📄 ANEXO: ENV VARS NECESSÁRIAS

```env
# ✅ Databases Ativas (MVP)
NOTION_DB_TRANSACTIONS=2dd84566a5fa8051bd52ca792e0f883e
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55

# ⏳ Databases Futuras (não usadas no MVP)
NOTION_DB_BUDGETGOALS=2dd84566a5fa80b6b749de2f7ff328c8
NOTION_DB_ACCOUNTS=2dd84566a5fa817ea101d06cfba6e38a
NOTION_DB_ACCOUNTSPAYABLE=2dd84566a5fa8131a438d089be016fcb
NOTION_DB_ACCOUNTSRECEIVABLE=2dd84566a5fa8109a3c9ccb91894ad22
NOTION_DB_CATEGORIZATIONRULES=2dd84566a5fa81208f87e9e9a1aaaafc

# ❌ Não usar (redundante)
NOTION_DB_FINANCEMETRICS=2d984566a5fa81988982e06722459759
```

---

**Documento Gerado por:** Sistema FR Tech OS  
**Versão:** 1.0  
**Data:** 23/01/2026
