// FR Tech OS - Contacts Service

import type { Contact } from '@/types/contact';

/**
 * Get all contacts
 */
export async function getContacts(): Promise<Contact[]> {
  try {
    const response = await fetch('/api/contacts');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch contacts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Get a contact by ID
 */
export async function getContactById(id: string): Promise<Contact> {
  try {
    const response = await fetch(`/api/contacts/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch contact');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

/**
 * Create a new contact
 */
export async function createContact(contact: Omit<Contact, 'id' | 'LastUpdate'>): Promise<Contact> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create contact');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

/**
 * Update a contact
 */
export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update contact');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete contact');
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Enzo Contact type (simplified)
 */
export interface EnzoContact {
  id: string;
  Name: string;
  WhatsApp?: string;
  Status?: string;
  ValorVenda?: number;
}

/**
 * Get Enzo's contacts
 */
export async function getEnzoContacts(): Promise<EnzoContact[]> {
  try {
    // SEMPRE usar URL relativa para funcionar em produção (mesmo servidor)
    const apiUrl = '/api/enzo/contacts';
    
    console.log('🔍 Fetching Enzo contacts from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 429) {
      throw new Error('Rate limit: Muitas requisições. Aguarde alguns segundos.');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch Enzo contacts');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Error fetching Enzo contacts:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
    }
    throw error;
  }
}

/**
 * Create Enzo contact
 */
export async function createEnzoContact(name: string, whatsapp?: string): Promise<EnzoContact> {
  try {
    // SEMPRE usar URL relativa para funcionar em produção (mesmo servidor)
    const apiUrl = '/api/enzo/contacts';
    
    console.log('🔍 Creating Enzo contact:', { name, whatsapp, apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, whatsapp })
    });

    console.log('📡 Create contact response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ Error creating contact:', errorData);
      throw new Error(errorMessage);
    }

    const contact = await response.json();
    console.log('✅ Contact created:', contact);
    return contact;
  } catch (error: any) {
    console.error('❌ Error creating Enzo contact:', error);
    // Re-throw para que o componente possa tratar
    throw error;
  }
}

/**
 * Update Enzo contact
 */
export async function updateEnzoContact(id: string, updates: { name?: string; whatsapp?: string; status?: string; saleValue?: number | null }): Promise<EnzoContact> {
  try {
    // Usar URL relativa sempre para passar pelo proxy do Vite em dev
    const apiUrl = `/api/enzo/contacts/${id}`;
    
    console.log('🔍 Updating Enzo contact:', { id, updates, apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    console.log('📡 Update contact response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ Error updating contact:', error);
      
      // Preservar mensagem de erro específica do backend
      const errorMessage = error.message || error.error || `Failed to update Enzo contact: ${response.statusText}`;
      const errorObj: any = new Error(errorMessage);
      errorObj.details = error.details;
      errorObj.error = error.error;
      throw errorObj;
    }

    const updated = await response.json();
    console.log('✅ Contact updated successfully:', updated);
    return updated;
  } catch (error: any) {
    console.error('❌ Error updating Enzo contact:', error);
    throw error;
  }
}

/**
 * Delete Enzo contact
 */
export async function deleteEnzoContact(id: string): Promise<void> {
  try {
    // SEMPRE usar URL relativa para funcionar em produção (mesmo servidor)
    const apiUrl = `/api/enzo/contacts/${id}`;
    
    console.log('🔍 Deleting Enzo contact:', { id, apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete Enzo contact');
    }
  } catch (error: any) {
    console.error('Error deleting Enzo contact:', error);
    throw error;
  }
}

/**
 * Interface for Enzo V2 Diagnostic data
 */
export interface EnzoDiagnosticoV2Data {
  nome: string;
  empresa?: string;
  cnpj?: string;
  whatsapp: string;
  respostas: Record<string, any>;
  observacoes?: string;
  produtosRecomendados?: string[];
  proximoPasso?: string;
  score?: number;
}

/**
 * Create Enzo V2 diagnostic
 * This will:
 * 1. Find or create contact by WhatsApp
 * 2. Update contact only if fields are empty (never overwrite)
 * 3. Create diagnostic linked to contact
 */
export async function createEnzoDiagnosticoV2(data: EnzoDiagnosticoV2Data): Promise<{ contactId: string; diagnosticId: string }> {
  try {
    const apiUrl = '/api/enzo/diagnosticos';
    
    console.log('🔍 Creating Enzo V2 diagnostic:', { data, apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.message || error.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ Error creating diagnostic:', error);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Diagnostic created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error creating Enzo V2 diagnostic:', error);
    throw error;
  }
}
