"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden pt-32 bg-transparent font-['Syne']">

      {/* 3D Abstract Background Placeholder (CSS Geometric) */}
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[60vw] h-[60vw] opacity-10 pointer-events-none">
        <div className="w-full h-full border-[0.5px] border-white/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute inset-[10%] border-[0.5px] border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute inset-[20%] border-[0.5px] border-white/30 skew-x-12 animate-pulse"></div>
      </div>

      <div className="max-w-[1800px] mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">

        {/* Typography */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-white"></div>
            <span className="text-white text-xs uppercase tracking-[0.3em] font-['Inter']">System v5.2 Online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-[7rem] lg:text-[8rem] font-extrabold leading-[0.85] text-white tracking-[-0.04em] uppercase"
          >
            Você não <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Estudou</span> <br />
            15 Anos.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 text-lg md:text-2xl text-white/60 font-medium font-['Inter'] max-w-2xl leading-relaxed"
          >
            Para esperar na sala de consulta. <br />
            O <strong>Axis Protocol</strong> elimina o tempo ocioso da sua clínica com precisão cirúrgica. Sem ligações. Sem conversas. Apenas agenda cheia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex items-center gap-8"
          >
            <a
              href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 text-white text-xl font-bold uppercase tracking-widest hover:pl-2 transition-all"
            >
              Ativar Protocolo
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>
            </a>
          </motion.div>
        </div>

        {/* 3D Hero Asset (Simulated) */}
        <div className="lg:col-span-4 hidden lg:block relative h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full bg-gradient-to-tr from-white/5 to-transparent border border-white/10 backdrop-blur-sm relative"
          >
            <div className="absolute top-0 right-0 p-8 text-right">
              <p className="text-white/40 font-mono text-xs">RENDER_ID: AX_99</p>
              <p className="text-white text-4xl font-mono font-bold mt-2">10%</p>
              <p className="text-white/40 text-xs mt-1 uppercase">Revenue LOST</p>
            </div>
            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </motion.div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
      </motion.div>
    </section>
  );
}
