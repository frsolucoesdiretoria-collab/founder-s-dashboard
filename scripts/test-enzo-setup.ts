/**
 * Script para testar a configuração completa do Dashboard Enzo
 * 
 * Uso: npx tsx scripts/test-enzo-setup.ts
 * 
 * Testa:
 * - Se todas as databases estão configuradas
 * - Se os KPIs estão carregando
 * - Se as metas estão carregando
 * - Se as ações estão carregando
 * - Se os contatos estão funcionando (se configurado)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN || NOTION_TOKEN.startsWith('<<<')) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

interface DatabaseConfig {
  name: string;
  envVar: string;
  dbId?: string;
  required: boolean;
}

const databases: DatabaseConfig[] = [
  { name: 'KPIs_Enzo', envVar: 'NOTION_DB_KPIS_ENZO', required: true },
  { name: 'Goals_Enzo', envVar: 'NOTION_DB_GOALS_ENZO', required: true },
  { name: 'Actions_Enzo', envVar: 'NOTION_DB_ACTIONS_ENZO', required: true },
  { name: 'Contacts_Enzo', envVar: 'NOTION_DB_CONTACTS_ENZO', required: false },
];

/**
 * Verificar se database está configurada
 */
function checkDatabaseConfig(db: DatabaseConfig): boolean {
  const dbId = process.env[db.envVar];
  if (!dbId || dbId.startsWith('<<<')) {
    if (db.required) {
      console.error(`❌ ${db.envVar} não configurado`);
      return false;
    } else {
      console.warn(`⚠️  ${db.envVar} não configurado (opcional)`);
      return false;
    }
  }
  
  if (dbId.length !== 32) {
    console.warn(`⚠️  ${db.envVar} tem formato inválido (esperado 32 caracteres, encontrado ${dbId.length})`);
    return false;
  }
  
  db.dbId = dbId;
  return true;
}

/**
 * Testar acesso à database
 */
async function testDatabaseAccess(db: DatabaseConfig): Promise<{ success: boolean; count?: number; error?: string }> {
  if (!db.dbId) {
    return { success: false, error: 'Database ID não configurado' };
  }

  try {
    const response = await client.databases.query({
      database_id: db.dbId,
      page_size: 1,
    });

    return { success: true, count: response.results.length };
  } catch (error: any) {
    if (error.code === 'object_not_found') {
      return { success: false, error: 'Database não encontrada - verifique se o ID está correto' };
    } else if (error.code === 'unauthorized') {
      return { success: false, error: 'Sem permissão - verifique se o NOTION_TOKEN tem acesso à database' };
    } else {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }
}

/**
 * Testar KPIs
 */
async function testKPIs(): Promise<{ success: boolean; count?: number; names?: string[] }> {
  const dbId = process.env.NOTION_DB_KPIS_ENZO;
  if (!dbId) {
    return { success: false };
  }

  try {
    const response = await client.databases.query({
      database_id: dbId,
      filter: {
        property: 'Active',
        checkbox: { equals: true }
      },
      sorts: [{ property: 'SortOrder', direction: 'ascending' }]
    });

    const kpis = response.results.map((page: any) => {
      const props = page.properties;
      return props.Name?.title?.[0]?.plain_text || 'Sem nome';
    });

    return { success: true, count: kpis.length, names: kpis };
  } catch (error: any) {
    return { success: false };
  }
}

/**
 * Main
 */
async function main() {
  console.log('🧪 Testando configuração do Dashboard Enzo...\n');

  // Verificar configuração das databases
  console.log('📋 Verificando configuração das databases...');
  let allRequiredConfigured = true;
  
  for (const db of databases) {
    const configured = checkDatabaseConfig(db);
    if (db.required && !configured) {
      allRequiredConfigured = false;
    }
  }

  if (!allRequiredConfigured) {
    console.error('\n❌ Algumas databases obrigatórias não estão configuradas.');
    console.error('   Configure as variáveis no .env.local e tente novamente.\n');
    process.exit(1);
  }

  console.log('\n✅ Todas as databases obrigatórias estão configuradas!\n');

  // Testar acesso às databases
  console.log('🔍 Testando acesso às databases...\n');
  
  for (const db of databases) {
    if (!db.dbId) continue;

    process.stdout.write(`   Testando ${db.name}... `);
    const result = await testDatabaseAccess(db);
    
    if (result.success) {
      console.log(`✅ Acessível`);
    } else {
      console.log(`❌ Erro: ${result.error}`);
      if (db.required) {
        console.error(`\n❌ Database obrigatória ${db.name} não está acessível.`);
        process.exit(1);
      }
    }
  }

  // Testar KPIs
  console.log('\n📊 Testando KPIs...\n');
  const kpisResult = await testKPIs();
  
  if (kpisResult.success && kpisResult.count) {
    console.log(`✅ ${kpisResult.count} KPI(s) encontrado(s):`);
    kpisResult.names?.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
  } else {
    console.warn('⚠️  Nenhum KPI ativo encontrado ou erro ao buscar.');
  }

  console.log('\n✨ Testes concluídos!');
  console.log('\n📝 Se todos os testes passaram, você pode:');
  console.log('   1. Reiniciar o servidor');
  console.log('   2. Acessar /dashboard-enzo para verificar o dashboard\n');
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});





