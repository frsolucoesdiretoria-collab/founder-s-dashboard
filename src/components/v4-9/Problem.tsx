"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Problem = () => {
    return (
        <section className="py-24 bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden aspect-square lg:aspect-video shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 5 }}
                                className="w-full h-full"
                            >
                                <img
                                    src="/images/v4-9/imagem-problema.png"
                                    alt="O custo dos cancelamentos"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                            {/* Subtle glass overlay on image edge */}
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                        </div>
                        {/* Background Glow */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-900/10 blur-[100px] rounded-full"></div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            O Custo Silencioso dos <br />
                            <span className="text-cyan-400">Horários Vagos</span>
                        </h2>
                        <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
                            <p>
                                Cada cadeira vazia representa um custo fixo que não se paga.
                                Faltas e cancelamentos de última hora são o principal ralo de faturamento
                                de uma clínica moderna.
                            </p>
                            <p className="border-l-4 border-cyan-400 pl-6 py-2 bg-cyan-400/5 rounded-r-lg">
                                A Axis foi criada para fechar esse ralo de uma vez por todas,
                                garantindo que sua estrutura esteja sempre gerando receita.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
