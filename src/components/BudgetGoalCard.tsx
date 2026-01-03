import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import type { BudgetGoal } from '@/types/finance';
import { cn } from '@/lib/utils';

interface BudgetGoalCardProps {
  goal: BudgetGoal;
  onEdit?: (goal: BudgetGoal) => void;
  onDelete?: (goal: BudgetGoal) => void;
}

export function BudgetGoalCard({ goal, onEdit, onDelete }: BudgetGoalCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const percentage = goal.BudgetAmount > 0 
    ? Math.min(100, (goal.SpentAmount / goal.BudgetAmount) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excedido':
        return 'destructive';
      case 'Atingido':
        return 'default';
      case 'Em andamento':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium">{goal.Name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusColor(goal.Status)}>{goal.Status}</Badge>
              <span className="text-xs text-muted-foreground">{goal.Category}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(goal)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(goal)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gasto</span>
            <span className="font-medium">{formatCurrency(goal.SpentAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Orçado</span>
            <span className="font-medium">{formatCurrency(goal.BudgetAmount)}</span>
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className={cn("h-2", getProgressColor(percentage))}
        />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {percentage.toFixed(1)}% utilizado
          </span>
          <span className={cn(
            "font-medium",
            percentage >= 100 ? "text-destructive" :
            percentage >= 80 ? "text-yellow-600 dark:text-yellow-500" :
            "text-green-600 dark:text-green-500"
          )}>
            {formatCurrency(goal.BudgetAmount - goal.SpentAmount)} restante
          </span>
        </div>
      </CardContent>
    </Card>
  );
}


