'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Shield, TrendingUp, Code, BarChart3 } from 'lucide-react'

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

export default function Services() {
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











