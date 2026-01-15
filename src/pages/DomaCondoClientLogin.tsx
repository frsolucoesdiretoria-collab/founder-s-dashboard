// DOMA CONDO Client Login Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginClient } from '@/services/domaCondoClient.service';
import { toast } from 'sonner';
import { Lock, LogIn } from 'lucide-react';

export default function DomaCondoClientLogin() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginClient(login, password);
      toast.success('Login realizado com sucesso!');
      navigate('/doma-condo-clientes/relatorio');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 safe-area-inset">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-full bg-primary/10">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl text-center">Portal do Cliente</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">
            DOMA CONDO - Assessoria, Consultoria e BPO Financeiro
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-sm">Login</Label>
              <Input
                id="login"
                type="text"
                placeholder="Digite seu login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                disabled={loading}
                className="h-11 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 sm:h-10"
              />
            </div>
            <Button type="submit" className="w-full gap-2 h-11 sm:h-10" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <strong>Dados de teste:</strong><br />
              Login: fenix | Senha: fenix2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

