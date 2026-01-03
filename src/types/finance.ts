// FR Tech OS - Finance Types

export interface BudgetGoal {
  id: string;
  Name: string;
  Category: string;
  Month: number;
  Year: number;
  BudgetAmount: number;
  SpentAmount: number;
  PeriodStart: string;
  PeriodEnd: string;
  Status: 'Em andamento' | 'Atingido' | 'Excedido' | 'Não iniciado';
  Notes?: string;
}

export interface Transaction {
  id: string;
  Name: string;
  Date: string;
  Amount: number;
  Type: 'Entrada' | 'Saída';
  Category?: string;
  Account: string;
  Description?: string;
  BudgetGoal?: string;
  Imported: boolean;
  ImportedAt?: string;
  FileSource?: string;
  Reconciled?: boolean;
  ReconciledAt?: string;
  Recurring?: boolean;
  RecurringRule?: string;
}

export interface FinanceSummary {
  totalBudgeted: number;
  totalSpent: number;
  availableBalance: number;
  utilizationPercentage: number;
  categoryBreakdown: {
    category: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }[];
  topCategories: {
    category: string;
    spent: number;
    percentage: number;
  }[];
}

export interface ImportPreview {
  transactions: Omit<Transaction, 'id' | 'Imported' | 'ImportedAt' | 'FileSource'>[];
  totalCount: number;
  totalAmount: number;
  duplicates: number;
}

export interface CategorizationRule {
  id: string;
  Name: string;
  Pattern: string;
  Category: string;
  Priority: number;
  Active: boolean;
  AccountType: 'Empresarial' | 'Pessoal' | 'Ambos';
}

