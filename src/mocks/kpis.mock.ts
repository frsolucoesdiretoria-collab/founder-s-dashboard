// FR Tech OS - KPI Mock Data

import type { KPI } from '@/types/kpi';

export const mockKPIs: KPI[] = [
  {
    id: '1',
    Name: 'Cafés Realizados',
    Category: 'Rede',
    Periodicity: 'Semanal',
    ChartType: 'line',
    Unit: 'cafés',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 1,
    Active: true,
    Description: 'Quantidade de cafés de diagnóstico realizados'
  },
  {
    id: '2',
    Name: 'Ativações de Rede',
    Category: 'Rede',
    Periodicity: 'Semanal',
    ChartType: 'bar',
    Unit: 'ativações',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 2,
    Active: true,
    Description: 'Ativações de contatos na rede'
  },
  {
    id: '3',
    Name: 'Propostas de Crescimento',
    Category: 'Vendas',
    Periodicity: 'Mensal',
    ChartType: 'bar',
    Unit: 'propostas',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 3,
    Active: true,
    Description: 'Propostas enviadas a clientes'
  },
  {
    id: '4',
    Name: 'Processos Documentados',
    Category: 'Operações',
    Periodicity: 'Mensal',
    ChartType: 'area',
    Unit: 'processos',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 4,
    Active: true,
    Description: 'Processos internos documentados'
  },
  {
    id: '5',
    Name: 'Automações Criadas',
    Category: 'Tech',
    Periodicity: 'Mensal',
    ChartType: 'line',
    Unit: 'automações',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 5,
    Active: true,
    Description: 'Automações implementadas'
  },
  {
    id: '6',
    Name: 'Diários Preenchidos',
    Category: 'Reflexão',
    Periodicity: 'Diário',
    ChartType: 'number',
    Unit: 'dias',
    VisiblePublic: true,
    VisibleAdmin: true,
    IsFinancial: false,
    SortOrder: 6,
    Active: true,
    Description: 'Dias com diário preenchido'
  },
  {
    id: '7',
    Name: 'MRR',
    Category: 'Financeiro',
    Periodicity: 'Mensal',
    ChartType: 'line',
    Unit: 'R$',
    VisiblePublic: false,
    VisibleAdmin: true,
    IsFinancial: true,
    SortOrder: 7,
    Active: true,
    Description: 'Receita mensal recorrente (não público)'
  }
];
