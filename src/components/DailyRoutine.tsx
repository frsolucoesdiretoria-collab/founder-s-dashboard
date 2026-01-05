import { useCallback, useEffect, useMemo, useState } from 'react';
import { DAILY_PROPHECY_ACTION_NAME, DAILY_PROPHECY_SUBTASKS, NIGHT_GRATITUDE_TEXT, NIGHT_JOURNAL_TAG } from '@/constants/dailyRoutine';
import { getDailyActions, createAction, updateActionDone } from '@/services/actions.service';
import { createJournalEntry, getJournalByDate, getJournalTodayStatus } from '@/services/journal.service';
import type { Action } from '@/types/action';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlarmClock, BellOff, CheckCircle2, ListChecks, Moon, RefreshCw, Sun, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MORNING_SNOOZE_KEY = 'daily-prophecy-morning-snooze';
const NIGHT_SNOOZE_KEY = 'daily-prophecy-night-snooze';
const SUBTASKS_KEY_PREFIX = 'daily-prophecy-subtasks-';

const todayStr = () => new Date().toISOString().split('T')[0];

const loadSubtasks = (date: string) => {
  if (typeof window === 'undefined') return DAILY_PROPHECY_SUBTASKS.map(() => false);
  try {
    const saved = localStorage.getItem(`${SUBTASKS_KEY_PREFIX}${date}`);
    if (!saved) return DAILY_PROPHECY_SUBTASKS.map(() => false);
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length === DAILY_PROPHECY_SUBTASKS.length) {
      return parsed as boolean[];
    }
    return DAILY_PROPHECY_SUBTASKS.map(() => false);
  } catch {
    return DAILY_PROPHECY_SUBTASKS.map(() => false);
  }
};

