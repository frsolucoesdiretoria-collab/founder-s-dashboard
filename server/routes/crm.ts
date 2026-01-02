// FR Tech OS - CRM Route

import { Router } from 'express';
import { getCRMPipeline, getCRMPipelineByStatus, createCRMPipelineContact, updateCRMPipelineContact } from '../lib/notionDataLayer';

export const crmRouter = Router();

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
    
    // Calculate KPIs from pipeline data
    const totalLeads = contacts.length;
    
    const contatosAtivados = contacts.filter(c => c.Status === 'Contato Ativado').length;
    
    const cafes = contacts.filter(c => 
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
    const totalAtivados = contatosAtivados + cafes; // Total que passou por "Contato Ativado"
    const conversionActivatedToCoffee = totalAtivados > 0 ? Math.round((cafes / totalAtivados) * 100) : 0;
    
    const conversionCoffeeToProposal = cafes > 0 ? Math.round((propostas / cafes) * 100) : 0;
    const conversionProposalToSale = propostas > 0 ? Math.round((vendas / propostas) * 100) : 0;
    
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
 * POST /api/crm/pipeline
 * Create new CRM pipeline contact
 */
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

    const updated = await updateCRMPipelineContact(id, {
      Name,
      Company,
      Status,
      CoffeeDate,
      ProposalDate,
      Notes
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating CRM contact:', error);
    res.status(500).json({ 
      error: 'Failed to update CRM contact',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});





