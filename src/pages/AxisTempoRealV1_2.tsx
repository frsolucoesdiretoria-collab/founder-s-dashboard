// AXIS TEMPO REAL V1.2 — Premium Apple/Linear/Stripe-like Design
// Copy locked: Renders content/axis-tempo-real.v1.md faithfully

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Lock } from 'lucide-react';
import { LeadGateModal } from '@/components/LeadGateModal';
import { Navigation } from '@/components/axis/Navigation';
import { Section, SectionBreak } from '@/components/axis/Section';
import {
  Prose,
  Heading,
  Paragraph,
  List,
  ListItem,
  Blockquote,
  CheckItem
} from '@/components/axis/Prose';
import { PremiumBackground } from '@/components/axis/PremiumBackground';

// Content hash validation
const CONTENT_HASH = '574445c2f77206db228ba9df4cd9d92c2a078fa539b9ffa55c790f1262cde971';

const AxisTempoRealV1_2: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleCTAClick = () => {
    setShowModal(true);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    window.open("https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Axis%20Tempo%20Real", '_blank');
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Subtle parallax for hero (respects prefers-reduced-motion)
  const heroY = useTransform(
    smoothProgress,
    [0, 0.3],
    prefersReducedMotion ? [0, 0] : [0, -30]
  );

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden">
      {/* Background */}
      {!prefersReducedMotion && <PremiumBackground />}

      {/* Progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-slate-900 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />

      {/* Navigation */}
      <Navigation onCTAClick={handleCTAClick} />

      {/* Hero Section */}
      <motion.div style={{ y: heroY }}>
        <Section size="xl" maxWidth="xl" animate={!prefersReducedMotion}>
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200/50"
            >
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700 tracking-wide uppercase">
                AXIS TEMPO REAL
              </span>
            </motion.div>

            {/* Main headline — COPY LOCKED */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-medium text-slate-900 tracking-tight leading-[1.05] max-w-5xl mx-auto"
            >
              Pare de pagar salário para "fazer fogo com pedra".
            </motion.h1>

            {/* Subheadline — COPY LOCKED */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl lg:text-3xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto tracking-tight"
            >
              Descubra onde sua equipe cria lucro — e onde o dinheiro da folha está virando desperdício.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6"
            >
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="h-14 px-10 text-lg bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Quero enxergar meu desperdício
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </Section>
      </motion.div>

      {/* Content Sections — Rendering markdown content */}
      <Section size="lg" maxWidth="lg">
        <Prose>
          <Paragraph>
            Você conhece essa história, mesmo que nunca tenha contado assim:
          </Paragraph>

          <Paragraph>
            Todo mês você paga salários.<br />
            Todo mês você paga encargos.<br />
            Todo mês você paga o custo de manter um time inteiro vivo — com tudo o que isso envolve.
          </Paragraph>

          <Paragraph>
            E todo mês você toma decisões importantes com base em:
          </Paragraph>

          <List>
            <ListItem>feeling</ListItem>
            <ListItem>conversas soltas</ListItem>
            <ListItem>"acho que é isso"</ListItem>
            <ListItem>percepção de urgência</ListItem>
            <ListItem>e aquele incêndio da semana</ListItem>
          </List>

          <Paragraph>O nome disso é comum no Brasil.</Paragraph>

          <Paragraph className="text-2xl md:text-3xl text-slate-900 font-medium">
            O nome disso é <strong>gestão no escuro</strong>.
          </Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>
            Quando a gente olha pro passado, parece óbvio.
          </Heading>

          <Paragraph>Um neandertal faz fogo com pedra.</Paragraph>

          <Paragraph>
            Demora. Dá trabalho. Consome energia.<br />
            E no fim… ele consegue calor.
          </Paragraph>

          <Paragraph>
            Hoje, isso parece absurdo — porque a tecnologia transformou o "fogo" em um botão.
          </Paragraph>

          <Paragraph>Agora o ponto:</Paragraph>

          <Blockquote>
            Dentro do seu CNPJ existe uma lista inteira de atividades que ainda são "fogo com pedra".<br />
            Só que você está pagando por isso todo mês.
          </Blockquote>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>
            O que é "fogo com pedra" dentro de uma empresa?
          </Heading>

          <Paragraph>
            É qualquer tarefa em que um humano está gastando horas para fazer o que tecnologia faria em segundos:
          </Paragraph>

          <List>
            <ListItem>lançamentos manuais</ListItem>
            <ListItem>conciliações repetitivas</ListItem>
            <ListItem>copiar dados entre sistemas</ListItem>
            <ListItem>"preencher status" para provar trabalho</ListItem>
            <ListItem>relatórios de prestação de contas que ninguém lê</ListItem>
            <ListItem>retrabalho por falha de processo</ListItem>
            <ListItem>tarefas que existem só porque "o fluxo sempre foi assim"</ListItem>
          </List>

          <Paragraph>O custo disso não é só tempo.</Paragraph>

          <Paragraph>
            O custo disso é:<br />
            <strong>folha + encargos + imposto + oportunidade perdida + crescimento travado.</strong>
          </Paragraph>

          <Paragraph>E aqui vem a pergunta perigosa:</Paragraph>

          <Blockquote>
            <strong>Quantas horas por mês você está pagando para a sua equipe "bater pedra"?</strong>
          </Blockquote>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>
            Se você tivesse clareza, você faria escolhas diferentes.
          </Heading>

          <Paragraph>
            Porque o caminho para aumentar lucro líquido é simples (e cruelmente ignorado):
          </Paragraph>

          <div className="space-y-4 my-12">
            <Heading level={3}>1) Reduzir desperdício invisível</Heading>
            <Heading level={3}>2) Automatizar o que é repetitivo</Heading>
            <Heading level={3}>3) Realocar pessoas para atividades de potência</Heading>
            <Heading level={3}>4) Crescer receita sem subir custo fixo</Heading>
          </div>

          <Paragraph>
            O problema é que quase ninguém faz isso bem…<br />
            porque quase ninguém mede.
          </Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg" variant="gradient">
        <Prose>
          <Heading level={2}>
            Axis Tempo Real — o Raio-X do dinheiro disfarçado de tempo
          </Heading>

          <Paragraph>
            O Axis Tempo Real é um sistema de diagnóstico contínuo:
          </Paragraph>

          <Paragraph>
            Ele revela onde cada hora paga do seu time está sendo investida…<br />
            e onde está sendo desperdiçada.
          </Paragraph>

          <Paragraph>
            Sem transformar seu time em robô.<br />
            Sem microgerenciamento.<br />
            Sem cultura tóxica.
          </Paragraph>

          <Paragraph>O objetivo é um só:</Paragraph>

          <Blockquote>
            <strong>tirar pessoas da macaquice e colocar pessoas no lugar de potência.</strong>
          </Blockquote>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>
            Como funciona (WhatsApp + áudio + IA)
          </Heading>

          <Paragraph>
            Ao longo do dia, o colaborador recebe mensagens curtas no WhatsApp.<br />
            Ele responde com um áudio rápido dizendo o que fez naquela última hora.
          </Paragraph>

          <Paragraph>A IA transcreve, organiza e registra.</Paragraph>

          <Paragraph>Em poucos dias, você enxerga padrões.</Paragraph>

          <Paragraph>Em 30 dias, você enxerga a verdade.</Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>
            O que você recebe (o que muda no caixa)
          </Heading>

          <Paragraph>Você recebe um relatório claro com:</Paragraph>

          <List>
            <ListItem><strong>Distribuição real das horas</strong> (o que consome o time)</ListItem>
            <ListItem><strong>Top 10 atividades que mais drenam tempo</strong></ListItem>
            <ListItem><strong>O que automatizar primeiro</strong> (maior ROI)</ListItem>
            <ListItem><strong>O que realocar</strong> (onde tem potência)</ListItem>
            <ListItem><strong>Onde você está pagando caro para continuar lento</strong></ListItem>
          </List>

          <Paragraph className="mt-12">
            E isso impacta lucro líquido de três formas:
          </Paragraph>

          <div className="space-y-4 my-8">
            <CheckItem>(1) Você corta desperdício sem demitir</CheckItem>
            <CheckItem>(2) Você aumenta capacidade produtiva sem contratar</CheckItem>
            <CheckItem>(3) Você libera tempo para receita: vendas, atendimento, retenção, qualidade</CheckItem>
          </div>

          <Paragraph>
            Se sua empresa cresce receita sem subir custo fixo…<br />
            o que sobe é a margem.
          </Paragraph>

          <Paragraph className="text-2xl md:text-3xl text-slate-900 font-medium">
            E margem vira lucro.
          </Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg">
        <Prose>
          <Heading level={2}>Em 7 / 15 / 30 dias</Heading>

          <Paragraph>
            <strong>7 dias:</strong> você enxerga os maiores vazamentos de tempo.<br />
            <strong>15 dias:</strong> você já consegue realocar função e corrigir processo.<br />
            <strong>30 dias:</strong> você tem base real pra automatizar e crescer sem inchar a operação.
          </Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      <Section size="lg" maxWidth="lg" variant="dark">
        <Prose className="prose-invert prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
          <Heading level={2} className="text-white">
            O futuro vai punir quem insiste em bater pedra
          </Heading>

          <Paragraph>A tecnologia está virando o novo "mínimo".</Paragraph>

          <Paragraph>
            Os empresários que investirem em navios de tecnologia cedo, atravessarão a tempestade do seu mercado com eficácia e produtividade.<br />
            Quem esperar a agua chegar, vai ver suas fogueiras apagar, e vai tenta nadar... mas aí ja terá sido tarde de mais.
          </Paragraph>

          <Paragraph className="text-white">
            O Axis Tempo Real é o primeiro passo — porque ele resolve o que quase ninguém tem: <strong>clareza.</strong>
          </Paragraph>
        </Prose>
      </Section>

      <SectionBreak />

      {/* Final CTA */}
      <Section size="xl" maxWidth="lg">
        <div className="text-center space-y-8">
          <Prose>
            <Heading level={2}>
              Você quer crescer com controle — ou crescer no escuro?
            </Heading>

            <Paragraph>
              Se você quer enxergar onde o dinheiro do seu CNPJ está sendo desperdiçado…<br />
              e onde ele está sendo bem investido…
            </Paragraph>

            <div className="space-y-4 my-12">
              <Paragraph className="text-3xl md:text-4xl text-slate-900 font-medium">
                <strong>Axis Tempo Real.</strong>
              </Paragraph>
              <Paragraph>
                Porque tempo é dinheiro.<br />
                E agora você consegue ver os dois.<br />
                E investir cada segundo da sua equipe, em tarefas que trarão rentabilidade, e crescimento para o seu negócio.
              </Paragraph>
            </div>
          </Prose>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="h-16 px-12 text-xl bg-slate-900 hover:bg-slate-800 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              Começar diagnóstico agora
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-200/50 bg-slate-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2026 AXIS Tempo Real · Copy integrity: {CONTENT_HASH.slice(0, 16)}...
          </p>
        </div>
      </footer>

      <LeadGateModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleUnlock}
        lostValue={0}
      />
    </div>
  );
};

export default AxisTempoRealV1_2;
