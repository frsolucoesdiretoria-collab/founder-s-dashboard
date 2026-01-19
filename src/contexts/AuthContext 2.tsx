import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { 
  VendeMaisObrasUsuario, 
  CreateUsuarioInput,
  LoginInput 
} from '@/types/vendeMaisObras';
import { 
  login as loginService, 
  register as registerService,
  getMe,
  logout as logoutService,
  refreshToken as refreshTokenService
} from '@/services/vendeMaisObras.service';

interface AuthContextType {
  user: VendeMaisObrasUsuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: CreateUsuarioInput) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkTrialStatus: () => { isTrial: boolean; daysLeft: number | null; isExpired: boolean };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'vende_mais_obras_token';
const USER_KEY = 'vende_mais_obras_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VendeMaisObrasUsuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar token e usuário do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verificar se o token ainda é válido
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error loading auth data:', error);
        clearAuth();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const userData = await getMe();
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setIsLoading(false);
    } catch (error: any) {
      console.error('Token verification failed:', error);
      // Token inválido ou expirado
      if (error?.message?.includes('401') || error?.message?.includes('expired')) {
        clearAuth();
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        setIsLoading(false);
      }
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginService({ Email: email, Password: password });
      // Backend retorna 'usuario', não 'user'
      const newToken = response.token;
      const userData = (response as any).usuario || response.user;
      
      if (!newToken || !userData) {
        throw new Error('Resposta inválida do servidor');
      }
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      toast.success('Login realizado com sucesso!');
      navigate('/vende-mais-obras');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: CreateUsuarioInput) => {
    try {
      const response = await registerService(data);
      // Backend retorna 'usuario', não 'user'
      const newToken = response.token;
      const userData = (response as any).usuario || response.user;
      
      if (!newToken || !userData) {
        throw new Error('Resposta inválida do servidor');
      }
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      toast.success('Cadastro realizado com sucesso!');
      navigate('/vende-mais-obras');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer cadastro';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    logoutService().catch(console.error);
    toast.success('Logout realizado com sucesso');
    navigate('/vende-mais-obras/login');
  };

  const refreshToken = async () => {
    try {
      const response = await refreshTokenService();
      const { token: newToken } = response;
      
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      clearAuth();
      navigate('/vende-mais-obras/login');
      throw error;
    }
  };

  const checkTrialStatus = () => {
    if (!user) {
      return { isTrial: false, daysLeft: null, isExpired: false };
    }

    const status = user.Status || 'Trial';
    const isTrial = status === 'Trial';
    
    if (!isTrial || !user.TrialFim) {
      return { isTrial: false, daysLeft: null, isExpired: false };
    }

    const trialEnd = new Date(user.TrialFim);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isExpired = diffDays < 0;
    const daysLeft = isExpired ? 0 : diffDays;

    return { isTrial, daysLeft, isExpired };
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    checkTrialStatus,
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

