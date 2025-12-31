// FR Tech OS - Contacts Service

export interface Contact {
  id: string;
  Name: string;
}

/**
 * Create a new contact
 */
export async function createContact(name: string): Promise<Contact> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Name: name })
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

