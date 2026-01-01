// Script para atualizar Units dos KPIs com nomes descritivos
// Execute: npx tsx scripts/update-kpi-units.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { getAllKPIsIncludingInactive, updateKPI } from '../server/lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mapping de KPIs para suas unidades apropriadas
// Baseado no nome do KPI, determina a unidade correta
function getUnitForKPI(kpiName: string, currentUnit: string): string | null {
  const name = kpiName.toLowerCase();
  
  // Se já está correto (não é "count"), manter
  if (currentUnit && currentUnit.toLowerCase() !== 'count' && currentUnit.toLowerCase() !== 'percent') {
    return null; // Não atualizar se já tem unidade descritiva
  }

  // Mapeamentos específicos
  if (name.includes('agente') || name.includes('agent')) {
    return 'agentes';
  }
  if (name.includes('diário') || name.includes('journal')) {
    return 'diários';
  }
  if (name.includes('café') || name.includes('coffee') || name.includes('network')) {
    return 'cafés';
  }
  if (name.includes('proposta') || name.includes('proposal')) {
    return 'propostas';
  }
  if (name.includes('candidato') || name.includes('candidate')) {
    return 'candidatos';
  }
  if (name.includes('automação') || name.includes('automation')) {
    return 'automações';
  }
  if (name.includes('playbook')) {
    return 'playbooks';
  }
  if (name.includes('indicação') || name.includes('referral')) {
    return 'indicações';
  }
  if (name.includes('vendedor') || name.includes('seller')) {
    return 'vendedores';
  }
  if (name.includes('depoimento') || name.includes('testimonial')) {
    return 'depoimentos';
  }
  if (name.includes('rotina') || name.includes('routine')) {
    return 'rotinas';
  }
  if (name.includes('evento') || name.includes('event')) {
    return 'eventos';
  }
  if (name.includes('reunião') || name.includes('meeting')) {
    return 'reuniões';
  }
  if (name.includes('follow-up') || name.includes('followup')) {
    return 'follow-ups';
  }
  if (name.includes('ativação') || name.includes('activation')) {
    return 'ativações';
  }
  if (name.includes('revisão') || name.includes('review')) {
    return 'revisões';
  }
  if (name.includes('momento') || name.includes('moment')) {
    return 'momentos';
  }
  if (name.includes('percent') || name.includes('%')) {
    return '%';
  }
  
  // Se contém "count" e não encontrou mapeamento específico, tentar inferir
  if (name.includes('_') || name.includes(' ')) {
    // Tentar extrair do nome
    const parts = name.split(/[_\s]+/);
    const lastPart = parts[parts.length - 1];
    
    // Se termina com número/ano, pegar penúltima parte
    if (/^\d+$/.test(lastPart) && parts.length > 1) {
      const unitPart = parts[parts.length - 2];
      if (unitPart && unitPart.length > 2) {
        // Converter para plural em português
        return unitPart.toLowerCase() + 's';
      }
    }
  }
  
  // Fallback: usar "itens" se não conseguir determinar
  return 'itens';
}

async function main() {
  console.log('🔄 Atualizando Units dos KPIs...\n');

  try {
    // Get all KPIs
    const allKPIs = await getAllKPIsIncludingInactive();
    
    console.log(`📊 KPIs encontrados: ${allKPIs.length}\n`);

    const updates: Array<{ id: string; name: string; oldUnit: string; newUnit: string }> = [];

    // Check each KPI
    for (const kpi of allKPIs) {
      const newUnit = getUnitForKPI(kpi.Name, kpi.Unit);
      
      if (newUnit && newUnit !== kpi.Unit) {
        updates.push({
          id: kpi.id,
          name: kpi.Name,
          oldUnit: kpi.Unit || '(vazio)',
          newUnit: newUnit
        });
      }
    }

    if (updates.length === 0) {
      console.log('✅ Todas as Units já estão atualizadas. Nenhuma alteração necessária.');
      return;
    }

    console.log(`🔄 Preparando ${updates.length} atualizações de Units...\n`);
    
    // Preview changes
    updates.forEach(({ name, oldUnit, newUnit }) => {
      console.log(`   "${name}": "${oldUnit}" → "${newUnit}"`);
    });

    console.log(`\n🔄 Confirmando atualização de ${updates.length} KPIs...\n`);

    // Update KPIs with rate limiting
    let updated = 0;
    for (const update of updates) {
      try {
        await updateKPI(update.id, { Unit: update.newUnit });
        console.log(`   ✓ "${update.name}": "${update.newUnit}"`);
        updated++;
        
        // Rate limiting: wait 350ms between requests
        if (updated < updates.length) {
          await delay(350);
        }
      } catch (error: any) {
        console.error(`   ✗ Erro ao atualizar "${update.name}": ${error.message}`);
      }
    }

    console.log(`\n✅ ${updated}/${updates.length} Units atualizadas com sucesso!`);

  } catch (error: any) {
    console.error('\n❌ Erro ao atualizar Units:', error.message);
    process.exit(1);
  }
}

main();






