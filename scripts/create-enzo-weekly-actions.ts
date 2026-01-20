/**
 * Script para criar ações da semana do Enzo na database Actions_Enzo
 * 
 * Uso: npx tsx scripts/create-enzo-weekly-actions.ts
 */

import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN || NOTION_TOKEN.startsWith('<<<')) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

const ACTIONS_ENZO_DB_ID = process.env.NOTION_DB_ACTIONS_ENZO;
const KPIS_ENZO_DB_ID = process.env.NOTION_DB_KPIS_ENZO;
const GOALS_ENZO_DB_ID = process.env.NOTION_DB_GOALS_ENZO;

if (!ACTIONS_ENZO_DB_ID || !KPIS_ENZO_DB_ID || !GOALS_ENZO_DB_ID) {
  console.error('❌ Databases do Enzo não configuradas no .env.local');
  console.log('💡 Verifique: NOTION_DB_ACTIONS_ENZO, NOTION_DB_KPIS_ENZO, NOTION_DB_GOALS_ENZO');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

// Helper para esperar (evitar rate limit)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para calcular WeekKey
function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// Buscar KPI por nome
async function findKPIByName(name: string): Promise<string | null> {
  try {
    const response = await client.databases.query({
      database_id: KPIS_ENZO_DB_ID,
      filter: {
        property: 'Active',
        checkbox: { equals: true }
      }
    });

    for (const page of response.results) {
      const nameProperty = (page as any).properties.Name;
      if (nameProperty?.title && nameProperty.title.length > 0) {
        const kpiName = nameProperty.title[0].plain_text;
        // Busca flexível (contém ou igual)
        if (kpiName.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(kpiName.toLowerCase())) {
          return page.id;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar KPI "${name}":`, error);
    return null;
  }
}

// Buscar Goal por KPI e WeekKey
async function findGoalByKPIAndWeek(kpiId: string, weekKey: string): Promise<string | null> {
  try {
    const response = await client.databases.query({
      database_id: GOALS_ENZO_DB_ID,
      filter: {
        and: [
          { property: 'KPI', relation: { contains: kpiId } },
          { property: 'WeekKey', rich_text: { equals: weekKey } }
        ]
      }
    });

    if (response.results.length > 0) {
      return response.results[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar Goal:`, error);
    return null;
  }
}

// Criar ação
async function createAction(action: {
  name: string;
  type: string;
  date: string;
  goalId?: string;
  weekKey: string;
  month: number;
}): Promise<void> {
  try {
    const properties: any = {
      Name: { title: [{ text: { content: action.name } }] },
      Type: { select: { name: action.type } },
      Date: { date: { start: action.date } },
      Done: { checkbox: false },
      PublicVisible: { checkbox: true },
      WeekKey: { rich_text: [{ text: { content: action.weekKey } }] },
      Month: { number: action.month }
    };

    if (action.goalId) {
      properties.Goal = { relation: [{ id: action.goalId }] };
    }

    await client.pages.create({
      parent: { database_id: ACTIONS_ENZO_DB_ID },
      properties
    });

    console.log(`✅ Ação criada: "${action.name}" (${action.date})`);
  } catch (error: any) {
    console.error(`❌ Erro ao criar ação "${action.name}":`, error.message);
    if (error.body) {
      console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
    }
  }
}

async function createWeeklyActions() {
  console.log('🚀 Criando ações da semana do Enzo...\n');

  try {
    // Buscar KPIs necessários
    const kpiProspeccao = await findKPIByName('Convites / Áudios enviados para o café com tec');
    const kpiReunioes = await findKPIByName('Reuniões 1:1 feitas');
    const kpiVendas = await findKPIByName('Vendas feitas (5K +)');

    if (!kpiProspeccao) {
      console.warn('⚠️  KPI "Convites / Áudios enviados para o café com tec" não encontrado');
    }
    if (!kpiReunioes) {
      console.warn('⚠️  KPI "Reuniões 1:1 feitas" não encontrado');
    }
    if (!kpiVendas) {
      console.warn('⚠️  KPI "Vendas feitas (5K +)" não encontrado');
    }

    // WeekKey da semana (19/01 a 23/01/2026)
    const weekKey = '2026-W03'; // Ajustar conforme necessário

    // Buscar Goals
    const goalProspeccao = kpiProspeccao ? await findGoalByKPIAndWeek(kpiProspeccao, weekKey) : null;
    const goalReunioes = kpiReunioes ? await findGoalByKPIAndWeek(kpiReunioes, weekKey) : null;
    const goalVendas = kpiVendas ? await findGoalByKPIAndWeek(kpiVendas, weekKey) : null;

    console.log('📋 Goals encontrados:');
    console.log(`   Prospecção: ${goalProspeccao ? '✅' : '❌'}`);
    console.log(`   Reuniões: ${goalReunioes ? '✅' : '❌'}`);
    console.log(`   Vendas: ${goalVendas ? '✅' : '❌'}\n`);

    // Definir ações
    const actions = [
      // Segunda-feira 19/01
      {
        name: 'Ativar 5 dos 20 contatos',
        type: 'Ativação de Rede',
        date: '2026-01-19',
        goalId: goalProspeccao || undefined,
        weekKey,
        month: 1
      },
      // Terça-feira 20/01
      {
        name: 'Ativar 10 dos 20 contatos',
        type: 'Ativação de Rede',
        date: '2026-01-20',
        goalId: goalProspeccao || undefined,
        weekKey,
        month: 1
      },
      // Quarta-feira 21/01
      {
        name: 'Ativar 10 dos 20 contatos',
        type: 'Ativação de Rede',
        date: '2026-01-21',
        goalId: goalProspeccao || undefined,
        weekKey,
        month: 1
      },
      {
        name: 'Fazer 2 reuniões',
        type: 'Café',
        date: '2026-01-21',
        goalId: goalReunioes || undefined,
        weekKey,
        month: 1
      },
      {
        name: 'Fazer 1 venda',
        type: 'Proposta',
        date: '2026-01-21',
        goalId: goalVendas || undefined,
        weekKey,
        month: 1
      },
      // Quinta-feira 22/01
      {
        name: 'Fazer 4 reuniões',
        type: 'Café',
        date: '2026-01-22',
        goalId: goalReunioes || undefined,
        weekKey,
        month: 1
      },
      {
        name: 'Fazer 3 vendas',
        type: 'Proposta',
        date: '2026-01-22',
        goalId: goalVendas || undefined,
        weekKey,
        month: 1
      }
    ];

    // Criar ações
    for (const action of actions) {
      await createAction(action);
      await delay(500); // Evitar rate limit
    }

    console.log(`\n✨ Concluído! ${actions.length} ações criadas.`);
    console.log('💡 Verifique no Notion se as ações foram criadas corretamente.');

  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    if (error.body) {
      console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

createWeeklyActions().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});





