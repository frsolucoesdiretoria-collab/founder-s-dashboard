import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { Transaction } from '@/types/finance';

interface CashFlowChartProps {
  transactions: Transaction[];
  days?: number;
}

export function CashFlowChart({ transactions, days = 30 }: CashFlowChartProps) {
  // Group transactions by date
  const dailyData = transactions.reduce((acc, t) => {
    const date = new Date(t.Date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, entrada: 0, saida: 0, saldo: 0 };
    }
    if (t.Type === 'Entrada') {
      acc[date].entrada += t.Amount;
      acc[date].saldo += t.Amount;
    } else {
      acc[date].saida += Math.abs(t.Amount);
      acc[date].saldo -= Math.abs(t.Amount);
    }
    return acc;
  }, {} as Record<string, { date: string; entrada: number; saida: number; saldo: number }>);

  // Get last N days
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    return date.toISOString().split('T')[0];
  });

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  const data = dates.map(date => {
    const dayData = dailyData[date] || { entrada: 0, saida: 0, saldo: 0 };
    cumulativeBalance += dayData.saldo;
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      entrada: dayData.entrada,
      saida: dayData.saida,
      saldo: cumulativeBalance
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa - Últimos {days} dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Line 
              type="monotone" 
              dataKey="entrada" 
              stroke="#82ca9d" 
              name="Entrada"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="saida" 
              stroke="#ff8042" 
              name="Saída"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#8884d8" 
              name="Saldo Acumulado"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


