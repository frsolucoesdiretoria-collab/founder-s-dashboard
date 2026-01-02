// FR Tech OS - Produtos Types

export interface Produto {
  id: string;
  nome: string;
  status: 'Ativo' | 'Ideia' | 'Pausado' | 'Morto';
  problemaQueResolve: string;
  precoMinimo: number;
  precoIdeal: number;
  tipo: string;
  tempoMedioEntrega: number; // dias
  dependenciaFundador: 'Alta' | 'Média' | 'Baixa';
  replicabilidade: 'Alta' | 'Média' | 'Baixa';
  prioridadeEstrategica: number; // 1-10
}





