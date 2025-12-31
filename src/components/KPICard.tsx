import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';

interface KPICardProps {
  kpi: NotionKPI;
  goal?: NotionGoal;
}

export function KPICard({ kpi, goal }: KPICardProps) {
  const progress = goal?.ProgressPct ?? 0;
  const actual = goal?.Actual ?? 0;
  const target = goal?.Target ?? 0;
  
  const trend = progress >= 100 ? 'up' : progress >= 50 ? 'neutral' : 'down';
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {kpi.Category}
            </p>
            <CardTitle className="text-base font-medium mt-1">
              {kpi.Name}
            </CardTitle>
          </div>
          <div className={cn(
            "p-2 rounded-full",
            trend === 'up' && "bg-primary/10 text-primary",
            trend === 'neutral' && "bg-muted text-muted-foreground",
            trend === 'down' && "bg-destructive/10 text-destructive"
          )}>
            <TrendIcon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-foreground">
            {actual}
          </span>
          <span className="text-sm text-muted-foreground">
            / {target} {kpi.Unit}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {kpi.Periodicity}
          </span>
          <span className={cn(
            "text-sm font-medium",
            trend === 'up' && "text-primary",
            trend === 'neutral' && "text-muted-foreground",
            trend === 'down' && "text-destructive"
          )}>
            {progress.toFixed(0)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
