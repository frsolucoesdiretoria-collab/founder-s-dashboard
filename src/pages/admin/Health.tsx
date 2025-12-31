import { useState, useEffect } from 'react';
import { runHealthCheck, validateAdminPasscode } from '@/services';
import type { HealthCheckResult } from '@/types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHealth() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const result = await runHealthCheck(passcode);
      setHealthResult(result);
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      runCheck();
    }
  }, [authenticated]);

  const handleAuth = () => {
    if (validateAdminPasscode(passcode)) {
      setAuthenticated(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Health Check
            </CardTitle>
            <CardDescription>
              Entre com o passcode (admin123)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <Button className="w-full" onClick={handleAuth}>Entrar</Button>
            <Link to="/dashboard"><Button variant="ghost" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusIcon = { ok: <CheckCircle className="h-5 w-5 text-primary" />, warning: <AlertTriangle className="h-5 w-5 text-chart-1" />, error: <XCircle className="h-5 w-5 text-destructive" /> };
  const statusColor = { ok: 'bg-primary/10 text-primary border-primary/20', warning: 'bg-chart-1/10 text-chart-1 border-chart-1/20', error: 'bg-destructive/10 text-destructive border-destructive/20' };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Health Check</h1><p className="text-muted-foreground">Status do sistema</p></div>
          <Button onClick={runCheck} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
        </div>
        {healthResult && (
          <>
            <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Status Geral</CardTitle><Badge variant="outline" className={statusColor[healthResult.status]}>{statusIcon[healthResult.status]}<span className="ml-1 capitalize">{healthResult.status}</span></Badge></div></CardHeader></Card>
            <Card><CardHeader><CardTitle>Verificações</CardTitle></CardHeader><CardContent className="space-y-2">{healthResult.checks.map((check, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border"><div className="flex items-center gap-3">{statusIcon[check.status]}<div><p className="font-medium text-foreground text-sm">{check.name}</p><p className="text-xs text-muted-foreground">{check.message}</p></div></div></div>))}</CardContent></Card>
          </>
        )}
        <Link to="/dashboard"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
      </div>
    </div>
  );
}
