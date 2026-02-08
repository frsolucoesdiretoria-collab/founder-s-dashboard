/**
 * Script para criar todas as 30 tarefas de Janeiro 2026
 * 
 * Este script:
 * 1. Busca as metas necessárias no Notion por nome
 * 2. Cria todas as 30 tarefas relacionadas às metas
 * 
 * ⚠️ INSTRUÇÃO CRÍTICA: Este script executa TODAS as tarefas. Não pula nenhuma etapa.
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/create-janeiro-2026-tasks.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente de .env.local se existir
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getGoals, createAction, initNotionClient } from '../server/lib/notionDataLayer';
import type { NotionAction } from '../src/lib/notion/types';

// Helper para delay (evitar rate limits)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para encontrar meta por nome
function findGoalByName(goals: any[], name: string): any | null {
  // Try exact match first
  let found = goals.find(g => g.Name === name);
  
  // Try fuzzy match (contains)
  if (!found) {
    found = goals.find(g => 
      g.Name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(g.Name.toLowerCase())
    );
  }
  
  return found || null;
}

// Definir todas as tarefas conforme TAREFAS_JANEIRO_2026.md
const tasks = {
  // META 1: Contatos Ativados (22 tarefas)
  contatosAtivados: [
    { Name: "Ativação LinkedIn - Lote 1 (5 contatos)", Date: "2026-01-02", WeekKey: "2026-W01", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 2 (5 contatos)", Date: "2026-01-03", WeekKey: "2026-W01", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 3 (5 contatos)", Date: "2026-01-06", WeekKey: "2026-W02", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 4 (5 contatos)", Date: "2026-01-07", WeekKey: "2026-W02", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 5 (5 contatos)", Date: "2026-01-08", WeekKey: "2026-W02", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 6 (5 contatos)", Date: "2026-01-09", WeekKey: "2026-W02", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 7 (5 contatos)", Date: "2026-01-10", WeekKey: "2026-W02", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 8 (5 contatos)", Date: "2026-01-13", WeekKey: "2026-W03", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 9 (5 contatos)", Date: "2026-01-14", WeekKey: "2026-W03", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 10 (5 contatos)", Date: "2026-01-15", WeekKey: "2026-W03", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 11 (5 contatos)", Date: "2026-01-16", WeekKey: "2026-W03", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 12 (5 contatos)", Date: "2026-01-17", WeekKey: "2026-W03", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 13 (5 contatos)", Date: "2026-01-20", WeekKey: "2026-W04", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 14 (5 contatos)", Date: "2026-01-21", WeekKey: "2026-W04", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 15 (5 contatos)", Date: "2026-01-22", WeekKey: "2026-W04", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 16 (5 contatos)", Date: "2026-01-23", WeekKey: "2026-W04", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 17 (5 contatos)", Date: "2026-01-24", WeekKey: "2026-W04", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 18 (5 contatos)", Date: "2026-01-27", WeekKey: "2026-W05", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 19 (5 contatos)", Date: "2026-01-28", WeekKey: "2026-W05", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 20 (5 contatos)", Date: "2026-01-29", WeekKey: "2026-W05", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 21 (5 contatos)", Date: "2026-01-30", WeekKey: "2026-W05", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
    { Name: "Ativação LinkedIn - Lote 22 (5 contatos)", Date: "2026-01-31", WeekKey: "2026-W05", Contribution: 5, Notes: "Conectar e convidar 5 pessoas do LinkedIn para reunião" },
  ],
  // META 6: Entrada em Grupos (8 tarefas)
  entradaGrupos: [
    { Name: "Pesquisa e Análise de Grupos - Grupo 1", Date: "2026-01-06", WeekKey: "2026-W02", Contribution: 0.5, Notes: "Pesquisar grupos de networking relevantes (BNI, Rotary, grupos de empreendedores, etc.) e analisar qualidades e requisitos" },
    { Name: "Contato Inicial - Grupo 1", Date: "2026-01-08", WeekKey: "2026-W02", Contribution: 0.5, Notes: "Fazer contato inicial com responsável do grupo, entender processo de entrada e requisitos" },
    { Name: "Participação em Evento/Reunião - Grupo 1", Date: "2026-01-13", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Participar de evento ou reunião do grupo como visitante/observador" },
    { Name: "Formalização de Entrada - Grupo 1", Date: "2026-01-20", WeekKey: "2026-W04", Contribution: 0.5, Notes: "Completar processo de entrada formal no grupo (pagamento, documentação, etc.) - TOTAL: 1 grupo" },
    { Name: "Pesquisa e Análise de Grupos - Grupo 2", Date: "2026-01-15", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Pesquisar segundo grupo de networking relevante e analisar qualidades e requisitos" },
    { Name: "Contato Inicial - Grupo 2", Date: "2026-01-17", WeekKey: "2026-W03", Contribution: 0.5, Notes: "Fazer contato inicial com responsável do segundo grupo" },
    { Name: "Participação em Evento/Reunião - Grupo 2", Date: "2026-01-22", WeekKey: "2026-W04", Contribution: 0.5, Notes: "Participar de evento ou reunião do segundo grupo como visitante" },
    { Name: "Formalização de Entrada - Grupo 2", Date: "2026-01-29", WeekKey: "2026-W05", Contribution: 0.5, Notes: "Completar processo de entrada formal no segundo grupo - TOTAL: 2 grupos" },
  ]
};

async function main() {
  console.log('🚀 Iniciando criação de tarefas de Janeiro 2026...\n');

  try {
    // Inicializar cliente Notion
    initNotionClient();
    
    // PASSO 1: Buscar todas as metas e encontrar as necessárias
    console.log('🔍 PASSO 1: Buscando metas no Notion...\n');
    
    const allGoals = await getGoals();
    console.log(`✅ Encontradas ${allGoals.length} metas no total\n`);
    
    // Buscar metas específicas
    const goalContatosAtivados = findGoalByName(allGoals, "Contatos Ativados - Janeiro 2026");
    const goalEntradaGrupos = findGoalByName(allGoals, "Entrada em Novos Grupos de Relacionamento - Janeiro 2026");

    if (!goalContatosAtivados) {
      throw new Error('❌ Meta "Contatos Ativados - Janeiro 2026" não encontrada. Certifique-se de que a meta foi criada.');
    }
    if (!goalEntradaGrupos) {
      throw new Error('❌ Meta "Entrada em Novos Grupos de Relacionamento - Janeiro 2026" não encontrada. Certifique-se de que a meta foi criada.');
    }

    console.log(`✅ Meta Contatos Ativados encontrada: ${goalContatosAtivados.Name} (ID: ${goalContatosAtivados.id})`);
    console.log(`✅ Meta Entrada em Grupos encontrada: ${goalEntradaGrupos.Name} (ID: ${goalEntradaGrupos.id})\n`);

    // PASSO 2: Criar todas as tarefas
    console.log('📝 PASSO 2: Criando tarefas...\n');

    let totalCreated = 0;

    // Criar tarefas para Meta 1 (Contatos Ativados) - 22 tarefas
    console.log(`  📋 Criando ${tasks.contatosAtivados.length} tarefas para Contatos Ativados...`);
    for (let i = 0; i < tasks.contatosAtivados.length; i++) {
      const task = tasks.contatosAtivados[i];
      const action: Partial<NotionAction> = {
        Name: task.Name,
        Type: "Ativação de Rede",
        Date: task.Date,
        Done: false,
        Contribution: task.Contribution,
        Goal: goalContatosAtivados.id,
        PublicVisible: true,
        Notes: task.Notes
      };
      
      await createAction(action);
      totalCreated++;
      console.log(`    [${i + 1}/${tasks.contatosAtivados.length}] ✅ ${task.Name}`);
      await delay(300); // Delay para evitar rate limits
    }
    console.log('');

    // Criar tarefas para Meta 6 (Entrada em Grupos) - 8 tarefas
    console.log(`  📋 Criando ${tasks.entradaGrupos.length} tarefas para Entrada em Grupos...`);
    for (let i = 0; i < tasks.entradaGrupos.length; i++) {
      const task = tasks.entradaGrupos[i];
      const action: Partial<NotionAction> = {
        Name: task.Name,
        Type: "Ativação de Rede",
        Date: task.Date,
        Done: false,
        Contribution: task.Contribution,
        Goal: goalEntradaGrupos.id,
        PublicVisible: true,
        Notes: task.Notes
      };
      
      await createAction(action);
      totalCreated++;
      console.log(`    [${i + 1}/${tasks.entradaGrupos.length}] ✅ ${task.Name}`);
      await delay(300); // Delay para evitar rate limits
    }
    console.log('');

    // Resumo final
    console.log('='.repeat(60));
    console.log('✅ FINALIZAÇÃO CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log(`📊 Total de tarefas criadas: ${totalCreated}`);
    console.log(`   - Meta 1 (Contatos Ativados): ${tasks.contatosAtivados.length} tarefas`);
    console.log(`   - Meta 6 (Entrada em Grupos): ${tasks.entradaGrupos.length} tarefas`);
    console.log('');
    console.log('📝 Verificação:');
    console.log(`   ✅ Todas as ${tasks.contatosAtivados.length} tarefas da Meta 1 foram criadas`);
    console.log(`   ✅ Todas as ${tasks.entradaGrupos.length} tarefas da Meta 6 foram criadas`);
    console.log(`   ✅ Total de Contribution Meta 1: ${tasks.contatosAtivados.length * 5} contatos (22 × 5 = 110)`);
    console.log(`   ✅ Total de Contribution Meta 6: ${tasks.entradaGrupos.length * 0.5} grupos (8 × 0.5 = 2.0)`);
    console.log('');
    console.log('🎉 Todas as tarefas foram criadas com sucesso!');
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

