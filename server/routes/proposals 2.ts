// FR Tech OS - Proposals API Routes

import { Router } from 'express';
import {
  getGrowthProposals,
  getGrowthProposalById,
  createGrowthProposal,
  updateGrowthProposal,
  deleteGrowthProposal,
  ensureGrowthProposalsSchema,
  validateGrowthProposalsSchema
} from '../lib/notionDataLayer';
import { createAction } from '../lib/notionDataLayer';
import { updateCRMPipelineContact, getCRMPipelineContactById } from '../lib/notionDataLayer';
import { createExpansionOpportunity } from '../lib/notionDataLayer';

const proposalsRouter = Router();

/**
 * GET /api/proposals/validate
 * Validate database schema (read-only check)
 */
proposalsRouter.get('/validate', async (req, res) => {
  try {
    const validation = await validateGrowthProposalsSchema();
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to validate schema',
      message: error.message
    });
  }
});

/**
 * POST /api/proposals/setup
 * Setup database schema (create missing properties)
 */
proposalsRouter.post('/setup', async (req, res) => {
  try {
    const result = await ensureGrowthProposalsSchema();
    res.json({
      success: true,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
      message: result.created.length > 0
        ? `Created ${result.created.length} missing properties`
        : 'All properties already exist'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to setup schema',
      message: error.message
    });
  }
});

/**
 * GET /api/proposals
 * Get all proposals
 */