const saveSubtasks = (date: string, state: boolean[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${SUBTASKS_KEY_PREFIX}${date}`, JSON.stringify(state));
};

const getSnoozeUntil = (key: string) => {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(key);
  return raw ? Number(raw) : 0;
};

const setSnoozeUntil = (key: string, timestamp: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, String(timestamp));
};

const clearSnooze = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export function DailyRoutine() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [subtasks, setSubtasks] = useState<boolean[]>(DAILY_PROPHECY_SUBTASKS.map(() => false));
  const [showMorningModal, setShowMorningModal] = useState(false);
  const [showNightModal, setShowNightModal] = useState(false);
  const [nightText, setNightText] = useState('');
  const [nightAcknowledged, setNightAcknowledged] = useState(false);
  const [nightDone, setNightDone] = useState(false);
  const [morningDone, setMorningDone] = useState(false);
  const [nightChecking, setNightChecking] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(false);

  const date = useMemo(() => todayStr(), []);

  const allMorningChecked = subtasks.every(Boolean);
  const nextNightAlarm = useMemo(() => {
    const now = new Date();
    const target = new Date();
    target.setHours(21, 0, 0, 0);
    if (now > target) return 0;
    return target.getTime() - now.getTime();
  }, [date]);

  const shouldOpenMorning = () => {
    if (statusLoading || statusError) return false;
    if (morningDone) return false;
    const snooze = getSnoozeUntil(MORNING_SNOOZE_KEY);
    return !snooze || Date.now() > snooze;
  };

  const shouldOpenNight = () => {
    if (statusLoading || statusError) return false;
    if (nightDone) return false;
    const now = new Date();
    const afterNine = now.getHours() >= 21;
    if (!afterNine) return false;
    const snooze = getSnoozeUntil(NIGHT_SNOOZE_KEY);
    return !snooze || Date.now() > snooze;
  };

  const ensureAction = useCallback(async () => {
    setLoading(true);
    try {
      const actions = await getDailyActions();
      const found = actions.find(a => a.Name?.trim().toLowerCase() === DAILY_PROPHECY_ACTION_NAME.toLowerCase());
      let current = found || null;

      if (!current) {
        const created = await createAction({
          Name: DAILY_PROPHECY_ACTION_NAME,
          Type: 'Rotina',
          Date: date,
          Done: false,
          Goal: '',
          Contribution: 0,
          Earned: 0,
          Contact: '',
          Client: '',
          Proposal: '',
          Diagnostic: '',
          WeekKey: '',
          Month: new Date().getMonth() + 1,
          PublicVisible: true,
          Notes: 'Rotina diária de profetização'
        });
        current = created;
      }

      setAction(current);

      if (current.Done) {
        setSubtasks(DAILY_PROPHECY_SUBTASKS.map(() => true));
        setMorningDone(true);
        saveSubtasks(date, DAILY_PROPHECY_SUBTASKS.map(() => true));
      } else {
        const persisted = loadSubtasks(date);
        setSubtasks(persisted);
        setMorningDone(false);
      }
    } catch (error: any) {
      toast.error('Não foi possível preparar a profetização diária');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const loadTodayStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(false);
    try {
      const status = await getJournalTodayStatus();
      if (status.morningDone) {
        setMorningDone(true);
        setSubtasks(DAILY_PROPHECY_SUBTASKS.map(() => true));
        saveSubtasks(date, DAILY_PROPHECY_SUBTASKS.map(() => true));
      }
      if (status.nightDone) {
        setNightDone(true);
      }
    } catch (error) {
      console.error('Erro ao checar status do dia', error);
      setStatusError(true);
    } finally {
      setStatusLoading(false);
    }
  }, [date]);

  const loadNightStatus = useCallback(async () => {
    setNightChecking(true);
    try {
      const journal = await getJournalByDate(date);
      if (journal?.Filled) {
        setNightDone(true);
        setNightAcknowledged(true);
        setNightText(journal.Summary || '');
        clearSnooze(NIGHT_SNOOZE_KEY);
      } else {
        setNightDone(false);
      }
    } catch (error) {
      console.error('Erro ao checar diário', error);
    } finally {
      setNightChecking(false);
    }
  }, [date]);

  useEffect(() => {
    ensureAction();
    loadTodayStatus();
    loadNightStatus();
  }, [ensureAction, loadNightStatus, loadTodayStatus]);

  useEffect(() => {
    if (shouldOpenMorning()) {
      setShowMorningModal(true);
    }
  }, [morningDone]);

  useEffect(() => {
    if (shouldOpenNight()) {
      setShowNightModal(true);
    }
  }, [nightDone]);

  useEffect(() => {
    if (nightDone) return;
    const checkNight = () => {
      if (shouldOpenNight()) {
        setShowNightModal(true);
      }
    };
    const interval = window.setInterval(checkNight, 60_000);
    const timeout = nextNightAlarm > 0 ? window.setTimeout(checkNight, nextNightAlarm) : undefined;
    return () => {
      window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [nextNightAlarm, nightDone]);

  const handleSubtaskToggle = (index: number) => {
    const updated = subtasks.map((checked, i) => (i === index ? !checked : checked));
    setSubtasks(updated);
    saveSubtasks(date, updated);

    const nowComplete = updated.every(Boolean);
    const wasComplete = allMorningChecked;

    if (!action) return;

    if (nowComplete && !morningDone) {
      updateActionDone(action.id, true)
        .then(() => {
          setMorningDone(true);
          toast.success('Profetização diária concluída');
        })
        .catch((err) => {
          console.error(err);
          toast.error('Erro ao marcar como concluída');
        });
    } else if (!nowComplete && wasComplete && morningDone) {
      updateActionDone(action.id, false).catch((err) => {
        console.error(err);
      });
      setMorningDone(false);
    }
  };

  const markAll = () => {
    const updated = DAILY_PROPHECY_SUBTASKS.map(() => true);
    setSubtasks(updated);
    saveSubtasks(date, updated);
    if (!action) return;
    updateActionDone(action.id, true)
      .then(() => {
        setMorningDone(true);
        toast.success('Profetização diária concluída');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Erro ao marcar como concluída');
      });
  };

  const snoozeMorning = () => {
    setSnoozeUntil(MORNING_SNOOZE_KEY, Date.now() + 10 * 60 * 1000);
    setShowMorningModal(false);
  };

  const snoozeNight = (minutes: number) => {
    setSnoozeUntil(NIGHT_SNOOZE_KEY, Date.now() + minutes * 60 * 1000);
    setShowNightModal(false);
    toast.info(`Lembrete reagendado para ${minutes} min`);
  };

  const handleNightSubmit = async () => {
    if (!nightAcknowledged) {
      toast.error('Marque o agradecimento antes de concluir');
      return;
    }
    if (!nightText.trim()) {
      toast.error('Preencha o relato do dia');
      return;
    }
    try {
      await createJournalEntry({
        Date: date,
        Filled: true,
        Summary: nightText,
        Tags: [NIGHT_JOURNAL_TAG]
      } as any);
      setNightDone(true);
      clearSnooze(NIGHT_SNOOZE_KEY);
      setShowNightModal(false);
      toast.success('Relato salvo no diário');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar no diário');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([ensureAction(), loadNightStatus()]);
    setRefreshing(false);
  };

  const morningStatus = morningDone ? 'Concluída' : 'Pendente';
  const nightStatus = nightDone ? 'Concluído' : 'Pendente';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Rotina de hoje</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={morningDone ? 'default' : 'secondary'}>{morningStatus}</Badge>
            <Badge variant={nightDone ? 'default' : 'secondary'}>{nightStatus}</Badge>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Profetização matinal + diário de agradecimento às 21h</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 flex items-start gap-3">
            <Sun className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Profetização diária</p>
                <Badge variant={morningDone ? 'default' : 'outline'} className="text-xs">
                  {morningDone ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                7 afirmações para iniciar o dia. Marque tudo para concluir.
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setShowMorningModal(true)} variant="outline">
                  Abrir checklist
                </Button>
                {!morningDone && (
                  <Button size="sm" variant="ghost" onClick={snoozeMorning}>
                    Lembrar em 10 min
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 flex items-start gap-3">
            <Moon className="h-5 w-5 text-indigo-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Agradecimento 21h</p>
                <Badge variant={nightDone ? 'default' : 'outline'} className="text-xs">
                  {nightDone ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Agradeça e registre o relato do dia. Notificação diária às 21h.
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setShowNightModal(true)} variant="outline">
                  Abrir relato
                </Button>
                {!nightDone && (
                  <Button size="sm" variant="ghost" onClick={() => snoozeNight(15)}>
                    Postergar 15 min
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

      </CardContent>

      <Dialog open={showMorningModal} onOpenChange={setShowMorningModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Profetização diária
              {morningDone && (
                <Badge variant="default" className="ml-2">
                  Concluída hoje
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Marque as 7 afirmações para concluir a tarefa principal.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {DAILY_PROPHECY_SUBTASKS.map((text, index) => (
              <div
                key={text}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  subtasks[index] ? 'bg-muted/70' : 'bg-card'
                )}
              >
                <Checkbox checked={subtasks[index]} onCheckedChange={() => handleSubtaskToggle(index)} />
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={snoozeMorning}>
                <BellOff className="h-4 w-4 mr-2" />
                Lembrar em 10 min
              </Button>
              <Button variant="secondary" onClick={() => setShowMorningModal(false)}>
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
            <Button onClick={markAll} disabled={morningDone}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNightModal} onOpenChange={setShowNightModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Agradecimento das 21h
              {nightDone && (
                <Badge variant="default" className="ml-2">
                  Concluído
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Marque o agradecimento e registre o relato do dia. Obrigatório antes de encerrar o dia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Checkbox checked={nightAcknowledged} onCheckedChange={() => setNightAcknowledged((prev) => !prev)} />
              <p className="text-sm">{NIGHT_GRATITUDE_TEXT}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="night-report">Relato do dia *</Label>
              <Textarea
                id="night-report"
                value={nightText}
                onChange={(e) => setNightText(e.target.value)}
                placeholder="Erros, acertos, rotinas a repetir, ideias..."
                className="min-h-[120px]"
              />
            </div>

            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => snoozeNight(15)}>
                Postergar 15 min
              </Button>
              <Button variant="outline" onClick={() => snoozeNight(30)}>
                Postergar 30 min
              </Button>
              <Button variant="outline" onClick={() => snoozeNight(60)}>
                Postergar 60 min
              </Button>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="secondary" onClick={() => setShowNightModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNightSubmit} disabled={nightChecking || nightDone}>
              {nightChecking ? 'Salvando...' : 'Concluir e salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

