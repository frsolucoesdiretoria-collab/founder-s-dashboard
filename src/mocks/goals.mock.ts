// FR Tech OS - Goals Mock Data

import type { Goal } from '@/types/goal';

export const mockGoals: Goal[] = [
  {
    id: '1',
    Name: 'Meta Semanal Cafés',
    KPI: '1',
    Year: 2025,
    Month: 1,
    WeekKey: '2025-W01',
    PeriodStart: '2024-12-30',
    PeriodEnd: '2025-01-05',
    Target: 5,
    Actions: [],
    Actual: 3,
    ProgressPct: 60,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  },
  {
    id: '2',
    Name: 'Meta Semanal Ativações',
    KPI: '2',
    Year: 2025,
    Month: 1,
    WeekKey: '2025-W01',
    PeriodStart: '2024-12-30',
    PeriodEnd: '2025-01-05',
    Target: 10,
    Actions: [],
    Actual: 7,
    ProgressPct: 70,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  },
  {
    id: '3',
    Name: 'Meta Mensal Propostas',
    KPI: '3',
    Year: 2025,
    Month: 1,
    WeekKey: '',
    PeriodStart: '2025-01-01',
    PeriodEnd: '2025-01-31',
    Target: 8,
    Actions: [],
    Actual: 2,
    ProgressPct: 25,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  },
  {
    id: '4',
    Name: 'Meta Anual Clientes',
    KPI: '4',
    Year: 2025,
    Month: 0,
    WeekKey: '',
    PeriodStart: '2025-01-01',
    PeriodEnd: '2025-12-31',
    Target: 50,
    Actions: [],
    Actual: 5,
    ProgressPct: 10,
    VisiblePublic: true,
    VisibleAdmin: true,
    Notes: ''
  }
];
