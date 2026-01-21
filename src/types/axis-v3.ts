// AXIS V3 — Types

export interface ProdutoTechV3 {
  id: string;
  categoria: 'aquisicao' | 'funil' | 'conversao' | 'gestao' | 'escala';
  produto: string;
  dorEstrategica: string;
  icp: string;
  comoSoluciona: string;
  investimentoMedio: string;
  impactoEsperado: string;
}

export interface DiagnosticoV3Question {
  id: string;
  ordem: number;
  categoria: 'aquisicao' | 'comercial' | 'gestao' | 'tecnologia';
  pergunta: string;
  textoApoio: string;
  opcoes: string[];
  permitirMultiplo: boolean;
  campoAberto: {
    placeholder: string;
    obrigatorio: boolean;
  };
}

export interface DiagnosticoV3Response {
  questionId: string;
  opcoesSelecionadas: string[];
  respostaAberta: string;
}

export interface DiagnosticoV3Session {
  id: string;
  empresaNome: string;
  empresaSegmento: string;
  contato: {
    nome: string;
    email: string;
    telefone: string;
  };
  dataInicio: Date;
  dataFinalizacao?: Date;
  respostas: DiagnosticoV3Response[];
  status: 'em_andamento' | 'finalizado' | 'proposta_gerada';
  produtosSugeridos?: string[]; // IDs dos produtos
  scoreDiagnostico?: number; // 0-100
}

export interface PropostaV3 {
  id: string;
  diagnosticoId: string;
  empresaNome: string;
  dataGeracao: Date;
  produtos: ProdutoTechV3[];
  investimentoTotal: number;
  prazoImplementacao: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'negociacao';
}

