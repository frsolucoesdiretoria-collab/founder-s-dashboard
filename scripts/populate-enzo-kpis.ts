/**
 * Script para popular as databases do Enzo com KPIs e Goals iniciais
 * 
 * Uso: npx tsx scripts/populate-enzo-kpis.ts
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

// IDs das databases (do .env.local)
const KPIS_ENZO_DB_ID = process.env.NOTION_DB_KPIS_ENZO;
const GOALS_ENZO_DB_ID = process.env.NOTION_DB_GOALS_ENZO;

if (!KPIS_ENZO_DB_ID || !GOALS_ENZO_DB_ID) {
  console.error('❌ NOTION_DB_KPIS_ENZO ou NOTION_DB_GOALS_ENZO não configurados no .env.local');
  console.log('💡 Execute primeiro: node scripts/create-enzo-databases.ts');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

// Helper para esperar (evitar rate limit)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para calcular WeekKey da semana atual
function getCurrentWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// Helper para calcular datas da semana
function getWeekDates(weekKey: string): { start: string; end: string } {
  const [year, week] = weekKey.split('-W').map(Number);
  const d = new Date(Date.UTC(year, 0, 1));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum + (week - 1) * 7);
  
  const start = new Date(d);
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 6);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Criar os 4 KPIs iniciais
 */
async function createKPIs(): Promise<Record<string, string>> {
  console.log('📊 Criando KPIs iniciais...\n');
  
  const weekKey = getCurrentWeekKey();
  
  const kpis = [
    {
      Name: 'Prospecção - Ativação de Rede',
      Category: 'Vendas',
      Periodicity: 'Semanal',
      ChartType: 'bar',
      Unit: 'contatos',
      TargetValue: 20,
      IsFinancial: false,
      SortOrder: 1,
      Description: 'Meta de ativar 20 contatos da rede de relacionamentos entre Segunda, Terça e Quarta de manhã',
    },
    {
      Name: 'Reuniões Qualificadas 1:1',
      Category: 'Vendas',
      Periodicity: 'Semanal',
      ChartType: 'bar',
      Unit: 'reuniões',
      TargetValue: 6,
      IsFinancial: false,
      SortOrder: 2,
      Description: 'Meta de fazer 6 reuniões qualificadas 1:1 na Quarta-feira à tarde',
    },
    {
      Name: 'Vendas Convertidas (5K+)',
      Category: 'Vendas',
      Periodicity: 'Semanal',
      ChartType: 'bar',
      Unit: 'vendas',
      TargetValue: 4,
      IsFinancial: false,
      SortOrder: 3,
      Description: 'Meta de converter 4 vendas de R$ 5.000+ na Quinta-feira',
    },
    {
      Name: 'Meta Semanal de Vendas',
      Category: 'Vendas',
      Periodicity: 'Semanal',
      ChartType: 'number',
      Unit: 'R$',
      TargetValue: 20000,
      IsFinancial: true,
      SortOrder: 4,
      Description: 'Meta de finalizar a semana com R$ 20.000 em vendas até 23/01/2026',
    },
  ];

  const kpiIds: Record<string, string> = {};
  
  for (const kpi of kpis) {
    try {
      const response = await client.pages.create({
        parent: {
          database_id: KPIS_ENZO_DB_ID,
        },
        properties: {
          Name: {
            title: [{ text: { content: kpi.Name } }],
          },
          Category: {
            select: { name: kpi.Category },
          },
          Periodicity: {
            select: { name: kpi.Periodicity },
          },
          ChartType: {
            select: { name: kpi.ChartType },
          },
          Unit: {
            rich_text: [{ text: { content: kpi.Unit } }],
          },
          TargetValue: {
            number: kpi.TargetValue,
          },
          VisiblePublic: {
            checkbox: true,
          },
          VisibleAdmin: {
            checkbox: true,
          },
          IsFinancial: {
            checkbox: kpi.IsFinancial,
          },
          SortOrder: {
            number: kpi.SortOrder,
          },
          Active: {
            checkbox: true,
          },
          Description: {
            rich_text: [{ text: { content: kpi.Description } }],
          },
        },
      });
      
      kpiIds[kpi.Name] = response.id;
      console.log(`✅ KPI criado: ${kpi.Name} (ID: ${response.id.replace(/-/g, '')})`);
      await delay(500); // Evitar rate limit
    } catch (error: any) {
      console.error(`❌ Erro ao criar KPI "${kpi.Name}":`, error.message);
      if (error.body) {
        console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
      }
    }
  }
  
  return kpiIds;
}

