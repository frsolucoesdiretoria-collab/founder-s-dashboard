import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';

interface KPICardProps {
  kpi: NotionKPI;
  goal?: NotionGoal;
}

export function KPICard({ kpi, goal }: KPICardProps) {
  const actual = goal?.Actual ?? 0;
  const targetValue = kpi.TargetValue ?? 0;
  
  // Calculate progress: CurrentValue / TargetValue
  // If TargetValue is 0 or empty, progress is 0
  const progress = targetValue > 0 ? Math.min(100, (actual / targetValue) * 100) : 0;
  
  // Format target display: show "—" if TargetValue is empty/zero
  const targetDisplay = targetValue > 0 ? targetValue.toString() : '—';
  
  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">
            {kpi.Category}
          </p>
          <CardTitle className="text-sm md:text-base font-medium mt-0.5 md:mt-1 leading-tight">
            {kpi.Name}
          </CardTitle>
        </div>
        <div className="p-1.5 md:p-2 rounded-full bg-green-50 dark:bg-green-950/20 ml-2 flex-shrink-0">
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-500" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 md:gap-2 mb-2 md:mb-3">
        <span className="text-xl md:text-2xl font-bold text-foreground">
          {actual}
        </span>
        <span className="text-xs md:text-sm text-muted-foreground">
          / {targetDisplay}{kpi.Unit ? ` ${kpi.Unit}` : ''}
        </span>
      </div>
      
      <Progress value={progress} className="h-1.5 md:h-2" />
      
      <div className="flex justify-between items-center mt-1.5 md:mt-2">
        <span className="text-[10px] md:text-xs text-muted-foreground">
          {kpi.Periodicity}
        </span>
        <span className="text-xs md:text-sm font-medium text-primary">
          {progress.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
