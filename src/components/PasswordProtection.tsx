import { useState, useEffect } from 'react';
import { PasswordLogin } from './PasswordLogin';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica se o usuário já está autenticado
    const authenticated = sessionStorage.getItem('frtech_authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // Mostra loading enquanto verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return <PasswordLogin onSuccess={handleAuthSuccess} />;
  }

  // Se estiver autenticado, mostra o conteúdo protegido
  return <>{children}</>;
}

