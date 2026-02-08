"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const FinalCTA = () => {
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto backdrop-blur-md bg-white/[0.02] border border-white/5 p-12 md:p-20 rounded-[40px]"
                >
                    <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-8 leading-[1.2]">
                        Sua agenda pode ser <br />
                        <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">100% otimizada.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                        Junte-se às clínicas de elite que já utilizam a Axis para faturar mais e oferecer uma experiência superior aos seus pacientes.
                    </p>

                    <button className="relative group overflow-hidden px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                        <div className="absolute inset-0 bg-cyan-400 group-hover:bg-cyan-300 transition-colors"></div>
                        <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <span className="relative text-slate-950">
                            Quero a Axis na Minha Clínica
                        </span>
                    </button>

                    <p className="mt-8 text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">
                        Sem compromisso • Demonstração Grátis
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
