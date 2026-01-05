import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CORRECT_PASSWORD = 'crescercomtec';

interface PasswordLoginProps {
  onSuccess: () => void;
}

export function PasswordLogin({ onSuccess }: PasswordLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simula uma pequena verificação (pode remover o setTimeout se preferir)
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        // Salva a autenticação no sessionStorage (expira ao fechar o navegador)
        sessionStorage.setItem('frtech_authenticated', 'true');
        toast.success('Acesso autorizado!');
        onSuccess();
      } else {
        setError(true);
        toast.error('Senha incorreta');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>
            Digite a senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={error ? 'border-destructive' : ''}
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Senha incorreta. Tente novamente.</span>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? 'Verificando...' : 'Acessar Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

