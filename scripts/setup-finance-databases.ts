// Script para configurar automaticamente as databases financeiras do Notion
// Execute com: npx tsx scripts/setup-finance-databases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

interface PropertyConfig {
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'select' | 'date' | 'checkbox' | 'relation';
  options?: string[];
  relationDatabaseId?: string;
}

const BUDGET_GOALS_ID = '2dd84566a5fa80b6b749de2f7ff328c8';
const TRANSACTIONS_ID = '2dd84566a5fa8051bd52ca792e0f883e';

const budgetGoalsProperties: PropertyConfig[] = [
  { name: 'Category', type: 'select', options: ['Marketing', 'Operacional', 'Pessoal', 'Investimentos'] },
  { name: 'Month', type: 'number' },
  { name: 'Year', type: 'number' },
  { name: 'BudgetAmount', type: 'number' },
  { name: 'SpentAmount', type: 'number' },
  { name: 'PeriodStart', type: 'date' },
  { name: 'PeriodEnd', type: 'date' },
  { name: 'Status', type: 'select', options: ['Em andamento', 'Atingido', 'Excedido', 'Não iniciado'] },
  { name: 'Notes', type: 'rich_text' }
];

const transactionsProperties: PropertyConfig[] = [
  { name: 'Date', type: 'date' },
  { name: 'Amount', type: 'number' },
  { name: 'Type', type: 'select', options: ['Entrada', 'Saída'] },
  { name: 'Category', type: 'select', options: ['Marketing', 'Operacional', 'Pessoal', 'Investimentos'] },
  { name: 'Account', type: 'select', options: ['Nubank', 'Inter', 'Banco do Brasil'] },
  { name: 'Description', type: 'rich_text' },
  { name: 'BudgetGoal', type: 'relation', relationDatabaseId: BUDGET_GOALS_ID },
  { name: 'Imported', type: 'checkbox' },
  { name: 'ImportedAt', type: 'date' },
  { name: 'FileSource', type: 'rich_text' }
];

async function getDatabaseProperties(dbId: string) {
  try {
    const database = await notion.databases.retrieve({ database_id: dbId });
    return database.properties;
  } catch (error: any) {
    console.error(`❌ Erro ao acessar database:`, error.message);
    throw error;
  }
}

function createPropertyConfig(prop: PropertyConfig): any {
  const base: any = {};

  switch (prop.type) {
    case 'select':
      if (!prop.options || prop.options.length === 0) {
        throw new Error(`Select property ${prop.name} precisa de opções`);
      }
      base.select = {
        options: prop.options.map(option => ({ name: option }))
      };
      break;

    case 'number':
      base.number = {};
      break;

    case 'date':
      base.date = {};
      break;

    case 'checkbox':
      base.checkbox = {};
      break;

    case 'rich_text':
      base.rich_text = {};
      break;

    case 'relation':
      if (!prop.relationDatabaseId) {
        throw new Error(`Relation property ${prop.name} precisa de relationDatabaseId`);
      }
      base.relation = {
        database_id: prop.relationDatabaseId,
        type: 'single_property',
        single_property: {}
      };
      break;

    default:
      throw new Error(`Tipo de propriedade não suportado: ${prop.type}`);
  }

  return base;
}

