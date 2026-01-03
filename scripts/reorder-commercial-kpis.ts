// Script para colocar KPIs comerciais no topo do dashboard
// Execute: npx tsx scripts/reorder-commercial-kpis.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { getAllKPIsIncludingInactive, updateKPI } from '../server/lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔄 Reordenando KPIs comerciais para o topo...\n');

  try {
    // Get all KPIs
    const allKPIs = await getAllKPIsIncludingInactive();
    
    // Separate commercial and non-commercial KPIs
    const commercialKPIs = allKPIs.filter(kpi => 
      kpi.Category.toUpperCase() === 'COMERCIAL'
    );
    const nonCommercialKPIs = allKPIs.filter(kpi => 
      kpi.Category.toUpperCase() !== 'COMERCIAL'
    );

    console.log(`📊 KPIs encontrados: ${allKPIs.length}`);
    console.log(`   - Comerciais: ${commercialKPIs.length}`);
    console.log(`   - Outros: ${nonCommercialKPIs.length}\n`);

    // Sort commercial KPIs by current SortOrder (to maintain relative order)
    commercialKPIs.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
    
    // Sort non-commercial KPIs by current SortOrder (to maintain relative order)
    nonCommercialKPIs.sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));

    // Assign new SortOrder values
    let newSortOrder = 1;
    const updates: Array<{ id: string; name: string; oldOrder: number; newOrder: number }> = [];

    // First, assign to commercial KPIs
    for (const kpi of commercialKPIs) {
      if (kpi.SortOrder !== newSortOrder) {
        updates.push({
          id: kpi.id,
          name: kpi.Name,
          oldOrder: kpi.SortOrder,
          newOrder: newSortOrder
        });
      }
      newSortOrder++;
    }

    // Then, assign to non-commercial KPIs
    for (const kpi of nonCommercialKPIs) {
      if (kpi.SortOrder !== newSortOrder) {
        updates.push({
          id: kpi.id,
          name: kpi.Name,
          oldOrder: kpi.SortOrder,
          newOrder: newSortOrder
        });
      }
      newSortOrder++;
    }

    if (updates.length === 0) {
      console.log('✅ KPIs comerciais já estão no topo. Nenhuma alteração necessária.');
      return;
    }

    console.log(`🔄 Atualizando ${updates.length} KPIs...\n`);

    // Update KPIs with rate limiting
    let updated = 0;
    for (const update of updates) {
      try {
        await updateKPI(update.id, { SortOrder: update.newOrder });
        console.log(`   ✓ [${update.newOrder}] ${update.name} (era ${update.oldOrder})`);
        updated++;
        
        // Rate limiting: wait 350ms between requests (Notion API limit is ~3 req/sec)
        if (updated < updates.length) {
          await delay(350);
        }
      } catch (error: any) {
        console.error(`   ✗ Erro ao atualizar ${update.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ ${updated}/${updates.length} KPIs atualizados com sucesso!`);
    console.log(`\n📊 Ordem final:`);
    console.log(`   - KPIs Comerciais: SortOrder 1-${commercialKPIs.length}`);
    console.log(`   - Outros KPIs: SortOrder ${commercialKPIs.length + 1}-${allKPIs.length}`);

  } catch (error: any) {
    console.error('\n❌ Erro ao reordenar KPIs:', error.message);
    process.exit(1);
  }
}

main();










