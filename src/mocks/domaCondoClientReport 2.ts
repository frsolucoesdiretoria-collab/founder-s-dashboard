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
import type { DomaCondoClientKPI } from '@/mocks/domaCondoDashboard';

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

// ============================================================================
// PROGRESSÃO DE DADOS - Janeiro 2025 a Dezembro 2025
// Base: 427 lançamentos em jan/2025 → 555 lançamentos em dez/2025 (30% aumento)
// ============================================================================

// Valores base por mês (progressão linear com variações sazonais)
const getTotalLancamentosMensal = (mes: number): number => {
  const base = 427;
  const aumentoTotal = 128; // 30% de 427
  const incrementoMensal = aumentoTotal / 11; // 11 incrementos (fev a dez)
  const baseMensal = base + (incrementoMensal * (mes - 1));
  
  // Variações sazonais
  const variacoes: Record<number, number> = {
    1: 0,      // Jan: base
    2: 8,      // Fev: +8 (alta demanda)
    3: 12,     // Mar: +12 (pico)
    4: -5,     // Abr: -5 (mais calmo)
    5: -8,     // Mai: -8 (mais calmo)
    6: 6,      // Jun: +6 (meio do ano)
    7: 10,     // Jul: +10 (pico)
    8: -3,     // Ago: -3 (meio calmo)
    9: -5,     // Set: -5 (calmo)
    10: 8,     // Out: +8 (alta)
    11: 15,    // Nov: +15 (pico final)
    12: 20,    // Dez: +20 (maior pico)
  };
  
  return Math.round(baseMensal + (variacoes[mes] || 0));
};

// KPIs Mensais para Fênix 2025
export const fenixKPIs2025: DomaCondoClientKPI[] = Array.from({ length: 12 }, (_, index) => {
  const mes = index + 1;
  const mesReferencia = `2025-${String(mes).padStart(2, '0')}`;
  const totalLancamentos = getTotalLancamentosMensal(mes);
  
  // Percentual realizado varia entre 78% e 92% mensalmente
  const percentuaisRealizados = [82, 85, 80, 88, 90, 83, 79, 87, 91, 84, 86, 89];
  const percentualRealizados = percentuaisRealizados[index];
  const realizados = Math.round(totalLancamentos * (percentualRealizados / 100));
  const aFazer = totalLancamentos - realizados;
  const percentualAFazer = 100 - percentualRealizados;
  
  // Status baseado no percentual
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (percentualRealizados >= 85) status = 'excellent';
  else if (percentualRealizados >= 70) status = 'good';
  else if (percentualRealizados >= 50) status = 'warning';
  else status = 'critical';
  
  return {
    id: `fenix-kpi-${mesReferencia}`,
    clientId: '1',
    clientName: 'Fênix Administradora de Condomínios',
    totalLancamentos,
    realizados,
    aFazer,
    percentualRealizados,
    percentualAFazer,
    status,
  };
});

// Função para obter KPI mensal da Fênix
export function getFenixKPIMensal(mesReferencia: string): DomaCondoClientKPI | null {
  // mesReferencia está no formato "2025-01"
  // O ID do KPI está no formato "fenix-kpi-2025-01"
  // Extrair mês do mesReferencia e encontrar o KPI correspondente
  const mes = parseInt(mesReferencia.split('-')[1]);
  if (mes >= 1 && mes <= 12) {
    return fenixKPIs2025[mes - 1] || null;
  }
  return null;
}

// ============================================================================
// FUNÇÕES GERADORAS DE DADOS MOCK
// ============================================================================

