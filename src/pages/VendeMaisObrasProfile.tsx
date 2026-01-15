import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateProfile } from '@/services/vendeMaisObras.service';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Clock, CreditCard, CheckCircle2, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function VendeMaisObrasProfile() {
  const { user, checkTrialStatus, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const trialStatus = checkTrialStatus();
  const { isTrial, daysLeft, isExpired } = trialStatus;

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user?.Name || '',
      telefone: user?.Telefone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile({
        Nome: data.nome,
        Telefone: data.telefone,
      });
      toast.success('Perfil atualizado com sucesso!');
      // Recarregar página para atualizar dados do usuário
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordError(null);
    setIsLoading(true);
    try {
      await updateProfile({
        Password: data.newPassword,
        // Backend deve verificar senha atual
      });
      toast.success('Senha atualizada com sucesso!');
      setIsPasswordDialogOpen(false);
      resetPassword();
    } catch (error: any) {
      setPasswordError(error?.message || 'Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <VendeMaisObrasLayout title="Perfil">
        <p className="text-gray-400">Carregando...</p>
      </VendeMaisObrasLayout>
    );
  }

  return (
    <VendeMaisObrasLayout title="Meu Perfil" subtitle="Gerencie suas informações pessoais">
      <div className="space-y-6">
        {/* Status do Trial/Plano */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Status da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status:</span>
              <Badge
                variant={user.PlanoAtivo ? 'default' : user.Status === 'Trial' ? 'secondary' : 'destructive'}
                className={
                  user.PlanoAtivo
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : user.Status === 'Trial'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }
              >
                {user.PlanoAtivo ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Plano Ativo
                  </>
                ) : user.Status === 'Trial' ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Trial
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {user.Status || 'Bloqueado'}
                  </>
                )}
              </Badge>
            </div>

            {isTrial && daysLeft !== null && (
              <Alert className={isExpired ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}>
                {isExpired ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertTitle className="text-red-400">Trial Expirado</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      Seu trial expirou. Assine um plano para continuar usando o sistema.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <AlertTitle className="text-yellow-400">Trial Ativo</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      {daysLeft === 0
                        ? 'Seu trial expira hoje!'
                        : `Seu trial expira em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}.`}
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}

            {user.TrialFim && (
              <div className="text-sm text-gray-400">
                <span>Trial até: </span>
                <span className="text-white">
                  {format(new Date(user.TrialFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}

            {user.CreatedAt && (
              <div className="text-sm text-gray-400">
                <span>Membro desde: </span>
                <span className="text-white">
                  {format(new Date(user.CreatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editar Perfil */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Informações Pessoais</CardTitle>
            <CardDescription className="text-gray-400">
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.Email || ''}
                  disabled
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-gray-500"
                />
                <p className="text-xs text-gray-500">O email não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-300">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  type="text"
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  {...registerProfile('nome')}
                  disabled={isLoading}
                />
                {profileErrors.nome && (
                  <p className="text-sm text-red-400">{profileErrors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-300">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  {...registerProfile('telefone')}
                  disabled={isLoading}
                />
                {profileErrors.telefone && (
                  <p className="text-sm text-red-400">{profileErrors.telefone.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>

                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1f1f1f] border-[#2a2a2a] text-white">
                    <DialogHeader>
                      <DialogTitle>Alterar Senha</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Digite sua senha atual e a nova senha
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                      {passwordError && (
                        <Alert className="bg-red-500/10 border-red-500/30">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-400">{passwordError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-300">
                          Senha Atual
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                          {...registerPassword('currentPassword')}
                          disabled={isLoading}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-red-400">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-300">
                          Nova Senha
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                          {...registerPassword('newPassword')}
                          disabled={isLoading}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-red-400">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">
                          Confirmar Nova Senha
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                          {...registerPassword('confirmPassword')}
                          disabled={isLoading}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-red-400">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsPasswordDialogOpen(false);
                            resetPassword();
                            setPasswordError(null);
                          }}
                          className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Atualizando...
                            </>
                          ) : (
                            'Atualizar Senha'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Sair da Conta</CardTitle>
            <CardDescription className="text-gray-400">
              Faça logout da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={logout}
              className="w-full"
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </VendeMaisObrasLayout>
  );
}


