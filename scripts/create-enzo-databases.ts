/**
 * Script para criar as databases do Enzo via API do Notion
 * 
 * Uso: npx tsx scripts/create-enzo-databases.ts
 * 
 * Requisitos:
 * - NOTION_TOKEN configurado no .env.local
 * - Acesso à página pai fornecida
 */

import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ID da página pai onde as databases serão criadas
// Extraído do link: https://www.notion.so/Databases-Enzo-Axis-2ed84566a5fa80eb9966c93d00a0a6af
const PARENT_PAGE_ID = '2ed84566a5fa80eb9966c93d00a0a6af';

// Verificar NOTION_TOKEN
const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN || NOTION_TOKEN.startsWith('<<<')) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

/**
 * Criar database KPIs_Enzo
 */
async function createKPIsEnzoDatabase(): Promise<string> {
  console.log('📊 Criando database KPIs_Enzo...');
  
  const response = await client.databases.create({
    parent: {
      type: 'page_id',
      page_id: PARENT_PAGE_ID,
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'KPIs_Enzo',
        },
      },
    ],
    properties: {
      Name: {
        title: {},
      },
      Category: {
        select: {},
      },
      Periodicity: {
        select: {
          options: [
            { name: 'Anual' },
            { name: 'Mensal' },
            { name: 'Trimestral' },
            { name: 'Semestral' },
            { name: 'Semanal' },
            { name: 'Diário' },
          ],
        },
      },
      ChartType: {
        select: {
          options: [
            { name: 'line' },
            { name: 'bar' },
            { name: 'area' },
            { name: 'number' },
          ],
        },
      },
      Unit: {
        rich_text: {},
      },
      TargetValue: {
        number: {},
      },
      VisiblePublic: {
        checkbox: {},
      },
      VisibleAdmin: {
        checkbox: {},
      },
      IsFinancial: {
        checkbox: {},
      },
      SortOrder: {
        number: {},
      },
      Active: {
        checkbox: {},
      },
      Description: {
        rich_text: {},
      },
    },
  });

  console.log(`✅ KPIs_Enzo criada! ID: ${response.id}`);
  console.log(`   Link: ${response.url}\n`);
  return response.id;
}

/**
 * Criar database Goals_Enzo
 */
async function createGoalsEnzoDatabase(kpisEnzoId: string): Promise<string> {
  console.log('🎯 Criando database Goals_Enzo...');
  
  const response = await client.databases.create({
    parent: {
      type: 'page_id',
      page_id: PARENT_PAGE_ID,
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'Goals_Enzo',
        },
      },
    ],
    properties: {
      Name: {
        title: {},
      },
      KPI: {
        relation: {
          database_id: kpisEnzoId,
          single_property: {},
        },
      },
      Year: {
        number: {},
      },
      Month: {
        number: {},
      },
      WeekKey: {
        rich_text: {},
      },
      PeriodStart: {
        date: {},
      },
      PeriodEnd: {
        date: {},
      },
      Target: {
        number: {},
      },
      Actual: {
        number: {},
      },
      VisiblePublic: {
        checkbox: {},
      },
      VisibleAdmin: {
        checkbox: {},
      },
      Notes: {
        rich_text: {},
      },
    },
  });

  console.log(`✅ Goals_Enzo criada! ID: ${response.id}`);
  console.log(`   Link: ${response.url}\n`);
  return response.id;
}

/**
 * Criar database Actions_Enzo e atualizar relação em Goals_Enzo
 */
