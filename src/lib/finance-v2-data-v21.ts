// Finance V2.1 - Mock Data (ISOLADO - NÃO ALTERA VERSÃO ORIGINAL)
// Dados específicos para a versão V2.1 do Finance Flora

export const CATEGORIES_V21 = [
  'Moradia',
  'Alimentação',
  'Saúde',
  'Lazer',
  'Shelby',
  'Tonolher',
  'Transporte',
  'Investimentos',
  'Compras Fabricio',
  'Compra Flora',
  'Dizimo',
  'Meta Cruzeiro'
] as const;

export type CategoryV21 = typeof CATEGORIES_V21[number];

// Metas hardcoded (conforme especificado)
export const METAS_V21: Record<CategoryV21, number> = {
  'Moradia': 5000.00,
  'Alimentação': 2000.00,
  'Saúde': 1100.00,
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

// Valores realizados (mock plausível)
export const REALIZADOS_V21: Record<CategoryV21, number> = {
  'Moradia': 4850.00,        // 97% da meta
  'Alimentação': 1420.00,    // 71% da meta
  'Saúde': 1250.00,          // 113.6% da meta (acima de 100%)
  'Lazer': 780.00,           // 78% da meta
  'Shelby': 0,               // 0%
  'Tonolher': 3200.00,       // 80% da meta
  'Transporte': 650.00,      // 65% da meta
  'Investimentos': 2000.00,  // 100% da meta
  'Compras Fabricio': 320.00, // 64% da meta
  'Compra Flora': 450.00,    // 90% da meta
  'Dizimo': 1700.00,         // 100% da meta (exatamente na meta)
  'Meta Cruzeiro': 1125.00   // 75% da meta
};

// Cores para o gráfico de pizza (consistente com o design)
export const CATEGORY_COLORS_V21: Record<CategoryV21, string> = {
  'Moradia': '#f59e0b',
  'Alimentação': '#10b981',
  'Saúde': '#ef4444',
  'Lazer': '#8b5cf6',
  'Shelby': '#06b6d4',
  'Tonolher': '#ec4899',
  'Transporte': '#f97316',
  'Investimentos': '#3b82f6',
  'Compras Fabricio': '#14b8a6',
  'Compra Flora': '#a855f7',
  'Dizimo': '#84cc16',
  'Meta Cruzeiro': '#6366f1'
};

// Contas bancárias V2.1 (conforme especificado)
export const BANK_ACCOUNTS_V21 = [
  { id: 'nubank-pf-fabricio', name: 'Nubank PF Fabricio', type: 'Conta Corrente', balance: 5420.50 },
  { id: 'nubank-pf-flora', name: 'Nubank PF Flora', type: 'Conta Corrente', balance: 3250.00 },
  { id: 'inter-pf-flora', name: 'Inter PF Flora', type: 'Conta Corrente', balance: 1890.00 },
  { id: 'nubank-pj', name: 'Nubank PJ', type: 'Conta Corrente', balance: 18500.00 },
  { id: 'c6-pj', name: 'C6 PJ', type: 'Conta Corrente', balance: 12300.00 }
];

// Helper para calcular percentual (com clamp visual em 100%)
export function calculatePercentage(realizado: number, meta: number): number {
  if (meta === 0) return 0;
  return (realizado / meta) * 100;
}

// Helper para calcular percentual visual (clamped em 100%)
export function calculateProgressVisual(realizado: number, meta: number): number {
  return Math.min(calculatePercentage(realizado, meta), 100);
}

// Formatar moeda BRL
export function formatCurrencyV21(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Obter dados para o gráfico de pizza (meta ou realizado)
export function getPieChartData(mode: 'meta' | 'realizado'): Array<{ name: string; value: number; fill: string }> {
  const data = mode === 'meta' ? METAS_V21 : REALIZADOS_V21;
  
  return CATEGORIES_V21.map(category => ({
    name: category,
    value: data[category],
    fill: CATEGORY_COLORS_V21[category]
  }));
}

// Calcular total (meta ou realizado)
export function calculateTotal(mode: 'meta' | 'realizado'): number {
  const data = mode === 'meta' ? METAS_V21 : REALIZADOS_V21;
  return Object.values(data).reduce((sum, value) => sum + value, 0);
}

// Calcular percentual de cada categoria em relação ao total
export function getCategoryPercentage(category: CategoryV21, mode: 'meta' | 'realizado'): number {
  const total = calculateTotal(mode);
  const data = mode === 'meta' ? METAS_V21 : REALIZADOS_V21;
  const value = data[category];
  
  return total > 0 ? (value / total) * 100 : 0;
}
