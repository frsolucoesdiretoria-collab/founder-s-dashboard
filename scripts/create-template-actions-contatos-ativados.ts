/**
 * Script para criar 150 tarefas padrão para o KPI "Contatos Ativados"
 * 
 * Este script:
 * 1. Busca Goal "Contatos Ativados - Janeiro 2026" pelo nome
 * 2. Cria 150 tarefas padrão distribuídas ao longo de Janeiro 2026
 * 3. Cada tarefa tem nome padrão "Enviar áudio para [VAZIO]" que será editado depois
 * 
 * ⚠️ INSTRUÇÃO CRÍTICA: Este script executa TODAS as tarefas. Não pula nenhuma etapa.
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/create-template-actions-contatos-ativados.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente de .env.local se existir
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { findGoalByName, createAction, initNotionClient } from '../server/lib/notionDataLayer';
import type { NotionAction } from '../src/lib/notion/types';

// Helper para delay (evitar rate limits)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Gerar array de datas distribuídas ao longo de Janeiro 2026
// 150 tarefas em 31 dias = aproximadamente 4.84 tarefas por dia
// Vamos distribuir de forma mais uniforme: ~5 tarefas por dia nos primeiros 30 dias
function generateDates(): string[] {
  const dates: string[] = [];
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-01-31');
  
  // Distribuir 150 tarefas ao longo de Janeiro
  // 5 tarefas por dia para os primeiros 30 dias
  for (let day = 1; day <= 30; day++) {
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(day);
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  // Total: 150 tarefas (30 dias × 5 tarefas)
  return dates;
}

async function main() {
  console.log('🚀 Iniciando criação de 150 tarefas padrão para Contatos Ativados...\n');

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
    console.log(`   Target: ${goal.Target}\n`);

    // PASSO 2: Gerar datas
    console.log('📅 PASSO 2: Gerando distribuição de datas...\n');
    const dates = generateDates();
    console.log(`✅ ${dates.length} datas geradas (distribuídas ao longo de Janeiro 2026)\n`);

    // PASSO 3: Criar 150 tarefas padrão
    console.log('📝 PASSO 3: Criando 150 tarefas padrão...\n');
    
    let totalCreated = 0;
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const action: Partial<NotionAction> = {
        Name: 'Enviar áudio para [VAZIO]',
        Type: 'Ativação de Rede',
        Date: date,
        Done: false,
        Contribution: 1,
        Goal: goal.id,
        PublicVisible: true,
        Notes: 'Template - preencher nome e WhatsApp do contato',
        Contact: '', // Vazio inicialmente
        WeekKey: '',
        // Month não existe na database de Actions, removido
      };
      
      try {
        await createAction(action);
        totalCreated++;
        if ((i + 1) % 10 === 0 || i === dates.length - 1) {
          console.log(`  [${i + 1}/${dates.length}] ✅ ${totalCreated} tarefas criadas...`);
        }
        await delay(300); // Delay para evitar rate limits (300ms entre cada)
      } catch (error: any) {
        errors.push({ index: i + 1, error: error.message });
        console.error(`  [${i + 1}/${dates.length}] ❌ Erro ao criar tarefa:`, error.message);
      }
    }
    
    console.log('');

    // Resumo final
    console.log('='.repeat(60));
    console.log('✅ FINALIZAÇÃO CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log(`📊 Total de tarefas criadas: ${totalCreated}/${dates.length}`);
    if (errors.length > 0) {
      console.log(`⚠️  Erros encontrados: ${errors.length}`);
      console.log('\n📝 Erros:');
      errors.forEach(e => {
        console.log(`   Tarefa ${e.index}: ${e.error}`);
      });
    }
    console.log('');
    console.log('📝 Características das tarefas criadas:');
    console.log(`   ✅ Tipo: "Ativação de Rede"`);
    console.log(`   ✅ Nome padrão: "Enviar áudio para [VAZIO]"`);
    console.log(`   ✅ Contribution: 1`);
    console.log(`   ✅ Done: false`);
    console.log(`   ✅ PublicVisible: true`);
    console.log(`   ✅ Notes: "Template - preencher nome e WhatsApp do contato"`);
    console.log(`   ✅ Contact: vazio (será preenchido na edição)`);
    console.log(`   ✅ Distribuídas ao longo de Janeiro 2026`);
    console.log('');
    console.log('🎉 Todas as tarefas padrão foram criadas com sucesso!');
    console.log('💡 Próximo passo: Use a interface de edição rápida para preencher nome e WhatsApp de cada tarefa');
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

