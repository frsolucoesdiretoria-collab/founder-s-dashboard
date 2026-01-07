import { useEffect, useMemo, useState } from 'react';
import { DoterraLayout } from '@/components/DoterraLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  applyCohortVariant,
  approveDoterraLead,
  doterraHealth,
  doterraSetup,
  exportDoterraCsv,
  generateCohortVariants,
  getDoterraImportStatus,
  getDoterraCohortsSummary,
  getDoterraLeads,
  startDoterraImport,
  rejectDoterraLead,
  seedDoterra,
  updateDoterraLead,
} from '@/services/doterra.service';
import type { DoterraCohortSummary, DoterraLead, DoterraStage } from '@/types/doterra';
import { BarChart3, Download, Upload, RefreshCw, Sparkles, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const STAGES: DoterraStage[] = [
  'Aguardando ativação',
  'Contato ativado',
  'Entregue',
  'Lido',
  'Respondeu',
  'Interessado (pendente aprovação)',
  'Interessado (aprovado)',
  'Venda feita',
  'Perdido',
  'Não contatar',
];

const APPROVALS = ['Pendente', 'Aprovado', 'Reprovado'] as const;

function stageRank(stage?: string): number {
  const idx = STAGES.indexOf(stage as any);
  return idx >= 0 ? idx : 0;
}

function pct(num: number, den: number): string {
  if (!den) return '0%';
  return `${Math.round((num / den) * 1000) / 10}%`;
}

export default function DoterraPage() {
  const [passcode, setPasscode] = useState<string>(() => sessionStorage.getItem('doterra_admin_passcode') || '');
  const [passcodeDraft, setPasscodeDraft] = useState(passcode);
  const [loading, setLoading] = useState(false);

  const [health, setHealth] = useState<{ status: string; service: string } | null>(null);
  const [leads, setLeads] = useState<DoterraLead[]>([]);
  const [cohortSummary, setCohortSummary] = useState<DoterraCohortSummary[]>([]);

  const [filters, setFilters] = useState<{ cohort?: string; stage?: string; approvalStatus?: string; search?: string }>({});

  const [importBaseFile, setImportBaseFile] = useState<File | null>(null);
  const [importAtivadosFile, setImportAtivadosFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const [variantsCohort, setVariantsCohort] = useState<string>('1');
  const [variantsContext, setVariantsContext] = useState<string>('');
  const [variants, setVariants] = useState<string[]>([]);
  const [applyVariantLetter, setApplyVariantLetter] = useState<string>('A');
  const [applyingVariant, setApplyingVariant] = useState(false);

  const [setupRunning, setSetupRunning] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);

  const canCall = passcode.trim().length > 0;

  const loadAll = async (opts?: { showToast?: boolean }) => {
    if (!canCall) return;
    setLoading(true);
    try {
      const [h, leadsData, cohortsData] = await Promise.all([
        doterraHealth().catch(() => null),
        getDoterraLeads(passcode, filters),
        getDoterraCohortsSummary(passcode),
      ]);
      setHealth(h);
      setLeads(leadsData);
      setCohortSummary(cohortsData);
      if (opts?.showToast) toast.success('Dados atualizados');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao carregar dados da Doterra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canCall) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode, filters.cohort, filters.stage, filters.approvalStatus, filters.search]);

  const kpis = useMemo(() => {
    const total = leads.length;
    const countAtOrAbove = (target: DoterraStage) => leads.filter(l => stageRank(l.Stage) >= stageRank(target)).length;

    const activated = countAtOrAbove('Contato ativado');
    const delivered = countAtOrAbove('Entregue');
    const read = countAtOrAbove('Lido');
    const replied = countAtOrAbove('Respondeu');
    const interested = leads.filter(l => l.Stage === 'Interessado (pendente aprovação)' || l.Stage === 'Interessado (aprovado)').length;
    const pending = leads.filter(l => l.ApprovalStatus === 'Pendente' || l.Stage === 'Interessado (pendente aprovação)').length;
    const approved = leads.filter(l => l.ApprovalStatus === 'Aprovado' || l.Stage === 'Interessado (aprovado)').length;
    const sold = leads.filter(l => l.Stage === 'Venda feita').length;

    return {
      total,
      activated,
      delivered,
      read,
      replied,
      interested,
      pending,
      approved,
      sold,
    };
  }, [leads]);

  const chartData = useMemo(() => {
    // Aggregate per cohort (ignore variant for chart)
    const map = new Map<string, { cohort: string; total: number; activated: number; replied: number; interested: number; sold: number }>();
    for (const s of cohortSummary) {
      const c = s.cohort || '—';
      if (!map.has(c)) map.set(c, { cohort: c, total: 0, activated: 0, replied: 0, interested: 0, sold: 0 });
      const cur = map.get(c)!;
      cur.total += s.total;
      cur.activated += s.counts?.['Contato ativado'] || 0;
      cur.replied += s.counts?.['Respondeu'] || 0;
      cur.interested += (s.counts?.['Interessado (pendente aprovação)'] || 0) + (s.counts?.['Interessado (aprovado)'] || 0);
      cur.sold += s.counts?.['Venda feita'] || 0;
    }
    return Array.from(map.values()).sort((a, b) => Number(a.cohort) - Number(b.cohort));
  }, [cohortSummary]);

  const pendingLeads = useMemo(() => {
    return leads.filter(l => l.ApprovalStatus === 'Pendente' || l.Stage === 'Interessado (pendente aprovação)');
  }, [leads]);

  const uniqueCohorts = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) if (l.Cohort) set.add(l.Cohort);
    if (set.size === 0) return ['1', '2', '3'];
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [leads]);

  const handleSavePasscode = () => {
    const next = passcodeDraft.trim();
    setPasscode(next);
    sessionStorage.setItem('doterra_admin_passcode', next);
    toast.success('Passcode configurado');
  };

  const handleLogout = () => {
    // clear both: route auth + admin passcode
    sessionStorage.removeItem('doterra_authenticated');
    sessionStorage.removeItem('doterra_admin_passcode');
    window.location.reload();
  };

  const handleApprove = async (id: string) => {
    try {
      await approveDoterraLead(passcode, id);
      toast.success('Lead aprovado');
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao aprovar');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectDoterraLead(passcode, id);
      toast.success('Lead reprovado');
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao reprovar');
    }
  };

  const handleStageChange = async (leadId: string, stage: string) => {
    try {
      await updateDoterraLead(passcode, leadId, { Stage: stage });
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar stage');
    }
  };

  const handleApprovalChange = async (leadId: string, approval: string) => {
    try {
      await updateDoterraLead(passcode, leadId, { ApprovalStatus: approval });
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar aprovação');
    }
  };

  const handleNotesBlur = async (leadId: string, notes: string) => {
    try {
      await updateDoterraLead(passcode, leadId, { Notes: notes });
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar notas');
    }
  };

  const readFileText = async (file: File): Promise<string> => {
    const text = await file.text();
    // Try to fix common mojibake from latin1->utf8
    try {
      if (text.includes('Ã') || text.includes('�')) {
        return new TextDecoder('utf-8').decode(new TextEncoder().encode(text));
      }
    } catch {
      // ignore
    }
    return text;
  };

  const runImport = async (kind: 'base' | 'ativados') => {
    const file = kind === 'base' ? importBaseFile : importAtivadosFile;
    if (!file) return toast.error('Selecione um arquivo CSV');
    setImporting(true);
    try {
      const csvText = await readFileText(file);
      const { jobId } = await startDoterraImport(passcode, kind, csvText);
      toast.message('Import iniciado', { description: `Job: ${jobId}` });

      // Poll status until done/error
      const startedAt = Date.now();
      while (true) {
        const st = await getDoterraImportStatus(passcode, jobId);
        if (st.status === 'done') {
          toast.success('Import concluído', {
            description: `${st.created} criados, ${st.updated} atualizados, ${st.skipped} ignorados`,
          });
          break;
        }
        if (st.status === 'error') {
          toast.error('Import falhou', { description: st.message || 'Erro desconhecido' });
          break;
        }
        if (Date.now() - startedAt > 1000 * 60 * 20) {
          toast.error('Import demorando demais', { description: 'Verifique o status e tente novamente.' });
          break;
        }
        // surface progress lightly
        if (st.total > 0) {
          toast.message('Import em andamento', { description: `${st.processed}/${st.total} — ${st.message || ''}` });
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro no import');
    } finally {
      setImporting(false);
    }
  };

  const runExport = async () => {
    try {
      const blob = await exportDoterraCsv(passcode, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'doterra_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.message || 'Erro no export');
    }
  };

  const runSeed = async () => {
    try {
      await seedDoterra(passcode, 60);
      toast.success('Dados de teste gerados');
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao gerar dados');
    }
  };

  const runSetup = async () => {
    setSetupRunning(true);
    try {
      const res = await doterraSetup(passcode);
      setSetupResult(res);
      toast.success('Database Doterra criada no Notion');
    } catch (e: any) {
      toast.error(e?.message || 'Erro no setup');
    } finally {
      setSetupRunning(false);
    }
  };

  const runGenerateVariants = async () => {
    try {
      setVariants([]);
      const vars = await generateCohortVariants(passcode, variantsCohort, variantsContext);
      setVariants(vars);
      toast.success('Variações geradas');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao gerar variações');
    }
  };

  const runApplyVariant = async (text: string) => {
    setApplyingVariant(true);
    try {
      const r = await applyCohortVariant(passcode, variantsCohort, applyVariantLetter, text);
      toast.success(`Aplicado ao cohort ${variantsCohort}: ${r.updatedCount} leads atualizados`);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao aplicar variante');
    } finally {
      setApplyingVariant(false);
    }
  };

  const stageBadgeVariant = (stage?: string) => {
    if (!stage) return 'secondary' as const;
    if (stage.includes('Venda')) return 'default' as const;
    if (stage.includes('Interessado')) return 'secondary' as const;
    if (stage.includes('Perdido') || stage.includes('Não contatar')) return 'destructive' as const;
    return 'outline' as const;
  };

  return (
    <DoterraLayout
      title="Avivamento de clientes inativos Doterra"
      subtitle="Objetivo: gerar demanda de recompra (reativação), não venda direta."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Operação (passcode)
                </CardTitle>
                <CardDescription>
                  Necessário para carregar e atualizar dados via API. Este passcode também protege rotas sensíveis no backend.
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
                  placeholder="Digite o passcode (ex: expandircomtec)"
                  value={passcodeDraft}
                  onChange={(e) => setPasscodeDraft(e.target.value)}
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
              <span className="text-muted-foreground">•</span>
              <span>
                Leads carregados: <span className="font-medium text-foreground">{leads.length}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="approval">Aprovação</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Base total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Ativados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.activated}</div>
                  <div className="text-xs text-muted-foreground">Base → ativado: {pct(kpis.activated, kpis.total)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Respostas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.replied}</div>
                  <div className="text-xs text-muted-foreground">Ativado → resposta: {pct(kpis.replied, kpis.activated)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Interessados (pendentes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.pending}</div>
                  <div className="text-xs text-muted-foreground">Resposta → interesse: {pct(kpis.interested, kpis.replied)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Comparativo por cohort (visão macro)
                </CardTitle>
                <CardDescription>Agrega todas as variantes por cohort para enxergar tendência de performance.</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados de cohort ainda.</p>
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="cohort" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="activated" name="Ativados" fill="hsl(var(--primary))" />
                        <Bar dataKey="replied" name="Respondeu" fill="hsl(var(--secondary))" />
                        <Bar dataKey="interested" name="Interessado" fill="hsl(var(--muted-foreground))" />
                        <Bar dataKey="sold" name="Venda" fill="hsl(var(--chart-4, 140 60% 45%))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Use filtros para exportar exatamente o recorte desejado.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                  <Label>Cohort</Label>
                  <Select value={filters.cohort || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, cohort: v === 'all' ? undefined : v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueCohorts.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Stage</Label>
                  <Select value={filters.stage || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, stage: v === 'all' ? undefined : v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {STAGES.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Aprovação</Label>
                  <Select
                    value={filters.approvalStatus || 'all'}
                    onValueChange={(v) => setFilters(prev => ({ ...prev, approvalStatus: v === 'all' ? undefined : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {APPROVALS.map(a => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Busca</Label>
                  <Input
                    placeholder="Nome contém..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Leads</CardTitle>
                    <CardDescription>Lista editável (stage, aprovação, notas). Dedupe por WhatsApp acontece no import/webhook.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={runExport} disabled={!canCall}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Cohort</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Aprovação</TableHead>
                        <TableHead className="min-w-[260px]">Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {canCall ? 'Sem leads (ou filtro vazio).' : 'Informe o passcode para carregar dados.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        leads.slice(0, 500).map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.Name}</TableCell>
                            <TableCell className="text-muted-foreground">{l.WhatsApp || '—'}</TableCell>
                            <TableCell>{l.Cohort || '—'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={stageBadgeVariant(l.Stage)} className="whitespace-nowrap">
                                  {l.Stage || '—'}
                                </Badge>
                                <Select value={l.Stage || 'Aguardando ativação'} onValueChange={(v) => handleStageChange(l.id, v)}>
                                  <SelectTrigger className="h-8 w-[190px]">
                                    <SelectValue placeholder="Stage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STAGES.map(s => (
                                      <SelectItem key={s} value={s}>
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select value={l.ApprovalStatus || '—'} onValueChange={(v) => handleApprovalChange(l.id, v)}>
                                <SelectTrigger className="h-8 w-[170px]">
                                  <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="—">—</SelectItem>
                                  {APPROVALS.map(a => (
                                    <SelectItem key={a} value={a}>
                                      {a}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Textarea
                                defaultValue={l.Notes || ''}
                                placeholder="Notas..."
                                className="min-h-[60px]"
                                onBlur={(e) => handleNotesBlur(l.id, e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {leads.length > 500 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Mostrando 500 de {leads.length} por performance. Use filtros e export para trabalhar o restante.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fila de aprovação humana</CardTitle>
                <CardDescription>
                  “Interessado” entra como pendente. Só vira “Interessado (aprovado)” após decisão manual.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum lead pendente.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pendingLeads.slice(0, 50).map((l) => (
                      <Card key={l.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{l.Name}</CardTitle>
                          <CardDescription className="truncate">{l.WhatsApp || '—'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{l.Stage || '—'}</Badge>
                            <Badge variant="outline">{l.Cohort ? `Cohort ${l.Cohort}` : 'Cohort —'}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => handleApprove(l.id)} className="w-full">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button variant="destructive" onClick={() => handleReject(l.id)} className="w-full">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reprovar
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const phone = (l.WhatsApp || '').replace('+', '');
                              if (!phone) return toast.error('WhatsApp vazio');
                              window.open(`https://wa.me/${phone}`, '_blank');
                            }}
                          >
                            Abrir conversa (wa.me)
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {pendingLeads.length > 50 ? (
                  <p className="text-xs text-muted-foreground">Mostrando 50 pendentes. Use filtros na aba Leads para ver todos.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cohorts (tabela)</CardTitle>
                <CardDescription>Comparação por cohort e variante de mensagem.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cohort</TableHead>
                        <TableHead>Variante</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ativados</TableHead>
                        <TableHead>Entregues</TableHead>
                        <TableHead>Respondeu</TableHead>
                        <TableHead>Interesse</TableHead>
                        <TableHead>Aprovado</TableHead>
                        <TableHead>Venda</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cohortSummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            {canCall ? 'Sem cohorts ainda.' : 'Informe o passcode para carregar.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        cohortSummary.map((c) => (
                          <TableRow key={`${c.cohort}-${c.variant}`}>
                            <TableCell className="font-medium">{c.cohort}</TableCell>
                            <TableCell>{c.variant}</TableCell>
                            <TableCell>{c.total}</TableCell>
                            <TableCell>{c.counts?.['Contato ativado'] || 0}</TableCell>
                            <TableCell>{c.counts?.['Entregue'] || 0}</TableCell>
                            <TableCell>{c.counts?.['Respondeu'] || 0}</TableCell>
                            <TableCell>
                              {(c.counts?.['Interessado (pendente aprovação)'] || 0) + (c.counts?.['Interessado (aprovado)'] || 0)}
                            </TableCell>
                            <TableCell>{c.counts?.['Interessado (aprovado)'] || 0}</TableCell>
                            <TableCell>{c.counts?.['Venda feita'] || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Mensagens por cohort (IA)
                </CardTitle>
                <CardDescription>
                  Gere variações para a Ana testar textos diferentes por cohort e comparar conversão.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Cohort</Label>
                    <Select value={variantsCohort} onValueChange={setVariantsCohort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCohorts.map(c => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Letra da variante</Label>
                    <Select value={applyVariantLetter} onValueChange={setApplyVariantLetter}>
                      <SelectTrigger>
                        <SelectValue placeholder="A" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C', 'D'].map(v => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={runGenerateVariants} disabled={!canCall}>
                      Gerar variações (IA)
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Contexto adicional (opcional)</Label>
                  <Textarea
                    placeholder='Ex: público majoritariamente feminino, foco em promoção de kits, região SC...'
                    value={variantsContext}
                    onChange={(e) => setVariantsContext(e.target.value)}
                  />
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <Card key={idx} className="border-muted">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sugestão {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="whitespace-pre-wrap text-sm">{v}</p>
                          <Button
                            variant="outline"
                            onClick={() => runApplyVariant(v)}
                            disabled={!canCall || applyingVariant}
                          >
                            Aplicar como variante {applyVariantLetter} no cohort {variantsCohort}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Gere variações para aparecerem aqui.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Import CSV
                </CardTitle>
                <CardDescription>
                  Importe a base (Aguardando ativação) e os ativados (Contato ativado). O sistema deduplica por WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Base total (base_1394.csv)</Label>
                    <Input type="file" accept=".csv" onChange={(e) => setImportBaseFile(e.target.files?.[0] || null)} />
                    <Button onClick={() => runImport('base')} disabled={!canCall || importing || !importBaseFile} className="w-full">
                      Importar base
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Ativados (ativados_150.csv)</Label>
                    <Input type="file" accept=".csv" onChange={(e) => setImportAtivadosFile(e.target.files?.[0] || null)} />
                    <Button
                      onClick={() => runImport('ativados')}
                      disabled={!canCall || importing || !importAtivadosFile}
                      className="w-full"
                    >
                      Importar ativados
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={runExport} disabled={!canCall}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV (com filtros)
                  </Button>
                  <Button variant="outline" onClick={runSeed} disabled={!canCall}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar dados de teste
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup Notion (criar database)</CardTitle>
                <CardDescription>
                  Cria a database “Doterra Leads” no parent page do Notion. Depois você precisa configurar `NOTION_DB_DOTERRA_LEADS` no servidor e reiniciar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={runSetup} disabled={!canCall || setupRunning}>
                  {setupRunning ? 'Criando...' : 'Criar database no Notion'}
                </Button>
                {setupResult?.database?.id ? (
                  <div className="rounded-md border p-3 text-sm">
                    <div className="font-medium">Database criada</div>
                    <div className="mt-1 text-muted-foreground">
                      ID: <span className="font-mono text-foreground">{setupResult.database.id}</span>
                    </div>
                    {setupResult.database.url ? (
                      <div className="mt-1 text-muted-foreground">
                        URL: <span className="font-mono text-foreground">{setupResult.database.url}</span>
                      </div>
                    ) : null}
                    <div className="mt-2 text-muted-foreground">
                      Próximo passo: setar <span className="font-mono text-foreground">NOTION_DB_DOTERRA_LEADS</span> com esse ID (sem hífens) no backend e reiniciar.
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DoterraLayout>
  );
}