async function updateSelectOptions(
  dbId: string,
  propertyName: string,
  newOptions: string[]
): Promise<boolean> {
  try {
    const database = await notion.databases.retrieve({ database_id: dbId });
    const existingProp = database.properties[propertyName];

    if (!existingProp || existingProp.type !== 'select') {
      return false;
    }

    const existingOptions = (existingProp as any).select.options.map((opt: any) => opt.name);
    const missingOptions = newOptions.filter(opt => !existingOptions.includes(opt));

    if (missingOptions.length === 0) {
      return true; // Todas as opções já existem
    }

    // Adicionar opções faltantes
    const updatedOptions = [
      ...(existingProp as any).select.options,
      ...missingOptions.map(opt => ({ name: opt, color: 'default' }))
    ];

    await notion.databases.update({
      database_id: dbId,
      properties: {
        [propertyName]: {
          select: {
            options: updatedOptions
          }
        }
      }
    });

    console.log(`  ✅ Opções atualizadas para ${propertyName}: ${missingOptions.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error(`  ⚠️  Não foi possível atualizar opções de ${propertyName}:`, error.message);
    return false;
  }
}

async function setupDatabase(
  dbId: string,
  dbName: string,
  properties: PropertyConfig[]
): Promise<{ created: number; updated: number; skipped: number }> {
  console.log(`\n📊 Configurando database: ${dbName} (${dbId})...`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const existingProperties = await getDatabaseProperties(dbId);
    const propertiesToAdd: Record<string, any> = {};

    for (const prop of properties) {
      if (existingProperties[prop.name]) {
        const existing = existingProperties[prop.name];
        
        // Verificar se o tipo está correto
        if (existing.type !== prop.type) {
          console.log(`  ⚠️  ${prop.name}: Tipo incorreto (${existing.type} vs ${prop.type}). Não é possível alterar o tipo via API.`);
          skipped++;
          continue;
        }

        // Se for Select, verificar/atualizar opções
        if (prop.type === 'select' && prop.options) {
          try {
            const wasUpdated = await updateSelectOptions(dbId, prop.name, prop.options);
            if (wasUpdated) {
              updated++;
            } else {
              skipped++;
            }
          } catch (error: any) {
            console.log(`  ⚠️  ${prop.name}: Não foi possível atualizar opções - ${error.message}`);
            skipped++;
          }
        } else {
          console.log(`  ✓ ${prop.name}: Já existe e está correto`);
          skipped++;
        }
      } else {
        // Criar nova propriedade
        try {
          propertiesToAdd[prop.name] = createPropertyConfig(prop);
          console.log(`  ➕ ${prop.name}: Será criada`);
        } catch (error: any) {
          console.error(`  ❌ ${prop.name}: Erro ao preparar - ${error.message}`);
          skipped++;
        }
      }
    }

    // Adicionar todas as propriedades de uma vez
    if (Object.keys(propertiesToAdd).length > 0) {
      try {
        await notion.databases.update({
          database_id: dbId,
          properties: propertiesToAdd
        });
        created = Object.keys(propertiesToAdd).length;
        console.log(`  ✅ ${created} propriedade(s) criada(s) com sucesso!`);
      } catch (error: any) {
        console.error(`  ❌ Erro ao criar propriedades:`, error.message);
        if (error.message.includes('property already exists')) {
          console.log(`  ℹ️  Algumas propriedades podem já existir. Verifique manualmente.`);
        }
      }
    }

    return { created, updated, skipped };
  } catch (error: any) {
    console.error(`❌ Erro ao configurar database ${dbName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando configuração automática das databases financeiras...\n');

  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN não configurado no .env.local');
    process.exit(1);
  }

  if (!process.env.NOTION_DB_BUDGETGOALS || !process.env.NOTION_DB_TRANSACTIONS) {
    console.error('❌ IDs das databases não configurados no .env.local');
    process.exit(1);
  }

  try {
    // Configurar BudgetGoals
    const budgetResult = await setupDatabase(
      BUDGET_GOALS_ID,
      'BudgetGoals',
      budgetGoalsProperties
    );

    // Configurar Transactions
    const transactionsResult = await setupDatabase(
      TRANSACTIONS_ID,
      'Transactions',
      transactionsProperties
    );

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo da Configuração:\n');
    console.log('BudgetGoals:');
    console.log(`  ✅ Criadas: ${budgetResult.created}`);
    console.log(`  🔄 Atualizadas: ${budgetResult.updated}`);
    console.log(`  ⏭️  Já existiam: ${budgetResult.skipped}`);
    console.log('\nTransactions:');
    console.log(`  ✅ Criadas: ${transactionsResult.created}`);
    console.log(`  🔄 Atualizadas: ${transactionsResult.updated}`);
    console.log(`  ⏭️  Já existiam: ${transactionsResult.skipped}`);
    console.log('\n' + '='.repeat(60));

    // Verificar se há propriedades que precisam ser criadas manualmente
    const totalCreated = budgetResult.created + transactionsResult.created;
    const totalSkipped = budgetResult.skipped + transactionsResult.skipped;

    if (totalCreated > 0) {
      console.log('\n✅ Propriedades criadas com sucesso!');
    }

    if (totalSkipped > 0) {
      console.log('\n⚠️  Algumas propriedades já existiam ou não puderam ser criadas.');
      console.log('   Verifique manualmente no Notion se todas estão corretas.');
    }

    console.log('\n📋 Próximos passos:');
    console.log('1. Verifique manualmente no Notion se todas as propriedades foram criadas');
    console.log('2. Compartilhe as databases com a integração "FR Tech OS"');
    console.log('3. Execute: npx tsx scripts/validate-finance-databases.ts');
    console.log('4. Teste criando uma meta e importando transações\n');

  } catch (error: any) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    console.error('\n💡 Dicas:');
    console.error('  - Verifique se o NOTION_TOKEN está correto');
    console.error('  - Verifique se as databases foram compartilhadas com a integração');
    console.error('  - Verifique se os IDs das databases estão corretos');
    process.exit(1);
  }
}

main().catch(console.error);

