// FR Tech OS - Goals Route

import { Router } from 'express';
import { 
  getGoals, 
  getAllKPIsIncludingInactive,
  countContactsByStatusAndDate,
  ensureContactsDateProperty
} from '../lib/notionDataLayer';

export const goalsRouter = Router();

function normalizeRangeFromGoal(goal: any): { start: string; end: string } | null {
  const toIso = (value: string | Date) => {
    const d = value instanceof Date ? value : new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (goal?.PeriodStart && goal?.PeriodEnd) {
    return { start: toIso(goal.PeriodStart), end: toIso(goal.PeriodEnd) };
  }
  if (goal?.Year && goal?.Month) {
    const start = new Date(goal.Year, goal.Month - 1, 1);
    const end = new Date(goal.Year, goal.Month, 0, 23, 59, 59, 999);
    return { start: toIso(start), end: toIso(end) };
  }
  return null;
}

function statusesForKPIName(name: string): string[] | null {
  const key = name.toLowerCase();
  if (key.includes('contatos ativados')) return ['Contato Ativado'];
  if (key.includes('cafés agendados') || key.includes('cafe agendado')) return ['Café Agendado'];
  if (key.includes('cafés executados') || key.includes('cafe executado')) return ['Café Executado'];
  if (key.includes('propostas')) return ['Proposta Enviada'];
  if (key.includes('vendas feitas') || key === 'vendas' || key.includes('vendas')) {
    return ['Venda Finalizada', 'Venda Fechada'];
  }
  return null;
}

/**
 * GET /api/goals
 * Get goals (optionally filtered by date range)
 * Query params: start, end (ISO date strings)
 */
goalsRouter.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const range = start || end ? { 
      start: start as string | undefined, 
      end: end as string | undefined 
    } : undefined;

    const [goals, kpis] = await Promise.all([
      getGoals(range),
      getAllKPIsIncludingInactive()
    ]);

    console.log(`📊 Retornando ${goals.length} goals da database`);
    console.log(`📈 Encontrados ${kpis.length} KPIs para matching`);

    // Garantir que há uma propriedade de data em Contacts (pode criar se não existir)
    await ensureContactsDateProperty();

    const enriched = await Promise.all(
      goals.map(async goal => {
        const kpi = kpis.find(k => k.id === goal.KPI);
        if (!kpi) {
          console.log(`⚠️  Goal "${goal.Name}" não tem KPI correspondente (KPI ID: ${goal.KPI})`);
          return goal;
        }

        const statuses = statusesForKPIName(kpi.Name || '');
        if (!statuses) {
          // Se não há contagem automática, manter o Actual do Notion
          console.log(`ℹ️  Goal "${goal.Name}" (KPI: "${kpi.Name}") não tem contagem automática, usando Actual do Notion: ${goal.Actual || 0}`);
          return goal;
        }

        const goalRange = normalizeRangeFromGoal(goal);
        if (!goalRange) {
          console.log(`⚠️  Goal "${goal.Name}" não tem período válido para contagem automática`);
          return goal;
        }

        try {
          const { count } = await countContactsByStatusAndDate(statuses, goalRange);
          const existingActual = goal.Actual || 0;
          
          // Só usar contagem automática se retornar um valor válido (> 0)
          // ou se o goal não tinha valor no Notion (0 ou null)
          // Isso evita sobrescrever valores corretos do Notion
          if (count > 0 || existingActual === 0) {
            console.log(`✅ Goal "${goal.Name}" (KPI: "${kpi.Name}"): contagem automática = ${count} (Actual anterior: ${existingActual})`);
            return { ...goal, Actual: count };
          } else {
            // Manter valor do Notion se contagem automática retornar 0 mas Notion tinha valor
            console.log(`⚠️  Goal "${goal.Name}" (KPI: "${kpi.Name}"): contagem automática retornou 0, mantendo Actual do Notion: ${existingActual}`);
            return goal;
          }
        } catch (err) {
          console.error(`❌ Error counting contacts for goal "${goal.Name}":`, err);
          // Em caso de erro, retornar o goal com Actual do Notion
          return goal;
        }
      })
    );

    console.log(`📦 Retornando ${enriched.length} goals enriquecidos`);
    res.json(enriched);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    
    // Handle rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    // Handle Notion API errors
    if (error.code === 'object_not_found' || error.message?.includes('not found')) {
      return res.status(404).json({ 
        error: 'Database not found',
        message: 'Goals database not found. Please check your NOTION_DB_GOALS configuration.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching goals'
    });
  }
});

