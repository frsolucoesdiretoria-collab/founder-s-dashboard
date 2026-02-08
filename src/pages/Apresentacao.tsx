import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  Copy,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ApresentacaoPage() {
  const handleCopyPix = () => {
    const pixKey = "CHAVE_PIX_AQUI"; // TODO: mover para env
    navigator.clipboard.writeText(pixKey).then(() => {
      toast.success("Pix copiado! Chave copiada para área de transferência");
    }).catch(() => {
      toast.error("Erro ao copiar chave Pix");
    });
  };

  const handleScheduleDiagnostic = () => {
    const whatsappNumber = "5547996475947"; // TODO: mover para env
    const message = encodeURIComponent("Olá! Gostaria de agendar um diagnóstico rápido de 30 minutos.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* 1. HERO */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Trabalhe menos. Ganhe mais. Plogue tecnologia no seu negócio.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Você já tem leads. O que falta é um sistema que transforma eles em vendas — todos os dias, sem você precisar virar refém de agência.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">Resposta rápida + follow-up automático (sem parecer spam)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">Recuperação de clientes antigos (recompra sem esforço)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">Acompanhamento mensal com alinhamento do time (1–3 vendedores)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleCopyPix}
            >
              <Copy className="h-4 w-4 mr-2" />
              Quero crescer em 2026 (Fechar via Pix)
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1"
              onClick={handleScheduleDiagnostic}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Quero um diagnóstico rápido (30 min)
            </Button>
          </div>
        </section>

        <Separator />

        {/* 2. IDENTIFICAÇÃO */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Se isso acontece aí, você está deixando dinheiro na mesa:
          </h2>
          
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <p className="text-foreground">Leads chegam… mas ninguém responde na hora</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <p className="text-foreground">Cliente pede orçamento e some</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <p className="text-foreground">Você depende da memória do vendedor</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <p className="text-foreground">Quando você não cobra, ninguém cobra</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <p className="text-foreground">A base antiga está parada</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-foreground font-medium text-center">
              Se 2 ou mais itens são verdade, você não tem problema de marketing. Você tem um problema de conversão.
            </p>
          </div>
        </section>

        <Separator />

        {/* 3. DOR REAL */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            O dinheiro não some. Ele só vai para quem responde primeiro e insiste do jeito certo.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">1 lead não respondido hoje = 0 venda amanhã</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">1 orçamento sem follow-up = 0 fechamento</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">1 base antiga parada = 0 recompra</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* 4. O QUE É A FR TECH */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            A FR Tech é expansão + tecnologia — e eu acompanho até virar resultado.
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                Primeiro a gente destrava o processo comercial. Depois instala tecnologia e rotina. E eu acompanho os números e alinho o time mensalmente para as metas acontecerem.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* 5. COMO FUNCIONA */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Como funciona (3 fases — 90 dias)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fase 1 — Arrumar a casa</CardTitle>
                <CardDescription>Semanas 1–2</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground">• Mapear atendimento atual</p>
                <p className="text-sm text-foreground">• Definir processo de resposta + qualificação</p>
                <p className="text-sm text-foreground">• Scripts e checklists para o vendedor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fase 2 — Instalar a máquina</CardTitle>
                <CardDescription>Semanas 2–6</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground">• Automação de follow-up</p>
                <p className="text-sm text-foreground">• Registro de oportunidades</p>
                <p className="text-sm text-foreground">• Pipeline simples + metas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fase 3 — Acompanhar e escalar</CardTitle>
                <CardDescription>Semanas 6–12</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground">• Reunião mensal com vendedores</p>
                <p className="text-sm text-foreground">• Ajustes do processo</p>
                <p className="text-sm text-foreground">• Rotina de recompra (clientes antigos)</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-foreground">
              Você não compra tecnologia. Você compra previsibilidade.
            </p>
          </div>
        </section>

        <Separator />

        {/* 6. O QUE VOCÊ RECEBE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">O que você recebe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">Processo de atendimento e follow-up pronto</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">Automação de resposta e recontato</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">Pipeline + metas semanais</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">Campanha de recompra (clientes antigos)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">Acompanhamento mensal com o time</p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground text-sm">
            Sem promessas mágicas. Sem projeto que nunca termina.
          </p>
        </section>

        <Separator />

        {/* 7. PARA QUEM É / NÃO É */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Para quem é / Para quem não é</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">É pra você se:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Quer vender mais com os leads que já tem</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Tem até 5 funcionários e até 3 pessoas no comercial</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Quer trabalhar menos e ganhar mais em 2026</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg">Não é pra você se:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                  </div>
                  <p className="text-sm text-foreground">Quer sistema personalizado que muda toda semana</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                  </div>
                  <p className="text-sm text-foreground">Quer garantia de % de aumento</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                  </div>
                  <p className="text-sm text-foreground">Não quer rotina simples com o time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* 8. DEMONSTRAÇÃO DO SOFTWARE */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Como fica na prática</h2>
            <p className="text-muted-foreground">Dashboards e rotina para enxergar e corrigir rápido.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Leads</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Preview do dashboard</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Follow-ups pendentes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Preview do dashboard</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Vendas fechadas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Preview do dashboard</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* 9. OFERTA */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Plano Starter — Implantação + Acompanhamento (90 dias)
          </h2>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">Setup inicial (processo + automação + painel)</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">90 dias de acompanhamento</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">1 reunião/mês com o time</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* 10. FECHAMENTO */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Comece 2026 sem deixar dinheiro na mesa.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleCopyPix}
            >
              <Copy className="h-4 w-4 mr-2" />
              Fechar agora via Pix (entrada)
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1"
              onClick={handleScheduleDiagnostic}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Agendar diagnóstico (30 min)
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Implantação padrão (sem custom infinito) • Acompanhamento mensal incluso • Sem garantia de % — foco em rotina e execução
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

