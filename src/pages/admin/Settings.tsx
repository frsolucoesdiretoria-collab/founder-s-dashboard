import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Lock, ArrowLeft, Save, AlertTriangle, Link as LinkIcon, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllKPIs, updateKPI } from '@/services/kpis.service';
import type { KPI } from '@/types/kpi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminSettings() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  
  const handleAuth = () => {
    if (passcode.trim()) {
      setAuthenticated(true);
      loadKPIs();
    }
  };

  const loadKPIs = async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const data = await getAllKPIs(passcode);
      setKpis(data);
    } catch (error: any) {
      toast.error('Erro ao carregar KPIs: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadKPIs();
    }
  }, [authenticated]);

  const handleUpdateKPI = async (kpiId: string, updates: Partial<KPI>) => {
    setSaving(prev => ({ ...prev, [kpiId]: true }));
    try {
      await updateKPI(kpiId, updates, passcode);
      await loadKPIs(); // Reload to get server-enforced values
      toast.success('KPI atualizado!');
    } catch (error: any) {
      toast.error('Erro ao atualizar KPI: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(prev => ({ ...prev, [kpiId]: false }));
    }
  };

  const handleToggle = async (kpi: KPI, field: keyof KPI, value: any) => {
    const updates: any = { [field]: value };
    
    // If setting IsFinancial=true, server will force VisiblePublic=false
    if (field === 'IsFinancial' && value === true) {
      // Don't update VisiblePublic here, let server handle it
    } else if (field === 'VisiblePublic' && kpi.IsFinancial && value === true) {
      toast.error('KPI financeiro nunca pode aparecer no público!');
      return;
    }
    
    await handleUpdateKPI(kpi.id, updates);
  };

  const handleNumberChange = async (kpi: KPI, field: 'SortOrder', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    await handleUpdateKPI(kpi.id, { [field]: numValue });
  };

  const handleSelectChange = async (kpi: KPI, field: 'Periodicity' | 'ChartType', value: string) => {
    await handleUpdateKPI(kpi.id, { [field]: value as any });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Settings
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Configurações
            </h1>
            <p className="text-muted-foreground">
              Configurações do sistema e edição de KPIs
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Links rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/health">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium">Health Check</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/__selftest">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span className="font-medium">Self Test</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* KPI Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de KPIs</CardTitle>
            <CardDescription>
              Edite propriedades dos KPIs. KPIs financeiros nunca aparecem no público.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando KPIs...
              </div>
            ) : kpis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum KPI encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{kpi.Name}</h3>
                        <p className="text-sm text-muted-foreground">{kpi.Category}</p>
                      </div>
                      {kpi.IsFinancial && (
                        <Alert className="border-destructive bg-destructive/10 max-w-md">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-sm text-destructive font-medium">
                            KPI financeiro nunca aparece no público
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* VisiblePublic */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`visible-public-${kpi.id}`}>Visível Público</Label>
                        <Switch
                          id={`visible-public-${kpi.id}`}
                          checked={kpi.VisiblePublic}
                          onCheckedChange={(checked) => handleToggle(kpi, 'VisiblePublic', checked)}
                          disabled={kpi.IsFinancial || saving[kpi.id]}
                        />
                        {kpi.IsFinancial && (
                          <span className="text-xs text-muted-foreground ml-2">(bloqueado)</span>
                        )}
                      </div>

                      {/* VisibleAdmin */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`visible-admin-${kpi.id}`}>Visível Admin</Label>
                        <Switch
                          id={`visible-admin-${kpi.id}`}
                          checked={kpi.VisibleAdmin}
                          onCheckedChange={(checked) => handleToggle(kpi, 'VisibleAdmin', checked)}
                          disabled={saving[kpi.id]}
                        />
                      </div>

                      {/* Active */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`active-${kpi.id}`}>Ativo</Label>
                        <Switch
                          id={`active-${kpi.id}`}
                          checked={kpi.Active}
                          onCheckedChange={(checked) => handleToggle(kpi, 'Active', checked)}
                          disabled={saving[kpi.id]}
                        />
                      </div>

                      {/* IsFinancial */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`financial-${kpi.id}`}>Financeiro (R$)</Label>
                        <Switch
                          id={`financial-${kpi.id}`}
                          checked={kpi.IsFinancial}
                          onCheckedChange={(checked) => handleToggle(kpi, 'IsFinancial', checked)}
                          disabled={saving[kpi.id]}
                        />
                      </div>

                      {/* SortOrder */}
                      <div className="space-y-2">
                        <Label htmlFor={`sort-${kpi.id}`}>Ordem</Label>
                        <Input
                          id={`sort-${kpi.id}`}
                          type="number"
                          value={kpi.SortOrder}
                          onChange={(e) => handleNumberChange(kpi, 'SortOrder', e.target.value)}
                          disabled={saving[kpi.id]}
                          className="w-24"
                        />
                      </div>

                      {/* Periodicity */}
                      <div className="space-y-2">
                        <Label htmlFor={`periodicity-${kpi.id}`}>Periodicidade</Label>
                        <Select
                          value={kpi.Periodicity}
                          onValueChange={(value) => handleSelectChange(kpi, 'Periodicity', value)}
                          disabled={saving[kpi.id]}
                        >
                          <SelectTrigger id={`periodicity-${kpi.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Anual">Anual</SelectItem>
                            <SelectItem value="Mensal">Mensal</SelectItem>
                            <SelectItem value="Semanal">Semanal</SelectItem>
                            <SelectItem value="Diário">Diário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* ChartType */}
                      <div className="space-y-2">
                        <Label htmlFor={`chart-${kpi.id}`}>Tipo de Gráfico</Label>
                        <Select
                          value={kpi.ChartType}
                          onValueChange={(value) => handleSelectChange(kpi, 'ChartType', value)}
                          disabled={saving[kpi.id]}
                        >
                          <SelectTrigger id={`chart-${kpi.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">Linha</SelectItem>
                            <SelectItem value="bar">Barras</SelectItem>
                            <SelectItem value="area">Área</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
