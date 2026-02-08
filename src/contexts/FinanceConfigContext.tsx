import { createContext, useContext, useState, ReactNode } from 'react';
import {
  ACCOUNT_PLANS as INITIAL_ACCOUNT_PLANS,
  COST_CENTERS as INITIAL_COST_CENTERS,
  BANK_ACCOUNTS as INITIAL_BANK_ACCOUNTS,
  type AccountPlan,
  type CostCenter,
  type BankAccount,
  type EntityType
} from '@/lib/finance-v2-data';

interface FinanceConfigContextType {
  accountPlans: AccountPlan[];
  costCenters: CostCenter[];
  bankAccounts: BankAccount[];
  
  // Plano de Contas
  addAccountPlan: (plan: Omit<AccountPlan, 'id'>) => void;
  removeAccountPlan: (id: string) => void;
  
  // Centros de Custo
  addCostCenter: (center: Omit<CostCenter, 'id'>) => void;
  removeCostCenter: (id: string) => void;
  
  // Contas Bancárias
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  removeBankAccount: (id: string) => void;
}

const FinanceConfigContext = createContext<FinanceConfigContextType | undefined>(undefined);

export function FinanceConfigProvider({ children }: { children: ReactNode }) {
  const [accountPlans, setAccountPlans] = useState<AccountPlan[]>(INITIAL_ACCOUNT_PLANS);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);

  // Funções CRUD para Plano de Contas
  const addAccountPlan = (plan: Omit<AccountPlan, 'id'>) => {
    const newPlan: AccountPlan = {
      ...plan,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setAccountPlans(prev => [...prev, newPlan]);
  };

  const removeAccountPlan = (id: string) => {
    setAccountPlans(prev => prev.filter(p => p.id !== id));
  };

  // Funções CRUD para Centros de Custo
  const addCostCenter = (center: Omit<CostCenter, 'id'>) => {
    const newCenter: CostCenter = {
      ...center,
      id: `custom-cc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setCostCenters(prev => [...prev, newCenter]);
  };

  const removeCostCenter = (id: string) => {
    setCostCenters(prev => prev.filter(c => c.id !== id));
  };

  // Funções CRUD para Contas Bancárias
  const addBankAccount = (account: Omit<BankAccount, 'id'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: `custom-bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setBankAccounts(prev => [...prev, newAccount]);
  };

  const removeBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <FinanceConfigContext.Provider
      value={{
        accountPlans,
        costCenters,
        bankAccounts,
        addAccountPlan,
        removeAccountPlan,
        addCostCenter,
        removeCostCenter,
        addBankAccount,
        removeBankAccount
      }}
    >
      {children}
    </FinanceConfigContext.Provider>
  );
}

export function useFinanceConfig() {
  const context = useContext(FinanceConfigContext);
  if (!context) {
    throw new Error('useFinanceConfig must be used within FinanceConfigProvider');
  }
  return context;
}
