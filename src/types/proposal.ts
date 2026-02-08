// FR Tech OS - Proposal Types

export interface ProposalService {
  name: string;
  description?: string;
  procedures?: string;
  materialsIncluded?: string;
  quantity: number;
  unitValue: number;
  subtotal: number;
}

export interface ProposalPaymentTerm {
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: 'PIX' | 'Cartão de Crédito' | 'Boleto' | 'Transferência';
  observation?: string;
}

export type ProposalStatus = 'Em criação' | 'Enviada' | 'Aprovada' | 'Recusada';

export interface ProposalFormData {
  // Cabeçalho
  proposalNumber?: string;
  date: string; // YYYY-MM-DD
  validUntil?: string; // YYYY-MM-DD
  
  // Dados do Cliente
  clientName: string;
  clientCompany?: string;
  clientCNPJ?: string;
  clientAddress?: string;
  clientCity?: string;
  clientState?: string;
  clientCEP?: string;
  clientPhone?: string;
  clientEmail?: string;
  
  // Serviços
  services: ProposalService[];
  
  // Valores
  subtotal: number;
  discountType: 'percent' | 'fixed';
  discountPercent?: number;
  discountAmount?: number;
  taxType: 'percent' | 'fixed';
  taxPercent?: number;
  taxAmount?: number;
  total: number;
  
  // Pagamento
  paymentTerms: ProposalPaymentTerm[];
  
  // Observações
  observations?: string;
  materialsNotIncluded?: string;
  
  // Relações
  relatedContactId?: string;
  relatedClientId?: string;
  relatedCoffeeDiagnosticId?: string;
  
  // Status
  status: ProposalStatus;
  rejectionReason?: string;
}

export interface Proposal extends ProposalFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  pdfUrl?: string;
}











