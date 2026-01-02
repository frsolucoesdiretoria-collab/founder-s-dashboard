/**
 * Script para deletar KPIs duplicados no Notion
 * 
 * ⚠️ ATENÇÃO: Este script DELETA permanentemente KPIs duplicados.
 * Certifique-se de ter feito backup antes de executar.
 * 
 * Este script:
 * 1. Busca todos os KPIs (incluindo inativos)
 * 2. Agrupa duplicados por nome (case-insensitive)
 * 3. Mantém apenas um KPI por nome (maior SortOrder, ou mais recente)
 * 4. DELETA os duplicados usando archive (archived=true no Notion)
 * 5. Gera relatório detalhado
 * 
 * USO: NOTION_TOKEN=<seu_token> npx tsx scripts/clean-duplicate-kpis.ts
 * OU: Configure as variáveis de ambiente no arquivo .env.local
 */

// Carregar variáveis de ambiente
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getAllKPIsIncludingInactive, initNotionClient } from '../server/lib/notionDataLayer';
import { Client } from '@notionhq/client';

// Helper para delay (evitar rate limits)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Normalizar nome para comparação
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Deletar página (arquivar) no Notion
async function deletePage(client: Client, pageId: string): Promise<void> {
  await client.pages.update({
    page_id: pageId,
    archived: true
  });
}

interface KPIGroup {
  name: string;
  kpis: Array<{
    id: string;
    name: string;
    sortOrder: number;
    active: boolean;
    lastEdited: string;
  }>;
}

async function main() {
  console.log('🚀 Iniciando limpeza de KPIs duplicados...\n');

  try {
    const client = initNotionClient();
    
    // 1. Buscar todos os KPIs
    console.log('📊 Buscando todos os KPIs...');
    const allKPIs = await getAllKPIsIncludingInactive();
    console.log(`✅ Encontrados ${allKPIs.length} KPIs no total\n`);

    // 2. Agrupar por nome normalizado
    const groups = new Map<string, KPIGroup>();
    
    allKPIs.forEach(kpi => {
      const normalized = normalizeName(kpi.Name);
      if (!groups.has(normalized)) {
        groups.set(normalized, {
          name: kpi.Name, // Usar o primeiro nome encontrado como representante
          kpis: []
        });
      }
      
      // Buscar last_edited_time da página original
      // Por enquanto vamos usar uma estratégia simplificada
      groups.get(normalized)!.kpis.push({
        id: kpi.id,
        name: kpi.Name,
        sortOrder: kpi.SortOrder || 0,
        active: kpi.Active,
        lastEdited: '' // Vamos buscar depois se necessário
      });
    });

    // 3. Identificar duplicados (grupos com mais de 1 KPI)
    const duplicates: KPIGroup[] = [];
    groups.forEach((group, normalizedName) => {
      if (group.kpis.length > 1) {
        duplicates.push(group);
      }
    });

    if (duplicates.length === 0) {
      console.log('✅ Nenhum KPI duplicado encontrado!');
      return;
    }

    console.log(`🔍 Encontrados ${duplicates.length} grupos de KPIs duplicados\n`);
    console.log('📋 Processando duplicados:\n');

    let totalDeleted = 0;
    let totalKept = 0;

    // 4. Para cada grupo de duplicados, decidir qual manter e deletar os outros
    for (let i = 0; i < duplicates.length; i++) {
      const group = duplicates[i];
      console.log(`Grupo ${i + 1}: "${group.name}" (${group.kpis.length} duplicados)`);

      // Ordenar por critérios (maior SortOrder primeiro, depois Active=true, depois mais recente)
      const sorted = [...group.kpis].sort((a, b) => {
        // Critério 1: Maior SortOrder
        if (b.sortOrder !== a.sortOrder) {
          return b.sortOrder - a.sortOrder;
        }
        // Critério 2: Active=true primeiro
        if (a.active !== b.active) {
          return a.active ? -1 : 1;
        }
        // Critério 3: Se igual, manter o primeiro (ou poderia buscar last_edited)
        return 0;
      });

      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`  ✅ MANTIDO: ID ${toKeep.id.substring(0, 8)}... - SortOrder: ${toKeep.sortOrder}, Active: ${toKeep.active}`);

      // 5. Deletar duplicados
      for (const kpiToDelete of toDelete) {
        try {
          console.log(`  🗑️  DELETANDO: ID ${kpiToDelete.id.substring(0, 8)}... - SortOrder: ${kpiToDelete.sortOrder}, Active: ${kpiToDelete.active}`);
          await deletePage(client, kpiToDelete.id);
          totalDeleted++;
          await delay(300); // Delay para evitar rate limits
        } catch (error: any) {
          console.error(`    ❌ Erro ao deletar KPI ${kpiToDelete.id}:`, error.message);
        }
      }

      totalKept++;
      console.log('');
      await delay(200); // Delay entre grupos
    }

    // 6. Relatório final
    console.log('='.repeat(60));
    console.log('✅ LIMPEZA CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log(`📊 Resumo:`);
    console.log(`   - Total de KPIs processados: ${allKPIs.length}`);
    console.log(`   - Grupos de duplicados encontrados: ${duplicates.length}`);
    console.log(`   - KPIs mantidos: ${totalKept}`);
    console.log(`   - KPIs deletados: ${totalDeleted}`);
    console.log('');
    console.log('🎉 Limpeza finalizada com sucesso!');
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





