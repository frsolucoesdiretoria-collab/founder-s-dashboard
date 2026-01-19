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
}

/**
 * Get Enzo's contacts
 */
export async function getEnzoContacts(): Promise<EnzoContact[]> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/contacts` : '/api/enzo/contacts';
    
    const response = await fetch(apiUrl);
    
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
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/contacts` : '/api/enzo/contacts';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, whatsapp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create Enzo contact');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error creating Enzo contact:', error);
    throw error;
  }
}

/**
 * Update Enzo contact
 */
export async function updateEnzoContact(id: string, updates: { name?: string; whatsapp?: string }): Promise<EnzoContact> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/contacts/${id}` : `/api/enzo/contacts/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update Enzo contact');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error updating Enzo contact:', error);
    throw error;
  }
}

/**
 * Delete Enzo contact
 */
export async function deleteEnzoContact(id: string): Promise<void> {
  try {
    // Usar URL relativa em produção, absoluta apenas em desenvolvimento
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
    const apiUrl = API_BASE ? `${API_BASE}/api/enzo/contacts/${id}` : `/api/enzo/contacts/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE'
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
