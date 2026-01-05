import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getPublicKPIs, getPublicGoals } from '@/services';
import type { KPI } from '@/types/kpi';
import type { Goal } from '@/types/goal';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DailyRoutine } from '@/components/DailyRoutine';

type PeriodGroup = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

interface GroupedKPIs {
  Mensal: { kpi: KPI; goal?: Goal }[];
  Trimestral: { kpi: KPI; goal?: Goal }[];
  Semestral: { kpi: KPI; goal?: Goal }[];
  Anual: { kpi: KPI; goal?: Goal }[];
}

export default function DashboardV02() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Se já está carregando inicialmente, não mostrar loading no refresh
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const [kpisData, goalsData] = await Promise.all([
        getPublicKPIs(),
        getPublicGoals()
      ]);

      // Remove duplicate KPIs by name (keep first occurrence, prefer higher SortOrder)
      const uniqueKPIs = new Map<string, KPI>();
      kpisData.forEach(kpi => {
        const key = kpi.Name.trim().toLowerCase();
        const existing = uniqueKPIs.get(key);
        if (!existing) {
          uniqueKPIs.set(key, kpi);
        } else {
          // Keep the one with higher SortOrder (or first if equal)
          if ((kpi.SortOrder || 0) > (existing.SortOrder || 0)) {
            uniqueKPIs.set(key, kpi);
          }
        }
      });

      const sortedKpis = Array.from(uniqueKPIs.values()).sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
      setKpis(sortedKpis);
      setGoals(goalsData);
      
      if (refreshing) {
        toast.success('Dados atualizados');
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      
      if (err.message?.includes('429') || err.message?.includes('rate limit')) {
        setError('Muitas requisições. Aguarde alguns segundos e recarregue a página.');
        toast.error('Limite de requisições atingido. Aguarde um momento.');
      } else {
        setError('Erro ao carregar dados. Verifique sua conexão.');
        toast.error('Erro ao carregar dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Group KPIs by period (duplicates already removed in loadData)
  const groupedKPIs: GroupedKPIs = {
    Mensal: [],
    Trimestral: [],
    Semestral: [],
    Anual: []
  };

  // Track seen KPI names per period to avoid duplicates within each period
  const seenByPeriod: Record<PeriodGroup, Set<string>> = {
    Mensal: new Set(),
    Trimestral: new Set(),
    Semestral: new Set(),
    Anual: new Set()
  };

  try {
    kpis.forEach((kpi) => {
      if (!kpi || !kpi.Name || !kpi.Periodicity) {
        return;
      }

      const kpiKey = kpi.Name.trim().toLowerCase();
      const period = kpi.Periodicity as PeriodGroup;
      
      // Only process valid periods
      if (!period || !['Mensal', 'Trimestral', 'Semestral', 'Anual'].includes(period)) {
        return;
      }
      
      // Skip if we've already seen this KPI name in this specific period
      if (seenByPeriod[period] && seenByPeriod[period].has(kpiKey)) {
        return;
      }

      const goal = goals.find(g => g.KPI === kpi.id);
      
      if (period === 'Mensal') {
        groupedKPIs.Mensal.push({ kpi, goal });
        seenByPeriod.Mensal.add(kpiKey);
      } else if (period === 'Trimestral') {
        groupedKPIs.Trimestral.push({ kpi, goal });
        seenByPeriod.Trimestral.add(kpiKey);
      } else if (period === 'Semestral') {
        groupedKPIs.Semestral.push({ kpi, goal });
        seenByPeriod.Semestral.add(kpiKey);
      } else if (period === 'Anual') {
        groupedKPIs.Anual.push({ kpi, goal });
        seenByPeriod.Anual.add(kpiKey);
      }
    });
  } catch (err) {
    console.error('Error grouping KPIs:', err);
  }

  // Sort each group by SortOrder
  Object.keys(groupedKPIs).forEach((key) => {
    groupedKPIs[key as PeriodGroup].sort((a, b) => 
      (a.kpi.SortOrder || 0) - (b.kpi.SortOrder || 0)
    );
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  const renderPeriodSection = (title: string, period: PeriodGroup, description?: string) => {
    const items = groupedKPIs[period];
    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm md:text-base text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {items.map(({ kpi, goal }) => (
            <KPICard 
              key={kpi.id} 
              kpi={kpi as NotionKPI} 
              goal={goal as NotionGoal | undefined} 
            />
          ))}
        </div>
        <Separator className="my-6" />
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 pb-6">
        <div className="px-1 md:px-0 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Os números apontam o caminho. Quem mede, evolui. Quem não mensura, não melhora e fica estagnado
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Revise os números mais importantes da empresa diariamente para que os objetivos de crescimento de 2026 sejam alcançados com êxito.
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading || refreshing}
            className="md:flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* TEMPORÁRIO: Campo de rotinas diárias oculto - Bruno não deve ver profetização e agradecimentos */}
        {/* <DailyRoutine /> */}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {kpis.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum KPI configurado. Configure os KPIs na área administrativa.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {renderPeriodSection(
              'Metas Mensais',
              'Mensal',
              'Metas para Janeiro 2026'
            )}
            
            {renderPeriodSection(
              'Metas Trimestrais',
              'Trimestral',
              'Metas para Q1 2026 (Janeiro - Março)'
            )}
            
            {renderPeriodSection(
              'Metas Semestrais',
              'Semestral',
              'Metas para 1º Semestre 2026 (Janeiro - Junho)'
            )}
            
            {renderPeriodSection(
              'Metas Anuais',
              'Anual',
              'Metas para 2026'
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

