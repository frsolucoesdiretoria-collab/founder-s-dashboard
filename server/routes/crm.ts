// FR Tech OS - CRM Route

import { Router } from 'express';
import { getCRMPipeline, getCRMPipelineByStatus, createCRMPipelineContact, updateCRMPipelineContact, getGoals, updateGoal } from '../lib/notionDataLayer';

export const crmRouter = Router();

/**
 * GET /api/crm/health
 * Health check for CRM routes
 */
crmRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CRM' });
});

/**
 * GET /api/crm/pipeline
 * Get all CRM pipeline contacts
 * Query params: status (optional filter)
 */
crmRouter.get('/pipeline', async (req, res) => {
  try {
    const { status } = req.query;
    
    if (status) {
      const contacts = await getCRMPipelineByStatus(status as string);
      return res.json(contacts);
    }
    
    const contacts = await getCRMPipeline();
    res.json(contacts);
  } catch (error: any) {
    console.error('Error fetching CRM pipeline:', error);
    res.status(500).json({ 
      error: 'Failed to fetch CRM pipeline',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/crm/kpis
 * Get pipeline KPIs (calculated from pipeline data)
 */
crmRouter.get('/kpis', async (req, res) => {
  try {
    const contacts = await getCRMPipeline();
    
    // Debug: Log status distribution
    const statusCounts = contacts.reduce((acc, c) => {
      acc[c.Status] = (acc[c.Status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📊 Status distribution:', statusCounts);
    
    // Calculate KPIs from pipeline data
    const totalLeads = contacts.length;
    
    // Contatos em cada status
    const contatosAtivados = contacts.filter(c => c.Status === 'Contato Ativado').length;
    const cafesAgendados = contacts.filter(c => c.Status === 'Café Agendado').length;
    
    // Contatos que passaram por "Café Agendado" (incluindo os que já avançaram)
    const cafesAgendadosOuSuperior = contacts.filter(c => 
      c.Status === 'Café Agendado' || 
      c.Status === 'Café Executado' || 
      c.Status === 'Proposta Enviada' || 
      c.Status === 'Follow-up Ativo' || 
      c.Status === 'Venda Fechada'
    ).length;
    
    const propostas = contacts.filter(c => 
      c.Status === 'Proposta Enviada' || 
      c.Status === 'Follow-up Ativo' || 
      c.Status === 'Venda Fechada'
    ).length;
    
    const vendas = contacts.filter(c => c.Status === 'Venda Fechada').length;
    
    // Calculate conversion rates
    // Contatos Ativados → Cafés Agendados
    // Denominador: TODOS os contatos (já que todos passam por "Contato Ativado")
    // Numerador: Contatos que chegaram em "Café Agendado" ou superior
    const totalContatosAtivados = contacts.length; // Todos os contatos passaram por "Contato Ativado"
    const conversionActivatedToCoffee = totalContatosAtivados > 0 
      ? Math.round((cafesAgendadosOuSuperior / totalContatosAtivados) * 100) 
      : 0;
    
    // Debug: Log cálculo
    console.log(`📈 KPI Calculation: ${cafesAgendadosOuSuperior} / ${totalContatosAtivados} = ${conversionActivatedToCoffee}%`);
    
    const conversionCoffeeToProposal = cafesAgendadosOuSuperior > 0 
      ? Math.round((propostas / cafesAgendadosOuSuperior) * 100) 
      : 0;
    const conversionProposalToSale = propostas > 0 
      ? Math.round((vendas / propostas) * 100) 
      : 0;
    
    // Calculate average sales cycle (simplified - days from CoffeeDate to Venda Fechada)
    const vendasFechadas = contacts.filter(c => c.Status === 'Venda Fechada' && c.CoffeeDate);
    let averageSalesCycle = 0;
    if (vendasFechadas.length > 0) {
      const cycles = vendasFechadas.map(c => {
        const coffee = new Date(c.CoffeeDate);
        const sale = new Date(c.LastUpdate);
        return Math.round((sale.getTime() - coffee.getTime()) / (1000 * 60 * 60 * 24));
      });
      averageSalesCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    }
    
    res.json({
      totalLeads,
      conversionActivatedToCoffee,
      conversionCoffeeToProposal,
      conversionProposalToSale,
      averageSalesCycle
    });
  } catch (error: any) {
    console.error('Error calculating CRM KPIs:', error);
    res.status(500).json({ 
      error: 'Failed to calculate KPIs',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Helper function to sync all CRM Goals with CRM data for all relevant statuses
 * Mapeamento:
 * - Contato Ativado → KPI "Contatos Ativados"
 * - Café Agendado → KPI "Cafés Agendados"
 * - Café Executado → KPI "Café Executado"
 * - Proposta Enviada → KPI "Propostas de Crescimento"
 * - Venda Fechada → KPI "Vendas Feitas"
 */
async function syncAllCRMGoals() {
  try {
    const allGoals = await getGoals();
    const contacts = await getCRMPipeline();

    // Mapeamento de status para padrões de busca em Goal.Name
    const statusToGoalPatterns: Record<string, string[]> = {
      'Contato Ativado': ['Contatos Ativados'],
      'Café Agendado': ['Cafés Agendados'],
      'Café Executado': ['Café Executado'],
      'Proposta Enviada': ['Propostas de Crescimento', 'Propostas'],
      'Venda Fechada': ['Vendas Feitas', 'Vendas']
    };

    // Para cada status, buscar Goals relacionadas e atualizar
    for (const [status, patterns] of Object.entries(statusToGoalPatterns)) {
      // Buscar Goals que correspondem aos padrões
      const relevantGoals = allGoals.filter(goal => 
        patterns.some(pattern => 
          goal.Name.toLowerCase().includes(pattern.toLowerCase())
        ) && goal.Month > 0 // Apenas Goals mensais
      );

      if (relevantGoals.length === 0) {
        console.log(`ℹ️ No goals found for status "${status}"`);
        continue;
      }

      // Para cada Goal, contar contatos no período
      for (const goal of relevantGoals) {
        try {
          const periodStart = new Date(goal.PeriodStart);
          periodStart.setHours(0, 0, 0, 0);
          const periodEnd = new Date(goal.PeriodEnd);
          periodEnd.setHours(23, 59, 59, 999);
          
          // Contar contatos com status específico no período
          let count = 0;
          
          if (status === 'Contato Ativado') {
            // Contatos Ativados: contar todos os contatos criados/ativados no período
            count = contacts.filter(c => {
              const lastUpdate = new Date(c.LastUpdate);
              return lastUpdate >= periodStart && lastUpdate <= periodEnd;
            }).length;
          } else if (status === 'Café Agendado') {
            // Cafés Agendados: contar contatos com status "Café Agendado" ou superior que têm CoffeeDate no período
            count = contacts.filter(c => {
              if (!c.CoffeeDate) return false;
              const coffeeDate = new Date(c.CoffeeDate);
              return coffeeDate >= periodStart && coffeeDate <= periodEnd &&
                     (c.Status === 'Café Agendado' || 
                      c.Status === 'Café Executado' || 
                      c.Status === 'Proposta Enviada' || 
                      c.Status === 'Follow-up Ativo' || 
                      c.Status === 'Venda Fechada');
            }).length;
          } else if (status === 'Café Executado') {
            // Café Executado: contar contatos com status "Café Executado" ou superior
            count = contacts.filter(c => {
              if (!c.CoffeeDate) return false;
              const coffeeDate = new Date(c.CoffeeDate);
              return coffeeDate >= periodStart && coffeeDate <= periodEnd &&
                     (c.Status === 'Café Executado' || 
                      c.Status === 'Proposta Enviada' || 
                      c.Status === 'Follow-up Ativo' || 
                      c.Status === 'Venda Fechada');
            }).length;
          } else if (status === 'Proposta Enviada') {
            // Propostas Enviadas: contar contatos com status "Proposta Enviada" ou superior
            count = contacts.filter(c => {
              if (!c.ProposalDate) return false;
              const proposalDate = new Date(c.ProposalDate);
              return proposalDate >= periodStart && proposalDate <= periodEnd &&
                     (c.Status === 'Proposta Enviada' || 
                      c.Status === 'Follow-up Ativo' || 
                      c.Status === 'Venda Fechada');
            }).length;
          } else if (status === 'Venda Fechada') {
            // Vendas Fechadas: contar apenas contatos com status "Venda Fechada"
            count = contacts.filter(c => {
              if (c.Status !== 'Venda Fechada') return false;
              const lastUpdate = new Date(c.LastUpdate);
              return lastUpdate >= periodStart && lastUpdate <= periodEnd;
            }).length;
          }

          // Atualizar Goal com o valor atual
          await updateGoal(goal.id, {
            Actual: count
          });
          
          console.log(`✅ Goal "${goal.Name}" (${goal.id}) atualizada: ${count} ${status}`);
        } catch (goalError: any) {
          // Continuar com próxima goal mesmo se uma falhar
          console.error(`⚠️ Error syncing goal ${goal.id}:`, goalError.message);
        }
      }
    }
  } catch (error: any) {
    console.error('Error syncing all CRM goals:', error);
    throw error; // Re-throw para que a rota possa tratar
  }
}
crmRouter.post('/pipeline', async (req, res) => {
  try {
    const { Name, Company, Status, CoffeeDate, ProposalDate, Notes } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contact = await createCRMPipelineContact({
      Name,
      Company,
      Status: Status || 'Contato Ativado',
      CoffeeDate,
      ProposalDate,
      Notes
    });

    res.status(201).json(contact);
  } catch (error: any) {
    console.error('Error creating CRM contact:', error);
    res.status(500).json({ 
      error: 'Failed to create CRM contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/crm/pipeline/:id
 * Update CRM pipeline contact
 */
crmRouter.put('/pipeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Company, Status, CoffeeDate, ProposalDate, Notes } = req.body;

    // Debug: Log update request
    console.log(`🔄 Updating contact ${id} with Status: ${Status}`);

    const updated = await updateCRMPipelineContact(id, {
      Name,
      Company,
      Status,
      CoffeeDate,
      ProposalDate,
      Notes
    });

    // Debug: Log successful update
    console.log(`✅ Contact ${id} updated successfully. New Status: ${updated.Status}`);

    // Sincronizar Goals quando status mudar (exceto "Perdido" e "Follow-up Ativo" que não têm KPI)
    if (Status && Status !== 'Perdido' && Status !== 'Follow-up Ativo') {
      try {
        await syncAllCRMGoals();
      } catch (syncError) {
        console.error('⚠️ Error syncing goals (non-blocking):', syncError);
        // Não bloquear a resposta se a sincronização falhar
      }
    }

    res.json(updated);
  } catch (error: any) {
    console.error('❌ Error updating CRM contact:', error);
    res.status(500).json({ 
      error: 'Failed to update CRM contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/crm/sync-goals
 * Sincroniza Goals com dados do CRM (endpoint manual)
 */
crmRouter.post('/sync-goals', async (req, res) => {
  // Adicionar timeout de 30 segundos para evitar travamentos
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ 
        error: 'Timeout',
        message: 'Sincronização demorou muito. Tente novamente mais tarde.'
      });
    }
  }, 30000);

  try {
    await syncAllCRMGoals();
    clearTimeout(timeout);
    if (!res.headersSent) {
      res.json({ success: true, message: 'Goals sincronizadas com sucesso' });
    }
  } catch (error: any) {
    clearTimeout(timeout);
    console.error('Error syncing goals with CRM:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to sync goals',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});





