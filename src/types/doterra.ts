export type DoterraStage =
  | 'Aguardando ativação'
  | 'Contato ativado'
  | 'Entregue'
  | 'Lido'
  | 'Respondeu'
  | 'Interessado (pendente aprovação)'
  | 'Interessado (aprovado)'
  | 'Venda feita'
  | 'Perdido'
  | 'Não contatar';

export type DoterraApprovalStatus = 'Pendente' | 'Aprovado' | 'Reprovado';

export interface DoterraLead {
  id: string;
  Name: string;
  WhatsApp?: string;
  Cohort?: string;
  MessageVariant?: string;
  MessageText?: string;
  Stage?: DoterraStage | string;
  ApprovalStatus?: DoterraApprovalStatus | string;
  SentAt?: string;
  DeliveredAt?: string;
  ReadAt?: string;
  RepliedAt?: string;
  InterestedAt?: string;
  ApprovedAt?: string;
  SoldAt?: string;
  LastEventAt?: string;
  Source?: string;
  ExternalMessageId?: string;
  ExternalLeadId?: string;
  Notes?: string;
  Tags?: string[];
  DoNotContact?: boolean;
  DuplicateOf?: string;
  AssignedTo?: string;
}

export interface DoterraCohortSummary {
  cohort: string;
  variant: string;
  total: number;
  counts: Record<string, number>;
  conversion: {
    activated_pct: number;
    delivered_pct: number;
    replied_pct: number;
    interested_pct: number;
    approved_pct: number;
    sold_pct: number;
  };
}


