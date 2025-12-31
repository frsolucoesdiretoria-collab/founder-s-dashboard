// FR Tech OS - Coffee Service

import type { CoffeeFormData, CoffeeSummary } from '@/types/coffee';

export interface Contact {
  id: string;
  Name: string;
}

/**
 * Search contacts (for autocomplete)
 */
export async function searchContacts(query?: string): Promise<Contact[]> {
  try {
    const url = query 
      ? `/api/coffee/contacts?q=${encodeURIComponent(query)}`
      : '/api/coffee/contacts';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

/**
 * Create coffee diagnostic and associated action
 * Returns summary for "Pronto para proposta" screen
 */
export async function createCoffeeDiagnostic(
  formData: CoffeeFormData & { contactName?: string }
): Promise<CoffeeSummary> {
  try {
    const response = await fetch('/api/coffee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactId: formData.contactId || undefined,
        contactName: formData.contactName || undefined,
        segment: formData.segment || undefined,
        teamSize: formData.teamSize || undefined,
        channels: formData.channels || [],
        whatsAppPrimary: formData.whatsAppPrimary || false,
        responseSpeed: formData.responseSpeed || undefined,
        mainPain: formData.mainPain || undefined,
        symptoms: formData.symptoms || undefined,
        funnelLeak: formData.funnelLeak || undefined,
        goal30: formData.goal30 || undefined,
        goal60: formData.goal60 || undefined,
        goal90: formData.goal90 || undefined,
        scopeLockAccepted: formData.scopeLockAccepted,
        additivesPolicyAccepted: formData.additivesPolicyAccepted,
        nextStepAgreed: formData.nextStepAgreed || undefined,
        notes: formData.notes || undefined
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create coffee diagnostic');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Error creating coffee diagnostic:', error);
    throw error;
  }
}
