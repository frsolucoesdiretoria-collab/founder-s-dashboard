// Helper functions to count Enzo contacts by status
import { getContactsEnzo } from './notionDataLayer';

export interface ContactStatusCount {
  status: string;
  count: number;
}

/**
 * Count Enzo contacts by status
 */
export async function countEnzoContactsByStatus(): Promise<Record<string, number>> {
  try {
    const contacts = await getContactsEnzo();
    
    console.log(`📊 countEnzoContactsByStatus: Processando ${contacts.length} contatos`);
    
    const counts: Record<string, number> = {
      'Contato Ativado': 0,
      'Café Agendado': 0,
      'Café Executado': 0,
      'Venda Feita': 0,
    };

    contacts.forEach(contact => {
      let status = contact.Status || 'Contato Ativado';
      // Tratar status vazio, null, undefined, ou "Sem status" como "Contato Ativado"
      if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
        status = 'Contato Ativado';
      }
      // Migrar status antigos para novos
      const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
      
      console.log(`  📋 Contato ${contact.id} (${contact.Name || 'sem nome'}): Status original="${contact.Status || 'null'}" -> Normalizado="${normalizedStatus}"`);
      
      if (counts.hasOwnProperty(normalizedStatus)) {
        counts[normalizedStatus]++;
        console.log(`  ✅ Contado para "${normalizedStatus}" (total: ${counts[normalizedStatus]})`);
      } else {
        // Se status não está na lista, conta como "Contato Ativado"
        counts['Contato Ativado']++;
        console.log(`  ⚠️  Status "${normalizedStatus}" não reconhecido, contado como "Contato Ativado"`);
      }
    });

    console.log(`📊 countEnzoContactsByStatus: Resultado final:`, counts);
    return counts;
  } catch (error: any) {
    console.error('Error counting Enzo contacts by status:', error);
    // Retornar contagens zeradas em caso de erro
    return {
      'Contato Ativado': 0,
      'Café Agendado': 0,
      'Café Executado': 0,
      'Venda Feita': 0,
    };
  }
}

/**
 * Get all contacts with sale value >= 5000
 */
export async function getContactsWithSaleValue5KPlus(): Promise<number> {
  try {
    const contacts = await getContactsEnzo();
    
    // Contar leads únicos em "Venda Feita" com valor >= 5000
    const uniqueIds = new Set<string>();
    let count = 0;

    contacts.forEach(contact => {
      const status = contact.Status || 'Contato Ativado';
      const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
      
      if (normalizedStatus === 'Venda Feita') {
        // Usar ID único do lead para evitar duplicação
        if (!uniqueIds.has(contact.id)) {
          uniqueIds.add(contact.id);
          // Verificar valor da venda (se existe e >= 5000)
          const saleValue = (contact as any).ValorVenda;
          if (saleValue !== undefined && saleValue !== null && saleValue >= 5000) {
            count++;
          }
        }
      }
    });

    return count;
  } catch (error: any) {
    console.error('Error counting contacts with sale value 5K+:', error);
    return 0;
  }
}

/**
 * Get sum of all sale values for contacts in "Venda Feita"
 */
export async function getSumOfSaleValues(): Promise<number> {
  try {
    const contacts = await getContactsEnzo();
    
    // Somar valores de venda dos leads em "Venda Feita"
    const uniqueIds = new Set<string>();
    let sum = 0;

    console.log(`💰 getSumOfSaleValues: Processando ${contacts.length} contatos`);

    contacts.forEach(contact => {
      let status = contact.Status || 'Contato Ativado';
      // Tratar status vazio, null, undefined, ou "Sem status" como "Contato Ativado"
      if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
        status = 'Contato Ativado';
      }
      const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
      
      if (normalizedStatus === 'Venda Feita') {
        // Usar ID único do lead para evitar duplicação
        if (!uniqueIds.has(contact.id)) {
          uniqueIds.add(contact.id);
          // Somar valor da venda (se existe e >= 0)
          const saleValue = (contact as any).ValorVenda;
          console.log(`  💰 Contato ${contact.id} (${contact.Name || 'sem nome'}) - Status: ${normalizedStatus}, ValorVenda: ${saleValue}`);
          if (saleValue !== undefined && saleValue !== null && saleValue >= 0) {
            sum += saleValue;
            console.log(`  ✅ Valor adicionado: R$ ${saleValue}. Total acumulado: R$ ${sum}`);
          } else {
            console.log(`  ⚠️  Valor ignorado (undefined/null/negativo)`);
          }
        }
      }
    });

    console.log(`💰 getSumOfSaleValues: Total final = R$ ${sum}`);
    return sum;
  } catch (error: any) {
    console.error('Error summing sale values:', error);
    return 0;
  }
}

/**
 * Map KPI name to status(es) that should be counted (ACUMULATIVO)
 * KPI1: todos os leads que estão em qualquer estágio do funil (>= estágio 1)
 * KPI2: todos os leads que chegaram ao estágio 3 (Café Executado) OU 4 (Venda Feita)
 * KPI3: leads no estágio 4 (Venda Feita) COM valor >= 5000
 */