async function createActionsEnzoDatabase(goalsEnzoId: string): Promise<string> {
  console.log('✅ Criando database Actions_Enzo...');
  
  const response = await client.databases.create({
    parent: {
      type: 'page_id',
      page_id: PARENT_PAGE_ID,
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'Actions_Enzo',
        },
      },
    ],
    properties: {
      Name: {
        title: {},
      },
      Type: {
        select: {
          options: [
            { name: 'Café' },
            { name: 'Ativação de Rede' },
            { name: 'Proposta' },
            { name: 'Processo' },
            { name: 'Rotina' },
            { name: 'Automação' },
            { name: 'Agente' },
            { name: 'Diário' },
          ],
        },
      },
      Date: {
        date: {},
      },
      Done: {
        checkbox: {},
      },
      Contribution: {
        number: {},
      },
      Earned: {
        number: {},
      },
      Goal: {
        relation: {
          database_id: goalsEnzoId,
          single_property: {},
        },
      },
      Contact: {
        rich_text: {},
      },
      Client: {
        rich_text: {},
      },
      Proposal: {
        rich_text: {},
      },
      Diagnostic: {
        rich_text: {},
      },
      WeekKey: {
        rich_text: {},
      },
      Month: {
        number: {},
      },
      Priority: {
        select: {
          options: [
            { name: 'Alta' },
            { name: 'Média' },
            { name: 'Baixa' },
          ],
        },
      },
      PublicVisible: {
        checkbox: {},
      },
      Notes: {
        rich_text: {},
      },
    },
  });

  console.log(`✅ Actions_Enzo criada! ID: ${response.id}`);
  console.log(`   Link: ${response.url}\n`);
  return response.id;
}

/**
 * Atualizar Goals_Enzo para incluir relação com Actions_Enzo
 */
async function updateGoalsEnzoActionsRelation(goalsEnzoId: string, actionsEnzoId: string): Promise<void> {
  console.log('🔗 Atualizando relação Actions em Goals_Enzo...');
  
  await client.databases.update({
    database_id: goalsEnzoId,
    properties: {
      Actions: {
        relation: {
          database_id: actionsEnzoId,
          single_property: {},
        },
      },
    },
  });
  
  console.log('✅ Relação Actions atualizada!\n');
}

/**
 * Atualizar arquivo .env.local com os IDs
 */
function updateEnvLocal(kpisId: string, goalsId: string, actionsId: string): void {
  const envPath = resolve(process.cwd(), '.env.local');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove hífens dos IDs para o formato do .env.local (32 caracteres)
  const kpisIdClean = kpisId.replace(/-/g, '');
  const goalsIdClean = goalsId.replace(/-/g, '');
  const actionsIdClean = actionsId.replace(/-/g, '');
  
  // Função para atualizar ou adicionar variável
  function setEnvVar(name: string, value: string) {
    const regex = new RegExp(`^${name}=.*$`, 'm');
    const newLine = `${name}=${value}`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${newLine}\n`;
    }
  }
  
  setEnvVar('NOTION_DB_KPIS_ENZO', kpisIdClean);
  setEnvVar('NOTION_DB_GOALS_ENZO', goalsIdClean);
  setEnvVar('NOTION_DB_ACTIONS_ENZO', actionsIdClean);
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local atualizado!');
  console.log(`   NOTION_DB_KPIS_ENZO=${kpisIdClean}`);
  console.log(`   NOTION_DB_GOALS_ENZO=${goalsIdClean}`);
  console.log(`   NOTION_DB_ACTIONS_ENZO=${actionsIdClean}\n`);
}

// Main
async function main() {
  try {
    console.log('🚀 Iniciando criação das databases do Enzo via API do Notion...\n');
    console.log(`📍 Página pai: ${PARENT_PAGE_ID}\n`);
    
    // Criar KPIs_Enzo primeiro
    const kpisEnzoId = await createKPIsEnzoDatabase();
    
    // Aguardar um pouco para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar Goals_Enzo (com relação para KPIs_Enzo, Actions será atualizado depois)
    const goalsEnzoId = await createGoalsEnzoDatabase(kpisEnzoId);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar Actions_Enzo (com relação para Goals_Enzo)
    const actionsEnzoId = await createActionsEnzoDatabase(goalsEnzoId);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualizar Goals_Enzo para incluir relação com Actions_Enzo
    await updateGoalsEnzoActionsRelation(goalsEnzoId, actionsEnzoId);
    
    // Atualizar .env.local
    updateEnvLocal(kpisEnzoId, goalsEnzoId, actionsEnzoId);
    
    console.log('✨ Concluído com sucesso!');
    console.log('💡 Reinicie o servidor para aplicar as mudanças.');
    
  } catch (error: any) {
    console.error('❌ Erro ao criar databases:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    if (error.body) {
      console.error(`   Detalhes:`, JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

// Executar
main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

