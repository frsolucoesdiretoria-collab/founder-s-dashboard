# 🔧 GUIA RÁPIDO — COMO ALTERAR MOCKS V2.1

## 📍 Arquivo principal de mocks
```
src/lib/finance-v2-data-v21.ts
```

---

## 1️⃣ ALTERAR METAS DE CATEGORIAS

**Localização:** Linhas 20-35

```typescript
export const METAS_V21: Record<CategoryV21, number> = {
  'Moradia': 5000.00,           // ← Altere aqui
  'Alimentação': 2000.00,       // ← Altere aqui
  'Saúde': 1100.00,             // ← Altere aqui
  'Lazer': 1000.00,
  'Shelby': 200.00,
  'Tonolher': 4000.00,
  'Transporte': 1000.00,
  'Investimentos': 2000.00,
  'Compras Fabricio': 500.00,
  'Compra Flora': 500.00,
  'Dizimo': 1700.00,
  'Meta Cruzeiro': 1500.00
};
```

**Formato:**
- Valor em número decimal (sem separador de milhar)
- Use `.` para decimais (não `,`)
- Ex: `5000.00` (não `5.000,00`)

---

## 2️⃣ ALTERAR VALORES REALIZADOS

**Localização:** Linhas 37-52

```typescript
export const REALIZADOS_V21: Record<CategoryV21, number> = {
  'Moradia': 4850.00,           // ← Altere aqui
  'Alimentação': 1420.00,       // ← Altere aqui
  'Saúde': 1250.00,             // ← Altere aqui
  'Lazer': 780.00,
  'Shelby': 0,                  // ← Pode ser 0
  'Tonolher': 3200.00,
  'Transporte': 650.00,
  'Investimentos': 2000.00,
  'Compras Fabricio': 320.00,
  'Compra Flora': 450.00,
  'Dizimo': 1700.00,
  'Meta Cruzeiro': 1125.00
};
```

**Dicas:**
- Pode ser `0` (zero)
- Pode ser maior que a meta (ex: Saúde = 1250 > 1100)
- Percentual é calculado automaticamente

---

## 3️⃣ ALTERAR CONTAS BANCÁRIAS

**Localização:** Linhas 67-73

```typescript
export const BANK_ACCOUNTS_V21 = [
  { 
    id: 'nubank-pf-fabricio',           // ← ID único
    name: 'Nubank PF Fabricio',         // ← Nome exibido
    type: 'Conta Corrente',             // ← Tipo (Conta Corrente, Poupança, Investimento)
    balance: 5420.50                    // ← Saldo
  },
  // ... outras contas
];
```

**Para adicionar nova conta:**
```typescript
{
  id: 'banco-nova-conta',              // Identificador único (sem espaços)
  name: 'Banco XYZ',                   // Nome que aparece na tela
  type: 'Conta Corrente',              // Tipo da conta
  balance: 1000.00                     // Saldo atual
}
```

**Para remover conta:**
Apague o bloco inteiro (incluindo vírgula no final se necessário)

---

## 4️⃣ ALTERAR ORDEM DAS CATEGORIAS

**Localização:** Linhas 7-20

```typescript
export const CATEGORIES_V21 = [
  'Moradia',              // 1ª posição
  'Alimentação',          // 2ª posição
  'Saúde',                // 3ª posição
  'Lazer',
  'Shelby',
  'Tonolher',
  'Transporte',
  'Investimentos',
  'Compras Fabricio',
  'Compra Flora',
  'Dizimo',
  'Meta Cruzeiro'         // última posição
] as const;
```

**⚠️ ATENÇÃO:**
- Ao reordenar, **todos os lugares onde a categoria aparece serão atualizados automaticamente**
- Não é necessário alterar mais nada

---

## 5️⃣ ADICIONAR NOVA CATEGORIA

### Passo 1: Adicionar na lista
```typescript
export const CATEGORIES_V21 = [
  'Moradia',
  'Alimentação',
  // ... outras
  'Meta Cruzeiro',
  'Nova Categoria'        // ← Adicione aqui
] as const;
```

