// DOMA CONDO - Client Report Mock Data
import type {
  DomaCondoClient,
  Entrega,
  VolumeTrabalho,
  QualidadeControle,
  RelatorioTexto,
  RelatorioMensal,
  ForecastItem,
} from '@/types/domaCondoClient';

// Clientes mockados
export const domaCondoClientsMock: DomaCondoClient[] = [
  {
    id: '1',
    name: 'Fênix Administradora de Condomínios',
    email: 'contato@fenixadmin.com.br',
    login: 'fenix',
    createdAt: '2024-01-15T00:00:00Z',
    active: true,
  },
  {
    id: '2',
    name: 'Gestão Administradora de Condomínios',
    email: 'contato@gestaoadmin.com.br',
    login: 'gestao',
    createdAt: '2024-02-01T00:00:00Z',
    active: true,
  },
  {
    id: '3',
    name: 'Plano Consult Administradora de Condomínios',
    email: 'contato@planoconsult.com.br',
    login: 'planoconsult',
    createdAt: '2024-02-15T00:00:00Z',
    active: true,
  },
  {
    id: '4',
    name: 'Eifer Administradora de Condomínios',
    email: 'contato@eifer.com.br',
    login: 'eifer',
    createdAt: '2024-03-01T00:00:00Z',
    active: true,
  },
];

// Senhas padrão (em produção, devem ser geradas automaticamente e hasheadas)
export const clientPasswords: Record<string, string> = {
  'fenix': 'fenix2025',
  'gestao': 'gestao2025',
  'planoconsult': 'planoconsult2025',
  'eifer': 'eifer2025',
};

// Entregas para Fênix - Janeiro 2025
export const entregasFenixJan2025: Entrega[] = [
  {
    id: 'ent-1',
    clienteId: '1',
    mesReferencia: '2025-01',
    atividade: 'Conciliações',
    dataPrevista: '2025-01-05',
    dataFinalizacao: '2025-01-04',
    status: 'Concluído',
    observacoes: 'Conciliação bancária realizada com sucesso',
  },
  {
    id: 'ent-2',
    clienteId: '1',
    mesReferencia: '2025-01',
    atividade: 'Prestação de contas',
    dataPrevista: '2025-01-10',
    dataFinalizacao: '2025-01-09',
    status: 'Concluído',
    observacoes: 'Prestação de contas entregue com 1 dia de antecedência',
  },
  {
    id: 'ent-3',
    clienteId: '1',
    mesReferencia: '2025-01',
    atividade: 'Manutenções',
    dataPrevista: '2025-01-15',
    dataFinalizacao: '2025-01-15',
    status: 'Concluído',
    observacoes: 'Manutenções preventivas realizadas',
  },
  {
    id: 'ent-4',
    clienteId: '1',
    mesReferencia: '2025-01',
    atividade: 'Lançamentos',
    dataPrevista: '2025-01-20',
    dataFinalizacao: '2025-01-19',
    status: 'Concluído',
    observacoes: '427 lançamentos realizados no período',
  },
  {
    id: 'ent-5',
    clienteId: '1',
    mesReferencia: '2025-01',
    atividade: 'Envio NF contabilidade',
    dataPrevista: '2025-01-25',
    dataFinalizacao: '2025-01-24',
    status: 'Concluído',
    observacoes: 'Notas fiscais enviadas para contabilidade',
  },
];

// Volume de Trabalho - Fênix Janeiro 2025
export const volumeTrabalhoFenixJan2025: VolumeTrabalho = {
  clienteId: '1',
  mesReferencia: '2025-01',
  lancamentosRealizados: 427,
  documentosProcessados: 850,
  contasMovimentadas: 120,
  fornecedoresAtivos: 45,
  forecastLancamentos: [
    { administradora: 'Fênix', quantidade: 427, periodo: 'Janeiro/2025' },
    { administradora: 'Gestão', quantidade: 620, periodo: 'Janeiro/2025' },
    { administradora: 'Plano Consult', quantidade: 347, periodo: 'Janeiro/2025' },
    { administradora: 'Eifer', quantidade: 691, periodo: 'Janeiro/2025' },
  ],
};

// Qualidade e Controle - Fênix Janeiro 2025
export const qualidadeControleFenixJan2025: QualidadeControle = {
  clienteId: '1',
  mesReferencia: '2025-01',
  errosIdentificados: 3,
  percentualErros: 0.7,
  correcoesRealizadas: true,
  origemAjustes: {
    documentacaoIncompleta: true,
    informacoesDivergentes: true,
    ajustesSolicitados: false,
    outros: false,
  },
};

