import { createContext, useContext, ReactNode } from 'react';

// STUB: AuthContext preservado apenas para compatibilidade com código legado
// VendeMaisObras foi removido do projeto (backup em /Users/fabricio/Documents/Backups/outros-projetos-2026-02-07/)

interface AuthContextType {
  user: null;
  token: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkTrialStatus: () => { isTrial: boolean; daysLeft: number | null; isExpired: boolean };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => { throw new Error('VendeMaisObras não está mais disponível neste projeto'); },
    register: async () => { throw new Error('VendeMaisObras não está mais disponível neste projeto'); },
    logout: () => { console.warn('AuthContext stub - sem ação'); },
    refreshToken: async () => { throw new Error('VendeMaisObras não está mais disponível neste projeto'); },
    checkTrialStatus: () => ({ isTrial: false, daysLeft: null, isExpired: false }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
