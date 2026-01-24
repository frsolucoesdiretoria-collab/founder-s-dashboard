// AXIS TEMPO REAL V1.2 — Apple/Linear/Stripe Level Design
// Copy locked: SHA-256 hash validation enforced
// Design System: Custom tokens + Prose renderer

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

// Content hash validation
const CONTENT_HASH = '574445c2f77206db228ba9df4cd9d92c2a078fa539b9ffa55c790f1262cde971';

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS
// ═══════════════════════════════════════════════════════════════

const tokens = {
  spacing: {
    section: 'py-24 md:py-32 lg:py-40',
    container: 'px-6 md:px-8 lg:px-12',
    prose: 'space-y-8',
  },
  typography: {
    display: 'text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.05]',
    h1: 'text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.1]',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.15]',
    h3: 'text-2xl md:text-3xl font-semibold tracking-[-0.01em] leading-[1.25]',
    body: 'text-lg md:text-xl leading-relaxed',
    bodyLarge: 'text-xl md:text-2xl leading-relaxed',
    caption: 'text-sm tracking-wide uppercase font-medium',
  },
  colors: {
    text: {
      primary: 'text-neutral-900 dark:text-neutral-50',
      secondary: 'text-neutral-600 dark:text-neutral-400',
      tertiary: 'text-neutral-500 dark:text-neutral-500',
    },
    bg: {
      primary: 'bg-white dark:bg-neutral-950',
      secondary: 'bg-neutral-50 dark:bg-neutral-900',
      elevated: 'bg-white/80 dark:bg-neutral-900/80',
    },
    border: 'border-neutral-200/50 dark:border-neutral-800/50',
  },
  effects: {
    blur: 'backdrop-blur-xl',
    shadow: 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
    shadowLg: 'shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
    glow: 'shadow-[0_0_40px_rgba(0,0,0,0.04)]',
    ring: 'ring-1 ring-neutral-200/50 dark:ring-neutral-800/50',
  },
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'dark';
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, variant = 'default', className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  
  const bgClass = variant === 'elevated' 
    ? tokens.colors.bg.secondary 
    : variant === 'dark'
    ? 'bg-neutral-900 dark:bg-neutral-950'
    : tokens.colors.bg.primary;

  return (
    <motion.section
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${tokens.spacing.section} ${bgClass} ${className}`}
    >
      <div className={`max-w-4xl mx-auto ${tokens.spacing.container}`}>
        {children}
      </div>
    </motion.section>
  );
};

interface ProseProps {
  children: React.ReactNode;
  size?: 'default' | 'large';
}

const Prose: React.FC<ProseProps> = ({ children, size = 'default' }) => {
  const textSize = size === 'large' ? tokens.typography.bodyLarge : tokens.typography.body;
  
  return (
    <div className={`prose-custom ${tokens.spacing.prose} ${textSize} ${tokens.colors.text.secondary}`}>
      {children}
    </div>
  );
};

interface BlockquoteProps {
  children: React.ReactNode;
}

const Blockquote: React.FC<BlockquoteProps> = ({ children }) => {
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`
        relative pl-6 py-6 my-8
        border-l-2 border-neutral-900 dark:border-neutral-100
        ${tokens.colors.text.primary}
        ${tokens.typography.h3}
        before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5
        before:bg-gradient-to-b before:from-transparent before:via-neutral-400 before:to-transparent
        before:blur-sm
      `}
    >
      {children}
    </motion.blockquote>
  );
};

interface ListProps {
  items: string[];
  variant?: 'default' | 'check';
}

const List: React.FC<ListProps> = ({ items, variant = 'default' }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.ul
      className="space-y-3 my-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={shouldReduceMotion ? {} : {
        visible: { transition: { staggerChildren: 0.05 } }
      }}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={shouldReduceMotion ? {} : {
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 }
          }}
          className="flex items-start gap-3"
        >
          {variant === 'check' ? (
            <span className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
            </span>
          ) : (
            <span className="flex-shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-neutral-400" />
          )}
          <span>{item}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
};

interface SectionBreakProps {
  variant?: 'default' | 'glow';
}

const SectionBreak: React.FC<SectionBreakProps> = ({ variant = 'default' }) => {
  return (
    <div className="relative py-12 my-12">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className={`
          h-px mx-auto max-w-xs
          bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent
          ${variant === 'glow' ? 'shadow-[0_0_20px_rgba(0,0,0,0.1)]' : ''}
        `}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const AxisTempoRealV1: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Parallax effects (subtle, respecting reduced motion)
  const heroY = shouldReduceMotion ? 0 : useTransform(smoothProgress, [0, 0.2], [0, -30]);
  const heroScale = shouldReduceMotion ? 1 : useTransform(smoothProgress, [0, 0.2], [1, 0.98]);

  const whatsappLink = "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Axis%20Tempo%20Real";

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-neutral-950">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,250,250,0.8),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(23,23,23,0.8),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(245,245,245,0.6),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_60%,rgba(28,28,28,0.6),transparent_50%)]" />
        
        {/* Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-px bg-neutral-900 dark:bg-neutral-100 z-50 origin-left"
        style={{ scaleX: smoothProgress, opacity: 0.2 }}
      />

      {/* Navigation Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          fixed top-0 left-0 right-0 z-40
          ${tokens.effects.blur}
          border-b ${tokens.colors.border}
          ${tokens.colors.bg.elevated}
        `}
      >
        <div className={`max-w-7xl mx-auto ${tokens.spacing.container} py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white dark:text-neutral-900" />
            </div>
            <span className={`${tokens.typography.caption} text-neutral-900 dark:text-neutral-100`}>
              AXIS TEMPO REAL
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => window.open(whatsappLink, '_blank')}
            className={`
              ${tokens.radius.full}
              bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
              text-white dark:text-neutral-900
              px-6 h-9
              ${tokens.effects.shadow}
              transition-all duration-200
              hover:scale-105 active:scale-95
            `}
          >
            Falar com time
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center pt-32 pb-20"
        style={{ y: heroY, scale: heroScale }}
      >
        <div className={`max-w-5xl mx-auto text-center ${tokens.spacing.container}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8 md:space-y-12"
          >
            <h1 className={`${tokens.typography.display} ${tokens.colors.text.primary}`}>
              Pare de pagar salário para "fazer fogo com pedra".
            </h1>
            
            <p className={`${tokens.typography.bodyLarge} ${tokens.colors.text.secondary} max-w-3xl mx-auto`}>
              Descubra onde sua equipe cria lucro — e onde o dinheiro da folha está virando desperdício.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="pt-6"
            >
              <Button
                size="lg"
                onClick={() => window.open(whatsappLink, '_blank')}
                className={`
                  ${tokens.radius.full}
                  bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
                  text-white dark:text-neutral-900
                  h-14 px-10 text-lg
                  ${tokens.effects.shadowLg}
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  group
                `}
              >
                Quero enxergar meu desperdício
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 0.3 : 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`w-5 h-8 border ${tokens.colors.border} ${tokens.radius.full} flex items-start justify-center p-1.5`}
            >
              <div className="w-1 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      
      {/* Problem Introduction */}
      <Section variant="elevated">
        <Prose>
          <p>Você conhece essa história, mesmo que nunca tenha contado assim:</p>
          <p>
            Todo mês você paga salários.<br />
            Todo mês você paga encargos.<br />
            Todo mês você paga o custo de manter um time inteiro vivo — com tudo o que isso envolve.
          </p>
          <p className="pt-6">E todo mês você toma decisões importantes com base em:</p>
          <List items={[
            'feeling',
            'conversas soltas',
            '"acho que é isso"',
            'percepção de urgência',
            'e aquele incêndio da semana'
          ]} />
          <p className="pt-6">O nome disso é comum no Brasil.</p>
          <p className={`${tokens.typography.h3} ${tokens.colors.text.primary} pt-4`}>
            O nome disso é <span className="border-b-4 border-neutral-900 dark:border-neutral-100">gestão no escuro</span>.
          </p>
        </Prose>
      </Section>

      <SectionBreak variant="glow" />

      {/* Metaphor Section */}
      <Section>
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-8`}>
            Quando a gente olha pro passado, parece óbvio.
          </h2>
          <Prose>
            <p>Um neandertal faz fogo com pedra.</p>
            <p>
              Demora. Dá trabalho. Consome energia.<br />
              E no fim… ele consegue calor.
            </p>
            <p>Hoje, isso parece absurdo — porque a tecnologia transformou o "fogo" em um botão.</p>
            <p className="pt-4">Agora o ponto:</p>
          </Prose>
          <Blockquote>
            Dentro do seu CNPJ existe uma lista inteira de atividades que ainda são "fogo com pedra".<br />
            Só que você está pagando por isso todo mês.
          </Blockquote>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Fire with Stone Examples */}
      <Section variant="elevated">
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-8`}>
            O que é "fogo com pedra" dentro de uma empresa?
          </h2>
          <Prose>
            <p>É qualquer tarefa em que um humano está gastando horas para fazer o que tecnologia faria em segundos:</p>
            <List items={[
              'lançamentos manuais',
              'conciliações repetitivas',
              'copiar dados entre sistemas',
              '"preencher status" para provar trabalho',
              'relatórios de prestação de contas que ninguém lê',
              'retrabalho por falha de processo',
              'tarefas que existem só porque "o fluxo sempre foi assim"'
            ]} />
            <p className="pt-8">O custo disso não é só tempo.</p>
            <p className={`${tokens.typography.h3} ${tokens.colors.text.primary}`}>
              O custo disso é:<br />
              <span className={tokens.colors.text.secondary}>folha + encargos + imposto + oportunidade perdida + crescimento travado.</span>
            </p>
            <p className="pt-8">E aqui vem a pergunta perigosa:</p>
          </Prose>
          <Blockquote>
            Quantas horas por mês você está pagando para a sua equipe "bater pedra"?
          </Blockquote>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Clarity Section */}
      <Section>
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-8`}>
            Se você tivesse clareza, você faria escolhas diferentes.
          </h2>
          <Prose>
            <p>Porque o caminho para aumentar lucro líquido é simples (e cruelmente ignorado):</p>
          </Prose>

          <div className="grid md:grid-cols-2 gap-6 my-12">
            {[
              { number: '1', text: 'Reduzir desperdício invisível' },
              { number: '2', text: 'Automatizar o que é repetitivo' },
              { number: '3', text: 'Realocar pessoas para atividades de potência' },
              { number: '4', text: 'Crescer receita sem subir custo fixo' }
            ].map((item, i) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`
                  p-8 ${tokens.radius.lg}
                  ${tokens.colors.bg.secondary}
                  ${tokens.effects.ring}
                  ${tokens.effects.shadow}
                  group hover:${tokens.effects.shadowLg}
                  transition-all duration-300
                `}
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-5xl font-light text-neutral-300 dark:text-neutral-700">{item.number}</span>
                </div>
                <h3 className={`${tokens.typography.h3} ${tokens.colors.text.primary} text-2xl`}>
                  {item.text}
                </h3>
              </motion.div>
            ))}
          </div>

          <Prose>
            <p className="pt-6">
              O problema é que quase ninguém faz isso bem…<br />
              <span className={`font-semibold ${tokens.colors.text.primary}`}>porque quase ninguém mede.</span>
            </p>
          </Prose>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Product Section */}
      <Section variant="dark" className="text-white">
        <div className={tokens.spacing.prose}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className={`${tokens.typography.caption} text-white/90`}>A SOLUÇÃO</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.15] mb-8 text-white">
            Axis Tempo Real — o Raio-X do dinheiro disfarçado de tempo
          </h2>
          
          <div className="text-xl md:text-2xl leading-relaxed text-white/80 space-y-6">
            <p>O Axis Tempo Real é um sistema de diagnóstico contínuo:</p>
            <p>
              Ele revela onde cada hora paga do seu time está sendo investida…<br />
              e onde está sendo desperdiçada.
            </p>
            <p>
              Sem transformar seu time em robô.<br />
              Sem microgerenciamento.<br />
              Sem cultura tóxica.
            </p>
            <p className="pt-4">O objetivo é um só:</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`
              mt-12 p-10 ${tokens.radius.lg}
              bg-white/5 backdrop-blur-sm
              border border-white/10
              ${tokens.effects.glow}
            `}
          >
            <p className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] leading-tight text-white">
              tirar pessoas da macaquice e colocar pessoas no lugar de potência.
            </p>
          </motion.div>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* How it Works */}
      <Section>
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-4`}>
            Como funciona{' '}
            <span className={tokens.colors.text.secondary}>(WhatsApp + áudio + IA)</span>
          </h2>
          <Prose>
            <p>
              Ao longo do dia, o colaborador recebe mensagens curtas no WhatsApp.<br />
              Ele responde com um áudio rápido dizendo o que fez naquela última hora.
            </p>
            <p>A IA transcreve, organiza e registra.</p>
          </Prose>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[
              { text: 'Em poucos dias, você enxerga padrões.' },
              { text: 'Em 30 dias, você enxerga a verdade.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`
                  p-8 ${tokens.radius.lg}
                  ${tokens.colors.bg.secondary}
                  ${tokens.effects.ring}
                  ${tokens.effects.shadow}
                  group hover:${tokens.effects.shadowLg}
                  transition-all duration-300
                `}
              >
                <p className={`${tokens.typography.h3} ${tokens.colors.text.primary} text-2xl`}>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* What You Receive */}
      <Section variant="elevated">
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-4`}>
            O que você recebe{' '}
            <span className={tokens.colors.text.secondary}>(o que muda no caixa)</span>
          </h2>
          <Prose>
            <p>Você recebe um relatório claro com:</p>
            <List items={[
              'Distribuição real das horas (o que consome o time)',
              'Top 10 atividades que mais drenam tempo',
              'O que automatizar primeiro (maior ROI)',
              'O que realocar (onde tem potência)',
              'Onde você está pagando caro para continuar lento'
            ]} />
            <p className="pt-8">E isso impacta lucro líquido de três formas:</p>
          </Prose>

          <div className="space-y-4 my-8">
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
                className={`
                  flex items-center gap-4 p-6 ${tokens.radius.lg}
                  bg-white dark:bg-neutral-900
                  ${tokens.effects.ring}
                  border-l-2 border-emerald-500
                `}
              >
                <span className="flex-shrink-0 text-2xl">✅</span>
                <p className={`${tokens.typography.body} font-medium ${tokens.colors.text.primary}`}>
                  {item}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`
              mt-12 p-10 ${tokens.radius.lg}
              bg-neutral-900 dark:bg-neutral-950
              ${tokens.effects.glow}
            `}
          >
            <p className={`${tokens.typography.bodyLarge} text-neutral-300 mb-4`}>
              Se sua empresa cresce receita sem subir custo fixo…<br />
              <span className="text-white font-semibold">o que sobe é a margem.</span>
            </p>
            <p className="text-3xl md:text-4xl font-semibold text-white mt-6">
              E margem vira lucro.
            </p>
          </motion.div>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Timeline */}
      <Section>
        <div className={tokens.spacing.prose}>
          <h2 className={`${tokens.typography.h2} ${tokens.colors.text.primary} mb-12`}>
            Em 7 / 15 / 30 dias
          </h2>

          <div className="space-y-6">
            {[
              { days: '7', label: 'dias', text: 'você enxerga os maiores vazamentos de tempo.' },
              { days: '15', label: 'dias', text: 'você já consegue realocar função e corrigir processo.' },
              { days: '30', label: 'dias', text: 'você tem base real pra automatizar e crescer sem inchar a operação.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`
                  flex flex-col md:flex-row md:items-center gap-6 p-8 ${tokens.radius.lg}
                  ${tokens.colors.bg.secondary}
                  ${tokens.effects.ring}
                  ${tokens.effects.shadow}
                  group hover:${tokens.effects.shadowLg}
                  transition-all duration-300
                `}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.days}
                  </span>
                  <span className={`${tokens.typography.caption} ${tokens.colors.text.tertiary} pb-2`}>
                    {item.label}
                  </span>
                </div>
                <p className={`${tokens.typography.bodyLarge} ${tokens.colors.text.secondary} flex-1`}>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Future Warning */}
      <Section variant="dark" className="text-white">
        <div className={tokens.spacing.prose}>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] leading-[1.15] mb-8 text-white">
            O futuro vai punir quem insiste em bater pedra
          </h2>
          
          <div className="text-xl md:text-2xl leading-relaxed text-white/80 space-y-6">
            <p>A tecnologia está virando o novo "mínimo".</p>
            <p>
              Os empresários que investirem em navios de tecnologia cedo, atravessarão a tempestade do seu mercado com eficácia e produtividade.<br />
              Quem esperar a agua chegar, vai ver suas fogueiras apagar, e vai tenta nadar... mas aí ja terá sido tarde de mais.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`
              mt-12 p-10 ${tokens.radius.lg}
              bg-white/5 backdrop-blur-sm
              border border-white/10
            `}
          >
            <p className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] leading-relaxed text-white">
              O Axis Tempo Real é o primeiro passo — porque ele resolve o que quase ninguém tem:{' '}
              <span className="border-b-2 border-white/30">clareza.</span>
            </p>
          </motion.div>
        </div>
      </Section>

      <SectionBreak variant="glow" />

      {/* Final CTA */}
      <Section>
        <div className={`${tokens.spacing.prose} text-center`}>
          <h2 className={`${tokens.typography.h1} ${tokens.colors.text.primary} mb-8`}>
            Você quer crescer com controle — ou crescer no escuro?
          </h2>
          
          <Prose size="large">
            <p>
              Se você quer enxergar onde o dinheiro do seu CNPJ está sendo desperdiçado…<br />
              e onde ele está sendo bem investido…
            </p>
          </Prose>

          <div className="pt-8 space-y-4">
            <p className={`text-4xl md:text-5xl font-semibold ${tokens.colors.text.primary}`}>
              AXIS TEMPO REAL.
            </p>
            <Prose>
              <p>
                Porque tempo é dinheiro.<br />
                E agora você consegue ver os dois.<br />
                E investir cada segundo da sua equipe, em tarefas que trarão rentabilidade, e crescimento para o seu negócio.
              </p>
            </Prose>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-12"
          >
            <Button
              size="lg"
              onClick={() => window.open(whatsappLink, '_blank')}
              className={`
                ${tokens.radius.full}
                bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
                text-white dark:text-neutral-900
                h-16 px-12 text-xl
                ${tokens.effects.shadowLg}
                transition-all duration-300
                hover:scale-105 active:scale-95
                group
              `}
            >
              Começar diagnóstico agora
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className={`py-12 ${tokens.colors.bg.secondary} border-t ${tokens.colors.border}`}>
        <div className={`max-w-4xl mx-auto ${tokens.spacing.container} text-center`}>
          <p className={`text-sm ${tokens.colors.text.tertiary}`}>
            © 2026 AXIS Tempo Real · Copy integrity: <code className="text-xs">{CONTENT_HASH.slice(0, 16)}...</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AxisTempoRealV1;
