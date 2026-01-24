# 💰 MÓDULO FINANÇAS PESSOAIS — GUIA COMPLETO

**Sistema:** FR Tech OS - Founder's Dashboard  
**Módulo:** Finanças Pessoais  
**Status:** ✅ Backend Completo | 🚧 UI em Desenvolvimento

---

## 📋 ÍNDICE RÁPIDO

### 🏗️ **Arquitetura**
📁 [AUDITORIA_ARQUITETURA_FINANCAS.md](./AUDITORIA_ARQUITETURA_FINANCAS.md)
- Databases do Notion (estrutura e campos)
- Relacionamentos entre databases
- Decisões de arquitetura (MVP vs Futuro)
- Databases ativas vs não usadas

### 📊 **Regras de Negócio**
📁 [REGRAS_NEGOCIO_FINANCAS.md](./REGRAS_NEGOCIO_FINANCAS.md)
- Definições financeiras (receita, despesa, dívida, custo de vida)
- Fórmulas de KPIs
- Categorias do plano de contas
- Especificação de endpoints
- Exemplos de request/response

### 🧪 **Testes**
📁 [TESTES_API_FINANCAS.md](./TESTES_API_FINANCAS.md)
- Comandos curl para testar endpoints
- Cenários de teste
- Testes de erro
- Checklist de validação
- Troubleshooting

### ✅ **Resumo da Implementação**
📁 [BACKEND_FINANCEIRO_IMPLEMENTADO.md](./BACKEND_FINANCEIRO_IMPLEMENTADO.md)
- Status do projeto
- Arquivos criados/modificados
- Endpoints implementados
- Próximos passos

---

## 🗂️ ESTRUTURA DO CÓDIGO

### Backend
```
server/
├── services/
│   └── finance.service.ts          # 🆕 Lógica de negócio financeira
├── routes/
│   └── finance.ts                  # ✅ Rotas REST (5 novos endpoints)
└── lib/
    └── notionDataLayer.ts          # ✅ Integração com Notion (já existia)
```

### Frontend
```
src/
├── pages/
│   └── Finance.tsx                 # ✅ Página principal (já existe)
└── services/
    ├── index.ts                    # ⏳ Adicionar chamadas aos novos endpoints
    └── finance.service.ts          # ✅ Client service (já existe)
```

---

## 🔌 ENDPOINTS DISPONÍVEIS

### 1️⃣ **Resumo Financeiro**
```
GET /api/finance/summary
```
**Retorna:** KPIs do mês corrente (receitas, despesas, saldo, custo de vida, taxa de poupança, dívidas)

---

### 2️⃣ **Histórico**
```
GET /api/finance/history
```
**Retorna:** Últimos 6 meses (para gráficos)

---

### 3️⃣ **Saldos por Conta**
```
GET /api/finance/accounts
```
**Retorna:** Saldo acumulado de cada conta bancária

---

### 4️⃣ **Dados para Decisão**
```
GET /api/finance/decisions-base
```
**Retorna:** Comparação mês atual vs anterior, média 3 meses, tendências

---

### 5️⃣ **Análise de Despesas**
```
GET /api/finance/expense-analysis
```
**Retorna:** Breakdown detalhado por categoria e tipo (essencial, variável, dívida)

---

### 6️⃣ **Transações** (já existia)
```
GET /api/finance/transactions
POST /api/finance/transactions
POST /api/finance/transactions/import
```
**Retorna:** Lista de transações com filtros

---

## 🎯 REGRAS PRINCIPAIS

### ❗ PRINCÍPIO FUNDAMENTAL
**NENHUM KPI É CALCULADO NO FRONTEND**

### 💵 Definições
- **RECEITA:** Type = 'Entrada', Amount > 0
- **DESPESA:** Type = 'Saída', Amount < 0
- **DÍVIDA:** Category contém "dívida", "cartão", "empréstimo"
- **CUSTO DE VIDA:** Despesas essenciais (exclui dívidas)
- **TAXA DE POUPANÇA:** (Receitas - Despesas) / Receitas * 100

### 📅 Período Padrão
**Mês corrente** (calculado automaticamente pelo backend)

### 🏦 Contas Suportadas
- Nubank - Pessoa Física ⭐ (Flora)
- Nubank - Empresa
- Banco do Brasil
- Itaú
- Outros

---

## 🔐 AUTENTICAÇÃO

