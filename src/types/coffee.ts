// FR Tech OS - Coffee Diagnostic Types

export interface CoffeeDiagnostic {
  id: string;
  Name: string;
  Date: string;
  Contact: string;
  Segment: string;
  TeamSize: number;
  Channels: string[];
  WhatsAppPrimary: boolean;
  ResponseSpeed: string;
  MainPain: string;
  Symptoms: string;
  FunnelLeak: string;
  Goal30: string;
  Goal60: string;
  Goal90: string;
  ScopeLockAccepted: boolean;
  AdditivesPolicyAccepted: boolean;
  NextStepAgreed: string;
  Notes: string;
  NextSteps: string;
}

export interface CoffeeFormData {
  contactId: string; // ID do Contact no Notion (obrigatório)
  segment: string;
  teamSize: number | '';
  channels: string[];
  whatsAppPrimary: boolean;
  responseSpeed: string;
  mainPain: string;
  symptoms: string;
  funnelLeak: string;
  goal30: string;
  goal60: string;
  goal90: string;
  scopeLockAccepted: boolean;
  additivesPolicyAccepted: boolean;
  nextStepAgreed: string;
  notes: string;
}

export interface CoffeeSummary {
  diagnosticId: string;
  actionId: string;
  mainPain: string;
  funnelLeak: string;
  responseSpeed: string;
  goals: {
    goal30: string;
    goal60: string;
    goal90: string;
  };
  recommendedModules: string[];
  scopeRisk: boolean; // true se ScopeLockAccepted=false ou AdditivesPolicyAccepted=false
  goalLinked: boolean; // true se Action foi vinculada a um Goal
  goalWarning?: string; // mensagem se não foi possível vincular a um Goal
}
