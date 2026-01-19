// Script para arquivar (deletar) databases duplicadas do Vende Mais Obras
// Execute: npx tsx server/scripts/cleanupVendeMaisObrasDatabases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { initNotionClient } from '../lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const PARENT_PAGE_ID = '2e884566a5fa805eaac4fadb2b302d6a'; // ID da página "Vende-mais-obras-Databases"

// IDs das databases duplicadas que devem ser arquivadas (mantendo apenas as mais recentes)
const DUPLICADAS_TO_DELETE = [
  '2e984566a5fa811fa9d1d0494f420a92', // Serviços SINAPI (duplicada)
  '2e984566a5fa81409175da00a90e178a', // Serviços SINAPI (duplicada)
  '2e984566a5fa815eb349d8ecfd7708c1', // Usuários (duplicada)
  '2e984566a5fa811fac13cde5a45b2b8e', // Usuários (duplicada)
  '2e984566a5fa81018073e953da1ec6a6', // Clientes (duplicada)
  '2e984566a5fa81549fb8edac2eb2a7c0', // Orçamentos (duplicada)
];

async function cleanupDatabases() {
  console.log('🗑️  Iniciando limpeza de databases duplicadas...\n');

  try {
    const client = initNotionClient();

    let sucesso = 0;
    let erros = 0;

    for (const dbId of DUPLICADAS_TO_DELETE) {
      try {
        // Arquivar a database (equivalente a deletar no Notion)
        await client.databases.update({
          database_id: dbId,
          archived: true
        });
        
        console.log(`✅ Database ${dbId} arquivada com sucesso`);
        sucesso++;
      } catch (error: any) {
        if (error.code === 'object_not_found') {
          console.log(`⚠️  Database ${dbId} já não existe ou não foi encontrada`);
        } else {
          console.error(`❌ Erro ao arquivar database ${dbId}:`, error.message);
          erros++;
        }
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ ${sucesso} database(s) arquivada(s) com sucesso`);
    if (erros > 0) {
      console.log(`   ❌ ${erros} erro(s) encontrado(s)`);
    }

    console.log(`\n✅ Limpeza concluída!`);
    console.log(`\n📝 Próximos passos:`);
    console.log(`1. Verifique no Notion se as databases duplicadas foram removidas`);
    console.log(`2. Compartilhe apenas as databases corretas com a integração do Notion`);
    console.log(`3. Os IDs corretos já estão no .env.local\n`);

  } catch (error: any) {
    console.error('❌ Erro ao limpar databases:', error.message);
    process.exit(1);
  }
}

// Executar
cleanupDatabases();



