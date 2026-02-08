// FR Tech OS - Finance KPI Card Component
// Premium KPI card for financial dashboard

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceKPICardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  subtitle?: string;
  loading?: boolean;
}

export function FinanceKPICard({
  label,
  value,
  trend,
  icon,
  variant = 'default',
  subtitle,
  loading = false
}: FinanceKPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20',
    danger: 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'up') return 'text-green-600 dark:text-green-400';
    if (trend.direction === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-md',
      variantStyles[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {value}
              </h2>
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  getTrendColor()
                )}>
                  {getTrendIcon()}
                  <span>{Math.abs(trend.value).toFixed(1)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
