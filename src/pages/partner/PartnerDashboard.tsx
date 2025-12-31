import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Referral {
  id: string;
  Name: string;
  Client: string;
  Status: string;
}

interface CommissionEntry {
  id: string;
  Name: string;
  PaidAmount: number;
  ProjectedAmount: number;
  Status: string;
}

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if partner is logged in
    const email = sessionStorage.getItem('partner_email');
    if (!email) {
      navigate('/partner/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data for now
      setReferrals([
        { id: '1', Name: 'Referral 1', Client: 'Client A', Status: 'Em Andamento' },
        { id: '2', Name: 'Referral 2', Client: 'Client B', Status: 'Fechado' },
      ]);
      setCommissions([
        { id: '1', Name: 'Comissão Jan', PaidAmount: 1000, ProjectedAmount: 1500, Status: 'Pago' },
        { id: '2', Name: 'Comissão Fev', PaidAmount: 0, ProjectedAmount: 2000, Status: 'Pendente' },
      ]);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('partner_email');
    sessionStorage.removeItem('partner_token');
    navigate('/partner/login');
  };

  const statusColors: Record<string, string> = {
    'Em Andamento': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    'Fechado': 'bg-primary/10 text-primary border-primary/20',
    'Pendente': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  };

  // Group referrals by status
  const referralsByStatus = {
    'Em Andamento': referrals.filter(r => r.Status === 'Em Andamento'),
    'Fechado': referrals.filter(r => r.Status === 'Fechado'),
    'Pendente': referrals.filter(r => r.Status === 'Pendente'),
  };

  const totalPaid = commissions.reduce((sum, c) => sum + c.PaidAmount, 0);
  const totalProjected = commissions.reduce((sum, c) => sum + c.ProjectedAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Dashboard de Parceiro
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas indicações e comissões
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Commission Ledger Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões</CardTitle>
            <CardDescription>
              Realizado vs Projetado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Realizado</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalPaid.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projetado</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {totalProjected.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {commissions.map(commission => (
                  <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{commission.Name}</p>
                      <p className="text-sm text-muted-foreground">
                        Pago: R$ {commission.PaidAmount.toLocaleString('pt-BR')} | 
                        Projetado: R$ {commission.ProjectedAmount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline">{commission.Status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Kanban */}
        <Card>
          <CardHeader>
            <CardTitle>Indicações</CardTitle>
            <CardDescription>
              Pipeline de indicações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(referralsByStatus).map(([status, statusReferrals]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-medium text-sm">{status}</h3>
                    <Badge variant="outline">{statusReferrals.length}</Badge>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {statusReferrals.map(referral => (
                        <div
                          key={referral.id}
                          className="p-3 rounded-lg border border-border bg-card"
                        >
                          <p className="font-medium text-sm">{referral.Name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{referral.Client}</p>
                        </div>
                      ))}
                      {statusReferrals.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Nenhuma indicação
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm">Complete seu perfil para aumentar suas chances</p>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm">Você tem {referrals.filter(r => r.Status === 'Pendente').length} indicações pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