/**
 * Criar Goals iniciais para cada KPI
 */
async function createGoals(kpiIds: Record<string, string>): Promise<void> {
  console.log('\n🎯 Criando Goals iniciais...\n');
  
  const weekKey = getCurrentWeekKey();
  const weekDates = getWeekDates(weekKey);
  const currentYear = new Date().getFullYear();
  
  // Data de fim específica para a meta semanal: 23/01/2026
  const endDate2026 = '2026-01-23';
  
  const goals = [
    {
      kpiName: 'Prospecção - Ativação de Rede',
      name: `Prospecção Semana ${weekKey}`,
      target: 20,
      periodStart: weekDates.start,
      periodEnd: weekDates.end, // Até quarta de manhã - pode ajustar depois
      weekKey,
    },
    {
      kpiName: 'Reuniões Qualificadas 1:1',
      name: `Reuniões Qualificadas ${weekKey}`,
      target: 6,
      periodStart: weekDates.start, // Quarta à tarde
      periodEnd: weekDates.end,
      weekKey,
    },
    {
      kpiName: 'Vendas Convertidas (5K+)',
      name: `Vendas Convertidas ${weekKey}`,
      target: 4,
      periodStart: weekDates.start, // Quinta
      periodEnd: weekDates.end,
      weekKey,
    },
    {
      kpiName: 'Meta Semanal de Vendas',
      name: `Meta Semanal até 23/01/2026`,
      target: 20000,
      periodStart: weekDates.start,
      periodEnd: endDate2026, // Data específica: 23/01/2026
      weekKey,
    },
  ];

  for (const goal of goals) {
    const kpiId = kpiIds[goal.kpiName];
    if (!kpiId) {
      console.error(`⚠️  KPI não encontrado: ${goal.kpiName}`);
      continue;
    }

    try {
      await client.pages.create({
        parent: {
          database_id: GOALS_ENZO_DB_ID,
        },
        properties: {
          Name: {
            title: [{ text: { content: goal.name } }],
          },
          KPI: {
            relation: [{ id: kpiId }],
          },
          Year: {
            number: currentYear,
          },
          WeekKey: {
            rich_text: [{ text: { content: goal.weekKey } }],
          },
          PeriodStart: {
            date: { start: goal.periodStart },
          },
          PeriodEnd: {
            date: { start: goal.periodEnd },
          },
          Target: {
            number: goal.target,
          },
          Actual: {
            number: 0, // Inicia em 0
          },
          VisiblePublic: {
            checkbox: true,
          },
          VisibleAdmin: {
            checkbox: true,
          },
        },
      });
      
      console.log(`✅ Goal criado: ${goal.name}`);
      await delay(500); // Evitar rate limit
    } catch (error: any) {
      console.error(`❌ Erro ao criar Goal "${goal.name}":`, error.message);
      if (error.body) {
        console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
      }
    }
  }
}

// Main
async function main() {
  try {
    console.log('🚀 Iniciando população das databases do Enzo...\n');
    
    // Criar KPIs
    const kpiIds = await createKPIs();
    
    // Aguardar um pouco
    await delay(1000);
    
    // Criar Goals
    await createGoals(kpiIds);
    
    console.log('\n✨ Concluído com sucesso!');
    console.log('💡 Reinicie o servidor e acesse /dashboard-enzo para ver os KPIs.');
    
  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    if (error.body) {
      console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});





