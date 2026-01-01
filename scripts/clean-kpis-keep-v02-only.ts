/**
 * Script para deletar KPIs que NÃO pertencem ao Dashboard V02
 * 
 * ⚠️ ATENÇÃO: Este script DELETA permanentemente KPIs que não estão na lista do V02.
 * Certifique-se de ter feito backup antes de executar.
 * 
 * Este script:
 * 1. Busca todos os KPIs
 * 2. Define a lista de KPIs válidos do Dashboard V02 (18 KPIs)
 * 3. DELETA todos os KPIs que NÃO estão na lista
 * 4. Gera relatório detalhado
 * 
 * USO: NOTION_TOKEN=<token> npx tsx scripts/clean-kpis-keep-v02-only.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getAllKPIsIncludingInactive, initNotionClient } from '../server/lib/notionDataLayer';
import { Client } from '@notionhq/client';

// Lista de KPIs válidos do Dashboard V02 (exatamente como estão no setup)
const V02_KPI_NAMES = [
  "Contatos Ativados",
  "Cafés Agendados",
  "Cafés Executados",
  "Propostas de Crescimento Enviadas",
  "Vendas Feitas",
  "Entrada em Novos Grupos de Relacionamento",
  "Entrevistas de Emprego com Candidatos",
  "Indicações Coletadas",
  "Processos para Vendedores Finalizados",
  "Embaixadores da Marca Ativos",
  "Representantes Comerciais Ativos",
  "Clientes Ativos (Trimestral)",
  "Vendedores Contratados",
  "Time Interno de Produto",
  "Escritório Físico",
  "Clientes Ativos (Anual)",
  "Time de Vendas",
  "Time de Produto"
];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function deletePage(client: Client, pageId: string): Promise<void> {
  await client.pages.update({
    page_id: pageId,
    archived: true
  });
}

async function main() {
  console.log('🚀 Iniciando limpeza de KPIs (mantendo apenas Dashboard V02)...\n');

  try {
    const client = initNotionClient();
    
    // Normalizar nomes dos KPIs válidos
    const validNamesNormalized = new Set(
      V02_KPI_NAMES.map(name => normalizeName(name))
    );
    
    console.log(`📋 KPIs válidos do Dashboard V02: ${V02_KPI_NAMES.length}`);
    V02_KPI_NAMES.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    console.log('');
    
    // Buscar todos os KPIs
    console.log('📊 Buscando todos os KPIs...');
    const allKPIs = await getAllKPIsIncludingInactive();
    console.log(`✅ Encontrados ${allKPIs.length} KPIs no total\n`);

    // Separar KPIs válidos e inválidos
    const kpisToKeep: typeof allKPIs = [];
    const kpisToDelete: typeof allKPIs = [];
    
    allKPIs.forEach(kpi => {
      const normalized = normalizeName(kpi.Name);
      if (validNamesNormalized.has(normalized)) {
        kpisToKeep.push(kpi);
      } else {
        kpisToDelete.push(kpi);
      }
    });

    console.log(`✅ KPIs do V02 encontrados: ${kpisToKeep.length}`);
    console.log(`🗑️  KPIs para deletar: ${kpisToDelete.length}\n`);

    if (kpisToDelete.length === 0) {
      console.log('✅ Nenhum KPI inválido encontrado! Todos os KPIs são do Dashboard V02.');
      return;
    }

    console.log('📋 KPIs que serão DELETADOS:\n');
    kpisToDelete.forEach((kpi, index) => {
      console.log(`   ${index + 1}. "${kpi.Name}" (ID: ${kpi.id.substring(0, 8)}..., SortOrder: ${kpi.SortOrder || 0}, Active: ${kpi.Active})`);
    });
    console.log('');

    // Confirmar (em modo automático, deleta direto já que o usuário pediu)
    console.log('🗑️  Iniciando deleção...\n');

    let deletedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < kpisToDelete.length; i++) {
      const kpi = kpisToDelete[i];
      try {
        console.log(`[${i + 1}/${kpisToDelete.length}] 🗑️  Deletando: "${kpi.Name}" (ID: ${kpi.id.substring(0, 8)}...)`);
        await deletePage(client, kpi.id);
        deletedCount++;
        await delay(300); // Delay para evitar rate limits
      } catch (error: any) {
        console.error(`    ❌ Erro ao deletar KPI "${kpi.Name}":`, error.message);
        errorCount++;
      }
    }

    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('✅ LIMPEZA CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log(`📊 Resumo:`);
    console.log(`   - Total de KPIs encontrados: ${allKPIs.length}`);
    console.log(`   - KPIs válidos (V02): ${kpisToKeep.length}`);
    console.log(`   - KPIs deletados com sucesso: ${deletedCount}`);
    console.log(`   - Erros durante deleção: ${errorCount}`);
    console.log(`   - KPIs restantes: ${kpisToKeep.length}`);
    console.log('');
    console.log('🎉 Limpeza finalizada! Apenas KPIs do Dashboard V02 foram mantidos.');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();




