/**
 * Script para zerar Goal "Contatos Ativados - Janeiro 2026"
 * 
 * Este script:
 * 1. Busca Goal "Contatos Ativados - Janeiro 2026" pelo nome
 * 2. Atualiza campo Actual para 0
 * 3. Confirma que foi zerado
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/reset-goal-contatos-ativados.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente de .env.local se existir
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { findGoalByName, updateGoal, initNotionClient } from '../server/lib/notionDataLayer';

async function main() {
  console.log('🔄 Iniciando reset do Goal "Contatos Ativados - Janeiro 2026"...\n');

  try {
    // Inicializar cliente Notion
    initNotionClient();

    // PASSO 1: Buscar Goal pelo nome
    console.log('🔍 PASSO 1: Buscando Goal "Contatos Ativados - Janeiro 2026"...\n');
    
    const goal = await findGoalByName('Contatos Ativados - Janeiro 2026');

    if (!goal) {
      throw new Error('❌ Goal "Contatos Ativados - Janeiro 2026" não encontrada. Certifique-se de que a goal existe.');
    }

    console.log(`✅ Goal encontrada: ${goal.Name}`);
    console.log(`   ID: ${goal.id}`);
    console.log(`   Actual atual: ${goal.Actual}`);
    console.log(`   Target: ${goal.Target}\n`);

    // PASSO 2: Zerar Actual
    console.log('🔄 PASSO 2: Zerando campo Actual...\n');
    
    const updatedGoal = await updateGoal(goal.id, { Actual: 0 });

    console.log('✅ Goal atualizada com sucesso!');
    console.log(`   Actual após update: ${updatedGoal.Actual}\n`);

    // Verificação final
    if (updatedGoal.Actual === 0) {
      console.log('='.repeat(60));
      console.log('✅ FINALIZAÇÃO CONCLUÍDA!');
      console.log('='.repeat(60));
      console.log(`✅ Goal "${updatedGoal.Name}" foi zerada com sucesso`);
      console.log(`   Actual: ${updatedGoal.Actual}`);
      console.log(`   Target: ${updatedGoal.Target}`);
      console.log('='.repeat(60));
    } else {
      throw new Error(`❌ Erro: Actual não foi zerado. Valor atual: ${updatedGoal.Actual}`);
    }

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




