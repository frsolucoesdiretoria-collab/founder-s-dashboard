/**
 * Script para deletar todas as actions do Notion
 * 
 * Este script:
 * 1. Busca todas as actions na database do Notion
 * 2. Deleta todas usando archived: true
 * 3. Gera relatório do que foi deletado
 * 
 * ⚠️ ATENÇÃO: Este script DELETA TODAS as actions. Use com cuidado!
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/delete-all-actions.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente de .env.local se existir
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getActions, initNotionClient } from '../server/lib/notionDataLayer';
import { Client } from '@notionhq/client';
import { getDatabaseId } from '../src/lib/notion/schema';

// Helper para delay (evitar rate limits)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🗑️  Iniciando deleção de todas as actions...\n');

  try {
    // Inicializar cliente Notion
    const client = initNotionClient();
    const dbId = getDatabaseId('Actions');
    if (!dbId) {
      throw new Error('NOTION_DB_ACTIONS not configured');
    }

    // PASSO 1: Buscar todas as actions
    console.log('🔍 PASSO 1: Buscando todas as actions no Notion...\n');
    
    const allActions = await getActions();
    console.log(`✅ Encontradas ${allActions.length} actions no total\n`);

    if (allActions.length === 0) {
      console.log('ℹ️  Nenhuma action encontrada. Nada a deletar.');
      return;
    }

    // PASSO 2: Deletar todas as actions (usando archived: true)
    console.log('🗑️  PASSO 2: Deletando actions...\n');
    
    let deletedCount = 0;
    const deletedActions: Array<{ id: string; name: string }> = [];

    for (let i = 0; i < allActions.length; i++) {
      const action = allActions[i];
      try {
        await client.pages.update({
          page_id: action.id,
          archived: true
        });
        deletedCount++;
        deletedActions.push({ id: action.id, name: action.Name });
        console.log(`  [${i + 1}/${allActions.length}] ✅ Deletada: ${action.Name}`);
        await delay(300); // Delay para evitar rate limits
      } catch (error: any) {
        console.error(`  [${i + 1}/${allActions.length}] ❌ Erro ao deletar ${action.Name}:`, error.message);
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✅ FINALIZAÇÃO CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log(`📊 Total de actions deletadas: ${deletedCount}/${allActions.length}`);
    console.log('');
    console.log('📝 Relatório de ações deletadas:');
    deletedActions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action.name} (ID: ${action.id.substring(0, 8)}...)`);
    });
    console.log('');
    console.log('🎉 Processo de deleção concluído!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Executar script
main();

















