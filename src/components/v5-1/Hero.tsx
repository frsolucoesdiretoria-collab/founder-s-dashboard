"use client";

import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Activity } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">

      {/* Decorative Assets: Sparklines & Cards */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute left-10 top-1/3 hidden lg:block"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <CreditCard className="w-8 h-8 text-[#6B9594] mb-2" />
          <div className="h-1 w-12 bg-[#6B9594]/30 rounded-full mb-1"></div>
          <div className="h-1 w-8 bg-[#6B9594]/10 rounded-full"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute right-10 bottom-1/3 hidden lg:block"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
          <Activity className="w-8 h-8 text-[#6B9594] mb-2" />
          <div className="flex gap-1 items-end h-8">
            <div className="w-1 h-3 bg-[#6B9594]/50"></div>
            <div className="w-1 h-5 bg-[#6B9594]"></div>
            <div className="w-1 h-2 bg-[#6B9594]/30"></div>
            <div className="w-1 h-6 bg-[#6B9594]"></div>
          </div>
          <div className="text-[10px] text-[#BCCFCC] mt-2 font-mono">REVENUE</div>
        </div>
      </motion.div>


      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-sans font-extrabold mb-8 leading-tight text-white drop-shadow-2xl tracking-tight"
        >
          <span className="block mb-2">VOCÊ NÃO ESTUDOU 15 ANOS PARA FICAR ESPERANDO NA SALA DE CONSULTA.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-[#BCCFCC] mb-8 max-w-5xl mx-auto leading-relaxed font-sans"
        >
          O <strong>Axis Protocol</strong> detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 justify-center text-sm text-[#BCCFCC]/80 mb-12"
        >
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#6B9594] rounded-full"></div>Sua agenda, blindada contra imprevistos.</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#6B9594] rounded-full"></div>Faturamento preservado minuto a minuto.</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#6B9594] rounded-full"></div>Otimização silenciosa, impacto imediato.</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-10 py-5 bg-[#6B9594] hover:bg-[#5a807f] text-[#01080A] font-extrabold text-xl rounded-[10px] transition-all shadow-[0_0_30px_rgba(107,149,148,0.3)] flex items-center gap-3 uppercase tracking-wider relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
            Ativar Protocolo
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
