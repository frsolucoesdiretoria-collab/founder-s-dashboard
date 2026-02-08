# 📊 COMPARAÇÃO LADO A LADO — V2 vs V2.1

## 🎯 OBJETIVO
Visualizar exatamente o que mudou entre a versão original (V2) e a nova versão (V2.1).

---

## 📁 ESTRUTURA DE ARQUIVOS

### V2 (ORIGINAL — INTACTA)
```
src/
├── pages/
│   └── FinanceFloraV2.tsx              ← Versão original
├── components/
│   └── finance-v2/
│       └── OverviewPF.tsx              ← Componente original
└── lib/
    └── finance-v2-data.ts              ← Mocks originais
```

### V2.1 (NOVA VERSÃO — ISOLADA)
```
src/
├── pages/
│   ├── FinanceFloraV2.tsx              ← Mantida intacta
│   └── FinanceFloraV21.tsx             ← NOVO (cópia com import diferente)
├── components/
│   └── finance-v2/
│       ├── OverviewPF.tsx              ← Mantido intacto
│       └── OverviewPF_V21.tsx          ← NOVO (alterações aplicadas)
└── lib/
    ├── finance-v2-data.ts              ← Mantido intacto
    └── finance-v2-data-v21.ts          ← NOVO (mocks V2.1)
```

---

## 🔀 ROTAS

| Versão | Rota | Componente | Status |
|--------|------|------------|--------|
| V2 | `/finance/flora-v2` | `FinanceFloraV2` | ✅ Intacta |
| V2.1 | `/finance/flora-v2.1` | `FinanceFloraV21` | ✅ Nova |

---

## 🎨 LAYOUT — VISÃO PF

### 📌 TOPO

#### V2 (Original)
```
┌────────────┬────────────┬────────────┬────────────┐
│ Saldo do   │ Orçamento  │ Capacidade │ Total em   │
│ Mês        │            │ de Poupança│ Contas     │
│            │            │            │            │
│ R$ 2.055   │ R$ 7.770   │ R$ 2.055   │ R$ 19.570  │
│            │ ██████░░░  │ 18.7%      │            │
│            │ 73%        │            │            │
└────────────┴────────────┴────────────┴────────────┘
```

#### V2.1 (Nova)
```
┌──────────────────────────────────────────────────┐
│ Gastos realizados até o momento (Mês atual)      │
├──────────────────────────────────────────────────┤
│ Moradia           R$ 4.850,00 de R$ 5.000,00  97%│
│ ████████████████████████████████████████░░░░     │
│                                                  │
│ Alimentação       R$ 1.420,00 de R$ 2.000,00  71%│
│ ████████████████████████████░░░░░░░░░░░░░░░░     │
│                                                  │
│ Saúde             R$ 1.250,00 de R$ 1.100,00 114%│
│ ████████████████████████████████████████████     │  ← Clampado em 100%
│                                                  │
│ ... (continua com as 12 categorias)             │
└──────────────────────────────────────────────────┘
```

**Mudanças:**
- ❌ Removido: 4 KPIs antigos (Saldo, Orçamento, Poupança, Total Contas)
- ✅ Adicionado: 1 card com 12 categorias + barras de progresso
- ✅ Cada categoria mostra: realizado, meta, percentual, barra colorida

---

### 📌 GRÁFICOS

#### V2 (Original)
```
┌──────────────────────┬──────────────────────┐
│ Fluxo Mensal         │ Despesas por         │
│                      │ Categoria            │
│ ┌──┐                 │                      │
│ │██│  Receitas       │        ◉            │
│ └──┘                 │       / \            │
│ ┌──┐                 │      /   \           │
│ │██│  Despesas       │     /     \          │
│ └──┘                 │    ◉───────◉        │
│                      │   Essencial Variável │
└──────────────────────┴──────────────────────┘
```

#### V2.1 (Nova)
```
┌──────────────────────┬──────────────────────┐
│ Fluxo Mensal         │ Despesas por         │
│                      │ Categoria            │
│ (igual ao V2)        │ ┌─────────────────┐  │ ← NOVO
│                      │ │ [Meta] Realizado │  │
│                      │ └─────────────────┘  │
│                      │                      │
│                      │  12 fatias coloridas │
│                      │  (Moradia, Aliment., │
│                      │   Saúde, Lazer, ...) │
└──────────────────────┴──────────────────────┘

Legenda:
• Moradia (laranja)        R$ 5.000,00 (25%)
• Alimentação (verde)      R$ 2.000,00 (10%)
• ... (lista completa)
```

