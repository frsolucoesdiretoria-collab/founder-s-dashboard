// FR Tech OS - Action Types

export type ActionType = 
  | 'Café' 
  | 'Ativação de Rede' 
  | 'Proposta' 
  | 'Processo' 
  | 'Rotina' 
  | 'Automação' 
  | 'Agente' 
  | 'Diário';

export interface Action {
  id: string;
  Name: string;
  Type: ActionType;
  Date: string;
  Done: boolean;
  Contribution: number;
  Earned: number;
  Goal: string;
  Contact: string;
  Client: string;
  Proposal: string;
  Diagnostic: string;
  WeekKey: string;
  Month: number;
  PublicVisible: boolean;
  Notes: string;
}
