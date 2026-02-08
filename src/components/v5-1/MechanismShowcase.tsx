"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radar, Target, Send, Zap } from "lucide-react";

export const MechanismShowcase = () => {
    return (
        <div className="w-full max-w-6xl mx-auto py-20 px-4">
            <div className="grid md:grid-cols-3 gap-8 items-center h-full">

                {/* Step 1: Radar */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative group"
                >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#01080A]/50 backdrop-blur-md relative flex flex-col items-center justify-center group-hover:border-[#6B9594]/50 transition-colors duration-500">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(107,149,148,0.05)_100%)]"></div>
                        {/* HUD Circle */}
                        <div className="relative w-32 h-32 rounded-full border border-[#6B9594]/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <div className="absolute top-0 w-1 h-3 bg-[#6B9594]/50"></div>
                            <div className="absolute bottom-0 w-1 h-3 bg-[#6B9594]/50"></div>
                            <div className="absolute left-0 w-3 h-1 bg-[#6B9594]/50"></div>
                            <div className="absolute right-0 w-3 h-1 bg-[#6B9594]/50"></div>
                        </div>
                        <Radar className="w-12 h-12 text-[#6B9594] absolute drop-shadow-[0_0_10px_rgba(107,149,148,0.8)]" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#01080A] to-transparent">
                            <h3 className="text-[#6B9594] font-sans font-bold text-xl mb-2">1. O Radar</h3>
                            <p className="text-[#BCCFCC] text-sm leading-snug">Ele escaneia sua base de 5.000+ pacientes inativos em milissegundos.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Step 2: Target */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "backOut" }}
                    className="relative group md:-mt-12"
                >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#6B9594]/30 bg-[#01080A]/80 backdrop-blur-xl relative flex flex-col items-center justify-center shadow-[0_0_30px_rgba(107,149,148,0.1)]">
                        {/* Target HUD */}
                        <div className="relative w-40 h-40 border-2 border-[#6B9594]/20 rounded-full flex items-center justify-center">
                            <div className="absolute w-[80%] h-[80%] border border-[#6B9594]/40 rounded-full"></div>
                            <div className="absolute w-[120%] h-[1px] bg-[#6B9594]/20"></div>
                            <div className="absolute h-[120%] w-[1px] bg-[#6B9594]/20"></div>
                            <Target className="w-16 h-16 text-[#6B9594] drop-shadow-[0_0_15px_rgba(107,149,148,1)] relative z-10" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#01080A] to-transparent">
                            <h3 className="text-[#6B9594] font-sans font-bold text-xl mb-2">2. O Alvo</h3>
                            <p className="text-[#BCCFCC] text-sm leading-snug">Identifica probabilidade de aceite (histórico, ticket e comportamento).</p>
                        </div>
                    </div>
                </motion.div>

                {/* Step 3: The Shot */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="relative group"
                >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#01080A]/50 backdrop-blur-md relative flex flex-col items-center justify-center group-hover:border-[#6B9594]/50 transition-colors duration-500">
                        {/* Notification Graphic */}
                        <div className="flex gap-2 items-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#6B9594]/10 flex items-center justify-center border border-[#6B9594]/30">
                                <Send className="w-6 h-6 text-[#6B9594]" />
                            </div>
                            <div className="h-0.5 w-16 bg-gradient-to-r from-[#6B9594]/50 to-transparent"></div>
                            <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#01080A] to-transparent">
                            <h3 className="text-[#6B9594] font-sans font-bold text-xl mb-2">3. O Disparo</h3>
                            <p className="text-[#BCCFCC] text-sm leading-snug">Oferta irresistível e personalizada. Vaga preenchida instantaneamente.</p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};
