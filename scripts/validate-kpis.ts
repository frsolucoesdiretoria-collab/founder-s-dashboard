// Script para validar as atualizações dos KPIs
// Execute: npx tsx scripts/validate-kpis.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { getAllKPIsIncludingInactive, findKPIByName } from '../server/lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const expectedUpdates = [
  { name: 'Journals_Filled_2026', target: 260, periodicity: 'Anual' },
  { name: 'Candidates_Interviewed_2026', target: 20, periodicity: 'Anual' },
  { name: 'Weekly_Review_Done_2026', target: 52, periodicity: 'Anual' },
  { name: 'Sellers_Hired_2026', target: 10, periodicity: 'Anual' },
  { name: 'Playbooks_Published_2026', target: 7, periodicity: 'Anual' },
  { name: 'Referrals_Received_FromClients_2026', target: 4000, periodicity: 'Anual' },
  { name: 'InternalAutomations_Active_2026', target: 50, periodicity: 'Anual' },
  { name: 'Automations_Implemented_2026', target: 1000, periodicity: 'Anual' },
  { name: 'AIAgents_Active_2026', target: 300, periodicity: 'Anual' },
  { name: 'Testimonials_Collected_2026', target: 100, periodicity: 'Anual' },
  { name: 'WeeklyRoutines_Standardized_2026', target: 11, periodicity: 'Anual' },
  { name: 'Events_Attended_2026', target: 50, periodicity: 'Semanal' },
  { name: 'FollowUps_Completed_2026', target: 3000, periodicity: 'Anual' },
  { name: 'Network_Coffees_2026', target: 100, periodicity: 'Anual' },
  { name: 'GrowthProposals_Approved_2026', target: 300, periodicity: 'Anual' },
  { name: 'GrowthProposals_Sent_2026', target: 3000, periodicity: 'Anual' },
  { name: 'Network_Activations_2026', target: 200, periodicity: 'Anual' },
  { name: 'Meetings_Completed_2026', target: 3000, periodicity: 'Anual' }
];

const shouldBeInactive = [
  'Processes_Documented_2026',
  'CaseStudies_Authorized_2026',
  'CoffeeDiagnostics_Completed_2026',
  'WarmIntroductions_Received_2026'
];

async function main() {
  console.log('🔍 Validando atualizações de KPIs...\n');

  const results = {
    correct: [] as string[],
    incorrect: [] as { name: string; issue: string }[],
    inactiveCorrect: [] as string[],
    inactiveIncorrect: [] as string[]
  };

  try {
    // Validate active KPIs
    for (const expected of expectedUpdates) {
      const kpi = await findKPIByName(expected.name);
      
      if (!kpi) {
        results.incorrect.push({ name: expected.name, issue: 'KPI não encontrado' });
        continue;
      }

      const issues: string[] = [];
      
      if (kpi.TargetValue !== expected.target) {
        issues.push(`TargetValue: esperado ${expected.target}, encontrado ${kpi.TargetValue}`);
      }
      
      if (kpi.Periodicity !== expected.periodicity) {
        issues.push(`Periodicity: esperado ${expected.periodicity}, encontrado ${kpi.Periodicity}`);
      }
      
      if (!kpi.Active) {
        issues.push('KPI está inativo (deveria estar ativo)');
      }

      if (issues.length > 0) {
        results.incorrect.push({ name: expected.name, issue: issues.join('; ') });
      } else {
        results.correct.push(expected.name);
      }
    }

    // Validate inactive KPIs
    for (const name of shouldBeInactive) {
      const kpi = await findKPIByName(name);
      
      if (!kpi) {
        results.inactiveIncorrect.push(name + ' (não encontrado)');
        continue;
      }

      if (kpi.Active) {
        results.inactiveIncorrect.push(name + ' (ainda está ativo)');
      } else {
        results.inactiveCorrect.push(name);
      }
    }

    // Print results
    console.log('📊 Resultados da Validação:\n');
    
    console.log(`✅ KPIs corretos: ${results.correct.length}/${expectedUpdates.length}`);
    if (results.correct.length > 0) {
      results.correct.forEach(name => console.log(`   ✓ ${name}`));
    }

    if (results.incorrect.length > 0) {
      console.log(`\n❌ KPIs com problemas: ${results.incorrect.length}`);
      results.incorrect.forEach(({ name, issue }) => {
        console.log(`   ✗ ${name}: ${issue}`);
      });
    }

    console.log(`\n❌ KPIs desativados corretamente: ${results.inactiveCorrect.length}/${shouldBeInactive.length}`);
    if (results.inactiveCorrect.length > 0) {
      results.inactiveCorrect.forEach(name => console.log(`   ✓ ${name}`));
    }

    if (results.inactiveIncorrect.length > 0) {
      console.log(`\n⚠️  KPIs que deveriam estar inativos mas não estão: ${results.inactiveIncorrect.length}`);
      results.inactiveIncorrect.forEach(name => console.log(`   ✗ ${name}`));
    }

    const allCorrect = 
      results.incorrect.length === 0 && 
      results.inactiveIncorrect.length === 0 &&
      results.correct.length === expectedUpdates.length &&
      results.inactiveCorrect.length === shouldBeInactive.length;

    if (allCorrect) {
      console.log('\n✨ Todas as validações passaram!');
    } else {
      console.log('\n⚠️  Algumas validações falharam. Revise os resultados acima.');
    }

  } catch (error: any) {
    console.error('\n❌ Erro na validação:', error.message);
    process.exit(1);
  }
}

main();


















