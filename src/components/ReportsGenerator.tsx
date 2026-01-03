import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction, BudgetGoal, FinanceSummary } from '@/types/finance';

interface ReportsGeneratorProps {
  transactions: Transaction[];
  budgetGoals: BudgetGoal[];
  summary: FinanceSummary | null;
  passcode: string;
}

export function ReportsGenerator({ transactions, budgetGoals, summary, passcode }: ReportsGeneratorProps) {
  const [selectedReport, setSelectedReport] = useState('');
  const [loading, setLoading] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  const exportToJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arquivo JSON exportado com sucesso!');
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!selectedReport) {
      toast.error('Selecione um relatório');
      return;
    }

    setLoading(true);
    try {
      switch (selectedReport) {
        case 'transactions':
          const transactionsData = transactions.map(t => ({
            Data: t.Date,
            Descrição: t.Name,
            Valor: t.Amount,
            Tipo: t.Type,
            Categoria: t.Category || '',
            Conta: t.Account,
            Observações: t.Description || ''
          }));
          if (format === 'csv') {
            exportToCSV(transactionsData, 'transacoes');
          } else {
            exportToJSON(transactionsData, 'transacoes');
          }
          break;

        case 'budget':
          const budgetData = budgetGoals.map(b => ({
            Nome: b.Name,
            Categoria: b.Category,
            Mês: b.Month,
            Ano: b.Year,
            'Valor Orçado': b.BudgetAmount,
            'Valor Gasto': b.SpentAmount,
            'Saldo Disponível': b.BudgetAmount - b.SpentAmount,
            Status: b.Status,
            'Data Início': b.PeriodStart,
            'Data Fim': b.PeriodEnd
          }));
          if (format === 'csv') {
            exportToCSV(budgetData, 'orcamento');
          } else {
            exportToJSON(budgetData, 'orcamento');
          }
          break;

        case 'summary':
          if (!summary) {
            toast.error('Nenhum resumo disponível');
            return;
          }
          const summaryData = {
            'Total Orçado': summary.totalBudgeted,
            'Total Gasto': summary.totalSpent,
            'Saldo Disponível': summary.availableBalance,
            'Percentual de Utilização': `${summary.utilizationPercentage.toFixed(2)}%`,
            'Top Categorias': summary.topCategories.map(c => ({
              Categoria: c.category,
              Gasto: c.spent,
              Percentual: `${c.percentage.toFixed(2)}%`
            }))
          };
          if (format === 'csv') {
            exportToCSV([summaryData], 'resumo');
          } else {
            exportToJSON(summaryData, 'resumo');
          }
          break;

        case 'expenses-by-category':
          const categoryData = transactions
            .filter(t => t.Type === 'Saída')
            .reduce((acc, t) => {
              const cat = t.Category || 'Sem categoria';
              acc[cat] = (acc[cat] || 0) + Math.abs(t.Amount);
              return acc;
            }, {} as Record<string, number>);
          
          const categoryArray = Object.entries(categoryData).map(([category, total]) => ({
            Categoria: category,
            Total: total
          }));
          
          if (format === 'csv') {
            exportToCSV(categoryArray, 'gastos_por_categoria');
          } else {
            exportToJSON(categoryArray, 'gastos_por_categoria');
          }
          break;

        default:
          toast.error('Relatório não encontrado');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Relatórios e Exportação</h2>
        <p className="text-sm text-muted-foreground">
          Gere relatórios personalizados e exporte dados em diferentes formatos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
          <CardDescription>
            Selecione um tipo de relatório e exporte em CSV ou JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">Transações</SelectItem>
                <SelectItem value="budget">Orçamento</SelectItem>
                <SelectItem value="summary">Resumo Financeiro</SelectItem>
                <SelectItem value="expenses-by-category">Gastos por Categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedReport && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={loading}
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button
                onClick={() => handleExport('json')}
                disabled={loading}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Resumo do Mês</h3>
              {summary && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Orçado:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(summary.totalBudgeted)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gasto:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(summary.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Disponível:</span>
                    <span className={`font-medium ${
                      summary.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(summary.availableBalance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Estatísticas</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total de Transações:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metas de Orçamento:</span>
                  <span className="font-medium">{budgetGoals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transações Entrada:</span>
                  <span className="font-medium text-green-600">
                    {transactions.filter(t => t.Type === 'Entrada').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transações Saída:</span>
                  <span className="font-medium text-red-600">
                    {transactions.filter(t => t.Type === 'Saída').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


