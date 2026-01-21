import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePaid?: boolean; // Se true, só permite usuários com plano pago
}

export function ProtectedRoute({ children, requirePaid = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, checkTrialStatus } = useAuth();

  useEffect(() => {
    // Verificar token ao montar o componente
    if (!isLoading && !isAuthenticated) {
      // Token inválido ou expirado
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vende-mais-obras/login" replace />;
  }

  // Verificar status do trial
  const trialStatus = checkTrialStatus();
  const { isTrial, daysLeft, isExpired } = trialStatus;

  // Se trial expirado e não tem plano pago
  if (isExpired && !user?.PlanoAtivo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="bg-[#1f1f1f] border-[#2a2a2a] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Trial Expirado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Acesso Bloqueado</AlertTitle>
              <AlertDescription className="text-gray-300">
                Seu período de trial expirou. Para continuar usando o sistema, é necessário assinar um plano.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
                onClick={() => window.location.href = '/vende-mais-obras/perfil'}
              >
                Ver Perfil
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                onClick={() => window.location.href = '/vende-mais-obras/login'}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se requer plano pago mas usuário não tem
  if (requirePaid && !user?.PlanoAtivo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="bg-[#1f1f1f] border-[#2a2a2a] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-400" />
              Plano Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <CreditCard className="h-4 w-4 text-yellow-400" />
              <AlertTitle className="text-yellow-400">Plano Pago Necessário</AlertTitle>
              <AlertDescription className="text-gray-300">
                Esta funcionalidade requer um plano pago ativo.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
              onClick={() => window.location.href = '/vende-mais-obras/perfil'}
            >
              Ver Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar aviso se trial está acabando (3 dias ou menos)
  if (isTrial && daysLeft !== null && daysLeft <= 3 && daysLeft > 0) {
    return (
      <div>
        <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
          <Clock className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">Trial Expirando</AlertTitle>
          <AlertDescription className="text-gray-300">
            Seu trial expira em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}. Assine um plano para continuar usando o sistema.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}








