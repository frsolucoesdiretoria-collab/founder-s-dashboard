"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const PremiumFinalCTA = () => {
    return (
        <section className="py-40 bg-transparent text-white text-center font-['Syne'] relative overflow-hidden">

            <div className="absolute inset-0 bg-noise opacity-[0.05]"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-6xl md:text-[10rem] font-black leading-[0.8] mb-12 tracking-tighter uppercase whitespace-pre-line">
                        A Decisão <br />
                        <span className="text-white/20">É Sua.</span>
                    </h2>

                    <p className="text-xl md:text-2xl font-['Inter'] text-white/60 max-w-2xl mx-auto mb-20 font-light leading-relaxed">
                        Você sabe que existe uma maneira superior de operar.
                        Voltar para a ineficiência agora é uma escolha consciente.
                    </p>

                    <div className="inline-block">
                        <a
                            href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black font-bold text-xl px-16 py-6 rounded-full transition-all hover:scale-105 flex items-center gap-4 uppercase tracking-[0.2em]"
                        >
                            Solicitar Acesso
                            <ArrowRight className="w-5 h-5 -rotate-45" />
                        </a>
                    </div>

                    <div className="mt-24 pt-8 border-t border-white/5 max-w-md mx-auto">
                        <p className="text-xs text-white/30 font-['Inter'] uppercase tracking-widest">
                            Limited Capacity // Q1 2026
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
