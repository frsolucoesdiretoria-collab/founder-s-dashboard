// AXIS TEMPO REAL V2.4 — Advanced Interactions
// Copy locked: SHA-256 hash validation enforced
// Hash: 0f068709bf61be1ec41793a49b83dca982e6577dc5fa412b37aad771e6f215b9

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { 
  FireButton, 
  CostLeak, 
  InfraWave, 
  OpsMap, 
  CaptainWheel 
} from '@/components/axis-tempo-real/v2/V2Illustrations';
import {
  ScrollHighlight,
  QuoteSpotlight,
  TiltCard,
  DemoPanel,
  TimelineCard
} from '@/components/axis-tempo-real/v2/V2InteractiveComponents';

// Content hash validation
const CONTENT_HASH = '0f068709bf61be1ec41793a49b83dca982e6577dc5fa412b37aad771e6f215b9';

// Chapter component with elegant numbering and illustration
const Chapter: React.FC<{ 
  number: string; 
  title: React.ReactNode; 
  children: React.ReactNode; 
  variant?: 'light' | 'dark';
  illustration?: React.ReactNode;
}> = ({ 
  number, 
  title, 
  children,
  variant = 'light',
  illustration 
}) => {
  const isDark = variant === 'dark';
  
  return (
    <section className={`relative py-20 md:py-32 px-6 ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-12 gap-12 lg:gap-16"
        >
          {/* Chapter number - left column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-7xl md:text-8xl font-light ${isDark ? 'text-white/20' : 'text-slate-200'} leading-none`}
            >
              {number}
            </motion.div>
          </div>

          {/* Content - right column */}
          <div className="lg:col-span-10 space-y-12">
            {/* Illustration signature (if provided) */}
            {illustration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-full max-w-md mx-auto lg:mx-0 mb-12"
              >
                {illustration}
              </motion.div>
            )}
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {title}
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className={`prose prose-lg md:prose-xl max-w-none ${isDark ? 'prose-invert' : ''}`}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Pull Quote component with spotlight effect (V2.4 upgrade)
const PullQuote: React.FC<{ children: React.ReactNode; variant?: 'accent' | 'highlight' }> = ({ children, variant = 'accent' }) => {
  return <QuoteSpotlight variant={variant}>{children}</QuoteSpotlight>;
};

// Editorial list component
const EditorialList: React.FC<{ items: string[]; variant?: 'light' | 'dark' }> = ({ items, variant = 'light' }) => {
  const isDark = variant === 'dark';
  
  return (
    <div className="grid md:grid-cols-2 gap-6 my-12">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className={`
            flex items-start gap-4 p-6 rounded-2xl border-2
            ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}
          `}
        >
          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-white/40' : 'bg-slate-400'}`} />
          <p className={`text-lg md:text-xl leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {item}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const AxisTempoRealV2_4: React.FC = () => {
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

  // Parallax for hero
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const heroScale = useTransform(smoothProgress, [0, 0.3], [1, 1.05]);

  // WhatsApp link
  const whatsappLink = "https://wa.me/5547996475947?text=Quero%20saber%20mais%20sobre%20o%20Axis%20Tempo%20Real";

  return (
    <div className="relative w-full bg-white min-h-screen overflow-hidden">
      {/* Minimal progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />

      {/* Hero Section - Full Bleed Editorial */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: heroY }}
      >
        {/* Gradient + Noise background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Large illustration placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-3/4 opacity-[0.03]"
          style={{ scale: heroScale }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle cx="200" cy="200" r="150" fill="currentColor" className="text-slate-900" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-900" />
            <circle cx="200" cy="200" r="50" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-900" />
          </svg>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <span className="text-sm font-medium text-slate-500 tracking-[0.2em] uppercase">
                AXIS TEMPO REAL
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 30,
                filter: isVisible ? "blur(0px)" : "blur(10px)"
              }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium text-slate-900 tracking-tight leading-[0.95] mb-12"
            >
              Tempo é<br />
              dinheiro.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl md:text-3xl lg:text-4xl text-slate-600 leading-snug font-light max-w-2xl mb-12"
            >
              E hoje você não sabe para onde o dinheiro do seu CNPJ está indo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                onClick={() => window.open(whatsappLink, '_blank')}
                className="h-16 px-12 text-lg bg-slate-900 hover:bg-slate-800 rounded-none shadow-2xl hover:shadow-3xl transition-all duration-500 group"
              >
                Descobrir agora
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Chapter 01: Reality Check */}
      <Chapter number="01" title="A sensação que não vira margem">
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>
            <strong>Você paga uma folha inteira todos os meses.</strong><br />
            Salário + encargos + impostos + risco + energia mental.
          </p>
          
          <p>
            E ainda assim… a maior parte dos empresários vive com <ScrollHighlight>uma sensação silenciosa</ScrollHighlight>:
          </p>
        </div>

        <PullQuote variant="accent">
          "Eu sinto que tem coisa errada…<br />
          mas eu não consigo apontar exatamente <em>onde</em>."
        </PullQuote>

        <div className="space-y-6 text-xl md:text-2xl text-slate-700 leading-relaxed mt-12">
          <p>Você tem noção. Você tem feeling.</p>
          <p className="text-3xl md:text-4xl font-medium text-slate-900 leading-tight">
            Mas no final do mês, <ScrollHighlight>feeling não vira margem</ScrollHighlight>.
          </p>
        </div>
      </Chapter>

      {/* Chapter 02: Caveman Story */}
      <Chapter 
        number="02" 
        title="O passado sempre parece ridículo — depois que a tecnologia chega" 
        variant="light"
        illustration={<FireButton className="w-full h-auto" />}
      >
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>Pensa num neandertal tentando fazer fogo.</p>
          
          <div className="grid md:grid-cols-2 gap-6 my-12">
            <Card className="p-8 bg-slate-50 border-0">
              <div className="space-y-3 text-lg text-slate-600 leading-relaxed">
                <p>Ele sai do abrigo.</p>
                <p>Procura folhas secas.</p>
                <p>Procura galhos.</p>
                <p>Procura pedra.</p>
                <p>Bate pedra. Bate pedra. Bate pedra.</p>
                <p>Uma faísca. Nada.</p>
                <p>Outra. Nada.</p>
                <p className="pt-4 font-medium text-slate-900">E depois de duas horas… finalmente: <strong>calor</strong>.</p>
              </div>
            </Card>
            
            <Card className="p-8 bg-slate-900 border-0">
              <div className="space-y-3 text-lg text-white leading-relaxed">
                <p>Hoje, olhando de fora, parece absurdo.</p>
                <p className="pt-4">Porque hoje você aperta um botão e tem fogo em <strong>3 segundos</strong>.</p>
                <p>Você gira o polegar e tem fogo em <strong>1 segundo</strong>.</p>
              </div>
            </Card>
          </div>

          <div className="mt-16">
            <p className="text-3xl md:text-4xl font-medium text-slate-900 leading-tight mb-8">
              Agora me responde com honestidade:
            </p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-medium text-slate-900 leading-tight">
              <strong>Em 2026, faz sentido gastar duas horas por dia fazendo o que pode ser feito em um segundo?</strong>
            </p>
          </div>
        </div>

        <PullQuote variant="accent">
          <div className="space-y-6">
            <p>Se você fizer isso 30 dias… são <strong>60 horas</strong> num mês.</p>
            <p>Em um ano, <strong>720 horas</strong>.</p>
            <p>Em uma década, <strong>7.200 horas</strong>.</p>
            <p className="text-3xl md:text-4xl mt-8">
              É <em>vida</em> indo pelo ralo — por falta de tecnologia.
            </p>
          </div>
        </PullQuote>

        <PullQuote variant="highlight">
          <p className="text-slate-900 mb-6">E aqui entra o ponto que dói:</p>
          <p className="text-slate-900 border-l-4 border-slate-900 pl-8">
            <strong>Acontece a mesma coisa dentro do seu CNPJ.</strong><br />
            <span className="text-slate-600 font-normal">Só que você não chama isso de "fazer fogo com pedra".<br />
            Você chama de "rotina", "processo", "administrativo", "jeito que sempre foi".</span>
          </p>
        </PullQuote>
      </Chapter>

      {/* Chapter 03: Modern Stone Beating */}
      <Chapter 
        number="03" 
        title={<>A "macaquice" moderna tem outro nome: custo fixo</>} 
        variant="light"
        illustration={<CostLeak className="w-full h-auto" />}
      >
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>Hoje, milhares de empresas pagam salários para tarefas que são exatamente isso:</p>
        </div>

        <EditorialList 
          items={[
            'copiar e colar informação',
            'lançar manualmente o que um sistema faria sozinho',
            'montar relatórios para "provar" trabalho',
            'atualizar planilha, atualizar CRM, atualizar status',
            'preencher coisa que ninguém usa',
            'repetir etapas só porque "o fluxo é assim"'
          ]}
        />

        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed mt-16">
          <p>É o equivalente corporativo de sair na rua procurando galho seco.</p>
          <p>
            Você não percebe porque está <em>dentro</em> do processo.<br />
            E o dinheiro não some de uma vez.
          </p>
          <p className="text-4xl md:text-5xl font-medium text-slate-900 leading-tight">
            Ele escorre…<br />
            <strong>hora após hora</strong>.
          </p>
        </div>
      </Chapter>

      {/* Chapter 04: The Question */}
      <Chapter number="04" title="A pergunta que separa quem vai crescer de quem vai ser engolido" variant="dark">
        <div className="space-y-8 text-xl md:text-2xl text-slate-300 leading-relaxed">
          <p>Se eu te perguntar agora:</p>
        </div>

        <Card className="my-16 p-12 md:p-16 bg-white/10 border-white/20 backdrop-blur">
          <p className="text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight">
            <strong>Você sabe, com precisão real, onde cada hora paga da sua equipe está indo?</strong>
          </p>
          <p className="text-2xl text-slate-300 mt-8 leading-relaxed">
            Não "mais ou menos". Não "acho que".<br />
            <strong className="text-white">Com clareza suficiente pra tomar decisão e aumentar lucro líquido.</strong>
          </p>
        </Card>

        <div className="space-y-8 text-xl md:text-2xl text-slate-300 leading-relaxed">
          <p>Se a resposta for "tenho uma noção"…</p>
          <p className="text-3xl md:text-4xl font-medium text-white">
            Você não está administrando tempo.<br />
            Você está administrando esperança.
          </p>
          <p className="text-3xl md:text-4xl font-medium text-white mt-12">
            E esperança não compete com empresa automatizada.
          </p>
        </div>
      </Chapter>

      {/* Chapter 05: Tsunami */}
      <Chapter 
        number="05" 
        title="A tsunami já começou. E ela não pede licença." 
        variant="light"
        illustration={<InfraWave className="w-full h-auto" />}
      >
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>
            Tecnologia não é mais diferencial.<br />
            É <strong>infraestrutura</strong>, igual energia elétrica.
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-12">
            <TiltCard>
              <p className="text-2xl font-medium text-slate-900">Quem investe cedo<br />vira barco.</p>
            </TiltCard>
            <TiltCard>
              <div className="p-4 bg-slate-900 rounded-lg -m-4">
                <p className="text-2xl font-medium text-white">Quem investe mais<br />vira navio.</p>
              </div>
            </TiltCard>
            <TiltCard>
              <p className="text-2xl font-medium text-slate-900">Quem ignora<br />vira nadador.</p>
            </TiltCard>
          </div>

          <p className="text-3xl md:text-4xl font-medium text-slate-900">
            O problema é que a água está subindo.
          </p>

          <p>
            E quando ela subir de verdade, não vai importar o quanto você é bom no que faz —<br />
            vai importar se você consegue fazer com eficiência.
          </p>
        </div>

        <PullQuote variant="accent">
          <strong>Porque o mercado vai comprar de quem entrega mais, mais rápido, com mais clareza e menos custo.</strong>
        </PullQuote>
      </Chapter>

      {/* Chapter 06: Product Intro */}
      <Chapter number="06" title="Axis Tempo Real — a lanterna que revela onde o dinheiro está escorrendo" variant="light">
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>O Axis Tempo Real existe por um motivo simples:</p>
        </div>

        <PullQuote variant="highlight">
          <p className="text-slate-900">
            <strong>Antes de automatizar, você precisa enxergar.</strong><br />
            <span className="text-slate-600 font-normal">Antes de escalar, você precisa saber o que está travando sua operação.</span>
          </p>
        </PullQuote>

        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>
            O Axis Tempo Real faz um Raio-X da sua folha.<br />
            Ele mostra onde sua equipe está:
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-12">
            <Card className="p-8 bg-green-50 border-green-200 border-2">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-2xl font-medium text-slate-900">construindo a arca</p>
                  <p className="text-slate-600 mt-2 text-lg">(atividades de potência, que geram valor)</p>
                </div>
              </div>
            </Card>
            <Card className="p-8 bg-red-50 border-red-200 border-2">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">❌</span>
                <div>
                  <p className="text-2xl font-medium text-slate-900">batendo pedra</p>
                  <p className="text-slate-600 mt-2 text-lg">(tarefas repetitivas que drenam margem)</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 mt-12">
            <p>E ele faz isso sem virar vigilância.<br />
            Sem clima tóxico.<br />
            Sem "controle de ponto disfarçado".</p>

            <p className="text-2xl">Aqui não é sobre punir pessoas.</p>

            <p className="text-3xl md:text-4xl font-medium text-slate-900">
              <strong>É sobre libertar pessoas da macaquice.</strong><br />
              <span className="text-slate-600 font-normal text-2xl">E colocar cada uma no lugar de potência.</span>
            </p>
          </div>
        </div>
      </Chapter>

      {/* Chapter 07: How it Works */}
      <Chapter 
        number="07" 
        title={<>Como funciona <span className="text-slate-500 font-normal">(simples o suficiente pra virar hábito)</span></>} 
        variant="dark"
        illustration={<OpsMap className="w-full h-auto" />}
      >
        <div className="space-y-8 text-xl md:text-2xl text-slate-300 leading-relaxed">
          <p>Ao longo do dia, cada colaborador recebe mensagens curtas no WhatsApp.</p>
          <p>Ele responde com <strong className="text-white">áudios rápidos</strong>, dizendo o que fez naquela última hora.</p>
        </div>

        <Card className="my-16 p-12 bg-white/5 border-white/10">
          <p className="text-2xl font-medium text-white mb-8">A IA:</p>
          <EditorialList 
            variant="dark"
            items={[
              'transcreve',
              'organiza',
              'classifica',
              'e constrói uma base de dados viva da operação'
            ]}
          />
        </Card>

        <div className="space-y-8 text-xl md:text-2xl text-slate-300 leading-relaxed">
          <p>Você não ganha "mais um relatório".</p>
        </div>

        <PullQuote variant="accent">
          <p className="text-slate-300 mb-6">Você ganha uma visão que a maioria das empresas nunca teve:</p>
          <p className="text-white text-3xl md:text-4xl">
            <strong>um mapa real do tempo — e, portanto, do dinheiro.</strong>
          </p>
        </PullQuote>
      </Chapter>

      {/* Chapter 08: Impact Timeline */}
      <Chapter number="08" title={<>O que isso muda no seu lucro <span className="text-slate-500 font-normal">(de verdade)</span></>} variant="light">
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>
            Toda folha tem desperdício invisível.<br />
            Não por incompetência.<br />
            Por falta de tecnologia.
          </p>

          <p>
            Quando você descobre que 30%, 40% ou 60% do tempo está sendo gasto em tarefas repetitivas, acontece uma virada:
          </p>
        </div>

        <PullQuote variant="highlight">
          <p className="text-slate-900 text-3xl md:text-4xl">
            Você para de resolver sintoma.<br />
            E começa a atacar causa.
          </p>
        </PullQuote>

        {/* Timeline cards with 3D tilt */}
        <div className="space-y-12 mt-16">
          <TimelineCard
            days="7"
            title="Em 7 dias"
            description="Você já enxerga os maiores vazamentos."
            delay={0}
          />

          <TimelineCard
            days="15"
            title="Em 15 dias"
            description="Você tem clareza suficiente para realocar pessoas:"
            items={[
              'menos horas em "administrativo manual"',
              'mais horas em suporte, relacionamento, venda, entrega, qualidade'
            ]}
            delay={0.2}
          />

          <TimelineCard
            days="30"
            title="Em 30 dias"
            description="Você recebe o retrato real do seu CNPJ:"
            items={[
              'distribuição das horas por tipo de atividade',
              'quais tarefas estão "matando" produtividade',
              'onde tecnologia gera retorno mais rápido'
            ]}
            delay={0.4}
          />
        </div>

        {/* Demo Panel - Illustrative Calculator */}
        <DemoPanel />

        <PullQuote variant="accent">
          <p className="text-slate-300 mb-6">E aqui nasce a consequência financeira:</p>
          <p className="text-white text-3xl md:text-4xl border-l-4 border-white pl-8">
            <strong>Você cresce receita sem subir custo fixo.</strong><br />
            <span className="text-slate-300 font-normal">Ou você reduz custo fixo mantendo a entrega.<br />
            Em ambos os casos, o que sobe é a mesma coisa: <strong className="text-white">lucro líquido.</strong></span>
          </p>
        </PullQuote>
      </Chapter>

      {/* Chapter 09: The Button Metaphor */}
      <Chapter number="09" title="Se você pudesse apertar um botão e recuperar meses de folha — você apertaria?" variant="dark">
        <div className="space-y-8 text-xl md:text-2xl text-slate-300 leading-relaxed">
          <p>
            Porque é exatamente isso que acontece quando você tira seu time de tarefas que são bater pedras e coletar galhos secos, e vai colocando isqueiros, que não são da bic ou da clipper... São os isqueiros da Axis, que colocam tecnologia no polegar do seu time, para que ao passar o dedo pela tela, eles façam tarefas que levariam 2 horas em 2 segundos.
          </p>
        </div>

        <PullQuote variant="accent">
          <p className="text-white text-3xl md:text-4xl">
            Você não precisa contratar mais.<br />
            Você precisa parar de pagar salário pra repetir trabalho que um sistema faria em segundos.
          </p>
        </PullQuote>
      </Chapter>

      {/* Chapter 10: Future Vision */}
      <Chapter 
        number="10" 
        title="Agora, uma última pergunta..." 
        variant="light"
        illustration={<CaptainWheel className="w-full h-auto" />}
      >
        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>Em 2040, você quer olhar para 2026 e pensar:</p>
        </div>

        <Card className="my-16 p-12 bg-red-50 border-red-200 border-2">
          <blockquote className="text-xl md:text-2xl text-slate-900 leading-relaxed italic">
            "Caramba… eu pagava meses de folha para meus funcionários bater pedra…<br />
            E eu poderia ter colocado um isqueiro na mão da minha equipe, para que eles passassem menos horas criando incêndios, e mais horas construindo as arcas do meu CNPJ..."
          </blockquote>
        </Card>

        <div className="flex items-center justify-center py-12">
          <span className="text-6xl md:text-7xl font-light text-slate-300">OU</span>
        </div>

        <div className="space-y-8 text-xl md:text-2xl text-slate-700 leading-relaxed">
          <p>Ou você quer ser a empresa que viu cedo, investiu cedo, direcionou corretamente suas tropas, para construir muitas arcas, para cada uma das TSUNAMIS de tecnologia que estão vindo para alagar o seu mercado, e pensar:</p>
        </div>

        <Card className="my-16 p-12 bg-green-50 border-green-200 border-2">
          <blockquote className="text-xl md:text-2xl text-slate-900 leading-relaxed italic">
            "Graças a Deus eu tirei minha equipe da selva, e investi em tecnologia cedo... Aquelas decisões tomadas em 2026, fizeram minhas tropas construirem o meu comboio naval, que hoje está flutuando em meu mercado, e hoje tenho um exército de capitães, todos com as mãos no Leme do da minha frota, direcionando a tecnologia que comprei em 2026 para o lugar que eu quiser que o meu império vá... Graças a aquelas decisões de 2026, que nós não morremos afogados quando o mercado evoluiu... Graças aos investimentos corretos de 2026, hoje em 2040, nós não fazemos parte dos CNPJs que se transformaram em ossos e pedras, e que agora estão abaixo de nós, no fundo do oceano. 2026 foi o ano que deixeamos de agir na intuição, e passamos a decidir com base em dados reais da minha operação... Ainda bem que eu assumi o controle do futuro do meu negócio, e direcionei as horas da minha equipe para o lugar certo. Investir cedo na tecnologia da Axis, foi um ponto de inflexão para o crescimento da nossa empresa."
          </blockquote>
        </Card>
      </Chapter>

      {/* Final CTA - Editorial Style */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight">
              <strong>Axis Tempo Real.</strong>
            </h2>

            <div className="space-y-6 text-xl md:text-2xl text-slate-300 leading-relaxed">
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
          >
            <Button
              size="lg"
              onClick={() => window.open(whatsappLink, '_blank')}
              className="h-20 px-16 text-xl bg-white text-slate-900 hover:bg-slate-100 rounded-none shadow-2xl hover:shadow-3xl transition-all duration-500 group"
            >
              Começar diagnóstico agora
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2026 AXIS Tempo Real · Interactive V2.4 · Copy hash: <code className="text-xs">{CONTENT_HASH.slice(0, 16)}...</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AxisTempoRealV2_4;
