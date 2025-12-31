// FR Tech OS - Contacts Route

import { Router } from 'express';
import { initNotionClient } from '../lib/notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';

export const contactsRouter = Router();

/**
 * POST /api/contacts
 * Create a new contact
 * Body: { Name, WhatsApp? }
 */
contactsRouter.post('/', async (req, res) => {
  try {
    const { Name, WhatsApp } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const client = initNotionClient();
    const dbId = getDatabaseId('Contacts');
    if (!dbId) {
      return res.status(500).json({ error: 'Contacts database not configured' });
    }

    const properties: any = {
      Name: { title: [{ text: { content: Name } }] }
    };

    // TODO: Adicionar campo WhatsApp quando disponível no schema
    // Por enquanto só Name, mas podemos expandir depois

    const response = await client.pages.create({
      parent: { database_id: dbId },
      properties
    });

    res.status(201).json({
      id: response.id,
      Name: Name
    });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      error: 'Failed to create contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

