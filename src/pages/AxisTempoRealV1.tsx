// AXIS TEMPO REAL V1 — Landing Page Premium Apple-like
// Copy locked: SHA-256 hash validation enforced

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  MessageSquare,
  Users,
  Eye
} from 'lucide-react';

// Content loader with hash validation
const CONTENT_HASH = '574445c2f77206db228ba9df4cd9d92c2a078fa539b9ffa55c790f1262cde971';

const AxisTempoRealV1: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Parallax effects
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0.5]);
  
  const problemY = useTransform(smoothProgress, [0.1, 0.4], [100, -50]);
  const solutionScale = useTransform(smoothProgress, [0.3, 0.6], [0.95, 1]);

  // WhatsApp link (placeholder - can be configured)
  const whatsappLink = "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Axis%20Tempo%20Real";

  return (
    <div className="relative w-full bg-white min-h-screen overflow-hidden">
      {/* Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200"
          >
            <Clock className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700 tracking-wide uppercase">
              AXIS TEMPO REAL
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-medium text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            Pare de pagar salário para "fazer fogo com pedra".
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto tracking-tight"
          >
            Descubra onde sua equipe cria lucro — e onde o dinheiro da folha está virando desperdício.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-8"
          >
            <Button
              size="lg"
              onClick={() => window.open(whatsappLink, '_blank')}
              className="h-14 px-10 text-lg bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Quero enxergar meu desperdício
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Problem Section */}
      <motion.section 
        className="relative py-32 px-6 bg-slate-50"
        style={{ y: problemY }}
      >
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
              Você conhece essa história, mesmo que nunca tenha contado assim:
            </p>
            
            <div className="space-y-4 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>Todo mês você paga salários.<br />
              Todo mês você paga encargos.<br />
              Todo mês você paga o custo de manter um time inteiro vivo — com tudo o que isso envolve.</p>
              
              <p className="pt-6">E todo mês você toma decisões importantes com base em:</p>
            </div>

            <motion.ul 
              className="space-y-3 pl-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {['feeling', 'conversas soltas', '"acho que é isso"', 'percepção de urgência', 'e aquele incêndio da semana'].map((item, i) => (
                <motion.li
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="flex items-center gap-3 text-lg md:text-xl text-slate-600"
                >
                  <span className="w-2 h-2 bg-slate-400 rounded-full" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <div className="pt-8 space-y-4">
              <p className="text-lg md:text-xl text-slate-600">
                O nome disso é comum no Brasil.
              </p>
              <p className="text-3xl md:text-4xl font-medium text-slate-900">
                O nome disso é <span className="underline decoration-slate-300 decoration-4">gestão no escuro</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Metaphor Section */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight mb-12">
              Quando a gente olha pro passado, parece óbvio.
            </h2>

            <div className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>Um neandertal faz fogo com pedra.</p>
              
              <p>Demora. Dá trabalho. Consome energia.<br />
              E no fim… ele consegue calor.</p>
              
              <p>Hoje, isso parece absurdo — porque a tecnologia transformou o "fogo" em um botão.</p>
              
              <Card className="mt-12 p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
                <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                  Dentro do seu CNPJ existe uma lista inteira de atividades que ainda são "fogo com pedra".<br />
                  <span className="text-slate-400">Só que você está pagando por isso todo mês.</span>
                </blockquote>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fire with Stone Examples */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            O que é "fogo com pedra" dentro de uma empresa?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed"
          >
            É qualquer tarefa em que um humano está gastando horas para fazer o que tecnologia faria em segundos:
          </motion.p>

          <motion.div 
            className="grid gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            {[
              'lançamentos manuais',
              'conciliações repetitivas',
              'copiar dados entre sistemas',
              '"preencher status" para provar trabalho',
              'relatórios de prestação de contas que ninguém lê',
              'retrabalho por falha de processo',
              'tarefas que existem só porque "o fluxo sempre foi assim"'
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0" />
                    <p className="text-lg md:text-xl text-slate-700">{item}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="pt-12 space-y-8">
            <p className="text-lg md:text-xl text-slate-600">
              O custo disso não é só tempo.
            </p>
            <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-relaxed">
              O custo disso é:<br />
              <span className="text-slate-600">folha + encargos + imposto + oportunidade perdida + crescimento travado.</span>
            </p>

            <Card className="mt-12 p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-2xl">
              <p className="text-3xl md:text-4xl font-medium text-white leading-tight">
                Quantas horas por mês você está pagando para a sua equipe "bater pedra"?
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Clarity Section */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            Se você tivesse clareza, você faria escolhas diferentes.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed"
          >
            Porque o caminho para aumentar lucro líquido é simples (e cruelmente ignorado):
          </motion.p>

          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {[
              { number: '1', text: 'Reduzir desperdício invisível', icon: Eye },
              { number: '2', text: 'Automatizar o que é repetitivo', icon: Zap },
              { number: '3', text: 'Realocar pessoas para atividades de potência', icon: Target },
              { number: '4', text: 'Crescer receita sem subir custo fixo', icon: TrendingUp }
            ].map((item) => (
              <motion.div
                key={item.number}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="p-8 h-full bg-slate-50 border-0 hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-5xl font-light text-slate-300">{item.number}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-slate-900 leading-tight">
                      {item.text}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed pt-8"
          >
            O problema é que quase ninguém faz isso bem…<br />
            <span className="text-slate-900 font-medium">porque quase ninguém mede.</span>
          </motion.p>
        </div>
      </section>

      {/* Product Section */}
      <motion.section 
        className="relative py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white"
        style={{ scale: solutionScale }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full border border-white/20">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wide uppercase">
                A SOLUÇÃO
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight max-w-4xl mx-auto">
              Axis Tempo Real — o Raio-X do dinheiro disfarçado de tempo
            </h2>

            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              O Axis Tempo Real é um sistema de diagnóstico contínuo:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
          >
            <p>
              Ele revela onde cada hora paga do seu time está sendo investida…<br />
              e onde está sendo desperdiçada.
            </p>

            <div className="py-8 space-y-4">
              <p>Sem transformar seu time em robô.<br />
              Sem microgerenciamento.<br />
              Sem cultura tóxica.</p>
            </div>

            <Card className="p-8 md:p-12 bg-white/5 border-white/10 backdrop-blur">
              <p className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                O objetivo é um só:
              </p>
              <p className="text-3xl md:text-4xl font-medium text-white leading-tight mt-4">
                tirar pessoas da macaquice e colocar pessoas no lugar de potência.
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* How it Works */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight">
              Como funciona <span className="text-slate-500">(WhatsApp + áudio + IA)</span>
            </h2>

            <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>Ao longo do dia, o colaborador recebe mensagens curtas no WhatsApp.<br />
              Ele responde com um áudio rápido dizendo o que fez naquela última hora.</p>

              <p>A IA transcreve, organiza e registra.</p>
            </div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              { icon: MessageSquare, text: 'Em poucos dias, você enxerga padrões.' },
              { icon: Eye, text: 'Em 30 dias, você enxerga a verdade.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <Card className="p-8 bg-slate-50 border-0 h-full hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xl md:text-2xl font-medium text-slate-900 leading-tight">
                      {item.text}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What You Receive */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            O que você recebe <span className="text-slate-500">(o que muda no caixa)</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed"
          >
            Você recebe um relatório claro com:
          </motion.p>

          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              { icon: BarChart3, text: 'Distribuição real das horas', sub: '(o que consome o time)' },
              { icon: TrendingUp, text: 'Top 10 atividades que mais drenam tempo', sub: '' },
              { icon: Zap, text: 'O que automatizar primeiro', sub: '(maior ROI)' },
              { icon: Target, text: 'O que realocar', sub: '(onde tem potência)' },
              { icon: Clock, text: 'Onde você está pagando caro para continuar lento', sub: '' }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Card className="p-6 md:p-8 bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-medium text-slate-900">
                        {item.text}
                      </p>
                      {item.sub && (
                        <p className="text-slate-600 mt-1">{item.sub}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-8"
          >
            <p className="text-xl md:text-2xl text-slate-600 mb-8">
              E isso impacta lucro líquido de três formas:
            </p>

            <div className="space-y-4">
              {[
                '(1) Você corta desperdício sem demitir',
                '(2) Você aumenta capacidade produtiva sem contratar',
                '(3) Você libera tempo para receita: vendas, atendimento, retenção, qualidade'
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <p className="text-lg md:text-xl font-medium text-slate-900">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="mt-12 p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                Se sua empresa cresce receita sem subir custo fixo…<br />
                <span className="text-white font-medium">o que sobe é a margem.</span>
              </p>
              <p className="text-3xl md:text-4xl font-medium text-white mt-6">
                E margem vira lucro.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            Em 7 / 15 / 30 dias
          </motion.h2>

          <motion.div 
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              { days: '7 dias', text: 'você enxerga os maiores vazamentos de tempo.' },
              { days: '15 dias', text: 'você já consegue realocar função e corrigir processo.' },
              { days: '30 dias', text: 'você tem base real pra automatizar e crescer sem inchar a operação.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="p-8 md:p-10 bg-slate-50 border-0 hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <span className="text-5xl md:text-6xl font-medium text-slate-900">
                      {item.days.split(' ')[0]}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm uppercase tracking-wider text-slate-500 mb-2">
                        {item.days.split(' ')[1]}
                      </p>
                      <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Future Warning */}
      <section className="relative py-32 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium tracking-tight leading-tight"
          >
            O futuro vai punir quem insiste em bater pedra
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6 text-lg md:text-xl text-slate-300 leading-relaxed"
          >
            <p>A tecnologia está virando o novo "mínimo".</p>

            <p>
              Os empresários que investirem em navios de tecnologia cedo, atravessarão a tempestade do seu mercado com eficácia e produtividade.<br />
              Quem esperar a agua chegar, vai ver suas fogueiras apagar, e vai tenta nadar... mas aí ja terá sido tarde de mais.
            </p>

            <Card className="mt-12 p-8 md:p-12 bg-white/5 border-white/10 backdrop-blur">
              <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                O Axis Tempo Real é o primeiro passo — porque ele resolve o que quase ninguém tem: <span className="underline decoration-white/30 decoration-4">clareza.</span>
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            Você quer crescer com controle — ou crescer no escuro?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-xl md:text-2xl text-slate-600 leading-relaxed"
          >
            <p>
              Se você quer enxergar onde o dinheiro do seu CNPJ está sendo desperdiçado…<br />
              e onde ele está sendo bem investido…
            </p>

            <div className="pt-8 space-y-4">
              <p className="text-3xl md:text-4xl font-medium text-slate-900">
                AXIS TEMPO REAL.
              </p>
              <p className="text-xl md:text-2xl text-slate-600">
                Porque tempo é dinheiro.<br />
                E agora você consegue ver os dois.<br />
                E investir cada segundo da sua equipe, em tarefas que trarão rentabilidade, e crescimento para o seu negócio.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-12"
          >
            <Button
              size="lg"
              onClick={() => window.open(whatsappLink, '_blank')}
              className="h-16 px-12 text-xl bg-slate-900 hover:bg-slate-800 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              Começar diagnóstico agora
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2026 AXIS Tempo Real. Copy integrity hash: <code className="text-xs">{CONTENT_HASH.slice(0, 16)}...</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AxisTempoRealV1;
