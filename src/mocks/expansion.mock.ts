// FR Tech OS - Expansion Mock Data

import type { ExpansionOpportunity, CustomerWin } from '@/types/expansion';

// In-memory state
let opportunitiesState: ExpansionOpportunity[] = [
  {
    id: '1',
    Name: 'Upsell Automações - Cliente X',
    Client: 'Cliente X',
    Type: 'Upsell',
    Status: 'Em Negociação',
    Notes: 'Cliente interessado em expandir automações'
  },
  {
    id: '2',
    Name: 'Cross-sell Consultoria - Cliente Y',
    Client: 'Cliente Y',
    Type: 'Cross-sell',
    Status: 'Identificado',
    Notes: 'Oportunidade de consultoria estratégica'
  },
  {
    id: '3',
    Name: 'Upsell Dashboard - Cliente Z',
    Client: 'Cliente Z',
    Type: 'Upsell',
    Status: 'Fechado',
    Notes: 'Dashboard premium implementado'
  }
];

let winsState: CustomerWin[] = [
  {
    id: '1',
    Name: 'Momento GOL - Cliente Z',
    Client: 'Cliente Z',
    Date: '2024-12-28',
    Description: 'Cliente atingiu meta de automação de 50%'
  },
  {
    id: '2',
    Name: 'Marco - Cliente X',
    Client: 'Cliente X',
    Date: '2024-12-30',
    Description: 'Primeiro projeto entregue com sucesso'
  }
];

export function getMockOpportunities(): ExpansionOpportunity[] {
  return [...opportunitiesState];
}

export function getMockCustomerWins(): CustomerWin[] {
  return [...winsState];
}

export function createMockOpportunity(opportunity: Omit<ExpansionOpportunity, 'id'>): ExpansionOpportunity {
  const newOpportunity: ExpansionOpportunity = {
    ...opportunity,
    id: String(Date.now())
  };
  opportunitiesState.push(newOpportunity);
  return newOpportunity;
}

export function updateMockOpportunityStatus(id: string, status: ExpansionOpportunity['Status']): boolean {
  const opportunity = opportunitiesState.find(o => o.id === id);
  if (opportunity) {
    opportunity.Status = status;
    return true;
  }
  return false;
}

export function createMockCustomerWin(win: Omit<CustomerWin, 'id'>): CustomerWin {
  const newWin: CustomerWin = {
    ...win,
    id: String(Date.now())
  };
  winsState.push(newWin);
  return newWin;
}
