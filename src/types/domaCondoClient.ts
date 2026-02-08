// DOMA CONDO - Client Portal Types

export interface DomaCondoClient {
  id: string;
  name: string;
  email: string;
  login: string;
  passwordHash?: string; // Apenas no backend
  createdAt: string;
  active: boolean;
}

export interface DomaCondoClientAuth {
  login: string;
  password: string;
}

export interface DomaCondoClientToken {
  token: string;
  cliente: DomaCondoClient;
}

// Seção 2: Entregas e Prazos
export type TipoAtividade = 
  | 'Conciliações' 
  | 'Prestação de contas' 
  | 'Manutenções' 
  | 'Lançamentos' 
  | 'Envio NF contabilidade';

export type StatusEntrega = 
  | 'Concluído' 
  | 'Em Andamento' 
  | 'Pendente' 
  | 'Atrasado';

export interface Entrega {
  id: string;
  clienteId: string;
  mesReferencia: string; // "2025-01"
  atividade: TipoAtividade;
  dataPrevista: string; // ISO date
  dataFinalizacao: string | null; // ISO date ou null
  status: StatusEntrega;
  observacoes?: string;
}

// Seção 3: Volume de Trabalho
export interface ForecastItem {
  administradora: string;
  quantidade: number;
  periodo: string;
}

export interface VolumeTrabalho {
  clienteId: string;
  mesReferencia: string;
  lancamentosRealizados: number;
  documentosProcessados: number;
  contasMovimentadas: number;
  fornecedoresAtivos: number;
  forecastLancamentos: ForecastItem[];
}

// Seção 4: Qualidade e Controle
export interface QualidadeControle {
  clienteId: string;
  mesReferencia: string;
  errosIdentificados: number;
  percentualErros: number;
  correcoesRealizadas: boolean;
  origemAjustes: {
    documentacaoIncompleta: boolean;
    informacoesDivergentes: boolean;
    ajustesSolicitados: boolean;
    outros: boolean;
    outrosDescricao?: string;
  };
}

// Seção 5-9: Textos Livres
export interface RelatorioTexto {
  clienteId: string;
  mesReferencia: string;
  resumoExecutivo: string;
  melhoriasImplementadas: string;
  demandasAtencaoEspecial: string;
  pontosRecorrentes: string;
  pendenciasProximoPeriodo: string;
  feedbacksPositivos: string;
  pontosAlinhamento: string;
  recomendacoes: string;
  chamadosRelevantes: number;
}

// Relatório Completo
export interface RelatorioMensal {
  cliente: DomaCondoClient;
  mesReferencia: string;
  dataEmissao: string;
  entregas: Entrega[];
  volumeTrabalho: VolumeTrabalho;
  qualidadeControle: QualidadeControle;
  textos: RelatorioTexto;
}

// Filtros
export interface RelatorioFilters {
  mesReferencia?: string;
  status?: StatusEntrega;
  atividade?: TipoAtividade;
}







