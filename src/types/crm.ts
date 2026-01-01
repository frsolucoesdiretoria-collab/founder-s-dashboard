// FR Tech OS - CRM Types

export interface ContactPipeline {
  id: string;
  name: string;
  company: string;
  status: 'Contato Ativado' | 'Café Agendado' | 'Café Executado' | 'Proposta Enviada' | 'Follow-up Ativo' | 'Venda Fechada' | 'Perdido';
  lastUpdate: string; // ISO date
  coffeeDate?: string;
  proposalDate?: string;
  notes?: string;
}

export interface PipelineKPIs {
  totalLeads: number;
  conversionCoffeeToProposal: number; // %
  conversionProposalToSale: number; // %
  averageSalesCycle: number; // days
}




