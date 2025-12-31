// FR Tech OS - Actions Mock Data

import type { Action } from '@/types/action';

const today = new Date().toISOString().split('T')[0];

// In-memory state for actions (allows toggling Done)
let actionsState: Action[] = [
  {
    id: '1',
    Name: 'Café com João Silva',
    Type: 'Café',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '1',
    Contact: 'João Silva',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Discussão sobre parceria'
  },
  {
    id: '2',
    Name: 'Ativação LinkedIn - Maria Santos',
    Type: 'Ativação de Rede',
    Date: today,
    Done: true,
    Contribution: 1,
    Earned: 0,
    Goal: '2',
    Contact: 'Maria Santos',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: ''
  },
  {
    id: '3',
    Name: 'Proposta Empresa ABC',
    Type: 'Proposta',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '3',
    Contact: '',
    Client: 'Empresa ABC',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Proposta de consultoria'
  },
  {
    id: '4',
    Name: 'Documentar processo de onboarding',
    Type: 'Processo',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '', // No goal - should be blocked
    Contact: '',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: 'Ação sem meta - bloqueada'
  },
  {
    id: '5',
    Name: 'Criar automação de follow-up',
    Type: 'Automação',
    Date: today,
    Done: false,
    Contribution: 1,
    Earned: 0,
    Goal: '5',
    Contact: '',
    Client: '',
    Proposal: '',
    Diagnostic: '',
    WeekKey: '2025-W01',
    Month: 1,
    PublicVisible: true,
    Notes: ''
  }
];

export function getMockActions(): Action[] {
  return [...actionsState];
}

export function getTodayMockActions(): Action[] {
  return actionsState.filter(a => a.Date === today);
}

export function updateMockActionDone(actionId: string, done: boolean): boolean {
  const action = actionsState.find(a => a.id === actionId);
  if (action) {
    action.Done = done;
    return true;
  }
  return false;
}

export function createMockAction(action: Omit<Action, 'id'>): Action {
  const newAction: Action = {
    ...action,
    id: String(Date.now())
  };
  actionsState.push(newAction);
  return newAction;
}
