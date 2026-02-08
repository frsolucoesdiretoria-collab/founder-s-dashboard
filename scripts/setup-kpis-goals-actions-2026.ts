/**
 * Script para configurar KPIs, Goals e Actions para 2026
 * 
 * Este script executa os 3 passos:
 * 1. Cria 18 KPIs e 18 Metas no Notion
 * 2. Obtém os IDs das metas necessárias
 * 3. Cria 30 tarefas relacionadas às metas
 * 
 * ⚠️ INSTRUÇÃO CRÍTICA: Este script executa TODAS as tarefas. Não pula nenhuma etapa.
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/setup-kpis-goals-actions-2026.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente de .env.local se existir
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createKPI, createGoal, initNotionClient } from '../server/lib/notionDataLayer';
import { Client } from '@notionhq/client';
import type { NotionAction } from '../src/lib/notion/types';

// Helper para delay (evitar rate limits)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para criar Action diretamente com database ID
async function createActionDirect(
  client: Client,
  dbId: string,
  payload: Partial<NotionAction>
): Promise<NotionAction> {
  // Build Notion properties
  const properties: any = {
    Name: { title: [{ text: { content: payload.Name || '' } }] },
    Type: { select: { name: payload.Type || '' } },
    Date: { date: { start: payload.Date || new Date().toISOString().split('T')[0] } },
    Done: { checkbox: false },
    PublicVisible: { checkbox: payload.PublicVisible ?? true },
  };

  // Add optional fields
  if (payload.Contribution !== undefined) {
    properties.Contribution = { number: payload.Contribution };
  }
  if (payload.Earned !== undefined) {
    properties.Earned = { number: payload.Earned };
  }
  if (payload.Goal) {
    properties.Goal = { relation: [{ id: payload.Goal }] };
  }
  if (payload.Notes) {
    properties.Notes = { rich_text: [{ text: { content: payload.Notes } }] };
  }
  if (payload.Contact) {
    properties.Contact = { relation: [{ id: payload.Contact }] };
  }
  if (payload.Client) {
    properties.Client = { relation: [{ id: payload.Client }] };
  }
  if (payload.Proposal) {
    properties.Proposal = { relation: [{ id: payload.Proposal }] };
  }
  if (payload.Diagnostic) {
    properties.Diagnostic = { relation: [{ id: payload.Diagnostic }] };
  }
  // WeekKey e Month não existem na Actions Database - removidas
  // if (payload.WeekKey) {
  //   properties.WeekKey = { rich_text: [{ text: { content: payload.WeekKey } }] };
  // }
  // if (payload.Month !== undefined) {
  //   properties.Month = { number: payload.Month };
  // }

  const response = await client.pages.create({
    parent: { database_id: dbId },
    properties
  });

  // Convert response to NotionAction format
  const props = response.properties;
  const extractText = (p: any) => p?.title?.map((item: any) => item.plain_text || '').join('') || p?.rich_text?.map((item: any) => item.plain_text || '').join('') || '';
  const extractSelect = (p: any) => p?.select?.name || '';
  const extractNumber = (p: any) => p?.number || 0;
  const extractBoolean = (p: any) => p?.checkbox || false;
  const extractDate = (p: any) => p?.date?.start || '';
  const extractRelation = (p: any) => p?.relation?.map((item: any) => item.id || '') || [];

  return {
    id: response.id,
    Name: extractText(props.Name),
    Type: extractSelect(props.Type) as any,
    Date: extractDate(props.Date),
    Done: extractBoolean(props.Done),
    Contribution: extractNumber(props.Contribution),
    Earned: extractNumber(props.Earned),
    Goal: extractRelation(props.Goal)[0] || '',
    Contact: extractRelation(props.Contact)[0] || '',
    Client: extractRelation(props.Client)[0] || '',
    Proposal: extractRelation(props.Proposal)[0] || '',
    Diagnostic: extractRelation(props.Diagnostic)[0] || '',
    WeekKey: extractText(props.WeekKey),
    Month: extractNumber(props.Month),
    PublicVisible: extractBoolean(props.PublicVisible),
    Notes: extractText(props.Notes)
  };
}

// Definir todos os KPIs e Metas
const kpisAndGoals = [
  // METAS MENSAIS (Janeiro 2026) - SortOrder: 1-6
  {
    kpi: {
      Name: "Contatos Ativados",
      Category: "VENDAS",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "contatos",
      TargetValue: 150,
      SortOrder: 1,
      Description: "Pessoas convidadas para agendarmos uma reunião",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Contatos Ativados - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 150,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Cafés Agendados",
      Category: "VENDAS",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "cafés",
      TargetValue: 90,
      SortOrder: 2,
      Description: "Cafés agendados no mês",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Cafés Agendados - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 90,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Cafés Executados",
      Category: "VENDAS",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "cafés",
      TargetValue: 50,
      SortOrder: 3,
      Description: "Cafés executados (meta mensal para JANEIRO)",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Cafés Executados - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 50,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Propostas de Crescimento Enviadas",
      Category: "VENDAS",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "propostas",
      TargetValue: 50,
      SortOrder: 4,
      Description: "Propostas de crescimento enviadas (meta mensal para JANEIRO)",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Propostas de Crescimento Enviadas - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 50,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Vendas Feitas",
      Category: "VENDAS",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "vendas",
      TargetValue: 10,
      SortOrder: 5,
      Description: "Vendas feitas no mês",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Vendas Feitas - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 10,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Entrada em Novos Grupos de Relacionamento",
      Category: "NETWORKING",
      Periodicity: "Mensal" as const,
      ChartType: "number" as const,
      Unit: "grupos",
      TargetValue: 2,
      SortOrder: 6,
      Description: "Entrada em novos grupos de relacionamento efetuadas",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Entrada em Novos Grupos de Relacionamento - Janeiro 2026",
      Year: 2026,
      Month: 1,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-01-31",
      Target: 2,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  // METAS TRIMESTRAIS (Q1 2026) - SortOrder: 7-12
  {
    kpi: {
      Name: "Entrevistas de Emprego com Candidatos",
      Category: "TIME",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "entrevistas",
      TargetValue: 20,
      SortOrder: 7,
      Description: "Entrevistas de emprego com candidatos a vaga",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Entrevistas de Emprego - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 20,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Indicações Coletadas",
      Category: "VENDAS",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "contatos",
      TargetValue: 100,
      SortOrder: 8,
      Description: "Indicações coletadas",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Indicações Coletadas - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 100,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Processos para Vendedores Finalizados",
      Category: "TIME",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "processos",
      TargetValue: 7,
      SortOrder: 9,
      Description: "Processos para vendedores finalizados",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Processos para Vendedores Finalizados - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 7,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Embaixadores da Marca Ativos",
      Category: "MARKETING",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "embaixadores",
      TargetValue: 3,
      SortOrder: 10,
      Description: "Embaixadores da marca ativos",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Embaixadores da Marca Ativos - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 3,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Representantes Comerciais Ativos",
      Category: "VENDAS",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "representantes",
      TargetValue: 5,
      SortOrder: 11,
      Description: "Representantes comerciais ativos",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Representantes Comerciais Ativos - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 5,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Clientes Ativos (Trimestral)",
      Category: "VENDAS",
      Periodicity: "Trimestral" as const,
      ChartType: "number" as const,
      Unit: "clientes",
      TargetValue: 30,
      SortOrder: 12,
      Description: "Clientes ativos no trimestre",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Clientes Ativos - Q1 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-03-31",
      Target: 30,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  // METAS SEMESTRAIS (1º Semestre 2026) - SortOrder: 13-15
  {
    kpi: {
      Name: "Vendedores Contratados",
      Category: "TIME",
      Periodicity: "Semestral" as const,
      ChartType: "number" as const,
      Unit: "vendedores",
      TargetValue: 3,
      SortOrder: 13,
      Description: "Vendedores contratados (um no BNI de cada cidade)",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Vendedores Contratados - 1º Semestre 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-06-30",
      Target: 3,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Time Interno de Produto",
      Category: "TIME",
      Periodicity: "Semestral" as const,
      ChartType: "number" as const,
      Unit: "membros",
      TargetValue: 2,
      SortOrder: 14,
      Description: "Time interno de produto: membros efetivados",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Time Interno de Produto - 1º Semestre 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-06-30",
      Target: 2,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Escritório Físico",
      Category: "INFRAESTRUTURA",
      Periodicity: "Semestral" as const,
      ChartType: "number" as const,
      Unit: "unidades",
      TargetValue: 1,
      SortOrder: 15,
      Description: "Escritório físico: unidades abertas",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Escritório Físico - 1º Semestre 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-06-30",
      Target: 1,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  // METAS ANUAIS (2026) - SortOrder: 16-18
  {
    kpi: {
      Name: "Clientes Ativos (Anual)",
      Category: "VENDAS",
      Periodicity: "Anual" as const,
      ChartType: "number" as const,
      Unit: "clientes",
      TargetValue: 300,
      SortOrder: 16,
      Description: "Clientes ativos no ano",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Clientes Ativos - 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-12-31",
      Target: 300,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Time de Vendas",
      Category: "TIME",
      Periodicity: "Anual" as const,
      ChartType: "number" as const,
      Unit: "pessoas",
      TargetValue: 10,
      SortOrder: 17,
      Description: "Time de vendas: pessoas",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Time de Vendas - 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-12-31",
      Target: 10,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  },
  {
    kpi: {
      Name: "Time de Produto",
      Category: "TIME",
      Periodicity: "Anual" as const,
      ChartType: "number" as const,
      Unit: "pessoas",
      TargetValue: 3,
      SortOrder: 18,
      Description: "Time de produto: pessoas",
      VisiblePublic: true,
      VisibleAdmin: true,
      IsFinancial: false,
      Active: true
    },
    goal: {
      Name: "Time de Produto - 2026",
      Year: 2026,
      Month: null,
      PeriodStart: "2026-01-01",
      PeriodEnd: "2026-12-31",
      Target: 3,
      Actual: 0,
      VisiblePublic: true,
      VisibleAdmin: true
    }
  }
];

// Definir todas as tarefas
const actions = {
  // Meta 1: Contatos Ativados (22 tarefas)
  contatosAtivados: [
    { Name: "Ativação LinkedIn - Lote 1 (5 contatos)", Date: "2026-01-02", WeekKey: "2026-W01", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 2 (5 contatos)", Date: "2026-01-03", WeekKey: "2026-W01", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 3 (5 contatos)", Date: "2026-01-06", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 4 (5 contatos)", Date: "2026-01-07", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 5 (5 contatos)", Date: "2026-01-08", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 6 (5 contatos)", Date: "2026-01-09", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 7 (5 contatos)", Date: "2026-01-10", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 8 (5 contatos)", Date: "2026-01-13", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 9 (5 contatos)", Date: "2026-01-14", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 10 (5 contatos)", Date: "2026-01-15", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 11 (5 contatos)", Date: "2026-01-16", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 12 (5 contatos)", Date: "2026-01-17", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 13 (5 contatos)", Date: "2026-01-20", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 14 (5 contatos)", Date: "2026-01-21", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 15 (5 contatos)", Date: "2026-01-22", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 16 (5 contatos)", Date: "2026-01-23", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 17 (5 contatos)", Date: "2026-01-24", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 18 (5 contatos)", Date: "2026-01-27", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 19 (5 contatos)", Date: "2026-01-28", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 20 (5 contatos)", Date: "2026-01-29", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 21 (5 contatos)", Date: "2026-01-30", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote 22 (5 contatos)", Date: "2026-01-31", WeekKey: "2026-W05", Contribution: 5 },
    // Adicionar 8 tarefas extras para chegar a 150 contatos (110 + 40 = 150)
    { Name: "Ativação LinkedIn - Lote Extra 1 (5 contatos)", Date: "2026-01-06", WeekKey: "2026-W02", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 2 (5 contatos)", Date: "2026-01-13", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 3 (5 contatos)", Date: "2026-01-20", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 4 (5 contatos)", Date: "2026-01-27", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 5 (5 contatos)", Date: "2026-01-14", WeekKey: "2026-W03", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 6 (5 contatos)", Date: "2026-01-21", WeekKey: "2026-W04", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 7 (5 contatos)", Date: "2026-01-28", WeekKey: "2026-W05", Contribution: 5 },
    { Name: "Ativação LinkedIn - Lote Extra 8 (5 contatos)", Date: "2026-01-15", WeekKey: "2026-W03", Contribution: 5 },
  ],
  // Meta 6: Entrada em Grupos (8 tarefas)
  entradaGrupos: [
    { Name: "Pesquisa e Análise de Grupos - Grupo 1", Date: "2026-01-06", WeekKey: "2026-W02", Contribution: 0.5, Notes: "Pesquisar grupos de networking relevantes (BNI, Rotary, grupos de empreendedores, etc.) e analisar qualidades e requisitos" },
    { Name: "Contato Inicial - Grupo 1", Date: "2026-01-08", WeekKey: "2026-W02", Contribution: 0.5, Notes: "Fazer contato inicial com responsável do grupo, entender processo de entrada e requisitos" },
    { Name: "Participação em Evento/Reunião - Grupo 1", Date: "2026-01-13", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Participar de evento ou reunião do grupo como visitante/observador" },
    { Name: "Formalização de Entrada - Grupo 1", Date: "2026-01-20", WeekKey: "2026-W04", Contribution: 0.5, Notes: "Completar processo de entrada formal no grupo (pagamento, documentação, etc.) - TOTAL: 1 grupo" },
    { Name: "Pesquisa e Análise de Grupos - Grupo 2", Date: "2026-01-15", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Pesquisar segundo grupo de networking relevante e analisar qualidades e requisitos" },
    { Name: "Contato Inicial - Grupo 2", Date: "2026-01-17", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Fazer contato inicial com responsável do segundo grupo" },
    { Name: "Participação em Evento/Reunião - Grupo 2", Date: "2026-01-22", WeekKey: "2026-W04", Contribution: 0.5, Notes: "Participar de evento ou reunião do segundo grupo como visitante" },
    { Name: "Formalização de Entrada - Grupo 2", Date: "2026-01-29", WeekKey: "2026-W05", Contribution: 0.5, Notes: "Completar processo de entrada formal no segundo grupo - TOTAL: 2 grupos" },
  ]
};

async function main() {
  console.log('🚀 Iniciando configuração de KPIs, Goals e Actions para 2026...\n');

  try {
    // Inicializar cliente Notion
    const client = initNotionClient();
    
    // Actions Database ID conforme documento TAREFAS_JANEIRO_2026.md
    const actionsDbId = '2d984566a5fa813cbce2d090e08cd836';
    console.log(`✅ Actions Database ID: ${actionsDbId}\n`);

    // PASSO 1: Criar todos os KPIs e Metas
    console.log('📊 PASSO 1: Criando KPIs e Metas...\n');
    const createdGoals: { [key: string]: string } = {}; // Armazenar IDs das metas criadas

    for (let i = 0; i < kpisAndGoals.length; i++) {
      const { kpi, goal } = kpisAndGoals[i];
      console.log(`  [${i + 1}/18] Criando KPI: ${kpi.Name}...`);
      
      // Criar KPI
      const createdKPI = await createKPI(kpi);
      console.log(`    ✅ KPI criado: ${createdKPI.id}`);
      await delay(500); // Delay para evitar rate limits

      // Criar Meta relacionada
      console.log(`    Criando Meta: ${goal.Name}...`);
      const createdGoal = await createGoal({
        ...goal,
        KPI: createdKPI.id
      });
      console.log(`    ✅ Meta criada: ${createdGoal.id}`);
      
      // Armazenar ID da meta para uso posterior
      createdGoals[goal.Name] = createdGoal.id;
      
      await delay(500); // Delay para evitar rate limits
      console.log('');
    }

    console.log('✅ PASSO 1 concluído: 18 KPIs e 18 Metas criados\n');

    // PASSO 2: Obter IDs das metas necessárias
    console.log('🔍 PASSO 2: Obtendo IDs das metas necessárias...\n');
    
    const goalContatosAtivados = createdGoals["Contatos Ativados - Janeiro 2026"];
    const goalEntradaGrupos = createdGoals["Entrada em Novos Grupos de Relacionamento - Janeiro 2026"];

    if (!goalContatosAtivados) {
      throw new Error('Meta "Contatos Ativados - Janeiro 2026" não encontrada');
    }
    if (!goalEntradaGrupos) {
      throw new Error('Meta "Entrada em Novos Grupos de Relacionamento - Janeiro 2026" não encontrada');
    }

    console.log(`✅ Meta Contatos Ativados: ${goalContatosAtivados}`);
    console.log(`✅ Meta Entrada em Grupos: ${goalEntradaGrupos}\n`);

    // PASSO 3: Criar todas as tarefas
    console.log('📝 PASSO 3: Criando tarefas...\n');

    // Criar tarefas para Meta 1 (Contatos Ativados)
    console.log(`  Criando ${actions.contatosAtivados.length} tarefas para Contatos Ativados...`);
    for (let i = 0; i < actions.contatosAtivados.length; i++) {
      const action = actions.contatosAtivados[i];
      await createActionDirect(client, actionsDbId, {
        Name: action.Name,
        Type: "Ativação de Rede",
        Date: action.Date,
        Done: false,
        Contribution: action.Contribution,
        Goal: goalContatosAtivados,
        WeekKey: action.WeekKey,
        Month: 1,
        PublicVisible: true,
        Notes: "Conectar e convidar pessoas do LinkedIn para reunião"
      });
      console.log(`    [${i + 1}/${actions.contatosAtivados.length}] ✅ ${action.Name}`);
      await delay(300); // Delay para evitar rate limits
    }
    console.log('');

    // Criar tarefas para Meta 6 (Entrada em Grupos)
    console.log(`  Criando ${actions.entradaGrupos.length} tarefas para Entrada em Grupos...`);
    for (let i = 0; i < actions.entradaGrupos.length; i++) {
      const action = actions.entradaGrupos[i];
      await createActionDirect(client, actionsDbId, {
        Name: action.Name,
        Type: "Ativação de Rede",
        Date: action.Date,
        Done: false,
        Contribution: action.Contribution,
        Goal: goalEntradaGrupos,
        WeekKey: action.WeekKey,
        Month: 1,
        PublicVisible: true,
        Notes: action.Notes || ""
      });
      console.log(`    [${i + 1}/${actions.entradaGrupos.length}] ✅ ${action.Name}`);
      await delay(300); // Delay para evitar rate limits
    }
    console.log('');

    const totalActions = actions.contatosAtivados.length + actions.entradaGrupos.length;
    console.log(`✅ PASSO 3 concluído: ${totalActions} tarefas criadas\n`);

    // Resumo final
    console.log('🎉 CONFIGURAÇÃO COMPLETA!\n');
    console.log('📊 Resumo:');
    console.log(`  - KPIs criados: 18`);
    console.log(`  - Metas criadas: 18`);
    console.log(`  - Tarefas criadas: ${totalActions}`);
    console.log(`    • Contatos Ativados: ${actions.contatosAtivados.length} tarefas`);
    console.log(`    • Entrada em Grupos: ${actions.entradaGrupos.length} tarefas`);
    console.log('\n✅ Todos os passos foram executados com sucesso!');

  } catch (error: any) {
    console.error('\n❌ ERRO durante a execução:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Executar script
main();

