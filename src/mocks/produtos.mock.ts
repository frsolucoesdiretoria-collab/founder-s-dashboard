// FR Tech OS - Produtos Mock Data

import type { Produto } from '@/types/produto';

export const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Consultoria de Crescimento',
    status: 'Ativo',
    problemaQueResolve: 'Empresas que precisam acelerar crescimento sem aumentar custos desproporcionalmente',
    precoMinimo: 5000,
    precoIdeal: 15000,
    tipo: 'Consultoria',
    tempoMedioEntrega: 30,
    dependenciaFundador: 'Alta',
    replicabilidade: 'Média',
    prioridadeEstrategica: 9
  },
  {
    id: '2',
    nome: 'Automação de Processos',
    status: 'Ativo',
    problemaQueResolve: 'Empresas com processos manuais que consomem muito tempo da equipe',
    precoMinimo: 3000,
    precoIdeal: 10000,
    tipo: 'Automação',
    tempoMedioEntrega: 45,
    dependenciaFundador: 'Média',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 8
  },
  {
    id: '3',
    nome: 'Sistema de CRM Personalizado',
    status: 'Ideia',
    problemaQueResolve: 'Empresas que precisam de CRM adaptado ao seu processo específico',
    precoMinimo: 8000,
    precoIdeal: 25000,
    tipo: 'Software',
    tempoMedioEntrega: 90,
    dependenciaFundador: 'Baixa',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 7
  },
  {
    id: '4',
    nome: 'Mentoria Executiva',
    status: 'Ativo',
    problemaQueResolve: 'Fundadores que precisam de orientação estratégica e tomada de decisão',
    precoMinimo: 2000,
    precoIdeal: 5000,
    tipo: 'Mentoria',
    tempoMedioEntrega: 0,
    dependenciaFundador: 'Alta',
    replicabilidade: 'Baixa',
    prioridadeEstrategica: 6
  },
  {
    id: '5',
    nome: 'Auditoria de Processos',
    status: 'Ativo',
    problemaQueResolve: 'Empresas que querem identificar gargalos e oportunidades de melhoria',
    precoMinimo: 4000,
    precoIdeal: 12000,
    tipo: 'Consultoria',
    tempoMedioEntrega: 21,
    dependenciaFundador: 'Média',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 8
  },
  {
    id: '6',
    nome: 'Plataforma de Treinamento',
    status: 'Ideia',
    problemaQueResolve: 'Empresas que precisam treinar equipes de forma escalável',
    precoMinimo: 10000,
    precoIdeal: 30000,
    tipo: 'Software',
    tempoMedioEntrega: 120,
    dependenciaFundador: 'Baixa',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 5
  },
  {
    id: '7',
    nome: 'Implementação de OKRs',
    status: 'Pausado',
    problemaQueResolve: 'Empresas que querem implementar metodologia OKR',
    precoMinimo: 3000,
    precoIdeal: 8000,
    tipo: 'Consultoria',
    tempoMedioEntrega: 60,
    dependenciaFundador: 'Média',
    replicabilidade: 'Média',
    prioridadeEstrategica: 4
  },
  {
    id: '8',
    nome: 'Análise de Dados e BI',
    status: 'Ativo',
    problemaQueResolve: 'Empresas que precisam de dashboards e análises para tomada de decisão',
    precoMinimo: 5000,
    precoIdeal: 15000,
    tipo: 'Consultoria',
    tempoMedioEntrega: 40,
    dependenciaFundador: 'Média',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 7
  },
  {
    id: '9',
    nome: 'Estratégia de Marketing Digital',
    status: 'Morto',
    problemaQueResolve: 'Empresas que precisam de estratégia de marketing digital',
    precoMinimo: 2000,
    precoIdeal: 6000,
    tipo: 'Consultoria',
    tempoMedioEntrega: 30,
    dependenciaFundador: 'Alta',
    replicabilidade: 'Baixa',
    prioridadeEstrategica: 2
  },
  {
    id: '10',
    nome: 'SaaS de Gestão de Projetos',
    status: 'Ideia',
    problemaQueResolve: 'Empresas que precisam de ferramenta de gestão de projetos adaptada',
    precoMinimo: 15000,
    precoIdeal: 50000,
    tipo: 'Software',
    tempoMedioEntrega: 180,
    dependenciaFundador: 'Baixa',
    replicabilidade: 'Alta',
    prioridadeEstrategica: 6
  }
];

export function getMockProdutos(): Produto[] {
  return [...mockProdutos];
}

export function getMockProdutosByStatus(status: Produto['status']): Produto[] {
  return mockProdutos.filter(produto => produto.status === status);
}

