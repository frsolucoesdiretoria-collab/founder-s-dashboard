// DOMA CONDO - Dashboard Mock Data

export interface DomaCondoClient {
  id: string;
  name: string;
}

export interface DomaCondoKPI {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  value: number;
  status: 'completed' | 'pending' | 'warning';
  category: 'operacional' | 'upsell-operacional' | 'upsell-financeiro';
}

export interface DomaCondoUpsellModule {
  id: string;
  title: string;
  description: string;
  category: 'operacional' | 'financeiro' | 'futuro';
}

// KPI Consolidado por Cliente (com barras de progresso)
export interface DomaCondoClientKPI {
  id: string;
  clientId: string;
  clientName: string;
  totalLancamentos: number;
  realizados: number;
  aFazer: number;
  percentualRealizados: number;
  percentualAFazer: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

// FOCO DO DIA
export interface DomaCondoDailyFocus {
  title: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  clientName?: string;
  reason: string;
}

// Relatório Diário
export interface DailyReport {
  id: string;
  employeeName: string;
  date: string;
  elogios: {
    clientName: string;
    date: string;
    imageUrl?: string;
  }[];
  atividades: {
    periodo: string;
    descricao: string;
  }[];
  problemas: {
    problema: string;
    solucao: string;
    tempoGasto?: number;
  }[];
}

// Elogio
export interface Elogio {
  id: string;
  clientName: string;
  date: string;
  imageUrl: string;
  description?: string;
}

// Performance de Funcionária
export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  lancamentosRealizados: number;
  mediaDiaria: number;
  percentualConclusao: number;
  tempoMedio: number;
  clientesAtendidos: string[];
  status: 'excellent' | 'good' | 'warning';
}

// Alerta Inteligente
export interface IntelligentAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  clientName?: string;
}

// Conquista
export interface Achievement {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'record' | 'goal' | 'quality';
}

// Previsão de Demanda
export interface DemandForecast {
  date: string;
  expectedVolume: number;
  isPeakPeriod: boolean;
}

// Anomalia
export interface Anomaly {
  id: string;
  type: 'volume' | 'performance' | 'delay';
  title: string;
  description: string;
  clientName?: string;
  employeeName?: string;
  severity: 'high' | 'medium' | 'low';
}

// Clientes
export const domaCondoClients: DomaCondoClient[] = [
  { id: '1', name: 'Fênix Administradora de Condomínios' },
  { id: '2', name: 'Gestão Administradora de Condomínios' },
  { id: '3', name: 'Plano Consult Administradora de Condomínios' },
  { id: '4', name: 'Eifer Administradora de Condomínios' },
];

// KPIs Principais Consolidados por Cliente (com barras de progresso)
export const domaCondoClientKPIs: DomaCondoClientKPI[] = [
  {
    id: 'client-kpi-1',
    clientId: '1',
    clientName: 'Fênix Administradora de Condomínios',
    totalLancamentos: 427,
    realizados: 342,
    aFazer: 85,
    percentualRealizados: 80.1,
    percentualAFazer: 19.9,
    status: 'good',
  },
  {
    id: 'client-kpi-2',
    clientId: '2',
    clientName: 'Gestão Administradora de Condomínios',
    totalLancamentos: 620,
    realizados: 478,
    aFazer: 142,
    percentualRealizados: 77.1,
    percentualAFazer: 22.9,
    status: 'warning',
  },
  {
    id: 'client-kpi-3',
    clientId: '3',
    clientName: 'Plano Consult Administradora de Condomínios',
    totalLancamentos: 347,
    realizados: 291,
    aFazer: 56,
    percentualRealizados: 83.9,
    percentualAFazer: 16.1,
    status: 'excellent',
  },
  {
    id: 'client-kpi-4',
    clientId: '4',
    clientName: 'Eifer Administradora de Condomínios',
    totalLancamentos: 691,
    realizados: 523,
    aFazer: 168,
    percentualRealizados: 75.7,
    percentualAFazer: 24.3,
    status: 'warning',
  },
];

// Manter KPIs antigos para compatibilidade (se necessário)
export const domaCondoMainKPIs: DomaCondoKPI[] = [];