// Função para obter último dia do mês
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Função para formatar data
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Função para gerar entregas mensais
function gerarEntregasMensais(mes: number, lancamentosRealizados: number): Entrega[] {
  const ano = 2025;
  const mesReferencia = `2025-${String(mes).padStart(2, '0')}`;
  
  // Datas padrão (ajustando se for final de semana)
  let diaConciliacoes = 5;
  let diaPrestacao = 10;
  let diaManutencoes = 15;
  let diaLancamentos = 20;
  let diaNF = 25;
  
  // Ajustar para dias úteis (segunda a sexta)
  const ajustarDiaUtil = (dia: number): number => {
    const data = new Date(ano, mes - 1, dia);
    const diaSemana = data.getDay();
    if (diaSemana === 0) return dia + 1; // Domingo -> Segunda
    if (diaSemana === 6) return dia + 2; // Sábado -> Segunda
    return dia;
  };
  
  diaConciliacoes = ajustarDiaUtil(diaConciliacoes);
  diaPrestacao = ajustarDiaUtil(diaPrestacao);
  diaManutencoes = ajustarDiaUtil(diaManutencoes);
  diaLancamentos = ajustarDiaUtil(diaLancamentos);
  diaNF = ajustarDiaUtil(diaNF);
  
  // Status variado (maioria concluído, ocasionalmente em andamento)
  // Usar índice do mês para garantir consistência (mesmo mês = mesmos status)
  const statusOptions: Array<Array<'Concluído' | 'Em Andamento' | 'Pendente'>> = [
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Jan
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Fev
    ['Concluído', 'Concluído', 'Em Andamento', 'Concluído', 'Concluído'], // Mar
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Abr
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Mai
    ['Concluído', 'Concluído', 'Concluído', 'Em Andamento', 'Concluído'], // Jun
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Jul
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Ago
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Set
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Out
    ['Concluído', 'Concluído', 'Em Andamento', 'Concluído', 'Concluído'], // Nov
    ['Concluído', 'Concluído', 'Concluído', 'Concluído', 'Concluído'], // Dez
  ];
  
  const statuses = statusOptions[mes - 1] || statusOptions[0];
  
  // Antecedência (0 a 2 dias) - determinística baseada no mês e índice da entrega
  const antecedenciasPorMes: number[][] = [
    [1, 1, 0, 1, 1], // Jan
    [1, 0, 1, 1, 0], // Fev
    [2, 1, 0, 1, 1], // Mar
    [0, 1, 1, 0, 1], // Abr
    [1, 1, 0, 1, 0], // Mai
    [1, 0, 1, 2, 1], // Jun
    [0, 1, 1, 1, 1], // Jul
    [1, 1, 0, 1, 1], // Ago
    [2, 1, 1, 0, 1], // Set
    [1, 0, 1, 1, 2], // Out
    [1, 1, 0, 1, 1], // Nov
    [2, 1, 1, 1, 0], // Dez
  ];
  
  const antecedencias = antecedenciasPorMes[mes - 1] || antecedenciasPorMes[0];
  let indiceAntecedencia = 0;
  const obterAntecedencia = (): number => {
    const valor = antecedencias[indiceAntecedencia % antecedencias.length];
    indiceAntecedencia++;
    return valor;
  };
  
  const entregas: Entrega[] = [
    {
      id: `ent-${mesReferencia}-1`,
      clienteId: '1',
      mesReferencia,
      atividade: 'Conciliações',
      dataPrevista: formatDate(ano, mes, diaConciliacoes),
      dataFinalizacao: formatDate(ano, mes, diaConciliacoes - obterAntecedencia()),
      status: statuses[0],
      observacoes: `Conciliação bancária realizada para ${lancamentosRealizados} lançamentos. Valores processados: R$ ${(lancamentosRealizados * 250).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: `ent-${mesReferencia}-2`,
      clienteId: '1',
      mesReferencia,
      atividade: 'Prestação de contas',
      dataPrevista: formatDate(ano, mes, diaPrestacao),
      dataFinalizacao: formatDate(ano, mes, diaPrestacao - obterAntecedencia()),
      status: statuses[1],
      observacoes: `Prestação de contas entregue para 15 condomínios. Destaque: Condomínio Theiss Heim Dona Anna com movimentação de R$ ${(lancamentosRealizados * 15).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: `ent-${mesReferencia}-3`,
      clienteId: '1',
      mesReferencia,
      atividade: 'Manutenções',
      dataPrevista: formatDate(ano, mes, diaManutencoes),
      dataFinalizacao: formatDate(ano, mes, diaManutencoes),
      status: statuses[2],
      observacoes: 'Manutenções preventivas realizadas nos sistemas de gestão. Atualizações aplicadas com sucesso.',
    },
    {
      id: `ent-${mesReferencia}-4`,
      clienteId: '1',
      mesReferencia,
      atividade: 'Lançamentos',
      dataPrevista: formatDate(ano, mes, diaLancamentos),
      dataFinalizacao: formatDate(ano, mes, diaLancamentos - obterAntecedencia()),
      status: statuses[3],
      observacoes: `${lancamentosRealizados} lançamentos realizados no período. Processamento de documentos e notas fiscais concluído.`,
    },
    {
      id: `ent-${mesReferencia}-5`,
      clienteId: '1',
      mesReferencia,
      atividade: 'Envio NF contabilidade',
      dataPrevista: formatDate(ano, mes, diaNF),
      dataFinalizacao: formatDate(ano, mes, diaNF - obterAntecedencia()),
      status: statuses[4],
      observacoes: 'Notas fiscais enviadas para contabilidade. Total de 45 documentos processados e organizados.',
    },
  ];
  
  return entregas;
}

// Função para gerar volume de trabalho
function gerarVolumeTrabalho(mes: number, lancamentosRealizados: number): VolumeTrabalho {
  const mesReferencia = `2025-${String(mes).padStart(2, '0')}`;
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const periodo = `${nomesMeses[mes - 1]}/2025`;
  
  // Valores proporcionais
  const documentosProcessados = Math.round(lancamentosRealizados * 1.98 + (mes * 2));
  const contasMovimentadas = Math.round(lancamentosRealizados * 0.28 + (mes * 1));
  const fornecedoresAtivos = 43 + Math.floor(mes / 2); // Varia de 43 a 48
  
  // Forecast: calcular proporcionalmente para outras administradoras
  const totalMarket = Math.round(lancamentosRealizados / 0.27); // Fênix representa ~27%
  const gestao = Math.round(totalMarket * 0.30);
  const planoconsult = Math.round(totalMarket * 0.23);
  const eifer = Math.round(totalMarket * 0.20);
  
  return {
    clienteId: '1',
    mesReferencia,
    lancamentosRealizados,
    documentosProcessados,
    contasMovimentadas,
    fornecedoresAtivos,
    forecastLancamentos: [
      { administradora: 'Fênix', quantidade: lancamentosRealizados, periodo },
      { administradora: 'Gestão', quantidade: gestao, periodo },
      { administradora: 'Plano Consult', quantidade: planoconsult, periodo },
      { administradora: 'Eifer', quantidade: eifer, periodo },
    ],
  };
}

// Função para gerar qualidade e controle
function gerarQualidadeControle(mes: number, lancamentosRealizados: number): QualidadeControle {
  const mesReferencia = `2025-${String(mes).padStart(2, '0')}`;
  
  // Erros variam entre 2 e 6 por mês (usar índice do mês para consistência)
  const errosPorMes = [3, 2, 4, 3, 2, 5, 4, 3, 2, 3, 4, 3];
  const errosIdentificados = errosPorMes[mes - 1] || 3;
  const percentualErros = parseFloat(((errosIdentificados / lancamentosRealizados) * 100).toFixed(2));
  
  // Origens de ajustes variadas (usar índice do mês para consistência)
  const origensAjustes = [
    { documentacaoIncompleta: true, informacoesDivergentes: false, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: false, informacoesDivergentes: true, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: true, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: false, informacoesDivergentes: false, ajustesSolicitados: true, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: false, ajustesSolicitados: true, outros: false },
    { documentacaoIncompleta: false, informacoesDivergentes: true, ajustesSolicitados: true, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: true, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: false, informacoesDivergentes: false, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: false, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: false, informacoesDivergentes: true, ajustesSolicitados: false, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: true, ajustesSolicitados: true, outros: false },
    { documentacaoIncompleta: true, informacoesDivergentes: false, ajustesSolicitados: true, outros: false },
  ];
  
  return {
    clienteId: '1',
    mesReferencia,
    errosIdentificados,
    percentualErros,
    correcoesRealizadas: true,
    origemAjustes: origensAjustes[mes - 1] || origensAjustes[0],
  };
}

// Função para gerar textos do relatório (variações mensais)
function gerarTextosRelatorio(mes: number, lancamentosRealizados: number, errosIdentificados: number, percentualErros: number): RelatorioTexto {
  const mesReferencia = `2025-${String(mes).padStart(2, '0')}`;
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const nomeMes = nomesMeses[mes - 1];
  
  // Arrays de variações para cada campo
  const melhoriasBase = [
    'Padronização do fluxo de conciliações bancárias',
    'Otimização do processo de prestação de contas',
    'Organização documental aprimorada',
    'Ajustes operacionais no sistema de lançamentos',
    'Automação parcial do envio de notas fiscais',
    'Implementação de checklist de qualidade',
    'Melhoria na comunicação com fornecedores',
    'Atualização de processos internos',
    'Treinamento da equipe em novas ferramentas',
    'Integração com sistemas de gestão',
  ];
  
  const demandasBase = [
    'Ajuste em lançamentos de fornecedor devido a documentação incompleta',
    'Divergência em informações de centro de custo',
    'Retificação de lançamento duplicado',
    'Alinhamento de classificações contábeis',
    'Correção de data de vencimento em boletos',
    'Ajuste de valores de fornecedor',
    'Revisão de conciliação bancária',
  ];
  
  const pontosRecorrentesBase = [
    'Necessidade de padronização na entrega de documentos pelos fornecedores',
    'Importância de manter comunicação proativa sobre prazos de entrega',
    'Melhoria na qualidade da documentação recebida',
    'Alineamento de processos entre equipes',
    'Acompanhamento mais frequente de pendências',
  ];
  
  // Selecionar variações únicas para o mês (usar índice do mês para consistência)
  // Criar uma função de shuffle determinística baseada no mês
  const shuffleDeterministico = <T>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const quantidadeMelhorias = [5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4];
  const quantidadeDemandas = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
  const quantidadePontosRecorrentes = [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2];
  
  const melhorias = shuffleDeterministico(melhoriasBase, mes).slice(0, quantidadeMelhorias[mes - 1] || 4);
  const demandas = shuffleDeterministico(demandasBase, mes).slice(0, quantidadeDemandas[mes - 1] || 1);
  const pontosRecorrentes = shuffleDeterministico(pontosRecorrentesBase, mes).slice(0, quantidadePontosRecorrentes[mes - 1] || 2);
  
  const resumoExecutivo = `No período de referência (${nomeMes}/2025), as rotinas financeiras foram executadas conforme o escopo contratado, com foco em organização, controle e cumprimento dos prazos acordados. Este relatório tem como objetivo apresentar de forma clara as entregas realizadas, os indicadores operacionais, melhorias implementadas e pontos relevantes para acompanhamento.

Durante o mês, foram processados ${lancamentosRealizados} lançamentos financeiros, com índice de qualidade de ${percentualErros.toFixed(2)}% de erros (${errosIdentificados} erros identificados), todos corrigidos no mesmo período. A movimentação financeira totalizou R$ ${(lancamentosRealizados * 280).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em processamento de documentos e notas fiscais dos condomínios administrados. Todas as entregas foram concluídas dentro ou antes dos prazos previstos, demonstrando eficiência operacional e comprometimento da equipe.

Destacamos o processamento dos condomínios Theiss Heim Dona Anna (Balneário Camboriú), Metropolis (Itajaí) e Vista do Mar (Florianópolis), que representaram aproximadamente 35% do volume total de lançamentos do período.`;

  const sufixosMelhorias = [
    'reduzindo tempo de processamento em 15%',
    'aumentando produtividade da equipe',
    'melhorando eficiência operacional',
    'facilitando localização e rastreabilidade',
    'permitindo entrega com antecedência',
    'otimizando fluxo de trabalho',
  ];
  
  const melhoriasImplementadas = `Durante o período, implementamos as seguintes melhorias:

${melhorias.map((m, i) => `• ${m}, ${sufixosMelhorias[i % sufixosMelhorias.length]}`).join('\n')}

Estas melhorias resultaram em ganhos de produtividade estimados em ${8 + mes}% comparado ao período anterior.`;

  // Horas de resolução determinísticas baseadas no mês e índice da demanda
  const horasResolucaoPorMes = [
    [24, 18], // Jan
    [12, 0, 20], // Fev (tem 2 demandas)
    [18, 24], // Mar
    [12, 0], // Abr
    [20, 0, 18], // Mai (tem 2 demandas)
    [24, 0], // Jun
    [12, 0, 22], // Jul (tem 2 demandas)
    [18, 0], // Ago
    [24, 0, 16], // Set (tem 2 demandas)
    [12, 0], // Out
    [20, 24], // Nov
    [18, 0, 20], // Dez (tem 2 demandas)
  ];
  
  const horasResolucao = horasResolucaoPorMes[mes - 1] || [12, 24];
  
  const demandasAtencaoEspecial = `Durante o período, identificamos ${demandas.length} ${demandas.length === 1 ? 'demanda' : 'demandas'} que ${demandas.length === 1 ? 'exigiu' : 'exigiram'} atenção especial:

${demandas.map((d, i) => `${i + 1}. ${d} - resolvido em ${horasResolucao[i] || 24}h`).join('\n')}

Todas as demandas foram resolvidas de forma ágil e eficiente, sem impacto nos prazos finais de entrega.`;

  const pontosRecorrentesTexto = `Identificamos como pontos recorrentes:

${pontosRecorrentes.map((p, i) => `• ${p}${i === pontosRecorrentes.length - 1 ? '.' : ','}`).join('\n')}

Estes pontos estão sendo acompanhados de forma proativa para minimizar sua recorrência.`;

  const pendenciasProximoPeriodo = `Para o próximo período, destacamos:

• Continuidade das melhorias implementadas neste mês
• Monitoramento dos pontos recorrentes identificados
• Implementação de novas melhorias baseadas em feedback do cliente
• Acompanhamento mais próximo dos fornecedores para padronização de documentos`;

  const feedbacksPositivos = `Recebemos feedbacks positivos do cliente sobre:

• Agilidade na prestação de contas e entrega de relatórios
• Qualidade e precisão dos lançamentos financeiros
• Comunicação proativa da equipe em questões relevantes
• Organização e transparência dos processos executados
• Resolução rápida de demandas que surgiram durante o período

Especial destaque para a síndica do Condomínio Theiss Heim Dona Anna, que elogiou a organização e clareza dos relatórios financeiros apresentados.`;

  const pontosAlinhamento = `Pontos de alinhamento identificados:

• Reunião mensal para alinhamento de processos (${nomeMes === 'Dezembro' ? 'agendada para janeiro' : 'agendada'})
• Ajuste em formato de relatórios conforme preferência do cliente
• Melhoria na comunicação sobre prazos e entregas
• ${nomeMes === 'Junho' || nomeMes === 'Dezembro' ? 'Revisão do escopo de serviços para o semestre' : 'Acompanhamento contínuo das demandas'}`;

  const recomendacoes = `Com base na análise do período, destacamos as seguintes recomendações e próximos passos:

1. Manter o ritmo atual de execução, que está ${mes >= 10 ? 'superando' : 'atendendo'} as expectativas estabelecidas
2. Continuar investindo em padronização de processos e automação
3. Implementar melhorias adicionais baseadas em feedback contínuo do cliente
4. Manter comunicação proativa sobre prazos, entregas e possíveis desafios
5. ${nomeMes === 'Novembro' || nomeMes === 'Dezembro' ? 'Preparação para o encerramento do ano fiscal' : 'Foco em manter a qualidade dos processos'}`;

  return {
    clienteId: '1',
    mesReferencia,
    resumoExecutivo,
    melhoriasImplementadas,
    demandasAtencaoEspecial,
    pontosRecorrentes: pontosRecorrentesTexto,
    pendenciasProximoPeriodo,
    feedbacksPositivos,
    pontosAlinhamento,
    recomendacoes,
    chamadosRelevantes: 1 + (mes % 3), // Varia entre 1 e 3 de forma determinística
  };
}

// ============================================================================
// FUNÇÃO PRINCIPAL: GET RELATÓRIO MENSAL
// ============================================================================

export function getRelatorioMensal(
  clienteId: string,
  mesReferencia: string
): RelatorioMensal | null {
  const cliente = domaCondoClientsMock.find(c => c.id === clienteId);
  if (!cliente) return null;

  // Apenas para Fênix (clienteId === '1') e meses de 2025
  if (clienteId !== '1' || !mesReferencia.startsWith('2025-')) {
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

  // Extrair mês de mesReferencia (formato: "2025-01")
  const mes = parseInt(mesReferencia.split('-')[1]);
  if (mes < 1 || mes > 12) return null;

  // Obter KPI do mês para usar os dados corretos
  const kpiMensal = fenixKPIs2025[mes - 1];
  if (!kpiMensal) return null;

  const lancamentosRealizados = kpiMensal.realizados;
  
  // Gerar dados do relatório
  const entregas = gerarEntregasMensais(mes, lancamentosRealizados);
  const volumeTrabalho = gerarVolumeTrabalho(mes, lancamentosRealizados);
  const qualidadeControle = gerarQualidadeControle(mes, lancamentosRealizados);
  const textos = gerarTextosRelatorio(
    mes,
    lancamentosRealizados,
    qualidadeControle.errosIdentificados,
    qualidadeControle.percentualErros
  );

  // Obter último dia do mês para data de emissão
  const ano = 2025;
  const ultimoDia = getLastDayOfMonth(ano, mes);
  const dataEmissao = formatDate(ano, mes, ultimoDia);

  return {
    cliente,
    mesReferencia,
    dataEmissao,
    entregas,
    volumeTrabalho,
    qualidadeControle,
    textos,
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
