import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Lock, ArrowLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminFinance() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = () => {
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
              Admin Finance
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

  // Mock financial data - only visible to admin
  const financialData = {
    mrr: 15000,
    arr: 180000,
    churn: 2.5,
    nrr: 115,
    expansion: 3500,
    contraction: 500,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Métricas Financeiras
          </h1>
          <p className="text-muted-foreground">
            Visível apenas para administradores
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Wallet className="h-4 w-4" />
                MRR
              </div>
              <p className="text-2xl font-bold text-foreground">
                R$ {financialData.mrr.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                ARR
              </div>
              <p className="text-2xl font-bold text-foreground">
                R$ {financialData.arr.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Churn
              </div>
              <p className="text-2xl font-bold text-foreground">
                {financialData.churn}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                NRR
              </div>
              <p className="text-2xl font-bold text-primary">
                {financialData.nrr}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                Expansão
              </div>
              <p className="text-2xl font-bold text-foreground">
                R$ {financialData.expansion.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingDown className="h-4 w-4" />
                Contração
              </div>
              <p className="text-2xl font-bold text-foreground">
                R$ {financialData.contraction.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notice */}
        <Card className="border-chart-1/20 bg-chart-1/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Esta página só é acessível com o passcode de administrador. 
              Os dados financeiros nunca são expostos nas rotas públicas.
            </p>
          </CardContent>
        </Card>

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
