// Finance V2.1 PJ - Mock Data (ISOLADO - DADOS PESSOA JURÍDICA)
// Dados específicos para a visão PJ V2.1 do Finance

export const CATEGORIES_PJ_V21 = [
  'Contabilidade',
  'Parcelamento de impostos',
  'Moonville',
  'Google Ads',
  'VPS e Infra tec'
] as const;

export type CategoryPJ_V21 = typeof CATEGORIES_PJ_V21[number];

// Metas hardcoded (conforme especificado)
export const METAS_PJ_V21: Record<CategoryPJ_V21, number> = {
  'Contabilidade': 800.00,
  'Parcelamento de impostos': 1500.00,
  'Moonville': 3500.00,
  'Google Ads': 2500.00,
  'VPS e Infra tec': 300.00
};

// Valores realizados (conforme especificado)
export const REALIZADOS_PJ_V21: Record<CategoryPJ_V21, number> = {
  'Contabilidade': 700.00,
  'Parcelamento de impostos': 1200.00,
  'Moonville': 3000.00,
  'Google Ads': 2000.00,
  'VPS e Infra tec': 200.00
};

// Cores para o gráfico de pizza (consistente com o design)
export const CATEGORY_COLORS_PJ_V21: Record<CategoryPJ_V21, string> = {
  'Contabilidade': '#f59e0b',
  'Parcelamento de impostos': '#ef4444',
  'Moonville': '#8b5cf6',
  'Google Ads': '#10b981',
  'VPS e Infra tec': '#3b82f6'
};

// Contas bancárias PJ V2.1
export const BANK_ACCOUNTS_PJ_V21 = [
  { id: 'nubank-pj', name: 'Nubank PJ', type: 'Conta Corrente', balance: 18500.00 },
  { id: 'c6-pj', name: 'C6 PJ', type: 'Conta Corrente', balance: 12300.00 }
];

// Mock de dados anuais para o gráfico de fluxo (2026)
export const MOCK_ANNUAL_DATA_PJ = [
  { month: 'Jan', receitas: 15000, despesas: 8100 },
  { month: 'Fev', receitas: 18000, despesas: 9500 },
  { month: 'Mar', receitas: 20000, despesas: 10000 },
  { month: 'Abr', receitas: 17000, despesas: 8800 },
  { month: 'Mai', receitas: 19000, despesas: 9200 },
  { month: 'Jun', receitas: 21000, despesas: 10500 },
  { month: 'Jul', receitas: 22000, despesas: 11000 },
  { month: 'Ago', receitas: 20000, despesas: 10200 },
  { month: 'Set', receitas: 23000, despesas: 11500 },
  { month: 'Out', receitas: 24000, despesas: 12000 },
  { month: 'Nov', receitas: 0, despesas: 0 },
  { month: 'Dez', receitas: 0, despesas: 0 }
];

// Helper para calcular percentual (com clamp visual em 100%)
export function calculatePercentagePJ(realizado: number, meta: number): number {
  if (meta === 0) return 0;
  return (realizado / meta) * 100;
}

// Helper para calcular percentual visual (clamped em 100%)
export function calculateProgressVisualPJ(realizado: number, meta: number): number {
  return Math.min(calculatePercentagePJ(realizado, meta), 100);
}

// Formatar moeda BRL
export function formatCurrencyPJ_V21(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Obter dados para o gráfico de pizza (meta ou realizado)
export function getPieChartDataPJ(mode: 'meta' | 'realizado'): Array<{ name: string; value: number; fill: string }> {
  const data = mode === 'meta' ? METAS_PJ_V21 : REALIZADOS_PJ_V21;
  
  return CATEGORIES_PJ_V21.map(category => ({
    name: category,
    value: data[category],
    fill: CATEGORY_COLORS_PJ_V21[category]
  }));
}

// Calcular total (meta ou realizado)
export function calculateTotalPJ(mode: 'meta' | 'realizado'): number {
  const data = mode === 'meta' ? METAS_PJ_V21 : REALIZADOS_PJ_V21;
  return Object.values(data).reduce((sum, value) => sum + value, 0);
}

// Calcular percentual de cada categoria em relação ao total
export function getCategoryPercentagePJ(category: CategoryPJ_V21, mode: 'meta' | 'realizado'): number {
  const total = calculateTotalPJ(mode);
  const data = mode === 'meta' ? METAS_PJ_V21 : REALIZADOS_PJ_V21;
  const value = data[category];
  
  return total > 0 ? (value / total) * 100 : 0;
}
