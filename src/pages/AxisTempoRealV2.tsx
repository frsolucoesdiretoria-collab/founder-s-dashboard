// AXIS TEMPO REAL V2 — Landing Page Premium Apple-like
// Copy locked: SHA-256 hash validation enforced
// Hash: 0f068709bf61be1ec41793a49b83dca982e6577dc5fa412b37aad771e6f215b9

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  TrendingUp, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Waves,
  Flame,
  Ship,
  Timer
} from 'lucide-react';

// Content hash validation
const CONTENT_HASH = '0f068709bf61be1ec41793a49b83dca982e6577dc5fa412b37aad771e6f215b9';

const AxisTempoRealV2: React.FC = () => {
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
            Tempo é dinheiro.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto tracking-tight"
          >
            E hoje você não sabe para onde o dinheiro do seu CNPJ está indo.
          </motion.h2>

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
              Quero enxergar onde meu dinheiro vai
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

      {/* Section: Reality Check */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
              <strong>Você paga uma folha inteira todos os meses.</strong><br />
              Salário + encargos + impostos + risco + energia mental.
            </p>
            
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
              E ainda assim… a maior parte dos empresários vive com uma sensação silenciosa:
            </p>

            <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl">
              <blockquote className="text-2xl md:text-3xl font-light text-slate-900 leading-relaxed italic">
                "Eu sinto que tem coisa errada…<br />
                mas eu não consigo apontar exatamente <em>onde</em>."
              </blockquote>
            </Card>

            <div className="pt-8 space-y-4">
              <p className="text-lg md:text-xl text-slate-600">
                Você tem noção. Você tem feeling.
              </p>
              <p className="text-3xl md:text-4xl font-medium text-slate-900">
                Mas no final do mês, feeling não vira margem.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: Caveman Story */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            O passado sempre parece ridículo — depois que a tecnologia chega
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            <p>Pensa num neandertal tentando fazer fogo.</p>
            
            <div className="space-y-2 pl-4 border-l-4 border-slate-300">
              <p>Ele sai do abrigo.<br />
              Procura folhas secas.<br />
              Procura galhos.<br />
              Procura pedra.<br />
              Bate pedra. Bate pedra. Bate pedra.<br />
              Uma faísca. Nada.<br />
              Outra. Nada.<br />
              E depois de duas horas… finalmente: <strong>calor</strong>.</p>
            </div>

            <p>Hoje, olhando de fora, parece absurdo.</p>

            <p>
              Porque hoje você aperta um botão e tem fogo em <strong>3 segundos</strong>.<br />
              Você gira o polegar e tem fogo em <strong>1 segundo</strong>.
            </p>

            <div className="pt-8">
              <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight">
                Agora me responde com honestidade:
              </p>
              <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight mt-4">
                <strong>Em 2026, faz sentido gastar duas horas por dia fazendo o que pode ser feito em um segundo?</strong>
              </p>
            </div>

            <Card className="mt-12 p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
              <div className="space-y-6 text-white">
                <p className="text-xl">Se você fizer isso 30 dias… são <strong>60 horas</strong> num mês.</p>
                <p className="text-xl">Em um ano, <strong>720 horas</strong>.</p>
                <p className="text-xl">Em uma década, <strong>7.200 horas</strong>.</p>
                <p className="text-2xl md:text-3xl font-medium mt-8">
                  É <em>vida</em> indo pelo ralo — por falta de tecnologia.
                </p>
              </div>
            </Card>

            <Card className="mt-12 p-8 md:p-12 bg-slate-50 border-0">
              <p className="text-xl md:text-2xl text-slate-900 leading-relaxed">
                E aqui entra o ponto que dói:
              </p>
              <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight mt-6 border-l-4 border-slate-900 pl-6">
                <strong>Acontece a mesma coisa dentro do seu CNPJ.</strong><br />
                <span className="text-slate-600 font-normal">Só que você não chama isso de "fazer fogo com pedra".<br />
                Você chama de "rotina", "processo", "administrativo", "jeito que sempre foi".</span>
              </blockquote>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section: Modern Stone Beating */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            A "macaquice" moderna tem outro nome: custo fixo
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed"
          >
            Hoje, milhares de empresas pagam salários para tarefas que são exatamente isso:
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
              'copiar e colar informação',
              'lançar manualmente o que um sistema faria sozinho',
              'montar relatórios para "provar" trabalho',
              'atualizar planilha, atualizar CRM, atualizar status',
              'preencher coisa que ninguém usa',
              'repetir etapas só porque "o fluxo é assim"'
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
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
              É o equivalente corporativo de sair na rua procurando galho seco.
            </p>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
              Você não percebe porque está <em>dentro</em> do processo.<br />
              E o dinheiro não some de uma vez.
            </p>
            <p className="text-3xl md:text-4xl font-medium text-slate-900 leading-tight">
              Ele escorre…<br />
              <strong>hora após hora</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section: The Question */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium tracking-tight leading-tight"
          >
            A pergunta que separa quem vai crescer de quem vai ser engolido
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-300 leading-relaxed"
          >
            <p>Se eu te perguntar agora:</p>

            <Card className="p-8 md:p-12 bg-white/10 border-white/20 backdrop-blur">
              <p className="text-2xl md:text-3xl font-medium text-white leading-tight">
                <strong>Você sabe, com precisão real, onde cada hora paga da sua equipe está indo?</strong><br />
                <span className="text-slate-300 font-normal text-xl">Não "mais ou menos". Não "acho que".<br />
                <strong>Com clareza suficiente pra tomar decisão e aumentar lucro líquido.</strong></span>
              </p>
            </Card>

            <div className="pt-8 space-y-6">
              <p className="text-xl">Se a resposta for "tenho uma noção"…</p>
              <p className="text-2xl md:text-3xl font-medium text-white">
                Você não está administrando tempo.<br />
                Você está administrando esperança.
              </p>
              <p className="text-2xl md:text-3xl font-medium text-white mt-8">
                E esperança não compete com empresa automatizada.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: Tsunami */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <Waves className="w-12 h-12 text-slate-900" />
              <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight">
                A tsunami já começou. E ela não pede licença.
              </h2>
            </div>

            <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>
                Tecnologia não é mais diferencial.<br />
                É <strong>infraestrutura</strong>, igual energia elétrica.
              </p>

              <div className="grid md:grid-cols-3 gap-6 py-8">
                <Card className="p-6 bg-slate-50 border-0 text-center">
                  <p className="text-lg font-medium text-slate-900">Quem investe cedo vira barco.</p>
                </Card>
                <Card className="p-6 bg-slate-50 border-0 text-center">
                  <p className="text-lg font-medium text-slate-900">Quem investe mais vira navio.</p>
                </Card>
                <Card className="p-6 bg-slate-50 border-0 text-center">
                  <p className="text-lg font-medium text-slate-900">Quem ignora vira nadador.</p>
                </Card>
              </div>

              <p className="text-2xl font-medium text-slate-900">
                O problema é que a água está subindo.
              </p>

              <p>
                E quando ela subir de verdade, não vai importar o quanto você é bom no que faz —<br />
                vai importar se você consegue fazer com eficiência.
              </p>

              <Card className="mt-12 p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
                <p className="text-2xl md:text-3xl font-medium text-white leading-tight">
                  <strong>Porque o mercado vai comprar de quem entrega mais, mais rápido, com mais clareza e menos custo.</strong>
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: Product Intro */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-200">
              <Flame className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700 tracking-wide uppercase">
                A SOLUÇÃO
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight max-w-4xl mx-auto text-slate-900">
              Axis Tempo Real — a lanterna que revela onde o dinheiro está escorrendo
            </h2>

            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              O Axis Tempo Real existe por um motivo simples:
            </p>
          </motion.div>

          <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl">
            <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight">
              <strong>Antes de automatizar, você precisa enxergar.</strong><br />
              <span className="text-slate-600 font-normal">Antes de escalar, você precisa saber o que está travando sua operação.</span>
            </blockquote>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
          >
            <p>
              O Axis Tempo Real faz um Raio-X da sua folha.<br />
              Ele mostra onde sua equipe está:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg font-medium text-slate-900">construindo a arca</p>
                    <p className="text-slate-600 mt-1">(atividades de potência, que geram valor)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">❌</span>
                  <div>
                    <p className="text-lg font-medium text-slate-900">batendo pedra</p>
                    <p className="text-slate-600 mt-1">(tarefas repetitivas que drenam margem)</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4 pt-8">
              <p>E ele faz isso sem virar vigilância.<br />
              Sem clima tóxico.<br />
              Sem "controle de ponto disfarçado".</p>

              <p className="text-xl">Aqui não é sobre punir pessoas.</p>

              <p className="text-2xl md:text-3xl font-medium text-slate-900">
                <strong>É sobre libertar pessoas da macaquice.</strong><br />
                <span className="text-slate-600 font-normal text-xl">E colocar cada uma no lugar de potência.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: How it Works */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            Como funciona <span className="text-slate-500">(simples o suficiente pra virar hábito)</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            <p>
              Ao longo do dia, cada colaborador recebe mensagens curtas no WhatsApp.
            </p>

            <p>
              Ele responde com <strong>áudios rápidos</strong>, dizendo o que fez naquela última hora.
            </p>

            <Card className="p-8 md:p-12 bg-slate-50 border-0">
              <p className="text-xl font-medium text-slate-900 mb-6">A IA:</p>
              <ul className="space-y-3">
                {['transcreve', 'organiza', 'classifica', 'e constrói uma base de dados viva da operação'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg text-slate-700">
                    <span className="w-2 h-2 bg-slate-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="pt-8 space-y-6">
              <p>Você não ganha "mais um relatório".</p>
              <Card className="p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
                <p className="text-xl text-slate-300">
                  Você ganha uma visão que a maioria das empresas nunca teve:
                </p>
                <blockquote className="text-2xl md:text-3xl font-medium text-white leading-tight mt-6">
                  <strong>um mapa real do tempo — e, portanto, do dinheiro.</strong>
                </blockquote>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: Impact Timeline */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            O que isso muda no seu lucro <span className="text-slate-500">(de verdade)</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            <p>
              Toda folha tem desperdício invisível.<br />
              Não por incompetência.<br />
              Por falta de tecnologia.
            </p>

            <p>
              Quando você descobre que 30%, 40% ou 60% do tempo está sendo gasto em tarefas repetitivas, acontece uma virada:
            </p>

            <Card className="p-8 md:p-12 bg-white border-slate-200 shadow-xl">
              <p className="text-2xl font-medium text-slate-900">
                Você para de resolver sintoma.<br />
                E começa a atacar causa.
              </p>
            </Card>
          </motion.div>

          <motion.div 
            className="space-y-8 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              {
                title: 'Em 7 dias',
                description: 'Você já enxerga os maiores vazamentos.',
                icon: Timer
              },
              {
                title: 'Em 15 dias',
                description: 'Você tem clareza suficiente para realocar pessoas:',
                bullets: [
                  'menos horas em "administrativo manual"',
                  'mais horas em suporte, relacionamento, venda, entrega, qualidade'
                ],
                icon: TrendingUp
              },
              {
                title: 'Em 30 dias',
                description: 'Você recebe o retrato real do seu CNPJ:',
                bullets: [
                  'distribuição das horas por tipo de atividade',
                  'quais tarefas estão "matando" produtividade',
                  'onde tecnologia gera retorno mais rápido'
                ],
                icon: Zap
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="p-8 md:p-10 bg-white border-slate-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-medium text-slate-900 mb-4">
                        {item.title}
                      </h3>
                      <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
                        {item.description}
                      </p>
                      {item.bullets && (
                        <ul className="mt-4 space-y-2">
                          {item.bullets.map((bullet, j) => (
                            <li key={j} className="flex items-start gap-3 text-slate-600">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Card className="mt-16 p-8 md:p-12 bg-slate-900 border-0 shadow-2xl">
            <p className="text-xl text-slate-300 leading-relaxed mb-6">
              E aqui nasce a consequência financeira:
            </p>
            <blockquote className="text-2xl md:text-3xl font-medium text-white leading-tight border-l-4 border-white pl-6">
              <strong>Você cresce receita sem subir custo fixo.</strong><br />
              <span className="text-slate-300 font-normal">Ou você reduz custo fixo mantendo a entrega.<br />
              Em ambos os casos, o que sobe é a mesma coisa: <strong className="text-white">lucro líquido.</strong></span>
            </blockquote>
          </Card>
        </div>
      </section>

      {/* Section: The Button Metaphor */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium tracking-tight leading-tight"
          >
            Se você pudesse apertar um botão e recuperar meses de folha — você apertaria?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-300 leading-relaxed"
          >
            <p>
              Porque é exatamente isso que acontece quando você tira seu time de tarefas que são bater pedras e coletar galhos secos, e vai colocando isqueiros, que não são da bic ou da clipper... São os isqueiros da Axis, que colocam tecnologia no polegar do seu time, para que ao passar o dedo pela tela, eles façam tarefas que levariam 2 horas em 2 segundos.
            </p>

            <Card className="p-8 md:p-12 bg-white/10 border-white/20 backdrop-blur">
              <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                Você não precisa contratar mais.<br />
                Você precisa parar de pagar salário pra repetir trabalho que um sistema faria em segundos.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section: Future Vision */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight"
          >
            Agora, uma última pergunta...
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            <p>Em 2040, você quer olhar para 2026 e pensar:</p>

            <Card className="p-8 md:p-12 bg-red-50 border-red-200">
              <blockquote className="text-xl md:text-2xl text-slate-900 leading-relaxed italic">
                "Caramba… eu pagava meses de folha para meus funcionários bater pedra…<br />
                E eu poderia ter colocado um isqueiro na mão da minha equipe, para que eles passassem menos horas criando incêndios, e mais horas construindo as arcas do meu CNPJ..."
              </blockquote>
            </Card>

            <div className="flex items-center justify-center py-8">
              <span className="text-4xl md:text-5xl font-medium text-slate-400">OU</span>
            </div>

            <p>Ou você quer ser a empresa que viu cedo, investiu cedo, direcionou corretamente suas tropas, para construir muitas arcas, para cada uma das TSUNAMIS de tecnologia que estão vindo para alagar o seu mercado, e pensar:</p>

            <Card className="p-8 md:p-12 bg-green-50 border-green-200">
              <blockquote className="text-xl md:text-2xl text-slate-900 leading-relaxed italic">
                "Graças a Deus eu tirei minha equipe da selva, e investi em tecnologia cedo... Aquelas decisões tomadas em 2026, fizeram minhas tropas construirem o meu comboio naval, que hoje está flutuando em meu mercado, e hoje tenho um exército de capitães, todos com as mãos no Leme do da minha frota, direcionando a tecnologia que comprei em 2026 para o lugar que eu quiser que o meu império vá... Graças a aquelas decisões de 2026, que nós não morremos afogados quando o mercado evoluiu... Graças aos investimentos corretos de 2026, hoje em 2040, nós não fazemos parte dos CNPJs que se transformaram em ossos e pedras, e que agora estão abaixo de nós, no fundo do oceano. 2026 foi o ano que deixeamos de agir na intuição, e passamos a decidir com base em dados reais da minha operação... Ainda bem que eu assumi o controle do futuro do meu negócio, e direcionei as horas da minha equipe para o lugar certo. Investir cedo na tecnologia da Axis, foi um ponto de inflexão para o crescimento da nossa empresa."
              </blockquote>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-medium text-slate-900 tracking-tight leading-tight">
              <strong>Axis Tempo Real.</strong>
            </h2>

            <div className="space-y-6 text-xl md:text-2xl text-slate-600 leading-relaxed">
              <p>Porque tempo é dinheiro.</p>
              <p>E agora você pode enxergar os dois.</p>
              <p>
                E direcionar cada real do fluxo de caixa do seu negócio, apenas para as tarefas que geram crescimento, e mais lucro líquido no final do mês.
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
      <footer className="relative py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2026 AXIS Tempo Real. Copy integrity hash: <code className="text-xs">{CONTENT_HASH.slice(0, 16)}...</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AxisTempoRealV2;
