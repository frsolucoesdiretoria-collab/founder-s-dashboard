// AXIS V3 — Portfólio de Produtos de Tecnologia (20 produtos estratégicos)

import type { ProdutoTechV3 } from '@/types/axis-v3';

export const produtosTechV3: ProdutoTechV3[] = [
  // ==========================================
  // BLOCO 1: AQUISIÇÃO & TOPO DE FUNIL (4)
  // ==========================================
  {
    id: 'aq-01',
    categoria: 'aquisicao',
    produto: 'Sistema de Captura Multicanal',
    dorEstrategica: 'Leads chegam por WhatsApp, Instagram, site e formulários, mas a empresa perde contatos por falta de centralização',
    icp: 'Empresas B2B ou B2C com ticket médio acima de R$ 3.000 e múltiplos canais de entrada',
    comoSoluciona: 'Centraliza todos os pontos de contato em uma única plataforma, com registro automático, classificação inteligente e distribuição imediata para o time comercial',
    investimentoMedio: 'R$ 12.000 a R$ 35.000',
    impactoEsperado: 'Redução de 70% na perda de leads e aumento de 40% na taxa de primeiro contato'
  },
  {
    id: 'aq-02',
    categoria: 'aquisicao',
    produto: 'Motor de Qualificação Automática (Lead Scoring)',
    dorEstrategica: 'O time comercial perde tempo com leads frios enquanto oportunidades quentes esfriam na fila',
    icp: 'Empresas com mais de 100 leads mensais e ciclo de venda estruturado',
    comoSoluciona: 'Algoritmo proprietário analisa perfil, comportamento e timing do lead, atribuindo score de prontidão de compra e priorizando automaticamente o pipeline',
    investimentoMedio: 'R$ 18.000 a R$ 45.000',
    impactoEsperado: 'Aumento de 3x na taxa de conversão de lead para oportunidade qualificada'
  },
  {
    id: 'aq-03',
    categoria: 'aquisicao',
    produto: 'Jornada de Nutrição Inteligente',
    dorEstrategica: 'Leads que não estão prontos para comprar são abandonados ou recebem follow-up genérico e ineficaz',
    icp: 'Empresas com ciclo de venda acima de 30 dias e necessidade de educação do mercado',
    comoSoluciona: 'Sequências automatizadas e personalizadas por perfil de ICP, entregando conteúdo estratégico via e-mail, WhatsApp e notificações, com triggers baseados em comportamento',
    investimentoMedio: 'R$ 15.000 a R$ 40.000',
    impactoEsperado: 'Recuperação de 25% dos leads inativos e redução de 50% no tempo de maturação'
  },
  {
    id: 'aq-04',
    categoria: 'aquisicao',
    produto: 'Rastreamento de Origem e ROI por Canal',
    dorEstrategica: 'A empresa investe em marketing sem saber qual canal realmente traz clientes que fecham e geram lucro',
    icp: 'Empresas que investem acima de R$ 10.000/mês em marketing digital ou mídia paga',
    comoSoluciona: 'Rastreamento de ponta a ponta desde o primeiro clique até o fechamento, com análise de CAC, LTV e ROI real por origem, campanha e criativo',
    investimentoMedio: 'R$ 20.000 a R$ 55.000',
    impactoEsperado: 'Corte de 40% em canais improdutivos e aumento de 2x no ROI de marketing'
  },

  // ==========================================
  // BLOCO 2: FUNIL & PROCESSO COMERCIAL (4)
  // ==========================================
  {
    id: 'fn-01',
    categoria: 'funil',
    produto: 'Pipeline Comercial Estruturado',
    dorEstrategica: 'O processo de vendas vive na cabeça dos vendedores, gerando imprevisibilidade, dependência e perda de negócios',
    icp: 'Empresas com 2 ou mais vendedores e ticket acima de R$ 5.000',
    comoSoluciona: 'Implementação de CRM personalizado com etapas claras, critérios de avanço obrigatórios, automações de follow-up e visibilidade total do funil para gestão',
    investimentoMedio: 'R$ 22.000 a R$ 65.000',
    impactoEsperado: 'Redução de 60% no tempo de fechamento e aumento de 35% na taxa de conversão'
  },
  {
    id: 'fn-02',
    categoria: 'funil',
    produto: 'Automação de Follow-up Recorrente',
    dorEstrategica: 'Oportunidades morrem por falta de follow-up ou por abordagem manual inconsistente e não rastreável',
    icp: 'Empresas que perdem negócios por "falta de retorno" ou follow-up irregular',
    comoSoluciona: 'Sistema de lembretes inteligentes, sequências automáticas de reengajamento por canal preferencial do cliente, e alertas de inatividade crítica com sugestão de próxima ação',
    investimentoMedio: 'R$ 12.000 a R$ 30.000',
    impactoEsperado: 'Recuperação de 20% das oportunidades perdidas e aumento de 50% na consistência de follow-up'
  },
  {
    id: 'fn-03',
    categoria: 'funil',
    produto: 'Central de Propostas Automatizadas',
    dorEstrategica: 'Vendedores gastam horas criando propostas manualmente, com erros de cálculo e tempo perdido em planilhas',
    icp: 'Empresas com propostas complexas, customizadas ou de alta frequência',
    comoSoluciona: 'Gerador automatizado de propostas com templates profissionais, cálculos dinâmicos, integração com CRM e rastreamento de visualização e interação do cliente',
    investimentoMedio: 'R$ 18.000 a R$ 50.000',
    impactoEsperado: 'Redução de 80% no tempo de criação de proposta e aumento de 25% na taxa de aceite'
  },
  {
    id: 'fn-04',
    categoria: 'funil',
    produto: 'Playbook Comercial Digital',
    dorEstrategica: 'Novos vendedores demoram meses para performar e o conhecimento comercial da empresa está disperso ou na cabeça do fundador',
    icp: 'Empresas em crescimento ou com alta rotatividade de vendedores',
    comoSoluciona: 'Plataforma de onboarding e treinamento contínuo com scripts, objeções, cases, ferramentas e metodologia de vendas acessível 24/7, com tracking de evolução',
    investimentoMedio: 'R$ 25.000 a R$ 70.000',
    impactoEsperado: 'Redução de 60% no tempo de ramp-up e aumento de 40% na performance de novos vendedores'
  },

  // ==========================================
  // BLOCO 3: CONVERSÃO & FECHAMENTO (4)
  // ==========================================
  {
    id: 'cv-01',
    categoria: 'conversao',
    produto: 'Sala de Fechamento Virtual',
    dorEstrategica: 'O cliente precisa de várias reuniões e aprovações internas, mas perde contexto entre encontros e o negócio esfria',
    icp: 'Vendas B2B com múltiplos decisores e ciclo de aprovação interno no cliente',
    comoSoluciona: 'Ambiente digital colaborativo onde o cliente acessa proposta, gravações, materiais de suporte, tira dúvidas assíncronas e compartilha com decisores, mantendo calor no negócio',
    investimentoMedio: 'R$ 16.000 a R$ 42.000',
    impactoEsperado: 'Aumento de 30% na taxa de fechamento em vendas complexas e redução de 40% no ciclo'
  },
  {
    id: 'cv-02',
    categoria: 'conversao',
    produto: 'Análise de Objeções e Padrões de Perda',
    dorEstrategica: 'A empresa perde negócios, mas não sabe exatamente por quê, repetindo os mesmos erros mês após mês',
    icp: 'Empresas com histórico de pelo menos 50 negociações mensais',
    comoSoluciona: 'BI avançado que identifica padrões de perda, objeções recorrentes, pontos de travamento no funil e gargalos por vendedor, região ou produto, gerando planos de ação',
    investimentoMedio: 'R$ 28.000 a R$ 75.000',
    impactoEsperado: 'Identificação de 5 a 10 pontos críticos de melhoria e aumento de 20% na conversão'
  },
  {
    id: 'cv-03',
    categoria: 'conversao',
    produto: 'Motor de Upsell e Cross-sell',
    dorEstrategica: 'A empresa vende apenas o produto básico, deixando dinheiro na mesa por não oferecer soluções complementares',
    icp: 'Empresas com mais de 3 produtos/serviços e base ativa de clientes',
    comoSoluciona: 'Inteligência que identifica oportunidades de expansão de conta baseada em perfil, histórico e timing, com sugestões automáticas e scripts prontos para oferta',
    investimentoMedio: 'R$ 20.000 a R$ 55.000',
    impactoEsperado: 'Aumento de 40% no ticket médio e 30% na receita sem novos clientes'
  },
  {
    id: 'cv-04',
    categoria: 'conversao',
    produto: 'Contrato e Assinatura Digital',
    dorEstrategica: 'O negócio fecha, mas o cliente demora dias para assinar contrato ou se perde na burocracia, esfriando o momento',
    icp: 'Empresas com contratos formais e necessidade de agilidade no fechamento',
    comoSoluciona: 'Plataforma de geração, envio e assinatura eletrônica integrada ao CRM, com notificações, rastreamento e arquivamento automático com validade jurídica',
    investimentoMedio: 'R$ 8.000 a R$ 22.000',
    impactoEsperado: 'Redução de 70% no tempo entre aceite e assinatura formal'
  },

  // ==========================================
  // BLOCO 4: GESTÃO & DECISÃO (4)
  // ==========================================
  {
    id: 'gs-01',
    categoria: 'gestao',
    produto: 'Cockpit Executivo em Tempo Real',
    dorEstrategica: 'O fundador ou gestor não tem visibilidade clara dos números que importam, tomando decisões baseadas em sensação',
    icp: 'Fundadores e diretores que precisam de visão consolidada do negócio',
    comoSoluciona: 'Dashboard executivo com KPIs críticos do negócio em tempo real: receita, pipeline, CAC, LTV, churn, produtividade por vendedor, forecast e alertas de desvio',
    investimentoMedio: 'R$ 30.000 a R$ 85.000',
    impactoEsperado: 'Redução de 50% no tempo de análise e tomada de decisão baseada em dados reais'
  },
  {
    id: 'gs-02',
    categoria: 'gestao',
    produto: 'Motor de Previsibilidade de Receita',
    dorEstrategica: 'A empresa não consegue prever receita dos próximos meses, gerando ansiedade, decisões erradas de contratação e investimento',
    icp: 'Empresas com pipeline estruturado e histórico de vendas de pelo menos 6 meses',
    comoSoluciona: 'Algoritmo de forecasting que combina dados históricos, pipeline atual, sazonalidade e performance individual para projetar receita com precisão por período',
    investimentoMedio: 'R$ 35.000 a R$ 90.000',
    impactoEsperado: 'Previsibilidade de receita com margem de erro inferior a 15% e planejamento financeiro confiável'
  },
  {
    id: 'gs-03',
    categoria: 'gestao',
    produto: 'Sistema de Metas e Performance Individual',
    dorEstrategica: 'Vendedores trabalham sem clareza de meta, sem visibilidade de performance e sem reconhecimento estruturado',
    icp: 'Empresas com equipe comercial de 3 ou mais pessoas',
    comoSoluciona: 'Plataforma de gestão de metas com acompanhamento diário, gamificação, ranking, alertas de desvio e sistema de bonificação automático integrado ao financeiro',
    investimentoMedio: 'R$ 18.000 a R$ 48.000',
    impactoEsperado: 'Aumento de 25% na performance média da equipe e redução de 40% no turnover'
  },
  {
    id: 'gs-04',
    categoria: 'gestao',
    produto: 'Central de Inteligência Competitiva',
    dorEstrategica: 'A empresa perde negócios para concorrentes, mas não monitora o que eles fazem, como vendem e por que ganham',
    icp: 'Empresas em mercados competitivos com 3 ou mais concorrentes diretos',
    comoSoluciona: 'Plataforma de coleta e análise de inteligência de mercado: preços, diferenciais, cases, objeções, posicionamento e insights acionáveis para vendas e produto',
    investimentoMedio: 'R$ 22.000 a R$ 60.000',
    impactoEsperado: 'Aumento de 20% na taxa de vitória contra concorrência direta'
  },

  // ==========================================
  // BLOCO 5: ESCALA & EFICIÊNCIA (4)
  // ==========================================
  {
    id: 'es-01',
    categoria: 'escala',
    produto: 'Estrutura de Vendas Escalável',
    dorEstrategica: 'A empresa quer crescer, mas não consegue contratar e escalar vendedores sem perder qualidade, controle e margem',
    icp: 'Empresas que querem dobrar ou triplicar a operação comercial em 12 meses',
    comoSoluciona: 'Implementação completa de processos, tecnologia, KPIs, playbooks, onboarding e governança para suportar crescimento acelerado sem dependência do fundador',
    investimentoMedio: 'R$ 50.000 a R$ 150.000',
    impactoEsperado: 'Estrutura pronta para escalar de 3x a 10x sem aumento proporcional de custo operacional'
  },
  {
    id: 'es-02',
    categoria: 'escala',
    produto: 'Automação de Processos Operacionais',
    dorEstrategica: 'A equipe gasta horas em tarefas manuais repetitivas: relatórios, cadastros, integrações, atualizações',
    icp: 'Empresas com processos recorrentes que consomem mais de 10 horas/semana da equipe',
    comoSoluciona: 'Mapeamento e automação de workflows críticos usando RPA, integrações via API e orquestração inteligente, liberando tempo para atividades estratégicas',
    investimentoMedio: 'R$ 25.000 a R$ 70.000',
    impactoEsperado: 'Redução de 60% no tempo gasto em tarefas operacionais e eliminação de erros manuais'
  },
  {
    id: 'es-03',
    categoria: 'escala',
    produto: 'Ecossistema Integrado de Ferramentas',
    dorEstrategica: 'A empresa usa 10 ferramentas que não conversam entre si, gerando retrabalho, dados duplicados e perda de informação',
    icp: 'Empresas com mais de 5 sistemas diferentes (CRM, ERP, marketing, financeiro, etc.)',
    comoSoluciona: 'Arquitetura de integração via APIs e middleware que conecta todos os sistemas, garantindo fluxo de dados unificado e visão 360º do negócio',
    investimentoMedio: 'R$ 35.000 a R$ 95.000',
    impactoEsperado: 'Redução de 70% no retrabalho e ganho de 40% na produtividade operacional'
  },
  {
    id: 'es-04',
    categoria: 'escala',
    produto: 'Redução de Dependência do Fundador',
    dorEstrategica: 'O fundador é o gargalo: fecha vendas, resolve problemas, toma decisões, e a empresa não funciona sem ele',
    icp: 'Fundadores que trabalham mais de 60h/semana e são procurados para tudo',
    comoSoluciona: 'Programa estruturado de documentação, delegação, automação e transferência de conhecimento crítico, com implementação de sistemas de decisão autônoma',
    investimentoMedio: 'R$ 40.000 a R$ 120.000',
    impactoEsperado: 'Redução de 70% no tempo de envolvimento operacional do fundador em 6 meses'
  }
];

export function getProdutosTechV3ByCategoria(categoria: ProdutoTechV3['categoria']): ProdutoTechV3[] {
  return produtosTechV3.filter(p => p.categoria === categoria);
}

export function getProdutoTechV3ById(id: string): ProdutoTechV3 | undefined {
  return produtosTechV3.find(p => p.id === id);
}

export function getAllProdutosTechV3(): ProdutoTechV3[] {
  return [...produtosTechV3];
}

