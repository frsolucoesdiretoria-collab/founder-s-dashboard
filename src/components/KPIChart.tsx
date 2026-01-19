import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';

interface KPIChartProps {
  kpi: NotionKPI;
  goals: NotionGoal[];
}

// Generate chart data from real Goals or KPI TargetValue
function generateChartData(kpi: NotionKPI, goals: NotionGoal[]): { data: any[]; hasData: boolean } {
  const kpiGoals = goals.filter(g => g.KPI === kpi.id);
  const targetValue = kpi.TargetValue || 0;
  const hasGoals = kpiGoals.length > 0;
  
  // Helper to generate data structure with projected from TargetValue
  const getProjectedData = () => {
    if (kpi.Periodicity === 'Anual') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyTarget = targetValue / 12; // Distribute evenly across months
      
      return months.map((month, index) => ({
        name: month,
        projetado: monthlyTarget * (index + 1), // Cumulative
        realizado: null
      }));
    }
    if (kpi.Periodicity === 'Mensal') {
      const weeklyTarget = targetValue / 4; // Distribute evenly across 4 weeks
      
      return ['S1', 'S2', 'S3', 'S4'].map((week, index) => ({
        name: week,
        projetado: weeklyTarget * (index + 1), // Cumulative
        meta: weeklyTarget * (index + 1),
        realizado: 0
      }));
    }
    // Semanal
    const dailyTarget = targetValue / 7; // Distribute evenly across 7 days
    
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => ({
      name: day,
      projetado: dailyTarget * (index + 1), // Cumulative
      acumulado: null
    }));
  };
  
  // If no goals, use TargetValue to generate projected data
  if (!hasGoals) {
    if (targetValue > 0) {
      return { data: getProjectedData(), hasData: true };
    }
    // If no TargetValue either, return empty structure
    const emptyData = kpi.Periodicity === 'Anual' 
      ? Array.from({ length: 12 }, (_, i) => ({
          name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
          projetado: 0,
          realizado: null
        }))
      : kpi.Periodicity === 'Mensal'
      ? ['S1', 'S2', 'S3', 'S4'].map(week => ({
          name: week,
          projetado: 0,
          meta: 0,
          realizado: 0
        }))
      : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => ({
          name: day,
          projetado: 0,
          acumulado: null
        }));
    return { data: emptyData, hasData: false };
  }

  if (kpi.Periodicity === 'Anual') {
    // Annual: Cumulative projection vs actual by month
    const currentYear = new Date().getFullYear();
    const yearGoals = kpiGoals.filter(g => g.Year === currentYear);
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: Array<{ name: string; projetado: number; realizado: number | null }> = [];
    let cumulativeTarget = 0;
    let cumulativeActual = 0;

    // If we have goals, use them; otherwise distribute TargetValue evenly
    const totalTargetFromGoals = yearGoals.reduce((sum, g) => sum + (g.Target || 0), 0);
    const monthlyTarget = totalTargetFromGoals > 0 
      ? null // Will calculate from goals
      : targetValue / 12; // Distribute TargetValue evenly

    for (let month = 0; month < 12; month++) {
      const monthGoal = yearGoals.find(g => g.Month === month + 1);
      
      if (monthGoal) {
        cumulativeTarget += monthGoal.Target;
        cumulativeActual += monthGoal.Actual || 0;
      } else if (monthlyTarget !== null) {
        // No goal for this month, but we have TargetValue to distribute
        cumulativeTarget = monthlyTarget * (month + 1);
      }
      
      const isFuture = month + 1 > new Date().getMonth() + 1;
      data.push({
        name: months[month],
        projetado: cumulativeTarget,
        realizado: isFuture ? null : cumulativeActual
      });
    }

    // Has data if we have goals with targets or if TargetValue > 0
    const hasData = totalTargetFromGoals > 0 || targetValue > 0;
    return { data, hasData };
  }
  
  if (kpi.Periodicity === 'Mensal') {
    // Monthly: Aggregation by week (S1, S2, S3, S4)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthGoals = kpiGoals.filter(g => g.Month === currentMonth && g.Year === currentYear);
    
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

    // Calculate total target from goals
    const totalTargetFromGoals = Object.values(weekData).reduce((sum, w) => sum + w.target, 0);
    const weeklyTarget = totalTargetFromGoals > 0 
      ? null // Will use goals data
      : targetValue / 4; // Distribute TargetValue evenly across 4 weeks

    // Convert to array, ensure S1-S4 order
    const data = ['S1', 'S2', 'S3', 'S4'].map((week, index) => ({
      name: week,
      projetado: weekData[week]?.target || (weeklyTarget !== null ? weeklyTarget * (index + 1) : 0),
      meta: weekData[week]?.target || (weeklyTarget !== null ? weeklyTarget * (index + 1) : 0),
      realizado: weekData[week]?.actual || 0
    }));

    const hasData = totalTargetFromGoals > 0 || targetValue > 0;
    return { data, hasData };
  }
  
  // Weekly: Cumulative by day of week
  const currentWeek = getWeekKey(new Date());
  const weekGoals = kpiGoals.filter(g => g.WeekKey === currentWeek);
  
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0
  
  // Calculate cumulative target for the week from goals or use TargetValue
  const weekTargetFromGoals = weekGoals.reduce((sum, goal) => sum + (goal.Target || 0), 0);
  const weekTarget = weekTargetFromGoals > 0 ? weekTargetFromGoals : targetValue;
  
  // Calculate cumulative actual from goals
  const cumulativeActual = weekGoals.reduce((sum, goal) => sum + (goal.Actual || 0), 0);
  
  const data = days.map((day, idx) => {
    const isFuture = idx > dayIndex;
    
    // Calculate projected value: distribute weekly target evenly across days
    const projectedPerDay = weekTarget > 0 ? weekTarget / 7 : 0;
    const projected = projectedPerDay * (idx + 1);
    
    return {
      name: day,
      projetado: projected,
      acumulado: isFuture ? null : cumulativeActual
    };
  });

  const hasData = weekTarget > 0;
  return { data, hasData };
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
  const { data, hasData } = generateChartData(kpi, goals);
  
  const renderChart = () => {
    if (kpi.Periodicity === 'Anual') {
      // Line chart: Projetado vs Realizado (cumulative)
      return (
        <ResponsiveContainer width="100%" height={160} className="md:h-[200px]">
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
      // Composed chart: bars for actual, line for projected
      return (
        <ResponsiveContainer width="100%" height={160} className="md:h-[200px]">
          <ComposedChart data={data}>
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
            <Line 
              type="monotone" 
              dataKey="projetado" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Projetado"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    
    // Weekly: Cumulative line with projected (using ComposedChart to combine Line and Area)
    return (
      <ResponsiveContainer width="100%" height={160} className="md:h-[200px]">
        <ComposedChart data={data}>
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
            strokeWidth={2}
            name="Projetado"
            dot={false}
          />
          <Area 
            type="monotone" 
            dataKey="acumulado" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary) / 0.2)"
            name="Acumulado"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="relative w-full">
      {renderChart()}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 px-3 py-1.5 rounded-md border border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Sem dados configurados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