### Passo 2: Adicionar meta
```typescript
export const METAS_V21: Record<CategoryV21, number> = {
  // ... outras metas
  'Meta Cruzeiro': 1500.00,
  'Nova Categoria': 500.00  // ← Adicione aqui
};
```

### Passo 3: Adicionar realizado
```typescript
export const REALIZADOS_V21: Record<CategoryV21, number> = {
  // ... outros realizados
  'Meta Cruzeiro': 1125.00,
  'Nova Categoria': 250.00  // ← Adicione aqui
};
```

### Passo 4: Adicionar cor (para gráfico)
```typescript
export const CATEGORY_COLORS_V21: Record<CategoryV21, string> = {
  // ... outras cores
  'Meta Cruzeiro': '#6366f1',
  'Nova Categoria': '#10b981'  // ← Adicione uma cor hexadecimal
};
```

**Cores sugeridas:**
- Verde: `#10b981`
- Azul: `#3b82f6`
- Roxo: `#8b5cf6`
- Rosa: `#ec4899`
- Laranja: `#f97316`
- Amarelo: `#eab308`

---

## 6️⃣ REMOVER CATEGORIA

### ⚠️ CUIDADO: Remover categoria requer atenção

1. Remover da lista `CATEGORIES_V21`
2. Remover de `METAS_V21`
3. Remover de `REALIZADOS_V21`
4. Remover de `CATEGORY_COLORS_V21`

**Exemplo:** Remover "Shelby"

```typescript
// ANTES
export const CATEGORIES_V21 = [
  'Lazer',
  'Shelby',        // ← Remover esta linha
  'Tonolher',
] as const;

// DEPOIS
export const CATEGORIES_V21 = [
  'Lazer',
  'Tonolher',
] as const;
```

Fazer o mesmo nas outras 3 constantes.

---

## 7️⃣ ALTERAR CORES DAS CATEGORIAS

**Localização:** Linhas 54-67

```typescript
export const CATEGORY_COLORS_V21: Record<CategoryV21, string> = {
  'Moradia': '#f59e0b',           // ← Altere a cor hexadecimal
  'Alimentação': '#10b981',
  'Saúde': '#ef4444',
  // ...
};
```

**Formato:**
- Cor em hexadecimal: `#RRGGBB`
- Sempre começar com `#`
- 6 caracteres após o `#`

---

## 🔄 APÓS ALTERAR OS MOCKS

### 1. Salvar o arquivo
```bash
Ctrl + S  (ou  Cmd + S no Mac)
```

### 2. Verificar no browser
A página deve recarregar automaticamente (hot reload)

### 3. Se não recarregar, force:
```bash
Ctrl + R  (ou  Cmd + R no Mac)
```

---

## 🚀 INTEGRAÇÃO COM NOTION (FUTURO)

Quando quiser conectar com o Notion, **não altere este arquivo**.

Em vez disso:

1. Crie novo arquivo: `src/services/finance-v21.service.ts`
2. Crie funções de fetch:
   ```typescript
   export async function fetchMetasFromNotion() { ... }
   export async function fetchRealizadosFromNotion() { ... }
   ```
3. No componente `OverviewPF_V21.tsx`:
   - Substitua imports de `METAS_V21` por `fetchMetasFromNotion()`
   - Adicione `useState` e `useEffect` para carregar dados
   - Adicione loading state (skeleton)

**Mantenha o arquivo de mock como fallback** caso o Notion esteja offline.

---

## 📍 RESUMO — ARQUIVO ÚNICO DE MOCKS

```
src/lib/finance-v2-data-v21.ts

- Linha 7-20:   CATEGORIES_V21 (ordem)
- Linha 20-35:  METAS_V21 (valores de meta)
- Linha 37-52:  REALIZADOS_V21 (valores realizados)
- Linha 54-67:  CATEGORY_COLORS_V21 (cores para gráfico)
- Linha 67-73:  BANK_ACCOUNTS_V21 (contas bancárias)
```

**Tudo centralizado em 1 arquivo → fácil de manter!**
