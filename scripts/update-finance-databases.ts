// Script para atualizar as databases financeiras existentes com novas propriedades
// Execute com: npx tsx scripts/update-finance-databases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const TRANSACTIONS_ID = process.env.NOTION_DB_TRANSACTIONS || '2dd84566a5fa8051bd52ca792e0f883e';
const BUDGET_GOALS_ID = process.env.NOTION_DB_BUDGETGOALS || '2dd84566a5fa80b6b749de2f7ff328c8';

async function updateDatabaseProperties(dbId: string, dbName: string, newProperties: Record<string, any>) {
  try {
    console.log(`\n📝 Atualizando database: ${dbName}...`);
    
    // Primeiro, buscar a database atual para ver quais propriedades já existem
    const database = await notion.databases.retrieve({ database_id: dbId });
    const existingProps = database.properties;
    
    // Filtrar apenas as propriedades que não existem
    const propertiesToAdd: Record<string, any> = {};
    for (const [propName, propConfig] of Object.entries(newProperties)) {
      if (!existingProps[propName]) {
        propertiesToAdd[propName] = propConfig;
        console.log(`  ➕ Adicionando propriedade: ${propName}`);
      } else {
        console.log(`  ⏭️  Propriedade ${propName} já existe, pulando...`);
      }
    }

    if (Object.keys(propertiesToAdd).length === 0) {
      console.log(`  ✅ Todas as propriedades já existem em ${dbName}`);
      return;
    }

    // Atualizar a database com as novas propriedades
    await notion.databases.update({
      database_id: dbId,
      properties: propertiesToAdd
    });

    console.log(`  ✅ Database ${dbName} atualizada com sucesso!`);
  } catch (error: any) {
    console.error(`  ❌ Erro ao atualizar database ${dbName}:`, error.message);
    if (error.code !== 'object_not_found') {
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Iniciando atualização de databases financeiras...\n');

  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN não configurado no .env.local');
    process.exit(1);
  }

  try {
    // Atualizar Transactions com novas propriedades
    await updateDatabaseProperties(TRANSACTIONS_ID, 'Transactions', {
      Reconciled: { checkbox: {} },
      ReconciledAt: { date: {} },
      Recurring: { checkbox: {} },
      RecurringRule: { rich_text: {} }
    });

    // Atualizar BudgetGoals com novas propriedades (se necessário)
    // Por enquanto, não vamos adicionar novas propriedades ao BudgetGoals
    // pois as existentes são suficientes

    console.log('\n' + '='.repeat(60));
    console.log('✅ Atualização concluída!');
    console.log('='.repeat(60));
    console.log('\n💡 As databases foram atualizadas com as novas propriedades.\n');

  } catch (error: any) {
    console.error('\n❌ Erro durante a atualização:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);


