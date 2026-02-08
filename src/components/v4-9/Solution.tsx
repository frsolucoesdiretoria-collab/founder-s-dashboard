"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Solution = () => {
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-900/10 blur-[120px] rounded-full translate-x-1/2"></div>

            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        De "Horário Perdido" para <br />
                        <span className="text-cyan-400">"Oportunidade Preenchida"</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Quando um paciente cancela, nosso sistema não apenas notifica: ele age.
                        Em segundos, a IA identifica o paciente ideal na fila de espera.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative max-w-5xl mx-auto group"
                >
                    {/* Main Image with Glow */}
                    <div className="relative rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_100px_rgba(34,211,238,0.25)] transition-shadow duration-700">
                        <img
                            src="/images/v4-9/imagem-solucao.png"
                            alt="Inteligência Artificial em ação"
                            className="w-full h-auto object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-700"
                        />

                        {/* Glassmorphism tag overlay */}
                        <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-12 md:bottom-12 md:w-80 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Sistema Ativo</span>
                            </div>
                            <p className="text-white text-sm font-medium leading-relaxed">
                                Nossa IA oferece o horário em segundos, transformando um prejuízo iminente em um atendimento realizado.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
