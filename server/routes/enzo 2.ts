// FR Tech OS - Enzo Canei Dashboard Routes
// Dashboard de vendas separado da Axis

import { Router } from 'express';
import { getKPIsEnzo, getGoalsEnzo, getActionsEnzo, ensureActionHasGoalEnzo, toggleActionDoneEnzo, getContactsEnzo, createContactEnzo, updateContactEnzo, deleteContactEnzo, getAllKPIsIncludingInactive } from '../lib/notionDataLayer';
import { countEnzoContactsByStatus, getStatusesForKPI } from '../lib/enzoContactsCounter';
import { ensureEnzoContactsStatusField } from '../lib/setupEnzoContactsStatus';

export const enzoRouter = Router();

/**
 * POST /api/enzo/setup-status-field
 * Setup Status field in Contacts_Enzo database
 */
enzoRouter.post('/setup-status-field', async (req, res) => {
  try {
    const result = await ensureEnzoContactsStatusField();
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    console.error('Error setting up Status field:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to setup Status field',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
 * Automatically counts contacts by status and updates Actual values
 */
enzoRouter.get('/goals', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const [goals, kpis, statusCounts] = await Promise.all([
      getGoalsEnzo(range),
      getAllKPIsIncludingInactive(),
      countEnzoContactsByStatus()
    ]);

    console.log('📊 Enzo Goals - Status counts:', statusCounts);
    console.log(`📈 Enzo Goals - Found ${goals.length} goals and ${kpis.length} KPIs`);

    // Enriquecer goals com contagem automática baseada em status dos contatos
    const enriched = goals.map(goal => {
      const kpi = kpis.find(k => k.id === goal.KPI);
      if (!kpi) {
        console.log(`⚠️  Goal "${goal.Name}" não tem KPI correspondente (KPI ID: ${goal.KPI})`);
        return goal;
      }

      const statuses = getStatusesForKPI(kpi.Name || '');
      if (statuses.length === 0) {
        // Se não há contagem automática, manter o Actual do Notion
        console.log(`ℹ️  Goal "${goal.Name}" (KPI: "${kpi.Name}") não tem contagem automática, usando Actual do Notion: ${goal.Actual || 0}`);
        return goal;
      }

      // Contar contatos com os statuses relevantes
      const count = statuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
      
      console.log(`✅ Goal "${goal.Name}" (KPI: "${kpi.Name}"): contagem automática = ${count} (statuses: ${statuses.join(', ')})`);
      
      return { ...goal, Actual: count };
    });

    console.log(`📦 Retornando ${enriched.length} goals enriquecidos`);
    res.json(enriched);
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

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (whatsapp !== undefined && typeof whatsapp !== 'string') {
      return res.status(400).json({ error: 'WhatsApp must be a string' });
    }

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedWhatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : undefined;

    const contact = await createContactEnzo(normalizedName, normalizedWhatsapp);
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
    const { name, whatsapp, status } = req.body;

    const updates: { name?: string; whatsapp?: string; status?: string } = {};
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Name must be a string' });
      }
      updates.name = name.trim();
    }
    if (whatsapp !== undefined) {
      updates.whatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : undefined;
    }
    if (status !== undefined) {
      if (typeof status !== 'string') {
        return res.status(400).json({ error: 'Status must be a string' });
      }
      updates.status = status;
    }

    const contact = await updateContactEnzo(id, updates);
    res.json(contact);
  } catch (error: any) {
    console.error('Error updating Enzo contact:', error);
    
    // Mensagem específica se o campo Status não existe
    if (error.message?.includes('Status is not a property') || error.message?.includes('property that exists')) {
      return res.status(400).json({ 
        error: 'Campo Status não existe',
        message: 'Adicione um campo Select chamado "Status" na database Contacts_Enzo do Notion com as opções: Contato Ativado, Café Agendado, Café Executado, Proposta Enviada, Venda Fechada, Perdido'
      });
    }
    
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