### Passcodes Válidos
```
Admin:   FRtechfaturandoumbi  (acesso total)
Flora:   flora123             (Nubank - PF apenas)
Finance: 06092021             (acesso total)
```

### Header Obrigatório
```
x-admin-passcode: [passcode]
```

---

## 🧪 TESTE RÁPIDO

### 1. Verificar se servidor está rodando
```bash
curl http://localhost:3001/api/health
```

### 2. Testar endpoint de resumo
```bash
curl -X GET "http://localhost:3001/api/finance/summary" \
  -H "x-admin-passcode: FRtechfaturandoumbi"
```

### 3. Ver logs (se houver erro)
```bash
pm2 logs founder-dashboard --lines 30
```

---

## 📊 DATABASES DO NOTION

### ✅ Ativas (MVP)
1. **TRANSACTIONS** - Transações financeiras
2. **KPIS** - KPIs (IsFinancial = true)
3. **GOALS** - Metas relacionadas aos KPIs

### ⏳ Futuras (Fase 2)
1. **BUDGETGOALS** - Orçamento mensal por categoria
2. **ACCOUNTS** - Gestão de contas e saldos
3. **ACCOUNTSPAYABLE** - Dívidas detalhadas
4. **ACCOUNTSRECEIVABLE** - Valores a receber

---

## 🎨 PRÓXIMA FASE: UI

O backend está pronto. Agora pode implementar a UI.

### Frontend Deve:
- ✅ Chamar os endpoints
- ✅ Exibir KPIs prontos
- ✅ Criar gráficos com dados do /history
- ✅ Formatar valores (R$, %)

### Frontend NÃO Deve:
- ❌ Calcular KPIs
- ❌ Implementar regras de negócio
- ❌ Filtrar ou agregar transações

---

## 📖 EXEMPLO DE USO (Frontend)

### 1. Buscar Resumo Financeiro
```typescript
const summary = await fetch('/api/finance/summary', {
  headers: {
    'x-admin-passcode': passcode
  }
});

const data = await summary.json();

// Exibir
<KPI label="Receitas" value={formatCurrency(data.totalIncome)} />
<KPI label="Despesas" value={formatCurrency(data.totalExpenses)} />
<KPI label="Saldo" value={formatCurrency(data.balance)} />
<KPI label="Taxa de Poupança" value={`${data.savingsRate.toFixed(1)}%`} />
```

### 2. Criar Gráfico de Histórico
```typescript
const history = await fetch('/api/finance/history', {
  headers: {
    'x-admin-passcode': passcode
  }
});

const data = await history.json();

// Usar data diretamente no gráfico
<LineChart data={data} xKey="month" yKey="balance" />
```

---

## 🔧 TROUBLESHOOTING

### Problema: Endpoint retorna 401
**Causa:** Passcode inválido ou ausente  
**Solução:** Verificar header `x-admin-passcode`

### Problema: Endpoint retorna array vazio
**Causa:** Sem transações no período  
**Solução:** Importar transações ou testar com período diferente

### Problema: Erro 500
**Causa:** Database não configurada ou token inválido  
**Solução:** Verificar `NOTION_DB_TRANSACTIONS` no .env

---

## 📚 DOCUMENTAÇÃO COMPLETA

| Arquivo | Descrição |
|---------|-----------|
| 🏗️ [AUDITORIA_ARQUITETURA_FINANCAS.md](./AUDITORIA_ARQUITETURA_FINANCAS.md) | Estrutura de databases |
| 📊 [REGRAS_NEGOCIO_FINANCAS.md](./REGRAS_NEGOCIO_FINANCAS.md) | Regras e definições |
| 🧪 [TESTES_API_FINANCAS.md](./TESTES_API_FINANCAS.md) | Guia de testes |
| ✅ [BACKEND_FINANCEIRO_IMPLEMENTADO.md](./BACKEND_FINANCEIRO_IMPLEMENTADO.md) | Resumo da implementação |

---

## 🚀 DEPLOY

### Local (Desenvolvimento)
```bash
npm run dev
```

### Produção (VPS)
```bash
cd /var/www/founder-dashboard
git pull origin main
npm install
npm run build
pm2 restart founder-dashboard
pm2 logs founder-dashboard --lines 30
```

---

## 📞 CONTATO

**Sistema:** FR Tech OS  
**Módulo:** Finanças Pessoais  
**Versão:** 1.0  
**Data:** Janeiro 2026

---

**🎯 Backend 100% pronto para ser consumido pelo frontend**