**Mudanças:**
- ✅ Mantido: Gráfico "Fluxo Mensal" (igual)
- ❌ Removido: Categorias "Essencial" e "Variável"
- ✅ Adicionado: Toggle "Meta" | "Realizado"
- ✅ Adicionado: 12 categorias específicas no gráfico de pizza
- ✅ Adicionado: Legenda com percentuais

---

### 📌 CARDS INFERIORES

#### V2 (Original)
```
┌──────────────────────────────────────┐
│ Maiores Despesas do Mês              │
├──────────────────────────────────────┤
│ 1 Moradia (Aluguel/Financiamento)    │
│   R$ 2.200,00                        │
│                                      │
│ 2 Alimentação                        │
│   R$ 1.200,00                        │
│                                      │
│ 3 Condomínio                         │
│   R$ 450,00                          │
│                                      │
│ 4 Lazer                              │
│   R$ 350,00                          │
│                                      │
│ 5 Energia Elétrica                   │
│   R$ 185,50                          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Orçamento vs Gasto Real              │
│ Acompanhamento por plano de contas   │
├──────────────────────────────────────┤
│ Moradia (Aluguel/Financiamento)      │
│ R$ 2.200,00 de R$ 2.200,00   100%   │
│ ████████████████████████████████     │
│                                      │
│ Condomínio                           │
│ R$ 450,00 de R$ 450,00       100%   │
│ ████████████████████████████████     │
│                                      │
│ ... (lista de planos de conta)       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Contas Bancárias PF                  │
├──────────────────────────────────────┤
│ Nubank PF          R$ 5.420,50       │
│ Conta Corrente                       │
│                                      │
│ Itaú PF            R$ 2.150,00       │
│ Conta Corrente                       │
│                                      │
│ Caixa Poupança     R$ 12.000,00      │
│ Poupança                             │
└──────────────────────────────────────┘
```

#### V2.1 (Nova)
```
┌──────────────────────────────────────┐
│ Metas de despesas do mês             │  ← Título alterado
│ Metas por categoria                  │
├──────────────────────────────────────┤
│ Moradia                R$ 5.000,00   │
│ Alimentação            R$ 2.000,00   │
│ Saúde                  R$ 1.100,00   │
│ Lazer                  R$ 1.000,00   │
│ Shelby                 R$ 200,00     │
│ Tonolher               R$ 4.000,00   │
│ Transporte             R$ 1.000,00   │
│ Investimentos          R$ 2.000,00   │
│ Compras Fabricio       R$ 500,00     │
│ Compra Flora           R$ 500,00     │
│ Dizimo                 R$ 1.700,00   │
│ Meta Cruzeiro          R$ 1.500,00   │  ← Lista completa (12 itens)
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Orçamento vs Gasto Real              │
│ Acompanhamento por categoria         │  ← Subtítulo alterado
│ (mês atual)                          │
├──────────────────────────────────────┤
│ Moradia                              │
│ R$ 4.850,00 de R$ 5.000,00    97%   │
│ ████████████████████████████████░░   │
│                                      │
│ Alimentação                          │
│ R$ 1.420,00 de R$ 2.000,00    71%   │
│ ████████████████████████░░░░░░░░░░   │
│                                      │
│ ... (12 categorias, mesmos valores   │
│      do card do topo)                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Contas Bancárias PF                  │
├──────────────────────────────────────┤
│ Nubank PF Fabricio  R$ 5.420,50      │  ← Nome alterado
│ Conta Corrente                       │
│                                      │
│ Nubank PF Flora     R$ 3.250,00      │  ← NOVA
│ Conta Corrente                       │
│                                      │
│ Inter PF Flora      R$ 1.890,00      │  ← NOVA
│ Conta Corrente                       │
│                                      │
│ Nubank PJ           R$ 18.500,00     │  ← NOVA
│ Conta Corrente                       │
│                                      │
│ C6 PJ               R$ 12.300,00     │  ← NOVA
│ Conta Corrente                       │
└──────────────────────────────────────┘
```

**Mudanças:**
- ✅ Título alterado: "Maiores Despesas" → "Metas de despesas"
- ✅ Conteúdo alterado: Top 5 → Lista completa (12 categorias)
- ✅ Subtítulo alterado: "por plano de contas" → "por categoria (mês atual)"
- ✅ Valores consistentes: Orçamento vs Gasto usa mesmos valores do topo
- ✅ Contas bancárias: 3 contas → 5 contas (nomes atualizados)

