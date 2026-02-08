'use client'

import { ApresentacaoBase, ApresentacaoContent } from './ApresentacaoBase'

const content: ApresentacaoContent = {
  slug: 'apresentacao-03',
  hero: {
    titleLine1: 'As empresas que vencem já operam no futuro.',
    titleLine2: 'Decidem com dados, executam com sistema, crescem com controle.',
    subtitle:
      'Visão de dono, processos claros e tecnologia invisível sustentando cada decisão. Não é tendência. É direção inevitável.',
  },
  urgency: {
    title: 'A nova diferença competitiva',
    description: 'O mercado não separa quem trabalha mais, separa quem decide melhor. Tecnologia deixou de ser diferencial e virou infraestrutura.',
    items: [
      'Decisão > ferramenta. Sistema > esforço. Clareza > volume.',
      'Quem não constrói arquitetura vira mão de obra do próprio negócio.',
      'Axis não reage ao problema. Axis antecipa o futuro.',
    ],
  },
  whyNow: {
    title: 'Momento de consciência',
    items: [
      'Onde sua empresa está hoje?',
      'Quanto ela depende de você para tudo andar?',
      'Suas decisões estão claras ou são reativas?',
      'Sem acusar, sem drama: é reflexão de maturidade.',
    ],
  },
  howOperate: {
    title: 'A dor, no meio da história',
    items: [
      'Muito esforço, pouco controle.',
      'Crescer aumenta o caos, não o domínio.',
      'Tecnologia soa como promessa confusa.',
      'Marketing vira aposta. Decidir vira cansaço.',
      'A dor não nasce da falta de vontade, mas da falta de arquitetura.',
    ],
  },
  firstWeek: {
    title: 'O erro comum',
    items: [
      'Responder com mais anúncios, mais pessoas, mais ferramentas.',
      'Sem direção, ferramentas viram custo.',
      'Sem direção, pessoas geram ruído.',
      'Sem direção, o crescimento trava.',
    ],
  },
  techGrowth: {
    title: 'A virada estratégica',
    description: 'Antes de escalar, responda: onde exatamente a tecnologia deve entrar para gerar clareza, controle e avanço real?',
    items: [
      'Essa resposta não vem de ferramenta. Vem de método.',
      'É a arquitetura certa que transforma decisão em execução confiável.',
      'Sem hype, sem promessa vazia: critério e ritmo.',
    ],
  },
  techEfficiency: {
    title: 'Axis — a solução natural',
    description: 'Arquitetura de decisão, execução guiada e tecnologia aplicada com critério.',
    items: [
      'Diagnostica onde a tecnologia muda o jogo.',
      'Direciona o que fazer, em que ordem, e o que não fazer agora.',
      'Acompanha semanalmente para manter clareza e controle.',
      'Ajusta com base em dados, não em sensação.',
    ],
  },
  differential: {
    title: 'O que a Axis entrega',
    description: 'Entregáveis com foco em clareza, direção e controle.',
    items: [
      'Diagnóstico estratégico.',
      'Plano de ação claro.',
      'Dashboard de evolução.',
      'Acompanhamento semanal.',
      'Ajustes estratégicos contínuos.',
    ],
  },
  proof: {
    title: 'Para quem é (e para quem não é)',
    items: [
      'É para empresas que pensam no futuro e querem decidir melhor.',
      'É para donos que querem clareza antes de investir mais.',
      'Não é para quem busca atalho ou quer terceirizar responsabilidade.',
      'Não é para quem prefere volume a direção.',
    ],
  },
  ctaFinal: {
    title: 'Conversa. Diagnóstico. Decisão consciente.',
    description: 'Um convite calmo e confiante para olhar o futuro do seu negócio com arquitetura, não com improviso.',
  },
  accent: {
    from: 'from-slate-50',
    to: 'to-indigo-400',
    glowA: 'bg-slate-300/20',
    glowB: 'bg-indigo-400/20',
  },
}

export default function Apresentacao03Page() {
  return <ApresentacaoBase content={content} />
}

