// FR Tech OS - CRM Service

import type { ContactPipeline, PipelineKPIs } from '@/types/crm';

/**
 * Get pipeline KPIs
 */
export async function getPipelineKPIs(): Promise<PipelineKPIs> {
  try {
    const response = await fetch('/api/crm/kpis');
    
    if (response.status === 0 || !response.ok) {
      // Verificar se é erro de conexão
      if (!response.ok && response.status !== 500) {
        throw new Error(`Servidor não está respondendo. Verifique se o servidor está rodando na porta 3001.`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Error fetching pipeline KPIs:', error);
    // Se for erro de rede, dar mensagem mais clara
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

/**
 * Get all contacts in pipeline
 */
export async function getContactsPipeline(): Promise<ContactPipeline[]> {
  try {
    const response = await fetch('/api/crm/pipeline');
    
    if (response.status === 0 || !response.ok) {
      // Verificar se é erro de conexão
      if (!response.ok && response.status !== 500) {
        throw new Error(`Servidor não está respondendo. Verifique se o servidor está rodando na porta 3001.`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    // Map Notion types to frontend types
    return data.map((contact: any) => ({
      id: contact.id,
      name: contact.Name,
      company: contact.Company || '',
      status: contact.Status || 'Contato Ativado',
      lastUpdate: contact.LastUpdate || new Date().toISOString().split('T')[0],
      coffeeDate: contact.CoffeeDate || undefined,
      proposalDate: contact.ProposalDate || undefined,
      notes: contact.Notes || undefined
    }));
  } catch (error: any) {
    console.error('Error fetching contacts pipeline:', error);
    // Se for erro de rede, dar mensagem mais clara
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

/**
 * Get contacts by status
 */
export async function getContactsByStatus(status: ContactPipeline['status']): Promise<ContactPipeline[]> {
  try {
    const response = await fetch(`/api/crm/pipeline?status=${encodeURIComponent(status)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch contacts by status');
    }
    const data = await response.json();
    return data.map((contact: any) => ({
      id: contact.id,
      name: contact.Name,
      company: contact.Company || '',
      status: contact.Status || 'Contato Ativado',
      lastUpdate: contact.LastUpdate || new Date().toISOString().split('T')[0],
      coffeeDate: contact.CoffeeDate || undefined,
      proposalDate: contact.ProposalDate || undefined,
      notes: contact.Notes || undefined
    }));
  } catch (error) {
    console.error('Error fetching contacts by status:', error);
    throw error;
  }
}

/**
 * Update contact status
 */
export async function updateContactStatus(
  contactId: string, 
  newStatus: ContactPipeline['status']
): Promise<ContactPipeline> {
  try {
    const response = await fetch(`/api/crm/pipeline/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Status: newStatus })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      name: data.Name,
      company: data.Company || '',
      status: data.Status || 'Contato Ativado',
      lastUpdate: data.LastUpdate || new Date().toISOString().split('T')[0],
      coffeeDate: data.CoffeeDate || undefined,
      proposalDate: data.ProposalDate || undefined,
      notes: data.Notes || undefined
    };
  } catch (error) {
    console.error('Error updating contact status:', error);
    throw error;
  }
}

