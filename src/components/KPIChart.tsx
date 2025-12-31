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

// Generate mock chart data based on periodicity
function generateChartData(kpi: NotionKPI, goals: NotionGoal[]) {
  if (kpi.Periodicity === 'Anual') {
    return [
      { name: 'Jan', projetado: 10, realizado: 8 },
      { name: 'Fev', projetado: 20, realizado: 18 },
      { name: 'Mar', projetado: 30, realizado: 28 },
      { name: 'Abr', projetado: 40, realizado: 35 },
      { name: 'Mai', projetado: 50, realizado: 48 },
      { name: 'Jun', projetado: 60, realizado: 55 },
      { name: 'Jul', projetado: 70, realizado: 68 },
      { name: 'Ago', projetado: 80, realizado: 75 },
      { name: 'Set', projetado: 90, realizado: 85 },
      { name: 'Out', projetado: 100, realizado: 92 },
      { name: 'Nov', projetado: 110, realizado: 105 },
      { name: 'Dez', projetado: 120, realizado: null },
    ];
  }
  
  if (kpi.Periodicity === 'Mensal') {
    return [
      { name: 'S1', meta: 3, realizado: 2 },
      { name: 'S2', meta: 3, realizado: 4 },
      { name: 'S3', meta: 3, realizado: 3 },
      { name: 'S4', meta: 3, realizado: 2 },
    ];
  }
  
  // Weekly
  return [
    { name: 'Seg', acumulado: 1 },
    { name: 'Ter', acumulado: 2 },
    { name: 'Qua', acumulado: 3 },
    { name: 'Qui', acumulado: 4 },
    { name: 'Sex', acumulado: 5 },
    { name: 'Sáb', acumulado: 5 },
    { name: 'Dom', acumulado: 5 },
  ];
}

export function KPIChart({ kpi, goals }: KPIChartProps) {
  const data = generateChartData(kpi, goals);
  
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