// KPIs Operacionais (Upsell)
export const domaCondoOperationalKPIs: DomaCondoKPI[] = [
  {
    id: 'upsell-1',
    clientId: 'all',
    clientName: 'Todos os Clientes',
    name: 'Horas gastas por cliente',
    value: 145,
    status: 'completed',
    category: 'upsell-operacional',
  },
  {
    id: 'upsell-2',
    clientId: 'all',
    clientName: 'Equipe',
    name: 'Produtividade por colaboradora',
    value: 87,
    status: 'completed',
    category: 'upsell-operacional',
  },
  {
    id: 'upsell-3',
    clientId: 'all',
    clientName: 'Operação',
    name: 'Percentual de retrabalho',
    value: 5.2,
    status: 'warning',
    category: 'upsell-operacional',
  },
  {
    id: 'upsell-4',
    clientId: 'all',
    clientName: 'Documentação',
    name: 'Volume de documentos por cliente',
    value: 1240,
    status: 'completed',
    category: 'upsell-operacional',
  },
  {
    id: 'upsell-5',
    clientId: 'all',
    clientName: 'Eficiência',
    name: 'Tempo médio de lançamento',
    value: 3.5,
    status: 'completed',
    category: 'upsell-operacional',
  },
];

// KPIs Financeiros (Upsell)
export const domaCondoFinancialKPIs: DomaCondoKPI[] = [
  {
    id: 'finance-1',
    clientId: 'all',
    clientName: 'Custos',
    name: 'Custo por hora',
    value: 85.50,
    status: 'completed',
    category: 'upsell-financeiro',
  },
  {
    id: 'finance-2',
    clientId: 'all',
    clientName: 'Receita',
    name: 'Valor cobrado por cliente',
    value: 12500,
    status: 'completed',
    category: 'upsell-financeiro',
  },
  {
    id: 'finance-3',
    clientId: 'all',
    clientName: 'Margem',
    name: 'Margem de contribuição por cliente',
    value: 68.5,
    status: 'completed',
    category: 'upsell-financeiro',
  },
  {
    id: 'finance-4',
    clientId: 'all',
    clientName: 'Empresa',
    name: 'Margem geral da empresa',
    value: 62.3,
    status: 'completed',
    category: 'upsell-financeiro',
  },
  {
    id: 'finance-5',
    clientId: 'all',
    clientName: 'Alertas',
    name: 'Clientes com margem negativa',
    value: 0,
    status: 'completed',
    category: 'upsell-financeiro',
  },
];

// Módulos Futuros
export const domaCondoFutureModules: DomaCondoUpsellModule[] = [
  {
    id: 'future-1',
    title: 'Portal do Cliente',
    description: 'Prestação de contas mensal • Página individual por cliente',
    category: 'futuro',
  },
  {
    id: 'future-2',
    title: 'Automação de Faturas (Energia e Água)',
    description: 'Coleta automática de boletos • Organização no Drive',
    category: 'futuro',
  },
];

// FOCO DO DIA
export const getDailyFocus = (): DomaCondoDailyFocus => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const isPeakPeriod = dayOfMonth >= 1 && dayOfMonth <= 10;
  
  // Encontrar cliente com maior gargalo
  const clientWithMostPending = domaCondoClientKPIs.reduce((prev, current) => 
    current.aFazer > prev.aFazer ? current : prev
  );
  
  if (isPeakPeriod && clientWithMostPending.aFazer > 100) {
    return {
      title: `Priorizar ${clientWithMostPending.clientName}`,
      suggestion: `${clientWithMostPending.aFazer} lançamentos pendentes. Período de pico (dias 1-10). Com foco exclusivo, a equipe pode finalizar até amanhã, mantendo o compromisso de 5 dias úteis à frente.`,
      priority: 'high',
      clientName: clientWithMostPending.clientName,
      reason: 'Alto volume pendente em período de pico',
    };
  }
  
  if (clientWithMostPending.aFazer > 120) {
    return {
      title: `Atenção: ${clientWithMostPending.clientName} precisa de foco`,
      suggestion: `${clientWithMostPending.aFazer} lançamentos pendentes. Sugerimos priorização imediata para manter a meta de antecipação de 5 dias úteis.`,
      priority: 'high',
      clientName: clientWithMostPending.clientName,
      reason: 'Volume pendente acima do ideal',
    };
  }
  
  return {
    title: 'Operação em dia',
    suggestion: 'Todos os clientes estão dentro da meta de antecipação. Mantenham o ritmo atual!',
    priority: 'low',
    reason: 'Situação operacional estável',
  };
};

// Elogios
export const elogiosMock: Elogio[] = [
  {
    id: 'elogio-1',
    clientName: 'Fênix Administradora de Condomínios',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '/placeholder.svg',
    description: 'Excelente trabalho no fechamento do mês!',
  },
  {
    id: 'elogio-2',
    clientName: 'Gestão Administradora de Condomínios',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '/placeholder.svg',
    description: 'Organização impecável dos lançamentos',
  },
  {
    id: 'elogio-3',
    clientName: 'Plano Consult Administradora de Condomínios',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '/placeholder.svg',
    description: 'Rapidez e precisão excepcionais',
  },
  {
    id: 'elogio-4',
    clientName: 'Eifer Administradora de Condomínios',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '/placeholder.svg',
    description: 'Atendimento sempre muito profissional',
  },
  {
    id: 'elogio-5',
    clientName: 'Fênix Administradora de Condomínios',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '/placeholder.svg',
    description: 'Resolução rápida de problemas',
  },
];

