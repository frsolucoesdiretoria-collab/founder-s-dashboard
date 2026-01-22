import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  Shield, 
  Sparkles, 
  ChevronRight,
  Clock,
  Users,
  Heart,
  Star,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const PropostaMarcelaBuenoVersaoFinal = () => {
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
      name: "Convite VIP + Indicações Ativas (CORE)",
      badge: "CORE",
      problem: "falta de canal novo qualificado + pouca captura durante a experiência premium",
      value: "transforma momentos de alto valor (soro/injetáveis) em novas indicações qualificadas + cria comunidade VIP com pertencimento",
      setup: 20000,
      monthly: 532,
      time: "10–14 dias"
    },
    {
      id: 2,
      name: "Planejamento VIPs Ativos (reserva anual de agenda)",
      problem: "falta de previsibilidade + pacientes VIP \"soltos\"",
      value: "garante fluxo futuro de consultas e protocolos com pacientes que já confiam em você",
      setup: 6000,
      monthly: 336,
      time: "7–10 dias"
    },
    {
      id: 3,
      name: "Conversão para Protocolos (follow-up inteligente)",
      problem: "consulta avulsa que não vira protocolo",
      value: "aumenta a taxa de conversão para protocolos com pontos de contato planejados e abordagem cuidadosa",
      setup: 16000,
      monthly: 420,
      time: "10–14 dias"
    },
    {
      id: 4,
      name: "Pós-Consulta Humanizado",
      problem: "pós-consulta drena energia e tira você do local de potência",
      value: "reduz mensagens para você e melhora experiência do paciente com acompanhamento humano, elegante e seguro",
      setup: 35000,
      monthly: 700,
      time: "14–21 dias"
    },
    {
      id: 5,
      name: "Motor de Promotores (NPS → indicação premium)",
      problem: "indicação \"ao acaso\" + crescimento lento",
      value: "transforma satisfação real em crescimento estruturado, com script premium e rastreio",
      setup: 30000,
      monthly: 672,
      time: "14–21 dias"
    },
    {
      id: 6,
      name: "Reativação Premium da Base Inativa",
      problem: "pacientes \"sumidos\" + agenda abaixo do potencial",
      value: "recupera receita escondida reativando quem já conhece seu valor",
      setup: 14000,
      monthly: 532,
      time: "10–14 dias"
    }
  ];

  const implementations = [
    {
      title: "Convite VIP + Indicações Ativas",
      icon: <Star className="w-5 h-5" />,
      content: `**O que você vai sentir na prática:** uma página linda, um convite exclusivo, e pacientes felizes por "pertencer".

**Semana 1 — Estratégia VIP (30–45min)**

* Definimos o que é "VIP" na sua clínica (não é desconto — é pertencimento)
* Definimos benefícios VIP (experiência, acesso, prioridade, conteúdos, encontros, etc.)
* Definimos o convite e o tom: **premium, elegante e humano**

**Semana 2 — Página do Convite (2 versões)**

* Criamos o MVP da página de convite (duas opções) para você aprovar
* Incluímos um questionário curto para qualificação (sem fricção)

**Semana 3 — Cohort 1 (primeira safra)**

* Teste com um grupo pequeno e selecionado (dentro do ambiente premium da clínica)
* Ajustes finos com base no comportamento real (sem achismo)

**Semana 4 — Cohort 2 + Relatório**

* Segunda safra + relatório de performance
* Resultado claro: acessos, conversões, indicações qualificadas e próximos ajustes

**Por que isso é tão forte:** porque nasce dentro do momento de confiança máxima — a experiência premium da clínica — e vira crescimento com elegância.`
    },
    {
      title: "Planejamento VIPs Ativos (reserva anual de agenda)",
      icon: <Target className="w-5 h-5" />,
      content: `**O que você vai sentir:** previsibilidade, agenda com "espinha dorsal", e paz.

**Etapa 1 — Definição VIP**

* Quem entra como VIP e qual periodicidade ideal

**Etapa 2 — Convite de cuidado**

* Mensagem premium: "vamos planejar seu ano com saúde e acompanhamento"

**Etapa 3 — Reserva de agenda**

* Confirmações e reservas (sem bagunça)

**Etapa 4 — Visão de previsibilidade**

* Você enxerga o futuro: quantas datas já estão "garantidas"`
    },
    {
      title: "Conversão para Protocolos (follow-up inteligente)",
      icon: <TrendingUp className="w-5 h-5" />,
      content: `**O que você vai sentir:** menos "consulta solta" e mais pacientes prontos para decisão.

**Etapa 1 — Mapa de decisão do paciente**

* Quais objeções existem e qual "timing" ideal

**Etapa 2 — Pontos de contato planejados**

* Sequência premium pós-consulta (ex.: D+1, D+7, D+30, D+60…)

**Etapa 3 — Conversa que conduz (sem pressão)**

* Script que mantém vínculo e conduz para o próximo passo

**Etapa 4 — Ajuste fino por dados**

* O que está convertendo, o que está travando, e como melhorar`
    },
    {
      title: "Pós-Consulta Humanizado (alto padrão)",
      icon: <Heart className="w-5 h-5" />,
      content: `**O que você vai sentir:** seu WhatsApp "respira". Você volta a ser médica — e não suporte.

**Etapa 1 — Limites e segurança**

* O que pode / não pode ser dito (sem risco)

**Etapa 2 — Base de conhecimento premium**

* Conteúdos orientados por você, para manter padrão e tom humano

**Etapa 3 — Atendimento elegante**

* Acompanhamento com linguagem natural + encaminhamento quando necessário

**Etapa 4 — Refinamento até ficar "com a sua cara"**

* Ajustes controlados (sem prometer "sou você" — prometendo excelência)`
    },
    {
      title: "Motor de Promotores (NPS → indicação premium)",
      icon: <Users className="w-5 h-5" />,
      content: `**O que você vai sentir:** crescimento orgânico com método — sem "pedir favor".

**Etapa 1 — NPS premium**

* Pergunta simples, no timing certo

**Etapa 2 — Script de indicação elegante**

* Promotor indica porque ama — não porque "ganha brinde"

**Etapa 3 — Organização e rastreio**

* Indicações entram, são acompanhadas e viram agenda

**Etapa 4 — Evolução por ciclo**

* Refinar mensalmente e escalar com qualidade`
    },
    {
      title: "Reativação Premium da Base Inativa",
      icon: <Zap className="w-5 h-5" />,
      content: `**O que você vai sentir:** consultas voltando da base "adormecida", com mensagens bonitas e humanas.

**Etapa 1 — Segmentação da base**

* Quem está há 60/90/180 dias sem retorno

**Etapa 2 — Mensagens premium (sem parecer robô)**

* Convite de cuidado e retorno, com triagem leve

**Etapa 3 — Execução em lotes**

* Para não virar ruído e para otimizar conversão

**Etapa 4 — Relatório + melhoria**

* Ajuste fino do que gera resposta e agendamento`
    }
  ];

  const selectedSolutionsData = solutions.filter(s => selectedSolutions.includes(s.id));
  const totalSetup = selectedSolutionsData.reduce((acc, s) => acc + s.setup, 0);
  const totalMonthly = selectedSolutionsData.reduce((acc, s) => acc + s.monthly, 0);
  const discount = selectedSolutions.length === 3 ? 0.20 : 0;
  const finalSetup = totalSetup * (1 - discount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Top Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">AXIS</div>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Visão", id: "visao" },
              { label: "Diagnóstico", id: "diagnostico" },
              { label: "Soluções", id: "solucoes" },
              { label: "Implementação", id: "implementacao" },
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
            className="shadow-2xl bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg"
          >
            Quero avançar <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        style={{ opacity }}
        className="relative pt-32 pb-24 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-slate-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-slate-300">
              <Shield className="w-4 h-4 mr-2" />
              LGPD
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-slate-300">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Excelência
            </Badge>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent"
          >
            AXIS — Tecnologia para colocar empresários no local de potência
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto"
          >
            Proposta personalizada para <span className="font-semibold text-slate-900">Clínica Marcela Bueno</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={() => scrollToSection("solucoes")}
              size="lg" 
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg shadow-xl"
            >
              Ver soluções
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => scrollToSection("investimento")}
              size="lg" 
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400 px-8 py-6 text-lg"
            >
              Ver investimento
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24 space-y-32">
        
        {/* Visão Section */}
        <motion.section
          id="visao"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  A Axis nasceu de uma constatação simples: <strong>o Brasil cresce quando CNPJs crescem.</strong><br />
                  Empresas fortes geram empregos, prosperidade e liberdade — para o dono, para a equipe e para a comunidade.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  Só que existe um problema silencioso: a maioria dos empresários e profissionais de alta performance <strong>perde energia no operacional</strong>, responde coisas demais, decide coisas demais, e passa a trabalhar fora do próprio "local de potência".
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  A Axis existe para ser o <strong>braço de tecnologia</strong> de negócios que querem crescer com elegância:
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>visão estratégica</strong>, não "ferramenta por ferramenta"</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>excelência na execução</strong>, sem ruído</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>segurança e LGPD</strong> como regra</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>atendimento próximo</strong> e personalizado</span>
                  </li>
                </ul>

                <p className="text-slate-700 leading-relaxed mb-8">
                  Acreditamos em negócios com <strong>LTV alto</strong>: relacionamentos longos, mais recorrência, mais valor e mais previsibilidade.
                </p>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Visão para Marcela Bueno */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Da visão da Axis para a visão da Clínica Marcela Bueno</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Dra. Marcela, a sua clínica não é "um consultório".<br />
                  Ela é um ecossistema de transformação — e tem um ativo raríssimo: <strong>pacientes que já confiaram em você</strong> e falam do seu trabalho.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  Nos próximos 10 anos, a clínica que vence não é a que "posta mais".<br />
                  É a que cria um sistema simples e inteligente de relacionamento:
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>mais proximidade com quem já passou por aqui</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>mais pontos de contato planejados ao longo do ano</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>mais consultas qualificadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>mais protocolos vendidos com leveza</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>menos você no operacional</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span>mais você fazendo o que ama: <strong>cuidar e curar</strong></span>
                  </li>
                </ul>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 1: Diagnóstico */}
        <motion.section
          id="diagnostico"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">Diagnóstico objetivo do cenário</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Hoje, dentro das suas 120 horas mensais, <strong>aproximadamente 45% estão no seu local de potência</strong>:<br />
                  consulta, paciente, raciocínio clínico, decisão, presença.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  O restante do tempo é consumido por coisas que <strong>não crescem faturamento na mesma proporção</strong>:<br />
                  mensagens, admin, decisões operacionais, follow-ups manuais, interrupções.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  E existe um ponto crítico que você mesma trouxe com clareza:<br />
                  <strong>a consulta avulsa não é o lucro — o lucro está no protocolo.</strong>
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-8">
                  Então o caminho é simples e elegante:<br />
                  <strong>aumentar consultas certas + aumentar recorrência + aumentar conversão para protocolos + reduzir peso operacional.</strong>
                </p>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 2: O que muda */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">O que muda na prática</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Aqui nós não prometemos "resultado garantido".<br />
                  Prometemos algo mais sério: <strong>excelência na implementação</strong>, com estratégia, execução e melhoria contínua — para alcançar os resultados.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">Na prática, você ganha:</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Mais consultas solicitadas</strong> (sem depender de agência)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Mais conversas qualificadas</strong> (sem depender do seu tempo)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Mais conversão para protocolos</strong> com um processo claro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Mais indicações estruturadas</strong> (premium, elegante, sem "promoção")</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Mais você no seu local de potência</strong> — e menos você no operacional</span>
                  </li>
                </ul>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 3: Soluções (Tabela) */}
        <motion.section
          id="solucoes"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">
                As 6 soluções Axis para a Clínica
              </CardTitle>
              <p className="text-slate-600 text-lg">
                A ideia não é "fazer tudo".<br />
                A ideia é escolher <strong>as 3 alavancas</strong> que geram mais impacto com menos atrito — e começar de forma leve, premium e bem executada.
              </p>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left p-4 font-semibold text-slate-900">Solução</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Dor que resolve</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Valor que gera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((solution, idx) => (
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
                        </td>
                        <td className="p-4 text-slate-600">{solution.problem}</td>
                        <td className="p-4 text-slate-600">{solution.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-6">
                {solutions.map((solution, idx) => (
                  <Card key={solution.id} className="border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{solution.name}</CardTitle>
                        {solution.badge && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Dor que resolve:</p>
                        <p className="text-sm text-slate-600">{solution.problem}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Valor que gera:</p>
                        <p className="text-sm text-slate-600">{solution.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 bg-slate-100 border-l-4 border-slate-900 p-6 rounded-r-lg">
                <p className="text-slate-900 font-medium mb-0">Alguma dúvida até aqui?</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 4: Implementação (Accordion) */}
        <motion.section
          id="implementacao"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">Como é a implementação</CardTitle>
              <p className="text-slate-600 text-lg">
                A Axis não entra para "dar trabalho".<br />
                A Axis entra para <strong>tirar trabalho</strong>, criar clareza e colocar a clínica num fluxo bonito de crescimento.
              </p>
              <p className="text-slate-600 text-lg mt-4">
                Você vai sentir isso como uma experiência premium:<br />
                curta, objetiva, com entregas visíveis — e com você no controle.
              </p>
            </CardHeader>
            <CardContent className="p-12 pt-6">
              <Accordion type="single" collapsible className="space-y-4">
                {implementations.map((impl, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className="border border-slate-200 rounded-lg px-6 hover:border-slate-300 transition-colors"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          {impl.icon}
                        </div>
                        <span>{impl.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2">
                      <div className="prose prose-sm max-w-none pl-13">
                        {impl.content.split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <p key={pIdx} className="font-bold text-slate-900 mb-4">
                                {paragraph.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          if (paragraph.startsWith('* ')) {
                            return (
                              <div key={pIdx} className="flex items-start gap-3 mb-3">
                                <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                                <span className="text-slate-700">{paragraph.replace('* ', '')}</span>
                              </div>
                            );
                          }
                          return (
                            <p key={pIdx} className="text-slate-700 mb-4" dangerouslySetInnerHTML={{ 
                              __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }} />
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 5: Checklist */}
        <motion.section
          id="prioridades"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">
                Escolha suas 3 prioridades
              </CardTitle>
              <p className="text-slate-600 text-lg">
                Dra. Marcela, marque abaixo as <strong>3 soluções</strong> que mais fazem sentido agora — e nós montamos sua proposta final com as melhores condições.
              </p>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="space-y-4 mb-8">
                {solutions.map((solution, idx) => (
                  <div 
                    key={solution.id}
                    className={`flex items-start gap-4 p-6 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
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
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-slate-900">
                          {solution.name}
                        </p>
                        {solution.badge && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{solution.problem}</p>
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


              <div className="mt-12 bg-slate-100 border-l-4 border-slate-900 p-6 rounded-r-lg">
                <p className="text-slate-900 font-medium mb-0">Alguma dúvida até aqui?</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 6: O que não está incluso */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">
                O que NÃO está incluso
              </CardTitle>
              <p className="text-slate-600 text-lg">
                Para manter o padrão Axis (prazo curto + execução impecável), <strong>não está incluso</strong>:
              </p>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <ul className="space-y-3 mb-8">
                {[
                  "gestão de anúncios / tráfego pago / social media",
                  "produção de conteúdo (vídeos, posts, criativos)",
                  "prontuário eletrônico, prescrição, integrações clínicas complexas",
                  "criação de condutas clínicas ou protocolos médicos (isso é da clínica)",
                  "atendimento médico automatizado / diagnóstico por IA",
                  'promessa de número mínimo de consultas ou protocolos (nosso compromisso é com a qualidade da implementação)',
                  "contratação/treinamento de equipe da clínica (podemos orientar, mas não substitui gestão interna)",
                  "custos de ferramentas externas quando aplicável (mensageria, número dedicado etc.)",
                  "integrações não previstas na proposta"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-slate-400 mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-slate-700 leading-relaxed mb-8">
                O objetivo aqui é simples: você ter clareza do escopo para que tudo o que for contratado seja entregue <strong>com excelência real</strong>.
              </p>

              <div className="bg-slate-100 border-l-4 border-slate-900 p-6 rounded-r-lg">
                <p className="text-slate-900 font-medium mb-0">Alguma dúvida até aqui?</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 7: Garantia */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">Garantia Axis</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Você já teve experiências ruins com agência e robôs. Eu respeito isso.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-6">
                  Por isso a Axis coloca no contrato:
                </p>
                
                <div className="bg-white border-2 border-green-500 p-8 rounded-lg mb-8 shadow-md">
                  <div className="flex items-start gap-4">
                    <Shield className="w-12 h-12 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Garantia de satisfação da implementação</h4>
                      <p className="text-slate-700">
                        Se ao final do período de implementação contratado você estiver <strong>insatisfeita com a qualidade da entrega</strong>, a Axis garante <strong>devolução de 100% do valor pago</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed mb-8">
                  Nós sustentamos isso porque escolhemos projetos onde conseguimos entregar acima do mercado — com segurança, elegância e responsabilidade.
                </p>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 8: Urgência */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">Por que começar agora</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  O risco hoje não é "não ter tecnologia".<br />
                  O risco é seus concorrentes elevarem <strong>experiência, recorrência e previsibilidade</strong> enquanto você continua no manual.
                </p>
                
                <p className="text-slate-700 leading-relaxed mb-8">
                  E existe um fator prático:
                </p>

                <div className="bg-white border-2 border-amber-500 p-8 rounded-lg mb-8 shadow-md">
                  <div className="flex items-start gap-4">
                    <Clock className="w-12 h-12 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-semibold text-xl mb-0">
                        Esta proposta tem condições e agenda de implementação válidas até <strong>23/01/2026</strong>.
                      </p>
                      <p className="text-slate-600 mt-2">
                        Depois disso, disponibilidade e condições podem mudar.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 9: Benefícios */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">O que você ganha ao aprovar</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed mb-8">
                  Ao aprovar as implementações, sua clínica passa a ter:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "um novo canal premium de aquisição (indicação ativa com status e pertencimento)",
                    "mais consultas qualificadas sem depender de agência",
                    "mais pacientes retornando e ficando em acompanhamento",
                    "mais pontos de contato ao longo do ano (com elegância)",
                    "mais conversão de consulta para protocolos",
                    "mais tempo seu no local de potência",
                    "NPS mapeado e promotores transformados em crescimento",
                    "base para um plano claro de expansão em 2026 com dados reais"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-lg mb-8">
                  <p className="text-xl font-bold mb-4">Pergunta direta:</p>
                  <p className="text-lg mb-0">
                    Se desconsiderarmos o fator preço, <strong>faz sentido aprovar hoje</strong> para começarmos imediatamente?
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Seção 10: Investimento */}
        <motion.section
          id="investimento"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mb-4">Investimento</CardTitle>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              {/* Resumo das 3 escolhas */}
              {selectedSolutions.length === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 text-white p-8 rounded-lg mb-12"
                >
                  <h3 className="text-2xl font-bold mb-6">Resumo das suas 3 escolhas</h3>
                  <div className="space-y-4">
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
                      <span>Desconto (20%):</span>
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
                    <p className="text-sm text-white/70 pt-4">+ 1 mês de mensalidade grátis</p>
                  </div>
                </motion.div>
              )}

              <h3 className="text-2xl font-bold mb-6 text-slate-900">10.1 — Contratação individual (por solução)</h3>
              
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
                    {solutions.map((solution, idx) => (
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
              <div className="lg:hidden space-y-6 mb-12">
                {solutions.map((solution, idx) => (
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

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-lg mb-8">
                <p className="text-xl font-bold mb-4">Pergunta final:</p>
                <p className="text-lg mb-0">
                  Qual opção faz mais sentido para a clínica hoje: <strong>à vista</strong> ou <strong>entrada + fluxo</strong>?
                </p>
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

export default PropostaMarcelaBuenoVersaoFinal;
