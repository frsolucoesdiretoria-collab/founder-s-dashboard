// FR Tech OS - Actions Route

import { Router } from 'express';
import { getActions, toggleActionDone, ensureActionHasGoal, createAction, updateRelatedGoal, updateAction, getActionById, deleteAction } from '../lib/notionDataLayer';
import { canMarkActionDone } from '../lib/guards';
import { initNotionClient } from '../lib/notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';

export const actionsRouter = Router();

/**
 * GET /api/actions
 * Get actions (optionally filtered by date range)
 * Query params: start, end (ISO date strings)
 */
actionsRouter.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const actions = await getActions(range);
    res.json(actions);
  } catch (error: any) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch actions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/actions
 * Create a new action
 * Body: { Name, Type, Date, Goal, Contribution?, Notes?, Contact?, PublicVisible? }
 */
actionsRouter.post('/', async (req, res) => {
  try {
    const { Name, Type, Date, Goal, Contribution, Notes, Contact, PublicVisible } = req.body;
    
    if (!Name || !Type || !Date || !Goal) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['Name', 'Type', 'Date', 'Goal']
      });
    }

    const action = await createAction({
      Name,
      Type,
      Date,
      Goal,
      Contribution,
      Notes,
      Contact,
      PublicVisible: PublicVisible ?? true,
      Done: false
    });

    res.status(201).json(action);
  } catch (error: any) {
    console.error('Error creating action:', error);
    res.status(500).json({ 
      error: 'Failed to create action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/actions/:id
 * Update an existing action
 * Body: { Name?, Type?, Date?, Goal?, Contact?, Notes?, Contribution?, Done?, PublicVisible? }
 * If Contact is provided as a string (name), creates contact and relates it
 */
actionsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Type, Date, Goal, Contact, Notes, Contribution, Done, PublicVisible, ContactName, ContactWhatsApp } = req.body;

    // Check if action exists
    const existingAction = await getActionById(id);
    if (!existingAction) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Prepare updates object
    const updates: any = {};

    if (Name !== undefined) updates.Name = Name;
    if (Type !== undefined) updates.Type = Type;
    if (Date !== undefined) updates.Date = Date;
    if (Goal !== undefined) updates.Goal = Goal;
    if (Notes !== undefined) updates.Notes = Notes;
    if (Contribution !== undefined) updates.Contribution = Contribution;
    if (Done !== undefined) updates.Done = Done;
    if (PublicVisible !== undefined) updates.PublicVisible = PublicVisible;

    // Handle Contact: if ContactName is provided, create/update contact
    if (ContactName) {
      try {
        const client = initNotionClient();
        const contactsDbId = getDatabaseId('Contacts');
        
        if (contactsDbId) {
          // Try to find existing contact by name first (simplified - in production might want to implement search)
          // For now, create new contact
          const contactResponse = await client.pages.create({
            parent: { database_id: contactsDbId },
            properties: {
              Name: { title: [{ text: { content: ContactName } }] }
            }
          });
          
          updates.Contact = contactResponse.id;
          
          // Add WhatsApp to Notes if provided
          if (ContactWhatsApp) {
            const currentNotes = existingAction.Notes || '';
            const whatsappNote = currentNotes 
              ? `${currentNotes}\nWhatsApp: ${ContactWhatsApp}`
              : `WhatsApp: ${ContactWhatsApp}`;
            updates.Notes = whatsappNote;
          }
        }
      } catch (contactError: any) {
        console.error('Error creating contact:', contactError);
        // Continue without contact if creation fails
      }
    } else if (Contact !== undefined) {
      // Direct Contact ID provided
      updates.Contact = Contact;
    }

    // Update action
    const updatedAction = await updateAction(id, updates);
    
    res.json(updatedAction);
  } catch (error: any) {
    console.error('Error updating action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/actions/:id/done
 * Toggle action done status
 * Body: { done: boolean }
 */
actionsRouter.patch('/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Body must contain { done: boolean }' });
    }

    // Check if action can be marked as done
    const checkResult = await ensureActionHasGoal(id);
    if (!checkResult.allowed) {
      return res.status(400).json({ 
        error: 'Cannot mark action as done',
        reason: checkResult.reason
      });
    }

    await toggleActionDone(id, done);
    
    // Atualizar Goal relacionado quando ação é marcada como concluída ou reaberta
    try {
      await updateRelatedGoal(id);
    } catch (goalError: any) {
      // Log erro mas não falha a requisição (a ação já foi atualizada)
      console.error('Error updating related goal:', goalError);
      // Continua mesmo se falhar atualização do goal
    }
    
    res.json({ success: true, done });
  } catch (error: any) {
    console.error('Error updating action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/actions/:id
 * Delete an action
 */
actionsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if action exists
    const existingAction = await getActionById(id);
    if (!existingAction) {
      return res.status(404).json({ error: 'Action not found' });
    }

    await deleteAction(id);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting action:', error);
    res.status(500).json({ 
      error: 'Failed to delete action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

