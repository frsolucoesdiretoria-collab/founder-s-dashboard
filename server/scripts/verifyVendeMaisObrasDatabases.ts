// Script para verificar se as databases do Vende Mais Obras estão acessíveis
// Execute: npx tsx server/scripts/verifyVendeMaisObrasDatabases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { initNotionClient, assertEnv } from '../lib/notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const DATABASES_TO_VERIFY = [
  'Servicos',
  'Usuarios',
  'Clientes',
  'Orcamentos',
  'Leads'
];

async function verifyDatabases() {
  console.log('🔍 Verificando acesso às databases do Vende Mais Obras...\n');

  try {
    const client = initNotionClient();
    const results: Array<{ name: string; id: string; accessible: boolean; error?: string }> = [];

    for (const dbName of DATABASES_TO_VERIFY) {
      try {
        const dbId = getDatabaseId(dbName);
        
        if (!dbId) {
          results.push({
            name: dbName,
            id: 'NÃO CONFIGURADO',
            accessible: false,
            error: 'ID não encontrado no .env.local'
          });
          continue;
        }

        console.log(`📦 Verificando ${dbName} (ID: ${dbId})...`);
        
        // Tentar acessar a database
        const db = await client.databases.retrieve({
          database_id: dbId
        });

        // Tentar fazer uma query simples
        await client.databases.query({
          database_id: dbId,
          page_size: 1
        });

        results.push({
          name: dbName,
          id: dbId,
          accessible: true
        });

        console.log(`   ✅ Acessível - Título: ${db.title[0]?.plain_text || 'Sem título'}\n`);

      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        results.push({
          name: dbName,
          id: getDatabaseId(dbName) || 'NÃO ENCONTRADO',
          accessible: false,
          error: errorMsg
        });

        console.log(`   ❌ Não acessível: ${errorMsg}\n`);

        if (errorMsg.includes('not found') || errorMsg.includes('object_not_found')) {
          console.log(`   💡 Ação necessária: Compartilhe a database "${dbName}" com a integração do Notion`);
        }
      }
    }

    console.log('\n📊 Resumo da Verificação:\n');
    console.log('┌─────────────────────┬──────────────────────────────────────┬─────────────┬─────────────────────────┐');
    console.log('│ Database            │ ID                                    │ Acessível   │ Observações             │');
    console.log('├─────────────────────┼──────────────────────────────────────┼─────────────┼─────────────────────────┤');

    for (const result of results) {
      const name = result.name.padEnd(20);
      const id = (result.id.length > 36 ? result.id.substring(0, 36) + '...' : result.id).padEnd(36);
      const accessible = (result.accessible ? '✅ SIM' : '❌ NÃO').padEnd(12);
      const error = result.error ? result.error.substring(0, 22) : 'OK';
      
      console.log(`│ ${name} │ ${id} │ ${accessible} │ ${error.padEnd(22)} │`);
    }

    console.log('└─────────────────────┴──────────────────────────────────────┴─────────────┴─────────────────────────┘');

    const accessibleCount = results.filter(r => r.accessible).length;
    const totalCount = results.length;

    console.log(`\n📈 Resultado: ${accessibleCount}/${totalCount} databases acessíveis\n`);

    if (accessibleCount < totalCount) {
      console.log('⚠️  AÇÕES NECESSÁRIAS:\n');
      console.log('1. Abra cada database no Notion');
      console.log('2. Clique nos "..." no canto superior direito');
      console.log('3. Selecione "Add connections" ou "Conectar"');
      console.log('4. Escolha sua integração do Notion');
      console.log('5. Repita para todas as databases não acessíveis\n');
      
      const notAccessible = results.filter(r => !r.accessible);
      console.log('Databases que precisam ser compartilhadas:');
      notAccessible.forEach(db => {
        console.log(`   - ${db.name} (${db.id})`);
      });
    } else {
      console.log('✅ Todas as databases estão acessíveis! O backend está pronto para uso.\n');
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar databases:', error.message);
    process.exit(1);
  }
}

// Executar
verifyDatabases();








