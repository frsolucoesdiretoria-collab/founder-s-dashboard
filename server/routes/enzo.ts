// FR Tech OS - Enzo Canei Dashboard Routes
// Dashboard de vendas separado da Axis

import { Router } from 'express';
import { getKPIsEnzo, getGoalsEnzo, getActionsEnzo, ensureActionHasGoalEnzo, toggleActionDoneEnzo, getContactsEnzo, createContactEnzo, updateContactEnzo, deleteContactEnzo } from '../lib/notionDataLayer';

export const enzoRouter = Router();

/**
 * GET /api/enzo/kpis
 * Get all Enzo's KPIs (including financial for sales dashboard)
 */
enzoRouter.get('/kpis', async (req, res) => {
  try {
    console.log('📥 GET /api/enzo/kpis - Request received');
    const kpis = await getKPIsEnzo();
    console.log(`✅ GET /api/enzo/kpis - Returning ${kpis.length} KPIs`);
    res.json(kpis);
  } catch (error: any) {
    console.error('❌ GET /api/enzo/kpis - Error:', error.message);
    // Se database não está configurada, retornar array vazio em vez de erro
    if (error.message?.includes('not configured')) {
      console.warn('⚠️  Enzo KPIs database not configured, returning empty array');
      return res.json([]);
    }
    console.error('❌ Error fetching Enzo KPIs:', error);
    // Em produção, retornar array vazio em vez de erro 500
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Production mode: returning empty array instead of error');
      return res.json([]);
    }
    res.status(500).json({ 
      error: 'Failed to fetch KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/enzo/goals
 * Get Enzo's goals (optionally filtered by date range)
 */
enzoRouter.get('/goals', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const goals = await getGoalsEnzo(range);
    res.json(goals);
  } catch (error: any) {
    // Se database não está configurada, retornar array vazio em vez de erro
    if (error.message?.includes('not configured')) {
      console.warn('⚠️  Enzo Goals database not configured, returning empty array');
      return res.json([]);
    }
    console.error('Error fetching Enzo goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/enzo/actions
 * Get Enzo's actions (optionally filtered by date range)
 */
enzoRouter.get('/actions', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const actions = await getActionsEnzo(range);
    res.json(actions);
  } catch (error: any) {
    // Se database não está configurada, retornar array vazio em vez de erro
    if (error.message?.includes('not configured')) {
      console.warn('⚠️  Enzo Actions database not configured, returning empty array');
      return res.json([]);
    }
    console.error('Error fetching Enzo actions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch actions',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/enzo/actions/:id/done
 * Toggle Enzo's action done status
 */
enzoRouter.patch('/actions/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    // Validate action has goal
    const validation = await ensureActionHasGoalEnzo(id);
    if (!validation.allowed && done === true) {
      return res.status(400).json({
        error: 'Action cannot be completed',
        reason: validation.reason
      });
    }

    await toggleActionDoneEnzo(id, done === true);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating Enzo action:', error);
    res.status(500).json({ 
      error: 'Failed to update action',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/enzo/contacts
 * Get all Enzo's contacts
 */
enzoRouter.get('/contacts', async (req, res) => {
  try {
    const contacts = await getContactsEnzo();
    res.json(contacts);
  } catch (error: any) {
    // Se database não está configurada, retornar array vazio em vez de erro
    if (error.message?.includes('not configured')) {
      console.warn('⚠️  Enzo Contacts database not configured, returning empty array');
      return res.json([]);
    }
    console.error('Error fetching Enzo contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/enzo/contacts
 * Create a new Enzo contact
 */
enzoRouter.post('/contacts', async (req, res) => {
  try {
    const { name, whatsapp } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ 
        error: 'Name is required' 
      });
    }

    const contact = await createContactEnzo(name.trim(), whatsapp);
    res.json(contact);
  } catch (error: any) {
    console.error('Error creating Enzo contact:', error);
    res.status(500).json({ 
      error: 'Failed to create contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/enzo/contacts/:id
 * Update an Enzo contact
 */
enzoRouter.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, whatsapp } = req.body;

    const updates: { name?: string; whatsapp?: string } = {};
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Name must be a string' });
      }
      updates.name = name.trim();
    }
    if (whatsapp !== undefined) {
      updates.whatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : undefined;
    }

    const contact = await updateContactEnzo(id, updates);
    res.json(contact);
  } catch (error: any) {
    console.error('Error updating Enzo contact:', error);
    res.status(500).json({ 
      error: 'Failed to update contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/enzo/contacts/:id
 * Delete an Enzo contact
 */
enzoRouter.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteContactEnzo(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Enzo contact:', error);
    res.status(500).json({ 
      error: 'Failed to delete contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

