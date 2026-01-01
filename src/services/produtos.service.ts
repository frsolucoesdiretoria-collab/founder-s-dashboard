// FR Tech OS - Produtos Service

import type { Produto } from '@/types/produto';

/**
 * Get all products
 */
export async function getProdutos(): Promise<Produto[]> {
  try {
    const response = await fetch('/api/produtos');
    if (!response.ok) {
      throw new Error('Failed to fetch produtos');
    }
    const data = await response.json();
    // Map Notion types to frontend types
    return data.map((produto: any) => ({
      id: produto.id,
      nome: produto.Name,
      status: produto.Status || 'Ideia',
      problemaQueResolve: produto.ProblemaQueResolve || '',
      precoMinimo: produto.PrecoMinimo || 0,
      precoIdeal: produto.PrecoIdeal || 0,
      tipo: produto.Tipo || '',
      tempoMedioEntrega: produto.TempoMedioEntrega || 0,
      dependenciaFundador: produto.DependenciaFundador || 'Média',
      replicabilidade: produto.Replicabilidade || 'Média',
      prioridadeEstrategica: produto.PrioridadeEstrategica || 0
    }));
  } catch (error) {
    console.error('Error fetching produtos:', error);
    throw error;
  }
}

/**
 * Get products by status
 */
export async function getProdutosByStatus(status: Produto['status']): Promise<Produto[]> {
  try {
    const response = await fetch(`/api/produtos?status=${encodeURIComponent(status)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch produtos by status');
    }
    const data = await response.json();
    return data.map((produto: any) => ({
      id: produto.id,
      nome: produto.Name,
      status: produto.Status || 'Ideia',
      problemaQueResolve: produto.ProblemaQueResolve || '',
      precoMinimo: produto.PrecoMinimo || 0,
      precoIdeal: produto.PrecoIdeal || 0,
      tipo: produto.Tipo || '',
      tempoMedioEntrega: produto.TempoMedioEntrega || 0,
      dependenciaFundador: produto.DependenciaFundador || 'Média',
      replicabilidade: produto.Replicabilidade || 'Média',
      prioridadeEstrategica: produto.PrioridadeEstrategica || 0
    }));
  } catch (error) {
    console.error('Error fetching produtos by status:', error);
    throw error;
  }
}