// Performance de Funcionárias
export const employeePerformanceMock: EmployeePerformance[] = [
  {
    employeeId: 'emp-1',
    employeeName: 'Lide',
    lancamentosRealizados: 1240,
    mediaDiaria: 41.3,
    percentualConclusao: 87.5,
    tempoMedio: 8.5,
    clientesAtendidos: ['Fênix', 'Gestão', 'Plano Consult', 'Eifer'],
    status: 'excellent',
  },
  {
    employeeId: 'emp-2',
    employeeName: 'Jessica',
    lancamentosRealizados: 1394,
    mediaDiaria: 46.5,
    percentualConclusao: 92.3,
    tempoMedio: 7.8,
    clientesAtendidos: ['Fênix', 'Gestão', 'Plano Consult', 'Eifer'],
    status: 'excellent',
  },
];

// Alertas Inteligentes
export const getIntelligentAlerts = (): IntelligentAlert[] => {
  const alerts: IntelligentAlert[] = [];
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  // Alerta de período de pico
  if (dayOfMonth >= 1 && dayOfMonth <= 10) {
    alerts.push({
      id: 'alert-peak',
      type: 'warning',
      title: 'Período de Pico de Demanda',
      description: 'Estamos nos dias 1-10 do mês, período histórico de maior volume de lançamentos. Equipe deve estar preparada.',
      action: 'Aumentar capacidade de produção',
      priority: 'high',
    });
  }
  
  // Alertas por cliente com muitos pendentes
  domaCondoClientKPIs.forEach(client => {
    if (client.aFazer > 120) {
      alerts.push({
        id: `alert-${client.clientId}`,
        type: 'error',
        title: `${client.clientName}: Meta de Antecipação em Risco`,
        description: `${client.aFazer} lançamentos pendentes. Meta de 5 dias úteis à frente pode não ser atingida.`,
        action: 'Priorizar este cliente hoje',
        priority: 'high',
        clientName: client.clientName,
      });
    }
  });
  
  // Alerta de volume alto geral
  const totalPending = domaCondoClientKPIs.reduce((sum, client) => sum + client.aFazer, 0);
  if (totalPending > 400) {
    alerts.push({
      id: 'alert-volume',
      type: 'warning',
      title: 'Volume Total de Pendências Alto',
      description: `${totalPending} lançamentos pendentes no total. Considere redistribuir tarefas ou aumentar foco operacional.`,
      priority: 'medium',
    });
  }
  
  return alerts;
};

// Conquistas
export const achievementsMock: Achievement[] = [
  {
    id: 'ach-1',
    date: new Date().toISOString().split('T')[0],
    title: 'Meta mensal de lançamentos batida! 🎉',
    description: 'Equipe ultrapassou a meta de 2500 lançamentos no mês',
    icon: '🎯',
    type: 'goal',
  },
  {
    id: 'ach-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Fênix: 100% dos lançamentos em dia',
    description: 'Cliente Fênix alcançou 100% de conclusão antes do prazo',
    icon: '✅',
    type: 'milestone',
  },
  {
    id: 'ach-3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Recorde diário: 89 lançamentos',
    description: 'Nova marca histórica de lançamentos em um único dia',
    icon: '🏆',
    type: 'record',
  },
  {
    id: 'ach-4',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Zero erros nesta semana',
    description: 'Semana perfeita sem necessidade de retrabalho',
    icon: '⭐',
    type: 'quality',
  },
];

// Previsão de Demanda
export const getDemandForecast = (): DemandForecast[] => {
  const forecast: DemandForecast[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfMonth = date.getDate();
    const isPeakPeriod = dayOfMonth >= 1 && dayOfMonth <= 10;
    
    // Volume base + pico no início do mês
    const baseVolume = 450;
    const peakVolume = 650;
    const expectedVolume = isPeakPeriod ? peakVolume : baseVolume;
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      expectedVolume,
      isPeakPeriod,
    });
  }
  
  return forecast;
};

// Anomalias
export const anomaliesMock: Anomaly[] = [
  {
    id: 'anom-1',
    type: 'volume',
    title: 'Volume acima da média histórica',
    description: 'Gestão Administradora: 142 pendentes (média histórica: 95). Aumento de 49%.',
    clientName: 'Gestão Administradora de Condomínios',
    severity: 'medium',
  },
  {
    id: 'anom-2',
    type: 'performance',
    title: 'Produtividade abaixo do esperado',
    description: 'Média diária da equipe caiu 15% nesta semana em relação à semana anterior.',
    severity: 'low',
  },
];






