import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Coffee, Users, FileText, Cog, Zap, Bot, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canMarkActionDone } from '@/lib/notion/guards';
import type { NotionAction } from '@/lib/notion/types';
import type { Action } from '@/types/action';
import { toast } from 'sonner';

interface ActionChecklistProps {
  actions: Action[] | NotionAction[];
  onToggle: (actionId: string, done: boolean) => void;
  journalBlocked: boolean;
  refreshing?: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  'Café': Coffee,
  'Ativação de Rede': Users,
  'Proposta': FileText,
  'Processo': Cog,
  'Rotina': Cog,
  'Automação': Zap,
  'Agente': Bot,
  'Diário': BookOpen,
};

const typeColors: Record<string, string> = {
  'Café': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Ativação de Rede': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Proposta': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'Processo': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  'Rotina': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  'Automação': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  'Agente': 'bg-primary/10 text-primary border-primary/20',
  'Diário': 'bg-secondary/10 text-secondary border-secondary/20',
};

export function ActionChecklist({ actions, onToggle, journalBlocked, refreshing = false }: ActionChecklistProps) {
  const [localActions, setLocalActions] = useState(actions);

  const handleToggle = (action: Action | NotionAction) => {
    if (journalBlocked && !action.Done) {
      toast.error('Preencha o diário de ontem antes de concluir ações');
      return;
    }

    const canComplete = canMarkActionDone(action);
    if (!canComplete.allowed && !action.Done) {
      toast.error(canComplete.reason);
      return;
    }

    const newDone = !action.Done;
    setLocalActions(prev => 
      prev.map(a => a.id === action.id ? { ...a, Done: newDone } : a)
    );
    onToggle(action.id, newDone);
    
    if (newDone) {
      toast.success(`✓ ${action.Name}`);
    }
  };

  const completedCount = localActions.filter(a => a.Done).length;
  const totalCount = localActions.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ações de Hoje</CardTitle>
          <Badge variant="secondary" className="font-medium">
            {completedCount}/{totalCount}
          </Badge>
        </div>
        {journalBlocked && (
          <div className="flex items-center gap-2 text-destructive text-sm mt-2 p-2 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Preencha o diário de ontem para desbloquear</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {localActions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhuma ação para hoje
          </p>
        ) : (
          localActions.map((action) => {
            const actionTyped = action as NotionAction;
            const Icon = typeIcons[actionTyped.Type] || Cog;
            const hasNoGoal = !actionTyped.Goal || actionTyped.Goal.trim() === '';
            
            return (
              <div
                key={action.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                  actionTyped.Done 
                    ? "bg-muted/50 border-muted" 
                    : "bg-card border-border hover:border-primary/30",
                  hasNoGoal && !actionTyped.Done && "border-destructive/30 bg-destructive/5"
                )}
              >
                <Checkbox
                  checked={actionTyped.Done}
                  onCheckedChange={() => handleToggle(actionTyped)}
                  disabled={(journalBlocked && !actionTyped.Done) || refreshing || hasNoGoal}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    actionTyped.Done && "line-through text-muted-foreground"
                  )}>
                    {actionTyped.Name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", typeColors[actionTyped.Type])}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {actionTyped.Type}
                    </Badge>
                    {actionTyped.Contact && (
                      <Badge variant="outline" className="text-xs">
                        {actionTyped.Contact}
                      </Badge>
                    )}
                    {actionTyped.Client && (
                      <Badge variant="outline" className="text-xs">
                        {actionTyped.Client}
                      </Badge>
                    )}
                    {hasNoGoal && !actionTyped.Done && (
                      <Badge variant="destructive" className="text-xs">
                        Sem meta
                      </Badge>
                    )}
                  </div>
                  {actionTyped.Notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {actionTyped.Notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
