// Script para atualizar KPIs no Notion conforme especificações
// Execute: tsx scripts/update-kpis.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import {
  getAllKPIsIncludingInactive,
  findKPIByName,
  updateKPI,
  createKPI
} from '../server/lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface KPIUpdate {
  namePattern: string; // Pattern to find the KPI
  updates: {
    TargetValue?: number;
    Periodicity?: 'Anual' | 'Mensal' | 'Semanal' | 'Diário';
    Description?: string;
    Active?: boolean;
    Category?: string;
    ChartType?: 'line' | 'bar' | 'area' | 'number';
    Unit?: string;
  };
  createIfNotFound?: {
    Name: string;
    Category: string;
    Periodicity: 'Anual' | 'Mensal' | 'Semanal' | 'Diário';
    ChartType: 'line' | 'bar' | 'area' | 'number';
    Unit?: string;
    SortOrder?: number;
  };
}

const updates: KPIUpdate[] = [
  // Journals_Filled_2026
  {
    namePattern: 'Journals_Filled',
    updates: {
      TargetValue: 260,
      Periodicity: 'Anual',
      Description: 'Documentação diária de tudo que aconteceu no dia anterior. Meta: 260 diários preenchidos (dias úteis do ano)',
      Active: true
    },
    createIfNotFound: {
      Name: 'Journals_Filled_2026',
      Category: 'GOVERNANCA',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'diários',
      SortOrder: 1
    }
  },
  // Candidates_Interviewed_2026
  {
    namePattern: 'Candidates_Interviewed',
    updates: {
      TargetValue: 20,
      Periodicity: 'Anual',
      Description: 'Meta de entrevistar 20 candidatos no primeiro semestre para selecionar 2 vendedores',
      Active: true
    },
    createIfNotFound: {
      Name: 'Candidates_Interviewed_2026',
      Category: 'TIME',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'entrevistas',
      SortOrder: 2
    }
  },
  // Weekly_Review_Done_2026
  {
    namePattern: 'Weekly_Review_Done',
    updates: {
      TargetValue: 52,
      Periodicity: 'Anual',
      Description: '52 revisões semanais ao longo do ano',
      Active: true
    },
    createIfNotFound: {
      Name: 'Weekly_Review_Done_2026',
      Category: 'GOVERNANCA',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'revisões',
      SortOrder: 3
    }
  },
  // Sellers_Hired_2026
  {
    namePattern: 'Sellers_Hired',
    updates: {
      TargetValue: 10,
      Periodicity: 'Anual',
      Description: '10 vendedores contratados até 31/12/2026 (2 no primeiro semestre, 8 no segundo semestre)',
      Active: true
    },
    createIfNotFound: {
      Name: 'Sellers_Hired_2026',
      Category: 'TIME',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'vendedores',
      SortOrder: 4
    }
  },
  // GOL_Moments_Detected_2026
  {
    namePattern: 'GOL_Moments_Detected',
    updates: {
      Description: 'Métricas identificadas nas pesquisas de NPS mensais com clientes atendidos',
      Active: true
    },
    createIfNotFound: {
      Name: 'GOL_Moments_Detected_2026',
      Category: 'CS',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'momentos',
      SortOrder: 5
    }
  },
  // Playbooks_Published_2026
  {
    namePattern: 'Playbooks_Published',
    updates: {
      TargetValue: 7,
      Periodicity: 'Anual',
      Description: '7 playbooks até 31/03/2026: 1) Diagnóstico de produto, 2) Condução de reunião de apresentação, 3) Pitch de vendas, 4) Ancoragem de precificação, 5) Follow-up de propostas, 6) Manutenção de relacionamento com clientes ativos, 7) Segunda venda e aumento de ticket médio',
      Active: true
    },
    createIfNotFound: {
      Name: 'Playbooks_Published_2026',
      Category: 'PRODUTO',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'playbooks',
      SortOrder: 6
    }
  },
  // Referrals_Received_FromClients_2026
  {
    namePattern: 'Referrals_Received_FromClients',
    updates: {
      TargetValue: 4000,
      Periodicity: 'Anual',
      Description: '4.000 indicações recebidas ao longo do ano (média de 24 indicações por cliente ativo, carteira de 300 clientes)',
      Active: true
    },
    createIfNotFound: {
      Name: 'Referrals_Received_FromClients_2026',
      Category: 'CS',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'indicações',
      SortOrder: 7
    }
  },
  // InternalAutomations_Active_2026
  {
    namePattern: 'InternalAutomations_Active',
    updates: {
      TargetValue: 50,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'InternalAutomations_Active_2026',
      Category: 'PRODUTO',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'automações',
      SortOrder: 8
    }
  },
  // Automations_Implemented_2026
  {
    namePattern: 'Automations_Implemented',
    updates: {
      TargetValue: 1000,
      Periodicity: 'Anual',
      Description: '1.000 automações em toda a carteira de 300 clientes ativos (média de 3,3 automações por cliente)',
      Active: true
    },
    createIfNotFound: {
      Name: 'Automations_Implemented_2026',
      Category: 'PRODUTO',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'automações',
      SortOrder: 9
    }
  },
  // AIAgents_Active_2026
  {
    namePattern: 'AIAgents_Active',
    updates: {
      TargetValue: 300,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'AIAgents_Active_2026',
      Category: 'PRODUTO',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'agentes',
      SortOrder: 10
    }
  },
  // Testimonials_Collected_2026
  {
    namePattern: 'Testimonials_Collected',
    updates: {
      TargetValue: 100,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'Testimonials_Collected_2026',
      Category: 'CS',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'depoimentos',
      SortOrder: 11
    }
  },
  // WeeklyRoutines_Standardized_2026
  {
    namePattern: 'WeeklyRoutines_Standardized',
    updates: {
      TargetValue: 11,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'WeeklyRoutines_Standardized_2026',
      Category: 'PRODUTO',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'rotinas',
      SortOrder: 12
    }
  },
  // Events_Attended_2026
  {
    namePattern: 'Events_Attended',
    updates: {
      TargetValue: 50,
      Periodicity: 'Semanal', // Changed from Anual to Semanal
      Description: '50 eventos até 31/12/2026, sendo 4 por semana',
      Active: true
    },
    createIfNotFound: {
      Name: 'Events_Attended_2026',
      Category: 'REDE',
      Periodicity: 'Semanal',
      ChartType: 'number',
      Unit: 'eventos',
      SortOrder: 13
    }
  },
  // FollowUps_Completed_2026
  {
    namePattern: 'FollowUps_Completed',
    updates: {
      TargetValue: 3000,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'FollowUps_Completed_2026',
      Category: 'COMERCIAL',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'follow-ups',
      SortOrder: 14
    }
  },
  // Network_Coffees_2026
  {
    namePattern: 'Network_Coffees',
    updates: {
      TargetValue: 100,
      Periodicity: 'Anual',
      Description: '100 reuniões de networking',
      Active: true
    },
    createIfNotFound: {
      Name: 'Network_Coffees_2026',
      Category: 'REDE',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'cafés',
      SortOrder: 15
    }
  },
  // GrowthProposals_Approved_2026
  {
    namePattern: 'GrowthProposals_Approved',
    updates: {
      TargetValue: 300,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'GrowthProposals_Approved_2026',
      Category: 'COMERCIAL',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'propostas',
      SortOrder: 16
    }
  },
  // GrowthProposals_Sent_2026
  {
    namePattern: 'GrowthProposals_Sent',
    updates: {
      TargetValue: 3000,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'GrowthProposals_Sent_2026',
      Category: 'COMERCIAL',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'propostas',
      SortOrder: 17
    }
  },
  // Network_Activations_2026
  {
    namePattern: 'Network_Activations',
    updates: {
      TargetValue: 200,
      Periodicity: 'Anual',
      Description: '200 contatos ativados na rede',
      Active: true
    },
    createIfNotFound: {
      Name: 'Network_Activations_2026',
      Category: 'REDE',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'ativações',
      SortOrder: 18
    }
  },
  // Meetings_Completed_2026
  {
    namePattern: 'Meetings_Completed',
    updates: {
      TargetValue: 3000,
      Periodicity: 'Anual',
      Active: true
    },
    createIfNotFound: {
      Name: 'Meetings_Completed_2026',
      Category: 'COMERCIAL',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'reuniões',
      SortOrder: 19
    }
  },
  // Cafés de networking Janeiro
  {
    namePattern: 'Cafés de networking Janeiro',
    updates: {
      TargetValue: 50,
      Periodicity: 'Anual',
      Description: '50 cafés executados em janeiro',
      Active: true
    },
    createIfNotFound: {
      Name: 'Cafés de networking Janeiro',
      Category: 'REDE',
      Periodicity: 'Anual',
      ChartType: 'number',
      Unit: 'cafés',
      SortOrder: 20
    }
  },
  // KPIs to deactivate
  {
    namePattern: 'Processes_Documented',
    updates: {
      Active: false
    }
  },
  {
    namePattern: 'CaseStudies_Authorized',
    updates: {
      Active: false
    }
  },
  {
    namePattern: 'CoffeeDiagnostics_Completed',
    updates: {
      Active: false
    }
  },
  {
    namePattern: 'WarmIntroductions_Received',
    updates: {
      Active: false
    }
  }
];

