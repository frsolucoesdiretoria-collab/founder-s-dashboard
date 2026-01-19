import { useEffect, useState } from 'react';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  vendeMaisObrasHealth,
  getVendeMaisObrasLeads,
  getVendeMaisObrasUsuarios,
  getVendeMaisObrasOrcamentos,
  getVendeMaisObrasMetricas,
  vendeMaisObrasSetup,
} from '@/services/vendeMaisObras.service';
import type { VendeMaisObrasLead, VendeMaisObrasUsuario, VendeMaisObrasOrcamento, VendeMaisObrasMetricas } from '@/types/vendeMaisObras';
import { RefreshCw, Settings, BarChart3, Users, FileText, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendeMaisObrasPage() {
  const [passcode, setPasscode] = useState<string>(() => sessionStorage.getItem('vende_mais_obras_admin_passcode') || '');
  const [passcodeDraft, setPasscodeDraft] = useState(passcode);
  const [loading, setLoading] = useState(false);

  const [health, setHealth] = useState<{ status: string; service: string } | null>(null);
  const [leads, setLeads] = useState<VendeMaisObrasLead[]>([]);
  const [usuarios, setUsuarios] = useState<VendeMaisObrasUsuario[]>([]);
  const [orcamentos, setOrcamentos] = useState<VendeMaisObrasOrcamento[]>([]);
  const [metricas, setMetricas] = useState<VendeMaisObrasMetricas | null>(null);

  const canCall = passcode.trim().length > 0;

  const loadAll = async (opts?: { showToast?: boolean }) => {
    if (!canCall) return;
    setLoading(true);
    try {
      const [h, leadsData, usuariosData, orcamentosData, metricasData] = await Promise.all([
        vendeMaisObrasHealth().catch(() => null),
        getVendeMaisObrasLeads(passcode),
        getVendeMaisObrasUsuarios(passcode),
        getVendeMaisObrasOrcamentos(passcode),
        getVendeMaisObrasMetricas(passcode),
      ]);
      setHealth(h);
      setLeads(leadsData);
      setUsuarios(usuariosData);
      setOrcamentos(orcamentosData);
      setMetricas(metricasData);
      if (opts?.showToast) toast.success('Dados atualizados');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canCall) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  const handleSavePasscode = () => {
    const next = passcodeDraft.trim();
    setPasscode(next);
    sessionStorage.setItem('vende_mais_obras_admin_passcode', next);
    toast.success('Passcode configurado');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vende_mais_obras_authenticated');
    sessionStorage.removeItem('vende_mais_obras_admin_passcode');
    window.location.reload();
  };

  const runSetup = async () => {
    try {
      await vendeMaisObrasSetup(passcode);
      toast.success('Setup executado');
    } catch (e: any) {
      toast.error(e?.message || 'Erro no setup');
    }
  };

  return (
    <VendeMaisObrasLayout
      title="Dashboard"
      subtitle="Visão geral do Vende+ Obras"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Botão para Catálogo */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Acesso Rápido</CardTitle>
            <CardDescription className="text-gray-400">Acesse o catálogo de serviços para gerenciar seus produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/vende-mais-obras/catalogo">
              <Button className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90">
                <Package className="mr-2 h-4 w-4" />
                Acessar Catálogo de Serviços
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-[#FFD700]" />
                  Operação (passcode)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Necessário para carregar e atualizar dados via API.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => loadAll({ showToast: true })} disabled={!canCall || loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Digite o passcode"
                  value={passcodeDraft}
                  onChange={(e) => setPasscodeDraft(e.target.value)}
                  className="bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleSavePasscode} disabled={!passcodeDraft.trim()}>
                  Salvar passcode
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Status API:{' '}
                <span className="font-medium text-foreground">
                  {health ? `${health.service}: ${health.status}` : canCall ? 'carregando...' : '—'}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="metricas" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1f1f1f] border-[#2a2a2a]">
            <TabsTrigger value="metricas" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0a0a0a]">Métricas</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0a0a0a]">Leads</TabsTrigger>
            <TabsTrigger value="usuarios" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0a0a0a]">Usuários</TabsTrigger>
            <TabsTrigger value="orcamentos" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#0a0a0a]">Orçamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="metricas" className="mt-4 space-y-4">
            {metricas ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Leads Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#FFD700]">{metricas.leadsTotal}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Usuários Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#FFD700]">{metricas.usuariosAtivos}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Conversão Trial → Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#FFD700]">{metricas.conversaoTrialParaPago.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Orçamentos Criados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#FFD700]">{metricas.orcamentosCriados}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Informe o passcode para carregar métricas.</p>
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-4 space-y-4">
            <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle className="text-white">Leads Scraped</CardTitle>
                <CardDescription className="text-gray-400">Profissionais extraídos do Google Maps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <TableHead className="text-gray-400">Nome</TableHead>
                        <TableHead className="text-gray-400">Telefone</TableHead>
                        <TableHead className="text-gray-400">Profissão</TableHead>
                        <TableHead className="text-gray-400">Cidade</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (
                        <TableRow className="border-[#2a2a2a]">
                          <TableCell colSpan={5} className="text-center text-gray-400">
                            {canCall ? 'Sem leads ainda.' : 'Informe o passcode para carregar dados.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        leads.map((l) => (
                          <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                            <TableCell className="font-medium text-white">{l.Name}</TableCell>
                            <TableCell className="text-gray-300">{l.Telefone || '—'}</TableCell>
                            <TableCell className="text-gray-300">{l.Profissao || '—'}</TableCell>
                            <TableCell className="text-gray-300">{l.Cidade || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-[#2a2a2a] text-gray-300">{l.Status || 'Novo'}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="mt-4 space-y-4">
            <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle className="text-white">Usuários</CardTitle>
                <CardDescription className="text-gray-400">Usuários ativos e em trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <TableHead className="text-gray-400">Nome</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Trial Fim</TableHead>
                        <TableHead className="text-gray-400">Plano Ativo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.length === 0 ? (
                        <TableRow className="border-[#2a2a2a]">
                          <TableCell colSpan={5} className="text-center text-gray-400">
                            {canCall ? 'Sem usuários ainda.' : 'Informe o passcode para carregar dados.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        usuarios.map((u) => (
                          <TableRow key={u.id} className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                            <TableCell className="font-medium text-white">{u.Name}</TableCell>
                            <TableCell className="text-gray-300">{u.Email || '—'}</TableCell>
                            <TableCell>
                              <Badge variant={u.Status === 'Ativo' ? 'default' : 'outline'} className={u.Status === 'Ativo' ? 'bg-[#FFD700] text-[#0a0a0a]' : 'border-[#2a2a2a] text-gray-300'}>
                                {u.Status || 'Trial'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">{u.TrialFim || '—'}</TableCell>
                            <TableCell className="text-gray-300">{u.PlanoAtivo ? 'Sim' : 'Não'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orcamentos" className="mt-4 space-y-4">
            <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle className="text-white">Orçamentos</CardTitle>
                <CardDescription className="text-gray-400">Orçamentos criados pelos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <TableHead className="text-gray-400">Cliente</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Total</TableHead>
                        <TableHead className="text-gray-400">Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orcamentos.length === 0 ? (
                        <TableRow className="border-[#2a2a2a]">
                          <TableCell colSpan={4} className="text-center text-gray-400">
                            {canCall ? 'Sem orçamentos ainda.' : 'Informe o passcode para carregar dados.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        orcamentos.map((o) => (
                          <TableRow key={o.id} className="border-[#2a2a2a] hover:bg-[#1f1f1f]">
                            <TableCell className="font-medium text-white">{o.ClienteNome || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-[#2a2a2a] text-gray-300">{o.Status || 'Rascunho'}</Badge>
                            </TableCell>
                            <TableCell className="text-[#FFD700] font-medium">
                              {o.Total ? `R$ ${o.Total.toFixed(2).replace('.', ',')}` : '—'}
                            </TableCell>
                            <TableCell className="text-gray-300">{o.CreatedAt ? new Date(o.CreatedAt).toLocaleDateString() : '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendeMaisObrasLayout>
  );
}