export async function getCountForKPI(kpiName: string): Promise<number> {
  try {
    const contacts = await getContactsEnzo();
    const name = kpiName.toLowerCase();
    
    console.log(`🔍 getCountForKPI: "${kpiName}" -> "${name}"`);
    console.log(`📊 Contatos disponíveis: ${contacts.length}`);
    
    // Usar Set para garantir que cada lead é contado apenas uma vez
    const uniqueIds = new Set<string>();
    let count = 0;

    // KPI1: Convites/Áudios enviados - conta TODOS os leads que estão em qualquer estágio do funil (>= estágio 1)
    if (name.includes('convites') || name.includes('áudios') || name.includes('audios') || name.includes('contato ativado')) {
      contacts.forEach(contact => {
        let status = contact.Status || 'Contato Ativado';
        // Tratar status vazio, null, undefined, ou "Sem status" como "Contato Ativado"
        if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
          status = 'Contato Ativado';
        }
        const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
        
        // Conta todos que estão em qualquer estágio (Contato Ativado, Café Agendado, Café Executado, ou Venda Feita)
        // IMPORTANTE: Contar TODOS os contatos que têm status válido, mesmo sem nome
        if (normalizedStatus === 'Contato Ativado' || normalizedStatus === 'Café Agendado' || 
            normalizedStatus === 'Café Executado' || normalizedStatus === 'Venda Feita') {
          if (!uniqueIds.has(contact.id)) {
            uniqueIds.add(contact.id);
            count++;
            console.log(`  ✅ Contato ${contact.id} (${contact.Name || 'sem nome'}) - Status: ${normalizedStatus} -> contado para KPI1`);
          }
        }
      });
      console.log(`📊 KPI1 (Convites/Áudios): Total contado = ${count} de ${contacts.length} contatos`);
      return count;
    }

    // KPI2: Reuniões 1:1 feitas - conta TODOS os leads que chegaram ao estágio 3 (Café Executado) OU 4 (Venda Feita)
    if (name.includes('reunião') || name.includes('reuniões') || name.includes('1:1')) {
      contacts.forEach(contact => {
        let status = contact.Status || 'Contato Ativado';
        // Tratar status vazio, null, undefined, ou "Sem status" como "Contato Ativado"
        if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
          status = 'Contato Ativado';
        }
        const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
        
        // Conta todos que estão em Café Executado OU Venda Feita
        // IMPORTANTE: Contar TODOS os contatos que têm status válido, mesmo sem nome
        if (normalizedStatus === 'Café Executado' || normalizedStatus === 'Venda Feita') {
          if (!uniqueIds.has(contact.id)) {
            uniqueIds.add(contact.id);
            count++;
            console.log(`  ✅ Contato ${contact.id} (${contact.Name || 'sem nome'}) - Status: ${normalizedStatus} -> contado para KPI2`);
          }
        }
      });
      console.log(`📊 KPI2 (Reuniões 1:1): Total contado = ${count} de ${contacts.length} contatos`);
      return count;
    }

    // KPI3: Vendas feitas (5K+) - conta leads no estágio 4 (Venda Feita) COM valor >= 5000
    // Verificar se é o KPI 3 (vendas 5K+). Não confundir com KPI 4 (meta semanal - que usa IsFinancial)
    // Se inclui "venda" mas NÃO inclui "meta" ou "semanal", e inclui "5k" ou "5000", é o KPI 3
    const isVenda5K = (name.includes('venda') || name.includes('vendas')) && 
                      !name.includes('meta') && 
                      !name.includes('semanal') &&
                      (name.includes('5k') || name.includes('5k+') || name.includes('5000') || name.includes('feitas') || name.includes('(5k') || name.includes('(5 k'));
    
    if (isVenda5K) {
      contacts.forEach(contact => {
        let status = contact.Status || 'Contato Ativado';
        // Tratar status vazio, null, undefined, ou "Sem status" como "Contato Ativado"
        if (!status || status === '' || status === 'Sem status' || status === 'None' || status === 'null') {
          status = 'Contato Ativado';
        }
        const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
        
        if (normalizedStatus === 'Venda Feita') {
          // Usar ID único do lead para evitar duplicação
          if (!uniqueIds.has(contact.id)) {
            uniqueIds.add(contact.id);
            // Verificar valor da venda (se existe e >= 5000)
            const saleValue = (contact as any).ValorVenda;
            console.log(`  🔍 Contato ${contact.id} (${contact.Name || 'sem nome'}) - Status: ${normalizedStatus}, ValorVenda: ${saleValue}`);
            if (saleValue !== undefined && saleValue !== null && saleValue >= 5000) {
              count++;
              console.log(`  ✅ Contato ${contact.id} contado para KPI3 (valor >= 5000)`);
            } else {
              console.log(`  ⚠️  Contato ${contact.id} NÃO contado para KPI3 (valor < 5000 ou ausente)`);
            }
          }
        }
      });
      console.log(`📊 KPI3 (Vendas 5K+): Total contado = ${count} de ${contacts.length} contatos`);
      return count;
    }

    // Fallback para outros KPIs (usar lógica antiga)
    const statuses = getStatusesForKPI(kpiName);
    if (statuses.length > 0) {
      const statusCounts = await countEnzoContactsByStatus();
      return statuses.reduce((sum, status) => {
        const normalizedStatus = status === 'Proposta Enviada' || status === 'Venda Fechada' ? 'Venda Feita' : status;
        return sum + (statusCounts[normalizedStatus] || 0);
      }, 0);
    }
    
    return 0;
  } catch (error: any) {
    console.error('Error counting contacts for KPI:', error);
    return 0;
  }
}

/**
 * Map KPI name to status(es) that should be counted (legacy - mantido para compatibilidade)
 */
export function getStatusesForKPI(kpiName: string): string[] {
  const name = kpiName.toLowerCase();
  
  if (name.includes('café agendado') || name.includes('cafe agendado') || name.includes('agendado')) {
    return ['Café Agendado'];
  }
  if (name.includes('café executado') || name.includes('cafe executado') || name.includes('executado')) {
    return ['Café Executado'];
  }
  if (name.includes('venda') || name.includes('vendas') || name.includes('venda feita')) {
    return ['Venda Feita'];
  }
  
  return [];
}

