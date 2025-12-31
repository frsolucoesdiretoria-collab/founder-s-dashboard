// FR Tech OS - Expansion Types

export interface ExpansionOpportunity {
  id: string;
  Name: string;
  Client: string;
  Type: 'Upsell' | 'Cross-sell';
  Status: 'Identificado' | 'Em Negociação' | 'Fechado' | 'Perdido';
  Notes: string;
}

export interface CustomerWin {
  id: string;
  Name: string;
  Client: string;
  Date: string;
  Description: string;
}
