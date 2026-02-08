'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
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






















