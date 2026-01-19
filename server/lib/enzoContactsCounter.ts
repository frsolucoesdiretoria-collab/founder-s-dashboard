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
    
    const counts: Record<string, number> = {
      'Contato Ativado': 0,
      'Café Agendado': 0,
      'Café Executado': 0,
      'Proposta Enviada': 0,
      'Venda Fechada': 0,
      'Perdido': 0,
    };

    contacts.forEach(contact => {
      const status = contact.Status || 'Contato Ativado';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      } else {
        // Se status não está na lista, conta como "Contato Ativado"
        counts['Contato Ativado']++;
      }
    });

    return counts;
  } catch (error: any) {
    console.error('Error counting Enzo contacts by status:', error);
    // Retornar contagens zeradas em caso de erro
    return {
      'Contato Ativado': 0,
      'Café Agendado': 0,
      'Café Executado': 0,
      'Proposta Enviada': 0,
      'Venda Fechada': 0,
      'Perdido': 0,
    };
  }
}

/**
 * Map KPI name to status(es) that should be counted
 */
export function getStatusesForKPI(kpiName: string): string[] {
  const name = kpiName.toLowerCase();
  
  if (name.includes('convites') || name.includes('áudios') || name.includes('audios') || name.includes('contato ativado')) {
    return ['Contato Ativado'];
  }
  if (name.includes('café agendado') || name.includes('cafe agendado') || name.includes('agendado')) {
    return ['Café Agendado'];
  }
  if (name.includes('café executado') || name.includes('cafe executado') || name.includes('executado')) {
    return ['Café Executado'];
  }
  if (name.includes('proposta') || name.includes('propostas')) {
    return ['Proposta Enviada'];
  }
  if (name.includes('venda') || name.includes('vendas')) {
    return ['Venda Fechada'];
  }
  if (name.includes('reunião') || name.includes('reuniões') || name.includes('1:1')) {
    // Reuniões podem ser contadas como Café Executado
    return ['Café Executado'];
  }
  
  return [];
}

