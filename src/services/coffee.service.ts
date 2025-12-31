// FR Tech OS - Coffee Service

import type { CoffeeDiagnostic, CoffeeFormData } from '@/types/coffee';
import type { Action } from '@/types/action';
import { createMockDiagnostic, getMockDiagnostics } from '@/mocks/coffee.mock';
import { createAction } from './actions.service';

/**
 * Get all coffee diagnostics
 */
export async function getCoffeeDiagnostics(): Promise<CoffeeDiagnostic[]> {
  // TODO: Replace with real API call
  return getMockDiagnostics();
}

/**
 * Create coffee diagnostic and associated action
 */
export async function createCoffeeDiagnostic(
  formData: CoffeeFormData
): Promise<{ diagnostic: CoffeeDiagnostic; action: Action }> {
  // TODO: Replace with real API call
  
  const today = new Date().toISOString().split('T')[0];
  
  // Create diagnostic
  const diagnostic = createMockDiagnostic({
    Name: `Café - ${formData.contactName}`,
    Date: today,
    Contact: formData.contactName,
    Company: formData.company,
    Role: formData.contactRole,
    Source: formData.source,
    MainChallenge: formData.mainChallenge,
    CurrentSituation: formData.currentSituation,
    DesiredOutcome: formData.desiredOutcome,
    Urgency: formData.urgency as 'alta' | 'media' | 'baixa',
    NextSteps: formData.nextSteps,
    Notes: formData.notes
  });
  
  // Create associated action
  const action = await createAction({
    Name: `Café com ${formData.contactName}`,
    Type: 'Café',
    Date: today,
    Done: true,
    Contribution: 1,
    Earned: 0,
    Goal: '1', // Coffee goal
    Contact: formData.contactName,
    Client: formData.company,
    Proposal: '',
    Diagnostic: diagnostic.id,
    WeekKey: '',
    Month: new Date().getMonth() + 1,
    PublicVisible: true,
    Notes: formData.mainChallenge
  });
  
  return { diagnostic, action };
}
