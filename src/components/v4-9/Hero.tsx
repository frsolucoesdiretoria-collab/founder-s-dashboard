"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Hero = () => {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                >
                    <source src="/images/v4-9/video-hero.mp4" type="video/mp4" />
                </video>
                {/* Dark Overlay with radial gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.4)_100%)]"></div>
            </div>

            {/* Content */}
            <div className="container relative z-10 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1]">
                        Transforme Cancelamentos em <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">Faturamento.</span>
                    </h1>
                    {/* Component Version: 4.9.2 */}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
                >
                    Nossa Inteligência Artificial preenche automaticamente seus horários vagos,
                    recuperando a receita que sua clínica perde todos os dias com o "no-show".
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    {/* Primary CTA */}
                    <button className="relative group overflow-hidden px-8 py-4 rounded-full font-bold transition-all duration-300 active:scale-95 w-full sm:w-auto">
                        <div className="absolute inset-0 bg-cyan-400 group-hover:bg-cyan-300 transition-colors"></div>
                        <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-40 group-hover:blur-xl transition-all"></div>
                        <span className="relative text-slate-950">
                            Ver Demonstração Rápida
                        </span>
                    </button>

                    {/* Secondary CTA */}
                    <button className="px-8 py-4 rounded-full font-bold border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 active:scale-95 w-full sm:w-auto">
                        Como Funciona?
                    </button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};
