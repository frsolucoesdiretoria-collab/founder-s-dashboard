'use client'

import { motion } from 'framer-motion'

const logos = [
  { name: 'Empresa 1', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Empresa 2', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Empresa 3', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Empresa 4', gradient: 'from-orange-500 to-red-500' },
  { name: 'Empresa 5', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Empresa 6', gradient: 'from-yellow-500 to-orange-500' },
]

export default function LogoCloud() {
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












