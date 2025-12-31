// FR Tech OS - Coffee Diagnostic Types

export interface CoffeeDiagnostic {
  id: string;
  Name: string;
  Date: string;
  Contact: string;
  Company: string;
  Role: string;
  Source: string;
  MainChallenge: string;
  CurrentSituation: string;
  DesiredOutcome: string;
  Urgency: 'alta' | 'media' | 'baixa';
  NextSteps: string;
  Notes: string;
}

export interface CoffeeFormData {
  contactName: string;
  contactRole: string;
  company: string;
  source: string;
  mainChallenge: string;
  currentSituation: string;
  desiredOutcome: string;
  urgency: string;
  nextSteps: string;
  notes: string;
}
