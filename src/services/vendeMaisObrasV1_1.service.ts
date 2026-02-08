// Vende Mais Obras V1.1 - Service Layer
// Nova versão com correções de fluxo de clientes e orçamentos

import type { 
  Cliente,
  CreateClienteInput,
  UpdateClienteInput,
  VendeMaisObrasOrcamento,
  CreateOrcamentoInput,
  UpdateOrcamentoInput
} from '@/types/vendeMaisObras';

// Usar URL relativa para usar o proxy do Vite em desenvolvimento
const API_PATH = '/api/vende-mais-obras/v1-1';
const FULL_API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}${API_PATH}` 
  : API_PATH;

const TOKEN_KEY = 'vende_mais_obras_token';

// Helper para obter token do localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message || data?.error || `Erro ${response.status}: ${response.statusText}`;
  } catch {
    return `Erro ${response.status}: ${response.statusText}`;
  }
}

// Helper para fazer requisições com autenticação
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

  return response;
}

// ==========================================
// CLIENTES V1.1
// ==========================================

/**
 * Listar clientes do usuário logado
 * Endpoint específico que garante isolamento por usuário
 */
export async function getClientesMine(): Promise<Cliente[]> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/mine`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Criar novo cliente
 * Cliente fica automaticamente associado ao usuário logado
 */
export async function createClienteV1_1(input: CreateClienteInput): Promise<Cliente> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Deletar cliente
 */
export async function deleteClienteV1_1(id: string): Promise<void> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
}

/**
 * Corrigir relação Usuario em clientes órfãos
 */
export async function fixClientesUsuarioRelationV1_1(): Promise<{ atualizados: number; erros: number; message: string }> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/clientes/fix-usuario-relation`, {
    method: 'POST'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ==========================================
// ORÇAMENTOS V1.1
// ==========================================

/**
 * Listar orçamentos do usuário logado
 */
export async function getOrcamentosV1_1(): Promise<VendeMaisObrasOrcamento[]> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Criar novo orçamento
 */
export async function createOrcamentoV1_1(input: CreateOrcamentoInput): Promise<VendeMaisObrasOrcamento> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
  
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Deletar orçamento
 */
export async function deleteOrcamentoV1_1(id: string): Promise<void> {
  const res = await fetchWithAuth(`${FULL_API_BASE}/orcamentos/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) throw new Error(await parseError(res));
}
