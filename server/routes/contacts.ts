// FR Tech OS - Contacts Route

import { Router } from 'express';
import { getContacts, getContactById, updateContact, deleteContact, createContact } from '../lib/notionDataLayer';

export const contactsRouter = Router();

/**
 * GET /api/contacts
 * Get all contacts
 */
contactsRouter.get('/', async (req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/contacts/:id
 * Get a specific contact by ID
 */
contactsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    res.json(contact);
  } catch (error: any) {
    console.error('Error fetching contact:', error);
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ 
      error: 'Failed to fetch contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/contacts
 * Create a new contact
 * Body: { Name, Company?, WhatsApp?, Status?, Segment?, City?, Source?, Priority?, Notes? }
 */
contactsRouter.post('/', async (req, res) => {
  try {
    const { Name, Company, WhatsApp, Status, Segment, City, Source, Priority, Notes } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contact = await createContact({
      Name,
      Company,
      WhatsApp,
      Status,
      Segment,
      City,
      Source,
      Priority,
      Notes
    });

    res.status(201).json(contact);
  } catch (error: any) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      error: 'Failed to create contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/contacts/:id
 * Update an existing contact
 * Body: { Name?, Company?, WhatsApp?, Status?, Segment?, City?, Source?, Priority?, Notes? }
 */
contactsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Company, WhatsApp, Status, Segment, City, Source, Priority, Notes } = req.body;

    const updates: any = {};
    if (Name !== undefined) updates.Name = Name;
    if (Company !== undefined) updates.Company = Company;
    if (WhatsApp !== undefined) updates.WhatsApp = WhatsApp;
    if (Status !== undefined) updates.Status = Status;
    if (Segment !== undefined) updates.Segment = Segment;
    if (City !== undefined) updates.City = City;
    if (Source !== undefined) updates.Source = Source;
    if (Priority !== undefined) updates.Priority = Priority;
    if (Notes !== undefined) updates.Notes = Notes;

    const updated = await updateContact(id, updates);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ 
      error: 'Failed to update contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact (archives it in Notion)
 */
contactsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteContact(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ 
      error: 'Failed to delete contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
