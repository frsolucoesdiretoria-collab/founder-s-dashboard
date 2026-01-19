import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, FileText, Filter, RefreshCw, Search, Tag, CheckCircle2, MessageSquare, Clock, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Journal } from '@/types/journal';
import { getJournals, getJournalByDate, createJournalEntry } from '@/services/journal.service';

const PAGE_SIZE = 30;
const TZ = 'America/Sao_Paulo';

function formatDateTime(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

function formatDateOnly(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

export default function RelatosPage() {
  const [items, setItems] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Journal | null>(null);
  const [editing, setEditing] = useState<Partial<Journal>>({});
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => (item.Summary || '').toLowerCase().includes(q));
  }, [items, query]);

  const load = async (opts?: { page?: number; start?: string; end?: string }) => {
    setLoading(true);
    try {
      const res = await getJournals({
        page: opts?.page ?? page,
        pageSize: PAGE_SIZE,
        start: opts?.start ?? (startDate ? startDate : undefined),
        end: opts?.end ?? (endDate ? endDate : undefined),
        query: query ? query : undefined
      });
      setItems(res.items);
      setHasMore(res.hasMore);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar relatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    setPage(1);
    load({
      page: 1,
      start: startDate ? startDate : undefined,
      end: endDate ? endDate : undefined
    });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    setPage(nextPage);
    load({ page: nextPage });
  };

  const openDetail = async (journalDate: string, fallbackId: string) => {
    const found = await getJournalByDate(journalDate).catch(() => undefined);
    const item = found || items.find((i) => i.id === fallbackId);
    if (item) {
      setSelected(item);
      setEditing(item);
      setNewComment('');
    }
  };

  const applyComment = (existing?: string, comment?: string) => {
    if (!comment || !comment.trim()) return existing || '';
    const timestamp = formatDateTime(new Date().toISOString());
    const line = `[${timestamp}] owner: ${comment.trim()}`;
    return existing ? `${line}\n${existing}` : line;
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: Partial<Journal> = {
        ...editing,
        Comments: applyComment(editing.Comments, newComment),
        LastEditedBy: 'owner'
      };
      if (editing?.Reviewed) {
        payload.ReviewedBy = payload.ReviewedBy || 'owner';
        payload.ReviewedAt = new Date().toISOString();
      }
      await createJournalEntry({
        ...payload,
        Date: selected.Date,
        Filled: payload.Filled ?? true
      });
      toast.success('Relato salvo');
      setSelected(null);
      load();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar relato');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCurrent = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  };

  const handleExportRange = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 100);
  };

  const timelineItems = filteredItems;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Relatos</h1>
            <p className="text-sm text-muted-foreground">Timeline diária dos relatos (fuso: America/Sao_Paulo)</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Início</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Fim</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Busca (Resumo)</Label>
                <div className="relative">
                  <Input
                    placeholder="Buscar em resumo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters}>Aplicar</Button>
              <Button variant="outline" onClick={() => { setStartDate(''); setEndDate(''); setQuery(''); setPage(1); load({ page:1, start:'', end:'' }); }}>
                Limpar
              </Button>
              <Button variant="secondary" onClick={handleExportRange} disabled={exporting}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar intervalo (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>

        {timelineItems.length === 0 && !loading && (
          <Alert>
            <AlertDescription>Nenhum relato encontrado.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {timelineItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:border-primary/40" onClick={() => openDetail(item.Date, item.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatDateOnly(item.Date)}</span>
                    {item.Reviewed && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Revisado
                      </Badge>
                    )}
                    {item.Tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(item.NightSubmittedAt || item.MorningCompletedAt || item.Date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{item.Summary || 'Sem resumo'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.Attachments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {item.Attachments.length} anexos
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1 || loading}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">Página {page}</span>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={!hasMore || loading}>
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Relato de {formatDateOnly(selected?.Date)}
              {editing?.Reviewed && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Revisado
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Resumo</Label>
                <Textarea value={editing?.Summary || ''} onChange={(e) => setEditing({ ...editing, Summary: e.target.value })} className="min-h-[100px]" placeholder="Sem resumo" />
              </div>
              <div className="space-y-1">
                <Label>O que funcionou</Label>
                <Textarea value={editing?.WhatWorked || ''} onChange={(e) => setEditing({ ...editing, WhatWorked: e.target.value })} placeholder="Sem registro" />
              </div>
              <div className="space-y-1">
                <Label>O que falhou</Label>
                <Textarea value={editing?.WhatFailed || ''} onChange={(e) => setEditing({ ...editing, WhatFailed: e.target.value })} placeholder="Sem registro" />
              </div>
              <div className="space-y-1">
                <Label>Insights</Label>
                <Textarea value={editing?.Insights || ''} onChange={(e) => setEditing({ ...editing, Insights: e.target.value })} placeholder="Sem insights" />
              </div>
              <div className="space-y-1">
                <Label>Objeções</Label>
                <Textarea value={editing?.Objections || ''} onChange={(e) => setEditing({ ...editing, Objections: e.target.value })} placeholder="Sem objeções" />
              </div>
              <div className="space-y-1">
                <Label>Ideias de processos</Label>
                <Textarea value={editing?.ProcessIdeas || ''} onChange={(e) => setEditing({ ...editing, ProcessIdeas: e.target.value })} placeholder="Sem ideias de processo" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={(editing?.Tags || []).join(', ')}
                  onChange={(e) => setEditing({ ...editing, Tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Revisado</Label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!editing?.Reviewed} onCheckedChange={(v) => setEditing({ ...editing, Reviewed: Boolean(v) })} />
                  <span className="text-sm">Marcar como revisado</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Comentários (histórico)</Label>
                <Textarea readOnly value={editing?.Comments || 'Sem comentários'} className="min-h-[80px] bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label>Adicionar comentário</Label>
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Digite um comentário e salve" />
              </div>
              <div className="space-y-1">
                <Label>Horários</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Manhã concluída: {formatDateTime(editing?.MorningCompletedAt)}</div>
                  <div>Noite enviada: {formatDateTime(editing?.NightSubmittedAt)}</div>
                  <div>Revisado em: {formatDateTime(editing?.ReviewedAt)}</div>
                  <div>Criado por: {editing?.CreatedBy || 'owner'}</div>
                  <div>Última edição por: {editing?.LastEditedBy || 'owner'}</div>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Anexos</Label>
                {editing?.Attachments?.length ? (
                  <ul className="text-sm list-disc pl-4">
                    {editing.Attachments.map((att) => (
                      <li key={att}>{att}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem anexos</p>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <DialogFooter className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportCurrent} disabled={exporting}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF (relato)
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
