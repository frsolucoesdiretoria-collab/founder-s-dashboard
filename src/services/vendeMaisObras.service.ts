import type { 
  VendeMaisObrasLead, 
  VendeMaisObrasUsuario, 
  VendeMaisObrasOrcamento,
  VendeMaisObrasMetricas,
  Servico,
  Cliente,
  CreateUsuarioInput,
  LoginInput,
  CreateOrcamentoInput,
  UpdateOrcamentoInput,
  CreateClienteInput,
  UpdateClienteInput
} from '@/types/vendeMaisObras';

// Usar URL relativa para usar o proxy do Vite em desenvolvimento
// Em produção, usar URL relativa também (mesmo servidor)
const API_PATH = '/api/vende-mais-obras';
const FULL_API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}${API_PATH}` 
  : API_PATH;

const TOKEN_KEY = 'vende_mais_obras_token';

// Helper para obter token do localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Helper para salvar token no localStorage
function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Helper para remover token
function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Helper para headers com autenticação (mantido para compatibilidade)
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper para headers admin
function withPasscodeHeaders(passcode: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-passcode': passcode,
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message || data?.error || `Erro ${response.status}: ${response.statusText}`;
  } catch {
    return `Erro ${response.status}: ${response.statusText}`;
  }
}

// Helper para fazer requisições com tratamento de erro 401
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as HeadersInit,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se receber 401, tentar refresh token e retry
  if (response.status === 401 && token) {
    try {
      const refreshResponse = await refreshToken();
      if (refreshResponse.token) {
        // Retry a requisição original com novo token
        headers['Authorization'] = `Bearer ${refreshResponse.token}`;
        return fetch(url, {
          ...options,
          headers,
        });
      }
    } catch (error) {
      // Se refresh falhar, limpar token e redirecionar
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/vende-mais-obras/login';
      }
    }
  }

  return response;
}

// ==========================================
// HEALTH CHECK
// ==========================================

export async function vendeMaisObrasHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${FULL_API_BASE}/health`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ==========================================
// AUTHENTICATION
// ==========================================

export interface LoginResponse {
  usuario: VendeMaisObrasUsuario;
  token: string;
}

export interface RegisterResponse {
  usuario: VendeMaisObrasUsuario;
  token: string;
}

export interface RefreshTokenResponse {
  token: string;
}

// Funções de autenticação (públicas)
export async function register(input: CreateUsuarioInput): Promise<RegisterResponse> {
  try {
    const res = await fetch(`${FULL_API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nome: input.Nome,
        Email: input.Email,
        Telefone: input.Telefone,
        Password: input.Password
      })
    });
    
    if (!res.ok) {
      const errorMessage = await parseError(res);
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    // Não salvar token aqui, o AuthContext faz isso
    return data;
  } catch (error: any) {
    // Se for erro de rede, dar mensagem mais clara
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  try {
    const res = await fetch(`${FULL_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Email: input.Email,
        Password: input.Password
      })
    });
    
    if (!res.ok) {
      const errorMessage = await parseError(res);
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    // Não salvar token aqui, o AuthContext faz isso
    return data;
  } catch (error: any) {
    // Se for erro de rede, dar mensagem mais clara
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const res = await fetch(`${FULL_API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${FULL_API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    removeToken();
  }
}

// Funções autenticadas
export async function getMe(): Promise<VendeMaisObrasUsuario> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/auth/me`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateProfile(updates: Partial<VendeMaisObrasUsuario & { Password?: string }>): Promise<VendeMaisObrasUsuario> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/auth/profile`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// Aliases para compatibilidade
export const registerUsuario = register;
export const loginUsuario = login;
export const logoutUsuario = logout;
export const getCurrentUsuario = getMe;

// ==========================================
// SERVIÇOS (público)
// ==========================================

export async function getServicos(categoria?: string, ativo?: boolean): Promise<Servico[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (ativo !== undefined) params.append('ativo', String(ativo));
  
  const query = params.toString();
  const url = `${FULL_API_BASE}/servicos${query ? `?${query}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getServicoById(id: string): Promise<Servico> {
  const res = await fetch(`${FULL_API_BASE}/servicos/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ==========================================
// ORÇAMENTOS (autenticado)
// ==========================================

export async function getOrcamentos(): Promise<VendeMaisObrasOrcamento[]> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getOrcamentoById(id: string): Promise<VendeMaisObrasOrcamento> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createOrcamento(input: CreateOrcamentoInput): Promise<VendeMaisObrasOrcamento> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateOrcamento(id: string, input: UpdateOrcamentoInput): Promise<VendeMaisObrasOrcamento> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteOrcamento(id: string): Promise<void> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
}

// ==========================================
// CLIENTES (autenticado)
// ==========================================

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getClienteById(id: string): Promise<Cliente> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateCliente(id: string, input: UpdateClienteInput): Promise<Cliente> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteCliente(id: string): Promise<void> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
}

export async function fixClientesUsuarioRelation(): Promise<{ atualizados: number; erros: number; message: string }> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/fix-usuario-relation`, {
    method: 'POST'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ==========================================
// ADMIN ROUTES (requerem passcode)
// ==========================================

// Admin routes (requerem passcode - mantidas para compatibilidade com página admin)
export async function getVendeMaisObrasLeads(passcode: string): Promise<VendeMaisObrasLead[]> {
  const res = await fetch(`${FULL_API_BASE}/admin/leads`, {
    headers: withPasscodeHeaders(passcode),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getVendeMaisObrasUsuarios(passcode: string): Promise<VendeMaisObrasUsuario[]> {
  const res = await fetch(`${FULL_API_BASE}/admin/usuarios`, {
    headers: withPasscodeHeaders(passcode),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getVendeMaisObrasMetricas(passcode: string): Promise<VendeMaisObrasMetricas> {
  const res = await fetch(`${FULL_API_BASE}/admin/metricas`, {
    headers: withPasscodeHeaders(passcode),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// Legacy routes (mantidas para compatibilidade)
export async function getVendeMaisObrasOrcamentos(passcode: string): Promise<VendeMaisObrasOrcamento[]> {
  const res = await fetch(`${FULL_API_BASE}/admin/orcamentos`, {
    headers: withPasscodeHeaders(passcode),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function vendeMaisObrasSetup(passcode: string): Promise<any> {
  const res = await fetch(`${FULL_API_BASE}/setup`, {
    method: 'POST',
    headers: withPasscodeHeaders(passcode),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
