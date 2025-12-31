import { useState, useEffect } from 'react';
import { runHealthCheck } from '@/lib/notion/data-layer';
import type { HealthCheckResult } from '@/lib/notion/types';
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
      const result = await runHealthCheck();
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
    // In production, this would validate against ADMIN_PASSCODE
    // For now, accept any non-empty passcode
    if (passcode.trim()) {
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
              Entre com o passcode de administrador
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
            <Button className="w-full" onClick={handleAuth}>
              Entrar
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

  const statusIcon = {
    ok: <CheckCircle className="h-5 w-5 text-primary" />,
    warning: <AlertTriangle className="h-5 w-5 text-chart-1" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
  };

  const statusColor = {
    ok: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Health Check</h1>
            <p className="text-muted-foreground">
              Status do sistema e configuração
            </p>
          </div>
          <Button onClick={runCheck} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {healthResult && (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Status Geral</CardTitle>
                  <Badge variant="outline" className={statusColor[healthResult.status]}>
                    {statusIcon[healthResult.status]}
                    <span className="ml-1 capitalize">{healthResult.status}</span>
                  </Badge>
                </div>
                <CardDescription>
                  Última verificação: {new Date(healthResult.timestamp).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Individual Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Verificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthResult.checks.map((check, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon[check.status]}
                      <div>
                        <p className="font-medium text-foreground text-sm">{check.name}</p>
                        <p className="text-xs text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Configuration Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração Necessária</CardTitle>
                <CardDescription>
                  Para conectar ao Notion, configure as seguintes variáveis de ambiente:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`NOTION_TOKEN=secret_xxx
NOTION_DB_KPIS=xxx
NOTION_DB_GOALS=xxx
NOTION_DB_ACTIONS=xxx
NOTION_DB_CONTACTS=xxx
NOTION_DB_CLIENTS=xxx
NOTION_DB_GROWTHPROPOSALS=xxx
NOTION_DB_COFFEEDIAGNOSTICS=xxx
NOTION_DB_JOURNAL=xxx
NOTION_DB_EXPANSIONOPPORTUNITIES=xxx
NOTION_DB_CUSTOMERWINS=xxx
NOTION_DB_FINANCEMETRICS=xxx
ADMIN_PASSCODE=xxx`}
                </pre>
              </CardContent>
            </Card>
          </>
        )}

        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
