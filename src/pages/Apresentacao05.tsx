'use client'

import { ApresentacaoBase, ApresentacaoContent } from './ApresentacaoBase'

const content: ApresentacaoContent = {
  slug: 'apresentacao-05',
  hero: {
    titleLine1: 'Clareza estratégica imediata',
    titleLine2: 'decisão guiada, execução acompanhada',
    subtitle:
      'Entramos, diagnosticamos, priorizamos e colocamos o plano em movimento com você. Sem hype: decisão melhor, avanço semanal e tecnologia plugada onde gera resultado.',
  },
  urgency: {
    title: 'Você já tem uma empresa viva — precisa de sistema para avançar',
    description:
      'Trocamos improviso por método. Você ganha um mapa claro, governança semanal e indicadores simples para decidir rápido.',
    items: [
      'Sair de “tudo depende do dono” para um ciclo de decisão que o time consegue seguir.',
      'Escolher onde tecnologia entra para acelerar receita ou reduzir custo, sem desperdício.',
      'Garantir cadência semanal: prioriza, executa, mede, ajusta — sempre em ciclo curto.',
    ],
  },
  whyNow: {
    title: 'O ponto de virada',
    items: [
      'Não é sobre fazer mais marketing ou contratar mais gente: é sobre decidir com método.',
      'Ferramenta sem estratégia vira custo; estratégia sem acompanhamento morre na agenda.',
      'Responder à pergunta certa: onde exatamente a tecnologia entra no MEU negócio agora para destravar resultado?',
    ],
  },
  howOperate: {
    title: 'O projeto, de ponta a ponta',
    items: [
      'Diagnóstico estratégico completo para mapear gargalos de receita e custo.',
      'Plano de Ação Claro (PDA) com prioridades, o que fazer e o que não fazer, impacto esperado e responsáveis.',
      'Dashboard visual e simples para acompanhar evolução do plano e decidir sem ruído.',
      'Reuniões semanais de acompanhamento para revisar, ajustar rota e garantir entrega real.',
    ],
  },
  firstWeek: {
    title: 'O que você recebe',
    items: [
      'Diagnóstico + PDA: caminho priorizado, critérios de decisão e impactos esperados.',
      'Dashboard de evolução: métrica enxuta, orientada a decisão, atualizada semanalmente.',
      'Acompanhamento semanal: revisão de execução, ajustes estratégicos e táticos, sem dispersão.',
      'Suporte de implementação: onde plugar tecnologia para ganhar velocidade ou eficiência já na primeira sprint.',
    ],
  },
  techGrowth: {
    title: 'Clareza que vira controle',
    description: 'Decisão informada, prioridades protegidas e visibilidade contínua.',
    items: [
      'Matriz de decisão: priorize o que move receita ou reduz custo, com trade-offs explícitos.',
      'Radar de gargalos: receita, eficiência, riscos — sempre visíveis no dashboard.',
      'Alertas simples para não deixar tarefas, follow-ups e entregas pararem.',
    ],
  },
  techEfficiency: {
    title: 'Execução guiada, sem ruído',
    description: 'Tecnologia como meio: automatizar o que destrava tempo, disciplinar o que sustenta escala.',
    items: [
      'Processos enxutos com donos, prazos e critérios de aceite claros.',
      'Automação onde corta retrabalho ou libera horas do dono e do time.',
      'Rituais semanais para corrigir rápido antes que o problema escale.',
    ],
  },
  differential: {
    title: 'Por que funciona',
    description: 'Não vendemos software solto nem teoria. É método + decisão + execução acompanhada.',
    items: [
      'A maioria dos gargalos é decisão mal informada; resolvemos com dados e priorização.',
      'Execução sem acompanhamento falha; aqui cada semana tem revisão e ajuste.',
      'O dono não recebe mais tarefas: recebe um sistema que o time consegue seguir.',
    ],
  },
  proof: {
    title: 'É para quem quer decidir melhor',
    items: [
      'Para empresas que já faturam e precisam de clareza para o próximo salto.',
      'Para quem valoriza controle, cadência e avanço semanal visível.',
      'Não é para quem busca fórmula mágica ou solução barata.',
    ],
  },
  ctaFinal: {
    title: 'Vamos colocar clareza e execução em movimento',
    description:
      'Agendamos uma conversa, apresentamos o diagnóstico inicial e definimos juntos a primeira decisão do plano.',
  },
  accent: {
    from: 'from-amber-400',
    to: 'to-rose-500',
    glowA: 'bg-amber-400/20',
    glowB: 'bg-rose-500/20',
  },
}

export default function Apresentacao05Page() {
  return <ApresentacaoBase content={content} />
}