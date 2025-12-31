// FR Tech OS - Expansion Route
// Handles CustomerWins, ExpansionOpportunities, and GOL flow

import { Router } from 'express';
import { 
  getCustomerWins, 
  getExpansionOpportunities, 
  getClients,
  createCustomerWin,
  createExpansionOpportunity,
  createAction,
  getGoalByName
} from '../lib/notionDataLayer';

export const expansionRouter = Router();

/**
 * GET /api/expansion/customer-wins
 * Get customer wins (optionally filtered by IsGOL and last N days)
 * Query params: isGOL (boolean), lastDays (number)
 */
expansionRouter.get('/customer-wins', async (req, res) => {
  try {
    const isGOL = req.query.isGOL === 'true' ? true : req.query.isGOL === 'false' ? false : undefined;
    const lastDays = req.query.lastDays ? parseInt(req.query.lastDays as string) : undefined;
    
    const wins = await getCustomerWins({ isGOL, lastDays });
    res.json(wins);
  } catch (error: any) {
    console.error('Error fetching customer wins:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer wins',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/expansion/opportunities
 * Get expansion opportunities (optionally filtered by Stage)
 * Query params: stage (string)
 */
expansionRouter.get('/opportunities', async (req, res) => {
  try {
    const stage = req.query.stage as string | undefined;
    
    const opportunities = await getExpansionOpportunities({ stage });
    res.json(opportunities);
  } catch (error: any) {
    console.error('Error fetching expansion opportunities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch expansion opportunities',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/expansion/clients
 * Get active clients
 */
expansionRouter.get('/clients', async (req, res) => {
  try {
    const clients = await getClients();
    res.json(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      error: 'Failed to fetch clients',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Calculate planned date based on health
 */
function calculatePlannedDate(health: string): string {
  const today = new Date();
  const daysToAdd = health === 'Green' ? 7 + Math.floor(Math.random() * 7) : 14; // 7-14 days for Green, default 14
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
}

/**
 * POST /api/expansion/customer-win
 * Create customer win and trigger GOL flow if Score >= 8
 */
expansionRouter.post('/customer-win', async (req, res) => {
  try {
    const { Name, Client, Date, Description, WinType, Evidence, Score, UpsellRecommended } = req.body;
    
    if (!Name || !Date) {
      return res.status(400).json({ error: 'Name and Date are required' });
    }

    const score = Score || 0;
    const isGOL = score >= 8;

    // Create customer win
    const winId = await createCustomerWin({
      Name,
      Client,
      Date,
      Description,
      WinType,
      Evidence,
      Score: score,
      UpsellRecommended: UpsellRecommended || false,
      IsGOL: isGOL
    });

    // If Score >= 8, trigger GOL flow
    if (isGOL) {
      try {
        // 1. Find GOL_Moments_Detected goal
        const golGoal = await getGoalByName('GOL_Moments_Detected');
        const goalId = golGoal?.id;

        // 2. Create Action: GOL_Detected
        const actionName = `GOL Detectado - ${Name}`;
        await createAction({
          Name: actionName,
          Type: 'GOL_Detected',
          Date: Date,
          Done: true,
          Contribution: 1,
          Goal: goalId,
          Client,
          Notes: `Momento GOL detectado. Score: ${score}. ${Description || ''}`
        });

        // 3. Check client health (for now, default to Green if not provided)
        // In real implementation, this would come from Clients database
        const clientHealth = req.body.Health || 'Green';
        
        // Health rules: Green (3 months), Yellow (6 months), Red (block)
        if (clientHealth === 'Red') {
          return res.status(400).json({ 
            error: 'Cliente com Health Red. Expansão bloqueada. Sugerir CS primeiro.',
            winId 
          });
        }

        // 4. Create ExpansionOpportunity
        const opportunityName = `Expansão - ${Name}`;
        const plannedDate = calculatePlannedDate(clientHealth);
        
        await createExpansionOpportunity({
          Name: opportunityName,
          Client,
          Type: 'Upsell',
          Status: 'Identificado',
          Stage: 'Identificado',
          Trigger: 'GOLMoment',
          PlannedDate: plannedDate,
          Health: clientHealth,
          Notes: `Oportunidade criada automaticamente após momento GOL. Score: ${score}`
        });

        // 5. Create Action: Upsell_Meeting_Scheduled
        // Find expansion meetings goal (if exists)
        const expansionGoal = await getGoalByName('Expansion_Meetings');
        
        await createAction({
          Name: `Reunião de Expansão Agendada - ${Name}`,
          Type: 'Upsell_Meeting_Scheduled',
          Date: plannedDate,
          Done: false,
          Goal: expansionGoal?.id,
          Client,
          Notes: `Reunião de expansão agendada para ${plannedDate} após momento GOL`
        });

      } catch (golError: any) {
        console.error('Error in GOL flow:', golError);
        // Continue even if GOL flow fails - win is already created
      }
    }

    res.json({ id: winId, isGOL });
  } catch (error: any) {
    console.error('Error creating customer win:', error);
    res.status(500).json({ 
      error: 'Failed to create customer win',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/expansion/opportunity
 * Create expansion opportunity manually
 */
expansionRouter.post('/opportunity', async (req, res) => {
  try {
    const { Name, Client, Type, Status, Stage, Trigger, PlannedDate, Health, Notes } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const oppId = await createExpansionOpportunity({
      Name,
      Client,
      Type,
      Status: Status || 'Identificado',
      Stage: Stage || 'Identificado',
      Trigger,
      PlannedDate,
      Health,
      Notes
    });

    res.json({ id: oppId });
  } catch (error: any) {
    console.error('Error creating expansion opportunity:', error);
    res.status(500).json({ 
      error: 'Failed to create expansion opportunity',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

