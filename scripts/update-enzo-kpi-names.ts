/**
 * Script para renomear KPIs do Enzo no Notion
 * 
 * Uso: npx tsx scripts/update-enzo-kpi-names.ts
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

const KPIS_ENZO_DB_ID = process.env.NOTION_DB_KPIS_ENZO;
if (!KPIS_ENZO_DB_ID) {
  console.error('❌ NOTION_DB_KPIS_ENZO não configurado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

// Helper para esperar (evitar rate limit)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mapeamento de nomes antigos para novos
const kpiNameUpdates: Record<string, string> = {
  'Prospecção - Ativação de Rede': 'Convites / Áudios enviados para o café com tec',
  'Reuniões Qualificadas 1:1': 'Reuniões 1:1 feitas',
  'Vendas Convertidas (5K+)': 'Vendas feitas (5K +)'
};

async function updateKPINames() {
  console.log('🔄 Buscando KPIs para renomear...\n');

  try {
    // Buscar todos os KPIs ativos
    const response = await client.databases.query({
      database_id: KPIS_ENZO_DB_ID,
      filter: {
        property: 'Active',
        checkbox: { equals: true }
      }
    });

    console.log(`📊 Encontrados ${response.results.length} KPIs ativos\n`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [oldName, newName] of Object.entries(kpiNameUpdates)) {
      // Procurar KPI pelo nome antigo
      const kpi = response.results.find((page: any) => {
        const nameProperty = page.properties.Name;
        if (nameProperty?.title && nameProperty.title.length > 0) {
          return nameProperty.title[0].plain_text === oldName;
        }
        return false;
      });

      if (!kpi) {
        console.log(`⚠️  KPI não encontrado: "${oldName}"`);
        notFoundCount++;
        continue;
      }

      try {
        // Atualizar o nome do KPI
        await client.pages.update({
          page_id: kpi.id,
          properties: {
            Name: {
              title: [{ text: { content: newName } }]
            }
          }
        });

        console.log(`✅ KPI renomeado: "${oldName}" → "${newName}"`);
        updatedCount++;
        await delay(500); // Evitar rate limit
      } catch (error: any) {
        console.error(`❌ Erro ao renomear KPI "${oldName}":`, error.message);
        if (error.body) {
          console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
        }
      }
    }

    console.log(`\n✨ Concluído!`);
    console.log(`   ✅ ${updatedCount} KPIs renomeados`);
    if (notFoundCount > 0) {
      console.log(`   ⚠️  ${notFoundCount} KPIs não encontrados`);
    }
  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    if (error.body) {
      console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

updateKPINames().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});






