import { AppLayout } from '@/components/AppLayout';
import { DomaCondoClientKPICardV2 } from '@/components/DomaCondoClientKPICardV2';
import { DomaCondoKPICard } from '@/components/DomaCondoKPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  domaCondoClientKPIs,
  domaCondoOperationalKPIs, 
  domaCondoFinancialKPIs,
  domaCondoFutureModules,
  getDailyFocus,
  getIntelligentAlerts,
  employeePerformanceMock,
  elogiosMock,
  achievementsMock,
  getDemandForecast,
  anomaliesMock,
} from '@/mocks/domaCondoDashboard';
import { AlertCircle, Calendar, Lock, FileText, Target } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';

export default function DomaCondoDashboardV2() {
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [employeeName, setEmployeeName] = useState('Lide');
  
  // Estados para anexos dos períodos
  const [attachments0800, setAttachments0800] = useState<File[]>([]);
  const [attachments1000, setAttachments1000] = useState<File[]>([]);
  const [attachments1400, setAttachments1400] = useState<File[]>([]);
  const [attachments1600, setAttachments1600] = useState<File[]>([]);
  
  // Estados para campos finais
  const [victoriesText, setVictoriesText] = useState('');
  const [victoriesAttachments, setVictoriesAttachments] = useState<File[]>([]);
  const [errorsText, setErrorsText] = useState('');
  const [errorsAttachments, setErrorsAttachments] = useState<File[]>([]);
  
  // Carregar dados - se houver erro, será capturado pelo Error Boundary
  const dailyFocus = getDailyFocus();
  const alerts = getIntelligentAlerts();
  const forecast = getDemandForecast();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const formatDateCompact = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const chartData = forecast.slice(0, 30).map(f => ({
    date: formatDate(f.date),
    volume: f.expectedVolume,
    isPeak: f.isPeakPeriod,
  }));

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8 pb-12 max-w-full md:max-w-7xl">
        {/* ÁREA VERDE - INCLUÍDA NO PREÇO */}
        <div className="bg-green-50 dark:bg-green-950/10 rounded-lg p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Header com copy otimizada */}
            <div className="space-y-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                Mapa de Guerra — DOMA CONDO
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                Clareza diária para decidir onde focar, manter prazos sob controle e escalar a operação sem virar incêndio.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground italic">
                Um painel que transforma volume em prioridade — e prioridade em execução.
              </p>
            </div>

            {/* Disclaimer único */}
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-xs md:text-sm text-amber-900 dark:text-amber-200">
                <em>Os dados exibidos são ilustrativos e demonstram o funcionamento real do sistema. Ao conectar sua operação, os números passam a refletir o dia a dia em tempo real.</em>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* FOCO DO DIA - Com ação sugerida */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
                        🎯 FOCO DO DIA
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs md:text-sm">
                        Sugestão estratégica baseada no forecast de demandas
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={dailyFocus.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs md:text-sm">
                    {dailyFocus.priority === 'high' ? 'Alta Prioridade' : 'Operação Estável'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">{dailyFocus.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{dailyFocus.suggestion}</p>
                </div>
                {dailyFocus.reason && (
                  <div className="pt-2 border-t text-xs md:text-sm text-muted-foreground italic">
                    📊 Razão: {dailyFocus.reason}
                  </div>
                )}
                
                {/* Ação sugerida hoje */}
                <div className="pt-3 border-t bg-primary/5 dark:bg-primary/10 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm md:text-base text-foreground">Ação sugerida hoje</h4>
                  <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground list-disc list-inside">
                    <li>Priorizar o cliente em alerta até reduzir pendências ao patamar seguro</li>
                    <li>Realocar foco operacional das próximas horas para o ponto crítico</li>
                    <li>Pausar demandas não críticas dos clientes sob controle até normalização</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Alertas Inteligentes */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'} className="p-3 md:p-4">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <AlertDescription className="text-sm md:text-base">
                      <strong>{alert.title}</strong> — {alert.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* KPIs Principais */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">KPIs Principais</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Controle operacional básico por cliente (incluído no plano base)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {domaCondoClientKPIs.map((clientKPI) => (
                  <DomaCondoClientKPICardV2 key={clientKPI.id} clientKPI={clientKPI} />
                ))}
              </div>
            </div>

            {/* Formulário Diário de Funcionárias */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Relatório Diário de Execução Operacional</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Preencha suas atividades do dia para gerar a prestação de contas mensal
                  </p>
                </div>
                {!showDailyReport && (
                  <Button onClick={() => setShowDailyReport(true)} variant="outline" className="min-h-[44px] w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Preencher Relatório
                  </Button>
                )}
              </div>
              
              {showDailyReport && (
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg">Relatório Diário de Execução Operacional — {new Date().toLocaleDateString('pt-BR')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">Funcionária</Label>
                      <Select value={employeeName} onValueChange={setEmployeeName}>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lide">Lide</SelectItem>
                          <SelectItem value="Jessica">Jessica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">08:00 às 10:00</Label>
                      <Textarea 
                        placeholder="Descreva as atividades..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]" 
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (máx. 5)</Label>
                        <FileUpload
                          files={attachments0800}
                          onFilesChange={setAttachments0800}
                          maxFiles={5}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">10:00 às 12:00</Label>
                      <Textarea 
                        placeholder="Descreva as atividades..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]" 
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (máx. 5)</Label>
                        <FileUpload
                          files={attachments1000}
                          onFilesChange={setAttachments1000}
                          maxFiles={5}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">14:00 às 16:00</Label>
                      <Textarea 
                        placeholder="Descreva as atividades..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]" 
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (máx. 5)</Label>
                        <FileUpload
                          files={attachments1400}
                          onFilesChange={setAttachments1400}
                          maxFiles={5}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">16:00 às 18:00</Label>
                      <Textarea 
                        placeholder="Descreva as atividades..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]" 
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (máx. 5)</Label>
                        <FileUpload
                          files={attachments1600}
                          onFilesChange={setAttachments1600}
                          maxFiles={5}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Quadro de Vitórias do Dia */}
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">Quadro de Vitórias do Dia</Label>
                      <Textarea 
                        placeholder="Descreva as vitórias e conquistas do dia..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]"
                        value={victoriesText}
                        onChange={(e) => setVictoriesText(e.target.value)}
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (imagens, PDFs, etc.)</Label>
                        <FileUpload
                          files={victoriesAttachments}
                          onFilesChange={setVictoriesAttachments}
                          maxFiles={10}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Erros do Dia */}
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">Erros do Dia</Label>
                      <Textarea 
                        placeholder="Documente os erros e falhas que travaram o trabalho ao longo do dia..." 
                        rows={3} 
                        className="min-h-[80px] md:min-h-[100px]"
                        value={errorsText}
                        onChange={(e) => setErrorsText(e.target.value)}
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Anexos (prints, documentos, etc.)</Label>
                        <FileUpload
                          files={errorsAttachments}
                          onFilesChange={setErrorsAttachments}
                          maxFiles={10}
                          accept="image/*,application/pdf"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={() => { 
                        toast.success('Relatório salvo!'); 
                        setShowDailyReport(false);
                        // Resetar formulário
                        setAttachments0800([]);
                        setAttachments1000([]);
                        setAttachments1400([]);
                        setAttachments1600([]);
                        setVictoriesText('');
                        setVictoriesAttachments([]);
                        setErrorsText('');
                        setErrorsAttachments([]);
                      }} 
                      className="min-h-[44px] w-full sm:w-auto"
                    >
                      Salvar Relatório
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
        </div>

        {/* ÁREA CINZA - FUTURO/UPSELL */}
        <div className="bg-muted rounded-lg p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Feed de Conquistas - MOVIDO PARA O TOPO */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">🏆 Feed de Conquistas</h2>
              <div className="space-y-4">
                {achievementsMock.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Previsão de Demanda */}
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Demanda (Próximos 30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        interval={7}
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Performance da Equipe (Upsell) - Copy persuasiva */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
                <h2 className="text-xl md:text-2xl font-semibold">Performance da Equipe (Avançado)</h2>
                <Badge variant="secondary" className="text-xs md:text-sm">Não incluso</Badge>
              </div>
              <Alert className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-500" />
                <AlertDescription className="text-sm md:text-base">
                  <strong>Mostra quem entrega, onde a operação trava e como destravar produtividade sem aumentar equipe.</strong> Ideal para escalar com controle.
                  <br />
                  <span className="text-xs md:text-sm font-medium mt-2 block">Disponível sob contratação. Valores sob consulta.</span>
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                {employeePerformanceMock.map((performance) => (
                  <Card key={performance.employeeId}>
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-base md:text-lg">{performance.employeeName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs md:text-sm text-muted-foreground">Lançamentos no mês</div>
                          <div className="text-xl md:text-2xl font-bold">{performance.lancamentosRealizados}</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm text-muted-foreground">Média diária</div>
                          <div className="text-xl md:text-2xl font-bold">{performance.mediaDiaria.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm text-muted-foreground">Percentual conclusão</div>
                          <div className="text-xl md:text-2xl font-bold text-primary">{performance.percentualConclusao.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs md:text-sm text-muted-foreground">Tempo médio</div>
                          <div className="text-xl md:text-2xl font-bold">{performance.tempoMedio.toFixed(1)} min</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* KPIs Operacionais (Upsell) - Copy persuasiva */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
                <h2 className="text-xl md:text-2xl font-semibold">KPIs Operacionais (Avançado)</h2>
                <Badge variant="secondary" className="text-xs md:text-sm">Não incluso</Badge>
              </div>
              <Alert className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-500" />
                <AlertDescription className="text-sm md:text-base">
                  <strong>Antecipa risco antes do atraso:</strong> backlog, retrabalho, ritmo e qualidade por cliente. Operação previsível, não reativa.
                  <br />
                  <span className="text-xs md:text-sm font-medium mt-2 block">Disponível sob contratação. Valores sob consulta.</span>
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {domaCondoOperationalKPIs.map((kpi) => (
                  <DomaCondoKPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>

            <Separator />

            {/* KPIs Financeiros (Upsell) - Copy persuasiva */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
                <h2 className="text-xl md:text-2xl font-semibold">KPIs Financeiros (Financeiro)</h2>
                <Badge variant="secondary" className="text-xs md:text-sm">Não incluso</Badge>
              </div>
              <Alert className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-500" />
                <AlertDescription className="text-sm md:text-base">
                  <strong>Revela quais clientes sustentam a operação e quais corroem margem.</strong> Decisão baseada em dados, não achismo.
                  <br />
                  <span className="text-xs md:text-sm font-medium mt-2 block">Disponível sob contratação. Valores sob consulta.</span>
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {domaCondoFinancialKPIs.map((kpi) => (
                  <DomaCondoKPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Módulos Futuros - Com copy persuasiva */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold">Módulos Futuros</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domaCondoFutureModules.map((module) => {
                  // Mapear módulos para copy persuasiva
                  let persuasiveCopy = module.description;
                  const contractText = "Disponível sob contratação. Valores sob consulta.";
                  
                  if (module.title.toLowerCase().includes('portal')) {
                    persuasiveCopy = "Página individual por cliente com prestação de contas profissional. Reduz cobranças e eleva percepção de valor.";
                  } else if (module.title.toLowerCase().includes('automação') || module.title.toLowerCase().includes('fatura')) {
                    persuasiveCopy = "Coleta e organização automática de boletos, eliminando erro humano, atraso e perda de documentos.";
                  }
                  
                  return (
                    <Card key={module.id} className="border-dashed">
                      <CardHeader>
                        <CardTitle>{module.title}</CardTitle>
                        <CardDescription>{persuasiveCopy}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground italic">{contractText}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* CTA Final - Fechamento forte */}
            <Card className="bg-muted/50 border-2">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl lg:text-2xl text-center">Próximos Passos</CardTitle>
                <CardDescription className="text-center text-sm md:text-base mt-2 space-y-2">
                  <p>
                    Este painel representa o primeiro nível de controle operacional da DOMA CONDO.
                  </p>
                  <p>
                    A evolução natural é transformar execução em previsibilidade, proteger margem e preparar a operação para crescer sem caos.
                  </p>
                  <p className="font-medium">
                    Se desejar, este painel pode ser personalizado com seus dados reais e módulos adequados ao seu momento.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 flex justify-center">
                <Button size="lg" className="gap-2 min-h-[44px] w-full sm:w-auto">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Agendar conversa estratégica para personalização
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}

