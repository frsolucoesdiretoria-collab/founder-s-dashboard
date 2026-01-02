'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Menu, X, Brain, Zap, Shield, TrendingUp, Code, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { AppLayout } from '@/components/AppLayout'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              TechArm
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#servicos" className="text-gray-300 hover:text-white transition-colors">
              Serviços
            </a>
            <a href="#solucoes" className="text-gray-300 hover:text-white transition-colors">
              Soluções
            </a>
            <a href="#contato" className="text-gray-300 hover:text-white transition-colors">
              Contato
            </a>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20">
              Agendar diagnóstico
            </button>
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
            <a href="#servicos" className="block text-gray-300 hover:text-white transition-colors">
              Serviços
            </a>
            <a href="#solucoes" className="block text-gray-300 hover:text-white transition-colors">
              Soluções
            </a>
            <a href="#contato" className="block text-gray-300 hover:text-white transition-colors">
              Contato
            </a>
            <button className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-medium transition-all">
              Agendar diagnóstico
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            O braço de tecnologia
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            para empresários
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Empresas que crescem com inteligência artificial crescem de forma exponencial.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2">
            Agendar diagnóstico
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 border border-gray-700 hover:border-gray-600 rounded-lg font-semibold text-lg text-gray-300 hover:text-white transition-all">
            Ver soluções
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}

function LogoCloud() {
  const logos = [
    { name: 'Empresa 1', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Empresa 2', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Empresa 3', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Empresa 4', gradient: 'from-orange-500 to-red-500' },
    { name: 'Empresa 5', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Empresa 6', gradient: 'from-yellow-500 to-orange-500' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-500 text-sm uppercase tracking-wider mb-12"
        >
          Empresas que confiam em nós
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center"
            >
              <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${logo.gradient} opacity-20 hover:opacity-30 transition-opacity flex items-center justify-center`}>
                <span className="text-white/50 text-xs font-medium">{logo.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services() {
  const services = [
    {
      icon: Brain,
      title: 'Inteligência Artificial',
      description: 'Soluções de IA customizadas para automatizar processos e tomar decisões mais inteligentes.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Automação',
      description: 'Automatize tarefas repetitivas e libere sua equipe para focar no que realmente importa.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Proteção de dados e sistemas com as melhores práticas de segurança da informação.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Análise de Dados',
      description: 'Transforme dados em insights acionáveis para impulsionar o crescimento do seu negócio.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Code,
      title: 'Desenvolvimento',
      description: 'Sistemas e aplicações desenvolvidos com as tecnologias mais modernas do mercado.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: BarChart3,
      title: 'KPIs e Métricas',
      description: 'Dashboard completo para monitorar o desempenho e tomar decisões baseadas em dados.',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <section id="servicos" className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Soluções que
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              transformam negócios
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tecnologia de ponta para empresários que querem crescer de forma exponencial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} p-3 mb-6 flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity -z-10`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section id="contato" className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 p-12 sm:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Pronto para crescer
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                exponencialmente?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Agende um diagnóstico gratuito e descubra como a inteligência artificial pode transformar seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2">
                Agendar diagnóstico
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold text-lg text-gray-300 hover:text-white transition-all">
                Ver soluções
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}

export default function Apresentacao02Page() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white -m-4 md:-m-6" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.1) 0px, transparent 50%)
        `,
        backgroundAttachment: 'fixed'
      }}>
        <Navbar />
        <Hero />
        <LogoCloud />
        <Services />
        <CTA />
      </div>
    </AppLayout>
  )
}





