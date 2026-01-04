// Script para renomear KPIs para português no Notion
// Execute: npx tsx scripts/rename-kpis-to-portuguese.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { getAllKPIsIncludingInactive, updateKPI } from '../server/lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Translation mapping
const translations: Record<string, string> = {
  'Active': 'ativos',
  'Collected': 'Coletados',
  'Completed': 'Completados',
  'Detected': 'Detectados',
  'Filled': 'Preenchidos',
  'Hired': 'Contratados',
  'Implemented': 'Implementadas',
  'Interviewed': 'Entrevistados',
  'Published': 'Publicados',
  'Received': 'Recebidos',
  'Standardized': 'Padronizadas',
  'AI': 'IA',
  'Agents': 'Agentes',
  'Automations': 'Automações',
  'Candidates': 'Candidatos',
  'Events': 'Eventos',
  'Growth Proposals': 'Propostas de crescimento',
  'GrowthProposals': 'Propostas de crescimento',
  'InternalAutomations': 'Automações internas',
  'Journals': 'Diários',
  'Meetings': 'Reuniões',
  'Network': 'Rede',
  'Playbooks': 'Playbooks',
  'Referrals': 'Indicações',
  'Sellers': 'Vendedores',
  'Testimonials': 'Depoimentos',
  'WeeklyRoutines': 'Rotinas semanais',
  'Weekly Review': 'Revisão semanal',
  'Weekly_Review': 'Revisão semanal',
  'FollowUps': 'Follow-ups',
  'AIAgents': 'Agentes de IA',
  'Network_Coffees': 'Cafés de networking',
  'Network_Activations': 'Ativações de rede',
  'GOL Moments': 'Momentos GOL',
  'GOL Moments_': 'Momentos GOL',
  '_2026': ' até o final de 2026',
  '2026': ' até o final de 2026',
  '_': ' ',
};

function translateToPortuguese(name: string): string {
  let translated = name;

  // Replace underscores with spaces
  translated = translated.replace(/_/g, ' ');

  // Apply translations
  for (const [key, value] of Object.entries(translations)) {
    const regex = new RegExp(key, 'gi');
    translated = translated.replace(regex, value);
  }

  // Capitalize first letter of each word
  translated = translated
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // Clean up multiple spaces
  translated = translated.replace(/\s+/g, ' ').trim();

  // Handle special cases
  translated = translated.replace(/De Até O Final/g, 'até o final');
  translated = translated.replace(/De De/g, 'de');
  translated = translated.replace(/Até O Final De 2026/g, 'até o final de 2026');
  translated = translated.replace(/Da De/g, 'da');
  translated = translated.replace(/Do De/g, 'do');

  return translated;
}

async function main() {
  console.log('🔄 Renomeando KPIs para português...\n');

  try {
    // Get all KPIs
    const allKPIs = await getAllKPIsIncludingInactive();
    
    // Filter KPIs that need translation (contain underscore or English words)
    const kpisToTranslate = allKPIs.filter(kpi => {
      const name = kpi.Name;
      return name.includes('_') || 
             /[A-Z][a-z]+_[A-Z]/.test(name) || // Has underscore pattern
             /2026|Active|Collected|Completed|Detected|Filled|Hired|Implemented|Interviewed|Published|Received|Standardized/i.test(name);
    });

    console.log(`📊 KPIs encontrados: ${allKPIs.length}`);
    console.log(`   - Para traduzir: ${kpisToTranslate.length}\n`);

    if (kpisToTranslate.length === 0) {
      console.log('✅ Todos os KPIs já estão em português. Nenhuma alteração necessária.');
      return;
    }

    const updates: Array<{ id: string; oldName: string; newName: string }> = [];

    // Generate new names
    for (const kpi of kpisToTranslate) {
      const newName = translateToPortuguese(kpi.Name);
      if (newName !== kpi.Name) {
        updates.push({
          id: kpi.id,
          oldName: kpi.Name,
          newName: newName
        });
      }
    }

    if (updates.length === 0) {
      console.log('✅ Todos os KPIs já estão traduzidos corretamente.');
      return;
    }

    console.log(`🔄 Preparando ${updates.length} renomeações...\n`);
    
    // Preview changes
    updates.forEach(({ oldName, newName }) => {
      console.log(`   "${oldName}" → "${newName}"`);
    });

    console.log(`\n🔄 Confirmando atualização de ${updates.length} KPIs...\n`);

    // Update KPIs with rate limiting
    let updated = 0;
    for (const update of updates) {
      try {
        await updateKPI(update.id, { Name: update.newName });
        console.log(`   ✓ "${update.newName}"`);
        updated++;
        
        // Rate limiting: wait 350ms between requests
        if (updated < updates.length) {
          await delay(350);
        }
      } catch (error: any) {
        console.error(`   ✗ Erro ao renomear "${update.oldName}": ${error.message}`);
      }
    }

    console.log(`\n✅ ${updated}/${updates.length} KPIs renomeados com sucesso!`);

  } catch (error: any) {
    console.error('\n❌ Erro ao renomear KPIs:', error.message);
    process.exit(1);
  }
}

main();











