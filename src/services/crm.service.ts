// FR Tech OS - CRM Service

import type { ContactPipeline, PipelineKPIs } from '@/types/crm';

/**
 * Get pipeline KPIs
 */
export async function getPipelineKPIs(): Promise<PipelineKPIs> {
  try {
    const response = await fetch('/api/crm/kpis');
    if (!response.ok) {
      throw new Error('Failed to fetch pipeline KPIs');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching pipeline KPIs:', error);
    throw error;
  }
}

/**
 * Get all contacts in pipeline
 */
export async function getContactsPipeline(): Promise<ContactPipeline[]> {
  try {
    const response = await fetch('/api/crm/pipeline');
    if (!response.ok) {
      throw new Error('Failed to fetch contacts pipeline');
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
  } catch (error) {
    console.error('Error fetching contacts pipeline:', error);
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

