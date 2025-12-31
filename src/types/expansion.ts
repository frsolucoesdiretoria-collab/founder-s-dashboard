// FR Tech OS - Expansion Types

export interface ExpansionOpportunity {
  id: string;
  Name: string;
  Client: string;
  Type: 'Upsell' | 'Cross-sell';
  Status: 'Identificado' | 'Em Negociação' | 'Fechado' | 'Perdido';
  Stage?: string;
  Trigger?: string;
  PlannedDate?: string;
  Health?: string;
  Notes: string;
}

export interface CustomerWin {
  id: string;
  Name: string;
  Client: string;
  Date: string;
  Description: string;
  WinType?: string;
  Evidence?: string;
  Score?: number;
  UpsellRecommended?: boolean;
  IsGOL?: boolean;
}

export interface Client {
  id: string;
  Name: string;
}