// Textos do Relatório - Fênix Janeiro 2025
export const textosRelatorioFenixJan2025: RelatorioTexto = {
  clienteId: '1',
  mesReferencia: '2025-01',
  resumoExecutivo: `No período de referência (Janeiro/2025), as rotinas financeiras foram executadas conforme o escopo contratado, com foco em organização, controle e cumprimento dos prazos acordados. Este relatório tem como objetivo apresentar de forma clara as entregas realizadas, os indicadores operacionais, melhorias implementadas e pontos relevantes para acompanhamento.

Durante o mês, foram processados 427 lançamentos financeiros, com excelente índice de qualidade (0,7% de erros, todos corrigidos no mesmo período). Todas as entregas foram concluídas dentro ou antes dos prazos previstos, demonstrando eficiência operacional e comprometimento da equipe.`,
  
  melhoriasImplementadas: `Durante o período, implementamos as seguintes melhorias:

• Padronização do fluxo de conciliações bancárias, reduzindo tempo de processamento em 15%
• Otimização do processo de prestação de contas, permitindo entrega com 1 dia de antecedência
• Organização documental aprimorada, facilitando localização e rastreabilidade
• Ajustes operacionais no sistema de lançamentos, aumentando produtividade da equipe
• Automação parcial do envio de notas fiscais para contabilidade`,
  
  demandasAtencaoEspecial: `Durante o período, identificamos 2 demandas que exigiram atenção especial:

1. Ajuste em lançamentos de fornecedor devido a documentação incompleta - resolvido em 24h
2. Divergência em informações de centro de custo - corrigido após alinhamento com cliente`,
  
  pontosRecorrentes: `Identificamos como pontos recorrentes:

• Necessidade de padronização na entrega de documentos pelos fornecedores
• Importância de manter comunicação proativa sobre prazos de entrega`,
  
  pendenciasProximoPeriodo: `Para o próximo período, destacamos:

• Continuidade da padronização de processos
• Implementação de melhorias adicionais baseadas em feedback do cliente`,
  
  feedbacksPositivos: `Recebemos feedbacks positivos do cliente sobre:

• Agilidade na prestação de contas
• Qualidade dos lançamentos
• Comunicação proativa da equipe
• Organização e transparência dos processos`,
  
  pontosAlinhamento: `Pontos de alinhamento identificados:

• Reunião mensal para alinhamento de processos (agendada)
• Ajuste em formato de relatórios conforme preferência do cliente`,
  
  recomendacoes: `Com base na análise do período, destacamos as seguintes recomendações e próximos passos:

1. Manter o ritmo atual de execução, que está acima das expectativas
2. Continuar investindo em padronização de processos
3. Implementar melhorias adicionais baseadas em feedback contínuo
4. Manter comunicação proativa sobre prazos e entregas`,
  
  chamadosRelevantes: 2,
};

// Função para gerar relatório completo
export function getRelatorioMensal(
  clienteId: string,
  mesReferencia: string
): RelatorioMensal | null {
  const cliente = domaCondoClientsMock.find(c => c.id === clienteId);
  if (!cliente) return null;

  // Por enquanto, retornamos dados mock apenas para Fênix em Janeiro/2025
  if (clienteId === '1' && mesReferencia === '2025-01') {
    return {
      cliente,
      mesReferencia,
      dataEmissao: new Date().toISOString().split('T')[0],
      entregas: entregasFenixJan2025,
      volumeTrabalho: volumeTrabalhoFenixJan2025,
      qualidadeControle: qualidadeControleFenixJan2025,
      textos: textosRelatorioFenixJan2025,
    };
  }

  // Para outros clientes/períodos, retornar dados vazios ou gerar dados genéricos
  return {
    cliente,
    mesReferencia,
    dataEmissao: new Date().toISOString().split('T')[0],
    entregas: [],
    volumeTrabalho: {
      clienteId,
      mesReferencia,
      lancamentosRealizados: 0,
      documentosProcessados: 0,
      contasMovimentadas: 0,
      fornecedoresAtivos: 0,
      forecastLancamentos: [],
    },
    qualidadeControle: {
      clienteId,
      mesReferencia,
      errosIdentificados: 0,
      percentualErros: 0,
      correcoesRealizadas: false,
      origemAjustes: {
        documentacaoIncompleta: false,
        informacoesDivergentes: false,
        ajustesSolicitados: false,
        outros: false,
      },
    },
    textos: {
      clienteId,
      mesReferencia,
      resumoExecutivo: '',
      melhoriasImplementadas: '',
      demandasAtencaoEspecial: '',
      pontosRecorrentes: '',
      pendenciasProximoPeriodo: '',
      feedbacksPositivos: '',
      pontosAlinhamento: '',
      recomendacoes: '',
      chamadosRelevantes: 0,
    },
  };
}

// Função para validar login
export function validateClientLogin(login: string, password: string): DomaCondoClient | null {
  const cliente = domaCondoClientsMock.find(c => c.login === login);
  if (!cliente) return null;
  
  const expectedPassword = clientPasswords[login];
  if (!expectedPassword || expectedPassword !== password) return null;
  
  return cliente;
}

