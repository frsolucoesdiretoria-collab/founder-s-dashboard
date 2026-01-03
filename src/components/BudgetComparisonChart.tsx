import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { BudgetGoal } from '@/types/finance';

interface BudgetComparisonChartProps {
  budgetGoals: BudgetGoal[];
}

export function BudgetComparisonChart({ budgetGoals }: BudgetComparisonChartProps) {
  const data = budgetGoals.map(goal => ({
    name: goal.Category || goal.Name,
    orçado: goal.BudgetAmount,
    realizado: goal.SpentAmount,
    disponível: Math.max(0, goal.BudgetAmount - goal.SpentAmount)
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçado vs Realizado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçado vs Realizado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip 
              formatter={(value: number) => 
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="orçado" fill="#8884d8" name="Orçado" />
            <Bar dataKey="realizado" fill="#82ca9d" name="Realizado" />
            <Bar dataKey="disponível" fill="#ffc658" name="Disponível" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


