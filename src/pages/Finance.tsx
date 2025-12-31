import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KPICard } from '@/components/KPICard';
import { DollarSign, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getFinancialKPIs, getFinanceMetrics } from '@/services';
import { validateAdminPasscode } from '@/services/health.service';
import type { KPI } from '@/types/kpi';
import type { NotionKPI, NotionGoal } from '@/lib/notion/types';
import { getAllGoals } from '@/services';

export default function FinancePage() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [financialKPIs, setFinancialKPIs] = useState<KPI[]>([]);
  const [financeMetrics, setFinanceMetrics] = useState<any[]>([]);
  const [goals, setGoals] = useState<NotionGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!passcode.trim()) {
      setAuthError('Digite a senha mestra');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      // Try to fetch financial KPIs to validate passcode
      const kpis = await getFinancialKPIs(passcode);
      setAuthenticated(true);
      setFinancialKPIs(kpis);
      
      // Load goals to match with KPIs
      const goalsData = await getAllGoals();
      setGoals(goalsData);
      
      // Load finance metrics from DB11
      try {
        const metrics = await getFinanceMetrics(passcode);
        setFinanceMetrics(metrics);
      } catch (err) {
        console.warn('Could not load finance metrics:', err);
        // Don't block the page if metrics fail
      }
      
      toast.success('Acesso autorizado');
    } catch (err: any) {
      setAuthError(err.message || 'Senha incorreta');
      toast.error('Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Dashboard Financeiro
            </CardTitle>
            <CardDescription>
              Entre com a senha mestra para acessar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Senha mestra"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              disabled={loading}
            />
            <Button className="w-full" onClick={handleAuth} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <Link to="/dashboard" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-6">
        {/* Header with quote */}
        <div className="px-1">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 md:h-8 w-8 text-primary" />
              Dashboard Financeiro
            </h1>
            <p className="text-lg md:text-xl font-semibold text-primary italic">
              O QUE IMPORTA É O SEU RESULTADO
            </p>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Métricas financeiras em tempo real
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Financial KPIs Grid */}
        {financialKPIs.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum KPI financeiro configurado.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {financialKPIs.map((kpi) => {
              const goal = goals.find(g => g.KPI === kpi.id);
              return <KPICard key={kpi.id} kpi={kpi as NotionKPI} goal={goal} />;
            })}
          </div>
        )}

        {/* Finance Metrics from DB11 */}
        {financeMetrics.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Métricas Financeiras (DB11)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {financeMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{metric.Name || 'Métrica'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {metric.Value || '—'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}

