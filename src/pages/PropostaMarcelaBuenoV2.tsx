import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  Shield, 
  Sparkles, 
  ChevronRight,
  Clock,
  TrendingUp,
  Heart,
  Users,
  Target,
  Zap,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const PropostaMarcelaBueno = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > window.innerHeight * 0.2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckboxChange = (solutionId: number) => {
    if (selectedSolutions.includes(solutionId)) {
      setSelectedSolutions(selectedSolutions.filter(id => id !== solutionId));
      setShowLimitWarning(false);
    } else {
      if (selectedSolutions.length >= 3) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 3000);
      } else {
        setSelectedSolutions([...selectedSolutions, solutionId]);
      }
    }
  };

  const solutions = [
    {
      id: 1,
      name: "Convite VIP + Indicações Ativas",
      badge: "CORE",
      description: "transforma a experiência premium da clínica em captação de indicações qualificadas + pertencimento VIP.",
      why: "pessoas indicam quando o convite é elegante e o status é real.",
      setup: 20000,
      monthly: 760,
      time: "10–14 dias"
    },
    {
      id: 2,
      name: "Planejamento VIPs Ativos",
      subtitle: "reserva anual de agenda",
      description: "cria espinha dorsal de agenda com pacientes que já confiam em você.",
      why: "previsibilidade reduz vacância e aumenta recorrência.",
      setup: 6000,
      monthly: 480,
      time: "7–10 dias"
    },
    {
      id: 3,
      name: "Conversão para Protocolos",
      subtitle: "follow-up inteligente",
      description: "organiza uma sequência pós-consulta que conduz o paciente para decisão com leveza.",
      why: "a maioria dos \"nãos\" são apenas \"ainda não\".",
      setup: 16000,
      monthly: 600,
      time: "10–14 dias"
    },
    {
      id: 4,
      name: "Pós-Consulta Humanizado",
      subtitle: "alto padrão",
      description: "tira o peso do pós-consulta do seu WhatsApp com limites e encaminhamento seguro.",
      why: "melhora experiência e reduz atrito — paciente bem cuidado volta e compra.",
      setup: 35000,
      monthly: 1160,
      time: "14–21 dias"
    },
    {
      id: 5,
      name: "Motor de Promotores",
      subtitle: "NPS → indicação premium",
      description: "aplica NPS no timing certo + script premium de indicação + rastreio.",
      why: "indicação deixa de ser acaso e vira canal.",
      setup: 30000,
      monthly: 960,
      time: "14–21 dias"
    },
    {
      id: 6,
      name: "Reativação Premium da Base Inativa",
      subtitle: "retorno rápido",
      description: "reativa pacientes \"sumidos\" com comunicação de cuidado.",
      why: "é o dinheiro mais rápido e mais barato: quem já confiou decide mais fácil.",
      setup: 14000,
      monthly: 760,
      time: "10–14 dias"
    }
  ];

  const selectedSolutionsData = solutions.filter(s => selectedSolutions.includes(s.id));
  const totalSetup = selectedSolutionsData.reduce((acc, s) => acc + s.setup, 0);
  const totalMonthly = selectedSolutionsData.reduce((acc, s) => acc + s.monthly, 0);
  const discount = selectedSolutions.length === 3 ? 0.07 : 0;
  const finalSetup = totalSetup * (1 - discount);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-slate-900">AXIS</div>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Soluções", id: "solucoes" },
              { label: "Prioridades", id: "prioridades" },
              { label: "Investimento", id: "investimento" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Sticky CTA */}
      {showStickyCTA && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button 
            onClick={() => scrollToSection("investimento")}
            size="lg"
            className="shadow-2xl bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base"
          >
            Ver investimento <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        style={{ opacity }}
        className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-slate-900"
          >
            AXIS para a Clínica Marcela Bueno
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-medium text-slate-600 mb-8"
          >
            Mais retorno. Mais protocolos. Menos você no WhatsApp.
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              A Clínica Marcela Bueno já entrega um nível de cuidado acima da média.
              O que falta para <strong>vender mais</strong> não é "postar mais". É ter um <strong>sistema de relacionamento</strong> que transforme:
            </p>
            <ul className="text-left text-lg text-slate-700 space-y-2 max-w-2xl mx-auto mb-6">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mr-3 mt-1 flex-shrink-0" />
                <span><strong>pacientes satisfeitos</strong> em <strong>retorno recorrente</strong>,</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mr-3 mt-1 flex-shrink-0" />
                <span><strong>consulta avulsa</strong> em <strong>protocolo</strong>,</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mr-3 mt-1 flex-shrink-0" />
                <span><strong>experiência premium</strong> em <strong>indicações qualificadas</strong>.</span>
              </li>
            </ul>
            <p className="text-lg text-slate-700 leading-relaxed">
              A Axis entra como o <strong>braço de tecnologia</strong> para construir isso com método, elegância e segurança (LGPD).
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={() => scrollToSection("solucoes")}
              size="lg" 
              className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-base shadow-lg"
            >
              Quero ver as soluções e escolher as 3 prioridades
            </Button>
            <Button 
              onClick={() => scrollToSection("investimento")}
              size="lg" 
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400 px-10 py-6 text-base"
            >
              Ver investimento
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24 space-y-24">
        
        {/* O que está vazando hoje */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900">
                O que está vazando hoje (e por que isso trava vendas)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Clínicas premium não perdem venda por "falta de técnica".
                Elas perdem venda por <strong>falta de processo</strong>:
              </p>
              
              <ul className="space-y-3">
                {[
                  "pacientes somem após a primeira consulta e você perde retorno \"silencioso\";",
                  "protocolo fica na intenção porque não existe follow-up de decisão;",
                  "indicação acontece \"ao acaso\", sem script, sem rotina, sem rastreio;",
                  "seu WhatsApp vira central de suporte e você sai do seu local de potência."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-700">
                    <span className="text-slate-400 mr-3 mt-1 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-slate-50 border-l-4 border-slate-900 p-6 rounded-r-lg">
                <p className="text-slate-900 font-semibold mb-2">Diagnóstico direto:</p>
                <p className="text-slate-700">
                  sem sistema, a clínica depende do esforço humano e do humor da agenda.
                  Com sistema, a clínica cria previsibilidade — e previsibilidade vira venda.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* O mecanismo Axis */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                O mecanismo Axis para vender mais (sem virar um projeto chato)
              </CardTitle>
              <p className="text-lg text-slate-600">
                A Axis não vende "robô".
                A Axis implementa <strong>3 motores de crescimento</strong>, com mensagens premium, regras e monitoramento:
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1) Motor de Retorno</h3>
                    <p className="text-sm text-slate-600 mb-2 font-medium">(Base Ativa e Inativa)</p>
                    <p className="text-slate-700">
                      Pacientes que já confiaram em você voltam no timing certo — sem parecer cobrança e sem parecer spam.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2) Motor de Decisão</h3>
                    <p className="text-sm text-slate-600 mb-2 font-medium">(Consulta → Protocolo)</p>
                    <p className="text-slate-700">
                      A decisão do paciente é guiada com elegância: acompanhamento, vínculo e condução para o próximo passo.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">3) Motor de Indicação</h3>
                    <p className="text-sm text-slate-600 mb-2 font-medium">(NPS → Indicação Premium)</p>
                    <p className="text-slate-700">
                      Satisfação vira canal. Indicação vira processo. Processo vira agenda.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <p className="text-slate-900 font-semibold mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                  Importante:
                </p>
                <p className="text-slate-700">
                  não existe "resultado garantido". Existe <strong>excelência de implementação</strong> + <strong>melhoria contínua</strong> — e isso muda o jogo.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* O que será construído */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                O que exatamente será construído (entregáveis)
              </CardTitle>
              <p className="text-lg text-slate-600">
                Você não compra promessa. Você compra entrega.
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Segmentação da base (ativos / inativos / VIPs / perfis)",
                  "Roteiros premium (mensagens com tom da clínica, sem \"cara de robô\")",
                  "Regras de triagem e encaminhamento (quando vai para humano, quando para equipe)",
                  "Implementação em cohorts (safras) para ajustar com segurança e sem ruído",
                  "Painel de acompanhamento (respostas, agendamentos, motivos de recusa, conversão)",
                  "Rotina de otimização mensal (o que melhora e o que escala)"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start p-4 bg-slate-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* As 6 soluções */}
        <motion.section
          id="solucoes"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                As 6 soluções Axis (você escolhe o que faz sentido agora)
              </CardTitle>
              <p className="text-lg text-slate-600">
                A ideia não é "fazer tudo".
                A ideia é escolher <strong>as 3 alavancas</strong> que mais aumentam vendas com menos atrito.
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {solutions.map((solution) => (
                  <Card key={solution.id} className="border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {solution.id}) {solution.name}
                        </CardTitle>
                        {solution.badge && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                      {solution.subtitle && (
                        <p className="text-sm text-slate-500 font-medium">({solution.subtitle})</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">O que faz:</p>
                        <p className="text-slate-700">{solution.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Por que vende:</p>
                        <p className="text-slate-700">{solution.why}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Trilha recomendada */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Trilha recomendada para "vender mais" (Top 3)
              </CardTitle>
              <p className="text-lg text-slate-700">
                Se o objetivo principal é <strong>aumentar vendas</strong>, a trilha mais forte tende a ser:
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4 mb-6">
                {[
                  { icon: <Zap className="w-6 h-6" />, text: "Reativação Premium da Base Inativa", sub: "(retorno e caixa rápido)" },
                  { icon: <Target className="w-6 h-6" />, text: "Conversão para Protocolos", sub: "(elevar ticket e recorrência)" },
                  { icon: <Users className="w-6 h-6" />, text: "Motor de Promotores ou Convite VIP", sub: "(crescimento escalável)" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.text}</p>
                      <p className="text-sm text-slate-600">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border-l-4 border-slate-900 p-6 rounded-r-lg">
                <p className="text-slate-700">
                  Você pode escolher diferente — mas essa trilha costuma entregar o melhor mix: <strong>caixa + ticket + canal</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Implementação */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Como funciona a implementação (4 fases, sem ruído)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                {[
                  {
                    phase: "Fase 1",
                    title: "Estratégia e regras",
                    subtitle: "(kickoff 30–45 min)",
                    description: "Definimos tom, segmentos, limites, roteiros e critérios de encaminhamento."
                  },
                  {
                    phase: "Fase 2",
                    title: "MVP no ar",
                    subtitle: "(rápido e controlado)",
                    description: "Colocamos a primeira versão funcionando para gerar conversas reais."
                  },
                  {
                    phase: "Fase 3",
                    title: "Cohorts (safras) + otimização",
                    subtitle: "",
                    description: "Rodamos em lotes para melhorar conversão sem bagunçar a clínica."
                  },
                  {
                    phase: "Fase 4",
                    title: "Painel + rotina de melhoria",
                    subtitle: "",
                    description: "Você enxerga números e decide com clareza: o que escala e o que ajusta."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {item.phase} — {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-sm text-slate-500 font-medium mb-2">{item.subtitle}</p>
                      )}
                      <p className="text-slate-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Escolha suas 3 prioridades */}
        <motion.section
          id="prioridades"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Escolha suas 3 prioridades (para sua proposta final)
              </CardTitle>
              <p className="text-lg text-slate-600">
                Marque as <strong>3 soluções</strong> que fazem mais sentido agora:
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4 mb-8">
                {solutions.map((solution) => (
                  <div 
                    key={solution.id}
                    className={`flex items-start gap-4 p-5 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      selectedSolutions.includes(solution.id)
                        ? 'border-slate-900 bg-slate-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleCheckboxChange(solution.id)}
                  >
                    <Checkbox 
                      checked={selectedSolutions.includes(solution.id)}
                      onCheckedChange={() => handleCheckboxChange(solution.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-slate-900">
                          {solution.name}
                        </p>
                        {solution.badge && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                      {solution.subtitle && (
                        <p className="text-sm text-slate-500 mb-2">({solution.subtitle})</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showLimitWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg"
                >
                  <p className="text-amber-800 font-medium">⚠️ Selecione até 3 opções para continuar</p>
                </motion.div>
              )}

              <div className="text-center mt-8">
                <Button 
                  onClick={() => scrollToSection("investimento")}
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-base"
                >
                  Quero montar minha proposta Top 3
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* O que não está incluso */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                O que não está incluso
              </CardTitle>
              <p className="text-lg text-slate-600">
                Para manter prazo curto + execução impecável, <strong>não está incluso</strong>:
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <ul className="space-y-3">
                {[
                  "gestão de anúncios / tráfego pago / social media",
                  "produção de conteúdo (vídeos, posts, criativos)",
                  "prontuário eletrônico, prescrição, integrações clínicas complexas",
                  "criação de condutas clínicas ou protocolos médicos (isso é da clínica)",
                  "atendimento médico automatizado / diagnóstico por IA",
                  "promessa de quantidade mínima de consultas ou protocolos",
                  "contratação/treinamento de equipe interna (podemos orientar, não substitui gestão, por enquanto...)",
                  "custos de ferramentas externas quando aplicável (Creditos API whatsapp, número dedicado etc.)",
                  "integrações não previstas na proposta"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-700">
                    <span className="text-slate-400 mr-3 mt-1 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Garantia */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Garantia Axis (segurança na decisão)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="bg-white border-2 border-green-500 p-8 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                  <Shield className="w-12 h-12 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-lg text-slate-700">
                      A Axis garante <strong>qualidade de entrega e funcionamento do escopo contratado</strong>.
                    </p>
                    <p className="text-lg text-slate-700 mt-4">
                      Se ao final da implementação houver itens do escopo que não foram entregues com o padrão acordado, nós devolvemos <strong>100% do seu dinheiro</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Investimento */}
        <motion.section
          id="investimento"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Investimento (setup + mensalidade + tempo)
              </CardTitle>
              <p className="text-slate-600 mb-2">
                <strong>Setup = implantação</strong> (estratégia + roteiros + sistema + cohorts + painel inicial)
              </p>
              <p className="text-slate-600">
                <strong>Mensalidade = manutenção</strong> (monitoramento + otimização + melhorias contínuas)
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {/* Resumo das 3 escolhas */}
              {selectedSolutions.length === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 text-white p-8 rounded-lg mb-12"
                >
                  <h3 className="text-2xl font-bold mb-6">Suas 3 escolhas</h3>
                  <div className="space-y-4 mb-6">
                    {selectedSolutionsData.map((solution, idx) => (
                      <div key={solution.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{solution.name}</p>
                          <p className="text-sm text-white/70">{solution.time} • Setup R$ {solution.setup.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6 bg-white/20" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Setup total:</span>
                      <span className="font-semibold">R$ {totalSetup.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-lg text-green-300">
                      <span>Desconto (7%):</span>
                      <span className="font-semibold">- R$ {(totalSetup * discount).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total final:</span>
                      <span>R$ {finalSetup.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-4 border-t border-white/20">
                      <span>Mensalidade total:</span>
                      <span className="font-semibold">R$ {totalMonthly.toLocaleString('pt-BR')}/mês</span>
                    </div>
                    <p className="text-sm text-white/70 pt-2">+ 1 mês de mensalidade grátis</p>
                  </div>
                </motion.div>
              )}

              <h3 className="text-2xl font-bold mb-6 text-slate-900">Contratação individual (por solução)</h3>
              
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto mb-12">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="text-left p-4 font-semibold">Solução</th>
                      <th className="text-left p-4 font-semibold">Setup</th>
                      <th className="text-left p-4 font-semibold">Mensalidade</th>
                      <th className="text-left p-4 font-semibold">Tempo estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((solution) => (
                      <tr key={solution.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <strong className="text-slate-900">{solution.name}</strong>
                            {solution.badge && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                {solution.badge}
                              </Badge>
                            )}
                          </div>
                          {solution.subtitle && (
                            <p className="text-sm text-slate-500">({solution.subtitle})</p>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-900">R$ {solution.setup.toLocaleString('pt-BR')}</td>
                        <td className="p-4 font-bold text-slate-900">R$ {solution.monthly.toLocaleString('pt-BR')}</td>
                        <td className="p-4 text-slate-600">{solution.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 mb-12">
                {solutions.map((solution) => (
                  <Card key={solution.id} className="border-slate-200 bg-white">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{solution.name}</CardTitle>
                        {solution.badge && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                      {solution.subtitle && (
                        <p className="text-sm text-slate-500">({solution.subtitle})</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Setup:</span>
                        <span className="font-bold text-slate-900">R$ {solution.setup.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mensalidade:</span>
                        <span className="font-bold text-slate-900">R$ {solution.monthly.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Tempo:</span>
                        <span className="text-slate-600">{solution.time}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-12" />

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 rounded-lg mb-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Pacote Top 3 (as 3 escolhidas)</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700"><strong>7% de desconto no setup total</strong> + <strong>1 mês de mensalidade grátis</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Condição especial válida até <strong>23/01/2026</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg mb-2">
            <strong>AXIS</strong> • Tecnologia com excelência
          </p>
          <p className="text-slate-400">2026</p>
        </div>
      </footer>
    </div>
  );
};

export default PropostaMarcelaBueno;
