'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { AppLayout } from '@/components/AppLayout'

type Accent = {
  from: string
  to: string
  glowA: string
  glowB: string
}

type SectionContent = {
  title: string
  description?: string
  items?: string[]
}

export type ApresentacaoContent = {
  slug: string
  hero: {
    titleLine1: string
    titleLine2: string
    subtitle: string
  }
  urgency: SectionContent
  whyNow: SectionContent
  howOperate: SectionContent
  firstWeek: SectionContent
  techGrowth: SectionContent
  techEfficiency: SectionContent
  differential: SectionContent
  proof: SectionContent
  ctaFinal: {
    title: string
    description: string
  }
  accent: Accent
}

const CTA_TEXT = 'Agendar conversa de proposta'

function Navbar({ accent }: { accent: Accent }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const ctaButton = (
    <button
      className={`px-6 py-2 bg-gradient-to-r ${accent.from} ${accent.to} rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 hover:opacity-90`}
    >
      {CTA_TEXT}
    </button>
  )

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
              AXIS
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#como-operamos" className="text-gray-300 hover:text-white transition-colors">
              Como operamos
            </a>
            <a href="#tecnologia" className="text-gray-300 hover:text-white transition-colors">
              Tecnologia
            </a>
            <a href="#prova" className="text-gray-300 hover:text-white transition-colors">
              Prova
            </a>
            {ctaButton}
          </div>

          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-white/5"
          >
            <a href="#como-operamos" className="block text-gray-300 hover:text-white transition-colors">
              Como operamos
            </a>
            <a href="#tecnologia" className="block text-gray-300 hover:text-white transition-colors">
              Tecnologia
            </a>
            <a href="#prova" className="block text-gray-300 hover:text-white transition-colors">
              Prova
            </a>
            <button
              className={`w-full px-6 py-2 bg-gradient-to-r ${accent.from} ${accent.to} rounded-lg font-medium transition-all hover:opacity-90`}
            >
              {CTA_TEXT}
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

function SectionCard({ title, description, items, id }: SectionContent & { id?: string }) {
  return (
    <section id={id} className="py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h2>
          {description && <p className="text-lg text-gray-300 leading-relaxed">{description}</p>}
        </div>
        {items && (
          <div className="grid gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-200 leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Hero({ content, accent }: { content: ApresentacaoContent; accent: Accent }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {content.hero.titleLine1}
          </span>
          <br />
          <span className={`bg-gradient-to-r ${accent.from} ${accent.to} bg-clip-text text-transparent`}>
            {content.hero.titleLine2}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          {content.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center"
        >
          <button
            className={`group px-8 py-4 bg-gradient-to-r ${accent.from} ${accent.to} rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2 hover:opacity-90`}
          >
            {CTA_TEXT}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute inset-0 -z-10 overflow-hidden"
        >
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${accent.glowA} rounded-full blur-3xl`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${accent.glowB} rounded-full blur-3xl`} />
        </motion.div>
      </div>
    </section>
  )
}

function CTAFinal({ accent, ctaFinal }: { accent: Accent; ctaFinal: ApresentacaoContent['ctaFinal'] }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div
          className={`relative rounded-3xl bg-gradient-to-br ${accent.from} ${accent.to} /20 border border-purple-500/30 p-10 sm:p-14 text-center overflow-hidden`}
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(91,33,182,0.1))' }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              {ctaFinal.title}
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              {ctaFinal.description}
            </p>
            <div className="flex items-center justify-center">
              <button
                className={`group px-8 py-4 bg-gradient-to-r ${accent.from} ${accent.to} rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2 hover:opacity-90`}
              >
                {CTA_TEXT}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  )
}

export function ApresentacaoBase({ content }: { content: ApresentacaoContent }) {
  const { accent } = content

  return (
    <AppLayout>
      <div
        className="min-h-screen bg-[#0a0a0a] text-white -m-4 md:-m-6"
        style={{
          backgroundImage: `
          radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.08) 0px, transparent 50%)
        `,
          backgroundAttachment: 'fixed',
        }}
      >
        <Navbar accent={accent} />
        <Hero content={content} accent={accent} />
        <SectionCard
          title={content.urgency.title}
          description={content.urgency.description}
          items={content.urgency.items}
        />
        <SectionCard title={content.whyNow.title} items={content.whyNow.items} />
        <SectionCard id="como-operamos" title={content.howOperate.title} items={content.howOperate.items} />
        <SectionCard title={content.firstWeek.title} items={content.firstWeek.items} />
        <section id="tecnologia" className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid gap-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {content.techGrowth.title}
              </h2>
              {content.techGrowth.description && (
                <p className="text-gray-300 mb-4 leading-relaxed">{content.techGrowth.description}</p>
              )}
              <div className="grid gap-3">
                {content.techGrowth.items?.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-200 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {content.techEfficiency.title}
              </h2>
              {content.techEfficiency.description && (
                <p className="text-gray-300 mb-4 leading-relaxed">{content.techEfficiency.description}</p>
              )}
              <div className="grid gap-3">
                {content.techEfficiency.items?.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-200 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <SectionCard
          title={content.differential.title}
          description={content.differential.description}
          items={content.differential.items}
        />
        <SectionCard id="prova" title={content.proof.title} items={content.proof.items} />
        <CTAFinal accent={accent} ctaFinal={content.ctaFinal} />
      </div>
    </AppLayout>
  )
}

