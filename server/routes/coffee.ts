// FR Tech OS - Coffee Route

import { Router } from 'express';
import { 
  getContacts, 
  searchContacts, 
  createContact, 
  createCoffeeDiagnostic, 
  createAction, 
  getCoffeeGoals 
} from '../lib/notionDataLayer';

export const coffeeRouter = Router();

/**
 * GET /api/coffee/contacts
 * Get all contacts (for autocomplete)
 * Query param: q (optional) - search query
 */
coffeeRouter.get('/contacts', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (q && typeof q === 'string' && q.trim()) {
      const contacts = await searchContacts(q.trim());
      res.json(contacts);
    } else {
      const contacts = await getContacts();
      res.json(contacts);
    }
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/coffee
 * Create coffee diagnostic and associated action
 */
coffeeRouter.post('/', async (req, res) => {
  try {
    const {
      contactId,
      contactName, // If contactId is not provided, create contact with this name
      segment,
      teamSize,
      channels,
      whatsAppPrimary,
      responseSpeed,
      mainPain,
      symptoms,
      funnelLeak,
      goal30,
      goal60,
      goal90,
      scopeLockAccepted,
      additivesPolicyAccepted,
      nextStepAgreed,
      notes
    } = req.body;

    // Validate required fields
    if (!scopeLockAccepted || !additivesPolicyAccepted) {
      return res.status(400).json({ 
        error: 'ScopeLockAccepted and AdditivesPolicyAccepted are required' 
      });
    }

    // Get or create contact
    let finalContactId = contactId;
    if (!finalContactId && contactName) {
      finalContactId = await createContact(contactName);
    } else if (!finalContactId) {
      return res.status(400).json({ 
        error: 'Either contactId or contactName is required' 
      });
    }

    // Create coffee diagnostic
    const today = new Date().toISOString().split('T')[0];
    const diagnosticName = contactName 
      ? `Café - ${contactName}` 
      : `Café - ${today}`;
    
    const diagnosticId = await createCoffeeDiagnostic({
      Name: diagnosticName,
      Date: today,
      Contact: finalContactId,
      Segment: segment,
      TeamSize: teamSize !== '' && teamSize !== null && teamSize !== undefined ? Number(teamSize) : undefined,
      Channels: channels || [],
      WhatsAppPrimary: whatsAppPrimary || false,
      ResponseSpeed: responseSpeed,
      MainPain: mainPain,
      Symptoms: symptoms,
      FunnelLeak: funnelLeak,
      Goal30: goal30,
      Goal60: goal60,
      Goal90: goal90,
      ScopeLockAccepted: scopeLockAccepted,
      AdditivesPolicyAccepted: additivesPolicyAccepted,
      NextStepAgreed: nextStepAgreed,
      Notes: notes
    });

    // Find coffee goal (monthly priority, then annual)
    const { monthly, annual } = await getCoffeeGoals();
    const selectedGoal = monthly || annual;
    
    let goalWarning: string | undefined;
    if (!selectedGoal) {
      goalWarning = 'Crie uma meta Goals para cafés (Network_Coffees) no Notion';
    }

    // Calculate WeekKey (format: YYYY-WW)
    const getWeekKey = (date: Date): string => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    };
    
    const currentDate = new Date();
    const weekKey = getWeekKey(currentDate);

    // Create action linked to goal
    const actionId = await createAction({
      Name: contactName ? `Café com ${contactName}` : `Café - ${today}`,
      Type: 'Café',
      Date: today,
      Done: true,
      Contribution: 1,
      Earned: 0,
      Goal: selectedGoal?.id,
      Contact: finalContactId,
      Diagnostic: diagnosticId,
      WeekKey: weekKey,
      Month: currentDate.getMonth() + 1,
      PublicVisible: true,
      Notes: mainPain || notes || ''
    });

    // Build summary
    const summary = {
      diagnosticId,
      actionId,
      mainPain: mainPain || '',
      funnelLeak: funnelLeak || '',
      responseSpeed: responseSpeed || '',
      goals: {
        goal30: goal30 || '',
        goal60: goal60 || '',
        goal90: goal90 || ''
      },
      recommendedModules: [], // TODO: implement module recommendation logic
      scopeRisk: !scopeLockAccepted || !additivesPolicyAccepted,
      goalLinked: !!selectedGoal,
      goalWarning
    };

    res.json(summary);
  } catch (error: any) {
    console.error('Error creating coffee diagnostic:', error);
    res.status(500).json({ 
      error: 'Failed to create coffee diagnostic',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