---

## 🎨 CORES DAS BARRAS DE PROGRESSO

### V2 (Original)
```
Verde:   < 70%
Amarelo: 70-90%
Vermelho: > 90%
```

### V2.1 (Nova)
```
Verde:   < 70%  (igual)
Amarelo: 70-90% (igual)
Vermelho: > 90% (igual)
```
**Mesma lógica mantida.**

---

## 📊 DADOS (MOCKS)

### V2 (Original)
```typescript
// Baseado em transações e planos de conta genéricos
- ACCOUNT_PLANS (array de objetos)
- TRANSACTIONS (array de transações)
- BANK_ACCOUNTS (3 contas PF)
```

### V2.1 (Nova)
```typescript
// Baseado em 12 categorias fixas e valores hardcoded
- CATEGORIES_V21 (array de 12 strings)
- METAS_V21 (objeto com 12 valores)
- REALIZADOS_V21 (objeto com 12 valores)
- CATEGORY_COLORS_V21 (objeto com 12 cores)
- BANK_ACCOUNTS_V21 (array de 5 contas)
```

---

## 🔄 OUTRAS TABS (NÃO ALTERADAS)

| Tab | V2 | V2.1 |
|-----|----|----|
| **Visão PF** | OverviewPF | OverviewPF_V21 ← Diferente |
| **Visão PJ** | OverviewPJ | OverviewPJ ← Igual |
| **Lançamentos** | Transactions | Transactions ← Igual |
| **Orçamentos** | Budgets | Budgets ← Igual |
| **Conciliação** | Conciliation | Conciliation ← Igual |
| **Configurações** | FinanceSettings | FinanceSettings ← Igual |

**Apenas "Visão PF" mudou. Todas as outras tabs usam os mesmos componentes.**

---

## 📈 RESUMO DAS ALTERAÇÕES

| Item | V2 | V2.1 | Status |
|------|----|----|--------|
| KPIs topo | 4 cards | 1 card com 12 categorias | ✅ Alterado |
| Gráfico Fluxo | BarChart | BarChart (igual) | ✅ Mantido |
| Gráfico Despesas | PieChart (Essencial/Variável) | PieChart (12 categorias) + Toggle | ✅ Alterado |
| Card Despesas | "Maiores Despesas" (Top 5) | "Metas de despesas" (12 total) | ✅ Alterado |
| Card Orçamento | Por plano de contas | Por categoria (12 total) | ✅ Alterado |
| Contas bancárias | 3 contas | 5 contas | ✅ Alterado |
| Outras tabs | - | - | ✅ Mantidas |

---

## ✅ COMPATIBILIDADE

- ✅ V2 original não foi alterada
- ✅ V2 e V2.1 podem coexistir
- ✅ Mocks separados (sem conflito)
- ✅ Componentes isolados (sem quebra)
- ✅ Rotas independentes

---

## 🎯 QUANDO USAR CADA VERSÃO

### Use V2 se:
- Quer visão por "Essencial" e "Variável"
- Precisa ver Top 5 despesas
- Trabalha com planos de conta genéricos
- Sistema atual já funciona

### Use V2.1 se:
- Precisa de categorias fixas e específicas
- Quer acompanhar 12 categorias com barras de progresso
- Precisa alternar visualização Meta/Realizado no gráfico
- Quer listar todas as categorias (não apenas Top 5)
- Tem 5 contas bancárias (Nubank PF Fabricio, Flora, Inter, etc.)

---

## 📍 LINKS RÁPIDOS

**V2 (original):**
- Local: `http://localhost:5173/finance/flora-v2`
- Produção: `https://frtechltda.com.br/finance/flora-v2`

**V2.1 (nova):**
- Local: `http://localhost:5173/finance/flora-v2.1`
- Produção: `https://frtechltda.com.br/finance/flora-v2.1`

---

## 🔧 ARQUIVOS PARA EDITAR

### Se quiser alterar V2:
```
src/lib/finance-v2-data.ts
src/components/finance-v2/OverviewPF.tsx
```

### Se quiser alterar V2.1:
```
src/lib/finance-v2-data-v21.ts
src/components/finance-v2/OverviewPF_V21.tsx
```

**Ambas as versões são independentes.**
