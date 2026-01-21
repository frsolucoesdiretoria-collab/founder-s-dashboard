// DOMA CONDO - Client Service
import type {
  DomaCondoClient,
  DomaCondoClientAuth,
  DomaCondoClientToken,
  RelatorioMensal,
} from '@/types/domaCondoClient';

const API_BASE = '/api/doma-condo-clientes';

// Helper para fazer requisições autenticadas
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('doma_condo_client_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Autenticação
export async function loginClient(
  login: string,
  password: string
): Promise<DomaCondoClientToken> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro ao fazer login' }));
    throw new Error(error.error || 'Erro ao fazer login');
  }

  const data = await res.json();
  
  // Salvar token
  if (data.token) {
    localStorage.setItem('doma_condo_client_token', data.token);
    localStorage.setItem('doma_condo_client', JSON.stringify(data.cliente));
  }

  return data;
}

export async function getCurrentClient(): Promise<DomaCondoClient> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Erro ao obter dados do cliente');
  }

  return res.json();
}

export function logoutClient(): void {
  localStorage.removeItem('doma_condo_client_token');
  localStorage.removeItem('doma_condo_client');
}

export function isClientAuthenticated(): boolean {
  const token = localStorage.getItem('doma_condo_client_token');
  const cliente = localStorage.getItem('doma_condo_client');
  return !!token && !!cliente;
}

// Relatórios
export async function getRelatorioMensal(
  mesReferencia: string
): Promise<RelatorioMensal> {
  const res = await fetch(`${API_BASE}/relatorio/${mesReferencia}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Erro ao obter relatório');
  }

  return res.json();
}

export async function updateRelatorioTexto(
  mesReferencia: string,
  textos: Partial<RelatorioMensal['textos']>
): Promise<void> {
  const res = await fetch(`${API_BASE}/relatorio/${mesReferencia}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ textos }),
  });

  if (!res.ok) {
    throw new Error('Erro ao atualizar relatório');
  }
}







