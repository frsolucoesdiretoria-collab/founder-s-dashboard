// AXIS V3 — Diagnóstico Estratégico (12 perguntas)

import type { DiagnosticoV3Question } from '@/types/axis-v3';

export const diagnosticoV3Questions: DiagnosticoV3Question[] = [
  {
    id: 'q01',
    ordem: 1,
    categoria: 'aquisicao',
    pergunta: 'Quais canais sua empresa utiliza atualmente para captar novos clientes?',
    textoApoio: 'Identificar os pontos de entrada de leads é fundamental para entender onde está a dispersão e a necessidade de centralização.',
    opcoes: [
      'Site institucional com formulário',
      'WhatsApp Business',
      'Instagram / Redes Sociais',
      'Indicações / Networking',
      'Google Ads / Mídia Paga',
      'Prospecção ativa (cold call / e-mail)',
      'Eventos e feiras',
      'Parcerias comerciais'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Descreva como esses canais funcionam hoje e qual você considera mais efetivo (ou problemático)...',
      obrigatorio: true
    }
  },
  {
    id: 'q02',
    ordem: 2,
    categoria: 'aquisicao',
    pergunta: 'Qual o principal desafio na gestão dos leads que chegam à empresa?',
    textoApoio: 'Entender o gargalo inicial permite priorizar soluções que impactam a entrada do funil.',
    opcoes: [
      'Leads não são registrados de forma organizada',
      'Muitos leads frios ou desqualificados',
      'Demora no primeiro contato',
      'Leads duplicados ou perdidos entre canais',
      'Dificuldade em identificar leads prontos para comprar',
      'Falta de follow-up estruturado',
      'Não sabemos quantos leads realmente geramos'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Conte um exemplo recente de uma oportunidade que foi perdida ou mal gerenciada no início do processo...',
      obrigatorio: true
    }
  },
  {
    id: 'q03',
    ordem: 3,
    categoria: 'comercial',
    pergunta: 'Como funciona o processo comercial da empresa hoje?',
    textoApoio: 'Processos claros e documentados são a base de vendas previsíveis e escaláveis.',
    opcoes: [
      'Cada vendedor trabalha do seu jeito',
      'Temos um processo, mas não é seguido',
      'Usamos um CRM básico',
      'O processo está na cabeça do fundador',
      'Não temos processo definido',
      'Temos processo documentado e seguido pela equipe',
      'Vendas dependem muito de relacionamento pessoal'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Descreva como é o caminho de um lead desde a primeira conversa até o fechamento (ou perda)...',
      obrigatorio: true
    }
  },
  {
    id: 'q04',
    ordem: 4,
    categoria: 'comercial',
    pergunta: 'Qual a maior dificuldade do time comercial no dia a dia?',
    textoApoio: 'Identificar as barreiras operacionais ajuda a priorizar ferramentas que liberam tempo para vender.',
    opcoes: [
      'Perdem tempo criando propostas manualmente',
      'Não sabem quando fazer follow-up',
      'Dificuldade em encontrar informações do cliente',
      'Falta de clareza sobre próximos passos',
      'Não conseguem acompanhar todos os leads',
      'Ferramentas não conversam entre si',
      'Dependem do gestor para tomar decisões simples'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Se você pudesse resolver UMA coisa que trava o time comercial hoje, qual seria?',
      obrigatorio: true
    }
  },
  {
    id: 'q05',
    ordem: 5,
    categoria: 'comercial',
    pergunta: 'O que acontece com leads que não estão prontos para comprar agora?',
    textoApoio: 'A nutrição de leads é onde muitas empresas deixam dinheiro na mesa.',
    opcoes: [
      'São descartados',
      'Ficam esquecidos no CRM',
      'Recebem follow-up genérico ocasional',
      'Entram em uma lista de "retomar depois"',
      'Recebem conteúdo educativo periodicamente',
      'São reativados manualmente quando lembramos',
      'Não temos controle sobre eles'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Quantos leads "mornos" você estima que a empresa tem parados hoje? O que impede de reativá-los?',
      obrigatorio: true
    }
  },
  {
    id: 'q06',
    ordem: 6,
    categoria: 'comercial',
    pergunta: 'Como a empresa acompanha o pipeline e as oportunidades em aberto?',
    textoApoio: 'Visibilidade do funil é essencial para gestão comercial eficaz.',
    opcoes: [
      'Planilha Excel compartilhada',
      'CRM (mas subutilizado)',
      'Reuniões semanais de revisão',
      'Cada vendedor tem seu controle',
      'WhatsApp / E-mail',
      'Não temos acompanhamento formal',
      'Dashboard automatizado em tempo real'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Se eu pedisse agora o valor total do pipeline e a probabilidade de fechar este mês, você conseguiria me dar essa resposta com confiança?',
      obrigatorio: true
    }
  },
  {
    id: 'q07',
    ordem: 7,
    categoria: 'gestao',
    pergunta: 'Quais indicadores comerciais a empresa acompanha regularmente?',
    textoApoio: 'Métricas corretas orientam decisões estratégicas e identificam pontos de melhoria.',
    opcoes: [
      'Faturamento mensal',
      'Número de vendas fechadas',
      'Taxa de conversão do funil',
      'Ticket médio',
      'Tempo médio de fechamento',
      'Custo de Aquisição de Cliente (CAC)',
      'Taxa de perda e motivos',
      'Performance individual dos vendedores',
      'Não acompanhamos indicadores formalmente'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Qual indicador você gostaria de acompanhar, mas hoje não consegue medir de forma confiável?',
      obrigatorio: true
    }
  },
  {
    id: 'q08',
    ordem: 8,
    categoria: 'gestao',
    pergunta: 'A empresa consegue prever a receita dos próximos 3 meses com precisão?',
    textoApoio: 'Previsibilidade é o que separa empresas que sobrevivem de empresas que escalam.',
    opcoes: [
      'Sim, com alta precisão',
      'Conseguimos uma estimativa razoável',
      'Tentamos, mas erramos bastante',
      'Só sabemos o que está confirmado',
      'Não temos previsibilidade nenhuma',
      'Dependemos muito de sazonalidade',
      'Cada mês é uma surpresa (boa ou ruim)'
    ],
    permitirMultiplo: false,
    campoAberto: {
      placeholder: 'O que te impede de ter mais previsibilidade no negócio hoje?',
      obrigatorio: true
    }
  },
  {
    id: 'q09',
    ordem: 9,
    categoria: 'gestao',
    pergunta: 'Qual o nível de dependência operacional que a empresa tem do fundador?',
    textoApoio: 'A escalabilidade real só acontece quando o negócio funciona sem o fundador no operacional.',
    opcoes: [
      'O fundador fecha todas (ou a maioria) das vendas',
      'A equipe depende dele para decisões do dia a dia',
      'Ele é procurado para resolver problemas constantemente',
      'O fundador está mais na estratégia que no operacional',
      'A empresa funciona bem sem a presença dele',
      'Ele gostaria de sair do operacional, mas não consegue'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Se o fundador tirasse 30 dias de férias totais (sem celular), o que aconteceria com a operação comercial?',
      obrigatorio: true
    }
  },
  {
    id: 'q10',
    ordem: 10,
    categoria: 'tecnologia',
    pergunta: 'Quais ferramentas de gestão comercial/CRM a empresa utiliza hoje?',
    textoApoio: 'Entender o stack atual ajuda a identificar gaps, redundâncias e oportunidades de integração.',
    opcoes: [
      'Nenhuma ferramenta formal',
      'Planilhas Excel/Google Sheets',
      'RD Station / HubSpot',
      'Pipedrive / Moskit',
      'Salesforce',
      'Bling / Omie / ERP',
      'WhatsApp Business API',
      'Ferramentas próprias desenvolvidas internamente',
      'Várias ferramentas que não conversam entre si'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Qual a principal frustração com as ferramentas que vocês usam hoje (ou a falta delas)?',
      obrigatorio: true
    }
  },
  {
    id: 'q11',
    ordem: 11,
    categoria: 'tecnologia',
    pergunta: 'Quanto tempo a equipe gasta em tarefas manuais repetitivas?',
    textoApoio: 'Automação não é luxo. É o que permite escalar sem aumentar custo proporcionalmente.',
    opcoes: [
      'Menos de 5 horas por semana',
      '5 a 10 horas por semana',
      '10 a 20 horas por semana',
      'Mais de 20 horas por semana',
      'Praticamente todo o tempo é operacional',
      'Não temos dimensão clara disso'
    ],
    permitirMultiplo: false,
    campoAberto: {
      placeholder: 'Liste 3 tarefas manuais que, se automatizadas, fariam diferença imediata no dia a dia da equipe...',
      obrigatorio: true
    }
  },
  {
    id: 'q12',
    ordem: 12,
    categoria: 'gestao',
    pergunta: 'Qual o principal objetivo estratégico da empresa para os próximos 12 meses?',
    textoApoio: 'Tecnologia existe para viabilizar estratégia. Precisamos alinhar ferramentas com onde a empresa quer chegar.',
    opcoes: [
      'Aumentar faturamento',
      'Melhorar margem e lucratividade',
      'Escalar a operação comercial',
      'Reduzir dependência do fundador',
      'Estruturar processos',
      'Melhorar previsibilidade',
      'Entrar em novos mercados',
      'Profissionalizar a gestão',
      'Preparar a empresa para venda ou investimento'
    ],
    permitirMultiplo: true,
    campoAberto: {
      placeholder: 'Descreva em uma frase: se daqui a 12 meses essa área comercial/tecnológica estivesse resolvida, como seria?',
      obrigatorio: true
    }
  }
];

export function getDiagnosticoV3Questions(): DiagnosticoV3Question[] {
  return [...diagnosticoV3Questions];
}

export function getDiagnosticoV3QuestionById(id: string): DiagnosticoV3Question | undefined {
  return diagnosticoV3Questions.find(q => q.id === id);
}

export function getDiagnosticoV3QuestionsByCategoria(categoria: DiagnosticoV3Question['categoria']): DiagnosticoV3Question[] {
  return diagnosticoV3Questions.filter(q => q.categoria === categoria);
}

