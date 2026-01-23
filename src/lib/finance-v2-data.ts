// Finance V2 - Mock Data Structure
// Sistema completo de controle financeiro PF + PJ

export type TransactionType = 'Entrada' | 'Saída';
export type EntityType = 'PF' | 'PJ';
export type TransactionStatus = 'Pendente' | 'Confirmada' | 'Conciliada';

// ========================================
// PLANO DE CONTAS
// ========================================

export interface AccountPlan {
  id: string;
  name: string;
  type: 'Receita' | 'Despesa';
  category: 'Essencial' | 'Variável' | 'Investimento' | 'Dívida' | 'Receita';
  entity: EntityType[];
  color: string;
}

export const ACCOUNT_PLANS: AccountPlan[] = [
  // RECEITAS PF
  { id: 'rec-pf-salario', name: 'Salário', type: 'Receita', category: 'Receita', entity: ['PF'], color: '#10b981' },
  { id: 'rec-pf-freelance', name: 'Freelance', type: 'Receita', category: 'Receita', entity: ['PF'], color: '#10b981' },
  { id: 'rec-pf-investimentos', name: 'Rendimentos de Investimentos', type: 'Receita', category: 'Receita', entity: ['PF'], color: '#10b981' },
  { id: 'rec-pf-outros', name: 'Outras Receitas PF', type: 'Receita', category: 'Receita', entity: ['PF'], color: '#10b981' },
  
  // RECEITAS PJ
  { id: 'rec-pj-servicos', name: 'Receita de Serviços', type: 'Receita', category: 'Receita', entity: ['PJ'], color: '#059669' },
  { id: 'rec-pj-produtos', name: 'Receita de Produtos', type: 'Receita', category: 'Receita', entity: ['PJ'], color: '#059669' },
  { id: 'rec-pj-consultoria', name: 'Consultoria', type: 'Receita', category: 'Receita', entity: ['PJ'], color: '#059669' },
  
  // DESPESAS PF - ESSENCIAIS
  { id: 'desp-pf-moradia', name: 'Moradia (Aluguel/Financiamento)', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-condominio', name: 'Condomínio', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-energia', name: 'Energia Elétrica', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-agua', name: 'Água', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-internet', name: 'Internet', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-telefone', name: 'Telefone', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-alimentacao', name: 'Alimentação', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-transporte', name: 'Transporte', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-saude', name: 'Saúde', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  { id: 'desp-pf-educacao', name: 'Educação', type: 'Despesa', category: 'Essencial', entity: ['PF'], color: '#f59e0b' },
  
  // DESPESAS PF - VARIÁVEIS
  { id: 'desp-pf-lazer', name: 'Lazer', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  { id: 'desp-pf-vestuario', name: 'Vestuário', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  { id: 'desp-pf-beleza', name: 'Beleza', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  { id: 'desp-pf-presentes', name: 'Presentes', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  { id: 'desp-pf-assinaturas', name: 'Assinaturas', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  { id: 'desp-pf-outros', name: 'Outras Despesas PF', type: 'Despesa', category: 'Variável', entity: ['PF'], color: '#8b5cf6' },
  
  // DESPESAS PF - INVESTIMENTOS
  { id: 'inv-pf-poupanca', name: 'Poupança', type: 'Despesa', category: 'Investimento', entity: ['PF'], color: '#3b82f6' },
  { id: 'inv-pf-investimentos', name: 'Investimentos', type: 'Despesa', category: 'Investimento', entity: ['PF'], color: '#3b82f6' },
  { id: 'inv-pf-previdencia', name: 'Previdência Privada', type: 'Despesa', category: 'Investimento', entity: ['PF'], color: '#3b82f6' },
  
  // DESPESAS PF - DÍVIDAS
  { id: 'div-pf-cartao', name: 'Cartão de Crédito', type: 'Despesa', category: 'Dívida', entity: ['PF'], color: '#ef4444' },
  { id: 'div-pf-emprestimo', name: 'Empréstimo', type: 'Despesa', category: 'Dívida', entity: ['PF'], color: '#ef4444' },
  { id: 'div-pf-financiamento', name: 'Financiamento', type: 'Despesa', category: 'Dívida', entity: ['PF'], color: '#ef4444' },
  
  // DESPESAS PJ - ESSENCIAIS
  { id: 'desp-pj-salarios', name: 'Salários e Encargos', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  { id: 'desp-pj-prolabore', name: 'Pró-Labore', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  { id: 'desp-pj-aluguel', name: 'Aluguel Comercial', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  { id: 'desp-pj-contador', name: 'Contador', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  { id: 'desp-pj-impostos', name: 'Impostos', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  { id: 'desp-pj-software', name: 'Software e Ferramentas', type: 'Despesa', category: 'Essencial', entity: ['PJ'], color: '#d97706' },
  
  // DESPESAS PJ - VARIÁVEIS
  { id: 'desp-pj-marketing', name: 'Marketing', type: 'Despesa', category: 'Variável', entity: ['PJ'], color: '#7c3aed' },
  { id: 'desp-pj-fornecedores', name: 'Fornecedores', type: 'Despesa', category: 'Variável', entity: ['PJ'], color: '#7c3aed' },
  { id: 'desp-pj-viagens', name: 'Viagens e Deslocamentos', type: 'Despesa', category: 'Variável', entity: ['PJ'], color: '#7c3aed' },
  { id: 'desp-pj-capacitacao', name: 'Capacitação', type: 'Despesa', category: 'Variável', entity: ['PJ'], color: '#7c3aed' },
  { id: 'desp-pj-outros', name: 'Outras Despesas PJ', type: 'Despesa', category: 'Variável', entity: ['PJ'], color: '#7c3aed' },
];

// ========================================
// CENTROS DE CUSTO
// ========================================

export interface CostCenter {
  id: string;
  name: string;
  entity: EntityType[];
  description: string;
}

export const COST_CENTERS: CostCenter[] = [
  // PF
  { id: 'cc-pf-pessoal', name: 'Pessoal', entity: ['PF'], description: 'Despesas pessoais gerais' },
  { id: 'cc-pf-familia', name: 'Família', entity: ['PF'], description: 'Despesas relacionadas à família' },
  { id: 'cc-pf-casa', name: 'Casa', entity: ['PF'], description: 'Manutenção e despesas da casa' },
  { id: 'cc-pf-veiculo', name: 'Veículo', entity: ['PF'], description: 'Despesas com veículo' },
  
  // PJ
  { id: 'cc-pj-operacional', name: 'Operacional', entity: ['PJ'], description: 'Operação da empresa' },
  { id: 'cc-pj-comercial', name: 'Comercial', entity: ['PJ'], description: 'Atividades comerciais' },
  { id: 'cc-pj-administrativo', name: 'Administrativo', entity: ['PJ'], description: 'Administração da empresa' },
  { id: 'cc-pj-projeto-a', name: 'Projeto A', entity: ['PJ'], description: 'Projeto específico A' },
  { id: 'cc-pj-projeto-b', name: 'Projeto B', entity: ['PJ'], description: 'Projeto específico B' },
];

// ========================================
// CONTAS BANCÁRIAS
// ========================================

export interface BankAccount {
  id: string;
  name: string;
  entity: EntityType;
  type: 'Conta Corrente' | 'Poupança' | 'Investimento';
  balance: number;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  { id: 'bank-pf-nubank', name: 'Nubank PF', entity: 'PF', type: 'Conta Corrente', balance: 5420.50 },
  { id: 'bank-pf-itau', name: 'Itaú PF', entity: 'PF', type: 'Conta Corrente', balance: 2150.00 },
  { id: 'bank-pf-caixa', name: 'Caixa Poupança', entity: 'PF', type: 'Poupança', balance: 12000.00 },
  { id: 'bank-pj-inter', name: 'Banco Inter PJ', entity: 'PJ', type: 'Conta Corrente', balance: 18500.00 },
  { id: 'bank-pj-btg', name: 'BTG Empresarial', entity: 'PJ', type: 'Conta Corrente', balance: 45200.00 },
];

// ========================================
// TRANSAÇÕES
// ========================================

export interface Transaction {
  id: string;
  date: string;
  entity: EntityType;
  type: TransactionType;
  accountPlanId: string;
  costCenterId: string;
  bankAccountId: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  imported: boolean;
}

// Gerar transações mock para os últimos 3 meses
export const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions();

function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  // Janeiro 2026
  transactions.push(
    // PF - Receitas
    { id: 't-1', date: '2026-01-05', entity: 'PF', type: 'Entrada', accountPlanId: 'rec-pf-salario', costCenterId: 'cc-pf-pessoal', bankAccountId: 'bank-pf-nubank', amount: 8500.00, description: 'Salário Janeiro', status: 'Confirmada', imported: false },
    { id: 't-2', date: '2026-01-15', entity: 'PF', type: 'Entrada', accountPlanId: 'rec-pf-freelance', costCenterId: 'cc-pf-pessoal', bankAccountId: 'bank-pf-nubank', amount: 2500.00, description: 'Projeto Freelance', status: 'Confirmada', imported: false },
    
    // PF - Despesas Essenciais
    { id: 't-3', date: '2026-01-10', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-moradia', costCenterId: 'cc-pf-casa', bankAccountId: 'bank-pf-nubank', amount: 2200.00, description: 'Aluguel Janeiro', status: 'Confirmada', imported: false },
    { id: 't-4', date: '2026-01-12', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-condominio', costCenterId: 'cc-pf-casa', bankAccountId: 'bank-pf-nubank', amount: 450.00, description: 'Condomínio Janeiro', status: 'Confirmada', imported: false },
    { id: 't-5', date: '2026-01-08', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-energia', costCenterId: 'cc-pf-casa', bankAccountId: 'bank-pf-nubank', amount: 185.50, description: 'Conta de Luz', status: 'Confirmada', imported: false },
    { id: 't-6', date: '2026-01-08', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-agua', costCenterId: 'cc-pf-casa', bankAccountId: 'bank-pf-nubank', amount: 95.00, description: 'Conta de Água', status: 'Confirmada', imported: false },
    { id: 't-7', date: '2026-01-01', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-internet', costCenterId: 'cc-pf-casa', bankAccountId: 'bank-pf-nubank', amount: 129.90, description: 'Internet Fibra', status: 'Confirmada', imported: false },
    { id: 't-8', date: '2026-01-15', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-alimentacao', costCenterId: 'cc-pf-pessoal', bankAccountId: 'bank-pf-nubank', amount: 1200.00, description: 'Mercado - Quinzena', status: 'Confirmada', imported: false },
    
    // PF - Despesas Variáveis
    { id: 't-9', date: '2026-01-18', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-lazer', costCenterId: 'cc-pf-pessoal', bankAccountId: 'bank-pf-nubank', amount: 350.00, description: 'Cinema e Jantar', status: 'Confirmada', imported: false },
    { id: 't-10', date: '2026-01-20', entity: 'PF', type: 'Saída', accountPlanId: 'desp-pf-assinaturas', costCenterId: 'cc-pf-pessoal', bankAccountId: 'bank-pf-nubank', amount: 89.90, description: 'Netflix + Spotify', status: 'Confirmada', imported: false },
    
    // PJ - Receitas
    { id: 't-11', date: '2026-01-10', entity: 'PJ', type: 'Entrada', accountPlanId: 'rec-pj-servicos', costCenterId: 'cc-pj-comercial', bankAccountId: 'bank-pj-inter', amount: 15000.00, description: 'Projeto Cliente A', status: 'Confirmada', imported: false },
    { id: 't-12', date: '2026-01-20', entity: 'PJ', type: 'Entrada', accountPlanId: 'rec-pj-consultoria', costCenterId: 'cc-pj-comercial', bankAccountId: 'bank-pj-inter', amount: 8000.00, description: 'Consultoria Mensal', status: 'Confirmada', imported: false },
    
    // PJ - Despesas
    { id: 't-13', date: '2026-01-05', entity: 'PJ', type: 'Saída', accountPlanId: 'desp-pj-prolabore', costCenterId: 'cc-pj-administrativo', bankAccountId: 'bank-pj-inter', amount: 5000.00, description: 'Pró-Labore Janeiro', status: 'Confirmada', imported: false },
    { id: 't-14', date: '2026-01-10', entity: 'PJ', type: 'Saída', accountPlanId: 'desp-pj-contador', costCenterId: 'cc-pj-administrativo', bankAccountId: 'bank-pj-inter', amount: 800.00, description: 'Honorários Contábeis', status: 'Confirmada', imported: false },
    { id: 't-15', date: '2026-01-15', entity: 'PJ', type: 'Saída', accountPlanId: 'desp-pj-software', costCenterId: 'cc-pj-operacional', bankAccountId: 'bank-pj-inter', amount: 450.00, description: 'Assinaturas SaaS', status: 'Confirmada', imported: false },
    { id: 't-16', date: '2026-01-18', entity: 'PJ', type: 'Saída', accountPlanId: 'desp-pj-marketing', costCenterId: 'cc-pj-comercial', bankAccountId: 'bank-pj-inter', amount: 2500.00, description: 'Anúncios Google Ads', status: 'Confirmada', imported: false },
  );
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ========================================
// ORÇAMENTOS MENSAIS
// ========================================

export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM
  entity: EntityType;
  accountPlanId: string;
  budgetAmount: number;
  spentAmount: number;
  notes?: string;
}

export const MONTHLY_BUDGETS: MonthlyBudget[] = [
  // PF - Janeiro 2026
  { id: 'b-1', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-moradia', budgetAmount: 2200.00, spentAmount: 2200.00 },
  { id: 'b-2', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-condominio', budgetAmount: 450.00, spentAmount: 450.00 },
  { id: 'b-3', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-energia', budgetAmount: 200.00, spentAmount: 185.50 },
  { id: 'b-4', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-agua', budgetAmount: 100.00, spentAmount: 95.00 },
  { id: 'b-5', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-internet', budgetAmount: 130.00, spentAmount: 129.90 },
  { id: 'b-6', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-alimentacao', budgetAmount: 2000.00, spentAmount: 1200.00 },
  { id: 'b-7', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-transporte', budgetAmount: 500.00, spentAmount: 0.00 },
  { id: 'b-8', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-lazer', budgetAmount: 600.00, spentAmount: 350.00 },
  { id: 'b-9', month: '2026-01', entity: 'PF', accountPlanId: 'desp-pf-assinaturas', budgetAmount: 90.00, spentAmount: 89.90 },
  { id: 'b-10', month: '2026-01', entity: 'PF', accountPlanId: 'inv-pf-investimentos', budgetAmount: 1500.00, spentAmount: 0.00 },
  
  // PJ - Janeiro 2026
  { id: 'b-11', month: '2026-01', entity: 'PJ', accountPlanId: 'desp-pj-prolabore', budgetAmount: 5000.00, spentAmount: 5000.00 },
  { id: 'b-12', month: '2026-01', entity: 'PJ', accountPlanId: 'desp-pj-contador', budgetAmount: 800.00, spentAmount: 800.00 },
  { id: 'b-13', month: '2026-01', entity: 'PJ', accountPlanId: 'desp-pj-software', budgetAmount: 500.00, spentAmount: 450.00 },
  { id: 'b-14', month: '2026-01', entity: 'PJ', accountPlanId: 'desp-pj-marketing', budgetAmount: 3000.00, spentAmount: 2500.00 },
  { id: 'b-15', month: '2026-01', entity: 'PJ', accountPlanId: 'desp-pj-fornecedores', budgetAmount: 5000.00, spentAmount: 0.00 },
];

// ========================================
// HELPERS
// ========================================

export function getAccountPlanById(id: string): AccountPlan | undefined {
  return ACCOUNT_PLANS.find(ap => ap.id === id);
}

export function getCostCenterById(id: string): CostCenter | undefined {
  return COST_CENTERS.find(cc => cc.id === id);
}

export function getBankAccountById(id: string): BankAccount | undefined {
  return BANK_ACCOUNTS.find(ba => ba.id === id);
}

export function getAccountPlansByEntity(entity: EntityType, type?: 'Receita' | 'Despesa'): AccountPlan[] {
  return ACCOUNT_PLANS.filter(ap => 
    ap.entity.includes(entity) && (!type || ap.type === type)
  );
}

export function getCostCentersByEntity(entity: EntityType): CostCenter[] {
  return COST_CENTERS.filter(cc => cc.entity.includes(entity));
}

export function getBankAccountsByEntity(entity: EntityType): BankAccount[] {
  return BANK_ACCOUNTS.filter(ba => ba.entity === entity);
}

export function getTransactionsByEntity(entity: EntityType, month?: string): Transaction[] {
  return MOCK_TRANSACTIONS.filter(t => {
    const matchEntity = t.entity === entity;
    if (!month) return matchEntity;
    const transactionMonth = t.date.substring(0, 7);
    return matchEntity && transactionMonth === month;
  });
}

export function getBudgetsByEntity(entity: EntityType, month: string): MonthlyBudget[] {
  return MONTHLY_BUDGETS.filter(b => b.entity === entity && b.month === month);
}

export function calculateMonthlyTotals(entity: EntityType, month: string) {
  const transactions = getTransactionsByEntity(entity, month);
  
  const income = transactions
    .filter(t => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  const budgets = getBudgetsByEntity(entity, month);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  
  return {
    income,
    expenses,
    balance,
    totalBudget,
    totalSpent,
    budgetPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  };
}
