// FR Tech OS - Proposals Service

import type { Proposal, ProposalFormData } from '@/types/proposal';

/**
 * Get all proposals
 */
export async function getProposals(): Promise<Proposal[]> {
  try {
    const response = await fetch('/api/proposals');
    if (!response.ok) {
      throw new Error(`Failed to fetch proposals: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Transform Notion data to Proposal format
    return data.map((p: any) => ({
      id: p.id,
      proposalNumber: p.ProposalNumber || '',
      date: p.Date || new Date().toISOString().split('T')[0],
      validUntil: p.ValidUntil,
      status: p.Status || 'Em criação',
      
      // Cliente
      clientName: p.ClientName || '',
      clientCompany: p.ClientCompany,
      clientCNPJ: p.ClientCNPJ,
      clientAddress: p.ClientAddress,
      clientCity: p.ClientCity,
      clientState: p.ClientState,
      clientCEP: p.ClientCEP,
      clientPhone: p.ClientPhone,
      clientEmail: p.ClientEmail,
      
      // Serviços
      services: p.Services ? (typeof p.Services === 'string' ? JSON.parse(p.Services) : p.Services) : [],
      
      // Valores
      subtotal: p.Subtotal || 0,
      discountType: p.DiscountPercent ? 'percent' : 'fixed',
      discountPercent: p.DiscountPercent,
      discountAmount: p.DiscountAmount || 0,
      taxType: p.TaxPercent ? 'percent' : 'fixed',
      taxPercent: p.TaxPercent,
      taxAmount: p.TaxAmount || 0,
      total: p.Total || 0,
      
      // Pagamento
      paymentTerms: p.PaymentTerms ? (typeof p.PaymentTerms === 'string' ? JSON.parse(p.PaymentTerms) : p.PaymentTerms) : [],
      
      // Observações
      observations: p.Observations,
      materialsNotIncluded: p.MaterialsNotIncluded,
      
      // Relações
      relatedContactId: p.RelatedContact,
      relatedClientId: p.RelatedClient,
      relatedCoffeeDiagnosticId: p.RelatedCoffeeDiagnostic,
      
      // Follow-up
      sentAt: p.SentAt,
      approvedAt: p.ApprovedAt,
      rejectedAt: p.RejectedAt,
      rejectionReason: p.RejectionReason,
      
      // Metadata
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
      pdfUrl: p.PDFUrl
    }));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

/**
 * Get proposal by ID
 */
export async function getProposalById(id: string): Promise<Proposal> {
  try {
    const response = await fetch(`/api/proposals/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch proposal: ${response.statusText}`);
    }
    const p = await response.json();
    
    // Transform Notion data to Proposal format
    return {
      id: p.id,
      proposalNumber: p.ProposalNumber || '',
      date: p.Date || new Date().toISOString().split('T')[0],
      validUntil: p.ValidUntil,
      status: p.Status || 'Em criação',
      clientName: p.ClientName || '',
      clientCompany: p.ClientCompany,
      clientCNPJ: p.ClientCNPJ,
      clientAddress: p.ClientAddress,
      clientCity: p.ClientCity,
      clientState: p.ClientState,
      clientCEP: p.ClientCEP,
      clientPhone: p.ClientPhone,
      clientEmail: p.ClientEmail,
      services: p.Services ? (typeof p.Services === 'string' ? JSON.parse(p.Services) : p.Services) : [],
      subtotal: p.Subtotal || 0,
      discountType: p.DiscountPercent ? 'percent' : 'fixed',
      discountPercent: p.DiscountPercent,
      discountAmount: p.DiscountAmount || 0,
      taxType: p.TaxPercent ? 'percent' : 'fixed',
      taxPercent: p.TaxPercent,
      taxAmount: p.TaxAmount || 0,
      total: p.Total || 0,
      paymentTerms: p.PaymentTerms ? (typeof p.PaymentTerms === 'string' ? JSON.parse(p.PaymentTerms) : p.PaymentTerms) : [],
      observations: p.Observations,
      materialsNotIncluded: p.MaterialsNotIncluded,
      relatedContactId: p.RelatedContact,
      relatedClientId: p.RelatedClient,
      relatedCoffeeDiagnosticId: p.RelatedCoffeeDiagnostic,
      sentAt: p.SentAt,
      approvedAt: p.ApprovedAt,
      rejectedAt: p.RejectedAt,
      rejectionReason: p.RejectionReason,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
      pdfUrl: p.PDFUrl
    };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    throw error;
  }
}

/**
 * Create proposal
 */
export async function createProposal(formData: ProposalFormData): Promise<Proposal> {
  try {
    // Transform to Notion format - only send defined values
    const payload: any = {
      Name: formData.proposalNumber ? `ORÇAMENTO N° ${formData.proposalNumber}` : 'Nova Proposta',
      ProposalNumber: formData.proposalNumber || undefined,
      Date: formData.date,
      Status: formData.status || 'Em criação',
      ClientName: formData.clientName,
      Total: formData.total || 0,
      Subtotal: formData.subtotal || 0,
      DiscountAmount: formData.discountAmount || 0,
      TaxAmount: formData.taxAmount || 0,
      Services: JSON.stringify(formData.services || []),
      PaymentTerms: JSON.stringify(formData.paymentTerms || [])
    };

    // Add optional fields only if they have values
    if (formData.validUntil) payload.ValidUntil = formData.validUntil;
    if (formData.clientCompany) payload.ClientCompany = formData.clientCompany;
    if (formData.clientCNPJ) payload.ClientCNPJ = formData.clientCNPJ;
    if (formData.clientAddress) payload.ClientAddress = formData.clientAddress;
    if (formData.clientCity) payload.ClientCity = formData.clientCity;
    if (formData.clientState) payload.ClientState = formData.clientState;
    if (formData.clientCEP) payload.ClientCEP = formData.clientCEP;
    if (formData.clientPhone) payload.ClientPhone = formData.clientPhone;
    if (formData.clientEmail) payload.ClientEmail = formData.clientEmail;
    if (formData.discountType === 'percent' && formData.discountPercent) {
      payload.DiscountPercent = formData.discountPercent;
    }
    if (formData.taxType === 'percent' && formData.taxPercent) {
      payload.TaxPercent = formData.taxPercent;
    }
    if (formData.observations) payload.Observations = formData.observations;
    if (formData.materialsNotIncluded) payload.MaterialsNotIncluded = formData.materialsNotIncluded;
    if (formData.relatedContactId) payload.RelatedContact = formData.relatedContactId;
    if (formData.relatedClientId) payload.RelatedClient = formData.relatedClientId;
    if (formData.relatedCoffeeDiagnosticId) payload.RelatedCoffeeDiagnostic = formData.relatedCoffeeDiagnosticId;

    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Failed to create proposal: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
        
        // Improve error messages for property errors
        if (errorMessage.includes('not a property') || errorMessage.includes('does not exist')) {
          errorMessage = 
            'Erro: Algumas propriedades não existem na database do Notion. ' +
            'O sistema tentou criar automaticamente, mas pode ser necessário verificar. ' +
            `Detalhes: ${errorMessage}`;
        }
      } catch {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    const p = await response.json();
    
    // Transform response back to Proposal format
    return {
      id: p.id,
      proposalNumber: p.ProposalNumber || '',
      date: p.Date || formData.date,
      validUntil: p.ValidUntil,
      status: p.Status || 'Em criação',
      clientName: p.ClientName || formData.clientName,
      clientCompany: p.ClientCompany,
      clientCNPJ: p.ClientCNPJ,
      clientAddress: p.ClientAddress,
      clientCity: p.ClientCity,
      clientState: p.ClientState,
      clientCEP: p.ClientCEP,
      clientPhone: p.ClientPhone,
      clientEmail: p.ClientEmail,
      services: formData.services,
      subtotal: formData.subtotal,
      discountType: formData.discountType,
      discountPercent: formData.discountPercent,
      discountAmount: formData.discountAmount,
      taxType: formData.taxType,
      taxPercent: formData.taxPercent,
      taxAmount: formData.taxAmount,
      total: formData.total,
      paymentTerms: formData.paymentTerms,
      observations: formData.observations,
      materialsNotIncluded: formData.materialsNotIncluded,
      relatedContactId: formData.relatedContactId,
      relatedClientId: formData.relatedClientId,
      relatedCoffeeDiagnosticId: formData.relatedCoffeeDiagnosticId,
      sentAt: p.SentAt,
      approvedAt: p.ApprovedAt,
      rejectedAt: p.RejectedAt,
      rejectionReason: formData.rejectionReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pdfUrl: p.PDFUrl
    };
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

/**
 * Update proposal
 */
export async function updateProposal(id: string, updates: Partial<ProposalFormData>): Promise<Proposal> {
  try {
    const payload: any = {};
    
    if (updates.proposalNumber !== undefined) {
      payload.ProposalNumber = updates.proposalNumber;
      payload.Name = updates.proposalNumber ? `ORÇAMENTO N° ${updates.proposalNumber}` : undefined;
    }
    if (updates.date !== undefined) payload.Date = updates.date;
    if (updates.validUntil !== undefined) payload.ValidUntil = updates.validUntil;
    if (updates.status !== undefined) payload.Status = updates.status;
    
    if (updates.clientName !== undefined) payload.ClientName = updates.clientName;
    if (updates.clientCompany !== undefined) payload.ClientCompany = updates.clientCompany;
    if (updates.clientCNPJ !== undefined) payload.ClientCNPJ = updates.clientCNPJ;
    if (updates.clientAddress !== undefined) payload.ClientAddress = updates.clientAddress;
    if (updates.clientCity !== undefined) payload.ClientCity = updates.clientCity;
    if (updates.clientState !== undefined) payload.ClientState = updates.clientState;
    if (updates.clientCEP !== undefined) payload.ClientCEP = updates.clientCEP;
    if (updates.clientPhone !== undefined) payload.ClientPhone = updates.clientPhone;
    if (updates.clientEmail !== undefined) payload.ClientEmail = updates.clientEmail;
    
    if (updates.services !== undefined) payload.Services = JSON.stringify(updates.services);
    if (updates.paymentTerms !== undefined) payload.PaymentTerms = JSON.stringify(updates.paymentTerms);
    
    if (updates.subtotal !== undefined) payload.Subtotal = updates.subtotal || 0;
    if (updates.discountType !== undefined) {
      if (updates.discountType === 'percent') {
        if (updates.discountPercent) payload.DiscountPercent = updates.discountPercent;
        payload.DiscountAmount = 0;
      } else {
        payload.DiscountAmount = updates.discountAmount || 0;
        // Don't send DiscountPercent if it's fixed
      }
    }
    if (updates.taxType !== undefined) {
      if (updates.taxType === 'percent') {
        if (updates.taxPercent) payload.TaxPercent = updates.taxPercent;
        payload.TaxAmount = 0;
      } else {
        payload.TaxAmount = updates.taxAmount || 0;
        // Don't send TaxPercent if it's fixed
      }
    }
    if (updates.total !== undefined) payload.Total = updates.total || 0;
    
    if (updates.observations !== undefined) payload.Observations = updates.observations;
    if (updates.materialsNotIncluded !== undefined) payload.MaterialsNotIncluded = updates.materialsNotIncluded;
    
    if (updates.relatedContactId !== undefined) payload.RelatedContact = updates.relatedContactId || null;
    if (updates.relatedClientId !== undefined) payload.RelatedClient = updates.relatedClientId || null;
    if (updates.relatedCoffeeDiagnosticId !== undefined) payload.RelatedCoffeeDiagnostic = updates.relatedCoffeeDiagnosticId || null;
    
    if (updates.rejectionReason !== undefined) payload.RejectionReason = updates.rejectionReason;

    const response = await fetch(`/api/proposals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Failed to update proposal: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
        
        // Improve error messages for property errors
        if (errorMessage.includes('not a property') || errorMessage.includes('does not exist')) {
          errorMessage = 
            'Erro: Algumas propriedades não existem na database do Notion. ' +
            'O sistema tentou criar automaticamente, mas pode ser necessário verificar. ' +
            `Detalhes: ${errorMessage}`;
        }
      } catch {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    const p = await response.json();
    
    // Transform response
    return {
      id: p.id,
      proposalNumber: p.ProposalNumber || '',
      date: p.Date || updates.date,
      validUntil: p.ValidUntil,
      status: p.Status || updates.status || 'Em criação',
      clientName: p.ClientName || updates.clientName || '',
      clientCompany: p.ClientCompany,
      clientCNPJ: p.ClientCNPJ,
      clientAddress: p.ClientAddress,
      clientCity: p.ClientCity,
      clientState: p.ClientState,
      clientCEP: p.ClientCEP,
      clientPhone: p.ClientPhone,
      clientEmail: p.ClientEmail,
      services: p.Services ? (typeof p.Services === 'string' ? JSON.parse(p.Services) : p.Services) : updates.services || [],
      subtotal: p.Subtotal || updates.subtotal || 0,
      discountType: updates.discountType || (p.DiscountPercent ? 'percent' : 'fixed'),
      discountPercent: p.DiscountPercent || updates.discountPercent,
      discountAmount: p.DiscountAmount || updates.discountAmount || 0,
      taxType: updates.taxType || (p.TaxPercent ? 'percent' : 'fixed'),
      taxPercent: p.TaxPercent || updates.taxPercent,
      taxAmount: p.TaxAmount || updates.taxAmount || 0,
      total: p.Total || updates.total || 0,
      paymentTerms: p.PaymentTerms ? (typeof p.PaymentTerms === 'string' ? JSON.parse(p.PaymentTerms) : p.PaymentTerms) : updates.paymentTerms || [],
      observations: p.Observations,
      materialsNotIncluded: p.MaterialsNotIncluded,
      relatedContactId: p.RelatedContact,
      relatedClientId: p.RelatedClient,
      relatedCoffeeDiagnosticId: p.RelatedCoffeeDiagnostic,
      sentAt: p.SentAt,
      approvedAt: p.ApprovedAt,
      rejectedAt: p.RejectedAt,
      rejectionReason: p.RejectionReason,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pdfUrl: p.PDFUrl
    };
  } catch (error) {
    console.error('Error updating proposal:', error);
    throw error;
  }
}

/**
 * Delete proposal
 */
export async function deleteProposal(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/proposals/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete proposal: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
}

