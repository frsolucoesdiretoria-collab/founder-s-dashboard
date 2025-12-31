import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Lock, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  const [settings, setSettings] = useState({
    partnerFeatureFlag: false,
    debugMode: false,
    mockData: true,
  });

  const handleAuth = () => {
    if (passcode.trim()) {
      setAuthenticated(true);
    }
  };

  const handleSave = () => {
    toast.success('Configurações salvas!');
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Configurações do sistema
          </p>
        </div>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Controle de funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Portal de Parceiros (Fase 2)</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita rotas /partner/*
                </p>
              </div>
              <Switch
                checked={settings.partnerFeatureFlag}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, partnerFeatureFlag: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Debug</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe logs detalhados no console
                </p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, debugMode: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Usar Dados Mock</Label>
                <p className="text-xs text-muted-foreground">
                  Usa dados de exemplo quando Notion não está configurado
                </p>
              </div>
              <Switch
                checked={settings.mockData}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, mockData: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Database IDs */}
        <Card>
          <CardHeader>
            <CardTitle>Databases do Notion</CardTitle>
            <CardDescription>
              IDs das databases configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">KPIs</span>
                <span className="font-mono text-foreground">Não configurado</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Goals</span>
                <span className="font-mono text-foreground">Não configurado</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Actions</span>
                <span className="font-mono text-foreground">Não configurado</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Journal</span>
                <span className="font-mono text-foreground">Não configurado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
