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
