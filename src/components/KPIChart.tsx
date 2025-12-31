import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';

interface KPIChartProps {
  kpi: NotionKPI;
  goals: NotionGoal[];
}

// Generate chart data from real Goals
function generateChartData(kpi: NotionKPI, goals: NotionGoal[]) {
  const kpiGoals = goals.filter(g => g.KPI === kpi.id);
  
  if (kpiGoals.length === 0) {
    return null; // No goals configured
  }

  if (kpi.Periodicity === 'Anual') {
    // Annual: Cumulative projection vs actual by month
    const currentYear = new Date().getFullYear();
    const yearGoals = kpiGoals.filter(g => g.Year === currentYear);
    
    if (yearGoals.length === 0) {
      return null;
    }

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: Array<{ name: string; projetado: number; realizado: number | null }> = [];
    let cumulativeTarget = 0;
    let cumulativeActual = 0;

    for (let month = 0; month < 12; month++) {
      const monthGoal = yearGoals.find(g => g.Month === month + 1);
      
      if (monthGoal) {
        cumulativeTarget += monthGoal.Target;
        cumulativeActual += monthGoal.Actual || 0;
      }
      
      const isFuture = month + 1 > new Date().getMonth() + 1;
      data.push({
        name: months[month],
        projetado: cumulativeTarget,
        realizado: isFuture ? null : cumulativeActual
      });
    }

    return data;
  }
  
  if (kpi.Periodicity === 'Mensal') {
    // Monthly: Aggregation by week (S1, S2, S3, S4)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthGoals = kpiGoals.filter(g => g.Month === currentMonth && g.Year === currentYear);
    
    if (monthGoals.length === 0) {
      return null;
    }

    // Group by week (WeekKey format: YYYY-WW)
    const weekData: Record<string, { target: number; actual: number }> = {};
    
    monthGoals.forEach(goal => {
      if (goal.WeekKey) {
        const weekNum = goal.WeekKey.split('-W')[1] || '1';
        const weekLabel = `S${weekNum}`;
        
        if (!weekData[weekLabel]) {
          weekData[weekLabel] = { target: 0, actual: 0 };
        }
        weekData[weekLabel].target += goal.Target;
        weekData[weekLabel].actual += goal.Actual || 0;
      }
    });

    // Convert to array, ensure S1-S4 order
    const data = ['S1', 'S2', 'S3', 'S4'].map(week => ({
      name: week,
      meta: weekData[week]?.target || 0,
      realizado: weekData[week]?.actual || 0
    }));

    return data;
  }
  
  // Weekly: Cumulative by day of week
  const currentWeek = getWeekKey(new Date());
  const weekGoals = kpiGoals.filter(g => g.WeekKey === currentWeek);
  
  if (weekGoals.length === 0) {
    return null;
  }

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0
  
  const data = days.map((day, idx) => {
    // Cumulative actual from goals
    const cumulative = weekGoals.reduce((sum, goal) => sum + (goal.Actual || 0), 0);
    const isFuture = idx > dayIndex;
    
    return {
      name: day,
      acumulado: isFuture ? null : cumulative
    };
  });

  return data;
}

// Helper: Get week key in format YYYY-WW
function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

export function KPIChart({ kpi, goals }: KPIChartProps) {
  const data = generateChartData(kpi, goals);
  
  // No goals configured
  if (data === null) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{kpi.Name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Sem meta configurada
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const renderChart = () => {
    if (kpi.Periodicity === 'Anual') {
      // Line chart: Projetado vs Realizado (cumulative)
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="projetado" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              name="Projetado"
            />
            <Line 
              type="monotone" 
              dataKey="realizado" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Realizado"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (kpi.Periodicity === 'Mensal') {
      // Bar chart: monthly progress
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Bar 
              dataKey="realizado" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="Realizado"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // Weekly: Cumulative line
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="name" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="acumulado" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary) / 0.2)"
            name="Acumulado"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {kpi.Name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {kpi.Periodicity === 'Anual' && 'Projetado vs Realizado (acumulado)'}
          {kpi.Periodicity === 'Mensal' && 'Avanço mensal por semana'}
          {kpi.Periodicity === 'Semanal' && 'Evolução acumulada'}
        </p>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
