// Script para criar as novas databases financeiras no Notion
// Execute com: npx tsx scripts/create-finance-databases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';
import { writeFileSync, readFileSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Use uma das databases existentes como parent (vamos usar a página pai)
// Pegamos o parent da database BudgetGoals
const BUDGET_GOALS_ID = process.env.NOTION_DB_BUDGETGOALS || '2dd84566a5fa80b6b749de2f7ff328c8';

async function getParentPageId(): Promise<string> {
  try {
    // Buscar a database BudgetGoals para pegar o parent
    const database = await notion.databases.retrieve({ database_id: BUDGET_GOALS_ID });
    return (database.parent as any).page_id || (database.parent as any).workspace;
  } catch (error: any) {
    console.error('❌ Erro ao buscar parent page:', error.message);
    // Se não conseguir, vamos tentar usar o workspace
    throw new Error('Não foi possível determinar o parent page. Crie as databases manualmente no Notion.');
  }
}

async function createDatabase(
  title: string,
  parentPageId: string,
  properties: Record<string, any>
): Promise<string> {
  try {
    console.log(`\n📝 Criando database: ${title}...`);
    
    const response = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: title
          }
        }
      ],
      properties
    });

    const dbId = response.id.replace(/-/g, '');
    console.log(`  ✅ Database "${title}" criada com sucesso!`);
    console.log(`  📋 ID: ${dbId}`);
    return dbId;
  } catch (error: any) {
    console.error(`  ❌ Erro ao criar database "${title}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando criação de databases financeiras no Notion...\n');

  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN não configurado no .env.local');
    process.exit(1);
  }

  try {
    // Obter parent page ID
    const parentPageId = await getParentPageId();
    console.log(`✅ Parent page ID obtido: ${parentPageId}\n`);

    const createdDatabases: Record<string, string> = {};

    // 1. Criar database Accounts
    const accountsId = await createDatabase('Accounts', parentPageId, {
      Name: { title: {} },
      Type: {
        select: {
          options: [
            { name: 'Corrente', color: 'blue' },
            { name: 'Poupança', color: 'green' },
            { name: 'Cartão de Crédito', color: 'red' },
            { name: 'Investimento', color: 'purple' }
          ]
        }
      },
      Bank: {
        select: {
          options: [
            { name: 'Nubank', color: 'purple' },
            { name: 'Inter', color: 'orange' },
            { name: 'Banco do Brasil', color: 'yellow' },
            { name: 'Itaú', color: 'orange' },
            { name: 'Bradesco', color: 'red' },
            { name: 'Santander', color: 'red' },
            { name: 'Caixa', color: 'blue' },
            { name: 'Outro', color: 'gray' }
          ]
        }
      },
      AccountType: {
        select: {
          options: [
            { name: 'Empresarial', color: 'blue' },
            { name: 'Pessoal', color: 'green' }
          ]
        }
      },
      InitialBalance: { number: {} },
      CurrentBalance: { number: {} },
      Limit: { number: {} },
      Active: { checkbox: {} },
      Notes: { rich_text: {} }
    });
    createdDatabases['NOTION_DB_ACCOUNTS'] = accountsId;

    // 2. Criar database AccountsPayable
    const accountsPayableId = await createDatabase('AccountsPayable', parentPageId, {
      Name: { title: {} },
      Description: { rich_text: {} },
      Amount: { number: {} },
      DueDate: { date: {} },
      PaidDate: { date: {} },
      Status: {
        select: {
          options: [
            { name: 'Pendente', color: 'yellow' },
            { name: 'Pago', color: 'green' },
            { name: 'Vencido', color: 'red' }
          ]
        }
      },
      Category: {
        select: {
          options: [
            { name: 'Marketing', color: 'blue' },
            { name: 'Operacional', color: 'orange' },
            { name: 'Pessoal', color: 'green' },
            { name: 'Investimentos', color: 'purple' }
          ]
        }
      },
      Account: {
        relation: {
          database_id: accountsId,
          type: 'single_property',
          single_property: {}
        }
      },
      Paid: { checkbox: {} },
      Recurring: { checkbox: {} },
      RecurringRule: { rich_text: {} }
    });
    createdDatabases['NOTION_DB_ACCOUNTSPAYABLE'] = accountsPayableId;

    // 3. Criar database AccountsReceivable
    const accountsReceivableId = await createDatabase('AccountsReceivable', parentPageId, {
      Name: { title: {} },
      Description: { rich_text: {} },
      Amount: { number: {} },
      DueDate: { date: {} },
      ReceivedDate: { date: {} },
      Status: {
        select: {
          options: [
            { name: 'Pendente', color: 'yellow' },
            { name: 'Recebido', color: 'green' },
            { name: 'Atrasado', color: 'red' }
          ]
        }
      },
      Category: {
        select: {
          options: [
            { name: 'Marketing', color: 'blue' },
            { name: 'Operacional', color: 'orange' },
            { name: 'Pessoal', color: 'green' },
            { name: 'Investimentos', color: 'purple' }
          ]
        }
      },
      Account: {
        relation: {
          database_id: accountsId,
          type: 'single_property',
          single_property: {}
        }
      },
      Received: { checkbox: {} },
      Recurring: { checkbox: {} },
      RecurringRule: { rich_text: {} }
    });
    createdDatabases['NOTION_DB_ACCOUNTSRECEIVABLE'] = accountsReceivableId;

    // 4. Criar database CategorizationRules
    const categorizationRulesId = await createDatabase('CategorizationRules', parentPageId, {
      Name: { title: {} },
      Pattern: { rich_text: {} },
      Category: {
        select: {
          options: [
            { name: 'Marketing', color: 'blue' },
            { name: 'Operacional', color: 'orange' },
            { name: 'Pessoal', color: 'green' },
            { name: 'Investimentos', color: 'purple' }
          ]
        }
      },
      Priority: { number: {} },
      Active: { checkbox: {} },
      AccountType: {
        select: {
          options: [
            { name: 'Empresarial', color: 'blue' },
            { name: 'Pessoal', color: 'green' },
            { name: 'Ambos', color: 'gray' }
          ]
        }
      }
    });
    createdDatabases['NOTION_DB_CATEGORIZATIONRULES'] = categorizationRulesId;

    // Atualizar .env.local
    console.log('\n📝 Atualizando .env.local...');
    const envPath = resolve(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = readFileSync(envPath, 'utf-8');
    } catch {
      // Arquivo não existe, vamos criar
      envContent = '';
    }

    // Adicionar ou atualizar as variáveis
    for (const [key, value] of Object.entries(createdDatabases)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
        console.log(`  ✅ ${key} atualizado`);
      } else {
        envContent += `\n${key}=${value}`;
        console.log(`  ✅ ${key} adicionado`);
      }
    }

    writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local atualizado com sucesso!');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Databases criadas com sucesso!');
    console.log('='.repeat(60));
    console.log('\n📋 IDs das databases criadas:');
    for (const [key, value] of Object.entries(createdDatabases)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('\n✅ Todas as databases foram criadas e configuradas!');
    console.log('💡 Reinicie o servidor para aplicar as mudanças.\n');

  } catch (error: any) {
    console.error('\n❌ Erro durante a criação:', error.message);
    if (error.code === 'object_not_found') {
      console.error('💡 Dica: Verifique se o NOTION_TOKEN tem permissões para criar databases.');
    }
    process.exit(1);
  }
}

main().catch(console.error);

