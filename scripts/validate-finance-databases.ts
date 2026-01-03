// Script para validar se as databases do Notion estão configuradas corretamente
// Execute com: npx tsx scripts/validate-finance-databases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

interface PropertyCheck {
  name: string;
  type: string;
  found: boolean;
  correctType: boolean;
  message: string;
}

async function validateDatabase(
  dbId: string,
  dbName: string,
  expectedProperties: Array<{ name: string; type: string; required: boolean }>
): Promise<{ valid: boolean; properties: PropertyCheck[] }> {
  try {
    const database = await notion.databases.retrieve({ database_id: dbId });
    const properties = database.properties;

    const checks: PropertyCheck[] = expectedProperties.map(expected => {
      // Name é sempre o título padrão do Notion, não precisa verificar
      if (expected.name === 'Name' && expected.type === 'title') {
        return {
          name: expected.name,
          type: expected.type,
          found: true,
          correctType: true,
          message: '✅ OK (título padrão)'
        };
      }

      const found = properties[expected.name] !== undefined;
      const actual = found ? properties[expected.name] : null;
      const correctType = found && actual?.type === expected.type;

      return {
        name: expected.name,
        type: expected.type,
        found,
        correctType,
        message: found
          ? correctType
            ? '✅ OK'
            : `❌ Tipo incorreto. Esperado: ${expected.type}, Encontrado: ${actual?.type}`
          : '❌ Não encontrada'
      };
    });

    const valid = checks.every(c => c.found && c.correctType);

    return { valid, properties: checks };
  } catch (error: any) {
    console.error(`❌ Erro ao acessar database ${dbName}:`, error.message);
    return { valid: false, properties: [] };
  }
}

async function main() {
  console.log('🔍 Validando configuração das databases financeiras...\n');

  const budgetGoalsId = process.env.NOTION_DB_BUDGETGOALS;
  const transactionsId = process.env.NOTION_DB_TRANSACTIONS;

  if (!budgetGoalsId) {
    console.error('❌ NOTION_DB_BUDGETGOALS não configurado no .env.local');
    process.exit(1);
  }

  if (!transactionsId) {
    console.error('❌ NOTION_DB_TRANSACTIONS não configurado no .env.local');
    process.exit(1);
  }

  console.log('📊 Validando BudgetGoals...\n');
  const budgetGoalsSchema = [
    { name: 'Name', type: 'title', required: true },
    { name: 'Category', type: 'select', required: true },
    { name: 'Month', type: 'number', required: true },
    { name: 'Year', type: 'number', required: true },
    { name: 'BudgetAmount', type: 'number', required: true },
    { name: 'SpentAmount', type: 'number', required: false },
    { name: 'PeriodStart', type: 'date', required: true },
    { name: 'PeriodEnd', type: 'date', required: true },
    { name: 'Status', type: 'select', required: false },
    { name: 'Notes', type: 'rich_text', required: false }
  ];

  const budgetResult = await validateDatabase(
    budgetGoalsId,
    'BudgetGoals',
    budgetGoalsSchema
  );

  console.log('Propriedades BudgetGoals:');
  budgetResult.properties.forEach(prop => {
    console.log(`  ${prop.name} (${prop.type}): ${prop.message}`);
  });

  console.log('\n📊 Validando Transactions...\n');
  const transactionsSchema = [
    { name: 'Name', type: 'title', required: true },
    { name: 'Date', type: 'date', required: true },
    { name: 'Amount', type: 'number', required: true },
    { name: 'Type', type: 'select', required: true },
    { name: 'Category', type: 'select', required: false },
    { name: 'Account', type: 'select', required: true },
    { name: 'Description', type: 'rich_text', required: false },
    { name: 'BudgetGoal', type: 'relation', required: false },
    { name: 'Imported', type: 'checkbox', required: true },
    { name: 'ImportedAt', type: 'date', required: false },
    { name: 'FileSource', type: 'rich_text', required: false }
  ];

  const transactionsResult = await validateDatabase(
    transactionsId,
    'Transactions',
    transactionsSchema
  );

  console.log('Propriedades Transactions:');
  transactionsResult.properties.forEach(prop => {
    console.log(`  ${prop.name} (${prop.type}): ${prop.message}`);
  });

  console.log('\n' + '='.repeat(50));
  if (budgetResult.valid && transactionsResult.valid) {
    console.log('✅ Todas as databases estão configuradas corretamente!');
    process.exit(0);
  } else {
    console.log('❌ Algumas propriedades estão faltando ou incorretas.');
    console.log('   Consulte CONFIGURAR_DATABASES_NOTION.md para corrigir.');
    process.exit(1);
  }
}

main().catch(console.error);