proposalsRouter.get('/', async (req, res) => {
  try {
    const proposals = await getGrowthProposals();
    res.json(proposals);
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      error: 'Failed to fetch proposals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/proposals/:id
 * Get proposal by ID
 */
proposalsRouter.get('/:id', async (req, res) => {
  try {
    const proposal = await getGrowthProposalById(req.params.id);
    res.json(proposal);
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      error: 'Failed to fetch proposal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/proposals
 * Create new proposal
 */
proposalsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    // Generate proposal number if not provided
    if (!data.ProposalNumber) {
      const today = new Date();
      const year = today.getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      data.ProposalNumber = `${year}-${timestamp}`;
      if (!data.Name) {
        data.Name = `ORÇAMENTO N° ${data.ProposalNumber}`;
      }
    }
    
    // Ensure Date is set
    if (!data.Date) {
      data.Date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure Status is set
    if (!data.Status) {
      data.Status = 'Em criação';
    }
    
    // Ensure ClientName is set (required)
    if (!data.ClientName || !data.ClientName.trim()) {
      return res.status(400).json({
        error: 'ClientName is required',
        message: 'Nome do cliente é obrigatório'
      });
    }
    
    // Ensure Total is set (required, should be calculated)
    if (data.Total === undefined || data.Total === null) {
      data.Total = 0;
    }

    // Stringify JSON fields
    if (data.Services && typeof data.Services === 'object') {
      data.Services = JSON.stringify(data.Services);
    }
    if (data.PaymentTerms && typeof data.PaymentTerms === 'object') {
      data.PaymentTerms = JSON.stringify(data.PaymentTerms);
    }

    const proposal = await createGrowthProposal(data);
    
    // Handle status-specific logic
    if (proposal.Status === 'Enviada' && proposal.RelatedContact) {
      // Create Action in CRM
      const today = new Date().toISOString().split('T')[0];
      try {
        await createAction({
          Name: `Proposta enviada - ${proposal.ClientName || 'Cliente'}`,
          Type: 'Proposta',
          Date: today,
          Done: false,
          Contribution: 0,
          Earned: 0,
          Goal: '',
          Contact: proposal.ClientName || '',
          Client: proposal.ClientCompany || '',
          Proposal: proposal.id,
          Diagnostic: proposal.RelatedCoffeeDiagnostic || '',
          WeekKey: '',
          Month: new Date().getMonth() + 1,
          PublicVisible: true,
          Notes: `Proposta ${proposal.ProposalNumber || ''} enviada`
        });
      } catch (actionError) {
        console.error('Error creating action:', actionError);
        // Don't fail the proposal creation if action fails
      }

      // Update contact status to Follow-up
      try {
        const contact = await getCRMPipelineContactById(proposal.RelatedContact);
        await updateCRMPipelineContact(proposal.RelatedContact, {
          Status: 'Follow-up Ativo',
          ProposalDate: proposal.Date
        });
      } catch (contactError) {
        console.error('Error updating contact:', contactError);
        // Don't fail the proposal creation if contact update fails
      }
    }

    res.json(proposal);
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      error: 'Failed to create proposal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/proposals/:id
 * Update proposal
 */
proposalsRouter.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const oldProposal = await getGrowthProposalById(req.params.id);
    
    // Stringify JSON fields
    if (data.Services && typeof data.Services === 'object') {
      data.Services = JSON.stringify(data.Services);
    }
    if (data.PaymentTerms && typeof data.PaymentTerms === 'object') {
      data.PaymentTerms = JSON.stringify(data.PaymentTerms);
    }

    const proposal = await updateGrowthProposal(req.params.id, data);
    
    // Handle status change logic
    const statusChanged = oldProposal.Status !== proposal.Status;
    
    if (statusChanged && proposal.Status === 'Enviada' && proposal.RelatedContact) {
      // Create Action in CRM if not already created
      const today = new Date().toISOString().split('T')[0];
      try {
        await createAction({
          Name: `Proposta enviada - ${proposal.ClientName || 'Cliente'}`,
          Type: 'Proposta',
          Date: today,
          Done: false,
          Contribution: 0,
          Earned: 0,
          Goal: '',
          Contact: proposal.ClientName || '',
          Client: proposal.ClientCompany || '',
          Proposal: proposal.id,
          Diagnostic: proposal.RelatedCoffeeDiagnostic || '',
          WeekKey: '',
          Month: new Date().getMonth() + 1,
          PublicVisible: true,
          Notes: `Proposta ${proposal.ProposalNumber || ''} enviada`
        });
      } catch (actionError) {
        console.error('Error creating action:', actionError);
      }

      // Update contact status
      try {
        await updateCRMPipelineContact(proposal.RelatedContact, {
          Status: 'Follow-up Ativo',
          ProposalDate: proposal.Date || proposal.SentAt || today
        });
      } catch (contactError) {
        console.error('Error updating contact:', contactError);
      }
    }

    if (statusChanged && proposal.Status === 'Aprovada' && proposal.RelatedClient) {
      // Create expansion opportunity
      try {
        await createExpansionOpportunity({
          Name: `Oportunidade - ${proposal.ClientName || 'Cliente'}`,
          Client: proposal.RelatedClient,
          Type: 'Venda',
          Status: 'Ativa',
          Notes: `Proposta ${proposal.ProposalNumber || ''} aprovada. Valor: R$ ${proposal.Total?.toFixed(2) || '0,00'}`
        });
      } catch (expError) {
        console.error('Error creating expansion opportunity:', expError);
      }
    }

    if (statusChanged && proposal.Status === 'Enviada' && !proposal.SentAt) {
      await updateGrowthProposal(req.params.id, {
        SentAt: new Date().toISOString().split('T')[0]
      });
    }

    if (statusChanged && proposal.Status === 'Aprovada' && !proposal.ApprovedAt) {
      await updateGrowthProposal(req.params.id, {
        ApprovedAt: new Date().toISOString().split('T')[0]
      });
    }

    if (statusChanged && proposal.Status === 'Recusada' && !proposal.RejectedAt) {
      await updateGrowthProposal(req.params.id, {
        RejectedAt: new Date().toISOString().split('T')[0]
      });
    }

    const updated = await getGrowthProposalById(req.params.id);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    res.status(500).json({
      error: 'Failed to update proposal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/proposals/:id
 * Delete (archive) proposal
 */
proposalsRouter.delete('/:id', async (req, res) => {
  try {
    await deleteGrowthProposal(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({
      error: 'Failed to delete proposal',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default proposalsRouter;

