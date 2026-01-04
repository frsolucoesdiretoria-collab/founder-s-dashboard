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

    // Garantir que há uma propriedade de data em Contacts (pode criar se não existir)
    await ensureContactsDateProperty();

    const enriched = await Promise.all(
      goals.map(async goal => {
        const kpi = kpis.find(k => k.id === goal.KPI);
        if (!kpi) return goal;

        const statuses = statusesForKPIName(kpi.Name || '');
        if (!statuses) return goal;

        const goalRange = normalizeRangeFromGoal(goal);
        if (!goalRange) return goal;

        try {
          const { count } = await countContactsByStatusAndDate(statuses, goalRange);
          return { ...goal, Actual: count };
        } catch (err) {
          console.error('Error counting contacts for goal', goal.id, err);
          return goal;
        }
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

