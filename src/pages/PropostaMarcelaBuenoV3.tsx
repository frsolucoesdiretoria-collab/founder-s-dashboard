import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  Shield, 
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  Zap,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const PropostaMarcelaBuenoV3 = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > window.innerHeight * 0.3);
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
      resolve: "Transforma sua experiência premium em máquina de indicação qualificada.",
      funciona: "Indicação high ticket não acontece por acaso. Precisa de gatilho, script, status.",
      impacto: "Canal de novos pacientes qualificados sem depender de anúncio.",
      setup: 20000,
      monthly: 760,
      time: "10–14 dias"
    },
    {
      id: 2,
      name: "Planejamento VIPs Ativos",
      subtitle: "Reserva Anual",
      resolve: "Cria espinha dorsal de agenda com pacientes que já confiam.",
      funciona: "Previsibilidade reduz vacância. Recorrência aumenta ticket médio anual.",
      impacto: "Você sabe quanto vai faturar antes do mês começar.",
      setup: 6000,
      monthly: 480,
      time: "7–10 dias"
    },
    {
      id: 3,
      name: "Conversão para Protocolos",
      subtitle: "Follow-up Inteligente",
      resolve: "Organiza sequência pós-consulta que conduz para decisão sem pressão.",
      funciona: "A maioria dos \"nãos\" são \"ainda não\". Follow-up bem feito transforma isso em \"sim\".",
      impacto: "Aumenta ticket médio por paciente. Eleva taxa de conversão consulta → protocolo.",
      setup: 16000,
      monthly: 600,
      time: "10–14 dias"
    },
    {
      id: 4,
      name: "Pós-Consulta Humanizado",
      subtitle: "Alto Padrão",
      resolve: "Tira o peso do suporte do seu WhatsApp. Limites claros, encaminhamento seguro.",
      funciona: "Paciente bem cuidado volta e compra. Experiência premium gera recompra.",
      impacto: "Reduz churn. Aumenta satisfação. Libera você para vender.",
      setup: 35000,
      monthly: 1160,
      time: "14–21 dias"
    },
    {
      id: 5,
      name: "Motor de Promotores",
      subtitle: "NPS → Indicação Premium",
      resolve: "Aplica NPS no timing certo + gatilho de indicação + rastreio completo.",
      funciona: "Indicação deixa de ser sorte e vira canal comercial escalável.",
      impacto: "Custo de aquisição zero. Qualidade máxima.",
      setup: 30000,
      monthly: 960,
      time: "14–21 dias"
    },
    {
      id: 6,
      name: "Reativação Premium da Base Inativa",
      subtitle: "Retorno Rápido",
      resolve: "Reativa pacientes \"sumidos\" com comunicação de cuidado premium.",
      funciona: "Quem já confiou decide mais fácil. É o dinheiro mais rápido e mais barato.",
      impacto: "Caixa imediato. Retorno sobre base própria.",
      setup: 14000,
      monthly: 760,
      time: "10–14 dias"
    }
  ];

  const faqs = [
    {
      question: "Vai parecer robô?",
      answer: "Não. Linguagem humana e premium, aprovada por você, com cohorts para ajuste fino."
    },
    {
      question: "Isso substitui minha equipe?",
      answer: "Não. Reduz atrito e organiza fluxo. Humanos entram nos pontos certos."
    },
    {
      question: "Tem risco clínico / diagnóstico?",
      answer: "Não fazemos diagnóstico por IA. Limites claros e encaminhamento para humano quando necessário."
    },
    {
      question: "E LGPD?",
      answer: "Segurança total: consentimento, minimização de dados, controle completo conforme projeto."
    }
  ];

  const selectedSolutionsData = solutions.filter(s => selectedSolutions.includes(s.id));
  const totalSetup = selectedSolutionsData.reduce((acc, s) => acc + s.setup, 0);
  const totalMonthly = selectedSolutionsData.reduce((acc, s) => acc + s.monthly, 0);
  const discount = selectedSolutions.length === 3 ? 0.07 : 0;
  const finalSetup = totalSetup * (1 - discount);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky CTA */}
      {showStickyCTA && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button 
            onClick={() => scrollToSection("escolher")}
            size="lg"
            className="shadow-2xl bg-black hover:bg-black/90 text-white px-8 py-6 text-base font-medium"
          >
            Escolher 3 soluções <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative pt-32 pb-24 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl font-bold tracking-tight mb-6 text-black"
          >
            Venda mais.
            <br />
            Trabalhe menos.
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-medium text-slate-700 mb-12 leading-tight"
          >
            Sistema comercial completo para clínicas que já entregam excelência — e precisam transformar isso em receita previsível.
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-12 space-y-6"
          >
            <p className="text-xl text-slate-600 leading-relaxed">
              Sua clínica já oferece cuidado premium. Mas sem sistema, cada protocolo fechado depende de você lembrar, você acompanhar, você indicar.
            </p>
            <p className="text-xl text-slate-600 leading-relaxed">
              O resultado? Agenda cheia, retorno baixo. Pacientes satisfeitos que somem. Protocolos que ficam na intenção.
            </p>
            <p className="text-xl text-black font-semibold leading-relaxed">
              A Axis constrói o braço comercial que faltava: transforma atendimento em recorrência, experiência em indicação, consulta em protocolo.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={() => scrollToSection("escolher")}
              size="lg" 
              className="bg-black hover:bg-black/90 text-white px-12 py-7 text-lg font-medium"
            >
              Escolher minhas 3 soluções
            </Button>
            <Button 
              onClick={() => scrollToSection("investimento")}
              size="lg" 
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white px-12 py-7 text-lg font-medium transition-all"
            >
              Ver investimento
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-32">
        
        {/* Diagnóstico */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            O que impede você de vender mais não é falta de técnica. É ausência de sistema.
          </h2>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Você perde venda todos os dias — silenciosamente:
          </p>
          
          <ul className="space-y-4 mb-10">
            {[
              "Paciente faz consulta, sai satisfeito, nunca volta. Zero follow-up.",
              "Protocolo não fecha porque você não tem sequência de decisão estruturada.",
              "Indicação acontece ao acaso. Nenhum canal, nenhum rastreio.",
              "Seu WhatsApp virou balcão de dúvidas. Você saiu do consultório para virar atendente."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start text-lg text-slate-700 leading-relaxed">
                <span className="text-slate-400 mr-4 text-2xl">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Isso não é problema de marketing. É problema de <strong className="text-black">arquitetura comercial</strong>.
          </p>

          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Clínicas que faturam 7 dígitos não fazem isso sozinhas. Elas têm processo.
          </p>

          <div className="border-l-4 border-black bg-slate-50 p-8">
            <p className="text-xl text-black font-semibold">
              A diferença entre agenda lotada e faturamento alto é simples: uma depende de esforço, a outra depende de sistema.
            </p>
          </div>
        </motion.section>

        {/* Solução - 3 Motores */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            Três motores. Um objetivo: vender mais sem depender do seu WhatsApp.
          </h2>

          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            A Axis implementa infraestrutura de relacionamento comercial em três frentes simultâneas:
          </p>

          <div className="space-y-6 mb-10">
            {[
              { 
                icon: <TrendingUp className="w-10 h-10" />, 
                title: "Motor 1 → Retorno Previsível",
                desc: "Pacientes ativos e inativos voltam no timing comercial certo. Sem spam. Sem pressão. Com método."
              },
              { 
                icon: <Target className="w-10 h-10" />, 
                title: "Motor 2 → Conversão em Protocolo",
                desc: "Consulta avulsa vira decisão de compra. Follow-up estruturado. Condução elegante. Venda natural."
              },
              { 
                icon: <Users className="w-10 h-10" />, 
                title: "Motor 3 → Indicação como Canal",
                desc: "Satisfação vira processo de indicação qualificada. NPS aplicado. Script premium. Rastreio ativo."
              }
            ].map((motor, idx) => (
              <div key={idx} className="flex items-start gap-6 p-8 border border-slate-200 hover:border-black transition-all">
                <div className="flex-shrink-0 w-16 h-16 bg-black flex items-center justify-center text-white">
                  {motor.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-3">{motor.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{motor.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-8">
            <p className="text-lg text-slate-700">
              Não vendemos "resultado garantido". Vendemos <strong>excelência de execução</strong> + <strong>otimização contínua</strong>. E isso muda o jogo.
            </p>
          </div>
        </motion.section>

        {/* As 6 Soluções */}
        <motion.section
          id="solucoes"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            Escolha as 3 alavancas que mais aumentam vendas agora.
          </h2>

          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Não implementamos tudo de uma vez. Você escolhe os 3 pontos de maior impacto comercial.
          </p>

          <div className="space-y-8">
            {solutions.map((solution) => (
              <div key={solution.id} className="border-b border-slate-200 pb-8 last:border-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl">
                    {solution.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-black">{solution.name}</h3>
                      {solution.badge && (
                        <Badge className="bg-yellow-400 text-black border-0 text-xs font-semibold px-3">
                          {solution.badge}
                        </Badge>
                      )}
                    </div>
                    {solution.subtitle && (
                      <p className="text-base text-slate-500 mb-4">{solution.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pl-16">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">O que resolve</p>
                    <p className="text-lg text-slate-700 leading-relaxed">{solution.resolve}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Por que funciona</p>
                    <p className="text-lg text-slate-700 leading-relaxed">{solution.funciona}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Impacto comercial</p>
                    <p className="text-lg text-black font-semibold leading-relaxed">{solution.impacto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Trilha Recomendada */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="bg-slate-50 -mx-6 px-6 py-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
            Se o objetivo é receita, comece aqui.
          </h2>

          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            A trilha mais forte para clínicas que querem aumentar faturamento rápido:
          </p>

          <div className="space-y-4 mb-10">
            {[
              { num: "1", text: "Reativação Premium", sub: "caixa imediato, retorno rápido" },
              { num: "2", text: "Conversão para Protocolos", sub: "elevar ticket médio" },
              { num: "3", text: "Motor de Promotores", sub: "crescimento escalável" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 bg-white p-6 border border-slate-200">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl">
                  {item.num}
                </div>
                <div>
                  <p className="text-xl font-bold text-black">{item.text}</p>
                  <p className="text-base text-slate-600">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-lg text-slate-700 leading-relaxed">
            Essa combinação entrega: <strong className="text-black">caixa + ticket + canal</strong>.
          </p>
          <p className="text-lg text-slate-700 mt-4 leading-relaxed">
            Você pode escolher diferente. Mas essa é a trilha de maior impacto comercial.
          </p>
        </motion.section>

        {/* Escolha suas 3 */}
        <motion.section
          id="escolher"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            Escolha suas 3 prioridades
          </h2>

          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Marque as <strong className="text-black">3 soluções</strong> que fazem mais sentido agora:
          </p>

          <div className="space-y-4 mb-10">
            {solutions.map((solution) => (
              <div 
                key={solution.id}
                className={`flex items-start gap-5 p-6 border-2 transition-all duration-200 cursor-pointer ${
                  selectedSolutions.includes(solution.id)
                    ? 'border-black bg-slate-50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
                onClick={() => handleCheckboxChange(solution.id)}
              >
                <Checkbox 
                  checked={selectedSolutions.includes(solution.id)}
                  onCheckedChange={() => handleCheckboxChange(solution.id)}
                  className="mt-1 w-6 h-6"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-lg font-bold text-black">
                      {solution.id}) {solution.name}
                    </p>
                    {solution.badge && (
                      <Badge className="bg-yellow-400 text-black border-0 text-xs font-semibold">
                        {solution.badge}
                      </Badge>
                    )}
                  </div>
                  {solution.subtitle && (
                    <p className="text-sm text-slate-500">({solution.subtitle})</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showLimitWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-6"
            >
              <p className="text-amber-900 font-medium text-lg">Selecione até 3 opções para continuar</p>
            </motion.div>
          )}

          {selectedSolutions.length === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black text-white p-10 mb-10"
            >
              <h3 className="text-3xl font-bold mb-8">Suas 3 escolhas</h3>
              <div className="space-y-4 mb-8">
                {selectedSolutionsData.map((solution, idx) => (
                  <div key={solution.id} className="flex items-start gap-4 pb-4 border-b border-white/20 last:border-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold">{solution.name}</p>
                      <p className="text-sm text-white/70 mt-1">
                        {solution.time} • Setup R$ {solution.setup.toLocaleString('pt-BR')} • Mensalidade R$ {solution.monthly.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-8 bg-white/20" />
              <div className="space-y-3">
                <div className="flex justify-between text-xl">
                  <span>Setup total:</span>
                  <span className="font-semibold">R$ {totalSetup.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xl text-green-400">
                  <span>Desconto (7%):</span>
                  <span className="font-semibold">- R$ {(totalSetup * discount).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-3xl font-bold pt-4 border-t border-white/20">
                  <span>Total final:</span>
                  <span>R$ {finalSetup.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xl pt-6 border-t border-white/20 mt-6">
                  <span>Mensalidade total:</span>
                  <span className="font-semibold">R$ {totalMonthly.toLocaleString('pt-BR')}/mês</span>
                </div>
                <p className="text-sm text-white/70 pt-2">+ 1 mês de mensalidade grátis</p>
              </div>
            </motion.div>
          )}

          <div className="text-center">
            <Button 
              onClick={() => scrollToSection("investimento")}
              size="lg"
              className="bg-black hover:bg-black/90 text-white px-12 py-7 text-lg font-medium"
            >
              Ver investimento completo
            </Button>
          </div>
        </motion.section>

        {/* Implementação */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-12">
            4 fases. Sem ruído. Sem projeto que nunca acaba.
          </h2>

          <div className="space-y-8">
            {[
              {
                phase: "Fase 1",
                title: "Estratégia e Regras",
                time: "kickoff 30–45 min",
                desc: "Definimos tom, segmentos, limites, critérios de encaminhamento."
              },
              {
                phase: "Fase 2",
                title: "MVP no Ar",
                time: "rápido e controlado",
                desc: "Primeira versão funcionando para gerar conversas reais."
              },
              {
                phase: "Fase 3",
                title: "Cohorts + Otimização",
                time: "",
                desc: "Rodamos em lotes. Melhoramos conversão sem bagunçar a clínica."
              },
              {
                phase: "Fase 4",
                title: "Painel + Rotina de Melhoria",
                time: "",
                desc: "Você enxerga números. Decide com clareza. Escala o que funciona."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-8">
                <div className="flex-shrink-0 w-16 h-16 bg-black text-white flex items-center justify-center font-bold text-2xl">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-black mb-1">
                    {item.phase} — {item.title}
                  </h3>
                  {item.time && (
                    <p className="text-sm text-slate-500 font-medium mb-3">({item.time})</p>
                  )}
                  <p className="text-lg text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Entregáveis */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
            Você não compra promessa. Você compra entrega.
          </h2>

          <div className="space-y-3">
            {[
              "Segmentação comercial da base (ativos / inativos / VIPs / perfis)",
              "Roteiros premium aprovados por você (tom da clínica, zero \"cara de robô\")",
              "Regras de triagem e encaminhamento (quando humano entra, quando sistema resolve)",
              "Implementação em cohorts (safras controladas para ajuste fino)",
              "Painel de acompanhamento (respostas, agendamentos, recusas, conversão)",
              "Rotina de otimização mensal (melhoria contínua baseada em dados reais)"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 text-lg text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Investimento */}
        <motion.section
          id="investimento"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            Investimento
          </h2>

          <div className="mb-12">
            <p className="text-xl text-slate-600 mb-2 leading-relaxed">
              <strong className="text-black">Setup</strong> = implantação completa (estratégia + roteiros + sistema + cohorts + painel)
            </p>
            <p className="text-xl text-slate-600 leading-relaxed">
              <strong className="text-black">Mensalidade</strong> = manutenção ativa (monitoramento + otimização + melhorias)
            </p>
          </div>

          {/* Table Desktop */}
          <div className="hidden lg:block mb-16">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-4 pr-4 font-bold text-lg text-black">Solução</th>
                  <th className="text-left py-4 px-4 font-bold text-lg text-black">Setup</th>
                  <th className="text-left py-4 px-4 font-bold text-lg text-black">Mensalidade</th>
                  <th className="text-left py-4 pl-4 font-bold text-lg text-black">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {solutions.map((solution) => (
                  <tr key={solution.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <strong className="text-black text-base">{solution.id}) {solution.name}</strong>
                        {solution.badge && (
                          <Badge className="bg-yellow-400 text-black border-0 text-xs font-semibold">
                            {solution.badge}
                          </Badge>
                        )}
                      </div>
                      {solution.subtitle && (
                        <p className="text-sm text-slate-500 mt-1">({solution.subtitle})</p>
                      )}
                    </td>
                    <td className="py-5 px-4 font-bold text-black text-base">R$ {solution.setup.toLocaleString('pt-BR')}</td>
                    <td className="py-5 px-4 font-bold text-black text-base">R$ {solution.monthly.toLocaleString('pt-BR')}</td>
                    <td className="py-5 pl-4 text-slate-600 text-base">{solution.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden space-y-4 mb-16">
            {solutions.map((solution) => (
              <Card key={solution.id} className="border-2 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <p className="font-bold text-black text-base">{solution.id}) {solution.name}</p>
                    {solution.badge && (
                      <Badge className="bg-yellow-400 text-black border-0 text-xs font-semibold">
                        {solution.badge}
                      </Badge>
                    )}
                  </div>
                  {solution.subtitle && (
                    <p className="text-sm text-slate-500 mb-4">({solution.subtitle})</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Setup:</span>
                      <span className="font-bold text-black">R$ {solution.setup.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Mensalidade:</span>
                      <span className="font-bold text-black">R$ {solution.monthly.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Tempo:</span>
                      <span className="text-slate-600">{solution.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-16 bg-slate-200" />

          {/* Pacote Top 3 */}
          <div className="bg-green-50 border-2 border-green-600 p-10 mb-16">
            <h3 className="text-3xl font-bold text-black mb-6">Pacote Top 3</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-700">
                  <strong className="text-black">7% de desconto no setup total</strong> + <strong className="text-black">1 mês de mensalidade grátis</strong>
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-700">
                  Condição especial válida até <strong className="text-black">23/01/2026</strong>
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-16 bg-slate-200" />

          <h3 className="text-3xl font-bold text-black mb-10">Como iniciar</h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-black p-8 hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 transition-transform">
                  A
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-black">À vista (PIX)</h4>
                  <p className="text-base text-slate-600 mt-1">Prioridade máxima</p>
                </div>
              </div>
              <p className="text-lg text-slate-700">
                <strong className="text-black">Prioridade máxima de agenda.</strong> Início imediato.
              </p>
            </div>

            <div className="border-2 border-slate-300 p-8 hover:border-black hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-slate-100 group-hover:bg-black flex items-center justify-center text-black group-hover:text-white text-3xl font-bold group-hover:scale-110 transition-all">
                  B
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-black">Entrada + Fluxo</h4>
                  <p className="text-base text-slate-600 mt-1">R$ 10.000 para travar</p>
                </div>
              </div>
              <p className="text-lg text-slate-700">
                <strong className="text-black">PIX de R$ 10.000</strong> para travar agenda + restante em fluxo combinado
              </p>
            </div>
          </div>
        </motion.section>

        {/* Garantia */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="bg-green-50 -mx-6 px-6 py-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
            Segurança na decisão
          </h2>

          <div className="flex items-start gap-6 bg-white border-2 border-green-600 p-10">
            <Shield className="w-16 h-16 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xl text-slate-700 leading-relaxed mb-4">
                A Axis garante <strong className="text-black">qualidade de entrega e funcionamento do escopo contratado</strong>.
              </p>
              <p className="text-xl text-slate-700 leading-relaxed">
                Se ao final da implementação houver itens do escopo que não foram entregues com o padrão acordado, devolvemos <strong className="text-black">100% do seu dinheiro</strong>.
              </p>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-10">
            FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-2 border-slate-200">
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl font-bold text-black">{faq.question}</span>
                  <ChevronDown 
                    className={`w-6 h-6 text-black transition-transform flex-shrink-0 ml-4 ${
                      openFAQ === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === idx && (
                  <div className="px-6 pb-6 border-t border-slate-200 pt-6">
                    <p className="text-lg text-slate-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Fechamento */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-black text-white p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Pergunta direta.
            </h2>
            <p className="text-2xl leading-relaxed mb-4">
              Dra. Marcela:
            </p>
            <p className="text-2xl leading-relaxed mb-8">
              Se eu te entregar um sistema que aumenta <strong>retorno</strong>, melhora <strong>conversão para protocolos</strong> e estrutura <strong>indicação</strong> — sem te prender no operacional...
            </p>
            <p className="text-2xl leading-relaxed mb-12">
              ...faz sentido começarmos a implementação agora?
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => scrollToSection("escolher")}
                size="lg"
                className="bg-white hover:bg-slate-100 text-black px-12 py-7 text-lg font-medium"
              >
                Escolher minhas 3 soluções
              </Button>
              <Button 
                onClick={() => scrollToSection("investimento")}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-12 py-7 text-lg font-medium"
              >
                Ver investimento
              </Button>
            </div>
          </div>
        </motion.section>

      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16 mt-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold mb-2">AXIS</p>
          <p className="text-slate-400">Tecnologia com excelência • 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default PropostaMarcelaBuenoV3;
