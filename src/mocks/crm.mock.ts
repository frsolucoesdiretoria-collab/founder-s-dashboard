// FR Tech OS - CRM Mock Data

import type { ContactPipeline, PipelineKPIs } from '@/types/crm';

export const mockPipelineKPIs: PipelineKPIs = {
  totalLeads: 24,
  conversionActivatedToCoffee: 45,
  conversionCoffeeToProposal: 35,
  conversionProposalToSale: 42,
  averageSalesCycle: 18
};

export const mockContacts: ContactPipeline[] = [
  {
    id: '1',
    name: 'João Silva',
    company: 'TechCorp',
    status: 'Contato Ativado',
    lastUpdate: '2025-01-15',
    notes: 'Contato via LinkedIn'
  },
  {
    id: '2',
    name: 'Maria Santos',
    company: 'Inovação Digital',
    status: 'Café Agendado',
    lastUpdate: '2025-01-16',
    coffeeDate: '2025-01-20',
    notes: 'Café agendado para próxima semana'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    company: 'StartupXYZ',
    status: 'Café Executado',
    lastUpdate: '2025-01-14',
    coffeeDate: '2025-01-14',
    notes: 'Interesse em consultoria de crescimento'
  },
  {
    id: '4',
    name: 'Ana Costa',
    company: 'Empresa ABC',
    status: 'Proposta Enviada',
    lastUpdate: '2025-01-13',
    coffeeDate: '2025-01-10',
    proposalDate: '2025-01-13',
    notes: 'Aguardando retorno da proposta'
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    company: 'Digital Solutions',
    status: 'Follow-up Ativo',
    lastUpdate: '2025-01-15',
    coffeeDate: '2025-01-08',
    proposalDate: '2025-01-11',
    notes: 'Seguindo com follow-up semanal'
  },
  {
    id: '6',
    name: 'Fernanda Lima',
    company: 'Growth Co',
    status: 'Venda Fechada',
    lastUpdate: '2025-01-12',
    coffeeDate: '2025-01-05',
    proposalDate: '2025-01-08',
    notes: 'Venda fechada com sucesso'
  },
  {
    id: '7',
    name: 'Roberto Alves',
    company: 'TechStart',
    status: 'Perdido',
    lastUpdate: '2025-01-10',
    coffeeDate: '2025-01-03',
    notes: 'Não houve interesse após o café'
  },
  {
    id: '8',
    name: 'Juliana Ferreira',
    company: 'Inovação Plus',
    status: 'Café Agendado',
    lastUpdate: '2025-01-16',
    coffeeDate: '2025-01-22',
    notes: 'Café confirmado'
  },
  {
    id: '9',
    name: 'Lucas Rodrigues',
    company: 'ScaleUp',
    status: 'Proposta Enviada',
    lastUpdate: '2025-01-15',
    coffeeDate: '2025-01-12',
    proposalDate: '2025-01-15',
    notes: 'Proposta personalizada enviada'
  },
  {
    id: '10',
    name: 'Patricia Souza',
    company: 'Growth Hub',
    status: 'Follow-up Ativo',
    lastUpdate: '2025-01-16',
    coffeeDate: '2025-01-09',
    proposalDate: '2025-01-12',
    notes: 'Aguardando decisão do board'
  },
  {
    id: '11',
    name: 'Ricardo Martins',
    company: 'TechVenture',
    status: 'Café Executado',
    lastUpdate: '2025-01-15',
    coffeeDate: '2025-01-15',
    notes: 'Café executado hoje, aguardando feedback'
  },
  {
    id: '12',
    name: 'Camila Rocha',
    company: 'Digital Growth',
    status: 'Venda Fechada',
    lastUpdate: '2025-01-11',
    coffeeDate: '2024-12-28',
    proposalDate: '2025-01-02',
    notes: 'Venda fechada no início do mês'
  }
];

export function getMockPipelineKPIs(): PipelineKPIs {
  return mockPipelineKPIs;
}

export function getMockContacts(): ContactPipeline[] {
  return [...mockContacts];
}

export function getMockContactsByStatus(status: ContactPipeline['status']): ContactPipeline[] {
  return mockContacts.filter(contact => contact.status === status);
}





