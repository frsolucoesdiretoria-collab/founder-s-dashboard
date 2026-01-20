// FR Tech OS - Enzo Canei Dashboard Routes
// Dashboard de vendas separado da Axis

import { Router } from 'express';
import { getKPIsEnzo, getGoalsEnzo, getActionsEnzo, ensureActionHasGoalEnzo, toggleActionDoneEnzo, getContactsEnzo, createContactEnzo, updateContactEnzo, deleteContactEnzo, initNotionClient } from '../lib/notionDataLayer';
import { countEnzoContactsByStatus, getStatusesForKPI, getCountForKPI, getSumOfSaleValues } from '../lib/enzoContactsCounter';
import { ensureEnzoContactsStatusField, ensureValorVendaField } from '../lib/setupEnzoContactsStatus';
import { getDatabaseId } from '../../src/lib/notion/schema';

export const enzoRouter = Router();

/**
 * POST /api/enzo/setup-status-field
 * Setup Status field in Contacts_Enzo database
 * Também cria o campo ValorVenda se não existir
 */
enzoRouter.post('/setup-status-field', async (req, res) => {
  try {
    const result = await ensureEnzoContactsStatusField();
    
    // Também garantir que ValorVenda existe
    const dbId = getDatabaseId('Contacts_Enzo');
    if (dbId) {
      const client = initNotionClient();
      const valorVendaResult = await ensureValorVendaField(client, dbId);
      if (valorVendaResult.success) {
        console.log('✅ Campo ValorVenda configurado:', valorVendaResult.message);
      } else {
        console.warn('⚠️ Campo ValorVenda:', valorVendaResult.message);
      }
    }
    
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
 * POST /api/enzo/setup-valor-venda-field
 * Força a criação do campo ValorVenda na database Contacts_Enzo
 */
enzoRouter.post('/setup-valor-venda-field', async (req, res) => {
  try {
    const dbId = getDatabaseId('Contacts_Enzo');
    if (!dbId) {
      return res.status(400).json({
        success: false,
        error: 'NOTION_DB_CONTACTS_ENZO not configured'
      });
    }

    const client = initNotionClient();
    const result = await ensureValorVendaField(client, dbId);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    console.error('Error setting up ValorVenda field:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to setup ValorVenda field',
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
      getKPIsEnzo(), // Usar getKPIsEnzo() em vez de getAllKPIsIncludingInactive() para buscar da database correta
      countEnzoContactsByStatus()
    ]);

    console.log('📊 Enzo Goals - Status counts:', statusCounts);
    console.log(`📈 Enzo Goals - Found ${goals.length} goals and ${kpis.length} KPIs`);

    // Enriquecer goals com contagem automática baseada em status dos contatos
    // Usar nova lógica acumulativa para KPIs do Enzo
    const enriched = await Promise.all(goals.map(async (goal) => {
      const kpi = kpis.find(k => k.id === goal.KPI);
      if (!kpi) {
        console.log(`⚠️  Goal "${goal.Name}" não tem KPI correspondente (KPI ID: ${goal.KPI})`);
        return goal;
      }

      const kpiName = kpi.Name || '';
      const kpiNameLower = kpiName.toLowerCase();
      
      console.log(`🔍 Processando Goal "${goal.Name}" -> KPI: "${kpiName}"`);
      
      // Identificar KPI 4 (Meta Semanal de Vendas) pelo nome
      // Usar soma dos valores de venda para este KPI específico
      const isMetaSemanalVendas = kpiNameLower.includes('meta') && 
                                  (kpiNameLower.includes('semanal') || kpiNameLower.includes('vendas') || kpiNameLower.includes('venda'));
      
      if (isMetaSemanalVendas) {
        const sumOfSales = await getSumOfSaleValues();
        console.log(`✅ Goal "${goal.Name}" (KPI: "${kpiName}" - Meta Semanal de Vendas): soma de vendas = R$ ${sumOfSales}`);
        return { ...goal, Actual: sumOfSales };
      }

      // Usar nova lógica acumulativa para contagem de leads
      // SEMPRE usar getCountForKPI para KPIs do Enzo, mesmo que retorne 0
      const count = await getCountForKPI(kpiName);
      // SEMPRE atualizar o Actual com a contagem, mesmo se for 0 (para garantir que dados reais sejam exibidos)
      const shouldUpdate = kpiNameLower.includes('convites') || kpiNameLower.includes('áudios') || kpiNameLower.includes('audios') || 
                          kpiNameLower.includes('reunião') || kpiNameLower.includes('reuniões') || kpiNameLower.includes('1:1') || 
                          kpiNameLower.includes('venda') || kpiNameLower.includes('vendas');
      
      if (shouldUpdate) {
        console.log(`✅ Goal "${goal.Name}" (KPI: "${kpiName}"): contagem acumulativa = ${count} (atualizando Actual)`);
        return { ...goal, Actual: count };
      }
      
      console.log(`⚠️  Goal "${goal.Name}" não correspondeu a nenhuma lógica específica, usando fallback`);

      // Fallback para lógica antiga se não for KPI específico do Enzo
      const statuses = getStatusesForKPI(kpiName);
      if (statuses.length === 0) {
        // Se não há contagem automática, manter o Actual do Notion
        console.log(`ℹ️  Goal "${goal.Name}" (KPI: "${kpiName}") não tem contagem automática, usando Actual do Notion: ${goal.Actual || 0}`);
        return goal;
      }

      // Contar contatos com os statuses relevantes (lógica antiga)
      const countLegacy = statuses.reduce((sum, status) => {
        const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
        return sum + (statusCounts[normalizedStatus] || 0);
      }, 0);
      
      console.log(`✅ Goal "${goal.Name}" (KPI: "${kpiName}"): contagem automática = ${countLegacy} (statuses: ${statuses.join(', ')})`);
      
      return { ...goal, Actual: countLegacy };
    }));

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
    const { name, whatsapp, status, saleValue } = req.body;

    const updates: { name?: string; whatsapp?: string; status?: string; saleValue?: number } = {};
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
      // Normalizar status antigos para novos
      let normalizedStatus = status;
      if (status === 'Proposta Enviada' || status === 'Venda Fechada') {
        normalizedStatus = 'Venda Feita';
      }
      updates.status = normalizedStatus;
    }
    if (saleValue !== undefined) {
      if (typeof saleValue !== 'number' && saleValue !== null) {
        return res.status(400).json({ error: 'saleValue must be a number or null' });
      }
      // Passar o valor exatamente como recebido (number ou null)
      updates.saleValue = saleValue; // null é válido, não converter para undefined
      console.log(`💰 Updating saleValue for contact ${id}: ${saleValue}`);
    }

    const contact = await updateContactEnzo(id, updates);
    console.log(`✅ Contact updated. ValorVenda: ${(contact as any).ValorVenda}`);
    res.json(contact);
  } catch (error: any) {
    console.error('Error updating Enzo contact:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      body: error.body
    });
    
    // Mensagem específica se o campo Status não existe
    if (error.message?.includes('Status is not a property') || error.message?.includes('property that exists') || error.message?.includes('Status')) {
      return res.status(400).json({ 
        error: 'Campo Status não existe',
        message: 'Adicione um campo Select chamado "Status" na database Contacts_Enzo do Notion com as opções: Contato Ativado, Café Agendado, Café Executado, Venda Feita'
      });
    }
    
    // Mensagem específica se o campo ValorVenda não existe
    if (error.message?.includes('ValorVenda') || error.message?.includes('Valor Venda') || 
        error.code === 'validation_error' && error.body?.message?.includes('ValorVenda')) {
      console.log('⚠️ Campo ValorVenda não existe. Tentando criar automaticamente...');
      try {
        // Tentar criar o campo automaticamente
        await ensureEnzoContactsStatusField();
        // Tentar atualizar novamente após criar o campo
        const contact = await updateContactEnzo(id, updates);
        console.log(`✅ Contact updated after creating ValorVenda field. ValorVenda: ${(contact as any).ValorVenda}`);
        return res.json(contact);
      } catch (retryError: any) {
        console.error('❌ Error creating ValorVenda field or retrying update:', retryError);
        return res.status(400).json({ 
          error: 'Campo ValorVenda não existe',
          message: 'Não foi possível criar o campo automaticamente. Adicione um campo Number chamado "ValorVenda" na database Contacts_Enzo do Notion com formato Currency (BRL).',
          details: process.env.NODE_ENV === 'development' ? retryError.message : undefined
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to update contact',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao atualizar contato. Verifique os logs do servidor.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