async function main() {
  console.log('🚀 Iniciando atualização de KPIs...\n');

  const results = {
    updated: [] as string[],
    created: [] as string[],
    notFound: [] as string[],
    deactivated: [] as string[]
  };

  try {
    for (const update of updates) {
      try {
        const kpi = await findKPIByName(update.namePattern);

        if (kpi) {
          // Update existing KPI
          await updateKPI(kpi.id, update.updates);
          
          if (update.updates.Active === false) {
            results.deactivated.push(kpi.Name);
            console.log(`❌ Desativado: ${kpi.Name}`);
          } else {
            results.updated.push(kpi.Name);
            console.log(`✅ Atualizado: ${kpi.Name}`);
          }
        } else if (update.createIfNotFound) {
          // Create new KPI
          const newKPI = await createKPI({
            ...update.createIfNotFound,
            ...update.updates,
            Active: update.updates.Active !== false
          });
          results.created.push(newKPI.Name);
          console.log(`🆕 Criado: ${newKPI.Name}`);
        } else {
          results.notFound.push(update.namePattern);
          console.log(`⚠️  Não encontrado e sem template de criação: ${update.namePattern}`);
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${update.namePattern}:`, error.message);
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`✅ Atualizados: ${results.updated.length}`);
    console.log(`🆕 Criados: ${results.created.length}`);
    console.log(`❌ Desativados: ${results.deactivated.length}`);
    console.log(`⚠️  Não encontrados: ${results.notFound.length}`);

    if (results.updated.length > 0) {
      console.log('\n📝 KPIs atualizados:');
      results.updated.forEach(name => console.log(`   - ${name}`));
    }

    if (results.created.length > 0) {
      console.log('\n🆕 KPIs criados:');
      results.created.forEach(name => console.log(`   - ${name}`));
    }

    if (results.deactivated.length > 0) {
      console.log('\n❌ KPIs desativados:');
      results.deactivated.forEach(name => console.log(`   - ${name}`));
    }

    if (results.notFound.length > 0) {
      console.log('\n⚠️  KPIs não encontrados:');
      results.notFound.forEach(name => console.log(`   - ${name}`));
    }

    console.log('\n✨ Atualização concluída!');
  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();













